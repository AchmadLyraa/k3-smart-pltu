"use client";

import { useState, useEffect } from "react";

import { updateUserProfile } from "@/app/actions/users";
import { getUnits, getDivisions } from "@/app/actions/master-data";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");

  const [role, setRole] = useState("WORKER");
  const [status, setStatus] = useState("ACTIVE");

  const [unitId, setUnitId] = useState("");
  const [divisionId, setDivisionId] = useState("");

  const [units, setUnits] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const loadMasterData = async () => {
      const [unitsRes, divisionsRes] = await Promise.all([
        getUnits(),
        getDivisions(),
      ]);

      if (unitsRes.success) {
        setUnits(unitsRes.data || []);
      }

      if (divisionsRes.success) {
        setDivisions(divisionsRes.data || []);
      }
    };

    loadMasterData();
  }, []);

  useEffect(() => {
    if (user && open) {
      setName(user.name || "");
      setEmail(user.email || "");
      setNip(user.nip || "");

      setRole(user.role || "WORKER");
      setStatus(user.status || "ACTIVE");

      setUnitId(user.unitId || "");
      setDivisionId(user.divisionId || "");
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await updateUserProfile(user.id, {
        name: name || undefined,
        email: email || undefined,
        nip: nip || undefined,
        unitId: unitId || undefined,
        divisionId: divisionId || undefined,
        role,
        status,
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
          <DialogTitle className="text-xl font-bold text-slate-900">
            Edit User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Nama
            </label>

            <Input
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyleClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Email
            </label>

            <Input
              type="email"
              placeholder="Alamat email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyleClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              NIP
            </label>

            <Input
              placeholder="Nomor induk pegawai"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className={inputStyleClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Role
            </label>

            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className={inputStyleClass}>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>

                <SelectItem value="HSE_ADMIN">HSE_ADMIN</SelectItem>

                <SelectItem value="REWARD_ADMIN">REWARD_ADMIN</SelectItem>

                <SelectItem value="WORKER">WORKER</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Status
            </label>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className={inputStyleClass}>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>

                <SelectItem value="INACTIVE">INACTIVE</SelectItem>

                <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Unit
            </label>

            <Select
              value={unitId || undefined}
              onValueChange={(value) => {
                setUnitId(value);
                setDivisionId("");
              }}
            >
              <SelectTrigger className={inputStyleClass}>
                <SelectValue placeholder="Pilih unit" />
              </SelectTrigger>

              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Divisi
            </label>

            <Select
              value={divisionId || undefined}
              onValueChange={setDivisionId}
            >
              <SelectTrigger className={inputStyleClass}>
                <SelectValue placeholder="Pilih divisi" />
              </SelectTrigger>

              <SelectContent>
                {divisions
                  .filter((division) => division.unitId === unitId)
                  .map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
