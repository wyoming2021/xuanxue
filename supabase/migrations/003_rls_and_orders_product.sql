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
