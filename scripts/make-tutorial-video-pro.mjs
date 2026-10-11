#!/usr/bin/env node
/**
 * 专业版教程视频生成器：
 *   真实浏览器录屏（Playwright，含点击高亮） + 中文配音（PowerShell TTS） + ASS 字幕
 *   用 ffmpeg 合成 1280x720 mp4。
 *
 * 依赖：项目已装 playwright（含 Chromium）、Windows PowerShell、ffmpeg（在 PATH）。
 * 用法：
 *   1. 先启动本地站点：PORT=3014 node .next/standalone/server.js（或 npm run dev）
 *   2. node scripts/make-tutorial-video-pro.mjs
 *   3. 输出到项目根目录 tutorial-video-pro.mp4
 */
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'http://127.0.0.1:3014';
const WORKDIR = 'C:/Users/wyx90/AppData/Local/Temp/xuanyu-pro-video';
const OUT = path.resolve('tutorial-video-pro.mp4');
const TTS_PS1 = path.resolve('scripts/video-tts.ps1');

const STEPS = [
  {
    title: '第一步：打开网站首页',
    narration: '欢迎来到你的玄学网站，这是首页，包含八字、塔罗、每日运势等所有工具入口。',
    action: 'home',
  },
  {
    title: '第二步：进入八字排盘',
    narration: '点击导航中的八字排盘，进入排盘页面。',
    action: 'gotoBazi',
  },
  {
    title: '第三步：填写出生信息',
    narration: '填写出生信息：姓名、出生日期、时辰和性别。',
    action: 'fillBaziForm',
  },
  {
    title: '第四步：开始排盘',
    narration: '点击开始排盘，系统自动排出四柱八字，并生成运势分析。',
    action: 'submitBazi',
  },
  {
    title: '第五步：查看每日运势',
    narration: '进入每日运势页面，查看今天十二星座的幸运指数和开运建议。',
    action: 'daily',
  },
  {
    title: '第六步：查看文章列表',
    narration: '进入文章栏目，这里每天由 AI 自动生成一篇玄学文章。',
    action: 'articles',
  },
  {
    title: '第七步：打开文章详情',
    narration: '点开文章，可以看到排版清晰的运势分析和 SEO 结构化内容。',
    action: 'articleDetail',
  },
];

// ---------- 工具函数 ----------
function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });
}

function getDuration(file) {
  const out = run(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`,
  );
  return parseFloat(out.trim());
}

// ---------- 1. 生成每步配音 ----------
fs.rmSync(WORKDIR, { recursive: true, force: true });
fs.mkdirSync(WORKDIR, { recursive: true });
fs.mkdirSync(`${WORKDIR}/video`, { recursive: true });

const durations = [];
console.log('🎙 生成配音...');
STEPS.forEach((step, i) => {
  const wav = `${WORKDIR}/audio${i}.wav`;
  const txt = `${WORKDIR}/speech${i}.txt`;
  fs.writeFileSync(txt, step.narration, 'utf8');
  run(
    `powershell -NoProfile -ExecutionPolicy Bypass -File "${TTS_PS1}" -TextPath "${txt}" -WavPath "${wav}"`,
  );
  durations.push(getDuration(wav));
  console.log(`  [${i + 1}/${STEPS.length}] ${step.title}（${durations[i].toFixed(1)}s）`);
});

// ---------- 2. 浏览器录屏 + 操作演示 ----------
console.log('🎬 开始录屏...');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: `${WORKDIR}/video`, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

// 点击位置高亮（录屏可见）
await page.addInitScript(() => {
  document.addEventListener('mousedown', (e) => {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:${e.clientX - 18}px;top:${e.clientY - 18}px;width:36px;height:36px;border-radius:50%;border:3px solid #f59e0b;background:rgba(245,158,11,0.25);z-index:99999;pointer-events:none;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  });
});

const t0 = Date.now();
const segStart = []; // 每步开始时间（相对视频开始，秒）

await page.goto(`${SITE}/`, { waitUntil: 'domcontentloaded' });
segStart.push((Date.now() - t0) / 1000);

for (let i = 0; i < STEPS.length; i++) {
  const { action } = STEPS[i];
  if (action === 'home') {
    await page.goto(`${SITE}/`, { waitUntil: 'domcontentloaded' });
  } else if (action === 'gotoBazi') {
    await page.goto(`${SITE}/bazi`, { waitUntil: 'domcontentloaded' });
  } else if (action === 'fillBaziForm') {
    await page.fill('#name', '张三');
    await page.fill('#birthDate', '1990-06-15');
    await page.click('text=午时');
    await page.click('text=男');
  } else if (action === 'submitBazi') {
    await page.click('text=开始排盘');
    await page.waitForTimeout(4000); // 等待排盘结果页
  } else if (action === 'daily') {
    await page.goto(`${SITE}/daily`, { waitUntil: 'domcontentloaded' });
  } else if (action === 'articles') {
    await page.goto(`${SITE}/articles`, { waitUntil: 'domcontentloaded' });
  } else if (action === 'articleDetail') {
    const link = page.locator('a[href^="/articles/"]').first();
    await link.click();
    await page.waitForTimeout(3000);
  }

  // 每步停留：配音时长 + 2.5 秒，让观众看清画面
  if (i < STEPS.length - 1) {
    const stayMs = Math.round((durations[i] + 2.5) * 1000);
    await page.waitForTimeout(stayMs);
    segStart.push((Date.now() - t0) / 1000);
  }
}

// 最后一步多停留 2 秒
await page.waitForTimeout(2000);
const video = page.video();
await context.close();
const videoPath = await video.path();
await browser.close();
fs.copyFileSync(videoPath, `${WORKDIR}/video.webm`);
console.log('📼 录屏完成');

// ---------- 3. 拼接配音 ----------
console.log('🔊 拼接配音...');
const list = STEPS.map((_, i) => `file '${WORKDIR}/audio${i}.wav'`).join('\n');
fs.writeFileSync(`${WORKDIR}/audiolist.txt`, list);
run(`ffmpeg -y -v error -f concat -safe 0 -i "${WORKDIR}/audiolist.txt" -c copy "${WORKDIR}/narration.wav"`);

// ---------- 4. 生成 ASS 字幕 ----------
console.log('📝 生成字幕...');
function toAssTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.floor((sec - Math.floor(sec)) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

let ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Microsoft YaHei,52,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,3,1,2,40,40,50,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

for (let i = 0; i < STEPS.length; i++) {
  const start = segStart[i] ?? 0;
  const end = i < STEPS.length - 1 ? segStart[i + 1] : segStart[i] + durations[i] + 4.5;
  ass += `Dialogue: 0,${toAssTime(start)},${toAssTime(end)},Default,,0,0,0,,${STEPS[i].title}\n`;
}
fs.writeFileSync(`${WORKDIR}/subs.ass`, ass, 'utf8');

// ---------- 5. 合成最终视频 ----------
console.log('🎞 合成视频（烧录字幕 + 配音）...');
// 输入与字幕都用相对路径（cwd=WORKDIR），避免 Windows 盘符冒号被 filter 当作选项分隔符
run(
  `ffmpeg -y -v error -i "video.webm" -i "narration.wav" ` +
    `-filter_complex "[0:v]subtitles=subs.ass[v];[1:a]apad[a]" ` +
    `-map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p ` +
    `-c:a aac -b:a 128k -shortest "${OUT}"`,
  { cwd: WORKDIR },
);

console.log(`✅ 专业版视频生成成功：${OUT}`);
console.log(
  `总时长：${getDuration(OUT)} 秒`,
);