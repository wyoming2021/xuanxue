'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ArticleFormValue {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: 'draft' | 'published';
}

export function ArticleForm({ initial }: { initial?: ArticleFormValue }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [summary, setSummary] = useState(initial?.summary || '');
  const [content, setContent] = useState(initial?.content || '');
  const [status, setStatus] = useState<'draft' | 'published'>(initial?.status || 'draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initial?.id,
          title,
          slug,
          summary,
          content,
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/articles');
        router.refresh();
      } else {
        setError(data.error || '保存失败');
      }
    } catch (err) {
      console.error('[ArticleForm] 保存失败:', err);
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          标题 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          className="h-11 rounded-xl border-black/10 dark:border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug" className="text-sm font-medium">
          链接别名（可选）
        </Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="留空自动生成，如：bazi-zhishi"
          className="h-11 rounded-xl border-black/10 dark:border-white/10"
        />
        <p className="text-xs text-[#a3a3a3]">
          用于前台地址 /articles/链接别名，建议用英文小写和连字符。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary" className="text-sm font-medium">
          摘要（列表页展示）
        </Label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          placeholder="一句话概括文章内容"
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-[#e7e5e4]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm font-medium">
          正文 <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="content"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          placeholder={'正文内容，每行一个段落，空行分段。\n\n例如：\n八字排盘是……'}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-[#1c1917] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-[#e7e5e4]"
        />
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="status" className="text-sm font-medium">
          状态
        </Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#1a1a1a]"
        >
          <option value="draft">草稿</option>
          <option value="published">发布</option>
        </select>
        <span className="text-xs text-[#a3a3a3]">发布后立即在前台文章列表显示。</span>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="h-11 rounded-xl bg-[#1c1917] px-6 font-semibold text-white hover:bg-[#292524] disabled:opacity-50 dark:bg-[#e7e5e4] dark:text-[#1c1917]"
        >
          {loading ? '保存中...' : initial?.id ? '保存修改' : '创建文章'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/articles')}
          className="h-11 rounded-xl px-6"
        >
          取消
        </Button>
      </div>
    </form>
  );
}
