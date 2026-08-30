import { NextRequest, NextResponse } from 'next/server';

import { activateDevMembership } from '@/lib/dev-user-store';

const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

/**
 * DEV ONLY: Simulate a membership purchase.
 * Activate membership for a user by email.
 * REMOVE OR GUARD IN PRODUCTION.
 */
export async function POST(req: NextRequest) {
  if (isRealSupabase) {
    return NextResponse.json({ error: 'disabled in production' }, { status: 403 });
  }

  try {
    const { email, days } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const membershipDays = days || 30;
    const user = activateDevMembership(email, membershipDays);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        vipExpireTime: user.vip_expire_time,
      },
      message: `Membership activated for ${membershipDays} days`,
    });
  } catch (error) {
    console.error('Dev activate membership error:', error);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
