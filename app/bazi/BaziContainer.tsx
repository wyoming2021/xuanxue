'use client';

import { ArrowLeft, User, Calendar, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Breadcrumb, BREADCRUMBS } from '@/components/Breadcrumb';
import { BaziJsonLd } from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getDeviceId } from '@/lib/device';

import { baziRequestSchema, safeValidate } from '../lib/validation';

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

export default function BaziContainer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    gender: '' as 'male' | 'female' | '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form data using the Zod schema
    const validationResult = safeValidate(baziRequestSchema, {
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
      const res = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: validatedData.name || '某人',
          birthDate: validatedData.birthDate,
          birthTime: validatedData.birthTime,
          gender: validatedData.gender,
          deviceId: validatedData.deviceId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const resultData = {
          recordId: data.data.recordId,
          name: validatedData.name || '某人',
          birthDate: validatedData.birthDate,
          birthTime: validatedData.birthTime,
          gender: validatedData.gender,
          fullResult: data.data.fullResult,
          preview: data.data.preview,
        };
        localStorage.setItem(`bazi-${data.data.recordId}`, JSON.stringify(resultData));
        router.push(`/bazi/result/${data.data.recordId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const maleClassName = `${form.gender === 'male' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' : 'border-black/10 bg-water hover:border-indigo-300 dark:border-water/10 dark:border-water/5 dark:hover:border-indigo-700'} flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all`;
  const femaleClassName = `${form.gender === 'female' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' : 'border-black/10 bg-water hover:border-indigo-300 dark:border-water/10 dark:border-water/5 dark:hover:border-indigo-700'} flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all`;

  return (
    <>
      {/* Hero */}
      <BaziJsonLd
        name={form.name || '用户'}
        description="输入出生日期，自动排出你的八字命盘，分析性格和运势"
        url="https://xuanyu.app/bazi"
      />

      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <Breadcrumb items={BREADCRUMBS.bazi} />
          <div className="text-center">
            <h1 className="mb-3 font-serif text-3xl font-bold sm:text-4xl">📋 八字排盘</h1>
            <p className="text-[#737373] dark:text-[#78716c]">
              输入你的出生信息，看看你的性格和运势
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User size={16} className="text-[#737373]" />
              姓名
              <span className="text-xs text-[#a3a3a3]">（可选）</span>
            </Label>
            <Input
              id="name"
              placeholder='默认"某人"'
              value={form.name}
              onChange={(e) => setForm((f: typeof form) => ({ ...f, name: e.target.value }))}
              className="h-12 rounded-xl border-black/10 bg-white text-[#1c1917] placeholder:text-[#a3a3a3] focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-[#e7e5e4]"
            />
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="flex items-center gap-2 text-sm font-medium">
              <Calendar size={16} className="text-[#737373]" />
              出生日期 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="birthDate"
              type="date"
              required
              value={form.birthDate}
              onChange={(e) => setForm((f: typeof form) => ({ ...f, birthDate: e.target.value }))}
              className="h-12 rounded-xl border-black/10 bg-white text-[#1c1917] focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-[#e7e5e4]"
            />
          </div>

          {/* Birth Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock size={16} className="text-[#737373]" />
              出生时辰 <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {SHI_CHEN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f: typeof form) => ({ ...f, birthTime: opt.value }))}
                  className={`flex flex-col items-center rounded-xl border px-2 py-3 text-sm transition-all ${form.birthTime === opt.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' : 'border-black/10 bg-water hover:border-indigo-300 dark:border-water/10 dark:border-water/5 dark:hover:border-indigo-700'}`}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="mt-0.5 text-[10px] text-[#a3a3a3]">{opt.time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              性别 <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, gender: 'male' }))}
                className={maleClassName}
              >
                <span className="text-lg">👨</span> 男
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, gender: 'female' }))}
                className={femaleClassName}
              >
                <span className="text-lg">👩</span> 女
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !form.birthDate || !form.birthTime || !form.gender}
            className="h-12 w-full rounded-xl bg-[#1c1917] text-base font-semibold text-white transition-all hover:bg-[#292524] hover:shadow-lg disabled:opacity-50 dark:bg-[#e7e5e4] dark:text-[#1c1917] dark:hover:bg-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                排盘中...
              </span>
            ) : (
              '开始排盘'
            )}
          </Button>
        </form>

        {/* SEO Content */}
        <div className="mt-12 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
          <h2 className="mb-3 font-serif text-lg font-bold">什么是八字排盘？</h2>
          <p className="text-sm leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
            八字排盘就是根据你出生的年、月、日、时，算出你的人生密码。通过分析你的
            性格特质、适合做什么工作、感情运势如何、未来哪些年份比较顺利，帮你更了解自己。
            玄语的八字排盘工具基于传统命理学理论，结合现代科技，为你提供准确、详细的分析。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['八字排盘', '四柱八字', '五行分析', '命理分析', '大运流年'].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
