"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CMSMaterialsTab from "@/components/cms/cms-materials-tab";
import CMSQuestionsTab from "@/components/cms/cms-questions-tab";
import CMSTopicsTab from "@/components/cms/cms-topics-tab";
import CMSPeriodicTab from "@/components/cms/cms-academic-periodic-tab";

export default function CMSTabsClient({
  topics,
  materials,
  questions,
  periods,
  unassignedMaterials,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") || "materials";

  return (
    <Tabs
      value={currentTab}
      onValueChange={(v) => router.push(`?tab=${v}`)}
      className="space-y-4"
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="materials">Materials</TabsTrigger>
        <TabsTrigger value="questions">Questions</TabsTrigger>
        <TabsTrigger value="topics">Topics</TabsTrigger>
        <TabsTrigger value="periods">Academic Periods</TabsTrigger>
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

      <TabsContent value="periods">
        <CMSPeriodicTab
          periods={periods}
          unassignedMaterials={unassignedMaterials}
        />
      </TabsContent>
    </Tabs>
  );
}
