import { getWorkerQuizHistory } from "@/app/actions/worker";
import WorkerQuizHistoryList from "@/components/worker/worker-quiz-history-list";

export default async function WorkerHistoryPage() {
  const result = await getWorkerQuizHistory();

  const histories = result.success && result.data
    ? result.data.histories
    : [];

  const stats = result.success && result.data
    ? result.data.stats
    : {
        total: 0,
        passed: 0,
        failed: 0,
      };

  return (
    <div className="mx-auto max-w-7xl space-y-0 animate-in fade-in duration-500 pb-16">
      <WorkerQuizHistoryList histories={histories} stats={stats} />
    </div>
  );
}