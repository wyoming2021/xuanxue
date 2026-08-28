"use client";
import { useState } from "react";

interface Props {
  card: {
    id: number;
    name: string;
    position: "upright" | "reversed";
    positionName: string;
    image: string;
    keyword: string;
  };
  index?: number;
}

const CARD_SYMBOLS: Record<number, string> = {
  0: "愚", 1: "魔", 2: "女", 3: "女", 4: "皇", 5: "教", 6: "恋", 7: "战",
  8: "力", 9: "隐", 10: "命", 11: "正", 12: "吊", 13: "死", 14: "节", 15: "恶",
  16: "塔", 17: "星", 18: "月", 19: "阳", 20: "审", 21: "世",
};

export function TarotCard({ card, index = 0 }: Props) {
  const [flipped, setFlipped] = useState(false);
  const isReversed = card.position === "reversed";

  return (
    <div
      className="relative cursor-pointer perspective-1000"
      style={{ animationDelay: `${index * 200}ms` }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative h-48 w-32 sm:h-64 sm:w-44 transition-transform duration-700 transform-style-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Card Back */}
        <div className="absolute inset-0 rounded-xl border-2 border-brand-gold/30 bg-gradient-to-br from-brand-indigo to-brand-dark flex items-center justify-center backface-hidden">
          <div className="text-center">
            <div className="mb-2 text-3xl">✦</div>
            <div className="font-serif text-xs text-brand-gold">玄语塔罗</div>
          </div>
        </div>

        {/* Card Front */}
        <div
          className={`absolute inset-0 rounded-xl border-2 border-brand-gold/30 bg-gradient-to-br from-gray-800 to-gray-900 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-3 ${
            isReversed ? "rotate-180" : ""
          }`}
        >
          <div className="mb-2 h-20 w-20 sm:h-28 sm:w-28 rounded-lg bg-brand-gold/10 flex items-center justify-center text-4xl font-serif">
            {CARD_SYMBOLS[card.id] || "☆"}
          </div>
          <div className="mt-2 font-serif text-sm font-bold text-brand-gold">{card.name}</div>
          <div className="mt-1 text-xs text-brand-muted">{isReversed ? "逆位" : "正位"}</div>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className="text-xs text-brand-muted">{card.positionName}</div>
        {flipped && <div className="mt-1 text-xs text-brand-gold">{card.keyword}</div>}
      </div>
    </div>
  );
}
