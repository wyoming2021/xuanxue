'use client';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="animate-bounce-subtle mb-8 text-8xl">🔮</div>

      <h1 className="mb-2 font-serif text-6xl font-bold text-indigo-600 dark:text-indigo-400">
        404
      </h1>

      <h2 className="mb-4 font-serif text-2xl font-bold">页面迷失在星空中</h2>

      <p className="mb-8 max-w-md text-[#737373] dark:text-[#78716c]">
        抱歉，你访问的页面似乎不存在。也许它正在某个平行宇宙中等待你的发现。
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button className="gap-2 bg-[#1c1917] text-white hover:bg-[#292524] dark:bg-[#e7e5e4] dark:text-[#1c1917]">
            <Home size={16} />
            返回首页
          </Button>
        </Link>
        <Link href="/bazi">
          <Button variant="outline" className="gap-2">
            <Search size={16} />
            开始排盘
          </Button>
        </Link>
      </div>

      <div className="mt-12 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
        <p className="mb-3 text-sm font-medium">或者试试这些功能：</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { href: '/bazi', label: '八字排盘', emoji: '📋' },
            { href: '/tarot', label: '塔罗占卜', emoji: '🃏' },
            { href: '/ziwei', label: '紫微斗数', emoji: '🌟' },
            { href: '/daily', label: '每日运势', emoji: '⭐' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1 rounded-full border border-black/10 bg-[#fafaf9] px-3 py-1.5 text-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-700"
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
