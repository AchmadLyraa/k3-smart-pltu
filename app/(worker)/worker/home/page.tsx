import { auth } from "@/auth";
import { getWorkerStats, getWorkerMaterials } from "@/app/actions/worker";
import { getWorkerMaterialsByPeriod } from "@/app/actions/academic-period";
import WorkerDashboardClient from "@/components/worker/worker-dashboard-client";
import { checkAndSubmitExpiredSessions } from "@/app/actions/worker";

export const metadata = {
  title: "Beranda Worker - K3 SMART",
};

export default async function WorkerHomePage() {
  await checkAndSubmitExpiredSessions();

  const session = await auth();
  const userName = session?.user?.name ?? "Electricity Warrior";

  const statsResult = await getWorkerStats();
  const stats: any = statsResult.success ? statsResult.data : null;

  const materialsResult: any = await getWorkerMaterialsByPeriod();
  const periods = materialsResult.success ? materialsResult.data.periods ?? [] : [];

  const latestMaterialsResult: any = await getWorkerMaterials();
  const latestMaterials = latestMaterialsResult.success ? latestMaterialsResult.data ?? [] : [];

  return (
    <WorkerDashboardClient
      stats={stats}
      periods={periods}
      latestMaterials={latestMaterials}
      userName={userName}
    />
  );
}
