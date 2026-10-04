/**
 * xuanyu-core 引擎核心测试。
 * 八字基准值与站点 GUI 实测结果对齐（1995-08-15 午时 男 → 乙亥/甲申/戊寅/戊午）。
 */
import {
  calculateBazi,
  timeToHourIndex,
  drawTarot,
  TAROT_CARDS,
  SPREAD_CONFIGS,
  generateDailyFortune,
  ZODIAC_LIST,
} from '../src/index.js';

describe('bazi-engine', () => {
  test('已知出生信息：四柱与站点一致', () => {
    const r = calculateBazi({ birthDate: '1995-08-15', birthTime: '午时', gender: 'male' });
    expect(r.yearPillar.gan + r.yearPillar.zhi).toBe('乙亥');
    expect(r.monthPillar.gan + r.monthPillar.zhi).toBe('甲申');
    expect(r.dayPillar.gan + r.dayPillar.zhi).toBe('戊寅');
    expect(r.hourPillar.gan + r.hourPillar.zhi).toBe('戊午');
  });

  test('五行计数总和为 8（四柱天干地支）', () => {
    const r = calculateBazi({ birthDate: '2000-01-01', birthTime: '子时', gender: 'female' });
    const sum = Object.values(r.fiveElements).reduce((a, b) => a + b, 0);
    expect(sum).toBe(8);
  });

  test('timeToHourIndex：时辰名与 HH:MM 都支持', () => {
    expect(timeToHourIndex('午时')).toBe(12); // 午时 11-13 点，取中点 12
    expect(timeToHourIndex('12:30')).toBe(12);
    expect(timeToHourIndex('子时')).toBe(0); // 子时 23-1 点，中点 24 归零
    // 无法识别时回退正午
    expect(timeToHourIndex('abc')).toBe(12);
  });
});

describe('tarot-engine', () => {
  test('牌库 78 张不重复', () => {
    expect(TAROT_CARDS.length).toBe(78);
    expect(new Set(TAROT_CARDS.map((c) => c.id)).size).toBe(78);
  });

  test.each([
    ['single', 1],
    ['three', 3],
    ['celtic', 10],
  ] as const)('%s 牌阵抽 %d 张，字段完整', (spread, count) => {
    const r = drawTarot(spread);
    expect(r.cards.length).toBe(count);
    for (const c of r.cards) {
      expect(['upright', 'reversed']).toContain(c.position);
      expect(c.positionName.length).toBeGreaterThan(0);
      expect(c.keywords.length).toBeGreaterThan(0);
      expect(c.reading.length).toBeGreaterThan(0);
    }
    // 不重复抽同一张
    expect(new Set(r.cards.map((c) => c.id)).size).toBe(count);
  });

  test('非法牌阵抛错', () => {
    expect(() => drawTarot('evil' as never)).toThrow();
  });

  test('SPREAD_CONFIGS 不含价格字段（商业逻辑不进 SDK）', () => {
    for (const config of Object.values(SPREAD_CONFIGS)) {
      expect(config).not.toHaveProperty('price');
    }
  });
});

describe('daily-engine', () => {
  test('同星座同日可复现', () => {
    const a = generateDailyFortune('狮子座', '2026-10-04');
    const b = generateDailyFortune('狮子座', '2026-10-04');
    expect(a).toEqual(b);
  });

  test('四维分数独立分散（48 组合不允许全同档）', () => {
    const dates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-12-25'];
    let allSame = 0;
    for (const z of ZODIAC_LIST) {
      for (const d of dates) {
        const f = generateDailyFortune(z, d);
        if (
          f.loveScore === f.careerScore &&
          f.careerScore === f.wealthScore &&
          f.wealthScore === f.healthScore
        ) {
          allSame += 1;
        }
      }
    }
    expect(allSame).toBeLessThanOrEqual(4); // ≈0.8%/组合，48 组合期望 ~0.4 个
  });

  test('非法星座/日期抛错', () => {
    expect(() => generateDailyFortune('不存在的星座')).toThrow();
    expect(() => generateDailyFortune('狮子座', '2026/10/01')).toThrow();
  });
});
