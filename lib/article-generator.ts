import { generateArticle } from '@/lib/ai-generate';
import { supabaseAdmin } from '@/lib/supabase-admin';

export interface GeneratedArticleRecord {
  id: string;
  title: string;
  status: 'draft' | 'published';
}

/**
 * 调用 AI 生成一篇文章并写入 articles 表。
 *
 * 注意：第三方推理模型生成可能需要 1-10 分钟，请务必在后台任务中调用，
 * 不要在同步请求里等待（会导致 HTTP 超时）。
 */
export async function generateAndPublishArticle(options: {
  topic?: string;
  status?: 'draft' | 'published';
  slugPrefix?: string;
}): Promise<GeneratedArticleRecord> {
  const article = await generateArticle(options.topic);
  const status = options.status === 'published' ? 'published' : 'draft';
  const slug = `${options.slugPrefix || 'ai'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (!supabaseAdmin) {
    throw new Error('数据库未配置');
  }

  const { data: inserted, error } = await supabaseAdmin
    .from('articles')
    .insert({
      title: article.title,
      slug,
      summary: article.summary || null,
      content: article.content,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[article-generator] 写入文章失败:', error);
    throw new Error('文章写入数据库失败');
  }

  return { id: inserted.id, title: article.title, status };
}
