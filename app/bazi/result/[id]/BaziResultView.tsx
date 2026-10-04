'use client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BaziResult } from '@/components/BaziResult';
import { PayWall } from '@/components/PayWall';
import { getDeviceId } from '@/lib/device';
import type { BaziResult as BaziResultType } from '@/types';

interface BaziRecordData {
  recordId: string;
  name?: string;
  isUnlocked: boolean;
  preview: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    briefComment: string;
  } | null;
  fullResult: BaziResultType | null;
}

export function BaziResultView({ recordId }: { recordId: string }) {
  const [data, setData] = useState<BaziRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      // 本地记录（数据库不可用时）：直接读 localStorage
      if (recordId.startsWith('local-')) {
        const stored = localStorage.getItem(`bazi-${recordId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setData({
            recordId,
            isUnlocked: true,
            preview: null,
            fullResult: parsed.fullResult,
          });
        } else {
          setError('未找到排盘记录');
        }
        setLoading(false);
        return;
      }

      const res = await fetch(
        `/api/bazi?id=${encodeURIComponent(recordId)}&deviceId=${getDeviceId()}`,
      );
      const json = await res.json();
      if (json.success) {
        setData({
          recordId,
          name: json.data.name,
          isUnlocked: !!json.data.isUnlocked,
          preview: json.data.preview,
          fullResult: json.data.fullResult,
        });
      } else {
        // API 拒绝时兜底 localStorage（本机刚生成的记录）
        const stored = localStorage.getItem(`bazi-${recordId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setData({
            recordId,
            isUnlocked: true,
            preview: null,
            fullResult: parsed.fullResult,
          });
        } else {
          setError(json.error || '记录不存在或无权访问');
        }
      }
    } catch (err) {
      console.error('[bazi/result] 加载失败:', err);
      setError('加载失败，请刷新重试');
    }
    setLoading(false);
  };

  // 挂载/recordId 变化时异步拉取（setState 走异步回调，不在 effect 同步体内）
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#737373]">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 加载排盘结果...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-[#737373]">{error || '未找到排盘结果'}</p>
        <Link href="/bazi" className="text-sm text-indigo-600 hover:underline">
          重新排盘
        </Link>
      </div>
    );
  }

  if (data.isUnlocked && data.fullResult) {
    return <BaziResult result={data.fullResult} />;
  }

  // 未解锁：展示免费预览（四柱 + 简评）+ 付费墙
  return (
    <div className="space-y-8">
      {data.preview && (
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
          <h3 className="mb-4 font-serif text-lg font-bold">你的四柱</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: '年柱', value: data.preview.yearPillar },
              { label: '月柱', value: data.preview.monthPillar },
              { label: '日柱', value: data.preview.dayPillar },
              { label: '时柱', value: data.preview.hourPillar },
            ].map((p) => (
              <div
                key={p.label}
                className="rounded-2xl border border-black/5 bg-white p-4 text-center shadow-sm dark:border-white/5 dark:bg-white/[0.03]"
              >
                <div className="mb-2 text-xs font-medium text-[#737373] dark:text-[#78716c]">
                  {p.label}
                </div>
                <div className="font-serif text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {p.value}
                </div>
              </div>
            ))}
          </div>
          {data.preview.briefComment && (
            <p className="mt-4 rounded-xl bg-[#fafaf9] p-4 text-sm leading-relaxed text-[#57534e] dark:bg-white/[0.02] dark:text-[#a8a29e]">
              {data.preview.briefComment}
            </p>
          )}
        </div>
      )}

      <PayWall
        recordType="bazi"
        recordId={recordId}
        price={9.9}
        productKey="bazi_unlock"
        onSuccess={load}
      />
    </div>
  );
}
