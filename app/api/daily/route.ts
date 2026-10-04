import { NextRequest, NextResponse } from 'next/server';

import { resolveRequestUser } from '@/lib/resolve-user';
import { supabaseAdmin } from '@/lib/supabase-admin';

const ZODIAC_LIST = [
  '白羊座',
  '金牛座',
  '双子座',
  '巨蟹座',
  '狮子座',
  '处女座',
  '天秤座',
  '天蝎座',
  '射手座',
  '摩羯座',
  '水瓶座',
  '双鱼座',
];

const ZODIAC_ELEMENTS: Record<string, string> = {
  白羊座: '火',
  金牛座: '土',
  双子座: '风',
  巨蟹座: '水',
  狮子座: '火',
  处女座: '土',
  天秤座: '风',
  天蝎座: '水',
  射手座: '火',
  摩羯座: '土',
  水瓶座: '风',
  双鱼座: '水',
};

const FORTUNE_INTRODUCTIONS: Record<string, string[]> = {
  白羊座: ['白羊座的你今天充满活力', '火星的能量今天特别活跃', '今天的你像个战士'],
  金牛座: ['金牛座的你今天稳扎稳打', '金星守护的你今天格外有魅力', '享受生活的一天'],
  双子座: ['双子座的你今天思维敏捷', '水星加持让你口才出众', '社交之星今天闪耀'],
  巨蟹座: ['巨蟹座的你今天情感丰富', '月亮的能量让你更加敏感', '家庭温暖的一天'],
  狮子座: ['狮子座的你今天光芒四射', '太阳的照耀让你成为焦点', '展现王者风范的一天'],
  处女座: ['处女座的你今天细致入微', '水星让你分析能力超强', '追求完美的好日子'],
  天秤座: ['天秤座的你今天魅力十足', '金星让你在人际关系中游刃有余', '平衡和谐的一天'],
  天蝎座: ['天蝎座的你今天洞察力强', '冥王星赋予你深邃的力量', '神秘感今天特别强烈'],
  射手座: ['射手座的你今天乐观开朗', '木星带来好运和扩张', '探索冒险的一天'],
  摩羯座: ['摩羯座的你今天目标明确', '土星让你更加务实', '事业运势上升的一天'],
  水瓶座: ['水瓶座的你今天创意满满', '天王星带来创新的灵感', '独特思维的一天'],
  双鱼座: ['双鱼座的你今天直觉敏锐', '海王星增强你的灵感', '梦幻浪漫的一天'],
};

const LOVE_FORTUNES = [
  {
    score: 5,
    content: '爱情运势极佳！单身者有望遇到心仪对象，已有伴者感情升温，是表白或约会的绝佳时机。',
  },
  {
    score: 4,
    content: '爱情运势很好。适合主动出击，表达你的心意。已有伴者可以安排一次浪漫的约会。',
  },
  { score: 3, content: '爱情运势平稳。保持真诚的态度，不要急于求成。单身者可以多参加社交活动。' },
  { score: 2, content: '爱情运势一般。可能需要更多耐心，不要冲动行事。单身者建议先提升自我。' },
  { score: 1, content: '爱情运势欠佳。建议把注意力放在自己身上，不要过度依赖感情。' },
];

const CAREER_FORTUNES = [
  { score: 5, content: '事业运势极佳！今天的你工作效率超高，容易获得领导认可。适合推进重要项目。' },
  { score: 4, content: '事业运势很好。团队合作顺利，你的创意会得到赏识。适合开展新项目。' },
  { score: 3, content: '事业运势平稳。按部就班完成工作，不要过于冒险。适合处理日常事务。' },
  { score: 2, content: '事业运势一般。可能遇到一些小阻碍，保持耐心，寻求同事帮助。' },
  { score: 1, content: '事业运势欠佳。建议低调行事，避免与人冲突。专注做好本职工作。' },
];

const WEALTH_FORTUNES = [
  { score: 5, content: '财运极佳！今天可能会有意外收入或投资回报。适合进行财务规划。' },
  { score: 4, content: '财运很好。正财运旺盛，工作收入有望增加。可以考虑稳健的投资。' },
  { score: 3, content: '财运平稳。收支平衡，不宜进行大额消费或冒险投资。' },
  { score: 2, content: '财运一般。注意控制消费，避免冲动购物。理性对待金钱问题。' },
  { score: 1, content: '财运欠佳。今天不宜进行任何财务决策，保守为上。' },
];

const HEALTH_FORTUNES = [
  { score: 5, content: '健康状况极佳！精力充沛，适合进行运动锻炼。保持良好的作息习惯。' },
  { score: 4, content: '健康状况很好。身体状态不错，可以适当增加运动量。' },
  { score: 3, content: '健康状况平稳。注意劳逸结合，不要过度劳累。' },
  { score: 2, content: '健康状况一般。可能会感到疲劳，注意休息。多喝水，保持规律作息。' },
  { score: 1, content: '健康状况欠佳。建议今天多休息，避免剧烈运动。注意饮食健康。' },
];

const LUCKY_ITEMS = {
  colors: [
    '红色',
    '橙色',
    '黄色',
    '绿色',
    '蓝色',
    '紫色',
    '粉色',
    '金色',
    '银色',
    '白色',
    '黑色',
    '棕色',
  ],
  numbers: [1, 2, 3, 5, 6, 7, 8, 9, 11, 13, 15, 18, 21, 24, 27, 33],
  directions: ['东', '南', '西', '北', '东南', '东北', '西南', '西北'],
};

const COMPATIBLE_ZODIACS: Record<string, string[]> = {
  白羊座: ['狮子座', '射手座', '双子座'],
  金牛座: ['处女座', '摩羯座', '巨蟹座'],
  双子座: ['天秤座', '水瓶座', '白羊座'],
  巨蟹座: ['天蝎座', '双鱼座', '金牛座'],
  狮子座: ['白羊座', '射手座', '双子座'],
  处女座: ['金牛座', '摩羯座', '天蝎座'],
  天秤座: ['双子座', '水瓶座', '狮子座'],
  天蝎座: ['巨蟹座', '双鱼座', '处女座'],
  射手座: ['白羊座', '狮子座', '水瓶座'],
  摩羯座: ['金牛座', '处女座', '双鱼座'],
  水瓶座: ['双子座', '天秤座', '射手座'],
  双鱼座: ['巨蟹座', '天蝎座', '摩羯座'],
};

/**
 * 生成某星座某天的运势（P2-2 修复）。
 *
 * 用 (zodiac, date) 做 FNV-1a 种子 + mulberry32 迭代伪随机：
 * - 四个维度（爱情/事业/财运/健康）各自取独立随机值，不再共享同一个恒定状态
 *   （旧实现 rand() 不迭代，四项永远同档）；
 * - 同一星座同一天结果可复现，不同星座/不同日期结果分散。
 */
function generateFortune(zodiac: string, date: string) {
  // FNV-1a 哈希种子
  let seed = 0x811c9dc5;
  const input = `${date}|${zodiac}`;
  for (let i = 0; i < input.length; i++) {
    seed ^= input.charCodeAt(i);
    seed = Math.imul(seed, 0x01000193) >>> 0;
  }

  // mulberry32：可复现且足够分散的确定性 PRNG
  const rand = (() => {
    let state = seed >>> 0;
    return (n: number) => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      const x = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      return Math.floor(x * n);
    };
  })();

  const introIdx = rand(3);
  const loveIdx = rand(5);
  const careerIdx = rand(5);
  const wealthIdx = rand(5);
  const healthIdx = rand(5);

  const love = LOVE_FORTUNES[loveIdx];
  const career = CAREER_FORTUNES[careerIdx];
  const wealth = WEALTH_FORTUNES[wealthIdx];
  const health = HEALTH_FORTUNES[healthIdx];

  const overallScore = Math.round((love.score + career.score + wealth.score + health.score) / 4);

  return {
    zodiac,
    date,
    element: ZODIAC_ELEMENTS[zodiac],
    introduction: FORTUNE_INTRODUCTIONS[zodiac][introIdx],
    overallScore,
    summary:
      overallScore >= 4
        ? '运势极佳'
        : overallScore >= 3
          ? '运势良好'
          : overallScore >= 2
            ? '运势平稳'
            : '运势欠佳',
    love: love.content,
    loveScore: love.score,
    career: career.content,
    careerScore: career.score,
    wealth: wealth.content,
    wealthScore: wealth.score,
    health: health.content,
    healthScore: health.score,
    luckyColor: LUCKY_ITEMS.colors[rand(12)],
    luckyNumber: LUCKY_ITEMS.numbers[rand(16)],
    luckyDirection: LUCKY_ITEMS.directions[rand(8)],
    compatibleZodiac: COMPATIBLE_ZODIACS[zodiac]?.[rand(3)] || '未知',
  };
}

// 本地缓存上限，防止长驻进程内存无限增长（P3-8 部分缓解；根治靠 DB 唯一索引）
const MAX_LOCAL_CACHE = 400;
const localCache = new Map<string, any>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zodiac = searchParams.get('zodiac');
    const deviceId = searchParams.get('deviceId');

    if (!zodiac || !ZODIAC_LIST.includes(zodiac)) {
      return NextResponse.json({ success: false, error: 'Invalid zodiac' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${zodiac}-${today}`;

    if (supabaseAdmin) {
      let existing = null;
      let dbError: unknown = null;

      try {
        const { data, error } = await supabaseAdmin
          .from('daily_fortunes')
          .select('*')
          .eq('zodiac', zodiac)
          .eq('fortune_date', today)
          .maybeSingle();

        if (error) {
          dbError = error;
        } else {
          existing = data;
        }

        if (!existing && !dbError) {
          const fortune = generateFortune(zodiac, today);
          // (zodiac, fortune_date) 有唯一索引（003 迁移），并发插入冲突时回读
          const { data: newFortune, error: insertError } = await supabaseAdmin
            .from('daily_fortunes')
            .insert({ zodiac, fortune_date: today, content: fortune })
            .select('*')
            .single();

          if (insertError) {
            console.error('[daily] 写入运势失败:', insertError);
            const retry = await supabaseAdmin
              .from('daily_fortunes')
              .select('*')
              .eq('zodiac', zodiac)
              .eq('fortune_date', today)
              .maybeSingle();
            existing = retry.data;
          } else {
            existing = newFortune;
          }
        }
      } catch (err) {
        console.error('[daily] 数据库操作异常，降级为本地缓存:', err);
        dbError = err;
      }

      if (existing && existing.content) {
        // daily_fortunes 是 (zodiac, fortune_date) 维度的公共记录，
        // is_unlocked 字段是全局的，不能作为单人解锁依据（文档 8.4）。
        // 解锁判定：VIP，或该用户对这条 fortune 有已支付订单。
        const requestUser = await resolveRequestUser(deviceId);
        let isUnlocked = false;
        if (requestUser) {
          if (requestUser.isVip) {
            isUnlocked = true;
          } else {
            const { data: paidOrder } = await supabaseAdmin
              .from('orders')
              .select('id')
              .eq('user_id', requestUser.userId)
              .eq('record_type', 'daily')
              .eq('record_id', existing.id)
              .eq('status', 'paid')
              .limit(1)
              .maybeSingle();
            if (paidOrder) isUnlocked = true;
          }
        }

        return NextResponse.json({
          success: true,
          data: { fortuneId: existing.id, content: existing.content, isUnlocked },
        });
      }
    }

    if (!localCache.has(cacheKey)) {
      localCache.set(cacheKey, generateFortune(zodiac, today));
      // 简单 LRU：超限删除最早插入的条目
      if (localCache.size > MAX_LOCAL_CACHE) {
        const oldest = localCache.keys().next().value;
        if (oldest !== undefined) localCache.delete(oldest);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        fortuneId: `local-${cacheKey}`,
        content: localCache.get(cacheKey),
        // 无数据库模式不设付费墙（与 bazi/tarot 本地记录行为一致），
        // 付费解锁只在有真实库时生效
        isUnlocked: true,
      },
    });
  } catch (error) {
    console.error('Daily fortune error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
