import { NextRequest, NextResponse } from 'next/server';

import { generateArticle, isAiConfigured } from '@/lib/ai-generate';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * 定时任务：每天自动生成一篇玄学文章并发布。
 *
 * 调用方式（VPS crontab 或外部定时器）：
 *   curl -fsS -H "Authorization: Bearer <CRON_SECRET>" \
 *     https://你的域名/api/cron/generate-article
 *
 * 未配置 CRON_SECRET 或请求头不匹配时返回 401；未配置 AI_API_KEY 时返回 503。
 */
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

  try {
    const today = new Date().toLocaleDateString('zh-CN');
    const article = await generateArticle(`今日运势与命理指南 ${today}`);
    const slug = `daily-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const { data: inserted, error } = await supabaseAdmin
      .from('articles')
      .insert({
        title: article.title,
        slug,
        summary: article.summary || null,
        content: article.content,
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[cron/generate-article] 写入文章失败:', error);
      return NextResponse.json({ success: false, error: '写入失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      articleId: inserted.id,
      title: article.title,
    });
  } catch (err) {
    console.error('[cron/generate-article] 生成失败:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : '生成失败' },
      { status: 500 },
    );
  }
}
