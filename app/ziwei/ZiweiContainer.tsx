'use client';

import {
  ArrowLeft,
  Loader2,
  Star,
  Info,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ziweiRequestSchema, safeValidate } from '@/app/lib/validation';
import type { ZiweiResult, Palace, Star as StarType } from '@/app/types/ziwei';
import { Breadcrumb, BREADCRUMBS } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getDeviceId } from '@/lib/device';

const SHI_CHEN_OPTIONS = [
  { value: '子时', label: '子时', time: '23:00-01:00' },
  { value: '丑时', label: '丑时', time: '01:00-03:00' },
  { value: '寅时', label: '寅时', time: '03:00-05:00' },
  { value: '卯时', label: '卯时', time: '05:00-07:00' },
  { value: '辰时', label: '辰时', time: '07:00-09:00' },
  { value: '巳时', label: '巳时', time: '09:00-11:00' },
  { value: '午时', label: '午时', time: '11:00-13:00' },
  { value: '未时', label: '未时', time: '13:00-15:00' },
  { value: '申时', label: '申时', time: '15:00-17:00' },
  { value: '酉时', label: '酉时', time: '17:00-19:00' },
  { value: '戌时', label: '戌时', time: '19:00-21:00' },
  { value: '亥时', label: '亥时', time: '21:00-23:00' },
];

const BRIGHTNESS_COLORS: Record<string, string> = {
  庙: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
  旺: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30',
  得: 'text-green-600 bg-green-50 dark:bg-green-950/30',
  利: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
  平: 'text-gray-600 bg-gray-50 dark:bg-gray-950/30',
  不: 'text-red-600 bg-red-50 dark:bg-red-950/50',
  陷: 'text-red-700 bg-red-100 dark:bg-red-950/50',
};

export default function ZiweiContainer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ZiweiResult | null>(null);
  const [expandedPalace, setExpandedPalace] = useState<string | null>(null);
  type FormState = {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: 'male' | 'female' | '';
  };
  const [form, setForm] = useState<FormState>({
    name: '',
    birthDate: '',
    birthTime: '',
    gender: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form data using the Zod schema
    const validationResult = safeValidate(ziweiRequestSchema, {
      name: form.name,
      birthDate: form.birthDate,
      birthTime: form.birthTime,
      gender: form.gender,
      deviceId: getDeviceId(),
    });

    if (!validationResult.success) {
      // In a real app, you might want to set form errors or show a message.
      // For now, we just log and return.
      console.error('Validation error:', validationResult.error);
      return;
    }

    const validatedData = validationResult.data!;

    setLoading(true);

    try {
      const res = await fetch('/api/ziwei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: validatedData.birthDate,
          birthTime: validatedData.birthTime,
          gender: validatedData.gender,
          deviceId: validatedData.deviceId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data.result);
        localStorage.setItem(`ziwei-${data.data.recordId}`, JSON.stringify(data.data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <>
        <Breadcrumb items={BREADCRUMBS.ziwei} />
        <ZiweiResult
          result={result}
          onBack={() => {
            setResult(null);
            router.push('/ziwei');
          }}
          expandedPalace={expandedPalace}
          setExpandedPalace={setExpandedPalace}
        />
      </>
    );
  }

  return (
    <>
      {/* Hero */}
      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] transition-colors hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" /> 返回首页
          </Link>
          <h1 className="mb-3 font-serif text-3xl font-bold sm:text-4xl">🌟 紫微斗数</h1>
          <p className="text-[#737373] dark:text-[#78716c]">输入出生信息，排出紫微命盘</p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              姓名 <span className="text-xs text-[#a3a3a3]">（可选）</span>
            </Label>
            <Input
              id="name"
              placeholder='默认"某人"'
              value={form.name}
              onChange={(e) => setForm((f: FormState) => ({ ...f, name: e.target.value }))}
              className="h-12 rounded-xl border-black/10 bg-white dark:border-white/10 dark:bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              出生日期 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              required
              value={form.birthDate}
              onChange={(e) => setForm((f: FormState) => ({ ...f, birthDate: e.target.value }))}
              className="h-12 rounded-xl border-black/10 bg-white dark:border-white/10 dark:bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              出生时辰 <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {SHI_CHEN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, birthTime: opt.value }))}
                  className={`flex flex-col items-center rounded-xl border px-2 py-3 text-sm transition-all ${form.birthTime === opt.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' : 'border-black/10 bg-white hover:border-indigo-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-700'}`}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="mt-0.5 text-[10px] text-[#a3a3a3]">{opt.time}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              性别 <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, gender: 'male' }))}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${form.gender === 'male' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-300' : 'border-black/10 bg-white hover:border-indigo-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-700'}`}
              >
                👨 男
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, gender: 'female' }))}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${form.gender === 'female' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-300' : 'border-black/10 bg-white hover:border-indigo-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-700'}`}
              >
                👩 女
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !form.birthDate || !form.birthTime || !form.gender}
            className="h-12 w-full rounded-xl bg-[#1c1917] text-base font-semibold text-white hover:bg-[#292524] disabled:opacity-50 dark:bg-[#e7e5e4] dark:text-[#1c1917]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 排盘中...
              </span>
            ) : (
              '开始排盘'
            )}
          </Button>
        </form>
      </div>
    </>
  );
}

function ZiweiResult({
  result,
  onBack,
  expandedPalace,
  setExpandedPalace,
}: {
  result: ZiweiResult;
  onBack: () => void;
  expandedPalace: string | null;
  setExpandedPalace: (s: string | null) => void;
}) {
  return (
    <>
      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] transition-colors hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" /> 重新排盘
          </button>
          <h1 className="mb-2 font-serif text-3xl font-bold">🌟 紫微斗数命盘</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="space-y-8">
          {/* 基本信息卡片 */}
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold">
              <Info size={18} className="text-indigo-600 dark:text-indigo-400" />
              基本信息
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <InfoItem label="阳历" value={result.solarDate} />
              <InfoItem label="农历" value={result.lunarDate} />
              <InfoItem label="四柱" value={result.chineseDate} />
              <InfoItem label="生肖" value={result.zodiac} />
              <InfoItem label="星座" value={result.sign} />
              <InfoItem label="五行局" value={result.fiveElementsClass} />
              <InfoItem label="命主" value={result.soul} />
              <InfoItem label="身主" value={result.body} />
            </div>
          </div>

          {/* 大限和流年信息 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 大限信息 */}
            {result.decadal && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-800 dark:bg-indigo-950/20">
                <h3 className="mb-3 flex items-center gap-2 font-serif font-bold text-indigo-700 dark:text-indigo-300">
                  <Calendar size={16} />
                  当前大限
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#737373]">宫位</span>
                    <span className="font-medium">{result.decadal.palaceName}宫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">年龄</span>
                    <span className="font-medium">
                      {result.decadal.yearRange[0]}-{result.decadal.yearRange[1]}岁
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">干支</span>
                    <span className="font-medium">
                      {result.decadal.heavenlyStem}
                      {result.decadal.earthlyBranch}
                    </span>
                  </div>
                  {result.decadal.mutagen.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#737373]">四化</span>
                      <span className="font-medium">{result.decadal.mutagen.join('、')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 流年信息 */}
            {result.yearly && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
                <h3 className="mb-3 flex items-center gap-2 font-serif font-bold text-amber-700 dark:text-amber-300">
                  <TrendingUp size={16} />
                  {new Date().getFullYear()}年流年运势
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#737373]">天干</span>
                    <span className="font-medium">{result.yearly.heavenlyStem}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">地支</span>
                    <span className="font-medium">{result.yearly.earthlyBranch}</span>
                  </div>
                  {result.yearly.mutagen.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#737373]">四化</span>
                      <span className="font-medium">{result.yearly.mutagen.join('、')}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 rounded-lg bg-white/50 p-3 dark:bg-white/[0.02]">
                  <p className="text-xs leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                    {result.yearly.comment}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 小限信息 */}
          {result.ageInfo && (
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-3 flex items-center gap-2 font-serif font-bold">
                <Clock size={16} className="text-purple-600 dark:text-purple-400" />
                小限信息
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-[#a3a3a3]">虚岁</div>
                  <div className="font-medium">{result.ageInfo.nominalAge}岁</div>
                </div>
                <div>
                  <div className="text-[#a3a3a3]">干支</div>
                  <div className="font-medium">
                    {result.ageInfo.heavenlyStem}
                    {result.ageInfo.earthlyBranch}
                  </div>
                </div>
                <div>
                  <div className="text-[#a3a3a3]">四化</div>
                  <div className="font-medium">{result.ageInfo.mutagen.join('、') || '无'}</div>
                </div>
              </div>
            </div>
          )}

          {/* 命盘网格 */}
          <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-4 font-serif text-lg font-bold">十二宫位</h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {result.palaces.map((palace: Palace, i: number) => (
                <PalaceCard
                  key={i}
                  palace={palace}
                  isExpanded={expandedPalace === palace.name}
                  onToggle={() =>
                    setExpandedPalace(expandedPalace === palace.name ? null : palace.name)
                  }
                />
              ))}
            </div>
          </div>

          {/* 主星分布概览 */}
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold">
              <Star size={18} className="text-amber-500" />
              主星分布
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {result.palaces
                .filter((p: Palace) => p.majorStars.length > 0)
                .map((palace: Palace, i: number) => (
                  <div
                    key={i}
                    className="rounded-xl border border-black/5 bg-[#fafaf9] p-3 dark:border-white/5 dark:bg-white/[0.02]"
                  >
                    <div className="mb-1 text-xs font-medium text-[#737373]">{palace.name}宫</div>
                    <div className="flex flex-wrap gap-1">
                      {palace.majorStars.map((star: StarType, j: number) => (
                        <span
                          key={j}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${star.brightness && BRIGHTNESS_COLORS[star.brightness] ? BRIGHTNESS_COLORS[star.brightness] : 'text-gray-600 bg-gray-50'}`}
                        >
                          {star.name}
                          {star.brightness && (
                            <span className="text-[10px] opacity-70">{star.brightness}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 简评 */}
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-3 font-serif text-lg font-bold">命盘解读</h3>
            <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
              {result.briefComment}
            </p>
          </div>
        </div>
      </div>
    </>
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

function PalaceCard({
  palace,
  isExpanded,
  onToggle,
}: {
  palace: Palace;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasStars = palace.majorStars.length > 0 || palace.minorStars.length > 0;

  return (
    <div
      className={`rounded-xl border p-3 transition-all ${palace.isBodyPalace ? 'border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20' : 'border-black/5 bg-[#fafaf9] dark:border-white/5 dark:bg-white/[0.02]'}`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className={`text-xs font-bold ${palace.isBodyPalace ? 'text-amber-600' : 'text-indigo-600 dark:text-indigo-400'}`}
        >
          {palace.name}
          {palace.isBodyPalace && <span className="ml-1 text-[10px]">（身宫）</span>}
        </span>
        {hasStars && (
          <button onClick={onToggle} className="text-[#a3a3a3] hover:text-[#57534e]">
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      <div className="mb-1 text-[10px] text-[#a3a3a3]">
        {palace.heavenlyStem}
        {palace.earthlyBranch}
      </div>

      {palace.majorStars.length > 0 && (
        <div className="mb-1 space-y-0.5">
          {palace.majorStars.map((star: any, i: number) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#1c1917] dark:text-[#e7e5e4]">
                {star.name}
              </span>
              {star.brightness && (
                <span
                  className={`rounded px-1 text-[9px] font-medium ${BRIGHTNESS_COLORS[star.brightness] || 'text-gray-500'}`}
                >
                  {star.brightness}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="mt-2 space-y-1 border-t border-black/5 pt-2 dark:border-white/5">
          {palace.minorStars.length > 0 && (
            <div>
              <div className="text-[9px] text-[#a3a3a3]">辅星</div>
              <div className="flex flex-wrap gap-1">
                {palace.minorStars.map((star: StarType, i: number) => (
                  <span
                    key={i}
                    className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
                  >
                    {star.name}
                    {star.brightness && `·${star.brightness}`}
                  </span>
                ))}
              </div>
            </div>
          )}
          {palace.adjectiveStars.length > 0 && (
            <div>
              <div className="text-[9px] text-[#a3a3a3]">杂耀</div>
              <div className="flex flex-wrap gap-1">
                {palace.adjectiveStars.map((star: StarType, i: number) => (
                  <span
                    key={i}
                    className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
                  >
                    {star.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {palace.decadal && (
            <div className="text-[10px] text-[#a3a3a3]">
              大限：{palace.decadal.range[0]}-{palace.decadal.range[1]}岁{' '}
              {palace.decadal.heavenlyStem}
              {palace.decadal.earthlyBranch}
            </div>
          )}
        </div>
      )}

      {!hasStars && <div className="text-[10px] text-[#a3a3a3]">无主星</div>}
    </div>
  );
}
