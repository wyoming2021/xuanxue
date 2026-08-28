import { Solar } from "lunar-javascript";
import type { BaziResult } from "@/types";

const SHI_CHEN = [
  { name: "子时", hours: [23, 0] },
  { name: "丑时", hours: [1, 2] },
  { name: "寅时", hours: [3, 4] },
  { name: "卯时", hours: [5, 6] },
  { name: "辰时", hours: [7, 8] },
  { name: "巳时", hours: [9, 10] },
  { name: "午时", hours: [11, 12] },
  { name: "未时", hours: [13, 14] },
  { name: "申时", hours: [15, 16] },
  { name: "酉时", hours: [17, 18] },
  { name: "戌时", hours: [19, 20] },
  { name: "亥时", hours: [21, 22] },
];

const GAN_WUXING: Record<string, number> = { 甲: 1, 乙: 1, 丙: 2, 丁: 2, 戊: 3, 己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5 };
const ZHI_WUXING: Record<string, number> = { 子: 5, 丑: 3, 寅: 1, 卯: 1, 辰: 3, 巳: 2, 午: 2, 未: 3, 申: 4, 酉: 4, 戌: 3, 亥: 5 };

export function timeToHourIndex(timeStr: string): number {
  const shichen = SHI_CHEN.find((s) => timeStr.includes(s.name));
  if (shichen) return shichen.hours[1];

  const [h] = timeStr.split(":").map(Number);
  if (h === 23 || h === 0) return 0;
  return Math.floor(h / 2) + 1;
}

export function calculateBazi(params: {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
}): BaziResult {
  const [year, month, day] = params.birthDate.split("-").map(Number);
  const hourIdx = timeToHourIndex(params.birthTime);

  const solar = Solar.fromYmdHms(year, month, day, hourIdx * 2, 0, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const yearGan = eightChar.getYearGan();
  const yearZhi = eightChar.getYearZhi();
  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();
  const hourGan = eightChar.getTimeGan();
  const hourZhi = eightChar.getTimeZhi();

  // Calculate five elements
  const allGanZhi = [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi];
  const fiveElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const elementMap: Record<number, keyof typeof fiveElements> = { 1: "wood", 2: "fire", 3: "earth", 4: "metal", 5: "water" };

  allGanZhi.forEach((gz) => {
    const wx = GAN_WUXING[gz] || ZHI_WUXING[gz] || 0;
    if (wx > 0) fiveElements[elementMap[wx]]++;
  });

  // Get nayin
  const nayin = eightChar.getYearNaYin() + " " + eightChar.getMonthNaYin();

  // Generate brief comment based on day master
  const dayMasterWx = GAN_WUXING[dayGan];
  const dayMasterElement = elementMap[dayMasterWx];

  const comments: Record<string, string> = {
    wood: "日主为木，天性仁慈，富有同情心，善于成长与突破。",
    fire: "日主为火，热情开朗，思维活跃，具有领导才能。",
    earth: "日主为土，稳重踏实，忠诚可靠，注重实际。",
    metal: "日主为金，果断刚毅，讲求原则，有正义感。",
    water: "日主为水，聪慧灵活，善于变通，直觉敏锐。",
  };

  return {
    yearPillar: { gan: yearGan, zhi: yearZhi },
    monthPillar: { gan: monthGan, zhi: monthZhi },
    dayPillar: { gan: dayGan, zhi: dayZhi },
    hourPillar: { gan: hourGan, zhi: hourZhi },
    fiveElements,
    hiddenStems: [],
    tenGods: [],
    nayin,
    briefComment: comments[dayMasterElement] || "命格独特，需综合分析。",
  };
}
