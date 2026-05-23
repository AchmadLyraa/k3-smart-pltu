"use client";

import { useState } from "react";
import { updateUserProfile } from "@/app/actions/users";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface UserEditDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const inputStyleClass =
  "w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm";

export default function UserEditDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserEditDialogProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [nip, setNip] = useState(user?.nip || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateUserProfile(user.id, {
        name: name || undefined,
        email: email || undefined,
        nip: nip || undefined,
      });

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Data pengguna berhasil diperbarui",
        });
        onSuccess();
      } else {
        toast({
          title: "Gagal",
          description: result.error || "Gagal memperbarui data pengguna",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui pengguna",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full max-h-screen overflow-y-auto rounded-[24px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Name</label>
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyleClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Email</label>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyleClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">NIP</label>
            <Input
              placeholder="Employee ID"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className={inputStyleClass}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-[24px] h-10 border-[#E2E8F0] hover:border-gray-300 transition-all font-semibold"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}