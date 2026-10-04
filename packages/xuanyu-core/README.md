# xuanyu-core

玄语命理引擎 —— 纯 TypeScript 计算库，无框架依赖。

提供：八字排盘、紫微斗数、星盘占星、六爻起卦、梅花易数、八字合婚、塔罗抽牌（78 张全牌库）、每日运势。

## 安装

```bash
npm install xuanyu-core
```

## 库用法

```ts
import {
  calculateBazi,
  calculateZiwei,
  calculateXingpan,
  calculateHehun,
  castLiuyao,
  castMeihua,
  drawTarot,
  generateDailyFortune,
} from 'xuanyu-core';

// 八字：时辰支持「午时」或「12:30」
const bazi = calculateBazi({ birthDate: '1995-08-15', birthTime: '午时', gender: 'male' });
bazi.yearPillar; // { gan: '乙', zhi: '亥' }

// 塔罗：single / three / celtic
const reading = drawTarot('three', '我的事业前景如何');

// 每日运势：同星座同日结果可复现
const fortune = generateDailyFortune('狮子座', '2026-10-04');

// 六爻 / 梅花：随机起卦
const liuyao = castLiuyao('测合作前景');
const meihua = castMeihua('能否跳槽', 'random');

// 紫微（birthTime 是时辰序数，用 timeToHourIndex 换算）
import { timeToHourIndex } from 'xuanyu-core';
const ziwei = calculateZiwei({ birthDate: '1995-08-15', birthTime: timeToHourIndex('午时'), gender: 'male' });
```

## CLI 用法

安装后自带 `xuanyu` 命令，所有结果输出 JSON：

```bash
xuanyu bazi 1995-08-15 午时 male 张三
xuanyu tarot three 我的事业前景如何
xuanyu daily 狮子座 2026-10-04
xuanyu hehun 1995-08-15 午时 male 1996-03-20 巳时 female
xuanyu help   # 完整命令表
```

## API 概览

| 函数 | 入参 | 返回 |
|---|---|---|
| `calculateBazi` | `{ birthDate, birthTime, gender }` | 四柱/五行/藏干/十神/纳音/大运/流年 |
| `calculateZiwei` | `{ birthDate, birthTime(时辰序数), gender }` | 命盘十二宫星曜 |
| `calculateXingpan` | `{ birthDate, birthTime }` | 日月上升/行星/相位 |
| `calculateHehun` | `{ person1, person2 }` | 双方八字 + 合婚分析 |
| `castLiuyao` | `question` | 卦象、爻位、世应 |
| `castMeihua` | `question, method?` | 体用卦、互变卦 |
| `drawTarot` | `spread, question?` | 牌阵 + 每张牌正逆位解读 |
| `generateDailyFortune` | `zodiac, date?` | 四维运势 + 幸运指南 |

## 说明

- 运行环境：Node.js ≥ 18（起卦/抽牌使用 Node crypto 随机数）
- 依赖：`lunar-javascript`（历法转换）、`iztro`（紫微斗数），均为 MIT 协议
- 所有生成结果基于传统命理与塔罗知识体系，仅供娱乐与文化参考，不构成任何专业建议
- 来源：[玄语工具站](https://github.com/wyoming2021/xuan-yu)（Next.js 全栈版本，含数据库、会员与支付）
