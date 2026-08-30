import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { TAROT_CARDS, SPREAD_CONFIGS } from '@/lib/tarot-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, spreadType, deviceId } = body;

    if (!spreadType || !SPREAD_CONFIGS[spreadType as keyof typeof SPREAD_CONFIGS]) {
      return NextResponse.json({ success: false, error: 'Invalid spread type' }, { status: 400 });
    }

    const config = SPREAD_CONFIGS[spreadType as keyof typeof SPREAD_CONFIGS];

    // Shuffle and draw cards
    const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, config.count).map((card, i) => ({
      card,
      position: Math.random() > 0.5 ? 'upright' : 'reversed',
      positionName: config.positions[i],
    }));

    const cardsData = drawn.map((d) => ({
      id: d.card.id,
      name: d.card.name,
      position: d.position,
      positionName: d.positionName,
      image: d.card.image,
      keyword: d.position === 'upright' ? d.card.uprightKeywords[0] : d.card.reversedKeywords[0],
    }));

    // Try to save to database
    let recordId = `local-${Date.now()}`;

    try {
      if (supabaseAdmin) {
        let userId: string | null = null;
        if (deviceId) {
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('device_id', deviceId)
            .single();

          if (existingUser) {
            userId = existingUser.id;
          } else {
            const { data: newUser } = await supabaseAdmin
              .from('users')
              .insert({ device_id: deviceId })
              .select('id')
              .single();
            userId = newUser?.id || null;
          }
        }

        const { data: record } = await supabaseAdmin
          .from('tarot_records')
          .insert({
            user_id: userId,
            question: question || '请给我指引',
            spread_type: spreadType,
            cards: cardsData,
          })
          .select('id')
          .single();

        if (record?.id) {
          recordId = record.id;
        }
      }
    } catch (dbError) {
      console.log('Database not available, returning local result');
    }

    return NextResponse.json({
      success: true,
      data: {
        recordId,
        cards: cardsData,
        spreadType,
        price: config.price,
      },
    });
  } catch (error) {
    console.error('Tarot API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get('id');
    const deviceId = searchParams.get('deviceId');

    if (!recordId) {
      return NextResponse.json({ success: false, error: 'Missing record id' }, { status: 400 });
    }

    // Try to get from database
    try {
      if (supabaseAdmin) {
        const { data: record } = await supabaseAdmin
          .from('tarot_records')
          .select('*')
          .eq('id', recordId)
          .single();

        if (record) {
          let isUnlocked = record.is_unlocked;
          if (!isUnlocked && deviceId) {
            const { data: user } = await supabaseAdmin
              .from('users')
              .select('vip_expire_time')
              .eq('device_id', deviceId)
              .single();
            if (user?.vip_expire_time && new Date(user.vip_expire_time) > new Date()) {
              isUnlocked = true;
            }
          }

          const enrichedCards = record.cards.map((c: any) => {
            const fullCard = TAROT_CARDS.find((tc) => tc.id === c.id);
            if (!fullCard) return c;
            return {
              ...c,
              uprightReading: fullCard.uprightReading,
              reversedReading: fullCard.reversedReading,
              element: fullCard.element,
              astrology: fullCard.astrology,
            };
          });

          return NextResponse.json({
            success: true,
            data: {
              recordId: record.id,
              question: record.question,
              spreadType: record.spread_type,
              cards: enrichedCards,
              isUnlocked,
            },
          });
        }
      }
    } catch (dbError) {
      // Database not configured
    }

    return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
  } catch (error) {
    console.error('Tarot GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
