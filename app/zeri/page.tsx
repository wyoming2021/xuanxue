'use client';
import { ArrowLeft, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 黄历宜忌数据库
const HUANG_LI_DB: Record<
  string,
  { yi: string[]; ji: string[]; chongSha: string; xingSu: string; jieQi?: string }
> = {
  嫁娶: {
    yi: ['嫁娶', '纳采', '订盟', '祈福', '求嗣', '开光', '出行'],
    ji: ['安葬', '开市', '动土', '破土'],
    chongSha: '冲虎煞南',
    xingSu: '奎木狼',
  },
  搬家: {
    yi: ['入宅', '移徙', '安床', '祈福', '求嗣', '开光'],
    ji: ['嫁娶', '动土', '破土', '安葬'],
    chongSha: '冲兔煞东',
    xingSu: '娄金狗',
  },
  开业: {
    yi: ['开市', '交易', '立券', '挂匾', '开光', '出行'],
    ji: ['嫁娶', '安葬', '破土', '动土'],
    chongSha: '冲龙煞北',
    xingSu: '胃土雉',
  },
  出行: {
    yi: ['出行', '嫁娶', '开光', '解除', '求医', '会亲友'],
    ji: ['动土', '破土', '安葬', '开市'],
    chongSha: '冲蛇煞西',
    xingSu: '昴日鸡',
  },
  装修: {
    yi: ['修造', '动土', '安门', '安床', '栽种', '造畜稠'],
    ji: ['嫁娶', '出行', '安葬', '入宅'],
    chongSha: '冲马煞南',
    xingSu: '毕月乌',
  },
  丧葬: {
    yi: ['安葬', '破土', '启钻', '修坟', '立碑', '入殓'],
    ji: ['嫁娶', '开市', '出行', '祈福'],
    chongSha: '冲羊煞东',
    xingSu: '觜火猴',
  },
};

// 时辰吉凶
const SHICHEN_JIXIONG: Record<string, { label: string; 吉凶: string; 宜: string }> = {
  子时: { label: '子时 (23:00-01:00)', 吉凶: '吉', 宜: '祈福、求嗣、嫁娶' },
  丑时: { label: '丑时 (01:00-03:00)', 吉凶: '凶', 宜: '修造、安葬' },
  寅时: { label: '寅时 (03:00-05:00)', 吉凶: '吉', 宜: '嫁娶、移徙、开市' },
  卯时: { label: '卯时 (05:00-07:00)', 吉凶: '吉', 宜: '求嗣、嫁娶、入宅' },
  辰时: { label: '辰时 (07:00-09:00)', 吉凶: '凶', 宜: '祈福、求嗣' },
  巳时: { label: '巳时 (09:00-11:00)', 吉凶: '吉', 宜: '开光、出行、交易' },
  午时: { label: '午时 (11:00-13:00)', 吉凶: '凶', 宜: '祈福、求嗣' },
  未时: { label: '未时 (13:00-15:00)', 吉凶: '吉', 宜: '嫁娶、修造、入宅' },
  申时: { label: '申时 (15:00-17:00)', 吉凶: '凶', 宜: '安葬、修造' },
  酉时: { label: '酉时 (17:00-19:00)', 吉凶: '凶', 宜: '修造、安葬' },
  戌时: { label: '戌时 (19:00-21:00)', 吉凶: '吉', 宜: '嫁娶、开市、出行' },
  亥时: { label: '亥时 (21:00-23:00)', 吉凶: '吉', 宜: '祈福、嫁娶、入宅' },
};

// 天干地支
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WUXING = ['金', '木', '水', '火', '土'];

function getDayGanZhi(date: Date): string {
  const ganIdx = (date.getFullYear() + date.getMonth() + date.getDate()) % 10;
  const zhiIdx = (date.getFullYear() + date.getMonth() + date.getDate()) % 12;
  return TIANGAN[ganIdx] + DIZHI[zhiIdx];
}

function getWuxing(ganZhi: string): string {
  const gan = ganZhi[0];
  const idx = TIANGAN.indexOf(gan);
  return WUXING[idx % 5];
}

function getMonthInfo(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // 简化的节气
  const jieQi = [
    { month: 1, day: 5, name: '小寒' },
    { month: 1, day: 20, name: '大寒' },
    { month: 2, day: 4, name: '立春' },
    { month: 2, day: 19, name: '雨水' },
    { month: 3, day: 6, name: '惊蛰' },
    { month: 3, day: 21, name: '春分' },
    { month: 4, day: 5, name: '清明' },
    { month: 4, day: 20, name: '谷雨' },
    { month: 5, day: 6, name: '立夏' },
    { month: 5, day: 21, name: '小满' },
    { month: 6, day: 6, name: '芒种' },
    { month: 6, day: 21, name: '夏至' },
    { month: 7, day: 7, name: '小暑' },
    { month: 7, day: 23, name: '大暑' },
    { month: 8, day: 7, name: '立秋' },
    { month: 8, day: 23, name: '处暑' },
    { month: 9, day: 8, name: '白露' },
    { month: 9, day: 23, name: '秋分' },
    { month: 10, day: 8, name: '寒露' },
    { month: 10, day: 23, name: '霜降' },
    { month: 11, day: 7, name: '立冬' },
    { month: 11, day: 22, name: '小雪' },
    { month: 12, day: 7, name: '大雪' },
    { month: 12, day: 22, name: '冬至' },
  ];

  const currentJieQi = jieQi.findLast(
    (j) => month > j.month || (month === j.month && day >= j.day),
  );
  return { jieQi: currentJieQi?.name || '未知' };
}

const ACTIVITIES = [
  { id: 'marriage', label: '嫁娶', emoji: '💍', desc: '结婚、订婚' },
  { id: 'move', label: '搬家', emoji: '🏠', desc: '入宅、移徙' },
  { id: 'open', label: '开业', emoji: '🏪', desc: '开市、交易' },
  { id: 'travel', label: '出行', emoji: '✈️', desc: '远行、出差' },
  { id: 'renovate', label: '装修', emoji: '🔨', desc: '修造、动土' },
  { id: 'funeral', label: '丧葬', emoji: '🕊️', desc: '安葬、立碑' },
];

export default function ZeriPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState('');

  const dateStr = selectedDate.toISOString().split('T')[0];
  const ganZhi = useMemo(() => getDayGanZhi(selectedDate), [selectedDate]);
  const wuxing = useMemo(() => getWuxing(ganZhi), [ganZhi]);
  const monthInfo = useMemo(() => getMonthInfo(selectedDate), [selectedDate]);

  const handleQuery = async () => {
    if (!selectedActivity) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const activity = ACTIVITIES.find((a) => a.id === selectedActivity);
    const huangLi = HUANG_LI_DB[activity?.label || ''] || HUANG_LI_DB['出行'];

    // 简化的好坏判断
    const dayNum = selectedDate.getDate();
    const isGood = dayNum % 3 !== 0; // 简化判断

    setResult({
      date: dateStr,
      ganZhi,
      wuxing,
      jieQi: monthInfo.jieQi,
      activity: activity?.label || selectedActivity,
      activityEmoji: activity?.emoji || '📋',
      isGood,
      yi: isGood ? huangLi.yi : ['诸事不宜'],
      ji: isGood ? huangLi.ji : ['嫁娶', '出行', '开业', '搬家'],
      chongSha: huangLi.chongSha,
      xingSu: huangLi.xingSu,
      shichen: Object.entries(SHICHEN_JIXIONG).map(([name, info]) => ({
        name,
        ...info,
        recommended: isGood && info.吉凶 === '吉',
      })),
      comment: isGood
        ? `这天${activity?.label}比较吉利，建议选择合适的时间进行，事半功倍。`
        : `这天${activity?.label}不太适宜。如必须进行，建议选择合适的时间来化解。`,
    });
    setLoading(false);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setResult(null);
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
              <ArrowLeft className="h-4 w-4" /> 重新择日
            </button>
            <h1 className="mb-2 font-serif text-3xl font-bold">📅 择日结果</h1>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="space-y-6">
            {/* 日期信息 */}
            <div
              className={`rounded-2xl border p-6 text-center ${result.isGood ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'}`}
            >
              <div className="mb-2 text-5xl">{result.activityEmoji}</div>
              <div className="mb-1 font-serif text-2xl font-bold">{result.date}</div>
              <div className="text-sm text-[#737373]">
                {result.ganZhi} · {result.wuxing} · {result.jieQi}
              </div>
              <div
                className={`mt-3 text-lg font-bold ${result.isGood ? 'text-green-600' : 'text-red-600'}`}
              >
                {result.isGood ? '✅ 此日吉利' : '⚠️ 此日不宜'}
              </div>
            </div>

            {/* 宜忌 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-lg font-bold text-green-600">
                    <span className="text-2xl">✓</span> 宜
                  </div>
                  <div className="space-y-2">
                    {result.yi.map((item: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm dark:bg-green-950/30"
                      >
                        <span className="text-green-500">●</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-lg font-bold text-red-600">
                    <span className="text-2xl">✗</span> 忌
                  </div>
                  <div className="space-y-2">
                    {result.ji.map((item: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm dark:bg-red-950/30"
                      >
                        <span className="text-red-500">●</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 冲煞星宿 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-4 font-serif text-lg font-bold">🌏 冲煞星宿</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-[#fafaf9] p-3 dark:bg-white/[0.02]">
                  <div className="text-[#a3a3a3]">冲煞</div>
                  <div className="mt-1 font-medium">{result.chongSha}</div>
                </div>
                <div className="rounded-xl bg-[#fafaf9] p-3 dark:bg-white/[0.02]">
                  <div className="text-[#a3a3a3]">星宿</div>
                  <div className="mt-1 font-medium">{result.xingSu}</div>
                </div>
              </div>
            </div>

            {/* 时辰吉凶 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-4 font-serif text-lg font-bold">⏰ 时辰吉凶</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {result.shichen.map((sc: any) => (
                  <div
                    key={sc.name}
                    className={`rounded-xl p-3 text-center ${sc.recommended ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950/30' : 'border border-black/5 bg-[#fafaf9] dark:border-white/5 dark:bg-white/[0.02]'}`}
                  >
                    <div className="text-xs text-[#a3a3a3]">{sc.label.split(' ')[0]}</div>
                    <div
                      className={`mt-1 text-sm font-bold ${sc.吉凶 === '吉' ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {sc.吉凶}
                    </div>
                    {sc.recommended && (
                      <div className="mt-1 text-[10px] text-green-600">✓ 推荐</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 详细分析 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-3 font-serif text-lg font-bold">📖 详细分析</h3>
              <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">{result.comment}</p>
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
          <h1 className="mb-3 font-serif text-3xl font-bold sm:text-4xl">📅 黄历择日</h1>
          <p className="text-[#737373] dark:text-[#78716c]">选择适合的黄道吉日</p>
        </div>
      </div>
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="space-y-6">
          {/* 日期选择器 */}
          <div className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => changeDate(-1)}
                className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <div className="text-sm text-[#737373]">
                  {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
                </div>
                <div className="font-serif text-2xl font-bold">{selectedDate.getDate()}日</div>
                <div className="text-xs text-[#a3a3a3]">
                  {ganZhi} · {wuxing} · {monthInfo.jieQi}
                </div>
              </div>
              <button
                type="button"
                onClick={() => changeDate(1)}
                className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => {
                setSelectedDate(new Date(e.target.value));
                setResult(null);
              }}
              className="w-full rounded-lg border border-black/10 bg-[#fafaf9] px-3 py-2 text-center dark:border-white/10 dark:bg-white/[0.02]"
            />
          </div>

          {/* 事项选择 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">选择事项</label>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITIES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedActivity(a.id)}
                  className={`flex flex-col items-center rounded-xl border p-3 transition-all ${selectedActivity === a.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50' : 'border-black/10 bg-white dark:border-white/10 dark:bg-white/5'}`}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="mt-1 text-sm font-medium">{a.label}</span>
                  <span className="text-[10px] text-[#a3a3a3]">{a.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleQuery}
            disabled={loading || !selectedActivity}
            className="h-12 w-full rounded-xl bg-[#1c1917] text-base font-semibold text-white hover:bg-[#292524] disabled:opacity-50 dark:bg-[#e7e5e4] dark:text-[#1c1917]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 查询中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> 查询择日
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
