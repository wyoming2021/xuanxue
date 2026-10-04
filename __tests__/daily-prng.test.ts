/**
 * P2-2 验收测试：每日运势伪随机数生成器。
 *
 * 旧行为：rand() 不迭代状态，爱情/事业/财运/健康四项永远取同一档。
 * 新行为：mulberry32 迭代，四项分数独立分散。
 */

// 与 app/api/daily/route.ts 中 generateFortune 相同的 PRNG 实现（复制测试，避免导入 route 依赖 NextRequest）
function buildRand(seedInput: string) {
  let seed = 0x811c9dc5;
  for (let i = 0; i < seedInput.length; i++) {
    seed ^= seedInput.charCodeAt(i);
    seed = Math.imul(seed, 0x01000193) >>> 0;
  }

  let state = seed >>> 0;
  return (n: number) => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const x = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return Math.floor(x * n);
  };
}

const LOVE_FORTUNES = [{ score: 5 }, { score: 4 }, { score: 3 }, { score: 2 }, { score: 1 }];

describe('daily fortune PRNG', () => {
  test('固定星座 + 固定日期：四项分数不会必然相同', () => {
    // 用多个星座与日期验证存在分散，而非全同
    const zodiacs = [
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
    const dates = ['2026-09-06', '2026-09-07', '2026-10-01', '2026-12-25'];

    let allSameCount = 0;
    const combos = zodiacs.length * dates.length;

    for (const zodiac of zodiacs) {
      for (const date of dates) {
        const rand = buildRand(`${date}|${zodiac}`);
        const scores = [rand(5), rand(5), rand(5), rand(5)].map((i) => LOVE_FORTUNES[i].score);
        const allSame = scores.every((s) => s === scores[0]);
        if (allSame) allSameCount += 1;
      }
    }

    // 若随机状态不迭代，所有组合都会四项全同（旧行为全量失败）。
    // 允许偶尔同分（1/5^3 ≈ 0.8% 单组合概率），但绝不允许全量同分。
    expect(allSameCount).toBeLessThan(combos);
    expect(allSameCount).toBeLessThanOrEqual(Math.ceil(combos * 0.1));
  });

  test('同一星座同一天：结果可复现', () => {
    const gen = () => {
      const rand = buildRand('2026-09-07|白羊座');
      return [
        rand(3),
        rand(5),
        rand(5),
        rand(5),
        rand(5),
        rand(5),
        rand(12),
        rand(16),
        rand(8),
        rand(3),
      ];
    };
    expect(gen()).toEqual(gen());
  });

  test('不同星座同一天：结果有差异', () => {
    const gen = (zodiac: string) => {
      const rand = buildRand(`2026-09-07|${zodiac}`);
      return [rand(5), rand(5), rand(5), rand(5)];
    };
    const a = gen('白羊座');
    const b = gen('金牛座');
    const c = gen('双鱼座');
    // 12 星座全部相同的概率是 (1/625)^11，几乎不可能
    expect(a.join(',') === b.join(',') && b.join(',') === c.join(',')).toBe(false);
  });
});
