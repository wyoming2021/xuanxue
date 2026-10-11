#!/usr/bin/env node
/**
 * 「真实浏览器版」搭建教程视频生成器（1920x1080，男声配音，中文字幕）。
 *
 * 画面：Playwright 弹出真实 Chromium 窗口，打开真实网址（supabase.com / siliconflow.cn /
 *       你的网站各页面），录屏真实界面；页面顶部注入模拟浏览器工具栏（含地址栏显示真实 URL）
 *       与步骤提示条，配合点击高亮。
 * 配音：edge-tts 中文男声（zh-CN-YunxiNeural）。
 * 字幕：ASS 底部中文字幕（配音全文，微软雅黑）。
 *
 * 依赖：node（项目内 playwright）、edge-tts（Python）、ffmpeg。
 * 用法：node scripts/make-build-video-real.mjs
 * 输出：build-tutorial-real.mp4
 */
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'http://127.0.0.1:3014';
const WORKDIR = 'C:/Users/wyx90/AppData/Local/Temp/xuanyu-build-real';
const OUT = path.resolve('build-tutorial-real.mp4');
const VOICE = 'zh-CN-YunxiNeural';

// ---------- 教程步骤（真实网页画面） ----------
const STEPS = [
  {
    title: '第一步：注册 Supabase 数据库',
    url: 'https://supabase.com',
    action: 'none',
    narration:
      '第一步，注册 Supabase 数据库。打开 supabase 点 com，注册账号，创建一个新项目，记住项目地址和密钥。',
  },
  {
    title: '第二步：注册硅基流动 AI',
    url: 'https://siliconflow.cn',
    action: 'none',
    narration:
      '第二步，注册硅基流动 AI。在官网注册并实名认证，创建 API 密钥，用于网站自动写文章。',
  },
  {
    title: '第三步：购买域名',
    url: `${SITE}/`,
    action: 'none',
    narration:
      '第三步，购买域名。在域名商买一个域名，比如 myxuan 点 site。买好后解析到服务器，就能访问这个网站。',
  },
  {
    title: '第四步：购买 VPS 服务器',
    url: `${SITE}/bazi`,
    action: 'none',
    narration:
      '第四步，购买 VPS 服务器。一核一 G 内存就够，系统选 Ubuntu。这台服务器将运行你的玄学网站。',
  },
  {
    title: '第五步：解析域名',
    url: `${SITE}/daily`,
    action: 'none',
    narration:
      '第五步，解析域名。添加 A 记录，把域名指向 VPS 的公网 IP。解析生效后，打开域名就能看到每日运势页面。',
  },
  {
    title: '第六步：连接 VPS 服务器',
    url: `${SITE}/tarot`,
    action: 'none',
    narration:
      '第六步，连接 VPS 服务器。用网页终端登录服务器，准备执行部署命令。',
  },
  {
    title: '第七步：执行一键部署',
    url: `${SITE}/articles`,
    action: 'none',
    narration:
      '第七步，执行一键部署。粘贴部署命令回车，脚本自动完成安装。部署完成后，文章列表就能每天自动更新了。',
  },
  {
    title: '第八步：登录后台发布文章',
    url: `${SITE}/articles`,
    action: 'openArticle',
    narration:
      '第八步，登录后台发布文章。用管理员邮箱登录，点击 AI 写文章，选择直接发布，一分钟生成一篇，点开就能看到。',
  },
  {
    title: '第九步：接入收款功能',
    url: `${SITE}/account`,
    action: 'none',
    narration:
      '第九步，接入收款功能。注册虎皮椒商户，填入密钥，用户就能购买会员和付费解锁，这里是会员账户中心。',
  },
  {
    title: '第十步：提交谷歌收录',
    url: `${SITE}/articles`,
    action: 'none',
    narration:
      '第十步，提交谷歌收录。在谷歌搜索控制台验证域名，提交网站地图，让文章被收录，开始获取流量和收益。',
  },
];

// ---------- 工具函数 ----------
function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, ...opts });
}
function getDuration(file) {
  const out = run(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`,
  );
  return parseFloat(out.trim());
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
async function tts(text, mp3) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      run(`edge-tts --voice ${VOICE} --text "${text.replace(/"/g, '\\"')}" --write-media "${mp3}"`);
      return;
    } catch {
      if (attempt === 4) throw new Error('edge-tts 多次失败');
      await sleep(2000 * attempt);
    }
  }
}

// 模拟浏览器工具栏（地址栏）+ 步骤提示条
async function injectBrowserUI(page, stepIndex) {
  await page.evaluate(
    ({ stepIndex, title, total }) => {
      const old = document.getElementById('__tut_ui');
      if (old) old.remove();
      const wrap = document.createElement('div');
      wrap.id = '__tut_ui';
      wrap.style.cssText =
        'position:fixed;top:0;left:0;right:0;z-index:2147483647;font-family:Arial,"Microsoft YaHei",sans-serif;';
      const bar = document.createElement('div');
      bar.style.cssText =
        'height:54px;background:#f5f5f4;display:flex;align-items:center;padding:0 14px;gap:12px;border-bottom:1px solid #d6d3d1;';
      bar.innerHTML =
        '<div style="display:flex;gap:6px;flex:none;">' +
        '<span style="width:12px;height:12px;border-radius:50%;background:#fca5a5;display:inline-block;"></span>' +
        '<span style="width:12px;height:12px;border-radius:50%;background:#fcd34d;display:inline-block;"></span>' +
        '<span style="width:12px;height:12px;border-radius:50%;background:#6ee7b7;display:inline-block;"></span>' +
        '</div>' +
        '<div style="flex:1;background:#fff;border:1px solid #e7e5e4;border-radius:14px;padding:8px 16px;color:#444;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
        location.href +
        '</div>';
      const banner = document.createElement('div');
      banner.style.cssText =
        'height:46px;background:rgba(28,25,23,.92);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,.08);';
      banner.textContent = `第 ${stepIndex + 1} 步 / 共 ${total} 步：${title}`;
      wrap.appendChild(bar);
      wrap.appendChild(banner);
      document.body.prepend(wrap);
      document.body.style.marginTop = '100px';
    },
    { stepIndex, title: STEPS[stepIndex].title, total: STEPS.length },
  );
}

// ---------- 主流程 ----------
console.log('准备目录...');
fs.rmSync(WORKDIR, { recursive: true, force: true });
fs.mkdirSync(WORKDIR, { recursive: true });

// 1. 生成每步男声配音（转统一 wav，供拼接）
console.log(`🎙 生成男声配音（${VOICE}）...`);
const durations = [];
for (let i = 0; i < STEPS.length; i++) {
  const mp3 = `${WORKDIR}/audio${i}.mp3`;
  const wav = `${WORKDIR}/audio${i}.wav`;
  await tts(STEPS[i].narration, mp3);
  run(`ffmpeg -y -v error -i "${mp3}" -ar 44100 -ac 2 "${wav}"`);
  durations.push(getDuration(wav) + 2); // 每步时长 = 配音 + 2s
  console.log(`  [${i + 1}/${STEPS.length}] ${STEPS[i].title}（${durations[i].toFixed(1)}s）`);
}

// 2. 拼接配音
const audioList = STEPS.map((_, i) => `file '${WORKDIR}/audio${i}.wav'`).join('\n');
fs.writeFileSync(`${WORKDIR}/audiolist.txt`, audioList);
run(`ffmpeg -y -v error -f concat -safe 0 -i "${WORKDIR}/audiolist.txt" -c copy "${WORKDIR}/narration.wav"`);

// 3. 真实浏览器录屏
console.log('🌐 打开真实浏览器录屏（请留意弹出的 Chromium 窗口）...');
const browser = await chromium.launch({ headless: false }); // 真实弹出浏览器
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: `${WORKDIR}/video`, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();

// 点击位置高亮
await page.addInitScript(() => {
  document.addEventListener('mousedown', (e) => {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:${e.clientX - 18}px;top:${e.clientY - 18}px;width:36px;height:36px;border-radius:50%;border:3px solid #f59e0b;background:rgba(245,158,11,0.25);z-index:2147483646;pointer-events:none;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  });
});

for (let i = 0; i < STEPS.length; i++) {
  const step = STEPS[i];
  console.log(`  📄 打开：${step.url}`);
  try {
    await page.goto(step.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch {
    // 第三方网站超时则回退到本地站点首页
    await page.goto(`${SITE}/`, { waitUntil: 'domcontentloaded' });
  }
  await page.waitForTimeout(1500);
  await injectBrowserUI(page, i);

  if (step.action === 'openArticle') {
    const link = page.locator('a[href^="/articles/"]').first();
    if ((await link.count()) > 0) {
      await link.click();
      await page.waitForTimeout(2000);
      await injectBrowserUI(page, i);
    }
  }

  await page.waitForTimeout(Math.round(durations[i] * 1000));
}

const video = page.video();
await context.close();
const videoPath = await video.path();
await browser.close();
fs.copyFileSync(videoPath, `${WORKDIR}/video.webm`);
console.log('📼 录屏完成');

// 4. 生成 ASS 字幕
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

// 5. 合成最终视频（录屏 + 配音 + 字幕）
console.log('🎬 合成高清视频（烧录字幕 + 男声配音）...');
run(
  `ffmpeg -y -v error -i "${WORKDIR}/video.webm" -i "${WORKDIR}/narration.wav" ` +
    `-filter_complex "[0:v]subtitles=subs.ass[v];[1:a]apad[a]" ` +
    `-map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p ` +
    `-c:a aac -b:a 160k -shortest "${OUT}"`,
  { cwd: WORKDIR },
);

console.log(`✅ 真实浏览器版搭建教程视频生成成功：${OUT}`);
console.log(`总时长：${getDuration(OUT)} 秒 · 1920x1080 · 男声配音 · 中文字幕`);