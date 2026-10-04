/**
 * 简单的内存限流 / 失败锁定（P1-3）。
 * 单实例内有效；多实例部署时应换成共享存储（如 Redis）。
 */

interface Bucket {
  count: number;
  resetAt: number;
  /** 失败锁定桶：达到阈值后的锁定截止时间 */
  lockedUntil?: number;
}

const buckets = new Map<string, Bucket>();

// 定期清理过期条目，防止内存无限增长
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now && (!bucket.lockedUntil || bucket.lockedUntil < now)) {
      buckets.delete(key);
    }
  }
}

function getBucket(key: string, now: number): Bucket | undefined {
  const bucket = buckets.get(key);
  if (!bucket) return undefined;
  if (bucket.resetAt < now && (!bucket.lockedUntil || bucket.lockedUntil < now)) {
    buckets.delete(key);
    return undefined;
  }
  return bucket;
}

/**
 * 固定窗口计数限流：本次计数后是否已超过 limit。
 * 未超限时计数 +1；已超限直接返回 true（不再累加）。
 */
export function hitRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  cleanup(now);

  const bucket = getBucket(key, now);
  if (!bucket) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (bucket.count >= limit) return true;
  bucket.count += 1;
  return false;
}

/** 记录一次验证失败。达到 maxFailures 次后锁定 lockMs。 */
export function recordFailure(key: string, maxFailures: number, lockMs: number): boolean {
  const now = Date.now();
  cleanup(now);

  const bucketKey = `fail:${key}`;
  const bucket = getBucket(bucketKey, now) ?? { count: 0, resetAt: now + lockMs };

  bucket.count += 1;
  bucket.resetAt = now + lockMs;
  if (bucket.count >= maxFailures) {
    bucket.lockedUntil = now + lockMs;
  }
  buckets.set(bucketKey, bucket);
  return !!bucket.lockedUntil;
}

/** 查询失败锁定状态 */
export function isLocked(key: string): { locked: boolean; retryInSeconds: number } {
  const now = Date.now();
  const bucket = getBucket(`fail:${key}`, now);
  if (!bucket || !bucket.lockedUntil || bucket.lockedUntil < now) {
    return { locked: false, retryInSeconds: 0 };
  }
  return { locked: true, retryInSeconds: Math.ceil((bucket.lockedUntil - now) / 1000) };
}

/** 验证成功后清除失败计数 */
export function clearFailures(key: string) {
  buckets.delete(`fail:${key}`);
}
