// 星盘（西方占星）引擎 - 完整版
const ZODIAC_SIGNS = [
  {
    name: '白羊座',
    symbol: '♈',
    element: '火',
    dates: '3.21-4.19',
    ruling: '火星',
    quality: '开创',
    polarity: '阳性',
  },
  {
    name: '金牛座',
    symbol: '♉',
    element: '土',
    dates: '4.20-5.20',
    ruling: '金星',
    quality: '固定',
    polarity: '阴性',
  },
  {
    name: '双子座',
    symbol: '♊',
    element: '风',
    dates: '5.21-6.21',
    ruling: '水星',
    quality: '变动',
    polarity: '阳性',
  },
  {
    name: '巨蟹座',
    symbol: '♋',
    element: '水',
    dates: '6.22-7.22',
    ruling: '月亮',
    quality: '开创',
    polarity: '阴性',
  },
  {
    name: '狮子座',
    symbol: '♌',
    element: '火',
    dates: '7.23-8.22',
    ruling: '太阳',
    quality: '固定',
    polarity: '阳性',
  },
  {
    name: '处女座',
    symbol: '♍',
    element: '土',
    dates: '8.23-9.22',
    ruling: '水星',
    quality: '变动',
    polarity: '阴性',
  },
  {
    name: '天秤座',
    symbol: '♎',
    element: '风',
    dates: '9.23-10.23',
    ruling: '金星',
    quality: '开创',
    polarity: '阳性',
  },
  {
    name: '天蝎座',
    symbol: '♏',
    element: '水',
    dates: '10.24-11.22',
    ruling: '冥王星',
    quality: '固定',
    polarity: '阴性',
  },
  {
    name: '射手座',
    symbol: '♐',
    element: '火',
    dates: '11.23-12.21',
    ruling: '木星',
    quality: '变动',
    polarity: '阳性',
  },
  {
    name: '摩羯座',
    symbol: '♑',
    element: '土',
    dates: '12.22-1.19',
    ruling: '土星',
    quality: '开创',
    polarity: '阴性',
  },
  {
    name: '水瓶座',
    symbol: '♒',
    element: '风',
    dates: '1.20-2.18',
    ruling: '天王星',
    quality: '固定',
    polarity: '阳性',
  },
  {
    name: '双鱼座',
    symbol: '♓',
    element: '水',
    dates: '2.19-3.20',
    ruling: '海王星',
    quality: '变动',
    polarity: '阴性',
  },
];
const PLANETS = [
  { name: '太阳', symbol: '☉', meaning: '核心自我、意志力、生命力', house: '自我' },
  { name: '月亮', symbol: '☽', meaning: '情感、内在需求、潜意识', house: '情感' },
  { name: '水星', symbol: '☿', meaning: '思维、沟通、学习能力', house: '心智' },
  { name: '金星', symbol: '♀', meaning: '爱情、价值观、审美', house: '关系' },
  { name: '火星', symbol: '♂', meaning: '行动力、欲望、竞争', house: '行动' },
  { name: '木星', symbol: '♃', meaning: '幸运、扩张、哲学', house: '成长' },
  { name: '土星', symbol: '♄', meaning: '责任、限制、纪律', house: '业力' },
  { name: '天王星', symbol: '♅', meaning: '创新、变革、独立', house: '变革' },
  { name: '海王星', symbol: '♆', meaning: '直觉、梦想、灵性', house: '灵性' },
  { name: '冥王星', symbol: '♇', meaning: '转化、深层力量、重生', house: '转化' },
];
const HOUSE_MEANINGS = [
  {
    name: '第一宫（命宫）',
    meaning: '自我、个性、外在表现',
    keywords: ['性格', '外表', '第一印象'],
  },
  {
    name: '第二宫（财帛宫）',
    meaning: '财富、价值观、物质资源',
    keywords: ['金钱', '价值', '拥有'],
  },
  {
    name: '第三宫（兄弟宫）',
    meaning: '沟通、学习、短途旅行',
    keywords: ['交流', '学习', '兄弟姐妹'],
  },
  { name: '第四宫（田宅宫）', meaning: '家庭、根基、内心安全', keywords: ['家庭', '房产', '内心'] },
  { name: '第五宫（子女宫）', meaning: '创造、娱乐、恋爱', keywords: ['创意', '恋爱', '子女'] },
  { name: '第六宫（奴仆宫）', meaning: '健康、工作、日常事务', keywords: ['健康', '工作', '服务'] },
  { name: '第七宫（夫妻宫）', meaning: '婚姻、合作、公开关系', keywords: ['婚姻', '合作', '对宫'] },
  {
    name: '第八宫（疾厄宫）',
    meaning: '共享资源、转化、深度连接',
    keywords: ['投资', '心理', '亲密'],
  },
  { name: '第九宫（迁移宫）', meaning: '哲学、高等教育、远行', keywords: ['信仰', '留学', '探索'] },
  { name: '第十宫（官禄宫）', meaning: '事业、社会地位、成就', keywords: ['事业', '名声', '目标'] },
  { name: '第十一宫（福德宫）', meaning: '社群、理想、朋友', keywords: ['朋友', '团体', '愿望'] },
  {
    name: '第十二宫（玄秘宫）',
    meaning: '潜意识、灵性、隐藏面',
    keywords: ['潜意识', '灵性', '幕后'],
  },
];
const ASPECTS = [
  {
    name: '合相',
    symbol: '☌',
    angle: 0,
    nature: '强烈融合',
    description: '两颗行星能量完全融合，影响力最强',
  },
  {
    name: '六分相',
    symbol: '⚺',
    angle: 60,
    nature: '和谐',
    description: '带来机会和流畅，促进合作',
  },
  {
    name: '四分相',
    symbol: 'Quad',
    angle: 90,
    nature: '紧张',
    description: '带来挑战和成长动力，需要整合',
  },
  {
    name: '三合相',
    symbol: '△',
    angle: 120,
    nature: '和谐',
    description: '带来天赋和顺畅，自然流动',
  },
  {
    name: '对冲相',
    symbol: '☍',
    angle: 180,
    nature: '对立',
    description: '带来张力和平衡需求，需要调和',
  },
];
export function calculateXingpan(params) {
  const [year, month, day] = params.birthDate.split('-').map(Number);
  // 太阳星座
  const sunSignIdx = getSunSignIndex(month, day);
  const sunSign = ZODIAC_SIGNS[sunSignIdx];
  // 月亮星座（简化计算）
  const moonSignIdx = (sunSignIdx + Math.floor((year + month + day) % 12)) % 12;
  const moonSign = ZODIAC_SIGNS[moonSignIdx];
  // 上升星座
  const hour = parseHour(params.birthTime);
  const risingIdx = (sunSignIdx + Math.floor(hour / 2)) % 12;
  const risingSign = ZODIAC_SIGNS[risingIdx];
  // 行星分布
  const planets = PLANETS.map((planet, i) => {
    const signIdx = (sunSignIdx + i * 3) % 12;
    const sign = ZODIAC_SIGNS[signIdx];
    const house = (i % 12) + 1;
    const houseData = HOUSE_MEANINGS[house - 1];
    return {
      name: planet.name,
      symbol: planet.symbol,
      sign: sign.name,
      signSymbol: sign.symbol,
      element: sign.element,
      house,
      houseName: houseData.name,
      retrograde: Math.random() > 0.8, // 简化：20%概率逆行
      meaning: planet.meaning,
    };
  });
  // 相位分析
  const aspects = generateAspects(planets);
  // 元素平衡
  const elementBalance = { 火: 0, 土: 0, 风: 0, 水: 0 };
  planets.forEach((p) => {
    elementBalance[p.element]++;
  });
  // 类型平衡
  const qualityBalance = { 开创: 0, 固定: 0, 变动: 0 };
  planets.forEach((p) => {
    const sign = ZODIAC_SIGNS.find((s) => s.name === p.sign);
    if (sign) qualityBalance[sign.quality]++;
  });
  // 宫位分布
  const houses = HOUSE_MEANINGS.map((house, i) => ({
    name: house.name,
    meaning: house.meaning,
    planet: planets.find((p) => p.house === i + 1)?.name,
  }));
  const briefComment = generateXingpanComment(sunSign, moonSign, risingSign, elementBalance);
  return {
    sunSign,
    moonSign,
    risingSign,
    planets,
    aspects,
    elementBalance,
    qualityBalance,
    houses,
    briefComment,
  };
}
function getSunSignIndex(month, day) {
  const dates = [
    [1, 20],
    [2, 19],
    [3, 21],
    [4, 20],
    [5, 21],
    [6, 22],
    [7, 23],
    [8, 23],
    [9, 23],
    [10, 24],
    [11, 23],
    [12, 22],
  ];
  for (let i = 0; i < 12; i++) {
    const [m, d] = dates[i];
    const nextM = dates[(i + 1) % 12][0];
    const nextD = dates[(i + 1) % 12][1];
    if (month === m && day >= d) return i;
    if (month === nextM && day < nextD) return i;
  }
  return 0;
}
function parseHour(timeStr) {
  const match = timeStr.match(/(\d{1,2})/);
  return match ? parseInt(match[1], 10) : 12;
}
function generateAspects(planets) {
  const aspects = [];
  const majorAspects = [0, 60, 90, 120, 180];
  for (let i = 0; i < Math.min(planets.length, 7); i++) {
    for (let j = i + 1; j < Math.min(planets.length, 7); j++) {
      if (Math.random() > 0.6) {
        // 40%概率形成相位
        const aspectIdx = Math.floor(Math.random() * majorAspects.length);
        const aspect = ASPECTS[aspectIdx];
        aspects.push({
          planet1: planets[i].name,
          planet2: planets[j].name,
          type: aspect.name,
          symbol: aspect.symbol,
          nature: aspect.nature,
          description: aspect.description,
        });
      }
    }
  }
  return aspects;
}
function generateXingpanComment(sun, moon, rising, elements) {
  let comment = `你的太阳星座是${sun.name}（${sun.element}象），代表你的核心性格和生命力。`;
  comment += `月亮星座是${moon.name}（${moon.element}象），反映你的情感和内在需求。`;
  comment += `上升星座是${rising.name}（${rising.element}象），影响你的外在表现和第一印象。`;
  // 元素分析
  const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0];
  if (dominantElement[1] >= 3) {
    comment += ` 你的星盘中${dominantElement[0]}象能量较强，这意味着你在${getElementDescription(dominantElement[0])}方面有天赋。`;
  }
  return comment;
}
function getElementDescription(element) {
  const descriptions = {
    火: '行动力、热情和创造力',
    土: '稳定性、实际和耐心',
    风: '沟通、思维和社交',
    水: '情感、直觉和同理心',
  };
  return descriptions[element] || '';
}
