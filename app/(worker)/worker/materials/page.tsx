import { getWorkerMaterialsByPeriod } from "@/app/actions/academic-period";
import { Card, CardContent } from "@/components/ui/card";
import WorkerMaterialList from "@/components/worker/worker-material-list";

export default async function WorkerMaterialsPage() {
  const result = await getWorkerMaterialsByPeriod();

  const periods = result.success ? result.data.periods : [];
  const unassigned = result.success ? result.data.unassigned : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Materials</h1>
        <p className="text-muted-foreground">
          Complete materials to earn points and improve your safety knowledge
        </p>
      </div>

      {periods.length > 0 || unassigned.length > 0 ? (
        <WorkerMaterialList periods={periods} unassigned={unassigned} />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No materials available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
