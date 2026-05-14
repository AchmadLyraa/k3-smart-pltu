"use client";

import { useState } from "react";
import { updateReward } from "@/app/actions/rewards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface RewardEditDialogProps {
  reward: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export default function RewardEditDialog({
  reward,
  open,
  onOpenChange,
  onRefresh,
}: RewardEditDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: reward?.name || "",
    description: reward?.description || "",
    pointCost: reward?.pointCost?.toString() || "",
    quantity: reward?.quantity?.toString() || "",
    status: reward?.status || "AVAILABLE",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await updateReward(reward.id, {
        name: formData.name,
        description: formData.description || undefined,
        pointCost: parseInt(formData.pointCost),
        quantity: parseInt(formData.quantity),
        status: formData.status,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Reward berhasil diperbarui",
        });
        onOpenChange(false);
        onRefresh();
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error updating reward:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating reward",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Reward</DialogTitle>
          <DialogDescription>
            Ubah detail reward yang sudah ada
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Reward */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Reward</Label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Deskripsi</Label>
            <Textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description}
              </p>
            )}
          </div>

          {/* Point Cost */}
          <div className="space-y-2">
            <Label htmlFor="edit-pointCost">Harga Poin</Label>
            <Input
              id="edit-pointCost"
              name="pointCost"
              type="number"
              value={formData.pointCost}
              onChange={handleChange}
              disabled={loading}
              min="0"
            />
            {errors.pointCost && (
              <p className="text-sm text-destructive">{errors.pointCost}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="edit-quantity">Jumlah Stok</Label>
            <Input
              id="edit-quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              disabled={loading}
              min="0"
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="edit-status" disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending Approval</SelectItem>
                <SelectItem value="AVAILABLE">Tersedia</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
                <SelectItem value="DISCONTINUED">Tidak Tersedia</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
