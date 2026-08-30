'use client';
import { ArrowLeft, Loader2, Globe, Star, Info, Circle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getDeviceId } from '@/lib/device';

const ELEMENT_COLORS: Record<string, string> = {
  火: 'text-red-500 bg-red-50 dark:bg-red-950/30',
  土: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
  风: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
  水: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
};

export default function XingpanPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({ birthDate: '', birthTime: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.birthDate || !form.birthTime) return;
    setLoading(true);

    try {
      const res = await fetch('/api/xingpan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setResult(data.data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="page-transition">
        <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
            <button
              onClick={() => setResult(null)}
              className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
            >
              <ArrowLeft className="h-4 w-4" /> 重新排盘
            </button>
            <h1 className="mb-2 font-serif text-3xl font-bold">🌌 你的星盘</h1>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <div className="space-y-8">
            {/* 三大主星 */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '太阳星座', data: result.sunSign, desc: '核心自我' },
                { label: '月亮星座', data: result.moonSign, desc: '情感内在' },
                { label: '上升星座', data: result.risingSign, desc: '外在表现' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-black/5 bg-white p-5 text-center dark:border-white/5 dark:bg-white/[0.03]"
                >
                  <div className="mb-1 text-xs text-[#737373]">{item.label}</div>
                  <div className="mb-1 text-4xl">{item.data.symbol}</div>
                  <div className="font-serif text-lg font-bold">{item.data.name}</div>
                  <div
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${ELEMENT_COLORS[item.data.element]}`}
                  >
                    {item.data.element}象 · {item.data.quality}
                  </div>
                  <div className="mt-2 text-xs text-[#a3a3a3]">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* 行星分布 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold">
                <Star size={18} className="text-amber-500" />
                行星分布
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {result.planets.map((planet: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-xl border border-black/5 bg-[#fafaf9] p-3 text-center dark:border-white/5 dark:bg-white/[0.02]"
                  >
                    <div className="text-lg">{planet.symbol}</div>
                    <div className="text-xs font-medium">{planet.name}</div>
                    <div className={`mt-1 text-[10px] ${ELEMENT_COLORS[planet.element]}`}>
                      {planet.signSymbol} {planet.sign}
                    </div>
                    <div className="text-[10px] text-[#a3a3a3]">{planet.houseName}</div>
                    {planet.retrograde && <div className="text-[10px] text-red-500">逆行 ♃</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* 元素平衡 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold">
                <Circle size={18} className="text-indigo-500" />
                元素平衡
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(result.elementBalance as Record<string, number>).map(
                  ([element, count]) => (
                    <div key={element} className="text-center">
                      <div
                        className={`mx-auto mb-2 h-16 w-16 rounded-full flex items-center justify-center text-2xl ${ELEMENT_COLORS[element]}`}
                      >
                        {count}
                      </div>
                      <div className="text-sm font-medium">{element}象</div>
                      <div className="text-[10px] text-[#a3a3a3]">{getElementTrait(element)}</div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* 相位分析 */}
            {result.aspects.length > 0 && (
              <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
                <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold">
                  <Info size={18} className="text-green-500" />
                  主要相位
                </h3>
                <div className="space-y-2">
                  {result.aspects.slice(0, 6).map((aspect: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg bg-[#fafaf9] p-3 dark:bg-white/[0.02]"
                    >
                      <span className="font-medium">{aspect.planet1}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          aspect.nature === '和谐'
                            ? 'bg-green-100 text-green-700'
                            : aspect.nature === '紧张'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {aspect.type} {aspect.symbol}
                      </span>
                      <span className="font-medium">{aspect.planet2}</span>
                      <span className="text-xs text-[#a3a3a3]">{aspect.nature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 宫位分布 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-4 font-serif text-lg font-bold">宫位分布</h3>
              <div className="grid grid-cols-3 gap-3">
                {result.houses.map((house: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-xl border border-black/5 bg-[#fafaf9] p-3 dark:border-white/5 dark:bg-white/[0.02]"
                  >
                    <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {house.name}
                    </div>
                    <div className="mt-1 text-[10px] text-[#737373]">{house.meaning}</div>
                    {house.planet && (
                      <div className="mt-1 text-[10px] font-medium text-amber-600">
                        ✦ {house.planet}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 星盘解读 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-3 font-serif text-lg font-bold">星盘解读</h3>
              <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                {result.briefComment}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" /> 返回首页
          </Link>
          <h1 className="mb-3 font-serif text-3xl font-bold sm:text-4xl">🌌 星盘占星</h1>
          <p className="text-[#737373] dark:text-[#78716c]">西方占星学，解读你的星盘配置</p>
        </div>
      </div>
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              出生日期 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              required
              value={form.birthDate}
              onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
              className="h-12 rounded-xl border-black/10 bg-white dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              出生时间 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="time"
              required
              value={form.birthTime}
              onChange={(e) => setForm((f) => ({ ...f, birthTime: e.target.value }))}
              className="h-12 rounded-xl border-black/10 bg-white dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !form.birthDate || !form.birthTime}
            className="h-12 w-full rounded-xl bg-[#1c1917] text-base font-semibold text-white hover:bg-[#292524] disabled:opacity-50 dark:bg-[#e7e5e4] dark:text-[#1c1917]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 排盘中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> 开始排盘
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function getElementTrait(element: string): string {
  const traits: Record<string, string> = {
    火: '热情、行动力',
    土: '稳定、实际',
    风: '沟通、思维',
    水: '情感、直觉',
  };
  return traits[element] || '';
}
