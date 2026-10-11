import { NextRequest, NextResponse } from 'next/server';

import { isAdmin } from '@/lib/admin';
import { generateArticle, isAiConfigured, randomTopic } from '@/lib/ai-generate';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * 后台 AI 生成文章接口（站长专用）。
 * POST body: { topic?, count?, status? }
 *  count: 1-5，默认 1；status: draft | published，默认 draft
 * 逐个调用 AI 生成并写入 articles 表，返回每篇的结果（成功或失败）。
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
    const status = body?.status === 'published' ? 'published' : 'draft';
    const topic =
      typeof body?.topic === 'string' && body.topic.trim() ? body.topic.trim() : undefined;

    const results: Array<Record<string, unknown>> = [];
    for (let i = 0; i < count; i++) {
      try {
        const article = await generateArticle(topic);
        // 唯一 slug：ai-<时间戳>-<序号>-<随机>
        const slug = `ai-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`;
        const { data: inserted, error } = await supabaseAdmin
          .from('articles')
          .insert({
            title: article.title,
            slug,
            summary: article.summary || null,
            content: article.content,
            status,
            published_at: status === 'published' ? new Date().toISOString() : null,
          })
          .select('id')
          .single();

        if (error) throw error;
        results.push({ ok: true, id: inserted.id, title: article.title, status });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[admin/articles/generate] 生成失败:', message);
        results.push({ ok: false, error: message, topic: topic || randomTopic() });
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('[admin/articles/generate] 未捕获错误:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
