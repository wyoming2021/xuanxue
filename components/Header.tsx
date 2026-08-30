'use client';
import { Moon, Sun, Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useAuth } from '@/lib/useAuth';

import { LoginDialog } from './LoginDialog';
import { MembershipDialog } from './MembershipDialog';
import { useTheme } from './ThemeProvider';

const navGroups = [
  {
    label: '算命',
    items: [
      { href: '/bazi', label: '八字排盘', emoji: '📋' },
      { href: '/ziwei', label: '紫微斗数', emoji: '🌟' },
      { href: '/xingpan', label: '星盘占星', emoji: '🌌' },
    ],
  },
  {
    label: '占卜',
    items: [
      { href: '/liuyao', label: '六爻占卜', emoji: '🪙' },
      { href: '/meihua', label: '梅花易数', emoji: '🌸' },
      { href: '/tarot', label: '塔罗占卜', emoji: '🃏' },
    ],
  },
  {
    label: '更多',
    items: [
      { href: '/leinuoman', label: '雷诺曼', emoji: '🔮' },
      { href: '/lingsign', label: '灵签求签', emoji: '📜' },
      { href: '/daily', label: '每日运势', emoji: '⭐' },
      { href: '/hehun', label: '合婚配对', emoji: '💕' },
      { href: '/zeri', label: '黄历择日', emoji: '📅' },
    ],
  },
];

export function Header() {
  const { theme, toggle } = useTheme();
  const { user, loading, refresh, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fafaf9]/80 backdrop-blur-xl dark:border-white/5 dark:bg-[#0f0f0f]/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🔮</span>
          <span className="font-serif text-xl font-bold tracking-tight">玄语</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navGroups.map((group) => (
            <div
              key={group.label}
              className="relative"
              onMouseEnter={() => setOpenGroup(group.label)}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#57534e] transition-colors hover:bg-black/5 hover:text-[#1c1917] dark:text-[#a8a29e] dark:hover:bg-white/5">
                {group.label}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${openGroup === group.label ? 'rotate-180' : ''}`}
                />
              </button>
              {openGroup === group.label && (
                <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-xl border border-black/5 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#57534e] transition-colors hover:bg-black/5 hover:text-[#1c1917] dark:text-[#a8a29e] dark:hover:bg-white/5"
                    >
                      <span>{item.emoji}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="ml-2 h-5 w-px bg-black/10 dark:bg-white/10" />
          <LoginDialog user={user} onLogin={refresh} onLogout={logout} />
          <MembershipDialog />
          <button
            onClick={toggle}
            className="ml-1 rounded-lg p-2 text-[#57534e] transition-colors hover:bg-black/5 dark:text-[#a8a29e] dark:hover:bg-white/5"
            aria-label="切换主题"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-[#57534e] md:hidden dark:text-[#a8a29e]"
          aria-label="菜单"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-black/5 bg-[#fafaf9] px-4 pb-4 pt-2 dark:border-white/5 dark:bg-[#0f0f0f] md:hidden">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-2">
              <div className="px-3 py-1 text-xs font-medium text-[#a3a3a3]">{group.label}</div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#57534e] transition-colors hover:bg-black/5 dark:text-[#a8a29e] dark:hover:bg-white/5"
                >
                  <span>{item.emoji}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="my-2 flex items-center gap-2 px-3">
            <LoginDialog user={user} onLogin={refresh} onLogout={logout} />
            <MembershipDialog />
            <button
              onClick={toggle}
              className="rounded-lg p-2 text-[#57534e] transition-colors hover:bg-black/5 dark:text-[#a8a29e] dark:hover:bg-white/5"
              aria-label="切换主题"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
