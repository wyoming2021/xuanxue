'use client';
import { Lock, Loader2, Shield, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { getDeviceId } from '@/lib/device';

interface PayWallProps {
  recordType: 'bazi' | 'tarot' | 'daily';
  recordId: string;
  /** 展示用价格，实际扣款金额由服务端产品目录决定 */
  price: number;
  productKey: string;
  onSuccess: () => void;
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120 * 1000;

export function PayWall({ recordType, recordId, price, productKey, onSuccess }: PayWallProps) {
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [countdown, setCountdown] = useState(POLL_TIMEOUT_MS / 1000);
  const [error, setError] = useState<string | null>(null);
  const orderIdRef = useRef<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 只传 productKey；金额由服务端决定，不传 amount / userId
          productKey,
          recordId,
          deviceId: getDeviceId(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data.payUrl) {
        orderIdRef.current = data.data.orderId;
        window.open(data.data.payUrl, '_blank');
        if (!data.data.demo) {
          // 演示模式下没有真实支付可等，不轮询
          setCountdown(POLL_TIMEOUT_MS / 1000);
          setPolling(true);
        } else {
          setError(data.data.message || '当前为演示模式，无法完成真实支付。');
        }
      } else {
        setError(data.error || '支付发起失败，请稍后再试');
      }
    } catch (err) {
      console.error('[PayWall] 创建支付失败:', err);
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 轮询订单支付状态（不再轮询 VIP 状态——单次解锁与 VIP 无关）
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      const orderId = orderIdRef.current;
      if (!orderId) return;
      try {
        const param = `orderId=${orderId}&deviceId=${getDeviceId()}`;
        const res = await fetch(`/api/payment/status?${param}`);
        const data = await res.json();
        if (data.success && data.data.status === 'paid') {
          clearInterval(interval);
          setPolling(false);
          onSuccess();
        }
      } catch (err) {
        console.error('[PayWall] 查询支付状态失败:', err);
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [polling, onSuccess]);

  // 倒计时：到 0 时停止轮询并提示（setState 在 timer 回调里，不在 effect 同步体内）
  useEffect(() => {
    if (!polling) return;
    if (countdown <= 0) {
      const stop = setTimeout(() => {
        setPolling(false);
        setError('等待支付超时。完成付款后刷新页面即可查看内容。');
      }, 0);
      return () => clearTimeout(stop);
    }
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
          disabled={loading || polling}
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

        {error && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-[#92400e] dark:bg-amber-950/30 dark:text-[#fbbf24]">
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-1">
            <Shield size={16} className="text-green-500" />
            <span className="text-[10px] text-[#a3a3a3]">第三方安全支付</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Clock size={16} className="text-amber-500" />
            <span className="text-[10px] text-[#a3a3a3]">支付后立即解锁</span>
          </div>
        </div>
      </div>
    </div>
  );
}
