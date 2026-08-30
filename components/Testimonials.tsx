'use client';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: '小雨',
    avatar: '👩',
    rating: 5,
    text: '八字排盘非常准确，大运分析让我对未来有了更清晰的规划。界面也很漂亮，用起来很舒服！',
    date: '3天前',
    feature: '八字排盘',
  },
  {
    name: '阿明',
    avatar: '👨',
    rating: 5,
    text: '塔罗占卜很有趣，三张牌的解读让我对当前的感情状况有了新的认识。强烈推荐！',
    date: '1周前',
    feature: '塔罗占卜',
  },
  {
    name: '小红',
    avatar: '👩',
    rating: 5,
    text: '合婚配对功能很专业，五行分析和地支关系都很详细。帮我和男朋友做了分析，很有参考价值。',
    date: '2周前',
    feature: '合婚配对',
  },
  {
    name: '大伟',
    avatar: '👨',
    rating: 4,
    text: '紫微斗数的星曜分布展示得很清楚，流年运势分析也很有帮助。希望能增加更多解读内容。',
    date: '1个月前',
    feature: '紫微斗数',
  },
  {
    name: '小芳',
    avatar: '👩',
    rating: 5,
    text: '每日运势每天都在看，幸运色和幸运数字都很准！会员价格也很实惠。',
    date: '5天前',
    feature: '每日运势',
  },
  {
    name: '老王',
    avatar: '👨',
    rating: 5,
    text: '黄历择日功能很实用，选结婚日子的时候帮了大忙。时辰吉凶分析很详细。',
    date: '2周前',
    feature: '黄历择日',
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-black/5 bg-white/50 py-16 dark:border-white/5 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-2 font-serif text-2xl font-bold">用户评价</h2>
          <p className="text-[#737373] dark:text-[#78716c]">来自真实用户的反馈</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-white/5 dark:bg-white/[0.03]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{t.avatar}</span>
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-[10px] text-[#a3a3a3]">{t.date}</div>
                  </div>
                </div>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                  {t.feature}
                </span>
              </div>

              <div className="mb-2 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    className={s <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                  />
                ))}
              </div>

              <p className="text-sm leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                &ldquo;{t.text}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            <span>4.9/5 平均评分</span>
            <span className="text-amber-400">·</span>
            <span>已有 12,341 位用户</span>
          </div>
        </div>
      </div>
    </section>
  );
}
