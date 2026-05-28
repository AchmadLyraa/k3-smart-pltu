// app/(worker)/worker/quiz-history/loading.tsx

export default function QuizHistoryLoading() {
  return (
    <div className="space-y-5 px-2 max-w-7xl mx-auto pb-16">
      {/* Back button skeleton */}
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
          <div className="h-7 w-48 rounded-lg bg-zinc-700 animate-pulse" />
          <div className="h-4 w-96 rounded bg-zinc-700/80 animate-pulse max-w-full" />
        </div>
      </div>

      {/* Stats Cards skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-[20px] p-4 border border-zinc-100 shadow-[0_1px_6px_rgba(0,0,0,0.02)] text-center space-y-2"
          >
            <div className="h-3 w-16 mx-auto rounded bg-zinc-200 animate-pulse" />
            <div className="h-7 w-12 mx-auto rounded bg-zinc-200 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 h-11 rounded-2xl bg-white border border-zinc-200 animate-pulse" />
        <div className="flex-1 h-11 rounded-2xl bg-white border border-zinc-200 animate-pulse" />
        <div className="w-full sm:w-[130px] h-11 rounded-2xl bg-white border border-zinc-200 animate-pulse" />
      </div>

      {/* History Cards skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-[24px] border border-zinc-100 p-5 shadow-[0_1px_6px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between gap-4"
          >
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <div className="h-4 w-16 rounded bg-zinc-200 animate-pulse" />
                <div className="h-4 w-16 rounded bg-zinc-200 animate-pulse" />
              </div>
              <div className="h-5 w-2/3 rounded bg-zinc-200 animate-pulse" />
              <div className="h-4 w-1/3 rounded bg-zinc-200 animate-pulse" />
              <div className="flex gap-3">
                <div className="h-3.5 w-20 rounded bg-zinc-200 animate-pulse" />
                <div className="h-3.5 w-20 rounded bg-zinc-200 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 shrink-0">
              <div className="space-y-1 text-right">
                <div className="h-3 w-8 rounded bg-zinc-200 animate-pulse ml-auto" />
                <div className="h-6 w-14 rounded bg-zinc-200 animate-pulse ml-auto" />
              </div>
              <div className="h-8 w-20 rounded-xl bg-zinc-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
