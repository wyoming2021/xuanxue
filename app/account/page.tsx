'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useAuth } from '@/lib/useAuth';

interface Order {
  id: string;
  record_type: string;
  product_key: string | null;
  amount: string | number;
  status: 'pending' | 'paid' | 'failed';
  created_at: string;
  paid_at: string | null;
}

const PRODUCT_NAMES: Record<string, string> = {
  bazi_unlock: '八字排盘认知报告',
  tarot_unlock_single: '塔罗单张解读',
  tarot_unlock_three: '塔罗三张牌阵解读',
  tarot_unlock_celtic: '塔罗凯尔特十字解读',
  daily_unlock: '每日运势详细解读',
  membership_day: '日卡会员（1天）',
  membership_month: '月卡会员（30天）',
  membership_year: '年卡会员（365天）',
};

const STATUS_MAP: Record<string, { text: string; className: string }> = {
  paid: {
    text: '已支付',
    className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  },
  pending: {
    text: '待支付',
    className: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  },
  failed: {
    text: '已失败',
    className: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  },
};

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function AccountPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/orders')
      .then((r) => r.json())
      .then((d) => setOrders(d.success ? d.data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[#a3a3a3]">
        加载中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-2xl font-bold">我的账户</h1>
        <p className="mb-4 text-sm text-[#a3a3a3]">请先登录后查看会员状态和订单历史。</p>
        <Link href="/" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          ← 返回首页
        </Link>
      </div>
    );
  }

  const vipExpire = user.vipExpireTime ? new Date(user.vipExpireTime) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 font-serif text-2xl font-bold">我的账户</h1>

      {/* 账户信息卡片 */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-[#a3a3a3]">登录邮箱</div>
            <div className="mt-1 font-medium text-[#1c1917] dark:text-[#e7e5e4]">{user.email}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#a3a3a3]">会员状态</div>
            <div className="mt-1">
              {user.isVip ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:from-amber-950/40 dark:to-orange-950/40 dark:text-amber-400">
                  👑 会员
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-[#57534e] dark:bg-white/5 dark:text-[#a8a29e]">
                  普通用户
                </span>
              )}
            </div>
          </div>
        </div>

        {user.isVip && vipExpire && (
          <div className="mt-4 flex flex-wrap gap-6 rounded-xl bg-amber-50/60 p-4 text-sm dark:bg-amber-950/20">
            <div>
              <span className="text-[#a3a3a3]">到期时间：</span>
              <span className="font-medium text-[#1c1917] dark:text-[#e7e5e4]">
                {vipExpire.toLocaleDateString('zh-CN')}
              </span>
            </div>
            <div>
              <span className="text-[#a3a3a3]">剩余：</span>
              <span className="font-medium text-[#1c1917] dark:text-[#e7e5e4]">
                {user.remainingDays} 天
              </span>
            </div>
          </div>
        )}

        {!user.isVip && (
          <p className="mt-4 text-sm text-[#a3a3a3]">
            开通会员可解锁全部付费内容，查看所有排盘结果。
          </p>
        )}
      </div>

      {/* 订单历史 */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
        <h2 className="mb-4 font-serif text-lg font-bold">订单历史</h2>
        {ordersLoading ? (
          <p className="py-6 text-center text-sm text-[#a3a3a3]">加载中...</p>
        ) : !orders || orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#a3a3a3]">暂无订单记录。</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const status = STATUS_MAP[o.status] || STATUS_MAP.pending;
              const name = (o.product_key && PRODUCT_NAMES[o.product_key]) || '玄语订单';
              return (
                <div
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-[#fafaf9] px-4 py-3 dark:border-white/5 dark:bg-white/[0.02]"
                >
                  <div>
                    <div className="font-medium text-[#1c1917] dark:text-[#e7e5e4]">{name}</div>
                    <div className="mt-0.5 text-xs text-[#a3a3a3]">
                      {formatTime(o.created_at)} · ¥{Number(o.amount).toFixed(2)}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.text}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
