/**
 * 统一的环境判断模块。
 *
 * 不要再用 "NEXT_PUBLIC_SUPABASE_URL 是否包含 placeholder" 之类的魔法字符串
 * 判断生产/开发环境（P1-4）。判断生产环境用 NODE_ENV；判断数据库是否可用
 * 用 hasRealSupabase()。
 */

/** 是否为生产构建/运行环境 */
export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Supabase 是否配置了真实的库（非占位符）。
 * 用于区分「真库模式」与「无库的本地开发模式」。
 */
export function hasRealSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname !== 'placeholder.supabase.co';
  } catch {
    return false;
  }
}

/** dev/debug 类工具路由是否可用：仅限本地开发且未接真库时 */
export function isDevToolAllowed(): boolean {
  return !isProductionEnv() && !hasRealSupabase();
}

/** 从请求头解析客户端 IP（取 x-forwarded-for 首个） */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
