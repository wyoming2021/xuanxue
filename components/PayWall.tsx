"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getDeviceId } from "@/lib/device";
import { Lock, Sparkles } from "lucide-react";

interface PayWallProps {
  recordType: "bazi" | "tarot" | "daily";
  recordId: string;
  price: number;
  onSuccess: () => void;
}

export function PayWall({ recordType, recordId, price, onSuccess }: PayWallProps) {
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordType,
          recordId,
          amount: price,
          deviceId: getDeviceId(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.open(data.data.payUrl, "_blank");
        setPolling(true);
        startPolling(data.data.orderId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (_orderId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/user/status?deviceId=${getDeviceId()}`);
        const data = await res.json();
        if (data.success && data.data.isVip) {
          clearInterval(interval);
          onSuccess();
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);
    setTimeout(() => clearInterval(interval), 300000);
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-b from-transparent via-brand-dark/50 to-brand-dark" />
      </div>

      <div className="relative z-20 -mt-32 mx-auto max-w-sm rounded-2xl border border-white/10 bg-brand-dark/90 p-8 text-center shadow-2xl backdrop-blur-md">
        <Lock className="mx-auto mb-4 text-brand-gold" size={32} />
        <h3 className="mb-2 font-serif text-xl font-bold text-brand-gold">解锁完整解读</h3>
        <p className="mb-4 text-sm text-brand-muted">获得您的专属详细分析报告</p>
        <div className="mb-4 text-3xl font-bold text-white">¥{price}</div>
        <Button
          onClick={handleUnlock}
          disabled={loading || polling}
          className="w-full bg-brand-gold text-black hover:bg-brand-gold-light"
        >
          {loading ? (
            "创建订单中..."
          ) : polling ? (
            "等待支付..."
          ) : (
            <>
              <Sparkles className="mr-2" size={16} /> 立即解锁
            </>
          )}
        </Button>
        <p className="mt-3 text-xs text-brand-muted">已有 1,234 人解锁 · 30秒获得专属报告</p>
      </div>
    </div>
  );
}
