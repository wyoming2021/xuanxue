import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_KEY = 'xuanyu_session';

const DEFAULT_DEV_SECRET = 'xuanyu-dev-only-secret-not-for-production';

let cachedSecret: Uint8Array | null = null;

/**
 * 解析 JWT 签名密钥（P1-1：生产环境 fail-fast，不允许静默使用公开默认值）。
 * - 生产环境：AUTH_SECRET 缺失或短于 32 字符直接抛错；
 * - 开发环境：未配置时回退到固定开发密钥并警告，保证本地可跑。
 */
function getAuthSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;

  const secret = process.env.AUTH_SECRET;
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    if (!secret) {
      throw new Error('[auth] 生产环境缺少 AUTH_SECRET，拒绝签发/校验会话（fail-fast）');
    }
    if (secret.length < 32) {
      throw new Error(
        '[auth] 生产环境 AUTH_SECRET 长度不足 32 字符，拒绝启动会话功能（fail-fast）',
      );
    }
    cachedSecret = new TextEncoder().encode(secret);
    return cachedSecret;
  }

  if (!secret || secret.length < 32) {
    if (!secret) {
      console.warn('[auth] 开发环境未配置 AUTH_SECRET，使用开发默认值（请勿用于生产）');
    } else {
      console.warn('[auth] 开发环境 AUTH_SECRET 长度不足 32 字符，使用开发默认值（请勿用于生产）');
    }
    cachedSecret = new TextEncoder().encode(DEFAULT_DEV_SECRET);
    return cachedSecret;
  }

  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
}

export interface SessionPayload {
  userId: string;
  email: string;
}

/** Generate a JWT session token (7 days expiry) */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getAuthSecret());
}

/** Verify and decode a JWT session token */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

/** Set session cookie (server component compatible) */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/** Clear session cookie */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
}

/** Get current session from cookies (server-side) */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_KEY)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
