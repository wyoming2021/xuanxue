import crypto from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * 接收外部工具生成的文章并发布（供本地电脑生成文章后推送到本网站）。
 *
 * 适用场景：VPS 内存较小不跑 AI 模型，模型在本地电脑生成文章后，
 * 通过本接口发布到网站。认证方式与定时任务一致：请求头
 *   Authorization: Bearer <CRON_SECRET>
 *
 * POST body: { title, summary?, content, slug? }
 * 文章以 status=published 直接发布；slug 留空时自动生成。
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: '数据库未配置' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';

  if (!title) {
    return NextResponse.json({ success: false, error: '标题不能为空' }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ success: false, error: '正文不能为空' }, { status: 400 });
  }

  const finalSlug = slug || `article-${crypto.randomBytes(8).toString('hex')}`;

  const { data: inserted, error } = await supabaseAdmin
    .from('articles')
    .insert({
      title,
      slug: finalSlug,
      summary: summary || null,
      content,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[articles/publish] 写入文章失败:', error);
    return NextResponse.json(
      { success: false, error: error.code === '23505' ? '链接别名已存在，请换一个' : '写入失败' },
      { status: error.code === '23505' ? 409 : 500 },
    );
  }

  return NextResponse.json({ success: true, data: { id: inserted.id, title } });
}
