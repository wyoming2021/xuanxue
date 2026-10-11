import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SITE_URL } from '@/lib/site-config';
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
  const title = `${article.title} | 玄语`;
  const description = article.summary || article.title;
  return {
    title,
    description,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/articles/${slug}`,
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
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
        {/* Article 结构化数据：帮助 Google 识别文章、展示富媒体结果 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: article.title,
              description: article.summary || undefined,
              datePublished: article.published_at || undefined,
              dateModified: article.updated_at || undefined,
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${SITE_URL}/articles/${slug}`,
              },
              author: { '@type': 'Organization', name: '玄语' },
              publisher: {
                '@type': 'Organization',
                name: '玄语',
                logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.ico` },
              },
            }),
          }}
        />
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
          {article.content.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-4" />;
            if (trimmed.startsWith('## ')) {
              return (
                <h2
                  key={i}
                  className="mb-3 mt-6 font-serif text-xl font-bold text-[#1c1917] dark:text-[#e7e5e4]"
                >
                  {trimmed.slice(3)}
                </h2>
              );
            }
            if (trimmed.startsWith('# ')) {
              return (
                <h2
                  key={i}
                  className="mb-3 mt-6 font-serif text-xl font-bold text-[#1c1917] dark:text-[#e7e5e4]"
                >
                  {trimmed.slice(2)}
                </h2>
              );
            }
            return (
              <p key={i} className="mb-4">
                {line}
              </p>
            );
          })}
        </div>
      </article>

      <div className="mt-10 rounded-2xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
        <div className="mb-3 font-serif font-bold text-[#1c1917] dark:text-[#e7e5e4]">
          🔮 试试更多玄学工具
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: '/bazi', label: '八字排盘', emoji: '📋' },
            { href: '/tarot', label: '塔罗占卜', emoji: '🃏' },
            { href: '/daily', label: '每日运势', emoji: '✨' },
            { href: '/ziwei', label: '紫微斗数', emoji: '⭐' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-center gap-2 rounded-xl border border-black/5 bg-[#fafaf9] px-3 py-3 text-sm font-medium text-[#57534e] transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-white/5 dark:bg-white/[0.03] dark:text-[#a8a29e] dark:hover:border-indigo-700 dark:hover:text-indigo-400"
            >
              <span>{item.emoji}</span> {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-xl bg-[#fafaf9] p-3 text-center text-xs text-[#737373] dark:bg-white/[0.02] dark:text-[#78716c]">
        ⚠️ 本文内容基于传统命理/塔罗知识体系，仅供娱乐与文化参考。
      </div>
    </div>
  );
}
