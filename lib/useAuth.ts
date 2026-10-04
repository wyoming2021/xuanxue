'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  userId: string;
  email: string;
  isVip: boolean;
  vipExpireTime: string | null;
  remainingDays: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.success ? data.data : null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载复用 fetchUser（P2-4：删除重复的请求逻辑）。
  // microtask 延迟确保 setState 不在 effect 同步体内触发（react-hooks/set-state-in-effect）
  useEffect(() => {
    const t = setTimeout(fetchUser, 0);
    return () => clearTimeout(t);
  }, [fetchUser]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return { user, loading, refresh: fetchUser, logout };
}
