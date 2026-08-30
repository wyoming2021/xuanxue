import { NextRequest, NextResponse } from 'next/server';

import { getOtp } from '@/lib/otp-store';

/** DEBUG ONLY - REMOVE BEFORE PRODUCTION */
export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'missing email' }, { status: 400 });

  const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');
  if (isRealSupabase) return NextResponse.json({ error: 'disabled' }, { status: 403 });

  const code = getOtp(email);
  return NextResponse.json({ email, code });
}
