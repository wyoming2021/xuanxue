import { Solar } from 'lunar-javascript';

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

const GAN_WUXING: Record<string, string> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};
const ZHI_WUXING: Record<string, string> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
};

// 五行相生相克
const WUXING_SHENG: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const WUXING_KE: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

// 地支六合
const DIZHI六合: Record<string, string> = {
  子: '丑',
  丑: '子',
  寅: '亥',
  亥: '寅',
  卯: '戌',
  戌: '卯',
  辰: '酉',
  酉: '辰',
  巳: '申',
  申: '巳',
  午: '未',
  未: '午',
};

// 地支三合
const DIZHI三合: Record<string, string[]> = {
  申子辰: ['申', '子', '辰'],
  寅午戌: ['寅', '午', '戌'],
  巳酉丑: ['巳', '酉', '丑'],
  亥卯未: ['亥', '卯', '未'],
};

// 地支六冲
const DIZHI六冲: Record<string, string> = {
  子: '午',
  午: '子',
  丑: '未',
  未: '丑',
  寅: '申',
  申: '寅',
  卯: '酉',
  酉: '卯',
  辰: '戌',
  戌: '辰',
  巳: '亥',
  亥: '巳',
};

export interface PersonBazi {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  dayMaster: string;
  dayMasterElement: string;
  shengxiao: string;
  fiveElements: Record<string, number>;
}

export interface HehunResult {
  person1: PersonBazi;
  person2: PersonBazi;
  overallScore: number;
  overallLevel: string;
  overallComment: string;
  wuxingAnalysis: {
    person1Element: string;
    person2Element: string;
    relationship: string;
    comment: string;
  };
  dizhiAnalysis: {
    sixHarmony: boolean;
    threeHarmony: boolean;
    sixClash: boolean;
    details: string[];
  };
  fiveElementBalance: {
    person1: Record<string, number>;
    person2: Record<string, number>;
    complement: string;
  };
  aspects: {
    love: { score: number; comment: string };
    career: { score: number; comment: string };
    family: { score: number; comment: string };
    communication: { score: number; comment: string };
  };
  suggestions: string[];
}

export function calculateHehun(params: {
  person1: { name: string; birthDate: string; birthTime: string; gender: 'male' | 'female' };
  person2: { name: string; birthDate: string; birthTime: string; gender: 'male' | 'female' };
}): HehunResult {
  const p1 = extractPersonBazi(params.person1);
  const p2 = extractPersonBazi(params.person2);

  // 五行关系分析
  const wuxingAnalysis = analyzeWuxing(p1, p2);

  // 地支关系分析
  const dizhiAnalysis = analyzeDizhi(p1, p2);

  // 五行平衡分析
  const fiveElementBalance = analyzeFiveElementBalance(p1, p2);

  // 各方面评分
  const aspects = calculateAspects(p1, p2, wuxingAnalysis, dizhiAnalysis);

  // 综合评分
  const overallScore = Math.round(
    aspects.love.score * 0.35 +
      aspects.career.score * 0.2 +
      aspects.family.score * 0.2 +
      aspects.communication.score * 0.25,
  );

  const overallLevel =
    overallScore >= 85
      ? '天作之合'
      : overallScore >= 70
        ? '良缘佳配'
        : overallScore >= 55
          ? '有缘有分'
          : overallScore >= 40
            ? '需要磨合'
            : '缘分较浅';

  const overallComment = generateOverallComment(overallScore, wuxingAnalysis, dizhiAnalysis);

  const suggestions = generateSuggestions(p1, p2, wuxingAnalysis, dizhiAnalysis, aspects);

  return {
    person1: p1,
    person2: p2,
    overallScore,
    overallLevel,
    overallComment,
    wuxingAnalysis,
    dizhiAnalysis,
    fiveElementBalance,
    aspects,
    suggestions,
  };
}

function extractPersonBazi(params: {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
}): PersonBazi {
  const [year, month, day] = params.birthDate.split('-').map(Number);
  const hour = parseTimeToHour(params.birthTime);

  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const yearGan = eightChar.getYearGan();
  const yearZhi = eightChar.getYearZhi();
  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();
  const hourGan = eightChar.getTimeGan();
  const hourZhi = eightChar.getTimeZhi();

  const fiveElements: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi].forEach((gz) => {
    const wx = GAN_WUXING[gz] || ZHI_WUXING[gz];
    if (wx) fiveElements[wx]++;
  });

  return {
    name: params.name || '未命名',
    birthDate: params.birthDate,
    birthTime: params.birthTime,
    gender: params.gender,
    yearPillar: yearGan + yearZhi,
    monthPillar: monthGan + monthZhi,
    dayPillar: dayGan + dayZhi,
    hourPillar: hourGan + hourZhi,
    dayMaster: dayGan,
    dayMasterElement: GAN_WUXING[dayGan],
    shengxiao: SHENGXIAO[TIANGAN.indexOf(yearGan) % 12],
    fiveElements,
  };
}

function parseTimeToHour(timeStr: string): number {
  const shiChen: Record<string, number> = {
    子: 0,
    丑: 2,
    寅: 4,
    卯: 6,
    辰: 8,
    巳: 10,
    午: 12,
    未: 14,
    申: 16,
    酉: 18,
    戌: 20,
    亥: 22,
  };
  for (const [key, val] of Object.entries(shiChen)) {
    if (timeStr.includes(key)) return val + 1;
  }
  const match = timeStr.match(/(\d{1,2}):?(\d{0,2})/);
  if (match) return parseInt(match[1]);
  return 12;
}

function analyzeWuxing(p1: PersonBazi, p2: PersonBazi): HehunResult['wuxingAnalysis'] {
  const e1 = p1.dayMasterElement;
  const e2 = p2.dayMasterElement;

  let relationship = '';
  let comment = '';

  if (e1 === e2) {
    relationship = '相似';
    comment = `你们两人的核心特质都偏向${e1}，性格相似，容易理解对方，但也可能缺少互补。`;
  } else if (WUXING_SHENG[e1] === e2) {
    relationship = '互补（付出型）';
    comment = `${p1.name}天生愿意为${p2.name}付出，在这段关系中${p1.name}更主动一些。`;
  } else if (WUXING_SHENG[e2] === e1) {
    relationship = '互补（付出型）';
    comment = `${p2.name}天生愿意为${p1.name}付出，${p2.name}会更照顾对方。`;
  } else if (WUXING_KE[e1] === e2) {
    relationship = '互补（强势型）';
    comment = `${p1.name}在这段关系中更强势一些，${p2.name}需要适当退让，互相包容。`;
  } else if (WUXING_KE[e2] === e1) {
    relationship = '互补（强势型）';
    comment = `${p2.name}在这段关系中更强势一些，${p1.name}需要适当退让，互相包容。`;
  }

  return { person1Element: e1, person2Element: e2, relationship, comment };
}

function analyzeDizhi(p1: PersonBazi, p2: PersonBazi): HehunResult['dizhiAnalysis'] {
  const details: string[] = [];
  let sixHarmony = false;
  let threeHarmony = false;
  let sixClash = false;

  const zhi1 = p1.yearPillar.slice(1);
  const zhi2 = p2.yearPillar.slice(1);

  // 检查六合
  if (DIZHI六合[zhi1] === zhi2) {
    sixHarmony = true;
    details.push(`你们的属相天生合拍，有天然的吸引力，感情融洽。`);
  }

  // 检查六冲
  if (DIZHI六冲[zhi1] === zhi2) {
    sixClash = true;
    details.push(`你们的属相有些对冲，性格差异较大，需要更多磨合。`);
  }

  // 检查三合
  for (const [key, values] of Object.entries(DIZHI三合)) {
    if (values.includes(zhi1) && values.includes(zhi2)) {
      threeHarmony = true;
      details.push(`你们的属相属于同组（${key}），有共同的目标和理念。`);
    }
  }

  if (details.length === 0) {
    details.push('你们的属相没有特殊的缘分关系，需要通过后天努力增进感情。');
  }

  return { sixHarmony, threeHarmony, sixClash, details };
}

function analyzeFiveElementBalance(p1: PersonBazi, p2: PersonBazi) {
  const combined: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  Object.keys(combined).forEach((el) => {
    combined[el] = (p1.fiveElements[el] || 0) + (p2.fiveElements[el] || 0);
  });

  const values = Object.values(combined);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const balance = max - min <= 2 ? '平衡' : '不平衡';

  let complement = '';
  if (balance === '平衡') {
    complement = '两人五行互补良好，组合后五行较为均衡。';
  } else {
    const missing = Object.entries(combined)
      .filter(([, v]) => v === min)
      .map(([k]) => k);
    complement = `你们组合后${missing.join('、')}方面的能量偏弱，建议在日常生活中适当补充，比如穿对应颜色的衣服、吃对应的食物。`;
  }

  return { person1: p1.fiveElements, person2: p2.fiveElements, complement };
}

function calculateAspects(
  p1: PersonBazi,
  p2: PersonBazi,
  wuxing: HehunResult['wuxingAnalysis'],
  dizhi: HehunResult['dizhiAnalysis'],
): HehunResult['aspects'] {
  let loveBase = 65;
  let careerBase = 65;
  let familyBase = 65;
  let commBase = 65;

  // 五行关系影响
  if (wuxing.relationship.includes('相生')) loveBase += 15;
  else if (wuxing.relationship === '比和') loveBase += 5;
  else if (wuxing.relationship.includes('相克')) loveBase -= 10;

  // 地支关系影响
  if (dizhi.sixHarmony) {
    loveBase += 15;
    familyBase += 10;
  }
  if (dizhi.threeHarmony) {
    careerBase += 15;
  }
  if (dizhi.sixClash) {
    loveBase -= 15;
    commBase -= 10;
  }

  // 五行平衡影响
  const allElements = ['木', '火', '土', '金', '水'];
  const p1Missing = allElements.filter((e) => !p1.fiveElements[e]).length;
  const p2Missing = allElements.filter((e) => !p2.fiveElements[e]).length;
  if (p1Missing + p2Missing <= 2) {
    familyBase += 10;
    careerBase += 5;
  }

  const clamp = (n: number) => Math.min(100, Math.max(20, n));

  return {
    love: { score: clamp(loveBase), comment: generateLoveComment(clamp(loveBase), wuxing, dizhi) },
    career: { score: clamp(careerBase), comment: generateCareerComment(clamp(careerBase), wuxing) },
    family: { score: clamp(familyBase), comment: generateFamilyComment(clamp(familyBase), dizhi) },
    communication: {
      score: clamp(commBase),
      comment: generateCommComment(clamp(commBase), wuxing, dizhi),
    },
  };
}

function generateLoveComment(
  score: number,
  wuxing: HehunResult['wuxingAnalysis'],
  dizhi: HehunResult['dizhiAnalysis'],
): string {
  if (score >= 80)
    return `两人感情运势极佳，${wuxing.comment}${dizhi.sixHarmony ? '天生合拍更是锦上添花。' : ''}建议珍惜彼此，共同经营这段感情。`;
  if (score >= 60)
    return `两人感情基础不错，${wuxing.comment}虽然${dizhi.sixClash ? '性格有些对冲' : '偶有小摩擦'}，但只要用心沟通，感情会越来越好。`;
  return `两人感情需要更多磨合，${wuxing.comment}建议多站在对方角度思考，用包容和理解化解分歧。`;
}

function generateCareerComment(score: number, wuxing: HehunResult['wuxingAnalysis']): string {
  if (score >= 75) return '两人在事业上能够互相支持，可以考虑共同创业或在相关领域发展。';
  if (score >= 55) return '两人事业方向可以不同，但能够互相理解和支持，是彼此的坚强后盾。';
  return '两人事业观念有差异，建议各自发展，互相尊重对方的职业选择。';
}

function generateFamilyComment(score: number, dizhi: HehunResult['dizhiAnalysis']): string {
  if (score >= 75) return '两人家庭观念一致，能够营造和谐的家庭氛围，与双方父母关系融洽。';
  if (score >= 55) return '两人对家庭的期望基本一致，偶有分歧但能够协商解决。';
  return '两人家庭观念有差异，建议在婚前充分沟通家庭分工和生活规划。';
}

function generateCommComment(
  score: number,
  wuxing: HehunResult['wuxingAnalysis'],
  dizhi: HehunResult['dizhiAnalysis'],
): string {
  if (score >= 75) return '两人沟通顺畅，能够坦诚交流，是彼此的知心伴侣。';
  if (score >= 55) return '两人沟通基本顺畅，但需要注意表达方式，避免因直率而伤害对方。';
  return '两人沟通方式差异较大，建议学习有效的沟通技巧，多倾听对方的想法。';
}

function generateOverallComment(
  score: number,
  wuxing: HehunResult['wuxingAnalysis'],
  dizhi: HehunResult['dizhiAnalysis'],
): string {
  const parts: string[] = [];
  parts.push(`${wuxing.comment}`);
  if (dizhi.details.length > 0) parts.push(dizhi.details[0]);
  if (score >= 80) parts.push('总体而言，两人是难得的佳配，建议把握缘分，共同创造美好未来。');
  else if (score >= 60) parts.push('两人有不错的缘分基础，通过共同努力，可以建立起幸福的家庭。');
  else parts.push('两人需要更多的时间和努力来磨合，但只要真心相爱，终能克服困难。');
  return parts.join('');
}

function generateSuggestions(
  p1: PersonBazi,
  p2: PersonBazi,
  wuxing: HehunResult['wuxingAnalysis'],
  dizhi: HehunResult['dizhiAnalysis'],
  aspects: HehunResult['aspects'],
): string[] {
  const suggestions: string[] = [];

  if (wuxing.relationship.includes('强势型')) {
    suggestions.push(
      `两人性格都比较强势，建议${p1.name}多佩戴${wuxing.person1Element === '金' ? '木质饰品' : '金属饰品'}来柔化气场。`,
    );
  }
  if (dizhi.sixClash) {
    suggestions.push('两人性格差异较大，建议多参加共同活动，增进了解和默契。');
  }
  if (aspects.communication.score < 60) {
    suggestions.push('沟通是感情的基石，建议每天抽出时间真诚交流彼此的想法和感受。');
  }
  if (aspects.love.score < 60) {
    suggestions.push('感情需要经营，建议定期安排约会，保持恋爱的新鲜感。');
  }
  suggestions.push('互相尊重对方的个人空间和兴趣爱好，是长久相处的关键。');
  suggestions.push('遇到分歧时，先冷静思考，再理性沟通，避免冲动行事。');

  return suggestions;
}
