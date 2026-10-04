export interface PersonBazi {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  dayMaster: string;
  dayMasterElement: string;
  shengxiao: string;
  fiveElements: Record<string, number>;
}
export interface HehunResult {
  person1: PersonBazi;
  person2: PersonBazi;
  overallScore: number;
  overallLevel: string;
  overallComment: string;
  wuxingAnalysis: {
    person1Element: string;
    person2Element: string;
    relationship: string;
    comment: string;
  };
  dizhiAnalysis: {
    sixHarmony: boolean;
    threeHarmony: boolean;
    sixClash: boolean;
    details: string[];
  };
  fiveElementBalance: {
    person1: Record<string, number>;
    person2: Record<string, number>;
    complement: string;
  };
  aspects: {
    love: {
      score: number;
      comment: string;
    };
    career: {
      score: number;
      comment: string;
    };
    family: {
      score: number;
      comment: string;
    };
    communication: {
      score: number;
      comment: string;
    };
  };
  suggestions: string[];
}
export declare function calculateHehun(params: {
  person1: {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: 'male' | 'female';
  };
  person2: {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: 'male' | 'female';
  };
}): HehunResult;
