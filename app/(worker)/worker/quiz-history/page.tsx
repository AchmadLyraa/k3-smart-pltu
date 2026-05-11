import { getWorkerQuizHistory } from "@/app/actions/worker";
import WorkerQuizHistoryList from "@/components/worker/worker-quiz-history-list";

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quiz History</h1>

        <p className="text-muted-foreground">
          Riwayat seluruh quiz yang pernah Anda kerjakan
        </p>
      </div>

      <WorkerQuizHistoryList histories={histories} stats={stats} />
    </div>
  );
}
