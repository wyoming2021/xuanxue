import { NextRequest, NextResponse } from 'next/server';

import { validateCallbackFields, verifyCallback } from '@/lib/hupijiao';
import { getProduct, yuanToCents } from '@/lib/payment-products';
import { supabaseAdmin } from '@/lib/supabase-admin';

function fail(message: string, status = 400) {
  return new NextResponse('fail', { status });
}

/**
 * 虎皮椒支付回调。
 *
 * 安全契约（P0-2 / Phase 1 验收）：
 * - 验签失败返回 fail；
 * - 只接受支付成功状态（OD）；
 * - 回调金额（total_fee，分）必须与订单金额换算后的分值完全一致；
 * - 已支付订单重复回调幂等返回 success；
 * - 所有 DB 更新必须检查 .error，解锁失败返回 fail 让网关重试；
 * - 会员时长由服务端产品目录（product_key）决定，不由金额反推；
 * - daily 是 (zodiac, date) 公共记录，绝不写 daily_fortunes.is_unlocked，
 *   单次解锁状态由 daily API 查询 orders 表判断。
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    if (!verifyCallback(params)) {
      console.warn('[payment/callback] 验签失败:', {
        tradeOrderId: params.trade_order_id,
        transactionId: params.transaction_id,
      });
      return fail('invalid signature');
    }

    const fields = validateCallbackFields(params);
    if (!fields.valid || !fields.orderId || fields.totalFeeCents === undefined) {
      console.warn('[payment/callback] 回调字段校验失败:', fields.reason);
      return fail(fields.reason || 'invalid callback fields');
    }

    const orderId = fields.orderId;
    const callbackFeeCents = fields.totalFeeCents;

    if (!supabaseAdmin) {
      console.error('[payment/callback] 数据库未配置');
      return fail('db unavailable', 500);
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, record_type, record_id, amount, product_key, status')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) {
      console.error('[payment/callback] 查询订单失败:', { orderId, error: orderError });
      return fail('db error', 500);
    }
    if (!order) {
      console.warn('[payment/callback] 订单不存在:', orderId);
      return fail('order not found', 404);
    }

    // 金额一致性校验（P0-2）：精确到分，避免浮点误差
    const orderFeeCents = yuanToCents(Number(order.amount));
    if (orderFeeCents !== callbackFeeCents) {
      console.error('[payment/callback] 金额不一致:', {
        orderId,
        orderFeeCents,
        callbackFeeCents,
      });
      return fail('amount mismatch');
    }

    // 幂等：已支付订单直接 success
    if (order.status === 'paid') {
      return new NextResponse('success');
    }

    // === 会员订单：先延长 VIP，成功后再标记订单 paid ===
    if (order.record_type === 'membership') {
      const product = order.product_key ? getProduct(order.product_key) : null;
      let days: number;
      if (product?.membershipDays) {
        days = product.membershipDays;
      } else {
        // 兼容没有 product_key 的历史订单，按金额推断并记录警告
        const amount = Number(order.amount);
        days = amount >= 199 ? 365 : amount >= 19.9 ? 30 : 1;
        console.warn('[payment/callback] 订单缺少 product_key，按金额推断会员时长:', {
          orderId,
          amount,
          days,
        });
      }

      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('vip_expire_time')
        .eq('id', order.user_id)
        .single();

      if (userError || !userData) {
        console.error('[payment/callback] 查询会员用户失败:', {
          orderId,
          userId: order.user_id,
          error: userError,
        });
        return fail('user lookup failed', 500);
      }

      const baseTime =
        userData.vip_expire_time && new Date(userData.vip_expire_time) > new Date()
          ? new Date(userData.vip_expire_time)
          : new Date();
      baseTime.setDate(baseTime.getDate() + days);

      const { error: vipError } = await supabaseAdmin
        .from('users')
        .update({ vip_expire_time: baseTime.toISOString() })
        .eq('id', order.user_id);

      if (vipError) {
        console.error('[payment/callback] 延长会员失败:', {
          orderId,
          userId: order.user_id,
          days,
          error: vipError,
        });
        return fail('vip update failed', 500);
      }

      const { error: markPaidError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          hupijiao_order_id: params.transaction_id || orderId,
        })
        .eq('id', orderId);

      if (markPaidError) {
        console.error('[payment/callback] 标记订单 paid 失败:', { orderId, error: markPaidError });
        return fail('mark paid failed', 500);
      }

      return new NextResponse('success');
    }

    // === 单次解锁订单（bazi / tarot）===
    if (order.record_type === 'bazi' || order.record_type === 'tarot') {
      if (!order.record_id) {
        console.error('[payment/callback] 单次解锁订单缺少 record_id:', orderId);
        return fail('missing record id');
      }

      const table = order.record_type === 'bazi' ? 'bazi_records' : 'tarot_records';
      const { error: unlockError } = await supabaseAdmin
        .from(table)
        .update({ is_unlocked: true })
        .eq('id', order.record_id);

      if (unlockError) {
        console.error('[payment/callback] 解锁记录失败:', {
          orderId,
          table,
          recordId: order.record_id,
          error: unlockError,
        });
        return fail('unlock failed', 500);
      }

      const { error: markPaidError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          hupijiao_order_id: params.transaction_id || orderId,
        })
        .eq('id', orderId);

      if (markPaidError) {
        console.error('[payment/callback] 标记订单 paid 失败:', { orderId, error: markPaidError });
        return fail('mark paid failed', 500);
      }

      return new NextResponse('success');
    }

    // === daily 单次解锁：orders 表即凭证，不修改 daily_fortunes ===
    if (order.record_type === 'daily') {
      const { error: markPaidError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          hupijiao_order_id: params.transaction_id || orderId,
        })
        .eq('id', orderId);

      if (markPaidError) {
        console.error('[payment/callback] 标记订单 paid 失败:', { orderId, error: markPaidError });
        return fail('mark paid failed', 500);
      }
      return new NextResponse('success');
    }

    console.error('[payment/callback] 未知 record_type:', {
      orderId,
      recordType: order.record_type,
    });
    return fail('unknown record type');
  } catch (error) {
    console.error('[payment/callback] 未捕获错误:', error);
    return fail('internal error', 500);
  }
}
