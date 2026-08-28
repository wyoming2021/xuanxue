import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const notoSerif = Noto_Serif_SC({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "玄语 - 在线玄学工具 | 八字排盘 · 塔罗占卜 · 每日运势",
    template: "%s | 玄语",
  },
  description: "玄语是一个在线玄学工具站，提供八字排盘、塔罗占卜、每日运势等功能。免费体验传统命理智慧，付费解锁详细解读。",
  keywords: ["八字排盘", "塔罗占卜", "每日运势", "命理", "玄学", "星座运势", "生辰八字"],
  openGraph: {
    title: "玄语 - 在线玄学工具",
    description: "八字排盘 · 塔罗占卜 · 每日运势",
    type: "website",
    locale: "zh_CN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSerif.variable} dark`}>
      <body className="min-h-screen bg-brand-dark text-gray-100 font-sans antialiased">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
