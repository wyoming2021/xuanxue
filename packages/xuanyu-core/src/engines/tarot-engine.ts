import crypto from 'crypto';

import { SPREAD_CONFIGS, TAROT_CARDS } from '../data/tarot-data.js';
import type { TarotCardData, TarotDrawResult, TarotDrawnCard, TarotPosition } from '../types.js';

export { SPREAD_CONFIGS, TAROT_CARDS };
export type SpreadKey = keyof typeof SPREAD_CONFIGS;

export type { TarotCardData };

/** 安全随机整数 [0, max) */
function secureRandomInt(max: number): number {
  return crypto.randomInt(max);
}

/** Fisher-Yates 洗牌（均匀分布，不丢牌） */
export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 抽一副塔罗牌。
 *
 * @param spread  牌阵：single（1 张）/ three（过去现在未来）/ celtic（凯尔特十字 10 张）
 * @param question 占卜问题（仅记录用途，不影响随机结果）
 */
export function drawTarot(spread: SpreadKey, question = '请给我指引'): TarotDrawResult {
  const config = SPREAD_CONFIGS[spread];
  if (!config) {
    throw new Error(`未知的牌阵类型: ${String(spread)}（可选 single / three / celtic）`);
  }

  const shuffled = fisherYatesShuffle(TAROT_CARDS);
  const cards: TarotDrawnCard[] = shuffled.slice(0, config.count).map((card, i) => {
    const position: TarotPosition = secureRandomInt(2) === 0 ? 'upright' : 'reversed';
    return {
      id: card.id,
      name: card.name,
      nameEn: card.nameEn,
      image: card.image,
      position,
      positionName: config.positions[i],
      keywords: position === 'upright' ? card.uprightKeywords : card.reversedKeywords,
      reading: position === 'upright' ? card.uprightReading : card.reversedReading,
      element: card.element,
      astrology: card.astrology,
    };
  });

  return {
    spreadType: spread,
    spreadName: config.name,
    question,
    drawnAt: new Date().toISOString(),
    cards,
  };
}
