import http from 'node:http';
import https from 'node:https';

/**
 * AI 自动生成玄学文章（OpenAI 兼容接口）。
 *
 * 配置：
 *   AI_API_KEY   必填（如 DeepSeek / OpenAI / 其他兼容接口的 key）
 *   AI_BASE_URL  默认 https://api.deepseek.com/v1
 *   AI_MODEL     默认 deepseek-chat
 *
 * 不配置 AI_API_KEY 时，生成接口返回友好错误，不影响手动发文章。
 */

/** 内置玄学主题池，用于随机生成 */
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

export interface GeneratedArticle {
  title: string;
  summary: string;
  content: string;
}

/** AI 是否已配置 */
export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

/**
 * 使用 Node http/https 发送 JSON POST 请求。
 *
 * 为什么不用 fetch：Node 内置 fetch（undici）默认约 300 秒的 headersTimeout，
 * 而第三方推理模型生成 800-1200 字文章可能超过 5 分钟，导致 UND_ERR_HEADERS_TIMEOUT。
 * 这里改用原生 http/https 模块，可自定义超时时间，并同时支持 http:// 与 https://
 * 接口（本地模型如 qoder 通常是 http://127.0.0.1:端口）。
 */
function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  timeoutMs = 600000,
): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const isHttps = u.protocol === 'https:';
    const transport = isHttps ? https : http;
    const payload = JSON.stringify(body);
    const req = transport.request(
      {
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: `${u.pathname}${u.search}`,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            data: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );
    req.on('timeout', () => {
      req.destroy(new Error(`AI 接口响应超时（超过 ${timeoutMs / 60000} 分钟）`));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

export function randomTopic(): string {
  return DEFAULT_TOPICS[Math.floor(Math.random() * DEFAULT_TOPICS.length)];
}

function getAiConfig() {
  return {
    apiKey: process.env.AI_API_KEY || '',
    baseUrl: (process.env.AI_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/+$/, ''),
    model: process.env.AI_MODEL || 'deepseek-chat',
  };
}

/** 从 AI 返回文本中提取 JSON（兼容 ```json 包裹） */
function extractJson(text: string): GeneratedArticle | null {
  let raw = text.trim();
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
    return null;
  }
  return null;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * 调用 OpenAI 兼容 chat/completions 接口。
 * 推理类模型（如 Atria-Dawn-Preview）会先输出大量 reasoning_content，
 * 这里显式请求低推理强度（reasoning_effort: "low"）并控制 max_tokens，
 * 让文章在 1-3 分钟内返回；若服务商不支持该参数（400），自动降级重试。
 */
async function callChatCompletion(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<{ status: number; data: string }> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
  const commonBody = {
    model,
    messages,
    temperature: 0.7,
    // 推理链可能很长（Atria-Dawn-Preview 等推理模型），max_tokens 给足，
    // 避免 token 全被 reasoning_content 消耗导致 content 为空。
    max_tokens: 6000,
  };
  const first = await postJson(`${baseUrl}/chat/completions`, headers, {
    ...commonBody,
    reasoning_effort: 'low',
  });
  if (
    first.status === 400 &&
    /reasoning_effort|unknown parameter|invalid parameter|not support|unsupported/i.test(first.data)
  ) {
    // 服务商不支持 reasoning_effort 参数，去掉后重试一次
    return postJson(`${baseUrl}/chat/completions`, headers, commonBody);
  }
  return first;
}

/**
 * 调用 AI 生成一篇玄学文章。
 * @param topic 主题（可选，留空随机主题池）
 */
export async function generateArticle(topic?: string): Promise<GeneratedArticle> {
  const { apiKey, baseUrl, model } = getAiConfig();
  if (!apiKey) {
    throw new Error('未配置 AI_API_KEY（在 .env.local 设置后可启用 AI 生成）');
  }

  const finalTopic = topic?.trim() || randomTopic();

  const prompt = `你是资深玄学内容编辑。请写一篇适合搜索引擎收录的中文玄学长文。
主题：${finalTopic}
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

  const { status, data } = await callChatCompletion(baseUrl, apiKey, model, [
    { role: 'user', content: prompt },
  ]);

  if (status < 200 || status >= 300) {
    throw new Error(`AI 接口返回 ${status}: ${data.slice(0, 200)}`);
  }

  let payload: any;
  try {
    payload = JSON.parse(data);
  } catch {
    throw new Error('AI 接口返回了无法解析的内容');
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content) {
    const reason = payload?.choices?.[0]?.finish_reason ?? '未知';
    const reasoningLen = (payload?.choices?.[0]?.message?.reasoning_content ?? '').length;
    const usage = JSON.stringify(payload?.usage ?? {});
    throw new Error(
      `AI 接口返回内容为空（finish_reason=${reason}, reasoning_content长度=${reasoningLen}, usage=${usage}）`,
    );
  }

  const article = extractJson(content);
  if (!article) {
    throw new Error('AI 返回内容无法解析为 JSON，请重试');
  }

  return article;
}

export { DEFAULT_TOPICS };
