import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json({ success: false, error: "Missing deviceId" }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("vip_expire_time")
      .eq("device_id", deviceId)
      .single();

    const isVip =
      user?.vip_expire_time && new Date(user.vip_expire_time) > new Date();
    const remainingDays = isVip
      ? Math.ceil(
          (new Date(user!.vip_expire_time).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        isVip: !!isVip,
        vipExpireTime: user?.vip_expire_time || null,
        remainingDays,
      },
    });
  } catch (error) {
    console.error("User status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
