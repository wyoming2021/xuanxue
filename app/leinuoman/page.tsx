'use client';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LENORMAND_CARDS = [
  {
    id: 1,
    name: '骑士',
    image: '🐎',
    meaning: '消息、访客',
    keywords: ['快速', '行动', '新消息'],
    detailedReading:
      '骑士带来新的消息和机遇。这张牌代表行动力和速度，暗示事情会快速发展。保持警觉，好消息即将到来。',
    element: '火',
    timing: '快速（几天内）',
  },
  {
    id: 2,
    name: '三叶草',
    image: '☘️',
    meaning: '好运、机会',
    keywords: ['幸运', '希望', '积极'],
    detailedReading:
      '三叶草象征好运和机会。这张牌预示着积极的变化和意外的惊喜。保持乐观心态，好运会眷顾你。',
    element: '火',
    timing: '短期（一周内）',
  },
  {
    id: 3,
    name: '船',
    image: '🚢',
    meaning: '旅途、变化',
    keywords: ['远行', '探索', '变化'],
    detailedReading:
      '船代表旅途和变化。这张牌暗示一段旅程或生活中的重大转变。可能是实际的旅行，也可能是心灵的成长。',
    element: '水',
    timing: '中期（一到三个月）',
  },
  {
    id: 4,
    name: '房子',
    image: '🏠',
    meaning: '家庭、安全',
    keywords: ['稳定', '根基', '庇护'],
    detailedReading:
      '房子象征家庭和安全感。这张牌代表稳定的根基和温暖的庇护。关注家庭事务，家人的支持很重要。',
    element: '土',
    timing: '稳定（长期）',
  },
  {
    id: 5,
    name: '树',
    image: '🌳',
    meaning: '健康、成长',
    keywords: ['生命力', '耐心', '根基'],
    detailedReading: '树代表健康和成长。这张牌象征生命力和持久的发展。保持耐心，根基会越来越稳固。',
    element: '木',
    timing: '缓慢（数月）',
  },
  {
    id: 6,
    name: '云',
    image: '☁️',
    meaning: '困惑、不确定',
    keywords: ['迷茫', '等待', '变化'],
    detailedReading:
      '云代表困惑和不确定性。当前形势不明朗，需要耐心等待。不要急于做决定，让事情自然发展。',
    element: '风',
    timing: '不确定（等待）',
  },
  {
    id: 7,
    name: '蛇',
    image: '🐍',
    meaning: '智慧、诱惑',
    keywords: ['策略', '智慧', '警惕'],
    detailedReading:
      '蛇象征智慧和策略。这张牌提醒你用智慧应对挑战，同时要警惕周围的诱惑。保持清醒的头脑。',
    element: '火',
    timing: '灵活（看情况）',
  },
  {
    id: 8,
    name: '棺材',
    image: '⚰️',
    meaning: '结束、转变',
    keywords: ['结束', '新生', '转变'],
    detailedReading:
      '棺材代表结束和新生。旧的事物即将结束，新的开始即将到来。接受变化，拥抱新的可能性。',
    element: '水',
    timing: '转折点',
  },
  {
    id: 9,
    name: '花束',
    image: '💐',
    meaning: '美丽、礼物',
    keywords: ['喜悦', '美好', '馈赠'],
    detailedReading:
      '花束象征美丽和礼物。这张牌带来喜悦和美好的事物。可能是收到礼物，也可能是生活中的美好时刻。',
    element: '风',
    timing: '惊喜（近期）',
  },
  {
    id: 10,
    name: '镰刀',
    image: '🔪',
    meaning: '决断、分离',
    keywords: ['果断', '切割', '警告'],
    detailedReading:
      '镰刀代表决断和分离。这张牌提醒你需要果断做出决定，可能需要割舍一些东西。小心行事，避免伤害。',
    element: '风',
    timing: '突然（即刻）',
  },
  {
    id: 11,
    name: '鞭子',
    image: '🪢',
    meaning: '重复、活力',
    keywords: ['坚持', '运动', '激情'],
    detailedReading:
      '鞭子象征重复和活力。这张牌代表需要坚持和努力。保持运动和激情，重复的努力会带来成果。',
    element: '火',
    timing: '持续（反复）',
  },
  {
    id: 12,
    name: '鸟',
    image: '🐦',
    meaning: '沟通、关系',
    keywords: ['交流', '社交', '配对'],
    detailedReading:
      '鸟代表沟通和关系。这张牌预示着社交活动和人际关系的发展。多与他人交流，会有新的收获。',
    element: '风',
    timing: '近期（几天到一周）',
  },
  {
    id: 13,
    name: '小孩',
    image: '👶',
    meaning: '新开始、天真',
    keywords: ['新生', '纯真', '潜力'],
    detailedReading:
      '小孩象征新开始和潜力。这张牌代表新的项目或关系的开始。保持纯真的心态，发掘无限可能。',
    element: '土',
    timing: '开始阶段',
  },
  {
    id: 14,
    name: '狐狸',
    image: '🦊',
    meaning: '智慧、狡猾',
    keywords: ['聪明', '警惕', '适应'],
    detailedReading:
      '狐狸代表智慧和适应能力。这张牌提醒你用聪明的方式应对挑战。保持警惕，灵活应变。',
    element: '火',
    timing: '看情况',
  },
  {
    id: 15,
    name: '熊',
    image: '🐻',
    meaning: '力量、保护',
    keywords: ['勇气', '力量', '保护'],
    detailedReading:
      '熊象征力量和保护。这张牌给你勇气和力量去面对困难。相信自己的能力，你会保护好自己和所爱的人。',
    element: '土',
    timing: '稳定（长期）',
  },
  {
    id: 16,
    name: '星星',
    image: '⭐',
    meaning: '希望、灵感',
    keywords: ['光明', '指引', '梦想'],
    detailedReading:
      '星星代表希望和灵感。这张牌预示着光明的未来和实现梦想的可能。保持希望，你的努力会有回报。',
    element: '风',
    timing: '美好（未来）',
  },
  {
    id: 17,
    name: '鹳',
    image: '🦩',
    meaning: '变化、成长',
    keywords: ['蜕变', '进步', '更新'],
    detailedReading:
      '鹳象征变化和成长。这张牌预示着生活中的重大转变和进步。接受变化，你会变得更强大。',
    element: '风',
    timing: '中期（一到三个月）',
  },
  {
    id: 18,
    name: '狗',
    image: '🐕',
    meaning: '忠诚、友谊',
    keywords: ['忠诚', '陪伴', '信任'],
    detailedReading:
      '狗代表忠诚和友谊。这张牌强调友情和忠诚的重要性。珍惜身边的朋友，他们会给你支持。',
    element: '土',
    timing: '稳定（长期）',
  },
  {
    id: 19,
    name: '塔',
    image: '🗼',
    meaning: '权威、孤独',
    keywords: ['地位', '独立', '远见'],
    detailedReading:
      '塔象征权威和独立。这张牌代表追求更高的目标和地位。保持独立思考，你会达到更高的境界。',
    element: '风',
    timing: '长期（数月到数年）',
  },
  {
    id: 20,
    name: '花园',
    image: '🌷',
    meaning: '社交、社区',
    keywords: ['聚会', '公共', '和谐'],
    detailedReading:
      '花园代表社交和社区。这张牌预示着社交活动和公共事务。参与社区活动，会带来新的机遇。',
    element: '土',
    timing: '近期（社交活动）',
  },
  {
    id: 21,
    name: '山',
    image: '🏔️',
    meaning: '障碍、挑战',
    keywords: ['困难', '坚持', '突破'],
    detailedReading: '山代表障碍和挑战。这张牌预示着前方有困难需要克服。保持坚持，你会突破障碍。',
    element: '土',
    timing: '需要时间',
  },
  {
    id: 22,
    name: '路口',
    image: '🛤️',
    meaning: '选择、决定',
    keywords: ['分岔', '决定', '方向'],
    detailedReading:
      '路口代表选择和决定。这张牌提醒你需要做出重要的选择。仔细考虑，选择最适合你的方向。',
    element: '风',
    timing: '即刻（需要决定）',
  },
  {
    id: 23,
    name: '老鼠',
    image: '🐀',
    meaning: '损失、担忧',
    keywords: ['消耗', '焦虑', '注意'],
    detailedReading:
      '老鼠代表损失和担忧。这张牌提醒你注意避免损失，管理好资源。不要过度焦虑，小心应对。',
    element: '水',
    timing: '持续（需要注意）',
  },
  {
    id: 24,
    name: '心',
    image: '❤️',
    meaning: '爱情、感情',
    keywords: ['爱', '温暖', '感情'],
    detailedReading:
      '心代表爱情和感情。这张牌预示着爱情的发展和感情的升温。用心去爱，你会收获幸福。',
    element: '火',
    timing: '浪漫（近期）',
  },
  {
    id: 25,
    name: '戒指',
    image: '💍',
    meaning: '承诺、契约',
    keywords: ['约定', '结合', '完整'],
    detailedReading:
      '戒指象征承诺和契约。这张牌代表重要的承诺和约定。珍惜你的承诺，它会带来完整和幸福。',
    element: '风',
    timing: '重要时刻',
  },
  {
    id: 26,
    name: '书',
    image: '📖',
    meaning: '知识、秘密',
    keywords: ['学习', '隐藏', '智慧'],
    detailedReading:
      '书代表知识和秘密。这张牌预示着学习和发现的机会。保持好奇心，你会获得宝贵的智慧。',
    element: '水',
    timing: '学习过程',
  },
  {
    id: 27,
    name: '信',
    image: '✉️',
    meaning: '消息、文件',
    keywords: ['通知', '沟通', '信息'],
    detailedReading:
      '信代表消息和文件。这张牌预示着重要的消息或文件即将到来。仔细阅读，不要错过重要信息。',
    element: '风',
    timing: '近期（几天内）',
  },
  {
    id: 28,
    name: '男人',
    image: '👨',
    meaning: '男性、阳性',
    keywords: ['理性', '行动', '力量'],
    detailedReading: '男人代表男性能量和理性。这张牌强调理性思考和行动力。用逻辑和力量去实现目标。',
    element: '火',
    timing: '相关人物',
  },
  {
    id: 29,
    name: '女人',
    image: '👩',
    meaning: '女性、阴性',
    keywords: ['感性', '直觉', '温柔'],
    detailedReading:
      '女人代表女性能量和直觉。这张牌强调感性和直觉的重要性。相信你的直觉，它会指引你。',
    element: '风',
    timing: '相关人物',
  },
  {
    id: 30,
    name: '百合',
    image: '🌷',
    meaning: '纯洁、成熟',
    keywords: ['纯净', '优雅', '智慧'],
    detailedReading:
      '百合象征纯洁和成熟。这张牌代表优雅和智慧。保持内心的纯净，你会获得真正的智慧。',
    element: '风',
    timing: '美好（长期）',
  },
  {
    id: 31,
    name: '太阳',
    image: '☀️',
    meaning: '成功、快乐',
    keywords: ['光明', '活力', '成就'],
    detailedReading:
      '太阳代表成功和快乐。这张牌预示着光明的未来和幸福的时刻。享受生活的美好，你会收获成功。',
    element: '火',
    timing: '美好（近期到中期）',
  },
  {
    id: 32,
    name: '月亮',
    image: '🌙',
    meaning: '情感、直觉',
    keywords: ['潜意识', '梦想', '灵感'],
    detailedReading:
      '月亮代表情感和直觉。这张牌强调潜意识和梦想的重要性。相信你的直觉，它会指引你走向正确的方向。',
    element: '水',
    timing: '夜间（情感相关）',
  },
  {
    id: 33,
    name: '钥匙',
    image: '🔑',
    meaning: '答案、解决',
    keywords: ['关键', '开启', '发现'],
    detailedReading:
      '钥匙代表答案和解决。这张牌预示着问题的答案即将到来。保持开放的心态，你会发现解决问题的关键。',
    element: '火',
    timing: '即刻（发现）',
  },
  {
    id: 34,
    name: '鱼',
    image: '🐟',
    meaning: '财富、流动',
    keywords: ['丰盛', '自由', '流动'],
    detailedReading:
      '鱼代表财富和流动。这张牌预示着财富的流动和丰盛。保持开放的心态，财富会自然而然地到来。',
    element: '水',
    timing: '流动（持续）',
  },
  {
    id: 35,
    name: '锚',
    image: '⚓',
    meaning: '稳定、安全',
    keywords: ['固定', '基础', '持久'],
    detailedReading:
      '锚象征稳定和安全。这张牌代表稳固的基础和持久的安全。保持稳定，你会获得长久的安全感。',
    element: '土',
    timing: '长期（稳定）',
  },
  {
    id: 36,
    name: '十字架',
    image: '✝️',
    meaning: '负担、考验',
    keywords: ['责任', '考验', '成长'],
    detailedReading: '十字架代表负担和考验。这张牌预示着责任和考验。接受挑战，它会让你变得更强大。',
    element: '土',
    timing: '需要时间（考验）',
  },
];

const SPREAD_POSITIONS: Record<number, string[]> = {
  3: ['过去', '现在', '未来'],
  5: ['过去', '现在', '未来', '建议', '结果'],
};

export default function LeinuomanPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [cardCount, setCardCount] = useState<3 | 5>(3);

  const handleDraw = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const shuffled = [...LENORMAND_CARDS].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, cardCount).map((c, i) => ({
      ...c,
      position: Math.random() > 0.5 ? '正位' : '逆位',
      positionName: SPREAD_POSITIONS[cardCount][i],
    }));
    setResult({ question: question || '请给我指引', cards: drawn, spreadType: cardCount });
    setLoading(false);
  };

  const getReading = (card: any) => {
    return card.position === '正位'
      ? card.detailedReading
      : card.detailedReading.replace('这张牌', '这张牌逆位时');
  };

  const getOverallReading = (cards: any[]) => {
    const uprightCount = cards.filter((c) => c.position === '正位').length;
    const reversedCount = cards.length - uprightCount;

    let reading = `本次占卜共抽取${cards.length}张牌，其中正位${uprightCount}张，逆位${reversedCount}张。\n\n`;

    if (cards.length === 3) {
      reading += `过去：${cards[0].name}（${cards[0].position}）- ${cards[0].meaning}\n`;
      reading += `现在：${cards[1].name}（${cards[1].position}）- ${cards[1].meaning}\n`;
      reading += `未来：${cards[2].name}（${cards[2].position}）- ${cards[2].meaning}\n\n`;
      reading += `综合来看，你的情况正在从${cards[0].meaning}转变为${cards[2].meaning}。`;
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

  if (result) {
    return (
      <div className="page-transition">
        <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
            <button
              onClick={() => setResult(null)}
              className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
            >
              <ArrowLeft className="h-4 w-4" /> 重新抽牌
            </button>
            <h1 className="mb-2 font-serif text-3xl font-bold">🔮 雷诺曼解读</h1>
            <p className="text-sm text-[#737373]">问题：{result.question}</p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="space-y-8">
            {/* 牌阵展示 */}
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
              {result.cards.map((card: any, i: number) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-5 text-center transition-all ${card.position === '正位' ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20' : 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20'}`}
                >
                  <div className="mb-1 text-xs font-medium text-[#a3a3a3]">{card.positionName}</div>
                  <div className="mb-2 text-4xl">{card.image}</div>
                  <div className="mb-1 font-serif font-bold">{card.name}</div>
                  <div className="mb-2 text-xs text-[#a3a3a3]">第{card.id}张</div>
                  <div
                    className={`mb-2 text-xs font-medium ${card.position === '正位' ? 'text-indigo-600' : 'text-purple-600'}`}
                  >
                    {card.position}
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {card.keywords.map((k: string, j: number) => (
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

            {/* 各牌详细解读 */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold">📖 牌意解读</h3>
              {result.cards.map((card: any, i: number) => (
                <div
                  key={i}
                  className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-white/[0.03]"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-3xl">{card.image}</span>
                    <div>
                      <div className="font-serif font-bold">
                        {card.positionName} · {card.name}
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span
                          className={`font-medium ${card.position === '正位' ? 'text-indigo-600' : 'text-purple-600'}`}
                        >
                          {card.position}
                        </span>
                        <span className="text-[#a3a3a3]">·</span>
                        <span className="text-[#a3a3a3]">元素：{card.element}</span>
                        <span className="text-[#a3a3a3]">·</span>
                        <span className="text-[#a3a3a3]">时间：{card.timing}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                    {getReading(card)}
                  </p>
                </div>
              ))}
            </div>

            {/* 综合解读 */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-800 dark:bg-indigo-950/20">
              <h3 className="mb-4 font-serif text-lg font-bold text-indigo-700 dark:text-indigo-300">
                🌟 综合解读
              </h3>
              <div className="whitespace-pre-line text-sm leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                {getOverallReading(result.cards)}
              </div>
            </div>

            {/* 牌面统计 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-3 font-serif text-lg font-bold">📊 牌面统计</h3>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {result.cards.filter((c: any) => c.position === '正位').length}
                  </div>
                  <div className="text-xs text-[#a3a3a3]">正位</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.cards.filter((c: any) => c.position === '逆位').length}
                  </div>
                  <div className="text-xs text-[#a3a3a3]">逆位</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#57534e]">{result.cards.length}</div>
                  <div className="text-xs text-[#a3a3a3]">总牌数</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" /> 返回首页
          </Link>
          <h1 className="mb-3 font-serif text-3xl font-bold sm:text-4xl">🔮 雷诺曼占卜</h1>
          <p className="text-[#737373] dark:text-[#78716c]">欧洲传统占卜牌，36张牌解读命运</p>
        </div>
      </div>
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">你的问题</label>
            <Input
              placeholder="如：我的感情运如何？"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium">选择牌阵</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCardCount(3)}
                className={`rounded-xl border p-4 text-center transition-all ${cardCount === 3 ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50' : 'border-black/10 bg-white dark:border-white/10 dark:bg-white/5'}`}
              >
                <div className="font-medium">三张牌</div>
                <div className="text-xs text-[#a3a3a3]">过去/现在/未来</div>
              </button>
              <button
                type="button"
                onClick={() => setCardCount(5)}
                className={`rounded-xl border p-4 text-center transition-all ${cardCount === 5 ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50' : 'border-black/10 bg-white dark:border-white/10 dark:bg-white/5'}`}
              >
                <div className="font-medium">五张牌</div>
                <div className="text-xs text-[#a3a3a3]">全面深度解读</div>
              </button>
            </div>
          </div>
          <Button
            onClick={handleDraw}
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#1c1917] text-base font-semibold text-white hover:bg-[#292524] disabled:opacity-50 dark:bg-[#e7e5e4] dark:text-[#1c1917]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 抽牌中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> 开始抽牌
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
