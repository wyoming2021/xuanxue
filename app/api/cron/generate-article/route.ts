import { NextRequest, NextResponse } from 'next/server';

import { isAiConfigured } from '@/lib/ai-generate';
import { generateAndPublishArticle } from '@/lib/article-generator';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * 定时任务：每天自动生成一篇玄学文章并发布。
 *
 * 调用方式（VPS crontab 或外部定时器）：
 *   curl -fsS -H "Authorization: Bearer <CRON_SECRET>" \
 *     https://你的域名/api/cron/generate-article
 *
 * 注意：第三方推理模型生成文章可能耗时 1-10 分钟，本接口会立即返回
 * 202（任务已开始），文章在后台生成完毕后自动出现在前台文章列表；
 * 生成失败会自动重试（最多 3 次，间隔 30 秒）。
 * 未配置 CRON_SECRET 或请求头不匹配时返回 401；未配置 AI_API_KEY 时返回 503。
 */

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 30_000;

async function generateDailyWithRetry(topic: string, attempt: number): Promise<void> {
  try {
    const record = await generateAndPublishArticle({
      topic,
      status: 'published',
      slugPrefix: 'daily',
    });
    console.log('[cron/generate-article] 异步生成成功:', record);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron/generate-article] 异步生成失败（第 ${attempt} 次）: ${message}`);
    if (attempt < MAX_ATTEMPTS) {
      setTimeout(() => void generateDailyWithRetry(topic, attempt + 1), RETRY_DELAY_MS);
    } else {
      console.error('[cron/generate-article] 多次重试仍失败，请检查 AI_API_KEY 或稍后手动生成。');
    }
  }
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!isAiConfigured()) {
    return NextResponse.json(
      { success: false, error: 'AI_API_KEY 未配置，无法生成文章' },
      { status: 503 },
    );
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: '数据库未配置' }, { status: 503 });
  }

  const today = new Date().toLocaleDateString('zh-CN');

  // 立即返回，后台生成（Next standalone 服务器为常驻进程，响应返回后后台任务会继续执行）。
  void generateDailyWithRetry(`今日运势与命理指南 ${today}`, 1);

  return NextResponse.json(
    {
      success: true,
      message: '已开始生成今日文章，请稍后刷新前台文章列表查看。',
    },
    { status: 202 },
  );
}
