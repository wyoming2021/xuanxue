import { getCurrentSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface RequestUser {
  userId: string;
  isVip: boolean;
}

/**
 * 解析当前请求的归属用户（文档 8.3 归属链）：
 *
 *   登录态：session cookie -> users.id
 *   匿名态：deviceId -> users.device_id -> users.id
 *
 * 业务表（bazi_records / tarot_records / daily_fortunes）没有 device_id 字段，
 * 归属校验必须先解析出 users.id，再与 record.user_id 比较。
 */
export async function resolveRequestUser(deviceId: string | null): Promise<RequestUser | null> {
  if (!supabaseAdmin) return null;

  const session = await getCurrentSession();
  if (session?.userId) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, vip_expire_time')
      .eq('id', session.userId)
      .maybeSingle();

    if (user) {
      return {
        userId: user.id,
        isVip: !!user.vip_expire_time && new Date(user.vip_expire_time) > new Date(),
      };
    }
    return null;
  }

  if (deviceId && UUID_RE.test(deviceId)) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, vip_expire_time')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (user) {
      return {
        userId: user.id,
        isVip: !!user.vip_expire_time && new Date(user.vip_expire_time) > new Date(),
      };
    }
  }

  return null;
}

export function isValidUuid(value: string | null | undefined): boolean {
  return !!value && UUID_RE.test(value);
}
