"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import RewardEditDialog from "./reward-edit-dialog";
import RewardDeleteDialog from "./reward-delete-dialog";

interface RewardTableProps {
  rewards: any[];
  onRefresh?: () => void;
}

export default function RewardTable({ rewards, onRefresh }: RewardTableProps) {
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = (reward: any) => {
    setSelectedReward(reward);
    setEditDialogOpen(true);
  };

  const handleDelete = (reward: any) => {
    setSelectedReward(reward);
    setDeleteDialogOpen(true);
  };

  const handleStatusChange = async (rewardId: string, newStatus: string) => {
    // TODO: Implement status update
    console.log("Update status:", rewardId, newStatus);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Tersedia";
      case "PENDING":
        return "Pending Approval";
      case "REJECTED":
        return "Ditolak";
      case "DISCONTINUED":
        return "Tidak Tersedia";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      case "DISCONTINUED":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-[12px] border border-slate-100 pb-2">
        <table className="w-full text-sm">
          <thead className="bg-[#FFF0EE] text-[#E74C3C] font-semibold">
            <tr>
              <th className="text-left py-4 px-6 font-semibold rounded-tl-[12px]">Nama Hadiah</th>
              <th className="text-left py-4 px-6 font-semibold">Deskripsi</th>
              <th className="text-center py-4 px-6 font-semibold">Point</th>
              <th className="text-center py-4 px-6 font-semibold">Jumlah</th>
              <th className="text-center py-4 px-6 font-semibold">Status</th>
              <th className="text-left py-4 px-6 font-semibold rounded-tr-[12px]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rewards.length === 0 ? (
              <tr className="border-b border-gray-100">
                <td colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">Tidak ada hadiah</p>
                </td>
              </tr>
            ) : (
              rewards.map((reward) => (
                <tr key={reward.id} className="border-b border-gray-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-700">{reward.name}</td>
                  <td className="py-4 px-6 text-center text-gray-500">-</td>
                  <td className="py-4 px-6 text-gray-500 max-w-[200px] truncate">
                    {reward.description || "-"}
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-gray-700">
                    {reward.pointCost}
                  </td>
                  <td className="py-4 px-6 text-center text-gray-700">{reward.quantity}</td>
                  <td className="py-4 px-6 text-center text-gray-500">
                    {getStatusLabel(reward.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(reward)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Reward"
                      >
                        <Edit className="w-[18px] h-[18px]" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleDelete(reward)}
                        className="p-1.5 text-[#E74C3C] hover:bg-red-50 rounded transition-colors"
                        title="Delete Reward"
                      >
                        <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedReward && (
        <>
          <RewardEditDialog
            reward={selectedReward}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onRefresh={onRefresh || (() => {})}
          />
          <RewardDeleteDialog
            reward={selectedReward}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onRefresh={onRefresh || (() => {})}
          />
        </>
      )}
    </>
  );
}
