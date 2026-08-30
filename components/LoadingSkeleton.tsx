'use client';

export function BaziLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* 四柱骨架 */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-black/5 bg-white p-5 text-center dark:border-white/5 dark:bg-white/[0.03]"
          >
            <div className="mb-2 h-3 w-8 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mb-2 h-10 w-10 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-10 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* 五行骨架 */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
        <div className="mb-4 h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TarotLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-black/5 bg-white p-5 text-center dark:border-white/5 dark:bg-white/[0.03]"
          >
            <div className="mb-2 h-3 w-12 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mb-2 h-16 w-16 mx-auto rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="mb-1 h-4 w-16 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-10 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DailyLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* 综合运势骨架 */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 text-center dark:border-white/5 dark:bg-white/[0.03]">
        <div className="mb-3 h-8 w-32 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mb-2 h-5 w-48 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-64 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* 运势卡片骨架 */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ZiweiLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* 基本信息骨架 */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03]"
          >
            <div className="mb-1 h-3 w-12 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* 十二宫骨架 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03]"
          >
            <div className="mb-2 h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-1">
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HehunLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* 评分骨架 */}
      <div className="rounded-2xl border border-black/5 bg-white p-8 text-center dark:border-white/5 dark:bg-white/[0.03]">
        <div className="mb-4 h-16 w-24 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-32 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* 四柱对比骨架 */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-4 w-16 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 rounded bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 rounded bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
