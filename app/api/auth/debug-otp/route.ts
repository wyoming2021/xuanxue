import { NextRequest, NextResponse } from 'next/server';

import { isDevToolAllowed } from '@/lib/env';
import { getOtp } from '@/lib/otp-store';

/** DEV ONLY：查看内存中的验证码。生产或已接真库时一律 403（P1-4） */
export async function GET(req: NextRequest) {
  if (!isDevToolAllowed()) {
    return NextResponse.json({ error: 'disabled' }, { status: 403 });
  }

  const email = new URL(req.url).searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'missing email' }, { status: 400 });

  const code = getOtp(email);
  return NextResponse.json({ email, code });
}
