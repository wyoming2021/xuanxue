import { NextRequest, NextResponse } from 'next/server';

import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { getOrCreateDevUser } from '@/lib/dev-user-store';
import { hasRealSupabase } from '@/lib/env';
import { verifyOtp } from '@/lib/otp-store';
import { clearFailures, isLocked, recordFailure } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase-admin';

// 每个邮箱连续失败 5 次后锁定 15 分钟（P1-3）
const MAX_VERIFY_FAILURES = 5;
const VERIFY_LOCK_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { email, code, deviceId } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: '请输入邮箱和验证码' }, { status: 400 });
    }

    // 失败锁定检查
    const lock = isLocked(`verify:${email}`);
    if (lock.locked) {
      return NextResponse.json(
        {
          success: false,
          error: `尝试次数过多，已锁定。请约 ${Math.ceil(lock.retryInSeconds / 60)} 分钟后再试`,
        },
        { status: 429 },
      );
    }

    const useDb = hasRealSupabase();
    let otpValid = false;

    if (useDb && supabaseAdmin) {
      const { data: otpRecord } = await supabaseAdmin
        .from('otp_codes')
        .select('id, expires_at')
        .eq('email', email)
        .eq('code', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!otpRecord) {
        const failed = recordFailure(`verify:${email}`, MAX_VERIFY_FAILURES, VERIFY_LOCK_MS);
        const remainingMsg = failed ? '，已达上限将临时锁定' : '';
        return NextResponse.json(
          { success: false, error: `验证码无效或已过期${remainingMsg}` },
          { status: 400 },
        );
      }

      const { error: markUsedError } = await supabaseAdmin
        .from('otp_codes')
        .update({ used: true })
        .eq('id', otpRecord.id);
      if (markUsedError) {
        console.error('[verify-otp] 标记验证码已使用失败:', markUsedError);
        return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
      }
      otpValid = true;
    } else {
      const result = verifyOtp(email, code);
      if (!result.valid) {
        const failed = recordFailure(`verify:${email}`, MAX_VERIFY_FAILURES, VERIFY_LOCK_MS);
        const expiredMsg = result.expired ? '验证码已过期' : '验证码无效';
        const remainingMsg = failed ? '，已达上限将临时锁定' : '';
        return NextResponse.json(
          { success: false, error: `${expiredMsg}${remainingMsg}` },
          { status: 400 },
        );
      }
      otpValid = true;
    }

    if (otpValid) {
      clearFailures(`verify:${email}`);
    }

    // Find or create user
    let userId: string;
    if (useDb && supabaseAdmin) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      let finalUser = user;
      if (!finalUser) {
        const { data: newUser, error: createUserError } = await supabaseAdmin
          .from('users')
          .insert({ email })
          .select('id')
          .single();
        if (createUserError || !newUser) {
          console.error('[verify-otp] 创建用户失败:', createUserError);
          return NextResponse.json({ success: false, error: '用户创建失败' }, { status: 500 });
        }
        finalUser = newUser;
      }

      userId = finalUser.id;

      // Merge device data if applicable
      if (deviceId) {
        const { data: deviceUser } = await supabaseAdmin
          .from('users')
          .select('id, vip_expire_time')
          .eq('device_id', deviceId)
          .neq('id', userId)
          .maybeSingle();

        if (deviceUser) {
          if (deviceUser.vip_expire_time) {
            const { data: currentUser } = await supabaseAdmin
              .from('users')
              .select('vip_expire_time')
              .eq('id', userId)
              .single();

            const mergedTime =
              currentUser?.vip_expire_time && new Date(currentUser.vip_expire_time) > new Date()
                ? new Date(currentUser.vip_expire_time)
                : new Date(deviceUser.vip_expire_time);

            const { error: mergeVipError } = await supabaseAdmin
              .from('users')
              .update({ vip_expire_time: mergedTime.toISOString() })
              .eq('id', userId);
            if (mergeVipError) {
              console.error('[verify-otp] 合并会员时间失败:', mergeVipError);
            }
          }

          // 迁移订单与记录归属
          const { error: ordersError } = await supabaseAdmin
            .from('orders')
            .update({ user_id: userId })
            .eq('user_id', deviceUser.id);
          if (ordersError) console.error('[verify-otp] 迁移订单归属失败:', ordersError);

          for (const table of ['bazi_records', 'tarot_records', 'daily_fortunes']) {
            const { error: tableError } = await supabaseAdmin
              .from(table)
              .update({ user_id: userId })
              .eq('user_id', deviceUser.id);
            if (tableError) {
              console.error(`[verify-otp] 迁移 ${table} 归属失败:`, tableError);
            }
          }

          // 清空旧设备绑定（P3-7：防止同一 device_id 重复触发合并）
          const { error: clearDeviceError } = await supabaseAdmin
            .from('users')
            .update({ device_id: null })
            .eq('id', deviceUser.id);
          if (clearDeviceError) {
            console.error('[verify-otp] 清空旧设备绑定失败:', clearDeviceError);
          }
        }
      }
    } else {
      // Dev mode: use dev user store for persistent user identity
      const devUser = getOrCreateDevUser(email);
      userId = devUser.id;
    }

    // Create session
    const token = await createSessionToken({ userId, email });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: { userId, email },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
