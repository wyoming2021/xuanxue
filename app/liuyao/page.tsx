'use client';
import { ArrowLeft, Loader2, Coins, Info, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 爻线组件
function YaoLine({
  yin,
  moving,
  position,
  nature,
}: {
  yin: boolean;
  moving: boolean;
  position: number;
  nature: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-right text-xs text-[#a3a3a3]">{position}爻</span>
      {yin ? (
        <div className="flex gap-3">
          <div className="h-3 w-16 rounded bg-indigo-600 dark:bg-indigo-400" />
          <div className="h-3 w-16 rounded bg-indigo-600 dark:bg-indigo-400" />
        </div>
      ) : (
        <div className="h-3 w-[8.5rem] rounded bg-indigo-600 dark:bg-indigo-400" />
      )}
      <span className={`text-xs ${moving ? 'font-bold text-amber-500' : 'text-[#a3a3a3]'}`}>
        {nature}
        {moving && ' ●'}
      </span>
    </div>
  );
}

export default function LiuyaoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [question, setQuestion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/liuyao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return <LiuyaoResult result={result} onBack={() => setResult(null)} />;
  }

  return (
    <div className="page-transition">
      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] transition-colors hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" /> 返回首页
          </Link>
          <h1 className="mb-3 font-serif text-3xl font-bold sm:text-4xl">🪙 六爻占卜</h1>
          <p className="text-[#737373] dark:text-[#78716c]">一事一问，铜钱摇卦，解读卦象</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">你想问什么事？</label>
            <Input
              placeholder="如：这件事能成吗？什么时候有结果？"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="h-12 rounded-xl border-black/10 bg-white text-[#1c1917] placeholder:text-[#a3a3a3] focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-[#e7e5e4]"
            />
          </div>

          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <p className="font-medium mb-1">💡 占卜须知</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>一事一问，问题要具体明确</li>
              <li>心诚则灵，专注于你想问的事</li>
              <li>同一问题短期内不宜反复占卜</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={loading || !question.trim()}
            className="h-12 w-full rounded-xl bg-[#1c1917] text-base font-semibold text-white transition-all hover:bg-[#292524] hover:shadow-lg disabled:opacity-50 dark:bg-[#e7e5e4] dark:text-[#1c1917] dark:hover:bg-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 摇卦中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Coins className="h-4 w-4" /> 开始摇卦
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function LiuyaoResult({ result, onBack }: { result: any; onBack: () => void }) {
  const { hexagram, changingHexagram, yongshen, yingqi, judgement, briefComment, question } =
    result;

  return (
    <div className="page-transition">
      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] transition-colors hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" /> 重新摇卦
          </button>
          <h1 className="mb-2 font-serif text-3xl font-bold">🪙 六爻卦象</h1>
          <p className="text-sm text-[#737373] dark:text-[#78716c]">{question}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-6">
          {/* 当前卦象 */}
          <div className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
            <div className="mb-2 text-4xl">
              {hexagram.upperSymbol}
              {hexagram.lowerSymbol}
            </div>
            <div className="mb-2 font-serif text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {hexagram.name}
            </div>
            <div className="mb-4 text-sm text-[#737373] dark:text-[#78716c]">
              {hexagram.upperGua}上 · {hexagram.lowerGua}下 · {hexagram.nature}
            </div>

            {/* 六爻线条 */}
            <div className="mb-4 flex flex-col items-center gap-1.5">
              {[...hexagram.lines].reverse().map((line: any, i: number) => (
                <YaoLine
                  key={i}
                  yin={line.yin}
                  moving={line.moving}
                  position={7 - line.position}
                  nature={line.nature}
                />
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="text-[#57534e] dark:text-[#a8a29e]">
                <span className="font-medium">卦辞：</span>
                {hexagram.judgement}
              </div>
              <div className="text-[#57534e] dark:text-[#a8a29e]">
                <span className="font-medium">寓意：</span>
                {hexagram.image}
              </div>
            </div>
          </div>

          {/* 变卦 */}
          {changingHexagram && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                <Star size={14} />
                最终走向
              </div>
              <div className="font-serif text-xl font-bold text-amber-700 dark:text-amber-400">
                {changingHexagram.name}
              </div>
              <div className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">
                {changingHexagram.meaning}
              </div>
            </div>
          )}

          {/* 卦象解读 */}
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-bold">
              <Info size={18} className="text-indigo-600 dark:text-indigo-400" />
              卦象解读
            </h3>
            <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">{hexagram.meaning}</p>
            <p className="mt-3 leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
              {hexagram.advice}
            </p>
          </div>

          {/* 重点分析 */}
          {yongshen && (
            <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
              <div className="text-sm font-medium text-[#737373] dark:text-[#78716c]">重点关注</div>
              <p className="mt-1 text-sm text-[#57534e] dark:text-[#a8a29e]">{yongshen}</p>
            </div>
          )}

          {/* 应期 */}
          {yingqi && (
            <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
              <div className="text-sm font-medium text-[#737373] dark:text-[#78716c]">应期预测</div>
              <p className="mt-1 text-sm text-[#57534e] dark:text-[#a8a29e]">{yingqi}</p>
            </div>
          )}

          {/* 综合判断 */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-800 dark:bg-indigo-950/20">
            <h3 className="mb-3 font-serif text-lg font-bold text-indigo-700 dark:text-indigo-300">
              综合判断
            </h3>
            <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">{judgement}</p>
          </div>

          {/* 简评 */}
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-3 font-serif text-lg font-bold">简要总结</h3>
            <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">{briefComment}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
