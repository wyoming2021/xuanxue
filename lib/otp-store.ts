/**
 * In-memory OTP store.
 * Used as fallback when Supabase is unavailable (e.g. placeholder URL).
 * In production, always use the database.
 */

interface OtpEntry {
  code: string;
  expiresAt: number;
  /** 创建时间（毫秒时间戳），用于 60s 重发冷却判断 */
  createdAt: number;
  used: boolean;
}

const store = new Map<string, OtpEntry>();

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.expiresAt < now || entry.used) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

export function saveOtp(email: string, code: string, expiresAt: Date) {
  store.set(email, { code, expiresAt: expiresAt.getTime(), createdAt: Date.now(), used: false });
}

export function verifyOtp(email: string, code: string): { valid: boolean; expired: boolean } {
  const entry = store.get(email);
  if (!entry) return { valid: false, expired: false };
  if (entry.used) return { valid: false, expired: false };
  if (entry.expiresAt < Date.now()) return { valid: false, expired: true };
  if (entry.code !== code) return { valid: false, expired: false };
  entry.used = true;
  return { valid: true, expired: false };
}

export function isRateLimited(email: string): boolean {
  const entry = store.get(email);
  if (!entry) return false;
  // 重发冷却：未使用的验证码创建于 60 秒内则拦截。
  // 注意按 createdAt 判断，不要用 expiresAt（那是 5 分钟有效期，会把冷却放大成 6 分钟）
  return !entry.used && Date.now() - entry.createdAt < 60 * 1000;
}

/** Get the current OTP code for an email (debug only) */
export function getOtp(email: string): string | null {
  const entry = store.get(email);
  if (!entry || entry.used || entry.expiresAt < Date.now()) return null;
  return entry.code;
}
