'use client';
import { ArrowLeft, Loader2, Flower2, Info, Star, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MeihuaPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [method, setMethod] = useState<'time' | 'number' | 'random'>('time');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/meihua', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, method }),
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
    return <MeihuaResult result={result} onBack={() => setResult(null)} />;
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
          <h1 className="mb-3 font-serif text-3xl font-bold sm:text-4xl">🌸 梅花易数</h1>
          <p className="text-[#737373] dark:text-[#78716c]">以数起卦，灵活占卜，解读卦象</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">你想问什么事？</label>
            <Input
              placeholder="如：这件事什么时候有结果？"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="h-12 rounded-xl border-black/10 bg-white text-[#1c1917] placeholder:text-[#a3a3a3] focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-[#e7e5e4]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">起卦方式</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'time', label: '时间起卦', desc: '用当前时间' },
                { value: 'number', label: '数字起卦', desc: '心中想两个数' },
                { value: 'random', label: '随机起卦', desc: '随机生成' },
              ].map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value as any)}
                  className={`rounded-xl border p-3 text-center transition-all ${method === m.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50' : 'border-black/10 bg-white hover:border-indigo-300 dark:border-white/10 dark:bg-white/5'}`}
                >
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-[10px] text-[#a3a3a3]">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !question.trim()}
            className="h-12 w-full rounded-xl bg-[#1c1917] text-base font-semibold text-white transition-all hover:bg-[#292524] hover:shadow-lg disabled:opacity-50 dark:bg-[#e7e5e4] dark:text-[#1c1917] dark:hover:bg-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 起卦中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Flower2 className="h-4 w-4" /> 开始起卦
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function MeihuaResult({ result, onBack }: { result: any; onBack: () => void }) {
  const {
    upperGua,
    lowerGua,
    changedGua,
    relation,
    tiYong,
    yingqi,
    direction,
    judgement,
    briefComment,
    method,
  } = result;

  return (
    <div className="page-transition">
      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] transition-colors hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" /> 重新起卦
          </button>
          <h1 className="mb-2 font-serif text-3xl font-bold">🌸 梅花卦象</h1>
          <p className="text-sm text-[#737373] dark:text-[#78716c]">{method}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-6">
          {/* 三卦展示 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-black/5 bg-white p-5 text-center dark:border-white/5 dark:bg-white/[0.03]">
              <div className="mb-1 text-xs text-[#737373]">外在环境</div>
              <div className="mb-1 text-4xl">{upperGua.symbol}</div>
              <div className="font-serif text-lg font-bold">{upperGua.name}</div>
              <div className="text-xs text-[#a3a3a3]">
                {upperGua.nature} · {upperGua.element}
              </div>
              <div className="mt-2 space-y-0.5 text-[10px] text-[#a3a3a3]">
                <div>象：{upperGua.bodyImage}</div>
                <div>方位：{upperGua.direction}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 text-center dark:border-indigo-800 dark:bg-indigo-950/20">
              <div className="mb-1 text-xs text-indigo-600">最终走向</div>
              <div className="mb-1 text-4xl">{changedGua.symbol}</div>
              <div className="font-serif text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {changedGua.name}
              </div>
              <div className="text-xs text-indigo-500">
                {changedGua.nature} · {changedGua.element}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 text-center dark:border-amber-800 dark:bg-amber-950/20">
              <div className="mb-1 text-xs text-amber-600">你自己</div>
              <div className="mb-1 text-4xl">{lowerGua.symbol}</div>
              <div className="font-serif text-lg font-bold text-amber-700 dark:text-amber-400">
                {lowerGua.name}
              </div>
              <div className="text-xs text-amber-600">
                {lowerGua.nature} · {lowerGua.element}
              </div>
              <div className="mt-2 space-y-0.5 text-[10px] text-amber-500">
                <div>象：{lowerGua.bodyImage}</div>
                <div>方位：{lowerGua.direction}</div>
              </div>
            </div>
          </div>

          {/* 体用关系 */}
          <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-3 flex items-center gap-2 font-serif font-bold">
              <Star size={16} className="text-indigo-600 dark:text-indigo-400" />
              你和环境的关系
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[#a3a3a3]">你</div>
                <div className="font-medium">
                  {tiYong.tiGua}（{tiYong.tiElement}）
                </div>
              </div>
              <div>
                <div className="text-[#a3a3a3]">环境</div>
                <div className="font-medium">
                  {tiYong.yongGua}（{tiYong.yongElement}）
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-[#fafaf9] p-3 dark:bg-white/[0.02]">
              <div className="text-xs text-[#a3a3a3]">关系</div>
              <div className="font-medium text-indigo-600 dark:text-indigo-400">
                {relation.type}
              </div>
              <div className="mt-1 text-sm text-[#57534e] dark:text-[#a8a29e]">
                {relation.description}
              </div>
            </div>
          </div>

          {/* 应期 */}
          <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-2 flex items-center gap-2 font-serif font-bold">
              <Clock size={16} className="text-green-600 dark:text-green-400" />
              应期预测
            </h3>
            <p className="text-sm text-[#57534e] dark:text-[#a8a29e]">{yingqi}</p>
          </div>

          {/* 方位 */}
          <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-2 flex items-center gap-2 font-serif font-bold">
              <MapPin size={16} className="text-purple-600 dark:text-purple-400" />
              方位分析
            </h3>
            <p className="text-sm text-[#57534e] dark:text-[#a8a29e]">{direction}</p>
          </div>

          {/* 综合判断 */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-800 dark:bg-indigo-950/20">
            <h3 className="mb-3 font-serif text-lg font-bold text-indigo-700 dark:text-indigo-300">
              <Info size={18} className="mr-2 inline" />
              综合判断
            </h3>
            <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">{judgement}</p>
          </div>

          {/* 简评 */}
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-3 font-serif text-lg font-bold">简要总结</h3>
            <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">{briefComment}</p>
          </div>

          {/* 建议 */}
          <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-2 font-serif font-bold">💡 建议</h3>
            <p className="text-sm text-[#57534e] dark:text-[#a8a29e]">{relation.advice}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
