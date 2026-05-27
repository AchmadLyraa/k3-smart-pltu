"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  registerUser,
  getUnitsForRegister,
  getDivisionsForRegister,
} from "@/app/actions/auth";

interface Unit {
  id: string;
  name: string;
  code: string;
}
interface Division {
  id: string;
  name: string;
  code: string;
}

export default function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nip: "",
    password: "",
    confirmPassword: "",
    unitId: "",
    divisionId: "",
  });

  const [units, setUnits] = useState<Unit[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load units saat mount
  useEffect(() => {
    getUnitsForRegister().then((res) => {
      if (res.success) setUnits(res.data);
    });
  }, []);

  // Load divisions saat unit dipilih
  useEffect(() => {
    if (!formData.unitId) {
      setDivisions([]);
      setFormData((prev) => ({ ...prev, divisionId: "" }));
      return;
    }
    getDivisionsForRegister(formData.unitId).then((res) => {
      if (res.success) setDivisions(res.data);
      setFormData((prev) => ({ ...prev, divisionId: "" }));
    });
  }, [formData.unitId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerUser({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        nip: formData.nip || undefined,
        unitId: formData.unitId || undefined,
        divisionId: formData.divisionId || undefined,
      });

      if (!result.success) {
        setError(result.error || "Registrasi gagal");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="space-y-2 text-center pb-2 pt-8">
          <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-red-500/20">
            <img
              src="/manifest/android-chrome-512x512.png"
              alt="K3 SMART"
              className="w-full h-full object-cover"
            />
          </div>

          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Daftar Akun
          </CardTitle>

          <CardDescription className="text-base text-gray-500">
            Bergabung ke platform pembelajaran keselamatan kerja
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Nama */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>

              <Input
                name="name"
                placeholder="Nama lengkap"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-12 rounded-xl border-gray-200 focus-visible:ring-red-500"
              />
            </div>

            {/* NIP */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                NIP{" "}
                <span className="text-xs text-muted-foreground">
                  (opsional)
                </span>
              </label>

              <Input
                name="nip"
                placeholder="Nomor Induk Pegawai"
                value={formData.nip}
                onChange={handleChange}
                disabled={isLoading}
                className="h-12 rounded-xl border-gray-200 focus-visible:ring-red-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>

              <Input
                name="email"
                type="email"
                placeholder="email@perusahaan.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-12 rounded-xl border-gray-200 focus-visible:ring-red-500"
              />
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Unit{" "}
                <span className="text-xs text-muted-foreground">
                  (opsional)
                </span>
              </label>

              <Select
                value={formData.unitId}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, unitId: val }))
                }
                disabled={isLoading || units.length === 0}
              >
                <SelectTrigger className="h-12 rounded-xl border-gray-200">
                  <SelectValue
                    placeholder={
                      units.length === 0 ? "Memuat..." : "Pilih unit"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Divisi */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Divisi{" "}
                <span className="text-xs text-muted-foreground">
                  (opsional)
                </span>
              </label>

              <Select
                value={formData.divisionId}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, divisionId: val }))
                }
                disabled={
                  isLoading || !formData.unitId || divisions.length === 0
                }
              >
                <SelectTrigger className="h-12 rounded-xl border-gray-200">
                  <SelectValue
                    placeholder={
                      !formData.unitId
                        ? "Pilih unit dulu"
                        : divisions.length === 0
                          ? "Tidak ada divisi"
                          : "Pilih divisi"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {divisions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>

              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-12 rounded-xl border-gray-200 focus-visible:ring-red-500"
              />

              <p className="text-xs text-muted-foreground">
                Min 8 karakter, 1 huruf besar, 1 huruf kecil, 1 angka
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>

              <Input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-12 rounded-xl border-gray-200 focus-visible:ring-red-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-base font-semibold shadow-lg shadow-red-500/20"
            >
              {isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-red-600 transition-colors hover:text-red-700 hover:underline"
            >
              Masuk sekarang
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
