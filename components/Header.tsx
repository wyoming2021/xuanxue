"use client";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { MembershipDialog } from "./MembershipDialog";
import { Moon, Sun } from "lucide-react";

const navItems = [
  { href: "/bazi", label: "八字排盘" },
  { href: "/tarot", label: "塔罗占卜" },
  { href: "/daily", label: "每日运势" },
];

export function Header() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-dark/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="font-serif text-xl font-bold text-brand-gold">
          玄语
        </Link>
        <nav className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden sm:inline text-sm text-brand-muted transition hover:text-brand-gold"
            >
              {item.label}
            </Link>
          ))}
          <MembershipDialog />
          <button
            onClick={toggle}
            className="text-brand-muted hover:text-brand-gold transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
