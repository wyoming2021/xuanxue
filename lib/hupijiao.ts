import crypto from 'crypto';

/**
 * 虎皮椒（xunhupay）支付网关封装。
 *
 * 注意：接口路径是 creat（不是 create），这是虎皮椒官方拼写，不要"修正"。
 * 文档：https://www.xunhupay.com/doc/page/url/pay
 */

const API_URL = 'https://pay.xunhupay.com/api/v2/pay/creat';

function getCredentials(): { appId: string; appSecret: string } {
  const appId = process.env.HUPIJAO_APP_ID;
  const appSecret = process.env.HUPIJAO_APP_SECRET;

  // fail-fast：关键链路不允许静默使用占位凭证（P1 类问题）
  if (!appId || !appSecret) {
    throw new Error('[hupijiao] HUPIJAO_APP_ID / HUPIJAO_APP_SECRET 未配置');
  }
  if (appId === '你的虎皮椒APPID' || appId.includes('placeholder')) {
    throw new Error('[hupijiao] HUPIJAO_APP_ID 仍是占位符，未配置真实凭证');
  }

  return { appId, appSecret };
}

function generateSign(params: Record<string, string | number>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys
    .filter((k) => k !== 'hash')
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const signContent = appSecret + signStr + appSecret;
  return crypto.createHash('md5').update(signContent, 'utf8').digest('hex');
}

export interface CreatePaymentOrderParams {
  orderId: string;
  /** 单位：元 */
  amount: number;
  title: string;
  notifyUrl: string;
  returnUrl: string;
}

export async function createPaymentOrder(
  params: CreatePaymentOrderParams,
): Promise<{ payUrl: string; orderId: string }> {
  const { appId, appSecret } = getCredentials();

  const nonceStr = crypto.randomBytes(16).toString('hex');
  // 元转分，Math.round 规避 9.9*100=989.999… 的浮点误差
  const totalFee = Math.round(params.amount * 100);

  const signParams: Record<string, string | number> = {
    version: '1.1',
    appid: appId,
    trade_order_id: params.orderId,
    total_fee: totalFee,
    title: params.title,
    notify_url: params.notifyUrl,
    return_url: params.returnUrl,
    nonce_str: nonceStr,
  };

  const hash = generateSign(signParams, appSecret);

  const body = new URLSearchParams({
    ...Object.fromEntries(Object.entries(signParams).map(([k, v]) => [k, String(v)])),
    hash,
  });

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[hupijiao] 创建支付单 HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  let data: { errcode?: number; errmsg?: string; url?: string };
  try {
    data = await res.json();
  } catch {
    throw new Error('[hupijiao] 创建支付单响应不是合法 JSON');
  }

  if (data.errcode !== 0 || !data.url) {
    throw new Error(`[hupijiao] 创建支付单失败 errcode=${data.errcode} errmsg=${data.errmsg}`);
  }

  return { payUrl: data.url, orderId: params.orderId };
}

/**
 * 常量时间比较两个 MD5 签名（P2-7）。
 * 长度不同直接 false，不进入 timingSafeEqual（它要求等长 buffer）。
 */
function safeHashEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function verifyCallback(params: Record<string, string>): boolean {
  try {
    const { appSecret } = getCredentials();
    const hash = params.hash;
    if (!hash || typeof hash !== 'string') return false;

    const copy: Record<string, string> = { ...params };
    delete copy.hash;

    const expected = generateSign(copy, appSecret);
    return safeHashEqual(expected, hash);
  } catch (error) {
    console.error('[hupijiao] verifyCallback error:', error);
    return false;
  }
}

/** 虎皮椒回调中表示支付成功的状态码 */
export const PAID_STATUS = 'OD';

/** 校验回调必填业务字段 */
export function validateCallbackFields(params: Record<string, string>): {
  valid: boolean;
  reason?: string;
  orderId?: string;
  totalFeeCents?: number;
} {
  const orderId = params.trade_order_id;
  const totalFee = params.total_fee;
  const status = params.status;

  if (!orderId) return { valid: false, reason: 'missing trade_order_id' };
  if (!totalFee || !/^\d+(\.\d+)?$/.test(totalFee)) {
    return { valid: false, reason: `invalid total_fee: ${totalFee}` };
  }
  if (status !== PAID_STATUS) {
    return { valid: false, reason: `status not paid (status=${status})` };
  }

  return {
    valid: true,
    orderId,
    totalFeeCents: Math.round(parseFloat(totalFee)),
  };
}
