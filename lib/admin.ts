import { getCurrentSession } from '@/lib/auth';

/**
 * 站长（内容管理员）校验。
 *
 * 通过环境变量 ADMIN_EMAIL 指定可访问管理后台的邮箱（服务端读取，不会暴露给前端）。
 * 未配置 ADMIN_EMAIL 时，管理后台与写接口一律不可用（403）。
 */
export async function isAdmin(): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  const session = await getCurrentSession();
  if (!session?.email) return false;
  return session.email.toLowerCase() === adminEmail.trim().toLowerCase();
}

/** 返回管理员邮箱（未配置返回 null） */
export function getAdminEmail(): string | null {
  return process.env.ADMIN_EMAIL || null;
}
