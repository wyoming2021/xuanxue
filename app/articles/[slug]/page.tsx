import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { supabaseAdmin } from '@/lib/supabase-admin';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  cover_image: string | null;
  published_at: string | null;
  updated_at: string | null;
}

async function getPublishedArticle(slug: string): Promise<Article | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) {
    console.error('[articles/detail] 查询文章失败:', { slug, error });
    return null;
  }
  return (data as Article) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return { title: '文章不存在 | 玄语' };
  return {
    title: `${article.title} | 玄语`,
    description: article.summary || article.title,
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);

  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/articles"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
      >
        ← 返回文章列表
      </Link>

      <article>
        <div className="mb-3 text-xs text-[#a3a3a3]">{formatDate(article.published_at)}</div>
        <h1 className="mb-4 font-serif text-3xl font-bold text-[#1c1917] dark:text-[#e7e5e4]">
          {article.title}
        </h1>
        {article.summary && (
          <p className="mb-6 text-base leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
            {article.summary}
          </p>
        )}

        <div className="prose prose-sm max-w-none text-[15px] leading-8 text-[#1c1917] dark:text-[#d6d3d1]">
          {article.content.split('\n').map((line, i) =>
            line.trim() ? (
              <p key={i} className="mb-4">
                {line}
              </p>
            ) : (
              <div key={i} className="h-4" />
            ),
          )}
        </div>
      </article>

      <div className="mt-10 rounded-xl bg-[#fafaf9] p-3 text-center text-xs text-[#737373] dark:bg-white/[0.02] dark:text-[#78716c]">
        ⚠️ 本文内容基于传统命理/塔罗知识体系，仅供娱乐与文化参考。
      </div>
    </div>
  );
}
