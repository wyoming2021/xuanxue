import type { Metadata } from 'next';
import Link from 'next/link';

import { supabaseAdmin } from '@/lib/supabase-admin';

export const metadata: Metadata = {
  title: '文章 | 玄语',
  description: '八字、塔罗、命理、每日运势相关文章与知识分享。',
};

// 文章列表必须每次请求实时读取数据库（AI 每日新增文章），不能构建时静态化。
export const dynamic = 'force-dynamic';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  published_at: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default async function ArticlesPage() {
  if (!supabaseAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-3xl font-bold">文章</h1>
        <p className="text-sm text-[#a3a3a3]">数据库未配置，暂时无法读取文章。</p>
      </div>
    );
  }

  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, summary, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[articles] 查询文章失败:', error);
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-3xl font-bold">文章</h1>
        <p className="text-sm text-[#a3a3a3]">文章加载失败，请稍后再试。</p>
      </div>
    );
  }

  const list = (articles as Article[]) || [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-2 font-serif text-3xl font-bold">📖 文章</h1>
        <p className="text-sm text-[#737373] dark:text-[#a8a29e]">命理、塔罗与每日运势相关分享</p>
      </div>

      {list.length === 0 ? (
        <p className="py-20 text-center text-sm text-[#a3a3a3]">暂无文章，敬请期待。</p>
      ) : (
        <div className="space-y-5">
          {list.map((a) => (
            <Link
              key={a.id}
              href={`/articles/${a.slug}`}
              className="block rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:border-white/5 dark:bg-white/[0.03] dark:hover:border-indigo-800"
            >
              <div className="mb-1 text-xs text-[#a3a3a3]">{formatDate(a.published_at)}</div>
              <h2 className="mb-2 font-serif text-xl font-bold text-[#1c1917] dark:text-[#e7e5e4]">
                {a.title}
              </h2>
              {a.summary && (
                <p className="line-clamp-2 text-sm leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                  {a.summary}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
