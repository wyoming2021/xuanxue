import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Sparkles, Star } from "lucide-react";

const features = [
  {
    href: "/bazi",
    icon: <BookOpen size={32} />,
    title: "八字排盘",
    desc: "输入出生信息，解读你的命理格局、五行分布和人生运势",
    color: "text-red-400",
  },
  {
    href: "/tarot",
    icon: <Sparkles size={32} />,
    title: "塔罗占卜",
    desc: "选择牌阵，让古老的塔罗智慧为你指引方向",
    color: "text-purple-400",
  },
  {
    href: "/daily",
    icon: <Star size={32} />,
    title: "每日运势",
    desc: "每日更新的星座运势，助你把握每一天",
    color: "text-yellow-400",
  },
];

export default function HomePage() {
  return (
    <div className="star-bg min-h-[80vh] page-transition">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="mb-4 font-serif text-5xl font-bold text-brand-gold">玄语</h1>
        <p className="mb-12 text-lg text-brand-muted">探索命运的奥秘，解读生命的密码</p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <Link key={f.href} href={f.href}>
              <Card className="h-full border-white/10 bg-white/5 transition-all hover:border-brand-gold/30 hover:bg-white/10 hover:shadow-lg hover:shadow-brand-gold/5 cursor-pointer">
                <CardContent className="flex flex-col items-center p-8">
                  <div className={`mb-4 ${f.color}`}>{f.icon}</div>
                  <h3 className="mb-2 font-serif text-lg font-bold text-white">{f.title}</h3>
                  <p className="text-sm text-brand-muted">{f.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-xs text-brand-muted">
          ⚠️ 本工具基于传统命理学和塔罗牌知识体系生成内容，仅供娱乐和文化参考，不构成任何专业建议。
        </p>
      </div>
    </div>
  );
}
