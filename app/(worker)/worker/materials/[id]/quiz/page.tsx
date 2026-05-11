import { getWorkerMaterial } from "@/app/actions/worker";
import { notFound } from "next/navigation";
import WorkerQuizList from "@/components/worker/worker-quiz-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function WorkerQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ← await dulu
  const result = await getWorkerMaterial(id);
  if (!result.success || !result.data) notFound();

  const material = result.data;
  const isComplete = material.progress?.[0]?.status === "COMPLETED";

  if (!isComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href={`/worker/materials/${id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Materi
          </Button>
        </Link>
        <p className="text-muted-foreground">
          Selesaikan materi terlebih dahulu sebelum mengerjakan quiz.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/worker/materials/${id}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Materi
        </Button>
      </Link>
      <WorkerQuizList
        quizConfigs={material.quizConfigs ?? []}
        onBack={`/worker/materials/${id}`}
      />
    </div>
  );
}
