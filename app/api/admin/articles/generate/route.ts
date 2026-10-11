import { NextRequest, NextResponse } from 'next/server';

import { isAdmin } from '@/lib/admin';
import { isAiConfigured } from '@/lib/ai-generate';
import { generateAndPublishArticle } from '@/lib/article-generator';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * 后台 AI 生成文章接口（站长专用）。
 * POST body: { topic?, count?, status? }
 *  count: 1-5，默认 1；status: draft | published，默认 draft
 *
 * 第三方推理模型生成可能耗时 1-10 分钟，接口会立即返回 202（任务已开始），
 * 文章在后台逐个生成并写入 articles 表，稍后刷新文章列表即可看到。
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, error: '无权限' }, { status: 403 });
  }
  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: '未配置 AI_API_KEY。请在 .env.local 设置 AI_API_KEY（如 DeepSeek）后重试。',
      },
      { status: 400 },
    );
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: '数据库未配置' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const rawCount = parseInt(body?.count, 10);
    const count = Math.min(Math.max(Number.isNaN(rawCount) ? 1 : rawCount, 1), 5);
    const status: 'draft' | 'published' = body?.status === 'published' ? 'published' : 'draft';
    const topic =
      typeof body?.topic === 'string' && body.topic.trim() ? body.topic.trim() : undefined;

    // 后台逐个生成（不阻塞响应；Next standalone 常驻进程会继续执行）。
    (async () => {
      for (let i = 0; i < count; i++) {
        try {
          const record = await generateAndPublishArticle({
            topic,
            status,
            slugPrefix: 'ai',
          });
          console.log(`[admin/articles/generate] 生成成功 ${i + 1}/${count}:`, record.title);
        } catch (err) {
          console.error(
            `[admin/articles/generate] 生成失败 ${i + 1}/${count}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
    })();

    return NextResponse.json(
      {
        success: true,
        message: `已开始后台生成 ${count} 篇文章，请稍后刷新文章列表查看。`,
      },
      { status: 202 },
    );
  } catch (error) {
    console.error('[admin/articles/generate] 未捕获错误:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
