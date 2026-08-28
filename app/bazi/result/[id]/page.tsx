import { BaziResult } from "@/components/BaziResult";
import { PayWall } from "@/components/PayWall";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: record } = await supabaseAdmin
    .from("bazi_records")
    .select("name, bazi_result")
    .eq("id", id)
    .single();

  if (!record) return { title: "八字排盘结果 - 玄语" };

  const result = record.bazi_result;
  const title = `${record.name}的八字排盘 - ${result.yearPillar.gan}${result.yearPillar.zhi}年`;
  const desc = `八字排盘：${result.briefComment}`;

  return {
    title: `${title} | 玄语`,
    description: desc,
    openGraph: { title, description: desc },
  };
}

export default async function BaziResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: record } = await supabaseAdmin
    .from("bazi_records")
    .select("*")
    .eq("id", id)
    .single();

  if (!record) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 page-transition">
      <h1 className="mb-2 text-center font-serif text-2xl font-bold text-brand-gold">
        {record.name}的八字排盘
      </h1>
      <p className="mb-8 text-center text-sm text-brand-muted">
        {record.birth_date} · {record.birth_time} · {record.gender === "male" ? "男" : "女"}
      </p>

      <BaziResult result={record.bazi_result} />

      {!record.is_unlocked && (
        <PayWallClient recordId={record.id} />
      )}
    </div>
  );
}

function PayWallClient({ recordId }: { recordId: string }) {
  return (
    <PayWall
      recordType="bazi"
      recordId={recordId}
      price={9.9}
      onSuccess={() => window.location.reload()}
    />
  );
}
