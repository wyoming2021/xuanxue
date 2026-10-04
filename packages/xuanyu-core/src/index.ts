/**
 * xuanyu-core —— 玄语命理引擎
 *
 * 纯 TypeScript 计算库：八字排盘、紫微斗数、星盘占星、六爻、梅花易数、
 * 合婚配对、塔罗占卜、每日运势。无框架依赖，浏览器外的 Node 环境运行
 * （塔罗抽牌与六爻/梅花起卦使用 Node crypto / Math.random）。
 */

// 八字
export { calculateBazi, timeToHourIndex } from './engines/bazi-engine.js';
export type { BaziResult } from './types.js';

// 紫微斗数
export { calculateZiwei } from './engines/ziwei-engine.js';
export type { ZiweiResult, ZiweiStar } from './engines/ziwei-engine.js';

// 星盘占星
export { calculateXingpan } from './engines/xingpan-engine.js';
export type { XingpanResult, XingpanPlanet, XingpanAspect } from './engines/xingpan-engine.js';

// 六爻
export { castLiuyao } from './engines/liuyao-engine.js';
export type { LiuyaoResult, LiuyaoLine } from './engines/liuyao-engine.js';

// 梅花易数
export { castMeihua } from './engines/meihua-engine.js';
export type { MeihuaResult } from './engines/meihua-engine.js';

// 合婚
export { calculateHehun } from './engines/hehun-engine.js';
export type { HehunResult, PersonBazi } from './engines/hehun-engine.js';

// 塔罗
export {
  drawTarot,
  fisherYatesShuffle,
  TAROT_CARDS,
  SPREAD_CONFIGS,
} from './engines/tarot-engine.js';
export type { SpreadKey } from './engines/tarot-engine.js';
export type { TarotCardData, TarotDrawResult, TarotDrawnCard } from './types.js';

// 每日运势
export { generateDailyFortune, ZODIAC_LIST } from './engines/daily-engine.js';
export type { Zodiac } from './engines/daily-engine.js';
export type { DailyFortuneResult } from './types.js';

// 公共类型
export type { Dayun, Liunian, Gender, TarotPosition } from './types.js';
