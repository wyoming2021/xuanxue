import { NextRequest, NextResponse } from 'next/server';

import { activateDevMembership } from '@/lib/dev-user-store';
import { isDevToolAllowed } from '@/lib/env';

/**
 * DEV ONLY: Simulate a membership purchase.
 * 生产或已接真库时一律 403（P1-4：不再依赖 Supabase URL 魔法字符串判断）。
 */
export async function POST(req: NextRequest) {
  if (!isDevToolAllowed()) {
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
