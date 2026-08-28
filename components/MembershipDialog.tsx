"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getDeviceId } from "@/lib/device";
import { Crown, Check } from "lucide-react";

const PLANS = [
  {
    type: "day",
    name: "日卡",
    price: 1.99,
    duration: "24小时",
    features: ["无限次解锁所有功能", "每日运势"],
  },
  {
    type: "month",
    name: "月卡",
    price: 19.9,
    duration: "30天",
    features: ["无限次解锁所有功能", "每日运势", "每日运势推送"],
  },
  {
    type: "year",
    name: "年卡",
    price: 199,
    duration: "365天",
    features: ["无限次解锁所有功能", "每日运势", "运势日历", "专属客服"],
  },
];

export function MembershipDialog() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (type: string, amount: number) => {
    setLoading(type);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordType: "membership",
          amount,
          deviceId: getDeviceId(),
          membershipType: type,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.open(data.data.payUrl, "_blank");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" className="text-brand-gold hover:bg-brand-gold/10" />}>
        <Crown size={16} className="mr-2" /> 会员
      </DialogTrigger>
      <DialogContent className="max-w-lg border-white/10 bg-brand-dark">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-brand-gold">开通会员</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          {PLANS.map((plan) => (
            <div
              key={plan.type}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div>
                <div className="font-serif font-bold text-white">{plan.name}</div>
                <div className="text-sm text-brand-muted">{plan.duration}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {plan.features.map((f) => (
                    <span key={f} className="flex items-center text-xs text-brand-muted">
                      <Check size={10} className="mr-1 text-green-400" /> {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-brand-gold">¥{plan.price}</div>
                <Button
                  size="sm"
                  onClick={() => handlePurchase(plan.type, plan.price)}
                  disabled={loading === plan.type}
                  className="mt-2 bg-brand-gold text-black hover:bg-brand-gold-light"
                >
                  {loading === plan.type ? "..." : "购买"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
