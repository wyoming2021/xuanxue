'use client';
import { Star, BookOpen, Clock, ArrowRight, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';

import type { TarotCard } from '@/app/types/tarot';

interface TarotReadingProps {
  cards: TarotCard[];
  spreadType: string;
  question: string;
}

// 牌阵解读模板
const SPREAD_INTERPRETATIONS: Record<
  string,
  {
    title: string;
    positions: string[];
    combineReading: (cards: TarotReadingProps['cards']) => string;
  }
> = {
  single: {
    title: '单张牌指引',
    positions: ['指引'],
    combineReading: (cards) => {
      const card = cards[0];
      if (!card) return '';
      const isReversed = card.position === 'reversed';
      return `这张${isReversed ? '逆位' : '正位'}的${card.name}牌为你带来了${card.positionName}。它代表的核心能量是"${card.keyword}"，${isReversed ? card.reversedReading : card.uprightReading}。`;
    },
  },
  three: {
    title: '三张牌解读',
    positions: ['过去', '现在', '未来'],
    combineReading: (cards) => {
      if (cards.length < 3) return '';
      const past = cards[0];
      const present = cards[1];
      const future = cards[2];

      let reading = `【过去】${past.name}（${past.position === 'upright' ? '正位' : '逆位'}）：`;
      reading += past.position === 'upright' ? past.uprightReading : past.reversedReading;
      reading += '\n\n';

      reading += `【现在】${present.name}（${present.position === 'upright' ? '正位' : '逆位'}）：`;
      reading += present.position === 'upright' ? present.uprightReading : present.reversedReading;
      reading += '\n\n';

      reading += `【未来】${future.name}（${future.position === 'upright' ? '正位' : '逆位'}）：`;
      reading += future.position === 'upright' ? future.uprightReading : future.reversedReading;

      return reading;
    },
  },
  celtic: {
    title: '凯尔特十字解读',
    positions: [
      '现状',
      '挑战',
      '根源',
      '过去',
      '可能',
      '近未来',
      '自我态度',
      '环境',
      '希望/恐惧',
      '最终结果',
    ],
    combineReading: (cards) => {
      if (cards.length < 10) return '';

      let reading = '【综合分析】\n\n';

      // 现状和挑战
      reading += `• 现状：${cards[0].name}（${cards[0].position === 'upright' ? '正位' : '逆位'}）- ${cards[0].keyword}\n`;
      reading += `• 挑战：${cards[1].name}（${cards[1].position === 'upright' ? '正位' : '逆位'}）- ${cards[1].keyword}\n`;
      reading += `• 根源：${cards[2].name}（${cards[2].position === 'upright' ? '正位' : '逆位'}）- ${cards[2].keyword}\n\n`;

      // 时间线
      reading += `• 过去影响：${cards[3].name}（${cards[3].position === 'upright' ? '正位' : '逆位'}）- ${cards[3].keyword}\n`;
      reading += `• 可能发展：${cards[4].name}（${cards[4].position === 'upright' ? '正位' : '逆位'}）- ${cards[4].keyword}\n`;
      reading += `• 近期未来：${cards[5].name}（${cards[5].position === 'upright' ? '正位' : '逆位'}）- ${cards[5].keyword}\n\n`;

      // 态度和环境
      reading += `• 自我态度：${cards[6].name}（${cards[6].position === 'upright' ? '正位' : '逆位'}）- ${cards[6].keyword}\n`;
      reading += `• 外在环境：${cards[7].name}（${cards[7].position === 'upright' ? '正位' : '逆位'}）- ${cards[7].keyword}\n`;
      reading += `• 希望/恐惧：${cards[8].name}（${cards[8].position === 'upright' ? '正位' : '逆位'}）- ${cards[8].keyword}\n`;
      reading += `• 最终结果：${cards[9].name}（${cards[9].position === 'upright' ? '正位' : '逆位'}）- ${cards[9].keyword}\n`;

      return reading;
    },
  },
};

// 牌面符号
const CARD_SYMBOLS: Record<number, string> = {
  0: '愚',
  1: '魔',
  2: '女',
  3: '女',
  4: '皇',
  5: '教',
  6: '恋',
  7: '战',
  8: '力',
  9: '隐',
  10: '命',
  11: '正',
  12: '吊',
  13: '死',
  14: '节',
  15: '恶',
  16: '塔',
  17: '星',
  18: '月',
  19: '阳',
  20: '审',
  21: '世',
};

export function TarotReading({ cards, spreadType, question }: TarotReadingProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showSpreadReading, setShowSpreadReading] = useState(true);

  const spreadConfig = SPREAD_INTERPRETATIONS[spreadType] || SPREAD_INTERPRETATIONS.single;
  const spreadReading = spreadConfig.combineReading(cards);

  // 统计正逆位
  const uprightCount = cards.filter((c) => c.position === 'upright').length;
  const reversedCount = cards.filter((c) => c.position === 'reversed').length;

  return (
    <div className="space-y-6">
      {/* 问题 */}
      <div className="text-center">
        <p className="text-sm text-[#737373] dark:text-[#78716c]">你的问题</p>
        <p className="font-serif text-lg font-medium">{question}</p>
      </div>

      {/* 牌阵统计 */}
      <div className="flex justify-center gap-4 text-sm">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          正位 {uprightCount}张
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-400" />
          逆位 {reversedCount}张
        </span>
      </div>

      {/* 抽到的牌 */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
        <h3 className="mb-4 font-serif text-lg font-bold">你抽到的牌</h3>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(cards.length, 5)}, 1fr)` }}
        >
          {cards.map((card, i) => (
            <CardDetail
              key={i}
              card={card}
              index={i}
              isExpanded={expandedCard === i}
              onToggle={() => setExpandedCard(expandedCard === i ? null : i)}
            />
          ))}
        </div>
      </div>

      {/* 牌阵解读 */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-800 dark:bg-indigo-950/20">
        <button
          onClick={() => setShowSpreadReading(!showSpreadReading)}
          className="flex w-full items-center justify-between"
        >
          <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-indigo-700 dark:text-indigo-300">
            <BookOpen size={18} />
            {spreadConfig.title}
          </h3>
          {showSpreadReading ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showSpreadReading && (
          <div className="mt-4 space-y-4">
            {spreadReading.split('\n\n').map((paragraph, i) => (
              <p key={i} className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 综合建议 */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
        <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-bold">
          <Info size={18} className="text-amber-500" />
          综合建议
        </h3>
        <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
          {generateOverallAdvice(cards, spreadType)}
        </p>
      </div>

      {/* 时间预测（三张牌） */}
      {spreadType === 'three' && (
        <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
          <h3 className="mb-3 flex items-center gap-2 font-serif font-bold">
            <Clock size={16} className="text-green-600 dark:text-green-400" />
            时间预测
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-[#a3a3a3]">过去影响</div>
              <div className="font-medium">已发生</div>
            </div>
            <div className="text-center">
              <div className="text-[#a3a3a3]">当前状态</div>
              <div className="font-medium">进行中</div>
            </div>
            <div className="text-center">
              <div className="text-[#a3a3a3]">未来趋势</div>
              <div className="font-medium">1-3个月内</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 单张牌详情组件
function CardDetail({
  card,
  index,
  isExpanded,
  onToggle,
}: {
  card: TarotCard;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isReversed = card.position === 'reversed';
  const reading = isReversed ? card.reversedReading : card.uprightReading;
  const keywords = isReversed ? card.reversedKeywords : card.uprightKeywords;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isReversed
          ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20'
          : 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* 牌面 */}
      <div className="mb-3 flex justify-center">
        <div
          className={`relative h-32 w-20 rounded-lg border-2 ${
            isReversed ? 'border-indigo-400 rotate-180' : 'border-amber-400'
          } bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900`}
        >
          <div className="flex h-full items-center justify-center text-3xl font-serif font-bold text-gray-600 dark:text-gray-300">
            {CARD_SYMBOLS[card.id] || '☆'}
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="text-center">
        <div className="font-serif font-bold">{card.name}</div>
        <div className={`text-xs font-medium ${isReversed ? 'text-indigo-600' : 'text-amber-600'}`}>
          {isReversed ? '逆位' : '正位'}
        </div>
        {card.positionName && (
          <div className="mt-1 text-[10px] text-[#a3a3a3]">{card.positionName}</div>
        )}
      </div>

      {/* 关键词 */}
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {(keywords || [card.keyword]).slice(0, 3).map((kw: string, i: number) => (
          <span
            key={i}
            className="rounded-full bg-white/50 px-2 py-0.5 text-[10px] text-[#57534e] dark:bg-black/20 dark:text-[#a8a29e]"
          >
            {kw}
          </span>
        ))}
      </div>

      {/* 元素和星座 */}
      {(card.element || card.astrology) && (
        <div className="mt-2 flex justify-center gap-2 text-[10px] text-[#a3a3a3]">
          {card.element && <span>🔮 {card.element}</span>}
          {card.astrology && <span>⭐ {card.astrology}</span>}
        </div>
      )}

      {/* 展开/收起 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="mt-3 w-full text-center text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
      >
        {isExpanded ? '收起详情' : '查看详细解读'}
      </button>

      {/* 详细解读 */}
      {isExpanded && reading && (
        <div className="mt-3 border-t border-black/5 pt-3 dark:border-white/5">
          <p className="text-xs leading-relaxed text-[#57534e] dark:text-[#a8a29e]">{reading}</p>
        </div>
      )}
    </div>
  );
}

// 生成综合建议
function generateOverallAdvice(cards: TarotCard[], spreadType: string): string {
  const uprightCount = cards.filter((c) => c.position === 'upright').length;
  const reversedCount = cards.filter((c) => c.position === 'reversed').length;

  let advice = '';

  // 根据正逆位比例给建议
  if (uprightCount > reversedCount * 2) {
    advice =
      '牌面整体呈现积极能量，正位牌占据主导。这表明你的问题有着良好的发展态势，建议保持信心，积极行动。';
  } else if (reversedCount > uprightCount * 2) {
    advice =
      '牌面逆位较多，暗示可能存在一些阻碍或需要注意的方面。建议放慢脚步，仔细审视当前状况，避免冲动行事。';
  } else {
    advice =
      '正逆位牌面较为均衡，表明事情处于变化之中，有好有坏。建议保持平衡心态，灵活应对各种情况。';
  }

  // 根据大阿尔卡纳给建议
  const majorArcana = cards.filter((c) => c.id <= 21);
  if (majorArcana.length > 0) {
    const majorNames = majorArcana.map((c) => c.name).join('、');
    advice += ` 牌阵中出现了${majorNames}等大阿尔卡纳牌，这些牌代表着重要的命运转折点，请特别关注这些牌的指引。`;
  }

  // 特殊牌组合
  const cardIds = cards.map((c) => c.id);
  if (cardIds.includes(13) && cardIds.includes(14)) {
    advice += ' 死神与节制同时出现，暗示一个重要的转变正在发生，保持耐心和平衡是关键。';
  }
  if (cardIds.includes(17) && cardIds.includes(18)) {
    advice += ' 星星与月亮同时出现，直觉和希望是当前最重要的力量，相信你的内心指引。';
  }
  if (cardIds.includes(19)) {
    advice += ' 太阳牌的出现带来强烈的积极能量，成功和快乐正在向你靠近。';
  }

  return advice;
}
