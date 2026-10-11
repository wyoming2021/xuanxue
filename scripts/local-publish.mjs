#!/usr/bin/env node
/**
 * 本地生成玄学文章并发布到远程网站。
 *
 * 适用场景：网站部署在低配 VPS 上（内存小，跑不动 AI 模型），
 * 模型在本机运行（如 qoder：http://127.0.0.1:18082/v1）。
 * 本脚本在本机调用模型生成一篇文章，然后推送到网站的
 * POST /api/articles/publish 接口发布。
 *
 * 使用方法：
 *   node scripts/local-publish.mjs                    # 随机主题生成一篇并发布
 *   node scripts/local-publish.mjs "2026年射手座运势" # 指定主题
 *
 * 读取配置（.env.local 或环境变量）：
 *   AI_API_KEY            本地模型 key（如 qoder-local）
 *   AI_BASE_URL           本地模型地址（如 http://127.0.0.1:18082/v1）
 *   AI_MODEL              本地模型名（如 qwen3.8-flash）
 *   NEXT_PUBLIC_SITE_URL  远程网站地址（如 https://yourdomain.com）
 *   CRON_SECRET           远程网站的发布密钥（与 /api/cron/generate-article 同密钥）
 *
 * 定时发布（Windows）：
 *   schtasks /Create /TN "XuanyuPublish" /TR "node D:\xuan-yu\scripts\local-publish.mjs" /SC DAILY /ST 08:00
 * 定时发布（Linux/macOS crontab）：
 *   0 8 * * * node /path/to/local-publish.mjs >> /tmp/xuanyu-publish.log 2>&1
 */

import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';

// ---------- 配置读取 ----------
const ENV_FILE = process.env.ENV_FILE || path.join(process.cwd(), '.env.local');

function getEnv(key) {
  const fromProcess = process.env[key];
  if (fromProcess) return fromProcess;
  try {
    const text = fs.readFileSync(ENV_FILE, 'utf8');
    const m = text.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return m ? m[1].trim().replace(/^"|"$/g, '') : '';
  } catch {
    return '';
  }
}

const AI_KEY = getEnv('AI_API_KEY');
const AI_BASE = (getEnv('AI_BASE_URL') || 'http://127.0.0.1:18082/v1').replace(/\/+$/, '');
const AI_MODEL = getEnv('AI_MODEL') || 'qwen3.8-flash';
const SITE_URL = (process.env.SITE_URL || getEnv('NEXT_PUBLIC_SITE_URL') || '').replace(/\/+$/, '');
const CRON_SECRET = getEnv('CRON_SECRET');

// ---------- HTTP 请求（支持 http/https，长超时） ----------
function requestJson(url, { method = 'POST', headers = {}, body, timeoutMs = 600000 } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const isHttps = u.protocol === 'https:';
    const transport = isHttps ? https : http;
    const payload = body === undefined ? null : JSON.stringify(body);
    const req = transport.request(
      {
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: `${u.pathname}${u.search}`,
        method,
        headers: {
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            // 非 JSON 响应
          }
          resolve({ status: res.statusCode || 0, json, text });
        });
      },
    );
    req.on('timeout', () => req.destroy(new Error(`请求超时（超过 ${timeoutMs / 60000} 分钟）`)));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ---------- 文章生成 ----------
function extractArticle(text) {
  let raw = String(text).trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) raw = fence[1].trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (typeof parsed.title === 'string' && typeof parsed.content === 'string') {
      return {
        title: parsed.title.trim(),
        summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
        content: parsed.content.trim(),
      };
    }
  } catch {
    // 解析失败
  }
  return null;
}

const DEFAULT_TOPICS = [
  '2026年十二星座运势总览',
  '八字入门：如何看懂自己的四柱',
  '塔罗牌大阿卡纳详解：愚者到世界',
  '每日星座运势：今天适合做什么',
  '五行与性格：你是哪种能量类型',
  '紫微斗数基础：十二宫位含义',
  '六爻占卜入门：如何摇卦解卦',
  '婚姻合婚：八字合婚主要看什么',
  '生肖运势：本命年要注意什么',
  '风水基础：家居布局的常见宜忌',
  '梅花易数起卦方法详解',
  '黄历择日：选吉日的原理与用法',
  '上升星座对性格的影响',
  '塔罗牌阵：三张牌解读过去现在未来',
  '十二生肖与十二星座的对应关系',
];

function buildPrompt(topic) {
  return `你是资深玄学内容编辑。请写一篇适合搜索引擎收录的中文玄学长文。
主题：${topic}
要求：
- 标题：15-30 字，吸引人且包含主题关键词
- 摘要：一段话，60 字以内
- 正文：1200-1500 字，分 5-6 个小节，每个小节用 ## 小标题（如 ## 今日整体运势、## 爱情运势、## 事业运势、## 财运指南、## 健康提醒）
- 全文使用规范简体中文，禁止出现英文单词（专有名词除外），句子自然流畅，像真人编辑写的文章，避免模板化机械罗列
- 每节内容具体可读，重点展开 4-5 个星座/命理细节（融入星象、五行、紫微依据），其余一笔带过，避免机械罗列，确保正文不少于 1200 字
- 涉及八字、塔罗、星座、五行、紫微等传统文化知识，语气温和理性
- 结尾加一段：以上内容基于传统命理与占卜文化，仅供娱乐参考。
- 只返回 JSON，不要 markdown 代码块：
{"title":"文章标题","summary":"一句话摘要","content":"## 小节标题\\n\\n段落内容\\n\\n## 小节标题\\n\\n..."}`;
}

async function generateArticle(topic) {
  const messages = [{ role: 'user', content: buildPrompt(topic) }];
  const commonBody = { model: AI_MODEL, messages, temperature: 0.7, max_tokens: 6000 };
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_KEY}` };

  // 先尝试低推理强度（部分推理模型支持），不支持（400）则降级重试
  let res = await requestJson(`${AI_BASE}/chat/completions`, {
    headers,
    body: { ...commonBody, reasoning_effort: 'low' },
  });
  if (
    res.status === 400 &&
    /reasoning_effort|unknown parameter|invalid parameter|not support|unsupported/i.test(res.text || '')
  ) {
    res = await requestJson(`${AI_BASE}/chat/completions`, { headers, body: commonBody });
  }

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`模型接口返回 ${res.status}: ${(res.text || '').slice(0, 200)}`);
  }
  const content = res.json?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('模型返回内容为空（可尝试换主题或稍后再试）');
  }
  const article = extractArticle(content);
  if (!article) {
    throw new Error('模型返回内容无法解析为文章 JSON');
  }
  return article;
}

// ---------- 主流程 ----------
async function main() {
  if (!AI_KEY) {
    console.error('❌ 缺少 AI_API_KEY（本地模型 key）');
    process.exit(1);
  }
  if (!SITE_URL || !CRON_SECRET) {
    console.error('❌ 缺少 NEXT_PUBLIC_SITE_URL 或 CRON_SECRET（远程网站发布配置）');
    process.exit(1);
  }

  const topic = process.argv[2]?.trim() || DEFAULT_TOPICS[Math.floor(Math.random() * DEFAULT_TOPICS.length)];
  console.log(`📝 正在用 ${AI_MODEL} 生成文章（主题：${topic}）...`);
  const article = await generateArticle(topic);
  console.log(`📄 生成完成：《${article.title}》（正文 ${article.content.length} 字）`);

  console.log(`📤 发布到 ${SITE_URL}/api/articles/publish ...`);
  const pub = await requestJson(`${SITE_URL}/api/articles/publish`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CRON_SECRET}`,
    },
    body: {
      title: article.title,
      summary: article.summary,
      content: article.content,
    },
  });

  if (pub.status === 200 || pub.status === 201) {
    console.log(`✅ 发布成功！文章 ID: ${pub.json?.data?.id}`);
  } else {
    console.error(`❌ 发布失败（HTTP ${pub.status}）: ${pub.text?.slice(0, 300)}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ 运行失败:', err instanceof Error ? err.message : err);
  process.exit(1);
});