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
  changingHexagram?: {
    name: string;
    judgement: string;
    meaning: string;
  };
  yongshen?: string;
  yingqi?: string;
  judgement: string;
  briefComment: string;
}
export declare function castLiuyao(question: string): LiuyaoResult;
