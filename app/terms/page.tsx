import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '用户协议 | 玄语',
  description: '使用玄语服务的条款与规则。',
};

const sections: { title: string; content: string[] }[] = [
  {
    title: '服务说明',
    content: [
      '玄语（以下简称"本站"）提供八字排盘、紫微斗数、塔罗占卜、每日运势等传统文化工具服务。',
      '本站部分内容（如详细解读）为付费服务，具体价格以下单页面展示为准。付款前请确认所选产品与价格。',
    ],
  },
  {
    title: '账号与购买',
    content: [
      '您可以通过邮箱验证码注册和登录本站。请保管好自己的登录凭证，因账号保管不善造成的损失由您自行承担。',
      '单次解锁针对当前占卜记录，会员（日卡/月卡/年卡）在有效期内可不限次查看对应内容。会员时长自支付成功时起算，不可转让、不可折现。',
      '数字内容具有即时消费属性：内容一经解锁查看，原则上不支持退款。如遇支付成功但内容未解锁等异常情况，请联系我们核实处理，查实后将补足服务或退款。',
    ],
  },
  {
    title: '使用规范',
    content: [
      '请勿利用本站从事任何违法违规活动，或通过技术手段尝试绕过付费机制、干扰服务正常运行。',
      '您输入的占卜信息请确保为自己有权提供的内容。',
    ],
  },
  {
    title: '内容免责',
    content: [
      '本站所有命理、占卜、运势内容基于传统文化知识体系，由程序自动生成，仅供娱乐与文化参考，不构成任何专业建议。',
      '涉及健康、法律、投资等重大决策时，请咨询相关领域专业人士。本站不对依据占卜内容做出的决定承担任何责任。',
    ],
  },
  {
    title: '协议变更',
    content: [
      '我们可能不时更新本协议。重大变更会在站内公告，继续使用服务即表示接受更新后的协议。',
      '本协议自 2026 年 9 月起生效。',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 font-serif text-3xl font-bold">用户协议</h1>
      <p className="mb-10 text-sm text-[#a3a3a3]">最近更新：2026 年 9 月</p>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 font-serif text-lg font-bold text-[#1c1917] dark:text-[#e7e5e4]">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.content.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
