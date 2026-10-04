import crypto from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { sendOtpEmail } from '@/lib/email';
import { getClientIp, hasRealSupabase } from '@/lib/env';
import { saveOtp, isRateLimited } from '@/lib/otp-store';
import { hitRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase-admin';

/** 生成 6 位数字 OTP。P2-5/P1-3：用 crypto.randomInt，不要用 Math.random */
function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

// 邮箱维度冷却：60 秒内不得重发
const EMAIL_COOLDOWN_MS = 60 * 1000;
// IP 维度限流：每个 IP 每小时最多 10 封，防邮件轰炸
const IP_LIMIT = 10;
const IP_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: '请输入邮箱地址' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: '邮箱格式不正确' }, { status: 400 });
    }

    // IP 维度限流（P1-3）
    const ip = getClientIp(req);
    if (hitRateLimit(`otp-send:ip:${ip}`, IP_LIMIT, IP_WINDOW_MS)) {
      return NextResponse.json(
        { success: false, error: '请求过于频繁，请稍后再试' },
        { status: 429 },
      );
    }

    const useDb = hasRealSupabase();

    // 邮箱维度冷却
    if (useDb && supabaseAdmin) {
      const { data: recentOtp } = await supabaseAdmin
        .from('otp_codes')
        .select('id')
        .eq('email', email)
        .eq('used', false)
        .gt('created_at', new Date(Date.now() - EMAIL_COOLDOWN_MS).toISOString())
        .limit(1)
        .maybeSingle();

      if (recentOtp) {
        return NextResponse.json(
          { success: false, error: '验证码已发送，请稍后再试' },
          { status: 429 },
        );
      }
    } else if (isRateLimited(email)) {
      return NextResponse.json(
        { success: false, error: '验证码已发送，请稍后再试' },
        { status: 429 },
      );
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 保存验证码
    if (useDb && supabaseAdmin) {
      const { error: insertError } = await supabaseAdmin.from('otp_codes').insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
      });
      if (insertError) {
        console.error('[send-otp] 验证码写入数据库失败:', insertError);
        return NextResponse.json(
          { success: false, error: '验证码发送失败，请稍后重试' },
          { status: 500 },
        );
      }
    } else {
      saveOtp(email, code, expiresAt);
      console.log(`[DEV] OTP for ${email}: ${code}`);
    }

    const result = await sendOtpEmail(email, code);

    if (!result.success) {
      console.error('[send-otp] 邮件发送失败:', result.error);
      return NextResponse.json(
        { success: false, error: '验证码发送失败，请稍后重试' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: '验证码已发送' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
