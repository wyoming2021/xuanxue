/**
 * P2-5 验收测试：塔罗洗牌 Fisher-Yates + 元转分精确性（P0-2 相关）。
 */

import { yuanToCents, getProduct, PAYMENT_PRODUCTS } from '../lib/payment-products';

function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

describe('payment products', () => {
  test('元转分：无浮点误差', () => {
    // 9.9 * 100 = 989.9999999999999（裸乘法会出错）
    expect(yuanToCents(9.9)).toBe(990);
    expect(yuanToCents(19.9)).toBe(1990);
    expect(yuanToCents(199)).toBe(19900);
    expect(yuanToCents(6.9)).toBe(690);
    expect(yuanToCents(1.99)).toBe(199);
  });

  test('产品目录：所有金额换算到分后与回调校验一致', () => {
    for (const product of Object.values(PAYMENT_PRODUCTS)) {
      const cents = yuanToCents(product.amountYuan);
      expect(cents).toBeGreaterThan(0);
      expect(Number.isInteger(cents)).toBe(true);
    }
  });

  test('会员时长由产品目录决定，不由金额反推', () => {
    expect(PAYMENT_PRODUCTS.membership_day.membershipDays).toBe(1);
    expect(PAYMENT_PRODUCTS.membership_month.membershipDays).toBe(30);
    expect(PAYMENT_PRODUCTS.membership_year.membershipDays).toBe(365);
    expect(PAYMENT_PRODUCTS.bazi_unlock.membershipDays).toBeNull();
  });

  test('getProduct：合法 key 返回产品，非法 key 返回 null', () => {
    expect(getProduct('bazi_unlock')?.recordType).toBe('bazi');
    expect(getProduct('membership_year')?.amountYuan).toBe(199);
    expect(getProduct('evil_key')).toBeNull();
    expect(getProduct('__proto__')).toBeNull();
    expect(getProduct('constructor')).toBeNull();
  });
});

describe('fisher-yates shuffle', () => {
  test('洗牌后包含所有原始元素（不丢牌）', () => {
    const cards = Array.from({ length: 78 }, (_, i) => i);
    const shuffled = fisherYatesShuffle(cards);
    expect(shuffled.length).toBe(78);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(cards);
  });
});
