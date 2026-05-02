"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteReward } from "@/app/actions/rewards";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface RewardDeleteDialogProps {
  reward: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export default function RewardDeleteDialog({
  reward,
  open,
  onOpenChange,
  onRefresh,
}: RewardDeleteDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteReward(reward.id);

      if (result.success) {
        toast({
          title: "Success",
          description: "Reward berhasil dihapus",
        });
        onOpenChange(false);
        onRefresh();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting reward",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Reward</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus reward "{reward?.name}"? Tindakan
            ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? (
              "Loading..."
            ) : (
              <span className="inline-flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Hapus
              </span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
