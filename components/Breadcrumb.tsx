'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

import { SITE_URL } from '@/lib/site-config';

import { BreadcrumbJsonLd } from './JsonLd';

interface BreadcrumbItem {
  label: string;
  href?: string;
  emoji?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const allItems = [{ label: '首页', href: '/', emoji: '🏠' }, ...items];

  const jsonLdItems = allItems.map((item) => ({
    name: item.label,
    url: item.href ? `${SITE_URL}${item.href}` : SITE_URL,
  }));

  return (
    <>
      <BreadcrumbJsonLd items={jsonLdItems} />
      <nav aria-label="面包屑导航" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-[#737373] dark:text-[#78716c]">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={item.label} className="flex items-center gap-1">
                {index > 0 && <ChevronRight size={12} className="text-[#a3a3a3]" />}
                {isLast || !item.href ? (
                  <span className="flex items-center gap-1 font-medium text-[#1c1917] dark:text-[#e7e5e4]">
                    {item.emoji && <span className="text-xs">{item.emoji}</span>}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
                  >
                    {item.emoji && <span className="text-xs">{item.emoji}</span>}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

// 预定义的面包屑路径
export const BREADCRUMBS = {
  bazi: [{ label: '八字排盘', href: '/bazi', emoji: '📋' }],
  baziResult: [{ label: '八字排盘', href: '/bazi', emoji: '📋' }, { label: '排盘结果' }],
  ziwei: [{ label: '紫微斗数', href: '/ziwei', emoji: '🌟' }],
  xingpan: [{ label: '星盘占星', href: '/xingpan', emoji: '🌌' }],
  liuyao: [{ label: '六爻占卜', href: '/liuyao', emoji: '🪙' }],
  meihua: [{ label: '梅花易数', href: '/meihua', emoji: '🌸' }],
  tarot: [{ label: '塔罗占卜', href: '/tarot', emoji: '🃏' }],
  tarotResult: [{ label: '塔罗占卜', href: '/tarot', emoji: '🃏' }, { label: '占卜结果' }],
  leinuoman: [{ label: '雷诺曼', href: '/leinuoman', emoji: '🔮' }],
  lingsign: [{ label: '灵签求签', href: '/lingsign', emoji: '📜' }],
  daily: [{ label: '每日运势', href: '/daily', emoji: '⭐' }],
  hehun: [{ label: '合婚配对', href: '/hehun', emoji: '💕' }],
  zeri: [{ label: '黄历择日', href: '/zeri', emoji: '📅' }],
};
