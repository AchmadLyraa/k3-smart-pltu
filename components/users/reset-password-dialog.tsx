"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Copy,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { resetPassword } from "@/app/actions/users";
import { useToast } from "@/hooks/use-toast";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  onSuccess?: () => void;
}

const inputStyleClass =
  "w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm";

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ResetPasswordDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const response = await resetPassword(user.id);

      if (response.success) {
        setResult(response.data);
        toast({
          title: "Berhasil",
          description: "Password berhasil direset",
        });
      } else {
        setError(response.error || "Failed to reset password");
        toast({
          title: "Gagal",
          description: response.error || "Gagal mereset password",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.newPassword) {
      await navigator.clipboard.writeText(result.newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setLoading(false);
    setError("");
    setResult(null);
    setShowPassword(false);
    setCopied(false);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full max-h-screen overflow-y-auto rounded-[24px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Reset User Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Error Alert */}
          {error && (
            <div className="rounded-[24px] bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Before Reset - User Info & Button */}
          {!result && (
            <>
              <div className="rounded-[24px] bg-slate-50 border border-slate-100 p-5 space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">User Name</p>
                  <p className="font-medium text-slate-800">{user?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Email</p>
                  <p className="font-medium text-slate-800">{user?.email}</p>
                </div>
              </div>

              <div className="rounded-[24px] bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Password baru akan dibuat secara otomatis. Pastikan untuk menyalin dan membagikannya dengan user secara aman.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-[24px] h-10 border-[#E2E8F0] hover:border-gray-300 transition-all font-semibold"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* After Reset - Show Generated Password */}
          {result && (
            <>
              <div className="rounded-[24px] bg-green-50 border border-green-200 p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  Password berhasil di-reset. Salin dan bagikan password baru ini kepada user.
                </p>
              </div>

              <div className="rounded-[24px] bg-amber-50 border border-amber-200 p-5 space-y-3">
                <p className="text-sm font-medium text-amber-900">
                  Password Baru untuk {result.email}:
                </p>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={result.newPassword}
                      readOnly
                      className={`${inputStyleClass} bg-white font-mono text-sm pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCopy}
                    className={`rounded-[24px] h-11 px-5 shadow-sm transition-all font-semibold gap-2 ${
                      copied
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-[#FF4B4B] hover:bg-[#FF3333]"
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-xs text-amber-700 bg-white p-3 rounded-[16px] border border-amber-200 flex items-start gap-2">
                  ⚠️ Pastikan untuk menyimpan kata sandi ini di tempat yang aman. Pengguna akan menggunakannya untuk masuk.
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}