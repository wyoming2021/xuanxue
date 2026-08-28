"use client";
import type { BaziResult as BaziResultType } from "@/types";

interface Props {
  result: BaziResultType;
}

const ELEMENT_COLORS: Record<string, string> = {
  wood: "bg-green-500",
  fire: "bg-red-500",
  earth: "bg-yellow-500",
  metal: "bg-gray-300",
  water: "bg-blue-500",
};

const ELEMENT_NAMES: Record<string, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水",
};

export function BaziResult({ result }: Props) {
  const pillars = [
    { label: "年柱", data: result.yearPillar },
    { label: "月柱", data: result.monthPillar },
    { label: "日柱", data: result.dayPillar },
    { label: "时柱", data: result.hourPillar },
  ];

  const maxElement = Math.max(...Object.values(result.fiveElements));

  return (
    <div className="space-y-8 page-transition">
      <div className="grid grid-cols-4 gap-3">
        {pillars.map((p, i) => (
          <div
            key={p.label}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="mb-2 text-xs text-brand-muted">{p.label}</div>
            <div className="font-serif text-2xl font-bold text-brand-gold">{p.data.gan}</div>
            <div className="font-serif text-2xl font-bold text-brand-gold">{p.data.zhi}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 font-serif text-lg text-brand-gold">五行分布</h3>
        <div className="space-y-3">
          {Object.entries(result.fiveElements).map(([el, count]) => (
            <div key={el} className="flex items-center gap-3">
              <span className="w-8 text-sm text-brand-muted">{ELEMENT_NAMES[el]}</span>
              <div className="flex-1 h-4 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full ${ELEMENT_COLORS[el]} transition-all duration-1000`}
                  style={{ width: `${(count / Math.max(maxElement, 1)) * 100}%` }}
                />
              </div>
              <span className="w-4 text-sm text-brand-muted">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-3 font-serif text-lg text-brand-gold">总评</h3>
        <p className="leading-relaxed text-gray-300">{result.briefComment}</p>
      </div>

      {result.detailedAnalysis && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-3 font-serif text-lg text-brand-gold">性格分析</h3>
            <p className="leading-relaxed text-gray-300">{result.detailedAnalysis.personality}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-3 font-serif text-lg text-brand-gold">事业财运</h3>
            <p className="leading-relaxed text-gray-300">{result.detailedAnalysis.careerWealth}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-3 font-serif text-lg text-brand-gold">婚姻感情</h3>
            <p className="leading-relaxed text-gray-300">{result.detailedAnalysis.marriage}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-3 font-serif text-lg text-brand-gold">五行喜忌与开运建议</h3>
            <p className="leading-relaxed text-gray-300">{result.detailedAnalysis.fiveElementAdvice}</p>
          </div>
        </div>
      )}
    </div>
  );
}
