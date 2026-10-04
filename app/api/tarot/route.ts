import crypto from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { resolveRequestUser, isValidUuid } from '@/lib/resolve-user';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { TAROT_CARDS, SPREAD_CONFIGS } from '@/lib/tarot-data';

/** 安全随机整数 [0, max)（P2-5：不要用 Math.random） */
function secureRandomInt(max: number): number {
  return crypto.randomInt(max);
}

/** Fisher-Yates 洗牌，均匀分布（P2-5：sort(() => Math.random() - 0.5) 是有偏的） */
function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, spreadType, deviceId } = body;

    if (!spreadType || !SPREAD_CONFIGS[spreadType as keyof typeof SPREAD_CONFIGS]) {
      return NextResponse.json({ success: false, error: 'Invalid spread type' }, { status: 400 });
    }

    const config = SPREAD_CONFIGS[spreadType as keyof typeof SPREAD_CONFIGS];

    // Shuffle and draw cards
    const shuffled = fisherYatesShuffle(TAROT_CARDS);
    const drawn = shuffled.slice(0, config.count).map((card, i) => ({
      card,
      position: secureRandomInt(2) === 0 ? 'upright' : 'reversed',
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

    // 保存记录；数据库不可用时降级为本地记录
    let recordId = `local-${Date.now()}`;

    if (supabaseAdmin) {
      let userId: string | null = null;
      if (deviceId) {
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('device_id', deviceId)
          .maybeSingle();

        if (existingUser) {
          userId = existingUser.id;
        } else {
          const { data: newUser, error: createUserError } = await supabaseAdmin
            .from('users')
            .insert({ device_id: deviceId })
            .select('id')
            .single();
          if (createUserError) {
            console.error('[tarot POST] 创建匿名用户失败:', createUserError);
          }
          userId = newUser?.id || null;
        }
      }

      const { data: record, error: insertError } = await supabaseAdmin
        .from('tarot_records')
        .insert({
          user_id: userId,
          question: question || '请给我指引',
          spread_type: spreadType,
          cards: cardsData,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('[tarot POST] 写入塔罗记录失败（降级为本地记录）:', insertError);
      } else if (record?.id) {
        recordId = record.id;
      }
    } else {
      console.warn('[tarot POST] 数据库未配置，返回本地记录');
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

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
    }

    const { data: record, error } = await supabaseAdmin
      .from('tarot_records')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error) {
      console.error('[tarot GET] 查询记录失败:', { recordId, error });
      return NextResponse.json({ success: false, error: 'Query failed' }, { status: 500 });
    }

    if (!record) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    // 归属校验（P1-2）：deviceId -> users.device_id -> users.id -> record.user_id
    const requestUser = await resolveRequestUser(deviceId);
    const isOwner = !!requestUser && !!record.user_id && requestUser.userId === record.user_id;

    if (!isOwner) {
      return NextResponse.json({ success: false, error: '无权访问该记录' }, { status: 403 });
    }

    // 解锁状态：记录本身解锁，或当前用户是 VIP，或用户有该记录的已支付订单
    let isUnlocked = !!record.is_unlocked;
    if (!isUnlocked && requestUser) {
      if (requestUser.isVip) {
        isUnlocked = true;
      } else if (isValidUuid(recordId)) {
        const { data: paidOrder } = await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('user_id', requestUser.userId)
          .eq('record_type', 'tarot')
          .eq('record_id', record.id)
          .eq('status', 'paid')
          .limit(1)
          .maybeSingle();
        if (paidOrder) isUnlocked = true;
      }
    }

    const enrichedCards = (record.cards || []).map((c: Record<string, unknown>) => {
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
  } catch (error) {
    console.error('Tarot GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
