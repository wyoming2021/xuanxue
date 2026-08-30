'use client';

interface QuestionSuggestionsProps {
  type: 'tarot' | 'liuyao' | 'meihua';
  onSelect: (question: string) => void;
}

const SUGGESTIONS = {
  tarot: [
    { emoji: '💼', text: '我下个月的工作运势如何？' },
    { emoji: '💕', text: '我的感情运最近怎么样？' },
    { emoji: '💰', text: '近期有什么财运机会？' },
    { emoji: '🎯', text: '我应该做出什么改变？' },
    { emoji: '🌟', text: '未来的三个月会有什么发展？' },
    { emoji: '🤝', text: '这段关系会如何发展？' },
  ],
  liuyao: [
    { emoji: '💼', text: '这次面试能成功吗？' },
    { emoji: '🏠', text: '买房合适吗？' },
    { emoji: '💕', text: '和她的缘分如何？' },
    { emoji: '📈', text: '投资这个项目能赚钱吗？' },
    { emoji: '🏥', text: '身体什么时候能康复？' },
    { emoji: '✈️', text: '出行顺利吗？' },
  ],
  meihua: [
    { emoji: '💼', text: '跳槽换工作好吗？' },
    { emoji: '💕', text: '他对我有好感吗？' },
    { emoji: '📚', text: '考试能通过吗？' },
    { emoji: '🏠', text: '搬家选什么日子好？' },
    { emoji: '💼', text: '创业时机成熟吗？' },
    { emoji: '🤝', text: '合作能成功吗？' },
  ],
};

export function QuestionSuggestions({ type, onSelect }: QuestionSuggestionsProps) {
  const suggestions = SUGGESTIONS[type];

  return (
    <div className="space-y-2">
      <p className="text-xs text-[#a3a3a3]">或者试试这些问题：</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(s.text)}
            className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-[#fafaf9] px-3 py-1.5 text-xs text-[#57534e] transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
          >
            <span>{s.emoji}</span>
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}
