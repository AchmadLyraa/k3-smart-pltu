"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      // console.log("result:", result);

      if (result?.error) {
        setError("Email atau password salah");
        return;
      }

      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const role = (session?.user as any)?.role;

      const roleRoutes: Record<string, string> = {
        SUPER_ADMIN: "/admin/dashboard",
        HSE_ADMIN: "/hse/dashboard",
        REWARD_ADMIN: "/reward/dashboard",
        WORKER: "/worker/home",
      };

      router.push(roleRoutes[role] ?? "/");
      router.refresh();
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-white overflow-hidden">
      {/* ─── Left Panel ─── */}
      <div className="relative w-[48%] min-h-screen shrink-0 max-lg:w-full max-lg:min-h-[320px] max-lg:h-[35vh] max-sm:min-h-[240px] max-sm:h-[28vh]">
        <div className="absolute top-[30px] left-[30px] bottom-[30px] w-[calc(100%+2vw)] rounded-[20%] overflow-hidden bg-red-500 max-lg:w-[120%] max-lg:left-[-10%] max-lg:rounded-[0_0_50%_50%]">
          <div className="absolute inset-[-20px] z-[1]">
            <Image
              src="/images/hero-login.png"
              alt="K3 Safety Worker"
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              priority
            />
          </div>
          <div className="absolute inset-0 z-[2] bg-gradient-to-br from-red-500/55 via-red-600/70 to-red-700/82" />
          <div className="absolute z-[3] flex flex-col items-start left-[10%] bottom-[32%] max-lg:left-1/2 max-lg:bottom-[20%] max-lg:-translate-x-1/2 max-lg:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logonew-k3-white.svg"
              alt="K3 Smart Logo"
              className="w-[250px] h-auto mb-3 max-lg:w-[220px] max-sm:w-[180px]"
            />
            <p className="text-[22px] font-normal text-white/95 max-sm:text-base">
              Belajar, Paham, Selamat!
            </p>
          </div>
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="flex-1 flex items-center justify-center p-[48px_60px] max-lg:p-[32px_24px_48px] max-sm:p-[24px_20px_40px]">
        <div className="w-full max-w-[460px]">
          <h1 className="text-[42px] font-bold text-[#1a1a1a] mb-11 text-center tracking-tight max-lg:text-[34px] max-lg:mb-7 max-sm:text-[28px] max-sm:mb-6">
            Masuk
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <Alert
                variant="destructive"
                className="rounded-2xl flex items-start gap-3 border-red-200 bg-red-50"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                <AlertDescription className="text-sm font-semibold text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* ── Email ── */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-[17px] font-bold text-gray-500 pl-2"
              >
                Email
              </label>
              <div className="relative flex items-center w-full">
                <input
                  id="email"
                  type="email"
                  className="peer w-full h-16 pl-[54px] pr-7 border-none rounded-[32px] bg-gray-100 text-[18px] text-[#1a1a1a] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] tracking-[0.4px] placeholder:text-gray-400 placeholder:text-[16px] focus:bg-white focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)_inset_0_2px_4px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed max-sm:h-[50px] max-sm:pl-[48px] max-sm:pr-5 max-sm:text-[15px]"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Mail className="absolute left-[22px] text-gray-400 w-5 h-5 pointer-events-none transition-colors peer-focus:text-red-500 max-sm:left-[18px] max-sm:w-[18px] max-sm:h-[18px]" />
              </div>
            </div>

            {/* ── Password ── */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-[17px] font-bold text-gray-500 pl-2"
              >
                Password
              </label>
              <div className="relative flex items-center w-full">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="peer w-full h-16 pl-[54px] pr-[54px] border-none rounded-[32px] bg-gray-100 text-[18px] text-[#1a1a1a] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] tracking-[0.4px] placeholder:text-gray-400 placeholder:text-[16px] focus:bg-white focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)_inset_0_2px_4px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed max-sm:h-[50px] max-sm:pl-[48px] max-sm:pr-[48px] max-sm:text-[15px]"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Lock className="absolute left-[22px] text-gray-400 w-5 h-5 pointer-events-none transition-colors peer-focus:text-red-500 max-sm:left-[18px] max-sm:w-[18px] max-sm:h-[18px]" />
                <button
                  type="button"
                  className="absolute right-4 bg-transparent border-none p-2 cursor-pointer text-gray-400 flex items-center justify-center rounded-full transition-colors hover:text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 max-sm:right-3"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  disabled={isLoading}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 max-sm:w-[18px] max-sm:h-[18px]" />
                  ) : (
                    <Eye className="w-5 h-5 max-sm:w-[18px] max-sm:h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              className="w-full h-[58px] mt-4 border-none rounded-[32px] bg-gradient-to-r from-red-500 to-red-600 text-white text-[22px] font-bold cursor-pointer shadow-[0_4px_16px_rgba(239,68,68,0.3)] tracking-[0.3px] transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-[0_6px_24px_rgba(239,68,68,0.4)] hover:-translate-y-px active:translate-y-0 active:shadow-[0_2px_8px_rgba(239,68,68,0.3)] disabled:opacity-70 disabled:cursor-not-allowed max-sm:h-[52px] max-sm:text-[18px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-[10px]">
                  <svg
                    className="w-[22px] h-[22px] animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="32"
                      strokeDashoffset="32"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="32;0;32"
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-red-600 transition-colors hover:text-red-700 hover:underline"
            >
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
