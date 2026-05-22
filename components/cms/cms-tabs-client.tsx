"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Consistent tab styling classes
const tabTriggerClass = "data-[state=active]:bg-[#FF4B4B] data-[state=active]:text-white data-[state=active]:rounded-[20px] py-2 rounded-[20px]";

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
      <TabsList className="grid w-full grid-cols-4 gap-2">
        <TabsTrigger value="materials" className={tabTriggerClass}>Materials</TabsTrigger>
        <TabsTrigger value="questions" className={tabTriggerClass}>Questions</TabsTrigger>
        <TabsTrigger value="topics" className={tabTriggerClass}>Topics</TabsTrigger>
        <TabsTrigger value="periods" className={tabTriggerClass}>Academic Periods</TabsTrigger>
      </TabsList>

      <TabsContent value="materials" className="mt-2">
        <CMSMaterialsTab
          topics={topics}
          materials={materials}
          questions={questions}
        />
      </TabsContent>

      <TabsContent value="questions" className="mt-2">
        <CMSQuestionsTab questions={questions} />
      </TabsContent>

      <TabsContent value="topics" className="mt-2">
        <CMSTopicsTab initialTopics={topics} />
      </TabsContent>

      <TabsContent value="periods" className="mt-2">
        <CMSPeriodicTab
          periods={periods}
          unassignedMaterials={unassignedMaterials}
        />
      </TabsContent>
    </Tabs>
  );
}
