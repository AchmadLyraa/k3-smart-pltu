"use client";

import { useState } from "react";
import { createReward } from "@/app/actions/rewards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CreateRewardFormProps {
  onSuccess?: () => void;
}

const inputStyleClass =
  "w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm";

const textareaStyleClass =
  "w-full rounded-[24px] px-5 py-3 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm";

export default function CreateRewardForm({ onSuccess }: CreateRewardFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pointCost: "",
    quantity: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await createReward({
        name: formData.name,
        description: formData.description || undefined,
        pointCost: parseInt(formData.pointCost),
        quantity: parseInt(formData.quantity),
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Reward berhasil dibuat",
        });
        setFormData({
          name: "",
          description: "",
          pointCost: "",
          quantity: "",
        });
        onSuccess?.();
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
      console.error("Error creating reward:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating reward",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-slate-700">Nama Reward *</label>
          <Input
            name="name"
            placeholder="misal: iPhone 15 Pro"
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
          <label className="block text-sm font-medium mb-1.5 text-slate-700">Harga Poin *</label>
          <Input
            name="pointCost"
            type="number"
            placeholder="misal: 1000"
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
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-slate-700">Deskripsi</label>
        <Textarea
          name="description"
          placeholder="Deskripsi detail reward..."
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

      <div>
        <label className="block text-sm font-medium mb-1.5 text-slate-700">Jumlah Stok *</label>
        <Input
          name="quantity"
          type="number"
          placeholder="misal: 10"
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

      <div className="rounded-[24px] border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground text-center">
        Reward yang dibuat akan langsung tersedia (Available) untuk ditukar.
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-[24px] h-10 border-[#E2E8F0] hover:border-gray-300 transition-all font-semibold"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold"
        >
          {loading ? "Loading..." : "Tambah Reward"}
        </Button>
      </div>
    </form>
  );
}