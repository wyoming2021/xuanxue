import { SPREAD_CONFIGS, TAROT_CARDS } from '../data/tarot-data.js';
import type { TarotCardData, TarotDrawResult } from '../types.js';
export { SPREAD_CONFIGS, TAROT_CARDS };
export type SpreadKey = keyof typeof SPREAD_CONFIGS;
export type { TarotCardData };
/** Fisher-Yates 洗牌（均匀分布，不丢牌） */
export declare function fisherYatesShuffle<T>(items: readonly T[]): T[];
/**
 * 抽一副塔罗牌。
 *
 * @param spread  牌阵：single（1 张）/ three（过去现在未来）/ celtic（凯尔特十字 10 张）
 * @param question 占卜问题（仅记录用途，不影响随机结果）
 */
export declare function drawTarot(spread: SpreadKey, question?: string): TarotDrawResult;
