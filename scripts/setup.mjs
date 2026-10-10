#!/usr/bin/env node
/**
 * 玄语站一键配置脚本（npm run setup）
 *
 * 两种模式：
 *  1. 交互模式（默认，推荐）：npm run setup，按提示输入
 *  2. 非交互模式：通过环境变量预填，适合 CI / 自动化
 *        SETUP_SUPABASE_URL / SETUP_SERVICE_KEY / SETUP_SITE_URL / SETUP_SITE_NAME /
 *        SETUP_SUPPORT_EMAIL / SETUP_QQ_EMAIL / SETUP_QQ_CODE /
 *        SETUP_HUPIJAO_APPID / SETUP_HUPIJAO_SECRET
 *
 * 行为：
 *  - 自动生成 AUTH_SECRET（≥32 位）写入 .env.local
 *  - 已存在的 .env.local 不会被覆盖：缺失项补充，已有值保留
 *  - 必填项（Supabase URL / service key）非空校验，最多重试 3 次
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const ENV_PATH = resolve(process.cwd(), '.env.local');
const EXAMPLE_PATH = resolve(process.cwd(), '.env.example');

function loadExistingEnv() {
  if (!existsSync(ENV_PATH)) return {};
  const map = {};
  for (const line of readFileSync(ENV_PATH, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (m) map[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return map;
}

function loadExampleKeys() {
  if (!existsSync(EXAMPLE_PATH)) return [];
  return readFileSync(EXAMPLE_PATH, 'utf8')
    .split('\n')
    .map((l) => l.match(/^\s*([A-Z0-9_]+)=/)?.[1])
    .filter(Boolean);
}

const env = loadExistingEnv();
const exampleKeys = loadExampleKeys();
const rl = createInterface({ input, output });
const isTTY = Boolean(input.isTTY);
let retry = 0;

/** 从环境变量取预填值（SETUP_* 前缀） */
function envPrefill(key) {
  const name = `SETUP_${key}`;
  return process.env[name] || '';
}

async function ask(question, { required = false, prefillKey = null, allowEmpty = true } = {}) {
  const prefill = prefillKey ? envPrefill(prefillKey) : '';
  if (prefill) return prefill;

  if (!isTTY) {
    // 非交互模式：必填缺失则报错退出；可选缺失返回空串
    if (required) {
      throw new Error(`非交互模式下缺少必填项 ${question.split('（')[0]}（设置 SETUP_${prefillKey}）`);
    }
    return '';
  }

  const answer = (await rl.question(`${question}：`)).trim();
  if (answer) {
    retry = 0;
    return answer;
  }
  if (!required) return '';

  retry += 1;
  if (retry >= 3) throw new Error(`「${question.split('（')[0]}」为必填项，已重试 3 次，退出。`);
  console.log(`「${question.split('（')[0]}」不能为空，请重新输入（剩余 ${3 - retry} 次）。`);
  return ask(question, { required, prefillKey, allowEmpty });
}

async function main() {
  console.log('\n🔮 玄语站 一键配置脚本');
  console.log('======================');
  console.log(isTTY ? '已存在的配置会被保留，缺失项补充。\n' : '非交互模式（使用 SETUP_* 环境变量）。\n');

  // ① Supabase（必填）
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    env.NEXT_PUBLIC_SUPABASE_URL = (await ask('① Supabase 项目 URL（Project Settings → API → Project URL）', { required: true, prefillKey: 'SUPABASE_URL' })).replace(/\/+$/, '');
  } else {
    console.log(`① Supabase URL 已配置：${env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 30)}…`);
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    env.SUPABASE_SERVICE_ROLE_KEY = await ask('② Supabase service_role 密钥（请勿泄露）', { required: true, prefillKey: 'SERVICE_KEY' });
  } else {
    console.log('② service_role 密钥已配置（保留原值）。');
  }

  // ② AUTH_SECRET：自动生成
  if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
    env.AUTH_SECRET = randomBytes(32).toString('hex');
    console.log('③ 已自动生成 AUTH_SECRET（32 字节随机串）。');
  } else {
    console.log('③ AUTH_SECRET 已配置（保留原值）。');
  }

  // ③ 站点配置（可选）
  env.NEXT_PUBLIC_SITE_URL = env.NEXT_PUBLIC_SITE_URL || (await ask('④ 站点域名（如 https://mysite.com，回车用默认）', { prefillKey: 'SITE_URL' })) || 'http://localhost:3000';
  env.NEXT_PUBLIC_SITE_NAME = env.NEXT_PUBLIC_SITE_NAME || (await ask('⑤ 站点名称（默认"玄语"，回车用默认）', { prefillKey: 'SITE_NAME' })) || '玄语';
  env.NEXT_PUBLIC_SUPPORT_EMAIL = env.NEXT_PUBLIC_SUPPORT_EMAIL || (await ask('⑥ 联系邮箱（错误页展示，可回车跳过）', { prefillKey: 'SUPPORT_EMAIL' }));

  // ④ QQ 邮箱 SMTP（可选但登录必需）
  if (!env.QQ_EMAIL_USER) env.QQ_EMAIL_USER = await ask('⑦ QQ 邮箱（发验证码，回车跳过则登录不可用）', { prefillKey: 'QQ_EMAIL' });
  if (!env.QQ_EMAIL_AUTH_CODE) env.QQ_EMAIL_AUTH_CODE = await ask('⑧ QQ 邮箱 SMTP 授权码（回车跳过）', { prefillKey: 'QQ_CODE' });

  // ⑤ 虎皮椒支付（可选）
  if (!env.HUPIJAO_APP_ID) env.HUPIJAO_APP_ID = await ask('⑨ 虎皮椒 APP_ID（回车跳过则支付为演示模式）', { prefillKey: 'HUPIJAO_APPID' });
  if (!env.HUPIJAO_APP_SECRET) env.HUPIJAO_APP_SECRET = await ask('⑩ 虎皮椒 APP_SECRET（回车跳过）', { prefillKey: 'HUPIJAO_SECRET' });
  if (!env.HUPIJAO_NOTIFY_URL) {
    const notify = await ask('⑪ 支付回调地址（回车用默认 {SITE_URL}/api/payment/callback）', { prefillKey: 'HUPIJAO_NOTIFY' });
    env.HUPIJAO_NOTIFY_URL = notify || `${env.NEXT_PUBLIC_SITE_URL}/api/payment/callback`;
  }

  rl.close();

  let output = '# 玄语站配置（由 npm run setup 生成，可手动编辑）\n';
  for (const key of exampleKeys) {
    if (env[key]) output += `${key}=${env[key]}\n`;
  }
  writeFileSync(ENV_PATH, output, 'utf8');

  console.log('\n✅ 已写入 ' + ENV_PATH);
  console.log('\n下一步：');
  console.log('  1. 打开 https://supabase.com → SQL Editor，整段粘贴执行仓库里的 supabase/init.sql');
  console.log('  2. npm run dev 启动本地站点');
  console.log('  3. 一键部署到线上：README 顶部的 Deploy with Vercel 按钮');
  console.log('\n⚠️ 请勿把 .env.local 提交到 git（已被 .gitignore 排除）。\n');
}

main()
  .catch((err) => {
    console.error('\n配置失败：', err.message || err);
    process.exit(1);
  })
  .finally(() => rl.close());