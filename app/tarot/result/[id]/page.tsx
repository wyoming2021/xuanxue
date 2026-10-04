'use client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { PayWall } from '@/components/PayWall';
import { ShareButton } from '@/components/ShareButton';
import { getDeviceId } from '@/lib/device';

interface TarotCardRecord {
  id: number;
  name: string;
  /** API 契约：upright | reversed（不是中文"正位"） */
  position: 'upright' | 'reversed' | string;
  positionName?: string;
  image?: string;
  keyword?: string;
  uprightReading?: string;
  reversedReading?: string;
  uprightKeywords?: string[];
  reversedKeywords?: string[];
}

interface TarotResultData {
  recordId: string;
  question: string;
  spreadType: 'single' | 'three' | 'celtic';
  cards: TarotCardRecord[];
  isUnlocked: boolean;
}

/** position 枚举 -> 中文展示（P2-1：以 API 契约为准，显式映射） */
function positionLabel(position: string): string {
  return position === 'upright' ? '正位' : '逆位';
}

/** 关键词：优先 API 增强的方向性关键词，兜底单数 keyword 字段 */
function cardKeywords(card: TarotCardRecord): string[] {
  const directional = card.position === 'upright' ? card.uprightKeywords : card.reversedKeywords;
  if (directional && directional.length > 0) return directional;
  if (card.keyword) return [card.keyword];
  return [];
}

/** 该牌位的解读文本（不存在时返回占位而非 undefined） */
function cardReading(card: TarotCardRecord): string {
  if (card.position === 'upright') {
    return card.uprightReading || '解读内容生成中，请稍后刷新查看。';
  }
  return card.reversedReading || '解读内容生成中，请稍后刷新查看。';
}

export default function TarotResultPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  const [result, setResult] = useState<TarotResultData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadResult = async (recordId: string) => {
    try {
      // local- 前缀：数据库不可用时的本地记录，直接读 localStorage
      if (recordId.startsWith('local-')) {
        const stored = localStorage.getItem(`tarot-${recordId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setResult({
            recordId,
            question: parsed.question || '请给我指引',
            spreadType: parsed.spreadType || 'single',
            cards: parsed.cards || [],
            isUnlocked: true, // 本地记录无服务端，不设付费墙
          });
        }
        setLoading(false);
        return;
      }

      // 走服务端 API：归属校验、解锁状态、解读文本都在服务端判断
      const res = await fetch(
        `/api/tarot?id=${encodeURIComponent(recordId)}&deviceId=${getDeviceId()}`,
      );
      const data = await res.json();
      if (data.success) {
        setResult({
          recordId,
          question: data.data.question || '请给我指引',
          spreadType: data.data.spreadType || 'single',
          cards: data.data.cards || [],
          isUnlocked: !!data.data.isUnlocked,
        });
        setLoading(false);
        return;
      }

      // API 拒绝（无权/不存在）时兜底 localStorage，再展示
      const stored = localStorage.getItem(`tarot-${recordId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setResult({
          recordId,
          question: parsed.question || '请给我指引',
          spreadType: parsed.spreadType || 'single',
          cards: parsed.cards || [],
          isUnlocked: true,
        });
      }
    } catch (err) {
      console.error('[tarot/result] 加载结果失败:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      loadResult(p.id);
    });
  }, [params]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#a3a3a3]" />
      </div>
    );
  }

  if (!result || result.cards.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-[#737373]">未找到占卜结果</p>
        <Link href="/tarot" className="text-sm text-indigo-600 hover:underline">
          返回抽牌
        </Link>
      </div>
    );
  }

  const cards = result.cards;
  const question = result.question;
  const unlocked = result.isUnlocked;

  const getOverallReading = () => {
    const uprightCount = cards.filter((c) => c.position === 'upright').length;
    const reversedCount = cards.length - uprightCount;

    let reading = `本次占卜共抽取${cards.length}张牌，其中正位${uprightCount}张，逆位${reversedCount}张。\n\n`;

    if (cards.length === 3) {
      reading += `过去：${cards[0].name}（${positionLabel(cards[0].position)}）\n`;
      reading += `现在：${cards[1].name}（${positionLabel(cards[1].position)}）\n`;
      reading += `未来：${cards[2].name}（${positionLabel(cards[2].position)}）\n`;
      reading += `\n综合来看，事情的发展脉络清晰，建议结合各牌解读理解过去到未来的转变。`;
    } else {
      reading += `整体能量：`;
      if (uprightCount > reversedCount) {
        reading += '正向能量较强，事情发展较为顺利。\n';
      } else if (reversedCount > uprightCount) {
        reading += '需要注意逆位牌的提醒，可能有些挑战需要面对。\n';
      } else {
        reading += '能量平衡，需要根据具体情况灵活应对。\n';
      }
    }

    return reading;
  };

  return (
    <div className="page-transition">
      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
          <Link
            href="/tarot"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" /> 重新抽牌
          </Link>
          <h1 className="mb-2 font-serif text-3xl font-bold">🃏 塔罗占卜结果</h1>
          <p className="text-sm text-[#737373]">问题：{question}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-8">
          {/* 牌阵展示 */}
          <div className="grid grid-cols-3 gap-4">
            {cards.map((card, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-5 text-center ${
                  card.position === 'upright'
                    ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20'
                    : 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20'
                }`}
              >
                <div className="mb-1 text-xs font-medium text-[#a3a3a3]">
                  {card.positionName || `第${i + 1}张`}
                </div>
                <div className="mb-2 text-4xl">{card.image || '🃏'}</div>
                <div className="mb-1 font-serif font-bold">{card.name}</div>
                <div
                  className={`mb-2 text-xs font-medium ${card.position === 'upright' ? 'text-indigo-600' : 'text-purple-600'}`}
                >
                  {positionLabel(card.position)}
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  {cardKeywords(card)
                    .slice(0, 2)
                    .map((k, j) => (
                      <span
                        key={j}
                        className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#737373] shadow-sm dark:bg-white/10"
                      >
                        {k}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* 详细解读：解锁后显示 */}
          {unlocked ? (
            <>
              {cards.map((card, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-white/[0.03]"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-3xl">{card.image || '🃏'}</span>
                    <div>
                      <div className="font-serif font-bold">
                        {card.positionName || `第${i + 1}张`} · {card.name}
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span
                          className={
                            'font-medium ' +
                            (card.position === 'upright' ? 'text-indigo-600' : 'text-purple-600')
                          }
                        >
                          {positionLabel(card.position)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                    {cardReading(card)}
                  </p>
                </div>
              ))}

              {/* 综合解读 */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-800 dark:bg-indigo-950/20">
                <h3 className="mb-4 font-serif text-lg font-bold text-indigo-700 dark:text-indigo-300">
                  🌟 综合解读
                </h3>
                <div className="whitespace-pre-line text-sm leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                  {getOverallReading()}
                </div>
              </div>

              {/* 分享：只分享问题与牌名，不含个人数据 */}
              <div className="flex justify-center">
                <ShareButton
                  title="塔罗占卜结果"
                  description={'问题：' + question + ' - ' + cards.map((c) => c.name).join('、')}
                />
              </div>
            </>
          ) : (
            <PayWall
              recordType="tarot"
              recordId={result.recordId}
              price={
                result.spreadType === 'celtic' ? 19.9 : result.spreadType === 'three' ? 9.9 : 6.9
              }
              productKey={`tarot_unlock_${result.spreadType}`}
              onSuccess={() => loadResult(result.recordId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
