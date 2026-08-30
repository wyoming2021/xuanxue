import { NextRequest, NextResponse } from 'next/server';

import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { getOrCreateDevUser } from '@/lib/dev-user-store';
import { verifyOtp } from '@/lib/otp-store';
import { supabaseAdmin } from '@/lib/supabase-admin';

const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

export async function POST(req: NextRequest) {
  try {
    const { email, code, deviceId } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: '请输入邮箱和验证码' }, { status: 400 });
    }

    // Verify OTP
    if (isRealSupabase) {
      const { data: otpRecord } = await supabaseAdmin
        .from('otp_codes')
        .select('id')
        .eq('email', email)
        .eq('code', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!otpRecord) {
        return NextResponse.json({ success: false, error: '验证码无效或已过期' }, { status: 400 });
      }

      await supabaseAdmin.from('otp_codes').update({ used: true }).eq('id', otpRecord.id);
    } else {
      const result = verifyOtp(email, code);
      if (!result.valid) {
        return NextResponse.json(
          { success: false, error: result.expired ? '验证码已过期' : '验证码无效' },
          { status: 400 },
        );
      }
    }

    // Find or create user
    let userId: string;
    if (isRealSupabase) {
      let { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (!user) {
        const { data: newUser } = await supabaseAdmin
          .from('users')
          .insert({ email })
          .select('id')
          .single();
        user = newUser;
      }

      if (!user) {
        return NextResponse.json({ success: false, error: '用户创建失败' }, { status: 500 });
      }
      userId = user.id;

      // Merge device data if applicable
      if (deviceId) {
        const { data: deviceUser } = await supabaseAdmin
          .from('users')
          .select('id, vip_expire_time')
          .eq('device_id', deviceId)
          .neq('id', userId)
          .single();

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

            await supabaseAdmin
              .from('users')
              .update({ vip_expire_time: mergedTime.toISOString() })
              .eq('id', userId);
          }

          await supabaseAdmin
            .from('orders')
            .update({ user_id: userId })
            .eq('user_id', deviceUser.id);

          for (const table of ['bazi_records', 'tarot_records', 'daily_fortunes']) {
            await supabaseAdmin
              .from(table)
              .update({ user_id: userId })
              .eq('user_id', deviceUser.id);
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
