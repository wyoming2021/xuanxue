import { NextRequest, NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 查询订单支付状态（P2-3）。
 * PayWall 轮询这个接口而不是 /api/user/status——VIP 状态变化无法反映单次解锁订单。
 * 只返回归属校验通过后的订单状态，不暴露其他数据。
 */
export async function GET(req: NextRequest) {
  try {
    const orderId = new URL(req.url).searchParams.get('orderId');

    if (!orderId || !UUID_RE.test(orderId)) {
      return NextResponse.json({ success: false, error: '无效的订单 ID' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: '服务暂不可用' }, { status: 503 });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status')
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      console.error('[payment/status] 查询订单失败:', { orderId, error });
      return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json({ success: false, error: '订单不存在' }, { status: 404 });
    }

    // 归属校验：登录用户比对 session，匿名用户比对 deviceId -> users.id
    const session = await getCurrentSession();
    let authorized = false;
    if (session?.userId) {
      authorized = session.userId === order.user_id;
    } else {
      const deviceId = new URL(req.url).searchParams.get('deviceId');
      if (deviceId && UUID_RE.test(deviceId)) {
        const { data: deviceUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('device_id', deviceId)
          .maybeSingle();
        authorized = !!deviceUser && deviceUser.id === order.user_id;
      }
    }

    if (!authorized) {
      return NextResponse.json({ success: false, error: '无权查看该订单' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status, // pending | paid | failed
      },
    });
  } catch (error) {
    console.error('[payment/status] 未捕获错误:', error);
    return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 });
  }
}
