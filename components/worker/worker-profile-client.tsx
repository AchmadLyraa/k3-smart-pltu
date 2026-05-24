"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, ChevronRight, Lock, LogOut, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/app/actions/users";
import { useToast } from "@/hooks/use-toast";

interface UserDataProps {
  name: string;
  email: string;
  nip?: string;
  division?: string;
  unit?: string;
  currentSemester: number;
  earnedPoints: number;
  availablePoints: number;
  progressSteps: boolean[];
}

interface WorkerProfileClientProps {
  user: UserDataProps;
}

const inputStyleClass =
  "w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm";

export default function WorkerProfileClient({ user }: WorkerProfileClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();

  // Change password state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Membuat inisial nama secara aman jika data nama kosong
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.oldPassword.trim()) {
      setPasswordError("Password lama wajib diisi");
      return;
    }
    if (!passwordForm.newPassword.trim()) {
      setPasswordError("Password baru wajib diisi");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Password baru tidak cocok");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password minimal 8 karakter");
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await changePassword(
        session?.user?.id ?? "",
        passwordForm.oldPassword,
        passwordForm.newPassword,
      );

      if (result.success) {
        setPasswordSuccess("Password berhasil diubah!");
        setTimeout(() => {
          setShowPasswordDialog(false);
          setPasswordSuccess("");
          setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        }, 2000);
      } else {
        setPasswordError(result.error || "Gagal mengubah password");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto space-y-6 px-2 pt-0 pb-24 animate-in fade-in duration-300">
        
        {/* SEKSI 1: REAL USER HEADER */}
        <div className="flex items-center gap-4 pt-2">
          <div className="relative">
            <Avatar className="w-20 h-20 ring-2 ring-emerald-500/20 bg-white shadow-sm">
              <AvatarFallback className="text-xl font-black bg-zinc-100 text-zinc-700">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 space-y-0.5">
            <h2 className="text-base font-black text-zinc-900 truncate tracking-tight">
              {user.name}
            </h2>
            <p className="text-xs font-semibold text-zinc-400 truncate">
              {user.email}
            </p>
            
            {user.nip && (
              <p className="text-[10px] font-mono text-zinc-400 font-bold bg-zinc-100 px-1.5 py-0.5 rounded w-max mt-0.5">
                NIP: {user.nip}
              </p>
            )}
            
            {(user.division || user.unit) && (
              <p className="text-[11px] font-black text-zinc-500 uppercase tracking-wider pt-0.5 truncate">
                {user.division} {user.unit && `• ${user.unit}`}
              </p>
            )}
          </div>
        </div>

		{/* SEKSI 2: KARTU CAPAIAN SEMESTER & TIMELINE PROGRESS */}
		<div className="w-full bg-white rounded-[32px] border border-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden">
		  
		  <div className="grid grid-cols-2 text-center py-5 relative">
		    <div className="absolute top-4 bottom-4 left-1/2 w-[1px] bg-zinc-100 -translate-x-1/2" />

		    <div className="space-y-1">
		      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
		        Poin saya/Semester
		      </p>
		      <p className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
		        {user.earnedPoints}
		      </p>
		    </div>

		    <div className="space-y-1">
		      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
		        Saldo Poin
		      </p>
		      <p className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
		        {user.availablePoints}
		      </p>
		    </div>
		  </div>

		  <div className="px-5 pb-5">
		    <button
		      onClick={() => router.push("/worker/reward-users")}
		      className="w-full py-2.5 rounded-2xl bg-[#FF3B30] hover:bg-[#d4422f] text-white text-xs font-extrabold uppercase tracking-wider transition-all active:scale-[0.97] shadow-md hover:shadow-lg"
		    >
		      Tukar Hadiah
		    </button>
		  </div>

		</div>

        {/* SEKSI 3: MENU NAVIGASI LIST */}
        <div className="w-full bg-white rounded-[28px] border border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] px-5 py-2 divide-y divide-zinc-100">
          
          <button
            onClick={() => router.push("/worker/quiz-history")}
            className="w-full flex items-center justify-between py-4 text-left group active:opacity-70 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 group-hover:bg-red-50 group-hover:text-[#FF3B30] transition-colors">
                <FileText className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-sm font-extrabold text-zinc-800 tracking-tight">
                Riwayat Quiz
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 stroke-[2.5]" />
          </button>

          <button
            onClick={() => setShowPasswordDialog(true)}
            className="w-full flex items-center justify-between py-4 text-left group active:opacity-70 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 group-hover:bg-red-50 group-hover:text-[#FF3B30] transition-colors">
                <Lock className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-sm font-extrabold text-zinc-800 tracking-tight">
                Ganti Kata Sandi
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 stroke-[2.5]" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between py-4 text-left group active:opacity-70 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 group-hover:bg-red-50 group-hover:text-[#FF3B30] transition-colors">
                <LogOut className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-sm font-extrabold text-zinc-800 tracking-tight">
                Keluar
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 stroke-[2.5]" />
          </button>

        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-lg w-full max-h-screen overflow-y-auto rounded-[24px] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Ganti Kata Sandi</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {passwordError && (
              <div className="rounded-[24px] bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="rounded-[24px] bg-green-50 border border-green-200 p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{passwordSuccess}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Password Lama</label>
              <Input
                type="password"
                placeholder="Masukkan password lama"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                }
                disabled={passwordLoading}
                className={inputStyleClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Password Baru</label>
              <Input
                type="password"
                placeholder="Masukkan password baru"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                disabled={passwordLoading}
                className={inputStyleClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Konfirmasi Password Baru</label>
              <Input
                type="password"
                placeholder="Konfirmasi password baru"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                disabled={passwordLoading}
                className={inputStyleClass}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-[24px] h-10 border-[#E2E8F0] hover:border-gray-300 transition-all font-semibold"
                onClick={() => setShowPasswordDialog(false)}
                disabled={passwordLoading}
              >
                Batal
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="flex-1 bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold"
              >
                {passwordLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}