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
  const periodsData = periodsResult.success
    ? periodsResult.data ?? { periods: [], unassigned: [] }
    : { periods: [], unassigned: [] };

  const periods = periodsData.periods;
  const unassignedMaterials = periodsData.unassigned;

  return (
      <div className="mb-8">
        <div>
          <h1 className="sa-welcome__title">Content Management System</h1>
          <p className="sa-welcome__subtitle">Manajemen Konten K3 Smart</p>
        </div>

        <div className="mt-6">
          <CMSTabsClient
            topics={topics}
            materials={materials}
            questions={questions}
            periods={periods}
            unassignedMaterials={unassignedMaterials}
            tabTriggerClass="rounded-[24px]"
          />
        </div>
    </div>
  );
}
