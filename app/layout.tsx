import type { Metadata } from 'next';
import { Noto_Serif_SC } from 'next/font/google';

import './globals.css';
import { SkipToContent } from '@/components/Accessibility';
import { BackToTop } from '@/components/BackToTop';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/Toast';
import { Toaster } from '@/components/ui/sonner';

const notoSerif = Noto_Serif_SC({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: {
    default: '玄语 - 在线玄学工具 | 八字排盘 · 塔罗占卜 · 每日运势',
    template: '%s | 玄语',
  },
  description:
    '玄语是一个在线玄学工具站，提供八字排盘、塔罗占卜、每日运势等功能。免费体验传统命理智慧，付费解锁详细解读。',
  keywords: ['八字排盘', '塔罗占卜', '每日运势', '命理', '玄学', '星座运势', '生辰八字'],
  openGraph: {
    title: '玄语 - 在线玄学工具',
    description: '八字排盘 · 塔罗占卜 · 每日运势',
    type: 'website',
    locale: 'zh_CN',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSerif.variable}`}>
      <body className="min-h-screen bg-[#fafaf9] text-[#1c1917] font-sans antialiased dark:bg-[#0f0f0f] dark:text-[#e7e5e4]">
        <SkipToContent />
        <ThemeProvider>
          <ToastProvider>
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <BackToTop />
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
