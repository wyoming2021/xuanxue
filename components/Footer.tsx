export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm text-brand-muted">
      <div className="mx-auto max-w-4xl px-4">
        <p className="mb-2">© {new Date().getFullYear()} 玄语 XuanYu</p>
        <p className="text-xs leading-relaxed">
          ⚠️ 免责声明：本工具基于传统命理学和塔罗牌知识体系生成内容，仅供娱乐和文化参考，不构成任何专业建议。请理性看待结果，切勿过度迷信。涉及重大人生决策时，请咨询相关专业人士。
        </p>
      </div>
    </footer>
  );
}
