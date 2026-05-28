import { getWorkerMaterialsByPeriod } from "@/app/actions/academic-period";
import WorkerMaterialList from "@/components/worker/worker-material-list";

export const metadata = {
  title: "Materi - K3 SMART",
};

export default async function MaterialsPage() {
  // Ambil data asli dari server action
  const materialsResult = await getWorkerMaterialsByPeriod();

  const periods: any[] = materialsResult.success && materialsResult.data?.periods
    ? materialsResult.data.periods
    : [];

  return (
    <div className="mx-auto max-w-md h-auto pb-24 font-sans antialiased overflow-x-hidden">
      <WorkerMaterialList periods={periods} unassigned={[]} />
    </div>
  );
}