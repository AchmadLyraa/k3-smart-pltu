"use client";

import { useState } from "react";
import { updateReward } from "@/app/actions/rewards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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

const inputStyleClass =
  "w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm";

const textareaStyleClass =
  "w-full rounded-[24px] px-5 py-3 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm";

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
          const fieldErrors: Record<string, string> = {};
          Object.entries(result.errors).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              fieldErrors[key] = value[0];
            }
          });
          setErrors(fieldErrors);
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
      <DialogContent className="max-w-lg w-full max-h-screen overflow-y-auto rounded-[24px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Edit Reward</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Nama Reward</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={inputStyleClass}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1 ml-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Deskripsi</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={3}
              className={textareaStyleClass}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1 ml-1">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Harga Poin</label>
              <Input
                name="pointCost"
                type="number"
                value={formData.pointCost}
                onChange={handleChange}
                disabled={loading}
                min="0"
                className={inputStyleClass}
              />
              {errors.pointCost && (
                <p className="text-sm text-destructive mt-1 ml-1">{errors.pointCost}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Jumlah Stok</label>
              <Input
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                disabled={loading}
                min="0"
                className={inputStyleClass}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive mt-1 ml-1">{errors.quantity}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Status</label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Tersedia</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
                <SelectItem value="DISCONTINUED">Tidak Tersedia</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive mt-1 ml-1">{errors.status}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-[24px] h-10 border-[#E2E8F0] hover:border-gray-300 transition-all font-semibold"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold"
            >
              {loading ? "Loading..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}