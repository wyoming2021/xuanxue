import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_KEY = 'xuanyu_session';
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'xuanyu-default-secret-change-in-production',
);

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
    .sign(SECRET);
}

/** Verify and decode a JWT session token */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
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
