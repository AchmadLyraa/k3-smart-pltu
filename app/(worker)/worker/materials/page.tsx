import { getWorkerMaterials } from "@/app/actions/worker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WorkerMaterialList from "@/components/worker/worker-material-list";

export default async function WorkerMaterialsPage() {
  const materialsResult = await getWorkerMaterials();
  console.log(
    "materials:",
    JSON.stringify(materialsResult.data?.[0]?.mediaFiles, null, 2),
  );
  const materials = materialsResult.success ? materialsResult.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Materials</h1>
        <p className="text-muted-foreground">
          Complete materials to earn points and improve your safety knowledge
        </p>
      </div>

      {materials.length > 0 ? (
        <WorkerMaterialList materials={materials} />
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
