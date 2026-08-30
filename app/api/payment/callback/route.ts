import { NextRequest, NextResponse } from 'next/server';

import { verifyCallback } from '@/lib/hupijiao';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    if (!verifyCallback(params)) {
      return new NextResponse('fail', { status: 400 });
    }

    const orderId = params.trade_order_id;
    if (!orderId) {
      return new NextResponse('fail', { status: 400 });
    }

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order || order.status === 'paid') {
      return new NextResponse('success');
    }

    await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        hupijiao_order_id: params.transaction_id || params.trade_order_id,
      })
      .eq('id', orderId);

    if (order.record_type === 'bazi' && order.record_id) {
      await supabaseAdmin
        .from('bazi_records')
        .update({ is_unlocked: true })
        .eq('id', order.record_id);
    } else if (order.record_type === 'tarot' && order.record_id) {
      await supabaseAdmin
        .from('tarot_records')
        .update({ is_unlocked: true })
        .eq('id', order.record_id);
    } else if (order.record_type === 'daily' && order.record_id) {
      await supabaseAdmin
        .from('daily_fortunes')
        .update({ is_unlocked: true })
        .eq('id', order.record_id);
    } else if (order.record_type === 'membership' && order.user_id) {
      let days = 1;
      if (order.amount >= 199) days = 365;
      else if (order.amount >= 19.9) days = 30;

      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('vip_expire_time')
        .eq('id', order.user_id)
        .single();

      const baseTime =
        userData?.vip_expire_time && new Date(userData.vip_expire_time) > new Date()
          ? new Date(userData.vip_expire_time)
          : new Date();

      baseTime.setDate(baseTime.getDate() + days);

      await supabaseAdmin
        .from('users')
        .update({ vip_expire_time: baseTime.toISOString() })
        .eq('id', order.user_id);
    }

    return new NextResponse('success');
  } catch (error) {
    console.error('Payment callback error:', error);
    return new NextResponse('fail', { status: 500 });
  }
}
