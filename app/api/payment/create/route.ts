import crypto from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth';
import { getProduct, yuanToCents } from '@/lib/payment-products';
import { supabaseAdmin } from '@/lib/supabase-admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 创建支付订单。
 *
 * 安全契约（P0-1 / P0-2）：
 * - 客户端只传 productKey，金额一律由服务端产品目录决定；
 * - 不接受客户端 userId，登录用户从 session 解析，匿名用户从 deviceId 解析；
 * - 订单 ID 使用 crypto.randomUUID()（orders.id 是 PostgreSQL UUID）；
 * - 订单写入失败直接拒绝，绝不静默继续创建支付。
 */
export async function POST(req: NextRequest) {
  try {
    let body: { productKey?: unknown; recordId?: unknown; deviceId?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: '请求体不是合法 JSON' }, { status: 400 });
    }

    const { productKey, recordId, deviceId } = body as Record<string, unknown>;

    if (typeof productKey !== 'string' || !productKey) {
      return NextResponse.json({ success: false, error: '缺少 productKey' }, { status: 400 });
    }

    const product = getProduct(productKey);
    if (!product) {
      return NextResponse.json({ success: false, error: '无效的产品' }, { status: 400 });
    }

    // 单次解锁必须携带目标记录 ID；会员产品不需要
    if (product.recordType !== 'membership') {
      if (typeof recordId !== 'string' || !UUID_RE.test(recordId)) {
        return NextResponse.json({ success: false, error: '无效的记录 ID' }, { status: 400 });
      }
    }

    // 解析归属用户：登录 session 优先，其次匿名 deviceId
    let resolvedUserId: string | null = null;
    const session = await getCurrentSession();
    if (session?.userId) {
      resolvedUserId = session.userId;
    } else if (typeof deviceId === 'string' && deviceId.length >= 8) {
      // deviceId 是客户端 localStorage 里的 UUID
      if (!UUID_RE.test(deviceId)) {
        return NextResponse.json({ success: false, error: '无效的设备 ID' }, { status: 400 });
      }
    } else {
      return NextResponse.json(
        { success: false, error: '缺少有效的用户身份（未登录或无 deviceId）' },
        { status: 401 },
      );
    }

    if (!supabaseAdmin) {
      console.error('[payment/create] 数据库未配置，拒绝创建支付订单');
      return NextResponse.json(
        { success: false, error: '支付服务暂不可用，请稍后再试' },
        { status: 503 },
      );
    }

    // 匿名用户：查找或创建
    if (!resolvedUserId) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('device_id', deviceId as string)
        .maybeSingle();

      if (existingUser) {
        resolvedUserId = existingUser.id;
      } else {
        const { data: newUser, error: createUserError } = await supabaseAdmin
          .from('users')
          .insert({ device_id: deviceId as string })
          .select('id')
          .single();

        if (createUserError || !newUser) {
          console.error('[payment/create] 创建匿名用户失败:', createUserError);
          return NextResponse.json(
            { success: false, error: '订单创建失败，请稍后再试' },
            { status: 500 },
          );
        }
        resolvedUserId = newUser.id;
      }
    } else {
      // 校验登录用户存在
      const { data: sessionUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', resolvedUserId)
        .maybeSingle();
      if (!sessionUser) {
        return NextResponse.json({ success: false, error: '用户不存在' }, { status: 401 });
      }
    }

    // 校验目标记录存在且属于当前用户（P1-2：业务表没有 device_id，归属链是
    // deviceId -> users.device_id -> users.id -> record.user_id）
    if (product.recordType !== 'membership') {
      const table =
        product.recordType === 'bazi'
          ? 'bazi_records'
          : product.recordType === 'tarot'
            ? 'tarot_records'
            : 'daily_fortunes';

      const { data: record, error: recordError } = await supabaseAdmin
        .from(table)
        .select('id, user_id')
        .eq('id', recordId as string)
        .maybeSingle();

      if (recordError || !record) {
        return NextResponse.json({ success: false, error: '记录不存在' }, { status: 404 });
      }

      // daily_fortunes 是 (zodiac, fortune_date) 维度的公共记录，不做归属限制，
      // 解锁状态由 orders 表按用户维度判断（不要写 daily_fortunes.is_unlocked，那是全局字段）
      if (product.recordType !== 'daily' && record.user_id !== resolvedUserId) {
        console.warn(
          `[payment/create] 归属校验失败: record=${recordId} owner=${record.user_id} payer=${resolvedUserId}`,
        );
        return NextResponse.json({ success: false, error: '无权为该记录付款' }, { status: 403 });
      }
    }

    const orderId = crypto.randomUUID();
    const amountCents = yuanToCents(product.amountYuan);

    // 写订单：失败必须拒绝，不允许空 catch 吞掉后继续创建支付（P0-1）
    const { error: orderError } = await supabaseAdmin.from('orders').insert({
      id: orderId,
      user_id: resolvedUserId,
      record_type: product.recordType,
      record_id: product.recordType === 'membership' ? null : (recordId as string | null),
      amount: product.amountYuan,
      product_key: product.key,
      status: 'pending',
    });

    if (orderError) {
      console.error('[payment/create] 订单写入数据库失败:', {
        orderId,
        productKey: product.key,
        userId: resolvedUserId,
        error: orderError,
      });
      return NextResponse.json(
        { success: false, error: '订单创建失败，请稍后再试' },
        { status: 500 },
      );
    }

    // 是否配置了虎皮椒真实凭证
    const appId = process.env.HUPIJAO_APP_ID;
    const appSecret = process.env.HUPIJAO_APP_SECRET;
    const hupijiaoConfigured = !!(appId && appSecret && appId !== '你的虎皮椒APPID');

    if (hupijiaoConfigured) {
      try {
        const { createPaymentOrder } = await import('@/lib/hupijiao');
        const returnUrlBase =
          product.recordType === 'bazi'
            ? 'bazi'
            : product.recordType === 'tarot'
              ? 'tarot'
              : 'daily';
        const result = await createPaymentOrder({
          orderId,
          amount: product.amountYuan,
          title: product.title,
          notifyUrl: process.env.HUPIJAO_NOTIFY_URL || `${SITE_URL}/api/payment/callback`,
          returnUrl: `${SITE_URL}/${returnUrlBase}`,
        });

        await supabaseAdmin
          .from('orders')
          .update({ hupijiao_url: result.payUrl })
          .eq('id', orderId);

        return NextResponse.json({
          success: true,
          data: { orderId, payUrl: result.payUrl },
        });
      } catch (payError) {
        console.error('[payment/create] 虎皮椒下单失败:', { orderId, error: payError });
        // 下单失败：把订单标记为 failed，避免残留 pending
        await supabaseAdmin
          .from('orders')
          .update({ status: 'failed' })
          .eq('id', orderId)
          .then(({ error }) => {
            if (error) console.error('[payment/create] 标记订单 failed 出错:', error);
          });
        return NextResponse.json(
          { success: false, error: '支付发起失败，请稍后再试' },
          { status: 502 },
        );
      }
    }

    // 演示模式：未配置虎皮椒凭证。订单已写入 DB，返回演示页地址。
    const demoPayUrl = `${SITE_URL}/payment/demo?orderId=${orderId}`;
    return NextResponse.json({
      success: true,
      data: {
        orderId,
        payUrl: demoPayUrl,
        demo: true,
        message: '当前为演示模式：支付网关未配置，无法完成真实支付。',
      },
    });
  } catch (error) {
    console.error('[payment/create] 未捕获错误:', error);
    return NextResponse.json(
      { success: false, error: '支付创建失败，请稍后再试' },
      { status: 500 },
    );
  }
}
