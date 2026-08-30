/**
 * In-memory user store for dev mode.
 * Simulates the Supabase `users` table when no real database is configured.
 * In production, always use the real database.
 */

interface DevUser {
  id: string;
  email: string;
  vip_expire_time: string | null;
}

const users = new Map<string, DevUser>();

function isRealDb(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');
}

/** Get or create a dev user by email */
export function getOrCreateDevUser(email: string): DevUser {
  if (isRealDb()) throw new Error('dev-user-store should not be used in production');

  let user = users.get(email);
  if (!user) {
    user = {
      id: `dev-${Buffer.from(email).toString('base64url')}`,
      email,
      vip_expire_time: null,
    };
    users.set(email, user);
  }
  return { ...user };
}

/** Get dev user by userId */
export function getDevUserById(userId: string): DevUser | null {
  if (isRealDb()) throw new Error('dev-user-store should not be used in production');

  for (const user of users.values()) {
    if (user.id === userId) return { ...user };
  }
  return null;
}

/** Simulate a membership purchase: set vip_expire_time */
export function activateDevMembership(email: string, days: number): DevUser {
  if (isRealDb()) throw new Error('dev-user-store should not be used in production');

  const user = getOrCreateDevUser(email);
  const now = new Date();
  const currentExpiry = user.vip_expire_time ? new Date(user.vip_expire_time) : null;

  // Extend from now or from current expiry, whichever is later
  const baseTime = currentExpiry && currentExpiry > now ? currentExpiry : now;
  baseTime.setDate(baseTime.getDate() + days);

  user.vip_expire_time = baseTime.toISOString();
  users.set(email, user);
  return { ...user };
}
