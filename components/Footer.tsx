export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white/50 py-10 dark:border-white/5 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔮</span>
            <span className="font-serif text-lg font-bold">玄语</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#737373] dark:text-[#78716c]">
            <a
              href="/bazi"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              八字排盘
            </a>
            <a
              href="/ziwei"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              紫微斗数
            </a>
            <a
              href="/xingpan"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              星盘占星
            </a>
            <a
              href="/liuyao"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              六爻占卜
            </a>
            <a
              href="/meihua"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              梅花易数
            </a>
            <a
              href="/tarot"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              塔罗占卜
            </a>
            <a
              href="/leinuoman"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              雷诺曼
            </a>
            <a
              href="/lingsign"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              灵签求签
            </a>
            <a
              href="/daily"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              每日运势
            </a>
            <a
              href="/hehun"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              合婚配对
            </a>
            <a
              href="/zeri"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              黄历择日
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#737373] dark:text-[#78716c]">
            <a
              href="/privacy"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              隐私政策
            </a>
            <a
              href="/terms"
              className="transition-colors hover:text-[#1c1917] dark:hover:text-[#e7e5e4]"
            >
              用户协议
            </a>
          </div>

          <div className="max-w-lg text-center">
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-[#92400e] dark:bg-amber-950/30 dark:text-[#fbbf24]">
              ⚠️
              免责声明：本工具基于传统命理学和塔罗牌知识体系生成内容，仅供娱乐和文化参考，不构成任何专业建议。请理性看待结果，切勿过度迷信。涉及重大人生决策时，请咨询相关专业人士。
            </p>
          </div>

          <p className="text-xs text-[#a3a3a3]">
            © {new Date().getFullYear()} 玄语 XuanYu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
