// Types for Ziwei feature
export interface ZiweiResult {
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  zodiac: string;
  sign: string;
  fiveElementsClass: string;
  soul: string;
  body: string;
  briefComment: string;
  palaces: Palace[];
  decadal?: DecadalInfo;
  yearly?: YearlyInfo;
  ageInfo?: AgeInfo;
}

export interface Palace {
  name: string;
  isBodyPalace: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: Star[];
  minorStars: Star[];
  adjectiveStars: Star[];
  decadal?: { range: [number, number]; heavenlyStem: string; earthlyBranch: string };
}

export interface Star {
  name: string;
  brightness?: string;
}

export interface DecadalInfo {
  palaceName: string;
  yearRange: [number, number];
  heavenlyStem: string;
  earthlyBranch: string;
  mutagen: string[];
}

export interface YearlyInfo {
  heavenlyStem: string;
  earthlyBranch: string;
  mutagen: string[];
  comment: string;
}

export interface AgeInfo {
  nominalAge: number;
  heavenlyStem: string;
  earthlyBranch: string;
  mutagen: string[];
}
