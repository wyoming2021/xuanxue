import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * 服务端管理客户端（service role，绕过 RLS）。
 * 未配置真实 Supabase 时导出 null，调用方必须判空后降级，
 * 而不是在模块加载时抛错导致整个应用崩溃。
 */
function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'placeholder.supabase.co') return null;
  } catch {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin = createAdminClient();
