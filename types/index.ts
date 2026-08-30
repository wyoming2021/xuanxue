export interface BaziInput {
  name?: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  deviceId: string;
}

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
  // 扩展字段
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

export interface TarotSpread {
  type: 'single' | 'three' | 'celtic';
  cards: { card: TarotCardData; position: 'upright' | 'reversed'; positionName: string }[];
}

export interface DailyFortune {
  zodiac: string;
  date: string;
  overallScore: number;
  summary: string;
  love?: string;
  career?: string;
  wealth?: string;
  health?: string;
  luckyColor?: string;
  luckyNumber?: string;
  compatibleZodiac?: string;
}

export interface User {
  id: string;
  deviceId: string;
  email?: string;
  vipExpireTime?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  recordType: 'bazi' | 'tarot' | 'daily' | 'membership';
  recordId?: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  hupijiaoOrderId?: string;
  hupijiaoUrl?: string;
  createdAt: string;
  paidAt?: string;
}
