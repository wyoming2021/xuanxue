'use client';
import { Calendar, TrendingUp, Star, Clock, ArrowRight, Info } from 'lucide-react';

import type { BaziResult as BaziResultType } from '@/types';

interface Props {
  result: BaziResultType;
}

const ELEMENT_COLORS: Record<string, string> = {
  wood: 'bg-green-500',
  fire: 'bg-red-500',
  earth: 'bg-amber-500',
  metal: 'bg-gray-400',
  water: 'bg-blue-500',
};

const ELEMENT_NAMES: Record<string, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

export function BaziResult({ result }: Props) {
  const pillars = [
    { label: '年柱', data: result.yearPillar },
    { label: '月柱', data: result.monthPillar },
    { label: '日柱', data: result.dayPillar },
    { label: '时柱', data: result.hourPillar },
  ];

  const maxElement = Math.max(...Object.values(result.fiveElements));

  return (
    <div className="space-y-8">
      {/* 基本信息 */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
        <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold">
          <Info size={18} className="text-indigo-600 dark:text-indigo-400" />
          基本信息
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <InfoItem label="生肖" value={result.shengxiao || '未知'} />
          <InfoItem label="命格" value={result.nayin} />
          <InfoItem label="性别" value={result.gender === 'male' ? '男' : '女'} />
          <InfoItem label="年龄" value={`${result.age || '未知'}岁`} />
        </div>
      </div>

      {/* 四柱八字 */}
      <div className="grid grid-cols-4 gap-3">
        {pillars.map((p, i) => (
          <div
            key={p.label}
            className="animate-scale-in rounded-2xl border border-black/5 bg-white p-5 text-center shadow-sm dark:border-white/5 dark:bg-white/[0.03]"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="mb-2 text-xs font-medium text-[#737373] dark:text-[#78716c]">
              {p.label}
            </div>
            <div className="font-serif text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {p.data.gan}
            </div>
            <div className="font-serif text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {p.data.zhi}
            </div>
          </div>
        ))}
      </div>

      {/* 十神分析 */}
      {result.shishen && (
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
          <h3 className="mb-4 font-serif text-lg font-bold">性格特质分析</h3>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <ShishenItem
              label="年柱"
              gan={result.yearPillar.gan}
              shishen={result.shishen.yearShishen}
            />
            <ShishenItem
              label="月柱"
              gan={result.monthPillar.gan}
              shishen={result.shishen.monthShishen}
            />
            <ShishenItem label="日柱" gan={result.dayPillar.gan} shishen="日主" />
            <ShishenItem
              label="时柱"
              gan={result.hourPillar.gan}
              shishen={result.shishen.hourShishen}
            />
          </div>
        </div>
      )}

      {/* 五行分布 */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
        <h3 className="mb-4 font-serif text-lg font-bold">你的五行能量分布</h3>
        <div className="space-y-3">
          {Object.entries(result.fiveElements).map(([el, count]) => (
            <div key={el} className="flex items-center gap-3">
              <span className="w-8 text-sm font-medium text-[#57534e] dark:text-[#a8a29e]">
                {ELEMENT_NAMES[el]}
              </span>
              <div className="flex-1 h-3 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full ${ELEMENT_COLORS[el]} transition-all duration-1000`}
                  style={{ width: `${(count / Math.max(maxElement, 1)) * 100}%` }}
                />
              </div>
              <span className="w-4 text-sm text-[#737373] dark:text-[#78716c]">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 总评 */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
        <h3 className="mb-3 font-serif text-lg font-bold">总评</h3>
        <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">{result.briefComment}</p>
      </div>

      {/* 大运信息 */}
      {result.dayun && result.dayun.length > 0 && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-800 dark:bg-indigo-950/20">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-indigo-700 dark:text-indigo-300">
            <Calendar size={18} />
            未来运势走势
          </h3>

          {/* 当前大运 */}
          {result.currentDayun && (
            <div className="mb-4 rounded-xl bg-white/50 p-4 dark:bg-white/[0.05]">
              <div className="mb-2 text-sm text-indigo-600 dark:text-indigo-400">
                你当前的运势阶段（{result.age}岁）
              </div>
              <div className="flex items-center gap-3">
                <span className="font-serif text-2xl font-bold">{result.currentDayun.ganZhi}</span>
                <span className="text-sm text-[#737373] dark:text-[#78716c]">
                  {result.currentDayun.startYear}-{result.currentDayun.endYear}年
                </span>
              </div>
              <p className="mt-2 text-sm text-[#57534e] dark:text-[#a8a29e]">
                {result.currentDayun.comment}
              </p>
            </div>
          )}

          {/* 大运列表 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {result.dayun.map((dy, i) => (
              <div
                key={i}
                className={`rounded-xl p-3 text-center transition-all ${
                  result.currentDayun?.ganZhi === dy.ganZhi
                    ? 'border-2 border-indigo-500 bg-white dark:bg-white/[0.1]'
                    : 'border border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.05]'
                }`}
              >
                <div className="text-xs text-[#a3a3a3]">
                  {dy.startAge}-{dy.endAge}岁
                </div>
                <div className="font-serif text-lg font-bold">{dy.ganZhi}</div>
                <div className="text-xs text-[#737373] dark:text-[#78716c]">{dy.element}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 流年信息 */}
      {result.liunian && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-amber-700 dark:text-amber-300">
            <TrendingUp size={18} />
            {result.liunian.year}年运势分析
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <div className="text-[#a3a3a3]">年份属性</div>
              <div className="font-medium">{result.liunian.gan}</div>
            </div>
            <div>
              <div className="text-[#a3a3a3]">年份特征</div>
              <div className="font-medium">{result.liunian.zhi}</div>
            </div>
            <div>
              <div className="text-[#a3a3a3]">五行属性</div>
              <div className="font-medium">{result.liunian.element}</div>
            </div>
            <div>
              <div className="text-[#a3a3a3]">生肖</div>
              <div className="font-medium">{result.liunian.shengxiao}</div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-white/50 p-4 dark:bg-white/[0.05]">
            <p className="text-sm text-[#57534e] dark:text-[#a8a29e]">{result.liunian.comment}</p>
          </div>
        </div>
      )}

      {/* 详细分析（如果有） */}
      {result.detailedAnalysis && (
        <div className="space-y-6">
          <AnalysisCard title="性格分析" content={result.detailedAnalysis.personality} />
          <AnalysisCard title="事业财运" content={result.detailedAnalysis.careerWealth} />
          <AnalysisCard title="婚姻感情" content={result.detailedAnalysis.marriage} />
          <AnalysisCard title="开运建议" content={result.detailedAnalysis.fiveElementAdvice} />
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[#a3a3a3]">{label}</div>
      <div className="mt-0.5 font-medium">{value || '-'}</div>
    </div>
  );
}

const SHISHEN_LABELS: Record<string, string> = {
  比肩: '同类型',
  劫财: '竞争者',
  食神: '创造力',
  伤官: '表现力',
  偏财: '偏财运',
  正财: '正财运',
  七杀: '压力源',
  正官: '规则感',
  偏印: '灵感力',
  正印: '贵人运',
  日主: '你自己',
};

function ShishenItem({ label, gan, shishen }: { label: string; gan: string; shishen: string }) {
  const display = SHISHEN_LABELS[shishen] || shishen;
  return (
    <div className="rounded-xl border border-black/5 bg-[#fafaf9] p-3 dark:border-white/5 dark:bg-white/[0.02]">
      <div className="text-xs text-[#a3a3a3]">{label}</div>
      <div className="font-serif text-lg font-bold text-indigo-600 dark:text-indigo-400">{gan}</div>
      <div className="text-xs font-medium text-amber-600">{display}</div>
    </div>
  );
}

function AnalysisCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
      <h3 className="mb-3 font-serif text-lg font-bold">{title}</h3>
      <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">{content}</p>
    </div>
  );
}
