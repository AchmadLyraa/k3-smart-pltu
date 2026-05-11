import { getWorkerMaterial } from "@/app/actions/worker";
import { checkAndSubmitExpiredSessions } from "@/app/actions/worker";
import { notFound } from "next/navigation";
import WorkerMaterialView from "@/components/worker/worker-material-view";

export default async function WorkerMaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await checkAndSubmitExpiredSessions();
  const result = await getWorkerMaterial(id);

  if (!result.success || !result.data) notFound();

  return <WorkerMaterialView material={result.data} />;
}
