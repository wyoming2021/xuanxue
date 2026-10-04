'use client';
import { Crown, Check, Star, Zap, Gift } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getDeviceId } from '@/lib/device';

const PLANS = [
  {
    type: 'day',
    productKey: 'membership_day',
    name: '日卡',
    price: 1.99,
    duration: '24小时',
    icon: Zap,
    color: 'blue',
    features: ['无限次解锁所有功能', '每日运势'],
    popular: false,
  },
  {
    type: 'month',
    productKey: 'membership_month',
    name: '月卡',
    price: 19.9,
    duration: '30天',
    icon: Crown,
    color: 'amber',
    features: ['无限次解锁所有功能', '每日运势', '每日运势推送'],
    popular: true,
  },
  {
    type: 'year',
    productKey: 'membership_year',
    name: '年卡',
    price: 199,
    duration: '365天',
    icon: Gift,
    color: 'purple',
    features: ['全年无限次', '运势日历', '专属客服'],
    popular: false,
  },
] as const;

export function MembershipDialog() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (productKey: string) => {
    setLoading(productKey);
    setError(null);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 只传 productKey；金额由服务端产品目录决定，不传 amount / userId
          productKey,
          deviceId: getDeviceId(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data.payUrl) {
        window.open(data.data.payUrl, '_blank');
        if (data.data.demo) {
          setError(data.data.message || '当前为演示模式，无法完成真实支付。');
        }
      } else {
        setError(data.error || '支付发起失败，请稍后再试');
      }
    } catch (err) {
      console.error('[MembershipDialog] 创建支付失败:', err);
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            className="gap-2 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
          />
        }
      >
        <Crown size={16} />
        <span className="hidden sm:inline">会员</span>
      </DialogTrigger>
      <DialogContent className="max-w-md border-black/10 bg-white dark:border-white/10 dark:bg-[#1a1a1a]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Crown size={20} className="text-amber-500" />
            开通会员
          </DialogTitle>
          <p className="text-sm text-[#737373] dark:text-[#78716c]">解锁全部功能，无限次使用</p>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.type}
                className={`relative rounded-xl border p-4 transition-all ${
                  plan.popular
                    ? 'border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20'
                    : 'border-black/10 bg-[#fafaf9] dark:border-white/10 dark:bg-white/[0.02]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    <Star size={10} className="fill-white" /> 最受欢迎
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        plan.color === 'blue'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : plan.color === 'amber'
                            ? 'bg-amber-100 dark:bg-amber-900/30'
                            : 'bg-purple-100 dark:bg-purple-900/30'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          plan.color === 'blue'
                            ? 'text-blue-600 dark:text-blue-400'
                            : plan.color === 'amber'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-purple-600 dark:text-purple-400'
                        }
                      />
                    </div>
                    <div>
                      <div className="font-serif font-bold">{plan.name}</div>
                      <div className="text-xs text-[#a3a3a3]">{plan.duration}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {plan.features.map((f) => (
                          <span
                            key={f}
                            className="flex items-center text-[10px] text-[#737373] dark:text-[#78716c]"
                          >
                            <Check size={10} className="mr-0.5 text-green-500" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="font-serif text-xl font-bold">¥{plan.price}</div>
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(plan.productKey)}
                      disabled={loading === plan.productKey}
                      className={`mt-2 ${
                        plan.popular
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-[#1c1917] text-white hover:bg-[#292524] dark:bg-[#e7e5e4] dark:text-[#1c1917]'
                      }`}
                    >
                      {loading === plan.productKey ? '...' : '购买'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-[#92400e] dark:bg-amber-950/30 dark:text-[#fbbf24]">
            {error}
          </p>
        )}

        <p className="mt-4 text-center text-[10px] text-[#a3a3a3]">
          开通即表示同意
          <a href="/terms" className="mx-0.5 underline hover:text-[#57534e]">
            《用户协议》
          </a>
          与
          <a href="/privacy" className="mx-0.5 underline hover:text-[#57534e]">
            《隐私政策》
          </a>
        </p>

        <div className="mt-2 rounded-lg bg-[#fafaf9] p-3 text-center text-xs text-[#737373] dark:bg-white/[0.02] dark:text-[#78716c]">
          💡 购买后立即生效，支持支付宝/微信支付
        </div>
      </DialogContent>
    </Dialog>
  );
}
