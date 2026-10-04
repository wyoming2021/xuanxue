import { NextRequest, NextResponse } from 'next/server';

import { calculateBazi } from '@/lib/bazi-engine';
import { resolveRequestUser } from '@/lib/resolve-user';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, birthDate, birthTime, gender, deviceId } = body;

    if (!birthDate || !birthTime || !gender) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Calculate bazi
    const baziResult = calculateBazi({ birthDate, birthTime, gender });

    // 保存记录；数据库不可用时降级为本地记录
    let recordId = `local-${Date.now()}`;

    if (supabaseAdmin) {
      try {
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
              console.error('[bazi POST] 创建匿名用户失败:', createUserError);
            }
            userId = newUser?.id || null;
          }
        }

        const { data: record, error: insertError } = await supabaseAdmin
          .from('bazi_records')
          .insert({
            user_id: userId,
            name: name || '某人',
            birth_date: birthDate,
            birth_time: birthTime,
            gender,
            bazi_result: baziResult,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('[bazi POST] 写入八字记录失败（降级为本地记录）:', insertError);
        } else if (record?.id) {
          recordId = record.id;
        }
      } catch (dbError) {
        console.error('[bazi POST] 数据库操作异常（降级为本地记录）:', dbError);
      }
    } else {
      console.warn('[bazi POST] 数据库未配置，返回本地记录');
    }

    return NextResponse.json({
      success: true,
      data: {
        recordId,
        preview: {
          yearPillar: `${baziResult.yearPillar.gan}${baziResult.yearPillar.zhi}`,
          monthPillar: `${baziResult.monthPillar.gan}${baziResult.monthPillar.zhi}`,
          dayPillar: `${baziResult.dayPillar.gan}${baziResult.dayPillar.zhi}`,
          hourPillar: `${baziResult.hourPillar.gan}${baziResult.hourPillar.zhi}`,
          briefComment: baziResult.briefComment,
        },
        fullResult: baziResult,
      },
    });
  } catch (error) {
    console.error('Bazi API error:', error);
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
      .from('bazi_records')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error) {
      console.error('[bazi GET] 查询记录失败:', { recordId, error });
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
      } else {
        const { data: paidOrder } = await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('user_id', requestUser.userId)
          .eq('record_type', 'bazi')
          .eq('record_id', record.id)
          .eq('status', 'paid')
          .limit(1)
          .maybeSingle();
        if (paidOrder) isUnlocked = true;
      }
    }

    const result = record.bazi_result;
    const preview = {
      yearPillar: `${result.yearPillar.gan}${result.yearPillar.zhi}`,
      monthPillar: `${result.monthPillar.gan}${result.monthPillar.zhi}`,
      dayPillar: `${result.dayPillar.gan}${result.dayPillar.zhi}`,
      hourPillar: `${result.hourPillar.gan}${result.hourPillar.zhi}`,
      briefComment: result.briefComment,
    };

    return NextResponse.json({
      success: true,
      data: {
        recordId: record.id,
        name: record.name,
        birthDate: record.birth_date,
        birthTime: record.birth_time,
        gender: record.gender,
        isUnlocked,
        fullResult: isUnlocked ? result : null,
        preview,
      },
    });
  } catch (error) {
    console.error('Bazi GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
