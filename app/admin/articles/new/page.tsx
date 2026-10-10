import { isAdmin } from '@/lib/admin';

import { ArticleForm } from '../ArticleForm';

export default async function NewArticlePage() {
  if (!(await isAdmin())) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 font-serif text-2xl font-bold">无权限访问</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 font-serif text-2xl font-bold">写新文章</h1>
      <ArticleForm />
    </div>
  );
}
