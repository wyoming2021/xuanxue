import crypto from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { isAdmin } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase-admin';

function notAdmin() {
  return NextResponse.json({ success: false, error: '无权限' }, { status: 403 });
}

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

/** 生成唯一 slug：留空时用 article-<16hex> */
function makeSlug(raw?: string): string {
  const slug = (raw || '').trim();
  if (slug) return slug;
  return `article-${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * 文章管理 API（站长专用）。
 * POST：新建（无 id）或更新（有 id）
 * DELETE：?id=xxx 删除
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return notAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, error: '数据库未配置，无法保存文章' },
      { status: 503 },
    );
  }

  try {
    const body = await req.json();
    const { id, title, summary, content, slug, status } = body;

    if (typeof title !== 'string' || !title.trim()) {
      return badRequest('标题不能为空');
    }
    if (typeof content !== 'string' || !content.trim()) {
      return badRequest('正文不能为空');
    }

    const finalSlug = makeSlug(slug);
    const finalStatus = status === 'published' ? 'published' : 'draft';
    const publishedAt = finalStatus === 'published' ? new Date().toISOString() : null;

    if (id) {
      const { error } = await supabaseAdmin
        .from('articles')
        .update({
          title: title.trim(),
          slug: finalSlug,
          summary: summary?.trim() || null,
          content: content.trim(),
          status: finalStatus,
          published_at: publishedAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('[admin/articles] 更新文章失败:', { id, error });
        return NextResponse.json(
          {
            success: false,
            error: error.code === '23505' ? '链接别名已存在，请换一个' : '保存失败',
          },
          { status: error.code === '23505' ? 409 : 500 },
        );
      }
      return NextResponse.json({ success: true, data: { id } });
    }

    const { data: inserted, error } = await supabaseAdmin
      .from('articles')
      .insert({
        title: title.trim(),
        slug: finalSlug,
        summary: summary?.trim() || null,
        content: content.trim(),
        status: finalStatus,
        published_at: publishedAt,
      })
      .select('id')
      .single();

    if (error || !inserted) {
      console.error('[admin/articles] 新建文章失败:', error);
      return NextResponse.json(
        {
          success: false,
          error: error?.code === '23505' ? '链接别名已存在，请换一个' : '保存失败',
        },
        { status: error?.code === '23505' ? 409 : 500 },
      );
    }
    return NextResponse.json({ success: true, data: { id: inserted.id } });
  } catch (error) {
    console.error('[admin/articles] 未捕获错误:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return notAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: '数据库未配置' }, { status: 503 });
  }

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return badRequest('缺少文章 id');

  const { error } = await supabaseAdmin.from('articles').delete().eq('id', id);
  if (error) {
    console.error('[admin/articles] 删除文章失败:', { id, error });
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
