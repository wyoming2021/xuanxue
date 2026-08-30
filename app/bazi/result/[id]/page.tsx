import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BaziResult } from '@/components/BaziResult';
import { PayWall } from '@/components/PayWall';
import { ShareButton } from '@/components/ShareButton';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    if (supabaseAdmin && !id.startsWith('local-')) {
      const { data: record } = await supabaseAdmin
        .from('bazi_records')
        .select('name, bazi_result')
        .eq('id', id)
        .single();

      if (record) {
        const result = record.bazi_result;
        const title = `${record.name}的八字排盘 - ${result.yearPillar.gan}${result.yearPillar.zhi}年`;
        const desc = `八字排盘：${result.briefComment}`;
        return {
          title: `${title} | 玄语`,
          description: desc,
          openGraph: { title, description: desc },
        };
      }
    }
  } catch (dbError) {
    // Database not configured
  }

  return { title: '八字排盘结果 | 玄语' };
}

export default async function BaziResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let record = null;
  let dbError = null;

  try {
    if (supabaseAdmin && !id.startsWith('local-')) {
      const { data: fetchedRecord, error } = await supabaseAdmin
        .from('bazi_records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      record = fetchedRecord;
    }
  } catch (err) {
    dbError = err;
    // Database not configured or error
  }

  if (dbError) {
    // fallback to client-side component
    return (
      <div className="page-transition">
        <BaziResultClient id={id} />
      </div>
    );
  }

  if (!record) {
    // Not found
    notFound();
  }

  return (
    <div className="page-transition">
      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
          <Link
            href="/bazi"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] transition-colors hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回排盘
          </Link>
          <h1 className="mb-2 font-serif text-3xl font-bold">📋 {record.name}的八字排盘</h1>
          <p className="text-sm text-[#737373] dark:text-[#78716c]">
            {record.birth_date} · {record.birth_time} · {record.gender === 'male' ? '男' : '女'}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <BaziResult result={record.bazi_result} />
        <div className="mt-8 flex justify-center">
          <ShareButton
            title={`${record.name}的八字排盘`}
            description={record.bazi_result.briefComment}
          />
        </div>
        {!record.is_unlocked && (
          <div className="mt-8">
            <PayWallClient recordId={record.id} />
          </div>
        )}
      </div>
    </div>
  );
}

function PayWallClient({ recordId }: { recordId: string }) {
  return (
    <PayWall
      recordType="bazi"
      recordId={recordId}
      price={9.9}
      onSuccess={() => window.location.reload()}
    />
  );
}

function BaziResultClient({ id }: { id: string }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const data = localStorage.getItem('bazi-${id}');
                if (data) {
                  const parsed = JSON.parse(data);
                  document.title = parsed.name + '的八字排盘 | 玄语';

                  const hero = document.getElementById('bazi-hero');
                  if (hero) {
                    hero.innerHTML = '<div class="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">' +
                      '<a href="/bazi" class="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] transition-colors hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]">' +
                      '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>' +
                      ' 返回排盘</a>' +
                      '<h1 class="mb-2 font-serif text-3xl font-bold">📋 ' + parsed.name + '的八字排盘</h1>' +
                      '<p class="text-sm text-[#737373] dark:text-[#78716c]">' + parsed.birthDate + ' · ' + parsed.birthTime + ' · ' + (parsed.gender === 'male' ? '男' : '女') + '</p>' +
                      '</div>';
                  }

                  const result = document.getElementById('bazi-result');
                  if (result && parsed.fullResult) {
                    const r = parsed.fullResult;
                    const pillars = [
                      { label: '年柱', gan: r.yearPillar.gan, zhi: r.yearPillar.zhi },
                      { label: '月柱', gan: r.monthPillar.gan, zhi: r.monthPillar.zhi },
                      { label: '日柱', gan: r.dayPillar.gan, zhi: r.dayPillar.zhi },
                      { label: '时柱', gan: r.hourPillar.gan, zhi: r.hourPillar.zhi },
                    ];

                    let html = '<div class="space-y-8">';
                    html += '<div class="grid grid-cols-4 gap-3">';
                    pillars.forEach(function(p) {
                      html += '<div class="rounded-2xl border border-black/5 bg-white p-5 text-center shadow-sm dark:border-white/5 dark:bg-white/[0.03]">';
                      html += '<div class="mb-2 text-xs font-medium text-[#737373] dark:text-[#78716c]">' + p.label + '</div>';
                      html += '<div className="font-serif text-3xl font-bold text-indigo-600 dark:text-indigo-400">' + p.gan + '</div>';
                      html += '<div className="font-serif text-3xl font-bold text-indigo-600 dark:text-indigo-400">' + p.zhi + '</div>';
                      html += '</div>';
                    });
                    html += '</div>';

                    html += '<div class="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">';
                    html += '<h3 class="mb-4 font-serif text-lg font-bold">五行分布</h3>';
                    const elements = r.fiveElements;
                    const names = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
                    const colors = { wood: 'bg-green-500', fire: 'bg-red-500', earth: 'bg-amber-500', metal: 'bg-gray-400', water: 'bg-blue-500' };
                    const max = Math.max(...Object.values(elements));
                    html += '<div class="space-y-3">';
                    Object.entries(elements).forEach(function([el, count]) {
                      const pct = max > 0 ? (count / max) * 100 : 0;
                      html += '<div class="flex items-center gap-3">';
                      html += '<span class="w-8 text-sm font-medium text-[#57534e] dark:text-[#a8a29e]">' + names[el] + '</span>';
                      html += '<div class="flex-1 h-3 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">';
                      html += '<div class="h-full rounded-full ' + colors[el] + '" style="width:' + pct + '%"></div>';
                      html += '</div>';
                      html += '<span class="w-4 text-sm text-[#57534e] dark:text-[#78716c]">' + count + '</span>';
                      html += '</div>';
                    });
                    html += '</div></div>';

                    html += '<div class="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">';
                    html += '<h3 class="mb-3 font-serif text-lg font-bold">总评</h3>';
                    html += '<p class="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">' + r.briefComment + '</p>';
                    html += '</div></div>';

                    result.innerHTML = html;
                  }
                }
              } catch(e) { console.error(e); }
            })();
          `,
        }}
      />
      <div
        id="bazi-hero"
        className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]"
      >
        <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
          <Link
            href="/bazi"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] transition-colors hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回排盘
          </Link>
          <h1 className="mb-2 font-serif text-3xl font-bold">📋 八字排盘结果</h1>
          <p className="text-sm text-[#737373]">加载中...</p>
        </div>
      </div>
      <div id="bazi-result" className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="flex items-center justify-center py-20 text-[#737373]">加载排盘结果...</div>
      </div>
    </>
  );
}
