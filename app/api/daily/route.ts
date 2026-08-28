import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ZODIAC_LIST = [
  "白羊座", "金牛座", "双子座", "巨蟹座",
  "狮子座", "处女座", "天秤座", "天蝎座",
  "射手座", "摩羯座", "水瓶座", "双鱼座",
];

const FORTUNE_ADJECTIVES = ["极好", "很好", "较好", "一般", "欠佳"];
const LOVE_FORTUNES = [
  "单身者有望遇到心仪对象，已有伴者感情升温",
  "感情平稳，适合沟通和表达内心想法",
  "可能有小摩擦，多换位思考即可化解",
  "桃花运一般，专注于自我提升更有收获",
  "感情上有迷茫感，给彼此一些空间",
];
const CAREER_FORTUNES = [
  "工作顺利，有望获得领导认可",
  "团队合作带来好成果，适合推进项目",
  "可能遇到挑战，但这是成长的机会",
  "适合学习新技能，为未来发展做准备",
  "工作中可能有变动，保持灵活应对",
];
const WEALTH_FORTUNES = [
  "财运亨通，可能有意外收入",
  "理性消费，适合做理财规划",
  "投资需谨慎，稳健为主",
  "日常开销注意控制，避免冲动消费",
  "有小额进账机会，不要错过",
];
const HEALTH_TIPS = [
  "身体状况良好，适合运动锻炼",
  "注意休息，避免过度疲劳",
  "饮食规律，多喝水",
  "适合户外活动，呼吸新鲜空气",
  "注意情绪管理，保持心情愉悦",
];
const LUCKY_COLORS = ["金色", "红色", "蓝色", "绿色", "紫色", "白色", "粉色", "橙色"];
const LUCKY_NUMBERS = ["3", "7", "8", "13", "21", "26", "33", "42"];

function generateFortune(zodiac: string, date: string) {
  const seed = Array.from(date + zodiac).reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (n: number) => (seed * 9301 + 49297) % n;

  const score = 5 - (rand(100) % 5);
  const idx = rand(100) % 5;

  return {
    zodiac,
    date,
    overallScore: score,
    summary: `${FORTUNE_ADJECTIVES[idx]}的一天`,
    love: LOVE_FORTUNES[rand(100) % 5],
    career: CAREER_FORTUNES[rand(100) % 5],
    wealth: WEALTH_FORTUNES[rand(100) % 5],
    health: HEALTH_TIPS[rand(100) % 5],
    luckyColor: LUCKY_COLORS[rand(100) % 8],
    luckyNumber: LUCKY_NUMBERS[rand(100) % 8],
    compatibleZodiac: ZODIAC_LIST[rand(100) % 12],
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zodiac = searchParams.get("zodiac");
    const deviceId = searchParams.get("deviceId");

    if (!zodiac || !ZODIAC_LIST.includes(zodiac)) {
      return NextResponse.json({ success: false, error: "Invalid zodiac" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    let { data: existing } = await supabaseAdmin
      .from("daily_fortunes")
      .select("*")
      .eq("zodiac", zodiac)
      .eq("fortune_date", today)
      .single();

    if (!existing) {
      const fortune = generateFortune(zodiac, today);
      const { data: newFortune } = await supabaseAdmin
        .from("daily_fortunes")
        .insert({
          zodiac,
          fortune_date: today,
          content: fortune,
        })
        .select("*")
        .single();
      existing = newFortune;
    }

    let isUnlocked = existing.is_unlocked;
    if (!isUnlocked && deviceId) {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("vip_expire_time")
        .eq("device_id", deviceId)
        .single();
      if (user?.vip_expire_time && new Date(user.vip_expire_time) > new Date()) {
        isUnlocked = true;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        fortuneId: existing.id,
        content: existing.content,
        isUnlocked,
      },
    });
  } catch (error) {
    console.error("Daily fortune error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
