import type { DailyFortuneResult } from '../types.js';
/** 支持的 12 星座 */
export declare const ZODIAC_LIST: readonly [
  '白羊座',
  '金牛座',
  '双子座',
  '巨蟹座',
  '狮子座',
  '处女座',
  '天秤座',
  '天蝎座',
  '射手座',
  '摩羯座',
  '水瓶座',
  '双鱼座',
];
export type Zodiac = (typeof ZODIAC_LIST)[number];
/**
 * 生成某星座某天的运势。
 *
 * 用 (zodiac, date) 做 FNV-1a 种子 + mulberry32 迭代伪随机：
 * - 四个维度（爱情/事业/财运/健康）各自独立取值；
 * - 同一星座同一天结果可复现，不同星座/不同日期结果分散。
 *
 * @param zodiac  星座名（ZODIAC_LIST 之一）
 * @param date    YYYY-MM-DD，默认今天
 */
export declare function generateDailyFortune(zodiac: string, date?: string): DailyFortuneResult;
