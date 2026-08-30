'use client';
import { ArrowLeft, Loader2, Heart, Star, Users, MessageCircle, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HehunResult {
  person1: {
    name: string;
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    shengxiao: string;
    dayMasterElement: string;
  };
  person2: {
    name: string;
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    shengxiao: string;
    dayMasterElement: string;
  };
  overallScore: number;
  overallLevel: string;
  overallComment: string;
  wuxingAnalysis: {
    person1Element: string;
    person2Element: string;
    relationship: string;
    comment: string;
  };
  dizhiAnalysis: {
    sixHarmony: boolean;
    threeHarmony: boolean;
    sixClash: boolean;
    details: string[];
  };
  fiveElementBalance: {
    person1: Record<string, number>;
    person2: Record<string, number>;
    complement: string;
  };
  aspects: {
    love: { score: number; comment: string };
    career: { score: number; comment: string };
    family: { score: number; comment: string };
    communication: { score: number; comment: string };
  };
  suggestions: string[];
}

export default function HehunPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HehunResult | null>(null);
  const [form, setForm] = useState({
    person1Name: '',
    person1Date: '',
    person1Time: '',
    person1Gender: 'male' as 'male' | 'female',
    person2Name: '',
    person2Date: '',
    person2Time: '',
    person2Gender: 'female' as 'male' | 'female',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/hehun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1: {
            name: form.person1Name || '对方A',
            birthDate: form.person1Date,
            birthTime: form.person1Time,
            gender: form.person1Gender,
          },
          person2: {
            name: form.person2Name || '对方B',
            birthDate: form.person2Date,
            birthTime: form.person2Time,
            gender: form.person2Gender,
          },
        }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (result) {
    return (
      <div className="page-transition">
        <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
            <button
              onClick={() => setResult(null)}
              className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
            >
              <ArrowLeft className="h-4 w-4" /> 重新合婚
            </button>
            <h1 className="mb-2 font-serif text-3xl font-bold">💕 合婚结果</h1>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="space-y-8">
            {/* 综合评分 */}
            <div className="rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <div className="mb-4 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="mb-1 font-serif text-xl font-bold">{result.person1.name}</div>
                  <div className="text-sm text-[#737373]">
                    {result.person1.shengxiao} · {result.person1.dayMasterElement}
                  </div>
                </div>
                <Heart className="h-8 w-8 text-pink-500" />
                <div className="text-center">
                  <div className="mb-1 font-serif text-xl font-bold">{result.person2.name}</div>
                  <div className="text-sm text-[#737373]">
                    {result.person2.shengxiao} · {result.person2.dayMasterElement}
                  </div>
                </div>
              </div>
              <div className={`mb-2 text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}
              </div>
              <div className="mb-1 text-lg font-bold text-indigo-600">{result.overallLevel}</div>
              <div className="text-sm text-[#737373]">缘分指数</div>
              <div className="mt-3 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${i <= Math.round(result.overallScore / 20) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
            </div>

            {/* 四柱对比 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-4 font-serif text-lg font-bold">📋 八字对比</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-3 text-center font-medium text-[#737373]">
                    {result.person1.name}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      ['年柱', result.person1.yearPillar],
                      ['月柱', result.person1.monthPillar],
                      ['日柱', result.person1.dayPillar],
                      ['时柱', result.person1.hourPillar],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-950/30"
                      >
                        <div className="text-[10px] text-[#a3a3a3]">{label}</div>
                        <div className="font-serif text-sm font-bold text-indigo-600">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 text-center font-medium text-[#737373]">
                    {result.person2.name}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      ['年柱', result.person2.yearPillar],
                      ['月柱', result.person2.monthPillar],
                      ['日柱', result.person2.dayPillar],
                      ['时柱', result.person2.hourPillar],
                    ].map(([label, val]) => (
                      <div key={label} className="rounded-lg bg-pink-50 p-2 dark:bg-pink-950/30">
                        <div className="text-[10px] text-[#a3a3a3]">{label}</div>
                        <div className="font-serif text-sm font-bold text-pink-600">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 五行关系 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-4 font-serif text-lg font-bold">🔮 性格互补分析</h3>
              <div className="mb-4 flex items-center justify-center gap-4">
                <span className="rounded-full bg-indigo-100 px-4 py-2 font-serif font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  {result.person1.name} · {result.wuxingAnalysis.person1Element}
                </span>
                <span className="text-lg font-bold text-[#a3a3a3]">→</span>
                <span className="rounded-full bg-pink-100 px-4 py-2 font-serif font-bold text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                  {result.person2.name} · {result.wuxingAnalysis.person2Element}
                </span>
              </div>
              <div className="mb-3 text-center">
                <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  {result.wuxingAnalysis.relationship}
                </span>
              </div>
              <p className="text-center text-sm text-[#57534e] dark:text-[#a8a29e]">
                {result.wuxingAnalysis.comment}
              </p>
            </div>

            {/* 地支关系 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-4 font-serif text-lg font-bold">🌏 属相关系</h3>
              <div className="mb-3 flex flex-wrap justify-center gap-2">
                {result.dizhiAnalysis.sixHarmony && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                    天生合拍 ✓
                  </span>
                )}
                {result.dizhiAnalysis.threeHarmony && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    同组默契 ✓
                  </span>
                )}
                {result.dizhiAnalysis.sixClash && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
                    性格对冲 ✗
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {result.dizhiAnalysis.details.map((detail, i) => (
                  <p key={i} className="text-sm text-[#57534e] dark:text-[#a8a29e]">
                    • {detail}
                  </p>
                ))}
              </div>
            </div>

            {/* 五行平衡 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-4 font-serif text-lg font-bold">⚖️ 互补平衡</h3>
              <div className="mb-4 grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-2 text-center text-sm font-medium text-[#737373]">
                    {result.person1.name}
                  </div>
                  <div className="space-y-2">
                    {Object.entries(result.fiveElementBalance.person1).map(([el, count]) => (
                      <div key={el} className="flex items-center gap-2">
                        <span className="w-6 text-sm">{el}</span>
                        <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/10">
                          <div
                            className={`h-full rounded-full ${el === '木' ? 'bg-green-500' : el === '火' ? 'bg-red-500' : el === '土' ? 'bg-amber-500' : el === '金' ? 'bg-gray-400' : 'bg-blue-500'}`}
                            style={{ width: `${(count / 4) * 100}%` }}
                          />
                        </div>
                        <span className="w-4 text-xs text-[#a3a3a3]">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-center text-sm font-medium text-[#737373]">
                    {result.person2.name}
                  </div>
                  <div className="space-y-2">
                    {Object.entries(result.fiveElementBalance.person2).map(([el, count]) => (
                      <div key={el} className="flex items-center gap-2">
                        <span className="w-6 text-sm">{el}</span>
                        <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/10">
                          <div
                            className={`h-full rounded-full ${el === '木' ? 'bg-green-500' : el === '火' ? 'bg-red-500' : el === '土' ? 'bg-amber-500' : el === '金' ? 'bg-gray-400' : 'bg-blue-500'}`}
                            style={{ width: `${(count / 4) * 100}%` }}
                          />
                        </div>
                        <span className="w-4 text-xs text-[#a3a3a3]">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-[#57534e] dark:text-[#a8a29e]">
                {result.fiveElementBalance.complement}
              </p>
            </div>

            {/* 各方面评分 */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: Heart, label: '感情', data: result.aspects.love, color: 'pink' },
                { icon: Users, label: '家庭', data: result.aspects.family, color: 'blue' },
                { icon: Briefcase, label: '事业', data: result.aspects.career, color: 'amber' },
                {
                  icon: MessageCircle,
                  label: '沟通',
                  data: result.aspects.communication,
                  color: 'green',
                },
              ].map(({ icon: Icon, label, data }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-black/5 bg-white p-4 text-center shadow-sm dark:border-white/5 dark:bg-white/[0.03]"
                >
                  <Icon className="mx-auto mb-2 h-6 w-6 text-[#a3a3a3]" />
                  <div className="text-sm text-[#737373]">{label}</div>
                  <div className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                    {data.score}
                  </div>
                </div>
              ))}
            </div>

            {/* 各方面详细解读 */}
            <div className="space-y-4">
              {[
                { icon: Heart, label: '感情分析', data: result.aspects.love },
                { icon: Briefcase, label: '事业分析', data: result.aspects.career },
                { icon: Users, label: '家庭分析', data: result.aspects.family },
                { icon: MessageCircle, label: '沟通分析', data: result.aspects.communication },
              ].map(({ icon: Icon, label, data }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]"
                >
                  <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-bold">
                    <Icon className="h-5 w-5" /> {label}
                  </h3>
                  <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                    {data.comment}
                  </p>
                </div>
              ))}
            </div>

            {/* 综合建议 */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-800 dark:bg-indigo-950/20">
              <h3 className="mb-4 font-serif text-lg font-bold text-indigo-700 dark:text-indigo-300">
                💡 合婚建议
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                    <p className="text-sm text-[#57534e] dark:text-[#a8a29e]">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 综合评语 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-3 font-serif text-lg font-bold">📖 综合评语</h3>
              <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                {result.overallComment}
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
          <h1 className="mb-3 font-serif text-3xl font-bold sm:text-4xl">💕 合婚配对</h1>
          <p className="text-[#737373] dark:text-[#78716c]">输入双方出生信息，查看八字合婚分析</p>
        </div>
      </div>
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-3 font-medium">👤 男方</h3>
            <div className="space-y-3">
              <Input
                placeholder="姓名"
                value={form.person1Name}
                onChange={(e) => setForm((f) => ({ ...f, person1Name: e.target.value }))}
                className="h-10 rounded-lg"
              />
              <Input
                type="date"
                required
                placeholder="出生日期"
                value={form.person1Date}
                onChange={(e) => setForm((f) => ({ ...f, person1Date: e.target.value }))}
                className="h-10 rounded-lg"
              />
              <select
                value={form.person1Time}
                onChange={(e) => setForm((f) => ({ ...f, person1Time: e.target.value }))}
                className="h-10 w-full rounded-lg border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-white/5"
              >
                <option value="">选择出生时辰</option>
                {[
                  '子时(23-01)',
                  '丑时(01-03)',
                  '寅时(03-05)',
                  '卯时(05-07)',
                  '辰时(07-09)',
                  '巳时(09-11)',
                  '午时(11-13)',
                  '未时(13-15)',
                  '申时(15-17)',
                  '酉时(17-19)',
                  '戌时(19-21)',
                  '亥时(21-23)',
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-3 font-medium">👩 女方</h3>
            <div className="space-y-3">
              <Input
                placeholder="姓名"
                value={form.person2Name}
                onChange={(e) => setForm((f) => ({ ...f, person2Name: e.target.value }))}
                className="h-10 rounded-lg"
              />
              <Input
                type="date"
                required
                placeholder="出生日期"
                value={form.person2Date}
                onChange={(e) => setForm((f) => ({ ...f, person2Date: e.target.value }))}
                className="h-10 rounded-lg"
              />
              <select
                value={form.person2Time}
                onChange={(e) => setForm((f) => ({ ...f, person2Time: e.target.value }))}
                className="h-10 w-full rounded-lg border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-white/5"
              >
                <option value="">选择出生时辰</option>
                {[
                  '子时(23-01)',
                  '丑时(01-03)',
                  '寅时(03-05)',
                  '卯时(05-07)',
                  '辰时(07-09)',
                  '巳时(09-11)',
                  '午时(11-13)',
                  '未时(13-15)',
                  '申时(15-17)',
                  '酉时(17-19)',
                  '戌时(19-21)',
                  '亥时(21-23)',
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#1c1917] text-base font-semibold text-white hover:bg-[#292524] disabled:opacity-50 dark:bg-[#e7e5e4] dark:text-[#1c1917]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 分析中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4" /> 开始合婚
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
