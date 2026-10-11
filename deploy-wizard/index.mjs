#!/usr/bin/env node
/**
 * 玄学站一键部署向导
 *
 * 用户只需填写：域名、VPS 服务器信息（IP/端口/用户名/密码或私钥）、Supabase Token，
 * 脚本自动通过 SSH 连接 VPS，远程执行官方部署脚本：
 *   装 Docker → 拉代码 → 自动创建/初始化 Supabase 数据库 → 构建启动 → Nginx + HTTPS
 *
 * 用法：
 *   cd deploy-wizard && npm install && npm start
 *
 * 也支持环境变量非交互模式（适合自动化）：
 *   WIZ_DOMAIN=example.com WIZ_HOST=1.2.3.4 WIZ_SSH_PASSWORD=xxx \
 *   WIZ_SUPABASE_TOKEN=sbp_xxx node index.mjs
 */
import { readFileSync } from 'node:fs';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

import { Client } from 'ssh2';

const rl = createInterface({ input: stdin, output: stdout });

const DEPLOY_SCRIPT_URL =
  'https://raw.githubusercontent.com/wyoming2021/xuanxue/master/scripts/vps-deploy.sh';

function mask(s) {
  if (!s) return '(未提供)';
  if (s.length <= 12) return s.slice(0, 2) + '***';
  return s.slice(0, 4) + '...' + s.slice(-4);
}

async function ask(question, { secret = false, defaultVal = '', required = false } = {}) {
  const suffix = secret ? '（输入不回显）' : '';
  for (let attempt = 0; attempt < 3; attempt++) {
    const raw = await rl.question(`${question}${suffix}：`);
    const ans = raw.trim() || defaultVal;
    if (ans) return ans;
    if (!required) return '';
  }
  throw new Error(`「${question}」不能为空，已重试 3 次，退出。`);
}

/** shell 单引号转义，保证远程命令安全 */
function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function buildRemoteCommand(config) {
  const env = ['XUANYU_NONINTERACTIVE=1'];
  env.push(`XUANYU_DOMAIN=${shellQuote(config.domain)}`);
  env.push(`XUANYU_SITE_NAME=${shellQuote(config.siteName || '玄语站')}`);
  if (config.adminEmail) env.push(`XUANYU_ADMIN_EMAIL=${shellQuote(config.adminEmail)}`);

  if (config.supabaseToken) {
    env.push(`XUANYU_SUPABASE_TOKEN=${shellQuote(config.supabaseToken)}`);
    env.push(`XUANYU_SUPABASE_REGION=${shellQuote(config.region || 'ap-southeast-1')}`);
  } else {
    env.push(`XUANYU_SUPABASE_URL=${shellQuote(config.supabaseUrl)}`);
    env.push(`XUANYU_SERVICE_KEY=${shellQuote(config.serviceKey)}`);
  }

  return `cd / && ${env.join(' ')} bash -c "$(curl -fsSL ${DEPLOY_SCRIPT_URL})"`;
}

function connectAndRun(config) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const connConfig = {
      host: config.host,
      port: parseInt(config.port || '22', 10),
      username: config.username,
      readyTimeout: 30000,
    };
    if (config.sshKeyPath) {
      connConfig.privateKey = readFileSync(config.sshKeyPath, 'utf8');
    } else {
      connConfig.password = config.sshPassword;
    }

    conn.on('ready', () => {
      console.log('\n✅ SSH 连接成功，开始远程部署...\n');
      const command = buildRemoteCommand(config);
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return reject(new Error('执行远程命令失败: ' + err.message));
        }
        stream
          .on('close', (code) => {
            conn.end();
            resolve(code);
          })
          .on('data', (data) => process.stdout.write(data.toString()))
          .stderr.on('data', (data) => process.stderr.write(data.toString()));
      });
    });

    conn.on('error', (err) => reject(new Error(`SSH 连接失败: ${err.message}`)));
    conn.connect(connConfig);
  });
}

async function main() {
  console.log('==============================================');
  console.log('🔮 玄学站一键部署向导');
  console.log('==============================================\n');
  console.log('你将需要提供：\n  1. 域名（已解析到 VPS）\n  2. VPS 登录信息（IP / SSH 密码或私钥）\n  3. Supabase Token（自动建库）或已有项目的 URL 与密钥\n');

  const isNonInteractive = !!process.env.WIZ_DOMAIN;

  const config = {
    domain: process.env.WIZ_DOMAIN || (await ask('① 你的域名（如 example.com，需已解析到 VPS）', { required: true })),
    siteName: process.env.WIZ_SITE_NAME || (await ask('② 站点名称（默认「玄语站」）', { defaultVal: '玄语站' })),
    adminEmail: process.env.WIZ_ADMIN_EMAIL || (await ask('③ 文章管理员邮箱（可选，用于 /admin/articles 后台）', {})),
    host: process.env.WIZ_HOST || (await ask('④ VPS IP 地址', { required: true })),
    port: process.env.WIZ_PORT || (await ask('⑤ SSH 端口（默认 22）', { defaultVal: '22' })),
    username: process.env.WIZ_SSH_USER || (await ask('⑥ SSH 用户名（默认 root）', { defaultVal: 'root' })),
  };

  // SSH 认证方式
  const useKey = process.env.WIZ_SSH_KEY_PATH
    ? 'key'
    : (process.env.WIZ_SSH_PASSWORD
      ? 'password'
      : await ask('⑦ SSH 认证方式：password 或 key（私钥）？', { required: true }));

  if (useKey === 'key') {
    config.sshKeyPath =
      process.env.WIZ_SSH_KEY_PATH || (await ask('⑧ SSH 私钥文件路径（如 ~/.ssh/id_rsa）', { required: true }));
  } else {
    config.sshPassword = process.env.WIZ_SSH_PASSWORD || (await ask('⑧ SSH 密码', { secret: true, required: true }));
  }

  // Supabase 配置方式
  const useToken = process.env.WIZ_SUPABASE_TOKEN
    ? 'token'
    : (process.env.WIZ_SUPABASE_URL
      ? 'existing'
      : await ask('⑨ Supabase：token（自动建库）还是 existing（已有项目）？输入 token 或 existing', { required: true }));

  if (useToken === 'token') {
    config.supabaseToken =
      process.env.WIZ_SUPABASE_TOKEN || (await ask('⑩ Supabase Personal Access Token（自动创建并初始化数据库）', { secret: true, required: true }));
    config.region = process.env.WIZ_SUPABASE_REGION || 'ap-southeast-1';
  } else {
    config.supabaseUrl = process.env.WIZ_SUPABASE_URL || (await ask('⑩ Supabase 项目 URL（https://xxx.supabase.co）', { required: true }));
    config.serviceKey = process.env.WIZ_SERVICE_KEY || (await ask('⑪ Supabase service_role 密钥', { secret: true, required: true }));
  }

  rl.close();

  console.log('\n==============================================');
  console.log('部署信息确认：');
  console.log(`  域名：        ${config.domain}`);
  console.log(`  站点名称：    ${config.siteName}`);
  console.log(`  VPS：         ${config.username}@${config.host}:${config.port}`);
  console.log(`  SSH 认证：    ${useKey === 'key' ? '私钥 ' + config.sshKeyPath : '密码 ' + mask(config.sshPassword)}`);
  if (config.supabaseToken) {
    console.log(`  Supabase：    Token 自动建库（${mask(config.supabaseToken)}，区域 ${config.region}）`);
  } else {
    console.log(`  Supabase：    已有项目 ${config.supabaseUrl}`);
  }
  console.log('==============================================\n');

  if (!isNonInteractive) {
    const confirm = await createInterface({ input: stdin, output: stdout })
      .question('\n确认无误，开始远程部署？输入 yes 继续：');
    if (confirm.trim().toLowerCase() !== 'yes') {
      console.log('已取消。');
      process.exit(0);
    }
  }

  const code = await connectAndRun(config);
  console.log('\n==============================================');
  if (code === 0) {
    console.log(`✅ 部署完成！访问：https://${config.domain}`);
    console.log('   查看日志： ssh root@' + config.host + ' "docker compose -f /opt/xuanyu/docker-compose.yml logs -f"');
  } else {
    console.log(`❌ 远程部署脚本退出码：${code}，请查看上方日志。`);
  }
  console.log('==============================================');
  console.log('⚠️ 安全提示：本脚本未保存你的密码/Token；如果使用了 Supabase Token，');
  console.log('   部署完成后建议到 supabase.com/dashboard/account/tokens 删除它。');
  process.exit(code === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('\n部署向导失败：', err.message);
  process.exit(1);
}).finally(() => rl.close());