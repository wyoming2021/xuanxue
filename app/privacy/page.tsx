import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策 | 玄语',
  description: '玄语收集哪些数据、如何使用与保护您的个人信息。',
};

const sections: { title: string; content: string[] }[] = [
  {
    title: '我们收集哪些信息',
    content: [
      '占卜记录数据：为生成八字排盘、塔罗占卜、每日运势等结果，需要您主动输入的出生日期、出生时辰、性别、占卜问题等信息。',
      '设备标识：为在您未注册账号时保存您的占卜记录和购买记录，我们会在浏览器本地生成一个随机设备 ID（UUID）。',
      '账号信息：使用邮箱登录时，我们会保存您的邮箱地址，用于登录验证和跨设备同步您的会员与记录。',
      '订单信息：使用付费功能时，我们会保存订单编号、产品类型、支付金额、支付状态，以及支付网关返回的交易单号。支付密码等敏感信息由第三方支付平台（虎皮椒）处理，我们不会也接触不到。',
    ],
  },
  {
    title: '信息如何使用',
    content: [
      '生成您请求的命理分析报告并展示给您。',
      '在您付费解锁或开通会员后，标记对应内容的解锁状态。',
      '在同一邮箱登录不同设备时，合并您的会员状态与历史记录。',
      '发送登录验证码邮件（仅在您主动请求时）。',
    ],
  },
  {
    title: '信息的存储与保存期限',
    content: [
      '数据存储于 Supabase（PostgreSQL）云数据库，位于受访问控制保护的服务端，前端应用无直接读取业务数据的权限。',
      '占卜记录与订单数据在您使用期间持续保存；如您希望删除自己的记录，可通过页面上的联系方式申请删除，我们将在 15 个工作日内处理。',
      '登录验证码在 5 分钟有效期后自动失效并定期清理。',
    ],
  },
  {
    title: '第三方传输',
    content: [
      '支付：付款时您会跳转至虎皮椒（xunhupay）支付页面，支付结果由其服务器回调通知我们，我们只收到订单号与支付状态。',
      '邮件：登录验证码通过 QQ 邮箱 SMTP 服务发送。',
      '除上述场景外，我们不会将您的个人信息提供给任何第三方，也不会用于出售或广告用途。',
    ],
  },
  {
    title: '您的权利',
    content: [
      '您有权查询、更正、删除自己的个人信息，并可注销账号。',
      '您可以随时清除浏览器本地存储的设备 ID，放弃匿名记录的关联。',
      '行使以上权利或对本政策有疑问，请通过站点公示的联系方式与我们联系。',
    ],
  },
  {
    title: '免责声明',
    content: [
      '本站所有命理、占卜、运势内容基于传统文化知识体系生成，仅供娱乐与文化参考，不构成任何专业建议（医疗、法律、投资等）。请理性看待结果。',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 font-serif text-3xl font-bold">隐私政策</h1>
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
