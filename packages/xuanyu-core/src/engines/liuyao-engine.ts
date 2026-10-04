// 六爻占卜引擎 - 完整版

const BA_GUA: Record<string, { symbol: string; nature: string; element: string }> = {
  乾: { symbol: '☰', nature: '天', element: '金' },
  兑: { symbol: '☱', nature: '泽', element: '金' },
  离: { symbol: '☲', nature: '火', element: '火' },
  震: { symbol: '☳', nature: '雷', element: '木' },
  巽: { symbol: '☴', nature: '风', element: '木' },
  坎: { symbol: '☵', nature: '水', element: '水' },
  艮: { symbol: '☶', nature: '山', element: '土' },
  坤: { symbol: '☷', nature: '地', element: '土' },
};

const GUA_BINARY: Record<string, string> = {
  '000': '坤',
  '001': '震',
  '010': '坎',
  '011': '兑',
  '100': '艮',
  '101': '离',
  '110': '巽',
  '111': '乾',
};

// 64卦数据 - 使用唯一键
const GUA_DATA: Array<{
  binary: string;
  name: string;
  upper: string;
  lower: string;
  judgement: string;
  image: string;
  meaning: string;
  advice: string;
}> = [
  {
    binary: '111111',
    name: '乾为天',
    upper: '乾',
    lower: '乾',
    judgement: '元亨利贞',
    image: '天行健，君子以自强不息',
    meaning: '刚健进取，事物处于积极发展阶段',
    advice: '宜主动出击，把握机会',
  },
  {
    binary: '000000',
    name: '坤为地',
    upper: '坤',
    lower: '坤',
    judgement: '元亨利牝马之贞',
    image: '地势坤，君子以厚德载物',
    meaning: '柔顺承载，守正待时',
    advice: '宜守正道，厚积薄发',
  },
  {
    binary: '100010',
    name: '水雷屯',
    upper: '坎',
    lower: '震',
    judgement: '元亨利贞',
    image: '云雷屯，君子以经纶',
    meaning: '初生困难，万事开头难',
    advice: '需耐心等待时机',
  },
  {
    binary: '010100',
    name: '山水蒙',
    upper: '艮',
    lower: '坎',
    judgement: '亨',
    image: '山下出泉，蒙',
    meaning: '蒙昧待启，需要学习',
    advice: '宜虚心学习',
  },
  {
    binary: '010111',
    name: '水天需',
    upper: '坎',
    lower: '乾',
    judgement: '有孚，光亨',
    image: '云上于天，需',
    meaning: '等待时机，有需求待满足',
    advice: '耐心等待',
  },
  {
    binary: '111010',
    name: '天水讼',
    upper: '乾',
    lower: '坎',
    judgement: '有孚窒惕',
    image: '天与水违行，讼',
    meaning: '争讼是非，意见不合',
    advice: '宜和解',
  },
  {
    binary: '000010',
    name: '地水师',
    upper: '坤',
    lower: '坎',
    judgement: '贞，丈人吉',
    image: '地中有水，师',
    meaning: '众力汇聚，团队合作',
    advice: '适合团队合作',
  },
  {
    binary: '010000',
    name: '水地比',
    upper: '坎',
    lower: '坤',
    judgement: '吉',
    image: '地上有水，比',
    meaning: '亲近辅佐，合作共赢',
    advice: '寻求合作',
  },
  {
    binary: '110111',
    name: '风天小畜',
    upper: '巽',
    lower: '乾',
    judgement: '亨',
    image: '风行天上，小畜',
    meaning: '小有积蓄，力量尚弱',
    advice: '先积累实力',
  },
  {
    binary: '111011',
    name: '天泽履',
    upper: '乾',
    lower: '兑',
    judgement: '履虎尾，不咥人',
    image: '上天下泽，履',
    meaning: '如履薄冰，谨慎前行',
    advice: '小心谨慎',
  },
  {
    binary: '111000',
    name: '地天泰',
    upper: '坤',
    lower: '乾',
    judgement: '小往大来，吉亨',
    image: '天地交，泰',
    meaning: '通泰安稳，万事顺遂',
    advice: '积极行动',
  },
  {
    binary: '000111',
    name: '天地否',
    upper: '乾',
    lower: '坤',
    judgement: '否之匪人',
    image: '天地不交，否',
    meaning: '闭塞不通，困难重重',
    advice: '宜守不宜进',
  },
  {
    binary: '101111',
    name: '天火同人',
    upper: '乾',
    lower: '离',
    judgement: '同人于野，亨',
    image: '天与火，同人',
    meaning: '志同道合，团结一致',
    advice: '与人合作',
  },
  {
    binary: '111101',
    name: '火天大有',
    upper: '离',
    lower: '乾',
    judgement: '元亨',
    image: '火在天上，大有',
    meaning: '大有收获，丰盛富足',
    advice: '把握机会',
  },
  {
    binary: '000100',
    name: '地山谦',
    upper: '坤',
    lower: '艮',
    judgement: '亨，君子有终',
    image: '地中有山，谦',
    meaning: '谦虚低调，德行高尚',
    advice: '保持谦逊',
  },
  {
    binary: '100000',
    name: '雷地豫',
    upper: '震',
    lower: '坤',
    judgement: '利建侯行师',
    image: '雷出地奋，豫',
    meaning: '欢乐愉悦，顺势而为',
    advice: '把握时机',
  },
  {
    binary: '100111',
    name: '泽雷随',
    upper: '兑',
    lower: '震',
    judgement: '元亨利贞',
    image: '泽中有雷，随',
    meaning: '随顺因缘，顺应时势',
    advice: '顺应形势',
  },
  {
    binary: '111100',
    name: '山风蛊',
    upper: '艮',
    lower: '巽',
    judgement: '元亨，利涉大川',
    image: '山下有风，蛊',
    meaning: '积弊已久，需要整治',
    advice: '大胆改革',
  },
  {
    binary: '000011',
    name: '地泽临',
    upper: '坤',
    lower: '兑',
    judgement: '元亨利贞',
    image: '泽上有地，临',
    meaning: '临近来临，机会将至',
    advice: '积极准备',
  },
  {
    binary: '110000',
    name: '风地观',
    upper: '巽',
    lower: '坤',
    judgement: '盥而不荐',
    image: '风行地上，观',
    meaning: '观察审视，深思熟虑',
    advice: '多观察分析',
  },
  {
    binary: '101001',
    name: '火雷噬嗑',
    upper: '离',
    lower: '震',
    judgement: '亨，利用狱',
    image: '雷电噬嗑',
    meaning: '果断决绝，排除障碍',
    advice: '果断处理',
  },
  {
    binary: '100101',
    name: '山火贲',
    upper: '艮',
    lower: '离',
    judgement: '亨，小利有攸往',
    image: '山下有火，贲',
    meaning: '文饰美化，注重形式',
    advice: '注意外表',
  },
  {
    binary: '100001',
    name: '山地剥',
    upper: '艮',
    lower: '坤',
    judgement: '不利有攸往',
    image: '山附于地，剥',
    meaning: '剥落衰败，事物衰退',
    advice: '宜守不宜进',
  },
  {
    binary: '000001',
    name: '地雷复',
    upper: '坤',
    lower: '震',
    judgement: '亨',
    image: '雷在地中，复',
    meaning: '恢复重生，否极泰来',
    advice: '新的开始',
  },
  {
    binary: '101011',
    name: '泽火革',
    upper: '兑',
    lower: '离',
    judgement: '己日乃孚',
    image: '泽中有火，革',
    meaning: '变革创新，除旧布新',
    advice: '大胆改变',
  },
  {
    binary: '110101',
    name: '火风鼎',
    upper: '离',
    lower: '巽',
    judgement: '元吉，亨',
    image: '木上有火，鼎',
    meaning: '鼎新革故，稳定发展',
    advice: '建立新秩序',
  },
  {
    binary: '100110',
    name: '雷风恒',
    upper: '震',
    lower: '巽',
    judgement: '亨，无咎',
    image: '雷风相与，恒',
    meaning: '持之以恒，坚持不懈',
    advice: '保持恒心',
  },
  {
    binary: '110100',
    name: '天山遁',
    upper: '乾',
    lower: '艮',
    judgement: '亨，小利贞',
    image: '天下有山，遁',
    meaning: '退避隐遁，以退为进',
    advice: '适时退让',
  },
  {
    binary: '011100',
    name: '雷天大壮',
    upper: '震',
    lower: '乾',
    judgement: '利贞',
    image: '雷在天上，大壮',
    meaning: '势力强大，声势浩大',
    advice: '趁势而为',
  },
  {
    binary: '100011',
    name: '火地晋',
    upper: '离',
    lower: '坤',
    judgement: '康侯用锡马蕃庶',
    image: '明出地上，晋',
    meaning: '向上晋升，光明正大',
    advice: '积极进取',
  },
  {
    binary: '000101',
    name: '地火明夷',
    upper: '坤',
    lower: '离',
    judgement: '利艰贞',
    image: '明入地中，明夷',
    meaning: '光明受损，才华被掩',
    advice: '韬光养晦',
  },
  {
    binary: '101101',
    name: '风火家人',
    upper: '巽',
    lower: '离',
    judgement: '利女贞',
    image: '风自火出，家人',
    meaning: '家庭和睦，齐心协力',
    advice: '注重家庭',
  },
  {
    binary: '101010',
    name: '火泽睽',
    upper: '离',
    lower: '兑',
    judgement: '小事吉',
    image: '上火下泽，睽',
    meaning: '意见相左，相互对立',
    advice: '求同存异',
  },
  {
    binary: '010101',
    name: '水山蹇',
    upper: '坎',
    lower: '艮',
    judgement: '利西南',
    image: '山上有水，蹇',
    meaning: '困难险阻，举步维艰',
    advice: '绕道而行',
  },
  {
    binary: '010111',
    name: '雷水解',
    upper: '震',
    lower: '坎',
    judgement: '利西南',
    image: '雷雨作，解',
    meaning: '困难化解，雨过天晴',
    advice: '问题即将解决',
  },
  {
    binary: '110011',
    name: '山泽损',
    upper: '艮',
    lower: '兑',
    judgement: '有孚，元吉',
    image: '山下有泽，损',
    meaning: '有所损失，先损后益',
    advice: '适当付出',
  },
  {
    binary: '001100',
    name: '风雷益',
    upper: '巽',
    lower: '震',
    judgement: '利有攸往',
    image: '风雷相与，益',
    meaning: '增益进步，日益增长',
    advice: '积极行动',
  },
  {
    binary: '111011',
    name: '泽天夬',
    upper: '兑',
    lower: '乾',
    judgement: '扬于王庭',
    image: '泽上于天，夬',
    meaning: '果断决裂，当机立断',
    advice: '果断决定',
  },
  {
    binary: '110111',
    name: '天风姤',
    upper: '乾',
    lower: '巽',
    judgement: '女壮，勿用取女',
    image: '天下有风，姤',
    meaning: '偶然相遇，意外收获',
    advice: '把握机会',
  },
  {
    binary: '101110',
    name: '泽地萃',
    upper: '兑',
    lower: '坤',
    judgement: '亨',
    image: '泽上于地，萃',
    meaning: '聚集汇合，人才汇聚',
    advice: '团结众人',
  },
  {
    binary: '011101',
    name: '地风升',
    upper: '坤',
    lower: '巽',
    judgement: '元亨',
    image: '地中生木，升',
    meaning: '向上生长，逐步提升',
    advice: '循序渐进',
  },
  {
    binary: '101001',
    name: '泽水困',
    upper: '兑',
    lower: '坎',
    judgement: '亨，贞大人吉',
    image: '泽无水，困',
    meaning: '困顿艰难，资源匮乏',
    advice: '坚守正道',
  },
  {
    binary: '010110',
    name: '水风井',
    upper: '坎',
    lower: '巽',
    judgement: '改邑不改井',
    image: '木上有水，井',
    meaning: '井水不竭，持续供应',
    advice: '保持稳定',
  },
  {
    binary: '110110',
    name: '泽火革',
    upper: '兑',
    lower: '离',
    judgement: '己日乃孚',
    image: '泽中有火，革',
    meaning: '变革更新，除旧布新',
    advice: '大胆改变',
  },
  {
    binary: '100100',
    name: '震为雷',
    upper: '震',
    lower: '震',
    judgement: '亨',
    image: '洊雷，震',
    meaning: '震惊奋起，警醒奋发',
    advice: '保持警觉',
  },
  {
    binary: '011011',
    name: '巽为风',
    upper: '巽',
    lower: '巽',
    judgement: '小亨',
    image: '随风，巽',
    meaning: '柔顺渗透，循序渐进',
    advice: '以柔克刚',
  },
  {
    binary: '010010',
    name: '坎为水',
    upper: '坎',
    lower: '坎',
    judgement: '习坎，有孚',
    image: '水洊至，习坎',
    meaning: '重重险阻，需要勇气',
    advice: '勇敢面对',
  },
  {
    binary: '101101',
    name: '离为火',
    upper: '离',
    lower: '离',
    judgement: '利贞，亨',
    image: '明两作，离',
    meaning: '光明照耀，文明进步',
    advice: '保持光明正大',
  },
];

// 建立唯一映射
const GUA_MAP: Record<string, (typeof GUA_DATA)[0]> = {};
GUA_DATA.forEach((g) => {
  GUA_MAP[g.binary] = g;
});

function getGuaByBinary(binary: string) {
  if (GUA_MAP[binary]) return GUA_MAP[binary];
  const upperBinary = binary.substring(3, 6);
  const lowerBinary = binary.substring(0, 3);
  const upperName = GUA_BINARY[upperBinary];
  const lowerName = GUA_BINARY[lowerBinary];
  if (!upperName || !lowerName) return null;
  const upperGua = BA_GUA[upperName];
  const lowerGua = BA_GUA[lowerName];
  return {
    binary,
    name: `${upperGua.nature}${lowerGua.nature}`,
    upper: upperName,
    lower: lowerName,
    judgement: '待解读',
    image: `${upperGua.symbol}上${lowerGua.symbol}下`,
    meaning: `${upperGua.nature}上${lowerGua.nature}下，需结合具体情境分析`,
    advice: '建议综合各方面因素谨慎判断',
  };
}

export interface LiuyaoLine {
  position: number;
  yin: boolean;
  moving: boolean;
  coinSum: number;
  nature: string;
}

export interface LiuyaoResult {
  question: string;
  hexagram: {
    name: string;
    judgement: string;
    image: string;
    meaning: string;
    advice: string;
    lines: LiuyaoLine[];
    upperGua: string;
    lowerGua: string;
    upperSymbol: string;
    lowerSymbol: string;
    nature: string;
  };
  changingHexagram?: { name: string; judgement: string; meaning: string };
  yongshen?: string;
  yingqi?: string;
  judgement: string;
  briefComment: string;
}

export function castLiuyao(question: string): LiuyaoResult {
  const lines: LiuyaoLine[] = [];
  for (let i = 0; i < 6; i++) {
    const coins = [3, 3, 3].map(() => (Math.random() > 0.5 ? 3 : 2));
    const sum = coins.reduce((a, b) => a + b, 0);
    const yin = sum === 7 || sum === 6;
    const moving = sum === 6 || sum === 9;
    let nature = '';
    if (sum === 6) nature = '老阴';
    else if (sum === 7) nature = '少阴';
    else if (sum === 8) nature = '少阳';
    else if (sum === 9) nature = '老阳';
    lines.push({ position: i + 1, yin, moving, coinSum: sum, nature });
  }

  const binary = lines.map((l) => (l.yin ? '0' : '1')).join('');
  const hexagramData = getGuaByBinary(binary);
  if (!hexagramData) throw new Error('无法识别卦象');

  const upperGuaData = BA_GUA[hexagramData.upper];
  const lowerGuaData = BA_GUA[hexagramData.lower];

  let changingBinary = '';
  if (lines.some((l) => l.moving)) {
    changingBinary = lines
      .map((l) => (l.moving ? (l.yin ? '1' : '0') : l.yin ? '0' : '1'))
      .join('');
  }
  const changingData = changingBinary ? getGuaByBinary(changingBinary) : null;

  const yongshen = determineYongshen(lines);
  const yingqi = determineYingqi(lines);
  const judgement = generateJudgement(hexagramData, lines, changingData);
  const briefComment = generateBriefComment(hexagramData, lines, changingData);

  return {
    question,
    hexagram: {
      name: hexagramData.name,
      judgement: hexagramData.judgement,
      image: hexagramData.image,
      meaning: hexagramData.meaning,
      advice: hexagramData.advice,
      lines,
      upperGua: hexagramData.upper,
      lowerGua: hexagramData.lower,
      upperSymbol: upperGuaData.symbol,
      lowerSymbol: lowerGuaData.symbol,
      nature: `${upperGuaData.nature}${lowerGuaData.nature}`,
    },
    changingHexagram: changingData
      ? {
          name: changingData.name,
          judgement: changingData.judgement,
          meaning: changingData.meaning,
        }
      : undefined,
    yongshen,
    yingqi,
    judgement,
    briefComment,
  };
}

function determineYongshen(lines: LiuyaoLine[]): string {
  const movingCount = lines.filter((l) => l.moving).length;
  if (movingCount === 0) return '卦象稳定，事情不会有大的变化';
  if (movingCount === 1) return '有一个变化点，关注这个变化代表的事情';
  if (movingCount === 2) return '有两个变化点，需要综合考虑';
  return `${movingCount}个变化点，情况比较复杂，需要仔细分析`;
}

function determineYingqi(lines: LiuyaoLine[]): string {
  const movingCount = lines.filter((l) => l.moving).length;
  if (movingCount === 0) return '六爻安静，近期无明显变化，耐心等待';
  if (movingCount === 1) return '有一个变化点，近期（几天到一周）会有结果';
  if (movingCount === 2) return '有两个变化点，变化比较明显';
  return `${movingCount}个变化点，变化剧烈，短期内会有结果`;
}

function generateJudgement(hexagram: any, lines: LiuyaoLine[], changing: any): string {
  const movingCount = lines.filter((l) => l.moving).length;
  const movingPositions = lines.filter((l) => l.moving).map((l) => l.position);
  let judge = `你得到的卦是${hexagram.name}，${hexagram.meaning}。`;
  if (movingCount === 0) {
    judge += '卦象稳定，短期内不会有大的变化。';
  } else {
    judge += `有${movingCount}个变化点（第${movingPositions.join('、')}爻），`;
    if (changing) judge += `最终会演变为${changing.name}，${changing.meaning}。`;
  }
  judge += hexagram.advice;
  return judge;
}

function generateBriefComment(hexagram: any, lines: LiuyaoLine[], changing: any): string {
  const movingCount = lines.filter((l) => l.moving).length;
  let comment = `${hexagram.name}：${hexagram.meaning}。`;
  if (movingCount === 0) comment += '卦象稳定，当前状况会持续一段时间。';
  else if (movingCount === 1) comment += '有一个变化点，趋势比较明确。';
  else if (movingCount <= 3) comment += `${movingCount}个变化点，需要综合考虑。`;
  else comment += '变化很多，结果难以预料。';
  if (changing) comment += `最终会向「${changing.meaning}」的方向发展。`;
  return comment;
}
