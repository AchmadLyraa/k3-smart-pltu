import { getWorkerQuizHistory } from "@/app/actions/worker";
import WorkerQuizHistoryList from "@/components/worker/worker-quiz-history-list";
import { History, Sparkles } from "lucide-react";

export default async function WorkerHistoryPage() {
  const result = await getWorkerQuizHistory();

  const histories = result.success ? result.data.histories : [];

  const stats = result.success
    ? result.data.stats
    : {
        total: 0,
        passed: 0,
        failed: 0,
      };

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-500 pb-16">
      {/* Sleek Local Header */}
      <div className="flex flex-col gap-1 pb-4 border-b border-zinc-200/80">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-red-50 text-red-500 border border-red-100 shadow-sm">
            <History className="w-5 h-5" />
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase text-red-500 flex items-center gap-1">
            Riwayat K3 <Sparkles className="w-3 h-3 text-red-500 animate-pulse" />
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-950 mt-2" style={{ fontFamily: 'Buckin, sans-serif' }}>
          Riwayat Kuis
        </h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
          Pantau riwayat pengerjaan seluruh kuis keselamatan kerja Anda
        </p>
      </div>

      <WorkerQuizHistoryList histories={histories} stats={stats} />
    </div>
  );
}
