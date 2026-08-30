'use client';

import { ArrowLeft, Loader2, CreditCard, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Breadcrumb, BREADCRUMBS } from '@/components/Breadcrumb';
import { QuestionSuggestions } from '@/components/QuestionSuggestions';
import { ShuffleAnimation } from '@/components/ShuffleAnimation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getDeviceId } from '@/lib/device';
import { SPREAD_CONFIGS, TAROT_CARDS } from '@/lib/tarot-data';

import { LoadingSpinner } from '../components/ui/loading-spinner';

export default function TarotContainer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [question, setQuestion] = useState('');
  const [spreadType, setSpreadType] = useState<'single' | 'three' | 'celtic'>('single');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowAnimation(true);
  };

  const handleAnimationComplete = async () => {
    setShowAnimation(false);
    try {
      const res = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question || '请给我指引',
          spreadType,
          deviceId: getDeviceId(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        const enhancedCards = data.data.cards.map((card: any) => {
          const fullCard = TAROT_CARDS.find((tc) => tc.id === card.id);
          return {
            ...card,
            uprightReading: fullCard?.uprightReading || '',
            reversedReading: fullCard?.reversedReading || '',
            uprightKeywords: fullCard?.uprightKeywords || [],
            reversedKeywords: fullCard?.reversedKeywords || [],
            element: fullCard?.element || '',
            astrology: fullCard?.astrology || '',
          };
        });

        const resultData = {
          recordId: data.data.recordId,
          question: question || '请给我指引',
          spreadType,
          cards: enhancedCards,
          price: data.data.price,
          isUnlocked: false,
        };
        localStorage.setItem(`tarot-${data.data.recordId}`, JSON.stringify(resultData));
        router.push(`/tarot/result/${data.data.recordId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition">
      {showAnimation && <ShuffleAnimation onComplete={handleAnimationComplete} />}

      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <Breadcrumb items={BREADCRUMBS.tarot} />
          <div className="text-center">
            <h1 className="mb-3 font-serif text-3xl font-bold sm:text-4xl">🃏 塔罗占卜</h1>
            <p className="text-[#737373] dark:text-[#78716c]">专注你的问题，让塔罗为你指引方向</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <label className="text-sm font-medium">你的问题</label>
            <Input
              placeholder="如：我下个月的工作运势如何？"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="h-12 rounded-xl border-black/10 bg-white text-[#1c1917] placeholder:text-[#a3a3a3] focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-[#e7e5e4]"
            />
            <QuestionSuggestions type="tarot" onSelect={setQuestion} />
          </div>

          {/* Spread Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">选择牌阵</label>
            <div className="space-y-3">
              {(
                Object.entries(SPREAD_CONFIGS) as [
                  string,
                  (typeof SPREAD_CONFIGS)[keyof typeof SPREAD_CONFIGS],
                ][]
              ).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSpreadType(key as any)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition-all ${
                    spreadType === key
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                      : 'border-black/10 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-700'
                  }`}
                >
                  <div>
                    <div className="font-medium">{config.name}</div>
                    <div className="mt-0.5 text-xs text-[#737373] dark:text-[#78716c]">
                      {config.count}张牌
                      {key === 'single' && ' · 最简单，适合新手'}
                      {key === 'three' && ' · 过去/现在/未来'}
                      {key === 'celtic' && ' · 全面深入分析'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-[#737373] dark:text-[#78716c]" />
                    <span className="font-serif font-bold text-indigo-600 dark:text-indigo-400">
                      ¥{config.price}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#1c1917] text-base font-semibold text-white transition-all hover:bg-[#292524] hover:shadow-lg disabled:opacity-50 dark:bg-[#e7e5e4] dark:text-[#1c1917] dark:hover:bg-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  抽牌中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  开始抽牌
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* SEO Content */}
        <div className="mt-12 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
          <h2 className="mb-3 font-serif text-lg font-bold">塔罗占卜入门指南</h2>
          <div className="space-y-3 text-sm text-[#57534e] dark:text-[#a8a29e]">
            <p>
              <strong>单张牌阵：</strong>适合快速获得指引，一个问题对应一张牌。最适合新手使用。
            </p>
            <p>
              <strong>三张牌阵：</strong>分别代表过去、现在、未来，帮助你理解事情的发展脉络。
            </p>
            <p>
              <strong>凯尔特十字：</strong>最全面的牌阵，包含10张牌，深入分析问题的各个方面。
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['塔罗牌', '塔罗占卜', '牌阵解读', '爱情占卜', '事业指引'].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-600 dark:bg-purple-950/30 dark:text-purple-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
