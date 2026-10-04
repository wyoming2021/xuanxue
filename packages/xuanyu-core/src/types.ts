/**
 * xuanyu-core 公共类型。
 * 从站点 types/index.ts 提取，仅保留引擎计算相关的类型；
 * deviceId / User / Order 等站点业务概念不进入 SDK。
 */

export interface Dayun {
  gan: string;
  zhi: string;
  ganZhi: string;
  element: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  comment: string;
}

export interface Liunian {
  year: number;
  gan: string;
  zhi: string;
  ganZhi: string;
  element: string;
  shengxiao: string;
  comment: string;
}

export interface BaziResult {
  yearPillar: { gan: string; zhi: string };
  monthPillar: { gan: string; zhi: string };
  dayPillar: { gan: string; zhi: string };
  hourPillar: { gan: string; zhi: string };
  fiveElements: { wood: number; fire: number; earth: number; metal: number; water: number };
  hiddenStems: string[];
  tenGods: string[];
  nayin: string;
  briefComment: string;
  detailedAnalysis?: {
    personality: string;
    careerWealth: string;
    marriage: string;
    yearlyFortune: string[];
    fiveElementAdvice: string;
  };
  shengxiao?: string;
  shishen?: {
    yearShishen: string;
    monthShishen: string;
    dayShishen: string;
    hourShishen: string;
  };
  dayun?: Dayun[];
  currentDayun?: Dayun;
  liunian?: Liunian;
  age?: number;
  gender?: 'male' | 'female';
}

export type Gender = 'male' | 'female';

export interface TarotCardData {
  id: number;
  name: string;
  nameEn: string;
  image: string;
  uprightKeywords: string[];
  uprightReading: string;
  reversedKeywords: string[];
  reversedReading: string;
  element: string;
  astrology: string;
}

export type TarotPosition = 'upright' | 'reversed';

export interface TarotDrawnCard {
  id: number;
  name: string;
  nameEn: string;
  image: string;
  position: TarotPosition;
  positionName: string;
  keywords: string[];
  reading: string;
  element: string;
  astrology: string;
}

export interface TarotDrawResult {
  spreadType: 'single' | 'three' | 'celtic';
  spreadName: string;
  question: string;
  drawnAt: string;
  cards: TarotDrawnCard[];
}

export interface DailyFortuneResult {
  zodiac: string;
  date: string;
  element: string;
  introduction: string;
  overallScore: number;
  summary: string;
  love: string;
  loveScore: number;
  career: string;
  careerScore: number;
  wealth: string;
  wealthScore: number;
  health: string;
  healthScore: number;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  compatibleZodiac: string;
}
