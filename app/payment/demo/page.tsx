import Link from 'next/link';

/**
 * 演示模式的支付说明页。
 * 未配置虎皮椒凭证时 /api/payment/create 会返回指向这里的 payUrl。
 * 只做说明，不提供任何"模拟支付成功"的后门。
 */
export default function PaymentDemoPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="mb-4 text-5xl">🧪</div>
      <h1 className="mb-3 font-serif text-2xl font-bold">演示模式</h1>
      <p className="mb-6 text-sm leading-relaxed text-[#737373] dark:text-[#a8a29e]">
        当前站点尚未接入真实支付网关，订单已记录但无法完成付款。
        站点管理员配置虎皮椒支付凭证（HUPIJAO_APP_ID / HUPIJAO_APP_SECRET）后，
        即可正常支付并解锁内容。
      </p>
      <Link
        href="/"
        className="rounded-xl bg-[#1c1917] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#292524] dark:bg-[#e7e5e4] dark:text-[#1c1917]"
      >
        返回首页
      </Link>
    </div>
  );
}
