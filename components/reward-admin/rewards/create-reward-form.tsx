"use client";

import { useState } from "react";
import { createReward } from "@/app/actions/rewards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CreateRewardFormProps {
  onSuccess?: () => void;
}

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
    // Clear error for this field
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
    <Card>
      <CardHeader>
        <CardTitle>Tambah Reward Baru</CardTitle>
        <CardDescription>
          Buat reward baru yang akan langsung tersedia untuk ditukar oleh worker.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Nama Reward */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Reward *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="misal: iPhone 15 Pro"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Point Cost */}
            <div className="space-y-2">
              <Label htmlFor="pointCost">Harga Poin *</Label>
              <Input
                id="pointCost"
                name="pointCost"
                type="number"
                value={formData.pointCost}
                onChange={handleChange}
                placeholder="misal: 1000"
                disabled={loading}
                min="0"
              />
              {errors.pointCost && (
                <p className="text-sm text-destructive">{errors.pointCost}</p>
              )}
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Deskripsi detail reward..."
              disabled={loading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Jumlah Stok *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="misal: 10"
              disabled={loading}
              min="0"
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity}</p>
            )}
          </div>

          <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">
            Reward yang dibuat akan langsung tersedia (Available) untuk ditukar.
          </div>

          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? "Loading..." : "Tambah Reward"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
