import { isAdmin } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase-admin';

import { ArticleForm, type ArticleFormValue } from '../../ArticleForm';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-2xl font-bold">无权限访问</h1>
      </div>
    );
  }

  if (!supabaseAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-2xl font-bold">编辑文章</h1>
        <p className="text-sm text-[#a3a3a3]">数据库未配置。</p>
      </div>
    );
  }

  const { id } = await params;
  const { data: article, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, summary, content, status')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[admin/articles] 查询文章失败:', { id, error });
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-2xl font-bold">编辑文章</h1>
        <p className="text-sm text-[#a3a3a3]">加载失败，请稍后再试。</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-2xl font-bold">文章不存在</h1>
      </div>
    );
  }

  const initial: ArticleFormValue = {
    id: article.id as string,
    title: article.title as string,
    slug: article.slug as string,
    summary: (article.summary as string) || '',
    content: article.content as string,
    status: (article.status as 'draft' | 'published') || 'draft',
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 font-serif text-2xl font-bold">编辑文章</h1>
      <ArticleForm initial={initial} />
    </div>
  );
}
