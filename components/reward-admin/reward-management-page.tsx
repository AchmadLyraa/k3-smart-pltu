"use client";

import { useState } from "react";
import CreateRewardForm from "@/components/reward-admin/rewards/create-reward-form";
import RewardList from "@/components/reward-admin/rewards/reward-list";
import RewardRedemptionList from "@/components/reward-admin/redemptions/reward-redemption-list";

export default function RewardManagementPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRewardCreated = () => {
    // Trigger RewardList to refetch
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 mt-8">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Reward</h1>
        <p className="text-muted-foreground mt-2">
          Buat reward baru dan kelola daftar reward yang tersedia
        </p>
      </div>

      <CreateRewardForm onSuccess={handleRewardCreated} />
      <RewardList refreshTrigger={refreshTrigger} />
      <RewardRedemptionList />
    </div>
  );
}
