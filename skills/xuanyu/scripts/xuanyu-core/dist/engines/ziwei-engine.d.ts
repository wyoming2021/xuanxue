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
  decadal?: {
    range: number[];
    heavenlyStem: string;
    earthlyBranch: string;
  };
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
  decadal?: {
    palaceName: string;
    yearRange: number[];
    heavenlyStem: string;
    earthlyBranch: string;
    mutagen: string[];
  };
  yearly?: {
    heavenlyStem: string;
    earthlyBranch: string;
    mutagen: string[];
    comment: string;
  };
  ageInfo?: {
    nominalAge: number;
    heavenlyStem: string;
    earthlyBranch: string;
    mutagen: string[];
  };
  briefComment: string;
}
export declare function calculateZiwei(params: {
  birthDate: string;
  birthTime: number;
  gender: 'male' | 'female';
}): ZiweiResult;
