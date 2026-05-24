import { getWorkerMaterial } from "@/app/actions/worker";
import { notFound } from "next/navigation";
import WorkerQuizList from "@/components/worker/worker-quiz-list";

export default async function WorkerQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getWorkerMaterial(id);
  if (!result.success || !result.data) notFound();

  const material = result.data;
  const isComplete = material.progress?.[0]?.status === "COMPLETED";

  if (!isComplete) {
    return (
      <div className="h-[100dvh] px-2 w-full bg-zinc-50/40 flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="bg-white rounded-[28px] border border-zinc-200/50 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)] text-center max-w-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto border border-amber-100/60">
            <span className="text-2xl">📚</span>
          </div>
          <h2 className="text-lg font-black text-zinc-900">Materi Belum Selesai</h2>
          <p className="text-sm text-zinc-500 font-medium">
            Selesaikan materi terlebih dahulu sebelum mengerjakan quiz.
          </p>
          <a
            href={`/worker/materials/${id}`}
            className="inline-flex items-center justify-center w-full h-12 rounded-2xl font-black text-sm bg-zinc-950 hover:bg-zinc-900 text-white active:scale-[0.98] transition-all shadow-sm"
          >
            Kembali ke Materi
          </a>
        </div>
      </div>
    );
  }

  return (
    <WorkerQuizList
      quizConfigs={material.quizConfigs ?? []}
      onBack={`/worker/materials/${id}`}
    />
  );
}