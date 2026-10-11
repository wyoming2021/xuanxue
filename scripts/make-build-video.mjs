#!/usr/bin/env node
/**
 * 「玄学站搭建教程」视频生成器（高清 1920x1080，男声配音，底部字幕）。
 *
 * 画面：每步一张深色高清步骤卡片（HTML 渲染 → Chromium 截图）
 * 配音：edge-tts 中文男声（zh-CN-YunxiNeural，微软在线语音）
 * 字幕：ASS 底部字幕（配音全文，微软雅黑自动换行）
 * 合成：ffmpeg（图片 + 音频 → 每步片段 → 拼接 + 烧录字幕）
 *
 * 依赖：node（项目内 playwright）、edge-tts（Python）、ffmpeg（在 PATH）。
 * 用法：node scripts/make-build-video.mjs
 * 输出：build-tutorial.mp4
 */
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WORKDIR = 'C:/Users/wyx90/AppData/Local/Temp/xuanyu-build-video';
const OUT = path.resolve('build-tutorial.mp4');
const VOICE = 'zh-CN-YunxiNeural'; // 中文男声：云希

// ---------- 教程步骤 ----------
const STEPS = [
  {
    title: '第一步：注册 Supabase 数据库',
    points: ['打开 supabase.com 注册账号', '创建新项目，区域选新加坡', '保存项目地址和 service_role 密钥'],
    command: '',
    narration:
      '第一步，注册 Supabase 数据库。打开 supabase 点 com，用邮箱注册，创建一个新项目，区域选择新加坡。创建完成后，在项目设置里复制项目地址和 service role 密钥，后面部署要用。',
  },
  {
    title: '第二步：注册硅基流动 AI',
    points: ['打开 siliconflow.cn 注册实名', '创建 API 密钥', '选免费模型 Qwen2.5，用于自动写文章'],
    command: '',
    narration:
      '第二步，注册硅基流动 AI。打开 siliconflow 点 cn，注册并实名认证，在左侧创建 API 密钥，选择免费的 Qwen 模型，用来给网站自动写文章。',
  },
  {
    title: '第三步：购买域名',
    points: ['在域名服务商购买，如 myxuan.site', '一年约 50 到 100 元'],
    command: '',
    narration: '第三步，购买域名。在域名服务商买一个域名，比如 myxuan 点 site，一年只要几十块钱。',
  },
  {
    title: '第四步：购买 VPS 服务器',
    points: ['1 核 1G 内存即可跑动', '系统选择 Ubuntu 22.04', '月费约 30 到 100 元'],
    command: '',
    narration:
      '第四步，购买 VPS 服务器。买一台云服务器，一核一 G 内存就够用，系统选择 Ubuntu 22.04。',
  },
  {
    title: '第五步：解析域名',
    points: ['在域名管理后台添加 A 记录', '指向 VPS 的公网 IP 地址'],
    command: '',
    narration:
      '第五步，解析域名。在域名管理后台添加一条 A 记录，把域名指向你 VPS 的公网 IP 地址。',
  },
  {
    title: '第六步：连接 VPS 服务器',
    points: ['打开 VPS 服务商网页终端', '登录你的服务器'],
    command: 'ssh root@你的服务器IP',
    narration: '第六步，连接 VPS 服务器。打开 VPS 服务商的网页终端，登录你的服务器。',
  },
  {
    title: '第七步：执行一键部署',
    points: ['粘贴一键部署命令并回车', '按提示填写域名和密钥', '自动完成安装、HTTPS、定时任务'],
    command:
      'sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/wyoming2021/xuanxue/master/scripts/vps-deploy.sh)"',
    narration:
      '第七步，执行一键部署。在服务器终端粘贴这条命令并回车，脚本会自动完成安装网站、配置 HTTPS 和定时任务。',
  },
  {
    title: '第八步：登录后台发布文章',
    points: ['用管理员邮箱登录网站', '进入后台，点击 AI 写文章', '选择直接发布，一分钟生成一篇'],
    command: '',
    narration:
      '第八步，登录后台发布文章。用你的管理员邮箱登录网站，进入后台，点击 AI 写文章，选择直接发布，一分钟自动生成一篇。',
  },
  {
    title: '第九步：接入收款功能',
    points: ['注册虎皮椒商户', '拿到 APP_ID 和 APP_SECRET', '填入服务器配置，用户即可付费解锁'],
    command: '',
    narration:
      '第九步，接入收款功能。注册虎皮椒商户，拿到 APP ID 和密钥，填到服务器的配置文件里，用户就能付费解锁了。',
  },
  {
    title: '第十步：提交谷歌收录',
    points: ['谷歌搜索控制台验证域名', '提交 sitemap.xml', '开始盈利：付费+会员+广告+咨询'],
    command: '',
    narration:
      '第十步，提交谷歌收录。在谷歌搜索控制台验证域名，提交网站地图，让文章被谷歌收录，开始获取流量和收益。',
  },
];

// ---------- 工具函数 ----------
function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, ...opts });
}

function getDuration(file) {
  const out = run(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`,
  );
  return parseFloat(out.trim());
}

// edge-tts 偶发网络/限流失败，自动重试最多 4 次
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
async function tts(text, mp3) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      run(
        `edge-tts --voice ${VOICE} --text "${text.replace(/"/g, '\\"')}" --write-media "${mp3}"`,
      );
      return;
    } catch (e) {
      if (attempt === 4) throw e;
      console.log(`  ⚠️ 男声生成第 ${attempt} 次失败，${2 * attempt}s 后重试...`);
      await sleep(2000 * attempt);
    }
  }
}

// ---------- 生成步骤卡片 HTML ----------
function buildHtml(step, index) {
  const num = String(index + 1).padStart(2, '0');
  const pointsHtml = step.points
    .map((p) => `<li>${p}</li>`)
    .join('');
  const cmdHtml = step.command
    ? `<div class="cmd">${step.command.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</div>`
    : '';
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;width:1920px;height:1080px;font-family:'Microsoft YaHei','微软雅黑',sans-serif;}
  .card{width:1920px;height:1080px;box-sizing:border-box;padding:110px 130px;position:relative;
    background:linear-gradient(135deg,#1c1917 0%,#292524 50%,#1e1b4b 100%);color:#e7e5e4;overflow:hidden;}
  .badge{display:inline-flex;align-items:center;gap:14px;background:rgba(129,140,248,.15);
    border:1px solid rgba(129,140,248,.45);color:#a5b4fc;border-radius:999px;padding:12px 28px;
    font-size:26px;font-weight:600;margin-bottom:44px;}
  .title{font-size:66px;font-weight:700;line-height:1.35;margin:0 0 48px 0;max-width:1500px;}
  .points{list-style:none;padding:0;margin:0 0 46px 0;max-width:1500px;}
  .points li{font-size:38px;color:#d6d3d1;margin-bottom:26px;padding-left:50px;position:relative;line-height:1.5;}
  .points li::before{content:'';position:absolute;left:2px;top:22px;width:16px;height:16px;border-radius:50%;background:#f59e0b;}
  .cmd{display:inline-block;max-width:1560px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.12);
    border-radius:16px;padding:28px 36px;font-family:'Consolas','Courier New',monospace;font-size:27px;
    color:#6ee7b7;line-height:1.6;word-break:break-all;}
  .num{position:absolute;right:110px;bottom:50px;font-size:230px;font-weight:800;color:rgba(255,255,255,.05);
    font-family:Arial,sans-serif;}
  .footer{position:absolute;left:130px;right:130px;bottom:64px;display:flex;justify-content:space-between;
    color:#a8a29e;font-size:26px;}
  .dot{position:absolute;border-radius:50%;background:rgba(129,140,248,.14);}
</style>
</head>
<body>
  <div class="card">
    <div class="badge">🔮 玄语建站教程 · 第 ${index + 1} 步 / 共 ${STEPS.length} 步</div>
    <h1 class="title">${step.title}</h1>
    <ul class="points">${pointsHtml}</ul>
    ${cmdHtml}
    <div class="num">${num}</div>
    <div class="footer"><span>玄语 · 建站教程</span><span>新人小白也能学会</span></div>
    <div class="dot" style="width:260px;height:260px;top:-70px;right:-60px;"></div>
    <div class="dot" style="width:180px;height:180px;bottom:160px;left:-70px;"></div>
  </div>
</body>
</html>`;
}

// ---------- 主流程 ----------
console.log('准备目录...');
fs.rmSync(WORKDIR, { recursive: true, force: true });
fs.mkdirSync(WORKDIR, { recursive: true });

// 1. 生成每步卡片截图 + 男声配音
console.log(`🎨 生成高清卡片 + 🎙 男声配音（${VOICE}）...`);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const durations = [];

for (let i = 0; i < STEPS.length; i++) {
  const step = STEPS[i];
  const html = `${WORKDIR}/card${i}.html`;
  const png = `${WORKDIR}/card${i}.png`;
  const mp3 = `${WORKDIR}/audio${i}.mp3`;

  fs.writeFileSync(html, buildHtml(step, i), 'utf8');
  await page.goto(`file:///${html.replace(/\\/g, '/')}`, { waitUntil: 'load' });
  await page.waitForTimeout(250);
  await page.screenshot({ path: png });

  // 男声配音（edge-tts，带重试）
  await tts(step.narration, mp3);
  durations.push(getDuration(mp3) + 1.5); // 每步时长 = 配音 + 1.5s 停留
  console.log(`  [${i + 1}/${STEPS.length}] ${step.title}（${durations[i].toFixed(1)}s）`);
}
await browser.close();

// 2. 每步生成片段（图片 + 音频）
console.log('🎞 生成每步视频片段...');
const clips = [];
for (let i = 0; i < STEPS.length; i++) {
  const png = `${WORKDIR}/card${i}.png`;
  const mp3 = `${WORKDIR}/audio${i}.mp3`;
  const clip = `${WORKDIR}/clip${i}.mp4`;
  run(
    `ffmpeg -y -v error -loop 1 -i "${png}" -i "${mp3}" -t ${durations[i]} ` +
      `-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 -c:a aac -b:a 160k -shortest "${clip}"`,
  );
  clips.push(clip);
}

// 3. 拼接片段
console.log('🔗 拼接所有步骤...');
const list = clips.map((c) => `file '${c}'`).join('\n');
fs.writeFileSync(`${WORKDIR}/clips.txt`, list);
run(`ffmpeg -y -v error -f concat -safe 0 -i "${WORKDIR}/clips.txt" -c copy "${WORKDIR}/temp.mp4"`);

// 4. 生成 ASS 字幕（时间轴按每步累积时长）
console.log('📝 生成字幕...');
function toAssTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.floor((sec - Math.floor(sec)) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}
function wrapNarration(text, len = 24) {
  const chars = [...text];
  const lines = [];
  for (let i = 0; i < chars.length; i += len) lines.push(chars.slice(i, i + len).join(''));
  return lines.join('\\N');
}

let ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Microsoft YaHei,44,&H00FFFFFF,&H000000FF,&H00000000,&H90000000,0,0,0,0,100,100,0,0,1,3,1,2,60,60,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
let cursor = 0;
for (let i = 0; i < STEPS.length; i++) {
  const start = cursor;
  const end = cursor + durations[i];
  ass += `Dialogue: 0,${toAssTime(start)},${toAssTime(end)},Default,,0,0,0,,${wrapNarration(STEPS[i].narration)}\n`;
  cursor = end;
}
fs.writeFileSync(`${WORKDIR}/subs.ass`, ass, 'utf8');

// 5. 烧录字幕输出最终视频
console.log('🎬 烧录字幕并输出高清视频...');
run(
  `ffmpeg -y -v error -i "${WORKDIR}/temp.mp4" -filter_complex "[0:v]subtitles=subs.ass[v]" ` +
    `-map "[v]" -map 0:a -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a copy "${OUT}"`,
  { cwd: WORKDIR },
);

console.log(`✅ 搭建教程视频生成成功：${OUT}`);
console.log(`总时长：${getDuration(OUT)} 秒 · 1920x1080 · 男声配音 · 中文字幕`);