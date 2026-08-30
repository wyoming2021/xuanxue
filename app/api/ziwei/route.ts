import { NextRequest, NextResponse } from 'next/server';

import { calculateZiwei } from '@/lib/ziwei-engine';

const SHI_CHEN_MAP: Record<string, number> = {
  子时: 0,
  丑时: 2,
  寅时: 4,
  卯时: 6,
  辰时: 8,
  巳时: 10,
  午时: 12,
  未时: 14,
  申时: 16,
  酉时: 18,
  戌时: 20,
  亥时: 22,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { birthDate, birthTime, gender, deviceId } = body;

    if (!birthDate || !birthTime || !gender) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Convert time string to hour number
    let hour = 12;
    if (SHI_CHEN_MAP[birthTime] !== undefined) {
      hour = SHI_CHEN_MAP[birthTime];
    } else {
      const timeMatch = birthTime.match(/(\d{1,2}):?(\d{0,2})/);
      if (timeMatch) {
        hour = parseInt(timeMatch[1], 10);
      }
    }

    const result = calculateZiwei({
      birthDate,
      birthTime: hour,
      gender: gender as 'male' | 'female',
    });

    return NextResponse.json({
      success: true,
      data: {
        recordId: `ziwei-${Date.now()}`,
        result,
      },
    });
  } catch (error) {
    console.error('Ziwei API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
