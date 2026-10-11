import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth';
import { hasRealSupabase } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * 当前登录用户的订单历史（会员中心用）。
 * 用户身份来自服务端会话（JWT cookie），不接受客户端传入 userId，防止越权。
 */
export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    // 开发模式（无真实数据库）没有订单数据
    if (!hasRealSupabase() || session.userId.startsWith('dev-')) {
      return NextResponse.json({ success: true, data: [] });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: '服务暂不可用' }, { status: 503 });
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(
        'id, record_type, product_key, amount, status, hupijiao_order_id, created_at, paid_at',
      )
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[user/orders] 查询订单失败:', error);
      return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('[user/orders] 未捕获错误:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
