import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllTopics } from "@/app/actions/topic";
import CMSMaterialsTab from "@/components/cms/cms-materials-tab";
import CMSQuestionsTab from "@/components/cms/cms-questions-tab";
import CMSTopicsTab from "@/components/cms/cms-topics-tab";
import { getMaterials } from "@/app/actions/content";
import { getQuestions } from "@/app/actions/quiz";

export default async function CMSDashboard() {
  const topicsResult = await getAllTopics();
  const materialsResult = await getMaterials();
  const questionsResult = await getQuestions();
  // console.log("questionsResult:", questionsResult);
  // console.log("materialsResult:", materialsResult);

  const topics = topicsResult.success ? topicsResult.data : [];
  const materials = materialsResult.success ? materialsResult.data : [];
  const questions = questionsResult.success ? questionsResult.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Management System</h1>
        <p className="text-muted-foreground">
          Manage learning materials, questions, and quiz configurations
        </p>
      </div>

      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          <CMSMaterialsTab
            topics={topics}
            materials={materials}
            questions={questions}
          />
        </TabsContent>

        <TabsContent value="questions">
          <CMSQuestionsTab questions={questions} />
        </TabsContent>

        <TabsContent value="topics">
          <CMSTopicsTab initialTopics={topics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
