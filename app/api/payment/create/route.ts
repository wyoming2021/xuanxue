import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createPaymentOrder } from "@/lib/hupijiao";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recordType, recordId, amount, deviceId, membershipType } = body;

    if (!deviceId) {
      return NextResponse.json({ success: false, error: "Missing deviceId" }, { status: 400 });
    }

    // Ensure user exists
    let { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("device_id", deviceId)
      .single();

    if (!user) {
      const { data: newUser } = await supabaseAdmin
        .from("users")
        .insert({ device_id: deviceId })
        .select("id")
        .single();
      user = newUser;
    }

    const orderId = crypto.randomUUID();
    const title =
      recordType === "membership"
        ? `玄语${membershipType === "day" ? "日卡" : membershipType === "month" ? "月卡" : "年卡"}会员`
        : `玄语${recordType === "bazi" ? "八字排盘" : recordType === "tarot" ? "塔罗占卜" : "运势解锁"}`;

    const finalAmount = amount || 9.9;

    await supabaseAdmin.from("orders").insert({
      id: orderId,
      user_id: user?.id,
      record_type: recordType === "tarot" ? "tarot" : recordType,
      record_id: recordId || null,
      amount: finalAmount,
      status: "pending",
    });

    const result = await createPaymentOrder({
      orderId,
      amount: finalAmount,
      title,
      notifyUrl: process.env.HUPIJAO_NOTIFY_URL!,
      returnUrl: `${SITE_URL}/${recordType === "bazi" ? "bazi" : recordType === "tarot" ? "tarot" : "daily"}`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ hupijiao_url: result.payUrl })
      .eq("id", orderId);

    return NextResponse.json({
      success: true,
      data: { orderId, payUrl: result.payUrl },
    });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { success: false, error: "Payment creation failed" },
      { status: 500 }
    );
  }
}
