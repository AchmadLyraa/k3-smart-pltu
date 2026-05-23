"use client";

import { useState } from "react";
import { createUser } from "@/app/actions/users";
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

interface CreateUserFormProps {
  onSuccess?: () => void;
}

const inputStyleClass =
  "w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm";

export default function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("WORKER");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createUser({
        email,
        name,
        password,
        nip: nip || undefined,
        role: role as any,
      });

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Pengguna berhasil ditambahkan",
        });
        setName("");
        setEmail("");
        setPassword("");
        setNip("");
        setRole("WORKER");
        onSuccess?.();
      } else {
        toast({
          title: "Gagal",
          description: result.error || "Gagal menambahkan pengguna",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat pengguna",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-slate-700">Nama lengkap</label>
        <Input
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputStyleClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-slate-700">Email</label>
        <Input
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputStyleClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-slate-700">NIP (Opsional)</label>
        <Input
          placeholder="Employee ID"
          value={nip}
          onChange={(e) => setNip(e.target.value)}
          className={inputStyleClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-slate-700">Password</label>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputStyleClass}
        />
        <p className="text-xs text-muted-foreground mt-1 ml-1">
          Min 8 chars, 1 uppercase, 1 lowercase, 1 number
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-slate-700">Role</label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WORKER">Worker (Peserta Belajar)</SelectItem>
            <SelectItem value="HSE_ADMIN">HSE Admin (Materi & Quiz)</SelectItem>
            <SelectItem value="REWARD_ADMIN">Reward Admin (Reward & Redeem)</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin (Full Access)</SelectItem>
          </SelectContent>
        </Select>
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
          {loading ? "Menambahkan..." : "Tambah User"}
        </Button>
      </div>
    </form>
  );
}