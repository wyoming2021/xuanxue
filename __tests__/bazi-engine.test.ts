/**
 * 八字引擎单测（P3-5 补全）。
 */
import { calculateBazi, timeToHourIndex } from '../lib/bazi-engine';

describe('bazi-engine', () => {
  describe('timeToHourIndex', () => {
    it('返回时辰对应的中间小时', () => {
      expect(timeToHourIndex('子时')).toBe(0); // 23:00-01:00 的中间小时 0 点
      expect(timeToHourIndex('丑时')).toBe(2);
      expect(timeToHourIndex('午时')).toBe(12);
      expect(timeToHourIndex('亥时')).toBe(22);
    });
  });

  describe('calculateBazi', () => {
    it('返回完整四柱（年/月/日/时柱都有天干地支）', () => {
      const result = calculateBazi({
        birthDate: '1990-06-15',
        birthTime: '午时',
        gender: 'male',
      });
      expect(result.yearPillar.gan).toBeTruthy();
      expect(result.yearPillar.zhi).toBeTruthy();
      expect(result.monthPillar.gan).toBeTruthy();
      expect(result.monthPillar.zhi).toBeTruthy();
      expect(result.dayPillar.gan).toBeTruthy();
      expect(result.dayPillar.zhi).toBeTruthy();
      expect(result.hourPillar.gan).toBeTruthy();
      expect(result.hourPillar.zhi).toBeTruthy();
    });

    it('四柱八个字的五行统计总和为 8', () => {
      const result = calculateBazi({
        birthDate: '1990-06-15',
        birthTime: '午时',
        gender: 'male',
      });
      const f = result.fiveElements;
      const total = f.wood + f.fire + f.earth + f.metal + f.water;
      expect(total).toBe(8);
      // 至少包含两种五行
      const kinds = [f.wood, f.fire, f.earth, f.metal, f.water].filter((n) => n > 0).length;
      expect(kinds).toBeGreaterThanOrEqual(2);
    });

    it('返回简要解读和命主信息', () => {
      const result = calculateBazi({
        birthDate: '1985-01-01',
        birthTime: '子时',
        gender: 'female',
      });
      expect(result.briefComment).toBeTruthy();
      expect(result.gender).toBe('female');
    });

    it('返回大运数组（dayun）', () => {
      const result = calculateBazi({
        birthDate: '1985-01-01',
        birthTime: '子时',
        gender: 'female',
      });
      expect(Array.isArray(result.dayun)).toBe(true);
      expect((result.dayun || []).length).toBeGreaterThan(0);
      const first = (result.dayun || [])[0];
      expect(first.ganZhi).toBeTruthy();
      expect(typeof first.startAge).toBe('number');
    });
  });
});
