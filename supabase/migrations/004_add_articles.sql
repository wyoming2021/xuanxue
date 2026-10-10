-- 004: 文章功能（站长内容发布）
-- 站长在后台发布命理/运势/资讯文章，前台 /articles 展示。

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_status_published
  ON articles(status, published_at DESC);

-- 文章数据同样启用 RLS，前台/后台全部走服务端 API（service role），
-- 禁止 anon/authenticated 直接读写。
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON articles FROM anon, authenticated;