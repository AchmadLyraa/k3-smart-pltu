import { getAllTopics } from "@/app/actions/topic";
import { getMaterials } from "@/app/actions/content";
import { getQuestions } from "@/app/actions/quiz";
import { getAcademicPeriods } from "@/app/actions/academic-period";
import CMSTabsClient from "@/components/cms/cms-tabs-client";

export default async function CMSDashboard() {
  const topicsResult = await getAllTopics();
  const materialsResult = await getMaterials();
  const questionsResult = await getQuestions();
  // console.log("questionsResult:", questionsResult);
  // console.log("materialsResult:", materialsResult);
  const periodsResult = await getAcademicPeriods();

  const topics = topicsResult.success ? topicsResult.data : [];
  const materials = materialsResult.success ? materialsResult.data : [];
  const questions = questionsResult.success ? questionsResult.data : [];
  const periods = periodsResult.success ? periodsResult.data.periods : [];

  const unassignedMaterials = periodsResult.success
    ? periodsResult.data.unassigned
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Management System</h1>
        <p className="text-muted-foreground">
          Manage learning materials, questions, and quiz configurations
        </p>
      </div>

      <CMSTabsClient
        topics={topics}
        materials={materials}
        questions={questions}
        periods={periods}
        unassignedMaterials={unassignedMaterials}
      />
    </div>
  );
}
