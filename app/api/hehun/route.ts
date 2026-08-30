import { NextRequest, NextResponse } from 'next/server';

import { calculateHehun } from '@/lib/hehun-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { person1, person2 } = body;

    if (!person1?.birthDate || !person1?.birthTime || !person2?.birthDate || !person2?.birthTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const result = calculateHehun({
      person1: { ...person1, gender: person1.gender || 'male' },
      person2: { ...person2, gender: person2.gender || 'female' },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Hehun API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
