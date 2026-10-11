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
  const today = new Date().toLocaleDateString('zh-CN');

  const prompt = `你是资深玄学内容编辑。请写一篇中文玄学文章。
主题：${finalTopic}
要求：
- 标题：10-30 字，吸引人
- 摘要：一句话，50 字以内
- 正文：800-1200 字，分 6-10 个自然段，段落之间用空行分隔
- 内容涉及八字、塔罗、星座、五行、紫微等传统文化知识，语气温和理性，给出具体可读的解读
- 结尾加一段：以上内容基于传统命理与占卜文化，仅供娱乐参考。
- 只返回 JSON，不要 markdown 代码块：
{"title":"文章标题","summary":"一句话摘要","content":"段落1\\n\\n段落2\\n\\n..."}`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI 接口返回 ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content) {
    throw new Error('AI 接口返回内容为空');
  }

  const article = extractJson(content);
  if (!article) {
    throw new Error('AI 返回内容无法解析为 JSON，请重试');
  }

  return article;
}

export { DEFAULT_TOPICS };
