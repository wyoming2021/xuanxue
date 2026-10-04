---
name: xuanyu
description: 玄语命理引擎：八字排盘、紫微斗数、星盘占星、六爻起卦、梅花易数、八字合婚、塔罗抽牌、每日运势。当用户要求排八字/算命/占卜/抽塔罗牌/看星座运势/合婚配对，或提到 bazi、ziwei、tarot、liuyao、meihua、hehun、每日运势时使用。通过本地 CLI 计算，纯离线，不需要网络。
---

# 玄语命理引擎（xuanyu-core）

通过本 skill 自带的 CLI 做命理计算，所有结果为 JSON。**计算完全本地离线**，结果仅供娱乐与文化参考，回复用户时应附带这一免责说明。

## 首次使用（一次性设置）

CLI 依赖两个 npm 包（lunar-javascript、iztro）。如果 `SKILL_DIR/scripts/xuanyu-core/node_modules` 不存在，先执行一次安装（SKILL_DIR 是本 skill 所在目录）：

```bash
npm install --prefix SKILL_DIR/scripts/xuanyu-core --omit=dev
```

之后所有命令都用：

```bash
node SKILL_DIR/scripts/xuanyu-core/dist/cli.js <command> [args...]
```

直接运行不带参数会打印完整帮助。

## 命令参考

| 命令 | 参数 | 说明 |
|---|---|---|
| `bazi` | `<YYYY-MM-DD> <时辰\|HH:MM> <male\|female\|男\|女> [姓名]` | 八字排盘：四柱、五行、大运、流年 |
| `ziwei` | `<YYYY-MM-DD> <时辰\|HH:MM> <male\|female>` | 紫微斗数命盘（十二宫、星曜） |
| `xingpan` | `<YYYY-MM-DD> <HH:MM>` | 西方星盘：太阳/月亮/上升、行星相位 |
| `hehun` | `<日期1> <时辰1> <性别1> <日期2> <时辰2> <性别2> [名1] [名2]` | 八字合婚配对 |
| `liuyao` | `<问题>` | 六爻摇卦 |
| `meihua` | `<问题> [time\|number\|random]` | 梅花易数，默认时间起卦 |
| `tarot` | `<single\|three\|celtic> [问题]` | 塔罗：单张 / 三张(过去现在未来) / 凯尔特十字(10张) |
| `daily` | `<星座名> [YYYY-MM-DD]` | 每日运势（爱情/事业/财富/健康四维 + 幸运指南） |

时辰写法：`子时`…`亥时` 或 `HH:MM` 均可。星座用中文名（白羊座…双鱼座）。

## 使用示例

```bash
node dist/cli.js bazi 1995-08-15 午时 male 张三
node dist/cli.js tarot three 我的事业前景如何
node dist/cli.js daily 狮子座 2026-10-04
node dist/cli.js hehun 1995-08-15 午时 male 1996-03-20 巳时 female
```

## 回复用户的建议

1. CLI 输出是完整 JSON，**不要原样倾倒**给用户；挑关键信息用可读的中文整理（如八字只讲四柱、五行强弱、总评）。
2. 塔罗：报出每张牌的牌名、正逆位、牌位（过去/现在/未来）和解读要点。
3. 结尾附一句：内容基于传统命理/塔罗知识体系生成，仅供娱乐与参考。
4. 出生日期/时辰/性别缺失时先询问用户，不要猜。
