import Link from 'next/link';

import { isAdmin } from '@/lib/admin';

import { GenerateForm } from '../GenerateForm';

export default async function GenerateArticlePage() {
  if (!(await isAdmin())) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-2xl font-bold">无权限访问</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">✨ AI 生成文章</h1>
        <Link
          href="/admin/articles"
          className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← 返回文章列表
        </Link>
      </div>
      <GenerateForm />
    </div>
  );
}
