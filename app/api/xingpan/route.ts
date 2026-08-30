import { NextRequest, NextResponse } from 'next/server';

import { calculateXingpan } from '@/lib/xingpan-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { birthDate, birthTime } = body;

    if (!birthDate || !birthTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const result = calculateXingpan({ birthDate, birthTime });

    return NextResponse.json({
      success: true,
      data: { recordId: `xingpan-${Date.now()}`, result },
    });
  } catch (error) {
    console.error('Xingpan API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
