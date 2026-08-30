import type { Metadata } from 'next';

const SITE_NAME = '玄语';
const SITE_URL = 'https://xuanyu.app';

export function createMetadata(page: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}): Metadata {
  const url = page.path ? `${SITE_URL}${page.path}` : SITE_URL;

  return {
    title: `${page.title} | ${SITE_NAME}`,
    description: page.description,
    keywords: [
      '玄学',
      '命理',
      '八字',
      '紫微斗数',
      '塔罗牌',
      '占卜',
      '星座',
      ...(page.keywords || []),
    ],
    openGraph: {
      title: `${page.title} | ${SITE_NAME}`,
      description: page.description,
      url,
      siteName: SITE_NAME,
      locale: 'zh_CN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${page.title} | ${SITE_NAME}`,
      description: page.description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export const PAGE_METADATA = {
  home: createMetadata({
    title: '在线玄学工具站',
    description:
      '玄语融合传统命理学与现代科技，提供八字排盘、紫微斗数、星盘占星、六爻占卜、塔罗牌、合婚配对、黄历择日等全方位玄学服务。免费体验，深度解读。',
    path: '/',
    keywords: ['在线算命', '免费排盘', '塔罗占卜', '八字排盘', '紫微斗数', '星座运势'],
  }),
  bazi: createMetadata({
    title: '八字排盘',
    description:
      '输入出生日期，自动排出四柱八字，分析五行分布、大运流年，提供详细命理分析。免费八字排盘工具。',
    path: '/bazi',
    keywords: ['八字排盘', '四柱八字', '五行分析', '大运流年', '命理分析'],
  }),
  ziwei: createMetadata({
    title: '紫微斗数排盘',
    description:
      '紫微斗数在线排盘，展示十二宫位星曜分布，分析命宫、身宫、大限流年，提供详细紫微命盘解读。',
    path: '/ziwei',
    keywords: ['紫微斗数', '紫微排盘', '十二宫位', '星曜分布', '大限流年'],
  }),
  xingpan: createMetadata({
    title: '星盘占星',
    description: '西方占星学星盘排盘，分析太阳星座、月亮星座、上升星座，解读行星分布和相位关系。',
    path: '/xingpan',
    keywords: ['星盘', '占星', '太阳星座', '月亮星座', '上升星座', '行星相位'],
  }),
  liuyao: createMetadata({
    title: '六爻占卜',
    description: '铜钱摇卦，六爻占卜在线排盘。解读卦象含义、爻线变化、用神分析，提供详细占卜指引。',
    path: '/liuyao',
    keywords: ['六爻', '六爻占卜', '铜钱摇卦', '卦象解读', '周易'],
  }),
  meihua: createMetadata({
    title: '梅花易数',
    description: '梅花易数在线起卦，以数起卦，灵活占卜。分析体用关系、五行生克，提供应期预测。',
    path: '/meihua',
    keywords: ['梅花易数', '起卦', '体用分析', '五行生克', '应期'],
  }),
  tarot: createMetadata({
    title: '塔罗牌占卜',
    description:
      '在线塔罗牌占卜，支持单张牌、三张牌、凯尔特十字牌阵。解读牌面含义，提供爱情、事业指引。',
    path: '/tarot',
    keywords: ['塔罗牌', '塔罗占卜', '塔罗牌阵', '牌面解读', '爱情占卜'],
  }),
  leinuoman: createMetadata({
    title: '雷诺曼占卜',
    description: '雷诺曼占卜在线解读，36张牌牌阵分析。支持三张牌和五张牌牌阵，提供详细牌意解读。',
    path: '/leinuoman',
    keywords: ['雷诺曼', '雷诺曼占卜', '36张牌', '牌阵解读'],
  }),
  lingsign: createMetadata({
    title: '灵签求签',
    description: '在线灵签求签，50支签文解读。涵盖姻缘、事业、财运、健康，提供详细签意分析。',
    path: '/lingsign',
    keywords: ['灵签', '求签', '解签', '庙宇求签', '签文'],
  }),
  daily: createMetadata({
    title: '每日星座运势',
    description: '12星座每日运势查询，提供爱情、事业、财运、健康详细分析，附幸运色、幸运数字指引。',
    path: '/daily',
    keywords: ['每日运势', '星座运势', '今日运势', '星座爱情', '星座事业'],
  }),
  hehun: createMetadata({
    title: '八字合婚配对',
    description: '八字合婚在线分析，比较双方五行、地支关系，评估感情、事业、家庭契合度。',
    path: '/hehun',
    keywords: ['八字合婚', '合婚配对', '五行分析', '缘分测试'],
  }),
  zeri: createMetadata({
    title: '黄历择日',
    description: '黄历择日在线查询，选择结婚、搬家、开业等事项的黄道吉日，提供时辰吉凶分析。',
    path: '/zeri',
    keywords: ['黄历', '择日', '黄道吉日', '时辰吉凶', '结婚吉日'],
  }),
};
