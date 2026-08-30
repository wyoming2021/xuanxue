'use client';
import { Lock, Loader2, Shield, Star, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { getDeviceId } from '@/lib/device';
import { useAuth } from '@/lib/useAuth';

interface PayWallProps {
  recordType: 'bazi' | 'tarot' | 'daily';
  recordId: string;
  price: number;
  onSuccess: () => void;
}

export function PayWall({ recordType, recordId, price, onSuccess }: PayWallProps) {
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const { user } = useAuth();

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordType,
          recordId,
          amount: price,
          deviceId: user ? undefined : getDeviceId(),
          userId: user?.userId,
        }),
      });
      const data = await res.json();
      if (data.success && data.data.payUrl) {
        window.open(data.data.payUrl, '_blank');
        setPolling(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Poll payment status
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      try {
        const param = user?.userId ? `userId=${user.userId}` : `deviceId=${getDeviceId()}`;
        const res = await fetch(`/api/user/status?${param}`);
        const data = await res.json();
        if (data.success) {
          clearInterval(interval);
          setPolling(false);
          onSuccess();
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [polling, onSuccess, user]);

  // Countdown timer
  useEffect(() => {
    if (!polling || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [polling, countdown]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white dark:border-indigo-900 dark:from-indigo-950/30 dark:to-transparent">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />

      {/* Blur overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/60 via-white/80 to-white dark:from-[#0f0f0f]/60 dark:via-[#0f0f0f]/80 dark:to-[#0f0f0f]" />

      {/* Content hint */}
      <div className="relative px-6 py-8 text-center opacity-20 blur-[2px]">
        <p className="text-sm text-[#737373]">此处为详细解读内容...</p>
        <p className="mt-2 text-sm text-[#737373]">解锁后可查看完整分析...</p>
      </div>

      {/* CTA */}
      <div className="relative z-20 px-6 pb-8 pt-4 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md">
          <Lock size={12} />
          付费解锁完整内容
        </div>

        <h3 className="mb-2 font-serif text-xl font-bold">解锁详细解读</h3>
        <p className="mb-4 text-sm text-[#737373] dark:text-[#78716c]">
          获取专属的深度分析和个性化建议
        </p>

        <div className="mb-6">
          <span className="font-serif text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            ¥{price}
          </span>
          <span className="ml-2 text-sm text-[#a3a3a3]">一次购买，永久查看</span>
        </div>

        <Button
          onClick={handlePay}
          disabled={loading}
          className="h-14 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-base font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              生成支付链接...
            </span>
          ) : polling ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              等待支付完成... ({countdown}s)
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Lock size={18} />
              立即解锁
            </span>
          )}
        </Button>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-1">
            <Shield size={16} className="text-green-500" />
            <span className="text-[10px] text-[#a3a3a3]">安全支付</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users size={16} className="text-blue-500" />
            <span className="text-[10px] text-[#a3a3a3]">已有 2,341 人解锁</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Clock size={16} className="text-amber-500" />
            <span className="text-[10px] text-[#a3a3a3]">30秒获得报告</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1 text-xs text-[#a3a3a3]">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
          ))}
          <span className="ml-1">4.9/5 用户好评</span>
        </div>
      </div>
    </div>
  );
}
