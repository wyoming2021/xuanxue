/**
 * 服务端唯一可信的产品与价格目录（P0-2）。
 *
 * 支付创建接口只接受 productKey，金额完全由这里决定，
 * 客户端传来的任何 amount 一律忽略。
 *
 * 价格来源（2026-09 核实）：
 * - 八字单次解锁：app/bazi/result/[id]/page.tsx 中的 PayWall price={9.9}
 * - 塔罗各牌阵：lib/tarot-data.ts SPREAD_CONFIGS 的 price 字段
 * - 每日运势单次解锁：app/daily/DailyContainer.tsx PayWall 价位 6.9
 * - 会员日/月/年卡：components/MembershipDialog.tsx PLANS
 */

export type MembershipType = 'day' | 'month' | 'year';

export type ProductKey =
  | 'bazi_unlock'
  | 'tarot_unlock_single'
  | 'tarot_unlock_three'
  | 'tarot_unlock_celtic'
  | 'daily_unlock'
  | 'membership_day'
  | 'membership_month'
  | 'membership_year';

export interface PaymentProduct {
  key: ProductKey;
  /** 订单标题（展示给用户） */
  title: string;
  /** 单位：元。整数按元存储，换算分值时精确计算。 */
  amountYuan: number;
  /** 会员产品：延长天数；单次解锁产品：null */
  membershipDays: number | null;
  /** 关联的业务记录类型（与 orders.record_type 对应） */
  recordType: 'bazi' | 'tarot' | 'daily' | 'membership';
}

const yuan = (n: number) => n;

export const PAYMENT_PRODUCTS: Record<ProductKey, PaymentProduct> = {
  bazi_unlock: {
    key: 'bazi_unlock',
    title: '玄语八字排盘认知报告',
    amountYuan: yuan(9.9),
    membershipDays: null,
    recordType: 'bazi',
  },
  tarot_unlock_single: {
    key: 'tarot_unlock_single',
    title: '玄语塔罗单张解读',
    amountYuan: yuan(6.9),
    membershipDays: null,
    recordType: 'tarot',
  },
  tarot_unlock_three: {
    key: 'tarot_unlock_three',
    title: '玄语塔罗三张牌阵解读',
    amountYuan: yuan(9.9),
    membershipDays: null,
    recordType: 'tarot',
  },
  tarot_unlock_celtic: {
    key: 'tarot_unlock_celtic',
    title: '玄语塔罗凯尔特十字解读',
    amountYuan: yuan(19.9),
    membershipDays: null,
    recordType: 'tarot',
  },
  daily_unlock: {
    key: 'daily_unlock',
    title: '玄语每日运势详细解读',
    amountYuan: yuan(6.9),
    membershipDays: null,
    recordType: 'daily',
  },
  membership_day: {
    key: 'membership_day',
    title: '玄语日卡会员（1天）',
    amountYuan: yuan(1.99),
    membershipDays: 1,
    recordType: 'membership',
  },
  membership_month: {
    key: 'membership_month',
    title: '玄语月卡会员（30天）',
    amountYuan: yuan(19.9),
    membershipDays: 30,
    recordType: 'membership',
  },
  membership_year: {
    key: 'membership_year',
    title: '玄语年卡会员（365天）',
    amountYuan: yuan(199),
    membershipDays: 365,
    recordType: 'membership',
  },
};

export function getProduct(key: string): PaymentProduct | null {
  return Object.prototype.hasOwnProperty.call(PAYMENT_PRODUCTS, key)
    ? PAYMENT_PRODUCTS[key as ProductKey]
    : null;
}

/**
 * 元转分，避免浮点误差（P0-2 修复要求）。
 * 9.9 * 100 === 989.9999999999999 这类误差会破坏回调金额校验。
 */
export function yuanToCents(amountYuan: number): number {
  return Math.round(amountYuan * 100);
}
