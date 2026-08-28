"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PayWall } from "@/components/PayWall";
import { getDeviceId } from "@/lib/device";
import { Star, Heart, Briefcase, Wallet, Activity, Palette } from "lucide-react";

const ZODIACS = [
  { name: "白羊座", symbol: "♈", dates: "3.21-4.19" },
  { name: "金牛座", symbol: "♉", dates: "4.20-5.20" },
  { name: "双子座", symbol: "♊", dates: "5.21-6.21" },
  { name: "巨蟹座", symbol: "♋", dates: "6.22-7.22" },
  { name: "狮子座", symbol: "♌", dates: "7.23-8.22" },
  { name: "处女座", symbol: "♍", dates: "8.23-9.22" },
  { name: "天秤座", symbol: "♎", dates: "9.23-10.23" },
  { name: "天蝎座", symbol: "♏", dates: "10.24-11.22" },
  { name: "射手座", symbol: "♐", dates: "11.23-12.21" },
  { name: "摩羯座", symbol: "♑", dates: "12.22-1.19" },
  { name: "水瓶座", symbol: "♒", dates: "1.20-2.18" },
  { name: "双鱼座", symbol: "♓", dates: "2.19-3.20" },
];

export default function DailyPage() {
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null);
  const [fortune, setFortune] = useState<any>(null);
  const [fortuneId, setFortuneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFortune = async (zodiac: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daily?zodiac=${zodiac}&deviceId=${getDeviceId()}`);
      const data = await res.json();
      if (data.success) {
        setFortune(data.data.content);
        setFortuneId(data.data.fortuneId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedZodiac) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 page-transition">
        <h1 className="mb-2 text-center font-serif text-2xl font-bold text-brand-gold">每日运势</h1>
        <p className="mb-8 text-center text-sm text-brand-muted">选择你的星座，查看今日运势</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {ZODIACS.map((z) => (
            <Button
              key={z.name}
              variant="outline"
              className="h-24 flex-col border-white/10 bg-white/5 hover:border-brand-gold hover:bg-brand-gold/10"
              onClick={() => {
                setSelectedZodiac(z.name);
                fetchFortune(z.name);
              }}
            >
              <span className="text-2xl">{z.symbol}</span>
              <span className="mt-1 text-xs">{z.name}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 page-transition">
      <Button
        variant="ghost"
        onClick={() => {
          setSelectedZodiac(null);
          setFortune(null);
        }}
        className="mb-6"
      >
        ← 返回选择星座
      </Button>

      <h1 className="mb-2 text-center font-serif text-2xl font-bold text-brand-gold">
        {ZODIACS.find((z) => z.name === selectedZodiac)?.symbol} {selectedZodiac}今日运势
      </h1>
      <p className="mb-8 text-center text-sm text-brand-muted">
        {new Date().toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {loading ? (
        <div className="text-center text-brand-muted">运势加载中...</div>
      ) : fortune ? (
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5">
            <CardContent className="pt-6 text-center">
              <div className="mb-2 text-4xl">
                {"★".repeat(fortune.overallScore)}
                {"☆".repeat(5 - fortune.overallScore)}
              </div>
              <p className="text-lg font-serif text-brand-gold">{fortune.summary}</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-brand-gold">
                <Star size={18} />
                <span className="font-serif">今日寄语</span>
              </div>
              <p className="mt-2 text-gray-300">
                珍惜今天遇到的每一个机会，保持积极心态。
              </p>
            </CardContent>
          </Card>

          {!fortune.isUnlocked && fortuneId && (
            <PayWallClient fortuneId={fortuneId} zodiac={selectedZodiac} />
          )}

          {fortune.isUnlocked && (
            <>
              <Card className="border-white/10 bg-white/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-pink-400">
                    <Heart size={18} /> <span className="font-serif">爱情运势</span>
                  </div>
                  <p className="mt-2 text-gray-300">{fortune.love}</p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Briefcase size={18} /> <span className="font-serif">事业运势</span>
                  </div>
                  <p className="mt-2 text-gray-300">{fortune.career}</p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Wallet size={18} /> <span className="font-serif">财富运势</span>
                  </div>
                  <p className="mt-2 text-gray-300">{fortune.wealth}</p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-400">
                    <Activity size={18} /> <span className="font-serif">健康提醒</span>
                  </div>
                  <p className="mt-2 text-gray-300">{fortune.health}</p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Palette size={18} /> <span className="font-serif">幸运指南</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-gray-300">
                    <span>幸运色：{fortune.luckyColor}</span>
                    <span>幸运数字：{fortune.luckyNumber}</span>
                    <span>速配星座：{fortune.compatibleZodiac}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function PayWallClient({ fortuneId, zodiac }: { fortuneId: string; zodiac: string }) {
  return (
    <PayWall
      recordType="daily"
      recordId={fortuneId}
      price={3.9}
      onSuccess={() => window.location.reload()}
    />
  );
}
