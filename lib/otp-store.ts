/**
 * In-memory OTP store.
 * Used as fallback when Supabase is unavailable (e.g. placeholder URL).
 * In production, always use the database.
 */

interface OtpEntry {
  code: string;
  expiresAt: number;
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
  store.set(email, { code, expiresAt: expiresAt.getTime(), used: false });
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
  // Rate limit: if an unused OTP was created less than 60 seconds ago
  return !entry.used && entry.expiresAt > Date.now() - 60 * 1000;
}

/** Get the current OTP code for an email (debug only) */
export function getOtp(email: string): string | null {
  const entry = store.get(email);
  if (!entry || entry.used || entry.expiresAt < Date.now()) return null;
  return entry.code;
}
