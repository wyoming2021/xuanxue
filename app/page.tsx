import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { WebsiteJsonLd, ServiceJsonLd, FaqJsonLd, HowToJsonLd } from '@/components/JsonLd';
import { Testimonials } from '@/components/Testimonials';

const categories = [
  {
    title: '算命运势',
    description: '输入出生信息，解读命理格局',
    features: [
      {
        href: '/bazi',
        emoji: '📋',
        title: '八字排盘',
        desc: '四柱八字，五行分析',
        gradient: 'from-indigo-500 to-purple-600',
      },
      {
        href: '/ziwei',
        emoji: '🌟',
        title: '紫微斗数',
        desc: '十二宫位，星曜分布',
        gradient: 'from-violet-500 to-pink-600',
      },
      {
        href: '/xingpan',
        emoji: '🌌',
        title: '星盘占星',
        desc: '太阳月亮上升星座',
        gradient: 'from-blue-500 to-cyan-600',
      },
    ],
  },
  {
    title: '占卜问事',
    description: '一事一问，解读卦象指引',
    features: [
      {
        href: '/liuyao',
        emoji: '🪙',
        title: '六爻占卜',
        desc: '铜钱摇卦，解读卦象',
        gradient: 'from-amber-500 to-orange-600',
      },
      {
        href: '/meihua',
        emoji: '🌸',
        title: '梅花易数',
        desc: '以数起卦，灵活占卜',
        gradient: 'from-pink-500 to-rose-600',
      },
      {
        href: '/tarot',
        emoji: '🃏',
        title: '塔罗占卜',
        desc: '西方神秘学指引',
        gradient: 'from-purple-500 to-indigo-600',
      },
    ],
  },
  {
    title: '抽牌求签',
    description: '古老智慧，给你启发',
    features: [
      {
        href: '/leinuoman',
        emoji: '🔮',
        title: '雷诺曼',
        desc: '欧洲传统占卜牌',
        gradient: 'from-teal-500 to-emerald-600',
      },
      {
        href: '/lingsign',
        emoji: '📜',
        title: '灵签求签',
        desc: '传统庙宇求签解签',
        gradient: 'from-yellow-500 to-amber-600',
      },
      {
        href: '/daily',
        emoji: '⭐',
        title: '每日运势',
        desc: '12星座每日更新',
        gradient: 'from-orange-500 to-red-600',
      },
    ],
  },
  {
    title: '生活择日',
    description: '选择黄道吉日，趋吉避凶',
    features: [
      {
        href: '/hehun',
        emoji: '💕',
        title: '合婚配对',
        desc: '八字/紫微合盘',
        gradient: 'from-rose-500 to-pink-600',
      },
      {
        href: '/zeri',
        emoji: '📅',
        title: '黄历择日',
        desc: '选结婚搬家好日子',
        gradient: 'from-emerald-500 to-green-600',
      },
    ],
  },
];

const highlights = [
  { icon: '⚡', text: '即时生成' },
  { icon: '🔒', text: '隐私安全' },
  { icon: '🆓', text: '免费体验' },
  { icon: '🤖', text: 'AI解读' },
];

const faqItems = [
  {
    question: '什么是八字排盘？',
    answer:
      '八字排盘就是根据你出生的年、月、日、时，算出你的人生密码。它能帮你了解自己的性格特点、适合做什么工作、感情运势怎么样。就像每个人都有自己的说明书一样。',
  },
  {
    question: '塔罗占卜准确吗？',
    answer:
      "塔罗牌更像是一面镜子，帮你从不同角度看待问题。它不会直接告诉你'会发生什么'，而是帮你理清思路，看看当前 situation 下有哪些可能性。信不信由你，但很多人觉得挺有启发。",
  },
  {
    question: '紫微斗数和八字有什么区别？',
    answer:
      "简单来说，八字更像是一张'人生地图'，告诉你整体的运势走向；紫微斗数更像是一张'星座图'，通过不同星曜的位置来解读你在各个方面的表现。两个工具可以互相补充，让分析更全面。",
  },
  {
    question: '会员有什么特权？',
    answer:
      '开通会员后，所有功能的详细解读都可以无限次查看，比如八字详细分析、塔罗深度解读、紫微命盘分析等。月卡会员还能收到每日运势推送，帮你提前了解当天的运势。',
  },
  {
    question: '如何进行八字合婚？',
    answer:
      '在合婚配对页面，输入双方的出生日期和时间，系统会自动分析两人的性格是否互补、感情是否融洽、事业能否互相支持，最后给出一个综合评分和具体建议。',
  },
];

const howToSteps = [
  { name: '选择功能', text: '从首页选择你需要的玄学功能，如八字排盘、塔罗占卜等。' },
  { name: '输入信息', text: '根据页面提示，输入出生日期、时间或其他必要信息。' },
  { name: '获取结果', text: '系统会自动计算并展示基础分析结果。' },
  { name: '解锁详情', text: '如果需要更详细的解读，可以付费解锁完整报告。' },
];

export default function HomePage() {
  return (
    <div className="page-transition">
      <WebsiteJsonLd />
      <ServiceJsonLd />
      <FaqJsonLd items={faqItems} />
      <HowToJsonLd
        name="如何使用玄语在线玄学工具"
        description="按照以下步骤使用玄语进行八字排盘或塔罗占卜"
        steps={howToSteps}
        totalTime="PT5M"
      />

      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="grid-pattern absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              传统命理 × 现代科技
            </div>
            <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="gradient-text">探索命运的奥秘</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-[#57534e] dark:text-[#a8a29e]">
              玄语融合传统命理学与现代科技，提供八字、紫微、星盘、六爻、塔罗、合婚、择日等全方位玄学服务。免费体验，深度解读。
            </p>
          </div>

          <div className="animate-slide-up delay-200 mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/bazi"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1c1917] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#292524] hover:shadow-lg dark:bg-[#e7e5e4] dark:text-[#1c1917] dark:hover:bg-white"
            >
              开始排盘 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tarot"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d6d3d1] bg-white px-6 py-3 text-sm font-semibold text-[#1c1917] transition-all hover:border-[#a8a29e] hover:shadow-lg dark:border-white/10 dark:bg-transparent dark:text-[#e7e5e4] dark:hover:border-white/20"
            >
              塔罗占卜 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="animate-slide-up delay-300 flex flex-wrap justify-center gap-6">
            {highlights.map((h) => (
              <div
                key={h.text}
                className="flex items-center gap-2 text-sm text-[#737373] dark:text-[#78716c]"
              >
                <span>{h.icon}</span>
                {h.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      {categories.map((category, ci) => (
        <section
          key={category.title}
          className={
            ci % 2 === 1
              ? 'border-t border-black/5 bg-white/50 py-16 dark:border-white/5 dark:bg-white/[0.02]'
              : 'py-16'
          }
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <h2 className="mb-2 font-serif text-2xl font-bold">{category.title}</h2>
              <p className="text-[#737373] dark:text-[#78716c]">{category.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {category.features.map((f, fi) => (
                <Link
                  key={f.href}
                  href={f.href}
                  className="feature-card group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-md dark:border-white/5 dark:bg-white/[0.03] dark:hover:border-indigo-800"
                  style={{ animationDelay: `${fi * 100}ms` }}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                  />
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{f.emoji}</span>
                    <div>
                      <h3 className="mb-1 font-serif font-bold">{f.title}</h3>
                      <p className="text-sm text-[#737373] dark:text-[#78716c]">{f.desc}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 transition-all group-hover:opacity-100 dark:text-indigo-400">
                    立即体验{' '}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* FAQ Section */}
      <section className="border-t border-black/5 bg-white/50 py-16 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-2 font-serif text-2xl font-bold">常见问题</h2>
            <p className="text-[#737373] dark:text-[#78716c]">关于玄语的常见问题解答</p>
          </div>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]"
              >
                <summary className="flex cursor-pointer items-center justify-between font-serif font-bold">
                  {item.question}
                  <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-black/5 py-16 dark:border-white/5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-2 font-serif text-2xl font-bold">价格透明</h2>
            <p className="text-[#737373] dark:text-[#78716c]">基础功能免费，深度解读按需付费</p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                name: '单次解锁',
                price: '¥9.9',
                desc: '一次性详细解读',
                features: ['八字排盘详解', '塔罗深度解读', '一次购买'],
              },
              {
                name: '月卡会员',
                price: '¥19.9',
                desc: '30天无限次使用',
                features: ['无限次解锁', '每日运势推送', '会员专属内容'],
                popular: true,
              },
              {
                name: '年卡会员',
                price: '¥199',
                desc: '全年无限次使用',
                features: ['全年无限次', '运势日历', '优先新功能'],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 text-center ${plan.popular ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20' : 'border-black/5 bg-white dark:border-white/5 dark:bg-white/[0.03]'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white">
                    推荐
                  </div>
                )}
                <h3 className="mb-1 font-serif font-bold">{plan.name}</h3>
                <p className="mb-4 text-xs text-[#737373] dark:text-[#78716c]">{plan.desc}</p>
                <div className="mb-6 font-serif text-3xl font-bold">{plan.price}</div>
                <ul className="space-y-2 text-sm text-[#57534e] dark:text-[#a8a29e]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center justify-center gap-2">
                      <span className="text-green-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* How to Use */}
      <section className="border-t border-black/5 bg-white/50 py-16 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-2 font-serif text-2xl font-bold">如何使用</h2>
            <p className="text-[#737373] dark:text-[#78716c]">简单四步，获取你的专属分析</p>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {howToSteps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-serif text-xl font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                  {i + 1}
                </div>
                <h3 className="mb-1 font-medium">{step.name}</h3>
                <p className="text-xs text-[#737373] dark:text-[#78716c]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
