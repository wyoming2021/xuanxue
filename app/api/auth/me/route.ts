import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth';
import { getDevUserById } from '@/lib/dev-user-store';
import { supabaseAdmin } from '@/lib/supabase-admin';

const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    // Dev mode: read from dev user store
    if (!isRealSupabase || session.userId.startsWith('dev-')) {
      const devUser = getDevUserById(session.userId);
      if (!devUser) {
        return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 });
      }

      const isVip = devUser.vip_expire_time && new Date(devUser.vip_expire_time) > new Date();
      const remainingDays = isVip
        ? Math.ceil(
            (new Date(devUser.vip_expire_time!).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          )
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          userId: devUser.id,
          email: devUser.email,
          isVip: !!isVip,
          vipExpireTime: devUser.vip_expire_time,
          remainingDays,
        },
      });
    }

    // Production: read from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, vip_expire_time')
      .eq('id', session.userId)
      .single();

    if (!user) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 });
    }

    const isVip = user.vip_expire_time && new Date(user.vip_expire_time) > new Date();
    const remainingDays = isVip
      ? Math.ceil((new Date(user.vip_expire_time!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        isVip: !!isVip,
        vipExpireTime: user.vip_expire_time,
        remainingDays,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
