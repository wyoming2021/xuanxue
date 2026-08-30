import { NextRequest, NextResponse } from 'next/server';

import { castLiuyao } from '@/lib/liuyao-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json({ success: false, error: 'Missing question' }, { status: 400 });
    }

    const result = castLiuyao(question);

    return NextResponse.json({
      success: true,
      data: {
        recordId: `liuyao-${Date.now()}`,
        result,
      },
    });
  } catch (error) {
    console.error('Liuyao API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
