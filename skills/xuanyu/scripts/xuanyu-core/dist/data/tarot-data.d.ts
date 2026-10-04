import type { TarotCardData } from '../types.js';
export declare const TAROT_CARDS: TarotCardData[];
export declare const SPREAD_CONFIGS: {
  readonly single: {
    readonly name: '单张牌阵';
    readonly count: 1;
    readonly positions: readonly ['指引'];
  };
  readonly three: {
    readonly name: '三张牌阵';
    readonly count: 3;
    readonly positions: readonly ['过去', '现在', '未来'];
  };
  readonly celtic: {
    readonly name: '凯尔特十字';
    readonly count: 10;
    readonly positions: readonly [
      '现状',
      '挑战',
      '根源',
      '过去',
      '可能',
      '近未来',
      '自我态度',
      '环境',
      '希望/恐惧',
      '最终结果',
    ];
  };
};
