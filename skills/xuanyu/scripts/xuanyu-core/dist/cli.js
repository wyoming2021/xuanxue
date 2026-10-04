#!/usr/bin/env node
/**
 * xuanyu 命令行 —— 玄语命理引擎
 *
 * 所有命令输出 JSON（UTF-8）。
 * 用法：xuanyu <command> [args...]
 */
import { calculateBazi, timeToHourIndex } from './engines/bazi-engine.js';
import { generateDailyFortune, ZODIAC_LIST } from './engines/daily-engine.js';
import { calculateHehun } from './engines/hehun-engine.js';
import { castLiuyao } from './engines/liuyao-engine.js';
import { castMeihua } from './engines/meihua-engine.js';
import { drawTarot } from './engines/tarot-engine.js';
import { calculateXingpan } from './engines/xingpan-engine.js';
import { calculateZiwei } from './engines/ziwei-engine.js';
const HELP = `xuanyu —— 玄语命理引擎命令行

用法: xuanyu <command> [args...]

命令:
  bazi <出生日期YYYY-MM-DD> <出生时辰(如"午时"或"12:30")> <male|female> [姓名]
      八字排盘（四柱、五行、大运流年）

  ziwei <出生日期YYYY-MM-DD> <出生时辰(同上)> <male|female>
      紫微斗数命盘

  xingpan <出生日期YYYY-MM-DD> <出生时间HH:MM>
      西方星盘（太阳/月亮/上升星座、行星相位）

  hehun <日期1> <时辰1> <male|female> <日期2> <时辰2> <male|female> [名1] [名2]
      八字合婚配对

  liuyao <问题>
      六爻起卦（随机摇卦）

  meihua <问题> [time|number|random]
      梅花易数起卦，默认按时间起卦

  tarot <single|three|celtic> [问题]
      塔罗抽牌：单张 / 三张(过去现在未来) / 凯尔特十字

  daily <星座名> [YYYY-MM-DD]
      每日运势（默认今天）。星座: ${ZODIAC_LIST.join(' ')}

示例:
  xuanyu bazi 1995-08-15 午时 male 张三
  xuanyu tarot three 我的事业前景如何
  xuanyu daily 狮子座 2026-10-01

所有结果输出 JSON。生成结果仅供娱乐与文化参考。
`;
function fail(message) {
  console.error(JSON.stringify({ error: message }, null, 2));
  process.exit(1);
}
function gender(raw) {
  const g = raw.toLowerCase();
  if (g === 'male' || raw === '男') return 'male';
  if (g === 'female' || raw === '女') return 'female';
  return fail(`性别应为 male/female（或 男/女），收到: ${raw}`);
}
function requireArg(value, name) {
  if (!value) fail(`缺少参数: ${name}`);
  return value;
}
const [cmd, ...args] = process.argv.slice(2);
try {
  let result;
  switch (cmd) {
    case 'bazi': {
      const [birthDate, birthTime, g, name] = args;
      const bazi = calculateBazi({
        birthDate: requireArg(birthDate, '出生日期 YYYY-MM-DD'),
        birthTime: requireArg(birthTime, '出生时辰'),
        gender: gender(requireArg(g, '性别')),
      });
      result = name ? { ...bazi, name } : bazi;
      break;
    }
    case 'ziwei': {
      const [birthDate, birthTime, g] = args;
      if (!birthDate || !birthTime || !g)
        fail('用法: xuanyu ziwei <YYYY-MM-DD> <时辰> <male|female>');
      result = calculateZiwei({
        birthDate,
        birthTime: timeToHourIndex(birthTime),
        gender: gender(g),
      });
      break;
    }
    case 'xingpan': {
      const [birthDate, birthTime] = args;
      result = calculateXingpan({
        birthDate: requireArg(birthDate, '出生日期 YYYY-MM-DD'),
        birthTime: requireArg(birthTime, '出生时间 HH:MM'),
      });
      break;
    }
    case 'hehun': {
      const [d1, t1, g1, d2, t2, g2, n1, n2] = args;
      if (!d1 || !t1 || !g1 || !d2 || !t2 || !g2) {
        fail(
          '用法: xuanyu hehun <日期1> <时辰1> <male|female> <日期2> <时辰2> <male|female> [名1] [名2]',
        );
      }
      result = calculateHehun({
        person1: { name: n1 || '方一', birthDate: d1, birthTime: t1, gender: gender(g1) },
        person2: { name: n2 || '方二', birthDate: d2, birthTime: t2, gender: gender(g2) },
      });
      break;
    }
    case 'liuyao': {
      result = castLiuyao(args.join(' ') || '请给我指引');
      break;
    }
    case 'meihua': {
      const method = args[1] || 'time';
      result = castMeihua(args[0] || '请给我指引', method);
      break;
    }
    case 'tarot': {
      const spread = requireArg(args[0], '牌阵 single|three|celtic');
      result = drawTarot(spread, args.slice(1).join(' ') || '请给我指引');
      break;
    }
    case 'daily': {
      result = generateDailyFortune(requireArg(args[0], '星座名'), args[1]);
      break;
    }
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP);
      process.exit(0);
    default:
      fail(`未知命令: ${cmd}。运行 xuanyu help 查看用法。`);
  }
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error(
    JSON.stringify({ error: err instanceof Error ? err.message : String(err) }, null, 2),
  );
  process.exit(1);
}
