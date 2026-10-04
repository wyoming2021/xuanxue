import { Solar } from 'lunar-javascript';
const SHI_CHEN = [
  { name: '子时', startHour: 23, endHour: 1 },
  { name: '丑时', startHour: 1, endHour: 3 },
  { name: '寅时', startHour: 3, endHour: 5 },
  { name: '卯时', startHour: 5, endHour: 7 },
  { name: '辰时', startHour: 7, endHour: 9 },
  { name: '巳时', startHour: 9, endHour: 11 },
  { name: '午时', startHour: 11, endHour: 13 },
  { name: '未时', startHour: 13, endHour: 15 },
  { name: '申时', startHour: 15, endHour: 17 },
  { name: '酉时', startHour: 17, endHour: 19 },
  { name: '戌时', startHour: 19, endHour: 21 },
  { name: '亥时', startHour: 21, endHour: 23 },
];
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const GAN_WUXING = {
  甲: 1,
  乙: 1,
  丙: 2,
  丁: 2,
  戊: 3,
  己: 3,
  庚: 4,
  辛: 4,
  壬: 5,
  癸: 5,
};
const ZHI_WUXING = {
  子: 5,
  丑: 3,
  寅: 1,
  卯: 1,
  辰: 3,
  巳: 2,
  午: 2,
  未: 3,
  申: 4,
  酉: 4,
  戌: 3,
  亥: 5,
};
const WUXING_NAMES = { 1: '木', 2: '火', 3: '土', 4: '金', 5: '水' };
const WUXING_ENGLISH = {
  1: 'wood',
  2: 'fire',
  3: 'earth',
  4: 'metal',
  5: 'water',
};
// 十神关系
const SHISHEN = {
  甲: {
    甲: '比肩',
    乙: '劫财',
    丙: '食神',
    丁: '伤官',
    戊: '偏财',
    己: '正财',
    庚: '七杀',
    辛: '正官',
    壬: '偏印',
    癸: '正印',
  },
  乙: {
    甲: '劫财',
    乙: '比肩',
    丙: '伤官',
    丁: '食神',
    戊: '正财',
    己: '偏财',
    庚: '正官',
    辛: '七杀',
    壬: '正印',
    癸: '偏印',
  },
  丙: {
    甲: '偏印',
    乙: '正印',
    丙: '比肩',
    丁: '劫财',
    戊: '食神',
    己: '伤官',
    庚: '偏财',
    辛: '正财',
    壬: '七杀',
    癸: '正官',
  },
  丁: {
    甲: '正印',
    乙: '偏印',
    丙: '劫财',
    丁: '比肩',
    戊: '伤官',
    己: '食神',
    庚: '正财',
    辛: '偏财',
    壬: '正官',
    癸: '七杀',
  },
  戊: {
    甲: '七杀',
    乙: '正官',
    丙: '偏印',
    丁: '正印',
    戊: '比肩',
    己: '劫财',
    庚: '食神',
    辛: '伤官',
    壬: '偏财',
    癸: '正财',
  },
  己: {
    甲: '正官',
    乙: '七杀',
    丙: '正印',
    丁: '偏印',
    戊: '劫财',
    己: '比肩',
    庚: '伤官',
    辛: '食神',
    壬: '正财',
    癸: '偏财',
  },
  庚: {
    甲: '偏财',
    乙: '正财',
    丙: '七杀',
    丁: '正官',
    戊: '偏印',
    己: '正印',
    庚: '比肩',
    辛: '劫财',
    壬: '食神',
    癸: '伤官',
  },
  辛: {
    甲: '正财',
    乙: '偏财',
    丙: '正官',
    丁: '七杀',
    戊: '正印',
    己: '偏印',
    庚: '劫财',
    辛: '比肩',
    壬: '伤官',
    癸: '食神',
  },
  壬: {
    甲: '食神',
    乙: '伤官',
    丙: '偏财',
    丁: '正财',
    戊: '七杀',
    己: '正官',
    庚: '偏印',
    辛: '正印',
    壬: '比肩',
    癸: '劫财',
  },
  癸: {
    甲: '伤官',
    乙: '食神',
    丙: '正财',
    丁: '偏财',
    戊: '正官',
    己: '七杀',
    庚: '正印',
    辛: '偏印',
    壬: '劫财',
    癸: '比肩',
  },
};
export function timeToHourIndex(timeStr) {
  const shichen = SHI_CHEN.find((s) => timeStr.includes(s.name));
  if (shichen) {
    const midHour = shichen.startHour + 1;
    return midHour >= 24 ? 0 : midHour;
  }
  const timeMatch = timeStr.match(/(\d{1,2}):?(\d{0,2})/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1], 10);
    if (hour >= 0 && hour <= 23) return hour;
  }
  return 12;
}
export function calculateBazi(params) {
  const [year, month, day] = params.birthDate.split('-').map(Number);
  const hour = timeToHourIndex(params.birthTime);
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
  // 五行统计
  const allGanZhi = [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi];
  const fiveElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const elementMap = {
    1: 'wood',
    2: 'fire',
    3: 'earth',
    4: 'metal',
    5: 'water',
  };
  allGanZhi.forEach((gz) => {
    const wx = GAN_WUXING[gz] || ZHI_WUXING[gz] || 0;
    if (wx > 0) fiveElements[elementMap[wx]]++;
  });
  // 纳音
  const nayin = eightChar.getYearNaYin() + ' ' + eightChar.getMonthNaYin();
  // 生肖
  const shengxiao = SHENGXIAO[TIANGAN.indexOf(yearGan) % 12];
  // 计算大运
  const dayun = calculateDayun(yearGan, monthGan, monthZhi, params.gender, year);
  // 计算流年（当前年份）
  const currentYear = new Date().getFullYear();
  const liunian = calculateLiunian(currentYear);
  // 计算当前大运
  const age = currentYear - year;
  const currentDayun = dayun.find((d) => age >= d.startAge && age <= d.endAge) || dayun[0];
  // 十神分析
  const shishen = {
    yearShishen: SHISHEN[dayGan]?.[yearGan] || '',
    monthShishen: SHISHEN[dayGan]?.[monthGan] || '',
    dayShishen: '日主',
    hourShishen: SHISHEN[dayGan]?.[hourGan] || '',
  };
  // 生成简评
  const dayMasterWx = GAN_WUXING[dayGan];
  const dayMasterElement = elementMap[dayMasterWx];
  const comments = {
    wood: '你天生像一棵树，心地善良，有同情心，喜欢帮助别人。你适合做需要耐心和成长的事情，比如教育、创业。',
    fire: '你性格热情开朗，脑子转得快，天生有领导气质，适合做需要表现力和感染力的工作。',
    earth: '你做事踏实稳重，为人靠谱，说到做到。适合做需要长期积累的事业，比如房产、管理。',
    metal: '你做事果断有原则，讲义气，有正义感。适合做需要决断力的工作，比如法律、金融。',
    water: '你聪明灵活，善于随机应变，直觉很准。适合做需要创意和变通的工作，比如策划、咨询。',
  };
  return {
    yearPillar: { gan: yearGan, zhi: yearZhi },
    monthPillar: { gan: monthGan, zhi: monthZhi },
    dayPillar: { gan: dayGan, zhi: dayZhi },
    hourPillar: { gan: hourGan, zhi: hourZhi },
    fiveElements,
    hiddenStems: [],
    tenGods: [],
    nayin,
    briefComment: comments[dayMasterElement] || '你的命格比较特别，需要结合更多信息来分析。',
    // 扩展字段
    shengxiao,
    shishen,
    dayun,
    currentDayun,
    liunian,
    age,
    gender: params.gender,
  };
}
// 计算大运
function calculateDayun(yearGan, monthGan, monthZhi, gender, birthYear) {
  const yearIdx = TIANGAN.indexOf(yearGan);
  const monthIdx = TIANGAN.indexOf(monthGan);
  // 阳年男命或阴年女命，大运顺行
  // 阴年男命或阳年女命，大运逆行
  const isYangYear = yearIdx % 2 === 0;
  const isForward = (isYangYear && gender === 'male') || (!isYangYear && gender === 'female');
  const dayun = [];
  let currentMonthIdx = TIANGAN.indexOf(monthGan);
  let currentZhiIdx = DIZHI.indexOf(monthZhi);
  // 起运年龄（简化计算：3岁起运）
  const startAge = 3;
  for (let i = 0; i < 8; i++) {
    if (isForward) {
      currentMonthIdx = (currentMonthIdx + 1) % 10;
      currentZhiIdx = (currentZhiIdx + 1) % 12;
    } else {
      currentMonthIdx = (currentMonthIdx - 1 + 10) % 10;
      currentZhiIdx = (currentZhiIdx - 1 + 12) % 12;
    }
    const gan = TIANGAN[currentMonthIdx];
    const zhi = DIZHI[currentZhiIdx];
    const startYear = birthYear + startAge + i * 10;
    const endYear = startYear + 9;
    const wx = GAN_WUXING[gan] || GAN_WUXING[zhi] || 0;
    dayun.push({
      gan,
      zhi,
      ganZhi: gan + zhi,
      element: WUXING_NAMES[wx] || '未知',
      startAge: startAge + i * 10,
      endAge: startAge + i * 10 + 9,
      startYear,
      endYear,
      comment: getDayunComment(gan, zhi, wx),
    });
  }
  return dayun;
}
// 计算流年
function calculateLiunian(year) {
  const ganIdx = (year - 4) % 10;
  const zhiIdx = (year - 4) % 12;
  const gan = TIANGAN[ganIdx < 0 ? ganIdx + 10 : ganIdx];
  const zhi = DIZHI[zhiIdx < 0 ? zhiIdx + 12 : zhiIdx];
  const wx = GAN_WUXING[gan] || GAN_WUXING[zhi] || 0;
  return {
    year,
    gan,
    zhi,
    ganZhi: gan + zhi,
    element: WUXING_NAMES[wx] || '未知',
    shengxiao: SHENGXIAO[zhiIdx < 0 ? zhiIdx + 12 : zhiIdx],
    comment: getLiunianComment(gan, zhi, wx),
  };
}
// 大运解读
function getDayunComment(gan, zhi, wx) {
  const elementName = WUXING_NAMES[wx] || '';
  const comments = {
    木: '这段时期你像春天的树木一样向上生长，适合学习新技能、拓展事业、尝试新事物。',
    火: '这段时期你精力充沛、社交活跃，适合展示自己、参加活动、拓展人脉。',
    土: '这段时期适合稳定发展，攒钱置业、打基础，不适合冒大险。',
    金: '这段时期适合做重要决定，比如换工作、投资、处理合同等需要果断的事情。',
    水: '这段时期思维活跃，适合学习充电、出差旅行、灵活应对变化。',
  };
  return comments[elementName] || `${gan}${zhi}运，需要结合你的整体命局来看。`;
}
// 流年解读
function getLiunianComment(gan, zhi, wx) {
  const elementName = WUXING_NAMES[wx] || '';
  const ganComments = {
    甲: '今年像大树一样向上生长，适合开拓新领域、创业创新。',
    乙: '今年像藤蔓一样灵活变通，适合合作共赢、协调沟通。',
    丙: '今年像太阳一样光芒四射，适合展现自己、公开亮相。',
    丁: '今年像烛光一样温暖细腻，适合文艺创作、打磨精品。',
    戊: '今年像大地一样厚实稳重，适合积累财富、夯实基础。',
    己: '今年像沃土一样滋养万物，适合服务他人、默默付出。',
    庚: '今年像刀剑一样锋利果断，适合做重大决定、突破难关。',
    辛: '今年像珠宝一样精致闪耀，适合做精细的工作。',
    壬: '今年像江河一样奔涌向前，适合灵活应变、把握机会。',
    癸: '今年像雨露一样润物无声，适合学习充电、规划未来。',
  };
  return ganComments[gan] || `${gan}${zhi}年，五行属${elementName}，需要结合你的命局来分析。`;
}
