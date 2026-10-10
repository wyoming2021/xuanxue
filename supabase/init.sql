-- ============================================
-- 玄语站一键初始化 SQL（合并版）
-- 用法：Supabase SQL Editor 里整段粘贴执行一次即可
-- 包含：基础表 + OTP登录 + 行级安全(RLS) + 产品列 + 唯一索引
-- ============================================

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE,
  email TEXT,
  vip_expire_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. bazi_records
CREATE TABLE IF NOT EXISTS bazi_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT,
  birth_date DATE,
  birth_time TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  bazi_result JSONB,
  is_unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. tarot_records
CREATE TABLE IF NOT EXISTS tarot_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question TEXT,
  spread_type TEXT DEFAULT 'single',
  cards JSONB,
  is_unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  record_type TEXT CHECK (record_type IN ('bazi', 'tarot', 'daily', 'membership')),
  record_id UUID,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  hupijiao_order_id TEXT,
  hupijiao_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- 5. daily_fortunes
CREATE TABLE IF NOT EXISTS daily_fortunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  zodiac TEXT,
  fortune_date DATE,
  content JSONB,
  is_unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_bazi_records_user_id ON bazi_records(user_id);
CREATE INDEX IF NOT EXISTS idx_tarot_records_user_id ON tarot_records(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_fortunes_user_id ON daily_fortunes(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_fortunes_date ON daily_fortunes(fortune_date);

-- OTP codes table for email login
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by email
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_code ON otp_codes(email, code);

-- Add email unique constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;
END $$;

-- Index for email lookup on users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 003: 支付链路修复所需的结构变更
-- 1. orders.product_key：服务端产品目录中的产品标识（lib/payment-products.ts）
-- 2. RLS：所有业务表启用行级安全（P0-3）

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS product_key TEXT;

-- 单次解锁的归属判定需要按 (user_id, record_type, record_id) 找到最近订单
CREATE INDEX IF NOT EXISTS idx_orders_user_record
  ON orders(user_id, record_type, record_id);

-- 每日运势按 (zodiac, fortune_date) 是一条公共记录（P3-8）：
-- 唯一约束防止并发请求为同一星座同一天插入多条记录
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_fortunes_zodiac_date
  ON daily_fortunes(zodiac, fortune_date);

-- ===== Row Level Security =====
-- 前端只有 anon key（无用户登录态绑定），因此所有表对 anon/public 一律无权限；
-- 业务读写全部走服务端 service role（绕过 RLS）。

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bazi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- 不创建任何 anon 可用的 policy：默认拒绝（DENY ALL）。
-- 服务端 API 使用 SUPABASE_SERVICE_ROLE_KEY 访问，service role 绕过 RLS。

-- 显式回收 anon 角色对这些表的全部权限（防止历史 GRANT 残留）
REVOKE ALL ON users FROM anon, authenticated;
REVOKE ALL ON bazi_records FROM anon, authenticated;
REVOKE ALL ON tarot_records FROM anon, authenticated;
REVOKE ALL ON orders FROM anon, authenticated;
REVOKE ALL ON daily_fortunes FROM anon, authenticated;
REVOKE ALL ON otp_codes FROM anon, authenticated;

-- ============ 004: 文章功能 ============

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