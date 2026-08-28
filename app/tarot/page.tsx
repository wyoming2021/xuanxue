"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeviceId } from "@/lib/device";
import { SPREAD_CONFIGS } from "@/lib/tarot-data";

export default function TarotPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState<"single" | "three" | "celtic">("single");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question || "请给我指引",
          spreadType,
          deviceId: getDeviceId(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/tarot/result/${data.data.recordId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 page-transition">
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl text-brand-gold">塔罗占卜</CardTitle>
          <p className="text-sm text-brand-muted">专注你的问题，让塔罗为你指引方向</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                placeholder="如：我下个月的工作运势如何？"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="border-white/10 bg-white/5"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-brand-muted">选择牌阵</p>
              <div className="grid grid-cols-1 gap-3">
                {(Object.entries(SPREAD_CONFIGS) as [string, (typeof SPREAD_CONFIGS)[keyof typeof SPREAD_CONFIGS]][]).map(
                  ([key, config]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={spreadType === key ? "default" : "outline"}
                      onClick={() => setSpreadType(key as any)}
                      className="justify-between"
                    >
                      <span>
                        {config.name}（{config.count}张牌）
                      </span>
                      <span className="text-brand-gold">¥{config.price}</span>
                    </Button>
                  )
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gold text-black hover:bg-brand-gold-light"
            >
              {loading ? "抽牌中..." : "开始抽牌"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
