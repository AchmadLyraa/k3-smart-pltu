"use client";

import { useEffect, useState } from "react";
import { getRewards } from "@/app/actions/rewards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateRewardForm from "@/components/reward-admin/rewards/create-reward-form";
import RewardAdminList from "@/components/reward-admin/rewards/reward-admin-list";

export default function RewardAdminPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRewardCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Reward</h1>
        <p className="text-muted-foreground mt-2">
          Buat reward baru dan kelola status reward yang sudah diajukan
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList>
          <TabsTrigger value="create">Buat Reward</TabsTrigger>
          <TabsTrigger value="list">Daftar Reward Saya</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <CreateRewardForm onSuccess={handleRewardCreated} />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <RewardAdminList refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
