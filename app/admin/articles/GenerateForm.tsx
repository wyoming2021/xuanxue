'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function GenerateForm() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(1);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() || undefined, count, status }),
      });
      const data = await res.json();
      if (data.success) {
        // 接口返回 202：任务已提交，文章在后台生成，稍后刷新列表即可看到。
        setMessage(data.message || '已开始后台生成，请稍后刷新文章列表查看。');
      } else {
        setError(data.error || '生成失败');
      }
    } catch (err) {
      console.error('[GenerateForm] 生成失败:', err);
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-900 dark:bg-indigo-950/20">
        <div className="mb-3 font-serif font-medium text-indigo-700 dark:text-indigo-300">
          ✨ AI 自动写文章
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="topic" className="text-sm font-medium">
              主题（可留空，随机选题）
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="如：2026年射手座运势"
              className="h-11 rounded-xl border-black/10 dark:border-white/10"
            />
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="count" className="text-sm font-medium">
                生成数量（1-5）
              </Label>
              <select
                id="count"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#1a1a1a]"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} 篇
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm font-medium">
                保存方式
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#1a1a1a]"
              >
                <option value="draft">草稿（需手动发布）</option>
                <option value="published">直接发布</option>
              </select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 font-semibold text-white disabled:opacity-50"
            >
              {loading ? '提交中...' : '开始生成'}
            </Button>
          </div>
          <p className="text-xs text-[#a3a3a3]">
            需要先在 .env.local 配置 AI_API_KEY（支持 DeepSeek 等 OpenAI 兼容接口）。AI 生成约需
            1-10 分钟，提交后请稍等再刷新列表。
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          {message}
        </p>
      )}
    </div>
  );
}
