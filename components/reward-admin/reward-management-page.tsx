"use client";

import { useState } from "react";
import CreateRewardForm from "@/components/reward-admin/rewards/create-reward-form";
import RewardList from "@/components/reward-admin/rewards/reward-list";
import RewardRedemptionList from "@/components/reward-admin/redemptions/reward-redemption-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function RewardManagementPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleRewardCreated = () => {
    // Trigger RewardList to refetch
    setRefreshTrigger((prev) => prev + 1);
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="sa-welcome mb-8">
        <div>
          <h1 className="sa-welcome__title">Manajemen Hadiah</h1>
          <p className="sa-welcome__subtitle">
            Buat reward baru dan kelola daftar reward yang tersedia
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[20px] px-6 h-10 shadow-sm transition-all font-semibold">
              <Plus className="w-5 h-5 mr-1" strokeWidth={3} /> Tambah
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <CreateRewardForm onSuccess={handleRewardCreated} />
          </DialogContent>
        </Dialog>
      </div>
      <RewardList refreshTrigger={refreshTrigger} />
      <RewardRedemptionList />
    </div>
  );
}
