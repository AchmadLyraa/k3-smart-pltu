// app/(worker)/worker/reward-users/loading.tsx

export default function RewardUsersLoading() {
  return (
    <div className="space-y-6 px-2 max-w-7xl mx-auto pb-16">
      {/* Back Button skeleton */}
      <div className="w-10 h-10 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center shadow-sm">
        <div className="w-5 h-5 rounded bg-zinc-200 animate-pulse" />
      </div>

      {/* Header Banner skeleton */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 md:p-7 text-white shadow-xl h-44 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-700 animate-pulse" />
            <div className="h-4 w-24 rounded bg-zinc-700 animate-pulse" />
          </div>
          <div className="h-7 w-56 rounded-lg bg-zinc-700 animate-pulse" />
          <div className="h-4 w-96 rounded bg-zinc-700/80 animate-pulse max-w-full" />
        </div>
      </div>

      {/* Stats Grid skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3.5 w-20 rounded bg-zinc-200 animate-pulse" />
              <div className="h-7 w-24 rounded bg-zinc-200 animate-pulse" />
            </div>
            <div className="h-11 w-11 rounded-2xl bg-zinc-200 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Catalog & History Layout skeleton */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        {/* Catalog skeleton */}
        <div className="border border-zinc-200 bg-white rounded-3xl p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-zinc-200 animate-pulse" />
            <div className="h-4 w-80 rounded bg-zinc-200/80 animate-pulse" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-zinc-150 p-5 space-y-4 bg-white"
              >
                <div className="flex justify-between items-start">
                  <div className="h-5 w-32 rounded bg-zinc-200 animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-zinc-200 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-zinc-200 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-zinc-200 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <div className="h-3 w-10 rounded bg-zinc-200 animate-pulse" />
                    <div className="h-5 w-16 rounded bg-zinc-200 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-12 rounded bg-zinc-200 animate-pulse" />
                    <div className="h-5 w-12 rounded bg-zinc-200 animate-pulse" />
                  </div>
                </div>
                <div className="h-10 w-full rounded-2xl bg-zinc-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* History skeleton */}
        <div className="border border-zinc-200 bg-white rounded-3xl p-5 space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-36 rounded bg-zinc-200 animate-pulse" />
            <div className="h-4 w-60 rounded bg-zinc-200/80 animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-100 p-4 space-y-3 bg-zinc-50/50"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-zinc-200 animate-pulse" />
                    <div className="h-4 w-12 rounded bg-zinc-200 animate-pulse" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="h-4.5 w-14 rounded-full bg-zinc-200 animate-pulse" />
                    <div className="h-4 w-20 rounded-full bg-zinc-200 animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-full rounded bg-zinc-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
