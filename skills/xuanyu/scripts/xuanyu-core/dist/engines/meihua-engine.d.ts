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
  tiYong: {
    tiGua: string;
    yongGua: string;
    tiElement: string;
    yongElement: string;
  };
  yingqi: string;
  direction: string;
  judgement: string;
  briefComment: string;
}
export declare function castMeihua(
  question: string,
  method?: 'time' | 'number' | 'random',
): MeihuaResult;
