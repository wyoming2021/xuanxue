import { NextRequest, NextResponse } from 'next/server';

import { castMeihua } from '@/lib/meihua-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, method } = body;

    if (!question) {
      return NextResponse.json({ success: false, error: 'Missing question' }, { status: 400 });
    }

    const result = castMeihua(question, method || 'time');

    return NextResponse.json({
      success: true,
      data: {
        recordId: `meihua-${Date.now()}`,
        result,
      },
    });
  } catch (error) {
    console.error('Meihua API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
