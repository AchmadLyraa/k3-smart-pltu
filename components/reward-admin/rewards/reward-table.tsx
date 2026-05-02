"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import RewardEditDialog from "./reward-edit-dialog";
import RewardDeleteDialog from "./reward-delete-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Reward</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Point Cost</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">Tidak ada reward</p>
                </TableCell>
              </TableRow>
            ) : (
              rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell className="font-medium">{reward.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {reward.description || "-"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {reward.pointCost} pts
                  </TableCell>
                  <TableCell className="text-right">{reward.quantity}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        reward.status === "AVAILABLE" ? "default" : "secondary"
                      }
                    >
                      {reward.status === "AVAILABLE"
                        ? "Tersedia"
                        : "Tidak Tersedia"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(reward)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(reward)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedReward && (
        <>
          <RewardEditDialog
            reward={selectedReward}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onRefresh={onRefresh}
          />
          <RewardDeleteDialog
            reward={selectedReward}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onRefresh={onRefresh}
          />
        </>
      )}
    </>
  );
}
