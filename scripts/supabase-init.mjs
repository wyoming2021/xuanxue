#!/usr/bin/env node
/**
 * Supabase 全自动初始化脚本（基于官方 Management API）
 *
 * 自动完成：
 *   1. 创建 Supabase 项目（需提供 Personal Access Token）
 *   2. 等待项目激活（轮询，最多约 10 分钟）
 *   3. 执行仓库里的 supabase/init.sql（建表 + RLS）
 *   4. 输出项目 URL 与 service_role 密钥
 *
 * 前提：用户需先在 https://supabase.com/dashboard/account/tokens 生成一个
 * Personal Access Token（权限建议：Projects read/write + Database read/write）。
 * 「注册 Supabase 账号」这一步必须人工，无法自动化。
 *
 * 用法：
 *   交互：node scripts/supabase-init.mjs
 *   全自动：
 *     SUPABASE_ACCESS_TOKEN=<token> node scripts/supabase-init.mjs \
 *       --name my-site --region ap-southeast-1 --print-env
 *
 * 参数：
 *   --token <token>       Personal Access Token（也可用环境变量 SUPABASE_ACCESS_TOKEN）
 *   --name <项目名>        项目名称，默认 xuanxue
 *   --region <区域>        默认 ap-southeast-1
 *   --print-env           输出两行 KEY=VALUE（供部署脚本捕获）
 *   --sql <路径>           SQL 文件路径，默认 ./supabase/init.sql
 *   --quiet               只输出关键信息
 */
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

const API = 'https://api.supabase.com/v1';

// 常用区域
const REGIONS = {
  'ap-southeast-1': '新加坡（推荐，亚太）',
  'ap-northeast-1': '东京',
  'us-east-1': '美东',
  'us-west-1': '美西',
  'eu-central-1': '法兰克福',
  'eu-west-1': '爱尔兰',
};

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1];
      if (val && !val.startsWith('--')) {
        args[key] = val;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const quiet = !!args.quiet || !!args['print-env'];

function log(...msg) {
  if (!quiet) console.log(...msg);
}
function fail(message) {
  console.error(`[supabase-init] ${message}`);
  process.exit(1);
}

async function api(path, token, options = {}) {
  const res = await fetch(`${API}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail = typeof data === 'object' && data ? JSON.stringify(data).slice(0, 300) : text.slice(0, 300);
    throw new Error(`Supabase API ${path} 失败 HTTP ${res.status}: ${detail}`);
  }
  return data;
}

function getToken() {
  const token = args.token || process.env.SUPABASE_ACCESS_TOKEN || '';
  if (token) return token;
  if (!stdin.isTTY) fail('缺少 Supabase Personal Access Token（--token 或 SUPABASE_ACCESS_TOKEN）');
  return new Promise((resolvePromise) => {
    const rl = createInterface({ input: stdin, output: stdout });
    rl.question('请输入 Supabase Personal Access Token（https://supabase.com/dashboard/account/tokens）：', (ans) => {
      rl.close();
      resolvePromise(ans.trim());
    });
  });
}

async function selectOrganization(token) {
  const orgs = await api('/organizations', token);
  if (!Array.isArray(orgs) || orgs.length === 0) {
    fail('账号下没有组织，请先在 Supabase 创建组织（注册后默认有）。');
  }
  // 默认第一个组织
  return orgs[0];
}

async function waitForActive(ref, token) {
  log('  等待项目激活（通常 1-3 分钟，最长 10 分钟）...');
  const start = Date.now();
  const timeoutMs = 10 * 60 * 1000;
  while (Date.now() - start < timeoutMs) {
    const p = await api(`/projects/${ref}`, token);
    if (p.status === 'ACTIVE') return true;
    if (p.status === 'INACTIVE' || p.status === 'PENDING_RESTORE') {
      log(`  当前状态 ${p.status}，继续等待...`);
    }
    await new Promise((r) => setTimeout(r, 10000));
  }
  return false;
}

function readInitSql() {
  const sqlPath = resolve(process.cwd(), args.sql || 'supabase/init.sql');
  try {
    return readFileSync(sqlPath, 'utf8');
  } catch {
    fail(`无法读取 SQL 文件：${sqlPath}（请确认在项目根目录运行）`);
  }
}

async function main() {
  const token = await getToken();
  if (!token) fail('Token 不能为空');

  log('🔑 正在验证 Token...');
  const org = await selectOrganization(token);
  log(`✓ 组织：${org.name}（${org.id}）`);

  const projectName = args.name || 'xuanxue';
  const regionKey = args.region || 'ap-southeast-1';
  const region = REGIONS[regionKey] ? regionKey : args.region;
  if (!REGIONS[regionKey]) log(`使用区域：${args.region}`);

  // 生成数据库密码
  const dbPass = randomBytes(12).toString('base64url').slice(0, 16);

  // 创建项目
  log(`🚀 创建项目 ${projectName}（区域：${regionKey}）...`);
  const created = await api('/projects', token, {
    method: 'POST',
    body: {
      name: projectName,
      organization_id: org.id,
      db_pass: dbPass,
      region,
      plan: 'free',
    },
  });
  const ref = created.id || created.ref;
  log(`✓ 项目已创建：https://${ref}.supabase.co`);

  const active = await waitForActive(ref, token);
  if (!active) fail('项目在 10 分钟内未激活，请稍后手动检查或重试。');

  // 获取 API keys
  let keys;
  try {
    keys = await api(`/projects/${ref}/api-keys`, token);
  } catch (err) {
    // 某些情况下 key 需要额外等待
    await new Promise((r) => setTimeout(r, 15000));
    keys = await api(`/projects/${ref}/api-keys`, token);
  }
  const anon = keys.find((k) => k.name === 'anon');
  const service = keys.find((k) => k.name === 'service_role');
  if (!anon || !service) fail('获取 API 密钥失败（未找到 anon/service_role）。');

  // 执行 init.sql
  const sql = readInitSql();
  log('📦 正在执行初始化 SQL（建表 + RLS）...');
  await api(`/projects/${ref}/database/query`, token, {
    method: 'POST',
    body: { query: sql },
  });
  log('✓ 数据库初始化完成');

  if (args['print-env']) {
    // 输出两行 KEY=VALUE 供部署脚本捕获
    console.log(`NEXT_PUBLIC_SUPABASE_URL=https://${ref}.supabase.co`);
    console.log(`SUPABASE_SERVICE_ROLE_KEY=${service.api_key}`);
    return;
  }

  log('');
  log('✅ Supabase 自动配置完成！请把以下两个值填入 .env.local：');
  log(`NEXT_PUBLIC_SUPABASE_URL=https://${ref}.supabase.co`);
  log(`SUPABASE_SERVICE_ROLE_KEY=${service.api_key}`);
  log(`数据库密码（请妥善保存）：${dbPass}`);
  log('');
  log('⚠️ 安全提示：此脚本使用的 Personal Access Token 权限较高，');
  log('   部署完成后可到 supabase.com/dashboard/account/tokens 删除该 Token。');
}

main().catch((err) => {
  console.error(`\n[supabase-init] 失败：${err.message}`);
  process.exit(1);
});