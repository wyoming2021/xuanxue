import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase-admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recordType, recordId, amount, deviceId, userId, membershipType } = body;

    // Accept either userId (logged-in) or deviceId (anonymous)
    const resolvedUserId = userId || null;
    const resolvedDeviceId = deviceId || null;

    if (!resolvedUserId && !resolvedDeviceId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or deviceId' },
        { status: 400 },
      );
    }

    const orderId = `demo-${Date.now()}`;
    const title =
      recordType === 'membership'
        ? `玄语${membershipType === 'day' ? '日卡' : membershipType === 'month' ? '月卡' : '年卡'}会员`
        : `玄语${recordType === 'bazi' ? '八字排盘' : recordType === 'tarot' ? '塔罗占卜' : '运势解锁'}`;

    const finalAmount = amount || 9.9;

    // Try to save to database
    try {
      if (supabaseAdmin) {
        let user;
        if (resolvedUserId) {
          // Logged-in user: use userId directly
          const { data } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', resolvedUserId)
            .single();
          user = data;
        } else {
          // Anonymous: find or create by deviceId
          const { data } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('device_id', resolvedDeviceId)
            .single();
          user = data;

          if (!user) {
            const { data: newUser } = await supabaseAdmin
              .from('users')
              .insert({ device_id: resolvedDeviceId })
              .select('id')
              .single();
            user = newUser;
          }
        }

        await supabaseAdmin.from('orders').insert({
          id: orderId,
          user_id: user?.id,
          record_type: recordType === 'tarot' ? 'tarot' : recordType,
          record_id: recordId || null,
          amount: finalAmount,
          status: 'pending',
        });
      }
    } catch (dbError) {
      // Database not configured
    }

    // Check if虎皮椒 is configured
    const appId = process.env.HUPIJAO_APP_ID;
    const appSecret = process.env.HUPIJAO_APP_SECRET;

    if (appId && appSecret && appId !== '你的虎皮椒APPID') {
      // Real payment - try to create order
      try {
        const { createPaymentOrder } = await import('@/lib/hupijiao');
        const result = await createPaymentOrder({
          orderId,
          amount: finalAmount,
          title,
          notifyUrl: process.env.HUPIJAO_NOTIFY_URL || `${SITE_URL}/api/payment/callback`,
          returnUrl: `${SITE_URL}/${recordType === 'bazi' ? 'bazi' : recordType === 'tarot' ? 'tarot' : 'daily'}`,
        });

        return NextResponse.json({
          success: true,
          data: { orderId, payUrl: result.payUrl },
        });
      } catch (payError) {
        console.error('Payment creation failed:', payError);
        return NextResponse.json(
          { success: false, error: 'Payment creation failed' },
          { status: 500 },
        );
      }
    } else {
      // Demo mode - return a mock payment URL
      const demoPayUrl = `${SITE_URL}/payment/demo?orderId=${orderId}&amount=${finalAmount}&title=${encodeURIComponent(title)}`;

      return NextResponse.json({
        success: true,
        data: {
          orderId,
          payUrl: demoPayUrl,
          demo: true,
          message: '这是演示模式。配置虎皮椒凭证后将接入真实支付。',
        },
      });
    }
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ success: false, error: 'Payment creation failed' }, { status: 500 });
  }
}
