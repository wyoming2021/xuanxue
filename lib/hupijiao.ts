import crypto from "crypto";

const APP_ID = process.env.HUPIJAO_APP_ID!;
const APP_SECRET = process.env.HUPIJAO_APP_SECRET!;
const API_URL = "https://pay.xunhupay.com/api/v2/pay/creat";

function generateSign(params: Record<string, string | number>): string {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys
    .filter((k) => k !== "hash")
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signContent = APP_SECRET + signStr + APP_SECRET;
  return crypto.createHash("md5").update(signContent, "utf8").digest("hex");
}

export async function createPaymentOrder(params: {
  orderId: string;
  amount: number;
  title: string;
  notifyUrl: string;
  returnUrl: string;
}): Promise<{ payUrl: string; orderId: string }> {
  const nonceStr = crypto.randomBytes(16).toString("hex");
  const totalFee = Math.round(params.amount * 100);

  const signParams: Record<string, string | number> = {
    version: "1.1",
    appid: APP_ID,
    trade_order_id: params.orderId,
    total_fee: totalFee,
    title: params.title,
    notify_url: params.notifyUrl,
    return_url: params.returnUrl,
    nonce_str: nonceStr,
  };

  const hash = generateSign(signParams);

  const body = new URLSearchParams({
    ...signParams,
    total_fee: String(totalFee),
    hash,
  });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  if (data.errcode === 0) {
    return { payUrl: data.url, orderId: params.orderId };
  }
  throw new Error(data.errmsg || "Payment creation failed");
}

export function verifyCallback(params: Record<string, string>): boolean {
  const hash = params.hash;
  const copy = { ...params };
  delete copy.hash;
  return generateSign(copy) === hash;
}
