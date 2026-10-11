import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { isAdmin, getAdminEmail } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase-admin';

import { DeleteArticleButton } from './DeleteArticleButton';

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  updated_at: string | null;
}

function formatTime(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default async function AdminArticlesPage() {
  if (!(await isAdmin())) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-2xl font-bold">无权限访问</h1>
        <p className="text-sm text-[#a3a3a3]">
          文章管理仅限站长（ADMIN_EMAIL 对应的登录账号）使用。
        </p>
      </div>
    );
  }

  const adminEmail = getAdminEmail();

  if (!supabaseAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-2xl font-bold">文章管理</h1>
        <p className="text-sm text-[#a3a3a3]">数据库未配置，无法读取文章。</p>
      </div>
    );
  }

  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, status, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[admin/articles] 查询文章失败:', error);
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-2xl font-bold">文章管理</h1>
        <p className="text-sm text-[#a3a3a3]">加载失败，请稍后再试。</p>
      </div>
    );
  }

  const list = (articles as ArticleRow[]) || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">📝 文章管理</h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">管理员：{adminEmail}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/articles/generate">
            <Button className="h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 font-semibold text-white hover:from-indigo-700 hover:to-purple-700">
              ✨ AI 写文章
            </Button>
          </Link>
          <Link href="/admin/articles/new">
            <Button className="h-10 rounded-xl bg-[#1c1917] px-5 font-semibold text-white hover:bg-[#292524] dark:bg-[#e7e5e4] dark:text-[#1c1917]">
              ＋ 写新文章
            </Button>
          </Link>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="py-20 text-center text-sm text-[#a3a3a3]">
          还没有文章，点击右上角「写新文章」开始。
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/5 dark:bg-white/[0.03]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 text-xs text-[#a3a3a3] dark:border-white/5">
              <tr>
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">更新时间</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-black/5 last:border-0 dark:border-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#1c1917] dark:text-[#e7e5e4]">{a.title}</div>
                    <div className="text-xs text-[#a3a3a3]">/articles/{a.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        a.status === 'published'
                          ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300'
                          : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-white/10 dark:text-gray-300'
                      }
                    >
                      {a.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#a3a3a3]">{formatTime(a.updated_at)}</td>
                  <td className="flex items-center justify-end gap-2 px-4 py-3">
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-[#57534e] transition-colors hover:bg-black/5 dark:border-white/10 dark:text-[#a8a29e] dark:hover:bg-white/10"
                    >
                      编辑
                    </Link>
                    <DeleteArticleButton id={a.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
