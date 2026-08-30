import { NextRequest, NextResponse } from 'next/server';

import { sendOtpEmail } from '@/lib/email';
import { saveOtp, isRateLimited } from '@/lib/otp-store';
import { supabaseAdmin } from '@/lib/supabase-admin';

const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

/** Generate a 6-digit numeric OTP */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    // Rate limit check
    if (isRealSupabase) {
      const { data: recentOtp } = await supabaseAdmin
        .from('otp_codes')
        .select('id')
        .eq('email', email)
        .eq('used', false)
        .gt('created_at', new Date(Date.now() - 60 * 1000).toISOString())
        .limit(1)
        .single();

      if (recentOtp) {
        return NextResponse.json(
          { success: false, error: '验证码已发送，请稍后再试' },
          { status: 429 },
        );
      }
    } else {
      if (isRateLimited(email)) {
        return NextResponse.json(
          { success: false, error: '验证码已发送，请稍后再试' },
          { status: 429 },
        );
      }
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save to database (or memory fallback)
    if (isRealSupabase) {
      await supabaseAdmin.from('otp_codes').insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
      });
    } else {
      saveOtp(email, code, expiresAt);
      console.log(`[DEV] OTP for ${email}: ${code}`);
    }

    const result = await sendOtpEmail(email, code);

    if (!result.success) {
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
