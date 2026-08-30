'use client';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-4 animate-pulse rounded-full bg-red-100 dark:bg-red-950/30" />
          <AlertTriangle size={48} className="relative text-red-500" />
        </div>
      </div>

      <h1 className="mb-2 font-serif text-6xl font-bold text-red-500">500</h1>

      <h2 className="mb-4 font-serif text-2xl font-bold">服务器出了点问题</h2>

      <p className="mb-8 max-w-md text-[#737373] dark:text-[#78716c]">
        抱歉，服务器遇到了一些问题。我们的技术团队已经收到通知，正在紧急修复中。
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={reset}
          className="gap-2 bg-[#1c1917] text-white hover:bg-[#292524] dark:bg-[#e7e5e4] dark:text-[#1c1917]"
        >
          <RefreshCw size={16} />
          重新加载
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home size={16} />
            返回首页
          </Button>
        </Link>
      </div>

      {error.digest && (
        <div className="mt-8 rounded-lg bg-[#fafaf9] p-4 dark:bg-white/[0.02]">
          <p className="text-xs text-[#a3a3a3]">错误代码：{error.digest}</p>
        </div>
      )}

      <p className="mt-6 text-sm text-[#a3a3a3]">
        如果问题持续出现，请联系我们：support@xuanyu.app
      </p>
    </div>
  );
}
