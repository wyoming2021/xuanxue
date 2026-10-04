import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { ShareButton } from '@/components/ShareButton';

import { BaziResultView } from './BaziResultView';

export const metadata: Metadata = {
  title: '八字排盘结果 | 玄语',
  description: '基于传统命理的八字排盘分析报告。',
};

/**
 * 八字结果页：内容渲染全部交给客户端组件走 /api/bazi，
 * 由 API 完成归属校验（deviceId -> users.id -> record.user_id）与解锁判定。
 * 服务端不再直查并渲染全文，防止未付费/无归属访客绕过付费墙（P1-2）。
 */
export default async function BaziResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="page-transition">
      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
          <Link
            href="/bazi"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] transition-colors hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" /> 返回排盘
          </Link>
          <h1 className="mb-2 font-serif text-3xl font-bold">📋 八字排盘</h1>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <BaziResultView recordId={id} />

        {/* 分享只带站点信息，不含姓名和出生日期（P1-2） */}
        <div className="mt-8 flex justify-center">
          <ShareButton
            title="八字排盘分享"
            description="我在玄语做了一个八字排盘，来看看你的命盘吧"
          />
        </div>
      </div>
    </div>
  );
}
