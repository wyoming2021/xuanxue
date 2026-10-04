declare const ZODIAC_SIGNS: {
  name: string;
  symbol: string;
  element: string;
  dates: string;
  ruling: string;
  quality: string;
  polarity: string;
}[];
export interface XingpanPlanet {
  name: string;
  symbol: string;
  sign: string;
  signSymbol: string;
  element: string;
  house: number;
  houseName: string;
  retrograde: boolean;
  meaning: string;
}
export interface XingpanAspect {
  planet1: string;
  planet2: string;
  type: string;
  symbol: string;
  nature: string;
  description: string;
}
export interface XingpanResult {
  sunSign: (typeof ZODIAC_SIGNS)[0];
  moonSign: (typeof ZODIAC_SIGNS)[0];
  risingSign: (typeof ZODIAC_SIGNS)[0];
  planets: XingpanPlanet[];
  aspects: XingpanAspect[];
  elementBalance: Record<string, number>;
  qualityBalance: Record<string, number>;
  houses: Array<{
    name: string;
    meaning: string;
    planet?: string;
  }>;
  briefComment: string;
}
export declare function calculateXingpan(params: {
  birthDate: string;
  birthTime: string;
}): XingpanResult;
export {};
