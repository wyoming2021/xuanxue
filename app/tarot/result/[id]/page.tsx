import { TarotCard } from "@/components/TarotCard";
import { PayWall } from "@/components/PayWall";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SPREAD_CONFIGS } from "@/lib/tarot-data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: record } = await supabaseAdmin
    .from("tarot_records")
    .select("question, cards")
    .eq("id", id)
    .single();

  if (!record) return { title: "塔罗占卜结果 - 玄语" };

  const cardNames = record.cards.map((c: any) => c.name).join("、");
  return {
    title: `塔罗占卜：${record.question || "为你指引"} | 玄语`,
    description: `抽到${cardNames}，获取你的塔罗牌解读`,
  };
}

export default async function TarotResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: record } = await supabaseAdmin
    .from("tarot_records")
    .select("*")
    .eq("id", id)
    .single();

  if (!record) notFound();

  const config =
    SPREAD_CONFIGS[record.spread_type as keyof typeof SPREAD_CONFIGS] || SPREAD_CONFIGS.single;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 page-transition">
      <h1 className="mb-2 text-center font-serif text-2xl font-bold text-brand-gold">
        塔罗占卜结果
      </h1>
      <p className="mb-8 text-center text-sm text-brand-muted">{record.question}</p>

      <div
        className={`mb-8 flex ${
          record.cards.length === 1 ? "justify-center" : "flex-wrap justify-center gap-4"
        }`}
      >
        {record.cards.map((card: any, i: number) => (
          <TarotCard key={i} card={card} index={i} />
        ))}
      </div>

      {!record.is_unlocked && (
        <PayWallClient recordId={record.id} price={config.price} />
      )}
    </div>
  );
}

function PayWallClient({ recordId, price }: { recordId: string; price: number }) {
  return (
    <PayWall
      recordType="tarot"
      recordId={recordId}
      price={price}
      onSuccess={() => window.location.reload()}
    />
  );
}
