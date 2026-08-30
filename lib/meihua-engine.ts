// 梅花易数引擎 - 完整版

// 八卦基础数据
const BA_GUA: Record<
  string,
  {
    name: string;
    symbol: string;
    nature: string;
    element: string;
    number: number;
    bodyImage: string;
    familyImage: string;
    animalImage: string;
    direction: string;
    season: string;
  }
> = {
  乾: {
    name: '乾',
    symbol: '☰',
    nature: '天',
    element: '金',
    number: 1,
    bodyImage: '头',
    familyImage: '父',
    animalImage: '马',
    direction: '西北',
    season: '秋冬',
  },
  兑: {
    name: '兑',
    symbol: '☱',
    nature: '泽',
    element: '金',
    number: 2,
    bodyImage: '口',
    familyImage: '少女',
    animalImage: '羊',
    direction: '西',
    season: '秋',
  },
  离: {
    name: '离',
    symbol: '☲',
    nature: '火',
    element: '火',
    number: 3,
    bodyImage: '目',
    familyImage: '中女',
    animalImage: '雉',
    direction: '南',
    season: '夏',
  },
  震: {
    name: '震',
    symbol: '☳',
    nature: '雷',
    element: '木',
    number: 4,
    bodyImage: '足',
    familyImage: '长男',
    animalImage: '龙',
    direction: '东',
    season: '春',
  },
  巽: {
    name: '巽',
    symbol: '☴',
    nature: '风',
    element: '木',
    number: 5,
    bodyImage: '股',
    familyImage: '长女',
    animalImage: '鸡',
    direction: '东南',
    season: '春夏',
  },
  坎: {
    name: '坎',
    symbol: '☵',
    nature: '水',
    element: '水',
    number: 6,
    bodyImage: '耳',
    familyImage: '中男',
    animalImage: '豕',
    direction: '北',
    season: '冬',
  },
  艮: {
    name: '艮',
    symbol: 'GOR',
    nature: '山',
    element: '土',
    number: 7,
    bodyImage: '手',
    familyImage: '少男',
    animalImage: '狗',
    direction: '东北',
    season: '冬春',
  },
  坤: {
    name: '坤',
    symbol: '☷',
    nature: '地',
    element: '土',
    number: 8,
    bodyImage: '腹',
    familyImage: '母',
    animalImage: '牛',
    direction: '西南',
    season: '夏秋',
  },
};

// 五行关系详解
const WUXING_DETAILS: Record<
  string,
  {
    生: string;
    克: string;
    被生: string;
    被克: string;
    象: string;
  }
> = {
  金: { 生: '金生水', 克: '金克木', 被生: '土生金', 被克: '火克金', 象: '收敛、肃杀、变革' },
  木: { 生: '木生火', 克: '木克土', 被生: '水生木', 被克: '金克木', 象: '生长、扩展、仁慈' },
  水: { 生: '水生木', 克: '水克火', 被生: '金生水', 被克: '土克水', 象: '流动、智慧、润下' },
  火: { 生: '火生土', 克: '火克金', 被生: '木生火', 被克: '水克火', 象: '光明、热情、向上' },
  土: { 生: '土生金', 克: '土克水', 被生: '火生土', 被克: '木克土', 象: '承载、稳定、包容' },
};

// 五行生克判断
function getWuxingRelation(
  element1: string,
  element2: string,
): {
  type: string;
  description: string;
  advice: string;
} {
  if (element1 === element2) {
    return {
      type: '平衡',
      description: '你和环境的力量相当，势均力敌',
      advice: '事情平稳，变化不大，宜守不宜攻',
    };
  }

  const relations: Record<string, { type: string; desc: string; advice: string }> = {
    金生水: { type: '体生用', desc: '你需要为对方付出较多', advice: '付出较多，收获较少，需谨慎' },
    木生火: { type: '体生用', desc: '你需要消耗不少精力', advice: '精力消耗大，注意休息' },
    水生木: {
      type: '体生用',
      desc: '需要持续投入，短期难见成效',
      advice: '需要持续投入，短期难见回报',
    },
    火生土: { type: '体生用', desc: '付出的比较多，回报相对较少', advice: '付出与回报不成正比' },
    土生金: { type: '体生用', desc: '目前是积累期，需要耐心', advice: '积累期，需要耐心' },
    金克木: {
      type: '体克用',
      desc: '你有能力掌控局面，主动权在你手里',
      advice: '主动权在手，可以积极行动',
    },
    木克土: { type: '体克用', desc: '你能够主导事情的发展', advice: '能够掌控局面，顺势而为' },
    水克火: { type: '体克用', desc: '你有能力解决问题', advice: '问题可以解决，不必担心' },
    火克金: { type: '体克用', desc: '你能够克服困难', advice: '能够克服困难，取得成功' },
    土克水: { type: '体克用', desc: '障碍可以排除，事情会顺利', advice: '障碍可以排除，事情顺利' },
    水生金: { type: '用生体', desc: '有贵人或外部力量在帮助你', advice: '有贵人相助，事情顺利' },
    木生水: { type: '用生体', desc: '外界在给你助力，要抓住机会', advice: '外界助力，把握机会' },
    火生木: { type: '用生体', desc: '有人在扶持你，进展会比较顺利', advice: '有人扶持，进展顺利' },
    土生火: { type: '用生体', desc: '基础已经打好了，发展会很顺利', advice: '基础稳固，发展顺利' },
    金生土: { type: '用生体', desc: '有资源和支持，可以推进', advice: '有资源支持，可以推进' },
    木克金: {
      type: '用克体',
      desc: '外部压力比较大，暂时不宜行动',
      advice: '外部压力大，宜守不宜攻',
    },
    土克木: { type: '用克体', desc: '遇到了阻碍，需要调整策略', advice: '受到阻碍，需要调整策略' },
    金克火: { type: '用克体', desc: '竞争比较激烈，要小心应对', advice: '竞争激烈，小心应对' },
    水克土: { type: '用克体', desc: '环境不太有利，暂时忍耐一下', advice: '环境不利，暂时忍耐' },
    火克水: { type: '用克体', desc: '有人在针对你，要保持警惕', advice: '有人针对，保持警惕' },
  };

  const key1 = `${element1}生${element2}`;
  const key2 = `${element1}克${element2}`;
  const key3 = `${element2}生${element1}`;
  const key4 = `${element2}克${element1}`;

  if (relations[key1])
    return {
      type: relations[key1].type,
      description: relations[key1].desc,
      advice: relations[key1].advice,
    };
  if (relations[key2])
    return {
      type: relations[key2].type,
      description: relations[key2].desc,
      advice: relations[key2].advice,
    };
  if (relations[key3])
    return {
      type: relations[key3].type,
      description: relations[key3].desc,
      advice: relations[key3].advice,
    };
  if (relations[key4])
    return {
      type: relations[key4].type,
      description: relations[key4].desc,
      advice: relations[key4].advice,
    };

  return { type: '待分析', description: '五行关系需要进一步分析', advice: '需综合判断' };
}

export interface MeihuaResult {
  question: string;
  method: string;
  upperGua: {
    name: string;
    nature: string;
    element: string;
    symbol: string;
    bodyImage: string;
    familyImage: string;
    number: number;
  };
  lowerGua: {
    name: string;
    nature: string;
    element: string;
    symbol: string;
    bodyImage: string;
    familyImage: string;
    number: number;
  };
  changedGua: {
    name: string;
    nature: string;
    element: string;
    symbol: string;
  };
  relation: {
    type: string;
    description: string;
    advice: string;
  };
  // 体用分析
  tiYong: {
    tiGua: string;
    yongGua: string;
    tiElement: string;
    yongElement: string;
  };
  // 应期分析
  yingqi: string;
  // 方位分析
  direction: string;
  // 综合判断
  judgement: string;
  briefComment: string;
}

export function castMeihua(
  question: string,
  method: 'time' | 'number' | 'random' = 'time',
): MeihuaResult {
  let upperIdx: number, lowerIdx: number, changedIdx: number;

  if (method === 'time') {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();

    upperIdx = (year + month + day) % 8;
    lowerIdx = (year + month + day + hour) % 8;
    const dongYao = (year + month + day + hour) % 6;
    changedIdx = upperIdx;
  } else if (method === 'number') {
    const num1 = Math.floor(Math.random() * 100) + 1;
    const num2 = Math.floor(Math.random() * 100) + 1;
    upperIdx = num1 % 8;
    lowerIdx = num2 % 8;
    changedIdx = (num1 + num2) % 8;
  } else {
    upperIdx = Math.floor(Math.random() * 8);
    lowerIdx = Math.floor(Math.random() * 8);
    changedIdx = Math.floor(Math.random() * 8);
  }

  const upperGuaData = Object.values(BA_GUA)[upperIdx];
  const lowerGuaData = Object.values(BA_GUA)[lowerIdx];
  const changedGuaData = Object.values(BA_GUA)[changedIdx];

  // 体用分析：下卦为体，上卦为用
  const tiElement = lowerGuaData.element;
  const yongElement = upperGuaData.element;
  const relation = getWuxingRelation(tiElement, yongElement);

  // 应期分析
  const yingqi = determineMeihuaYingqi(relation.type, tiElement, yongElement);

  // 方位分析
  const direction = determineDirection(lowerGuaData.direction, upperGuaData.direction);

  // 生成判断
  const judgement = generateMeihuaJudgement(upperGuaData, lowerGuaData, changedGuaData, relation);

  // 生成简评
  const briefComment = generateMeihuaBrief(upperGuaData, lowerGuaData, changedGuaData, relation);

  return {
    question,
    method: method === 'time' ? '时间起卦' : method === 'number' ? '数字起卦' : '随机起卦',
    upperGua: {
      name: upperGuaData.name,
      nature: upperGuaData.nature,
      element: upperGuaData.element,
      symbol: upperGuaData.symbol,
      bodyImage: upperGuaData.bodyImage,
      familyImage: upperGuaData.familyImage,
      number: upperGuaData.number,
    },
    lowerGua: {
      name: lowerGuaData.name,
      nature: lowerGuaData.nature,
      element: lowerGuaData.element,
      symbol: lowerGuaData.symbol,
      bodyImage: lowerGuaData.bodyImage,
      familyImage: lowerGuaData.familyImage,
      number: lowerGuaData.number,
    },
    changedGua: {
      name: changedGuaData.name,
      nature: changedGuaData.nature,
      element: changedGuaData.element,
      symbol: changedGuaData.symbol,
    },
    relation,
    tiYong: {
      tiGua: lowerGuaData.name,
      yongGua: upperGuaData.name,
      tiElement,
      yongElement,
    },
    yingqi,
    direction,
    judgement,
    briefComment,
  };
}

function determineMeihuaYingqi(
  relationType: string,
  tiElement: string,
  yongElement: string,
): string {
  const elementTimeMap: Record<string, string> = {
    金: '申、酉日（西方金旺之时）',
    木: '寅、卯日（东方木旺之时）',
    水: '亥、子日（北方水旺之时）',
    火: '巳、午日（南方火旺之时）',
    土: '辰、戌、丑、未日（四季土旺之时）',
  };

  if (relationType === '体克用' || relationType === '比和') {
    return `事情进展顺利，预计在${elementTimeMap[tiElement] || '你运势强的时候'}会有结果`;
  } else if (relationType === '用克体') {
    return `外部压力较大，需要等到${elementTimeMap[tiElement] || '你运势强的时候'}才能化解`;
  } else {
    return `需要等到${elementTimeMap[tiElement] || '你运势强的时候'}才能有转机`;
  }
}

function determineDirection(lowerDirection: string, upperDirection: string): string {
  return `${lowerDirection}方对你更有利，${upperDirection}方可以辅助`;
}

function generateMeihuaJudgement(upper: any, lower: any, changed: any, relation: any): string {
  let judge = `你得到的卦象是${upper.nature}${lower.nature}。`;
  judge += `${relation.description}。`;

  if (relation.type === '体克用') {
    judge += '你有能力掌控局面，事情可以推进。';
  } else if (relation.type === '用克体') {
    judge += '外部压力较大，需要谨慎应对。';
  } else if (relation.type === '体生用') {
    judge += '需要付出较多精力，但最终会有收获。';
  } else if (relation.type === '用生体') {
    judge += '有外来助力，事情进展顺利。';
  } else {
    judge += '事情平稳发展，不会有大的变化。';
  }

  judge += `最终会向${changed.nature}的方向发展。`;
  judge += `建议：${relation.advice}。`;

  return judge;
}

function generateMeihuaBrief(upper: any, lower: any, changed: any, relation: any): string {
  let brief = `你的卦象是${upper.nature}${lower.nature}。`;

  if (relation.type === '体克用') {
    brief += '事情可以成功，但需要主动出击。';
  } else if (relation.type === '用克体') {
    brief += '外部阻力较大，建议暂时忍耐。';
  } else if (relation.type === '体生用') {
    brief += '需要付出较多，但终有回报。';
  } else if (relation.type === '用生体') {
    brief += '有贵人相助，进展顺利。';
  } else {
    brief += '事情平稳，变化不大。';
  }

  brief += `最终会向${changed.nature}的方向发展。`;

  return brief;
}
