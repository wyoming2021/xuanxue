import iztro from 'iztro';

export interface ZiweiStar {
  name: string;
  brightness?: string;
  type: 'major' | 'minor' | 'adjective';
}

export interface ZiweiPalace {
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  isBodyPalace: boolean;
  majorStars: ZiweiStar[];
  minorStars: ZiweiStar[];
  adjectiveStars: ZiweiStar[];
  decadal?: { range: number[]; heavenlyStem: string; earthlyBranch: string };
}

export interface YearlyFortune {
  year: number;
  age: number;
  heavenlyStem: string;
  earthlyBranch: string;
  mutagen: string[];
  palaceName: string;
  comment: string;
}

export interface ZiweiResult {
  chineseDate: string;
  lunarDate: string;
  solarDate: string;
  zodiac: string;
  sign: string;
  fiveElementsClass: string;
  soul: string;
  body: string;
  gender: string;
  palaces: ZiweiPalace[];
  // 大限信息
  decadal?: {
    palaceName: string;
    yearRange: number[];
    heavenlyStem: string;
    earthlyBranch: string;
    mutagen: string[];
  };
  // 流年信息
  yearly?: {
    heavenlyStem: string;
    earthlyBranch: string;
    mutagen: string[];
    comment: string;
  };
  // 小限信息
  ageInfo?: {
    nominalAge: number;
    heavenlyStem: string;
    earthlyBranch: string;
    mutagen: string[];
  };
  briefComment: string;
}

export function calculateZiwei(params: {
  birthDate: string;
  birthTime: number;
  gender: 'male' | 'female';
}): ZiweiResult {
  const { birthDate, birthTime, gender } = params;

  const result = iztro.astro.bySolar(
    birthDate,
    birthTime,
    gender === 'male' ? 'male' : 'female',
    false,
  ) as any;

  // 解析宫位
  const palaces: ZiweiPalace[] = (result.palaces || []).map((p: any) => ({
    name: p.name,
    heavenlyStem: p.heavenlyStem || '',
    earthlyBranch: p.earthlyBranch || '',
    isBodyPalace: p.isBodyPalace || false,
    majorStars: (p.majorStars || []).map((s: any) => ({
      name: s.name,
      brightness: s.brightness || '',
      type: 'major' as const,
    })),
    minorStars: (p.minorStars || []).map((s: any) => ({
      name: s.name,
      brightness: s.brightness || '',
      type: 'minor' as const,
    })),
    adjectiveStars: (p.adjectiveStars || []).map((s: any) => ({
      name: s.name,
      type: 'adjective' as const,
    })),
    decadal: p.decadal,
  }));

  // 获取基本信息
  const chineseDate = result.chineseDate || '';
  const lunarDate = result.lunarDate || '';
  const solarDate = result.solarDate || birthDate;
  const zodiac = result.zodiac || '';
  const sign = result.sign || '';
  const fiveElementsClass = result.fiveElementsClass || '';
  const soul = result.soul || '';
  const body = result.body || '';

  // 获取大限信息
  let decadal: ZiweiResult['decadal'] = undefined;
  try {
    const decadalList = result.decadalList();
    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(birthDate.split('-')[0], 10);
    const currentAge = currentYear - birthYear;

    const currentDecadal = decadalList.find(
      (d: any) => currentAge >= d.ageRange[0] && currentAge <= d.ageRange[1],
    );

    if (currentDecadal) {
      decadal = {
        palaceName: currentDecadal.palaceName,
        yearRange: currentDecadal.yearRange,
        heavenlyStem: currentDecadal.heavenlyStem,
        earthlyBranch: currentDecadal.earthlyBranch,
        mutagen: currentDecadal.mutagen || [],
      };
    }
  } catch (e) {
    // 忽略错误
  }

  // 获取流年信息
  let yearly: ZiweiResult['yearly'] = undefined;
  let ageInfo: ZiweiResult['ageInfo'] = undefined;
  try {
    const currentYear = new Date().getFullYear();
    const horoscope = result.horoscope(`${currentYear}-01-01`, 12);

    if (horoscope.yearly) {
      const yearlyComment = generateYearlyComment(
        horoscope.yearly.heavenlyStem,
        horoscope.yearly.earthlyBranch,
        horoscope.yearly.mutagen || [],
      );
      yearly = {
        heavenlyStem: horoscope.yearly.heavenlyStem,
        earthlyBranch: horoscope.yearly.earthlyBranch,
        mutagen: horoscope.yearly.mutagen || [],
        comment: yearlyComment,
      };
    }

    if (horoscope.age) {
      ageInfo = {
        nominalAge: horoscope.age.nominalAge,
        heavenlyStem: horoscope.age.heavenlyStem,
        earthlyBranch: horoscope.age.earthlyBranch,
        mutagen: horoscope.age.mutagen || [],
      };
    }
  } catch (e) {
    // 忽略错误
  }

  // 生成详细简评
  const briefComment = generateDetailedComment(
    palaces,
    soul,
    body,
    fiveElementsClass,
    decadal,
    yearly,
  );

  return {
    chineseDate,
    lunarDate,
    solarDate,
    zodiac,
    sign,
    fiveElementsClass,
    soul,
    body,
    gender: gender === 'male' ? '男' : '女',
    palaces,
    decadal,
    yearly,
    ageInfo,
    briefComment,
  };
}

function generateYearlyComment(
  heavenlyStem: string,
  earthlyBranch: string,
  mutagen: string[],
): string {
  const stemComments: Record<string, string> = {
    甲: '今年像大树一样向上生长，适合开拓新领域。',
    乙: '今年像藤蔓一样灵活变通，适合合作共赢。',
    丙: '今年像太阳一样光芒四射，适合展现自己。',
    丁: '今年像烛光一样温暖细腻，适合文艺创作。',
    戊: '今年像大地一样厚实稳重，适合积累财富。',
    己: '今年像沃土一样滋养万物，适合服务他人。',
    庚: '今年像刀剑一样锋利果断，适合做重大决定。',
    辛: '今年像珠宝一样精致闪耀，适合精细工作。',
    壬: '今年像江河一样奔涌向前，适合灵活应变。',
    癸: '今年像雨露一样润物无声，适合学习充电。',
  };

  const branchComments: Record<string, string> = {
    子: '今年适合动脑思考，灵活应对变化。',
    丑: '今年适合稳扎稳打，慢慢积累。',
    寅: '今年充满活力，适合大胆尝试。',
    卯: '今年适合柔和处事，以退为进。',
    辰: '今年变化较多，需要灵活应对。',
    巳: '今年适合社交展示，表现自己。',
    午: '今年适合公开发声，扩大影响。',
    未: '今年适合收获成果，总结经验。',
    申: '今年适合做重大改变，果断行动。',
    酉: '今年适合精益求精，打磨细节。',
    戌: '今年适合稳固根基，打好基础。',
    亥: '今年适合学习进修，提升自己。',
  };

  let comment = stemComments[heavenlyStem] || '';
  comment += ' ' + (branchComments[earthlyBranch] || '');

  if (mutagen.length > 0) {
    const mutagenStr = mutagen.join('、');
    comment += ` 今年有${mutagenStr}等变化，建议多关注相关方面。`;
  }

  return comment;
}

function generateDetailedComment(
  palaces: ZiweiPalace[],
  soul: string,
  body: string,
  fiveElementsClass: string,
  decadal?: ZiweiResult['decadal'],
  yearly?: ZiweiResult['yearly'],
): string {
  const lifePalace = palaces.find((p) => p.name === '命宫');
  const majorStarNames = lifePalace?.majorStars.map((s) => s.name) || [];

  let comment = `你的命盘是${fiveElementsClass}，核心星是${soul}，辅助星是${body}。`;

  if (majorStarNames.length === 0) {
    comment += '你的命宫没有主星，需要参考对面宫位的星来综合判断。';
  } else {
    const starComments: Record<string, string> = {
      紫微: '你是天生的领导者，有主见、有魄力，适合带领团队。',
      天机: '你脑子很聪明，擅长出谋划策，适合做策划或咨询。',
      太阳: '你性格热情开朗，人缘好，适合做需要抛头露面的工作。',
      武曲: '你做事果断，财运不错，适合从事金融、商业。',
      天同: '你性格温和善良，人缘好，福气不错。',
      廉贞: '你个性鲜明，多才多艺，适合做创意类工作。',
      天府: '你稳重大方，存钱能力强，适合做管理或投资。',
      太阴: '你心思细腻，有文艺天赋，适合做文化、艺术相关工作。',
      贪狼: '你多才多艺，人缘桃花都不错，适合做社交、演艺类。',
      巨门: '你口才好，分析能力强，适合做销售、律师、教师。',
      天相: '你为人正直公正，协调能力强，适合做人事、行政。',
      天梁: '你有正义感，容易遇到贵人，适合做公益、医疗。',
      七杀: '你敢闯敢拼，不怕困难，适合创业或做有挑战的工作。',
      破军: '你勇于打破常规，适合做创新、改革类的事情。',
    };

    const firstStar = majorStarNames[0];
    comment += starComments[firstStar] || `你命宫的主星是${firstStar}。`;
  }

  // 添加大限信息
  if (decadal) {
    comment += ` 你目前的十年大运在${decadal.palaceName}（${decadal.yearRange[0]}-${decadal.yearRange[1]}岁），这段时间的重点是${decadal.palaceName.replace('宫', '')}方面。`;
  }

  // 添加流年信息
  if (yearly) {
    comment += ` ${new Date().getFullYear()}年${yearly.comment}`;
  }

  return comment;
}
