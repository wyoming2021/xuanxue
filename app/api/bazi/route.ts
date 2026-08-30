import { NextRequest, NextResponse } from 'next/server';

import { calculateBazi } from '@/lib/bazi-engine';
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

    // Try to save to database (works even if Supabase is not configured)
    let recordId = `local-${Date.now()}`;

    try {
      // Ensure user exists
      let userId: string | null = null;
      if (deviceId && supabaseAdmin) {
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

      if (supabaseAdmin) {
        const { data: record } = await supabaseAdmin
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

        if (record?.id) {
          recordId = record.id;
        }
      }
    } catch (dbError) {
      // Database not configured - continue with local result
      console.log('Database not available, returning local result');
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

    // Try to get from database
    try {
      if (supabaseAdmin) {
        const { data: record } = await supabaseAdmin
          .from('bazi_records')
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

          const result = record.bazi_result;
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
              preview: {
                yearPillar: `${result.yearPillar.gan}${result.yearPillar.zhi}`,
                monthPillar: `${result.monthPillar.gan}${result.monthPillar.zhi}`,
                dayPillar: `${result.dayPillar.gan}${result.dayPillar.zhi}`,
                hourPillar: `${result.hourPillar.gan}${result.hourPillar.zhi}`,
                briefComment: result.briefComment,
              },
            },
          });
        }
      }
    } catch (dbError) {
      // Database not configured
    }

    return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
  } catch (error) {
    console.error('Bazi GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
