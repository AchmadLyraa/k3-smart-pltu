"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  getAcademicPeriodsForReset,
  resetSemesterByPeriod,
} from "@/app/actions/semester";

export default function SemesterResetDialog() {
  const [open, setOpen] = useState(false);
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadPeriods = async () => {
    setLoadingPeriods(true);
    const result = await getAcademicPeriodsForReset();
    if (result.success) setPeriods(result.data);
    setLoadingPeriods(false);
  };

  useEffect(() => {
    if (open) {
      loadPeriods();
      setSelectedPeriodId("");
      setMessage(null);
    }
  }, [open]);

  const handleReset = async () => {
    if (!selectedPeriodId) {
      setMessage({ type: "error", text: "Pilih academic period dulu" });
      return;
    }

    const period = periods.find((p) => p.id === selectedPeriodId);
    if (
      !confirm(
        `Yakin reset period "${period?.name}"? Aksi ini tidak bisa dibatalkan!`,
      )
    )
      return;

    setLoading(true);
    const result = await resetSemesterByPeriod(selectedPeriodId);
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: result.message });
      setTimeout(() => {
        setOpen(false);
        window.location.reload();
      }, 2000);
    } else {
      setMessage({ type: "error", text: result.error ?? "Reset gagal" });
    }
  };

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Reset Semester</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Semester</DialogTitle>
          <DialogDescription>
            Pilih academic period yang akan direset. Period yang sudah direset
            tidak akan muncul di daftar ini.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Aksi ini akan menghapus semua poin aktif pekerja dan tidak bisa
            diulang untuk period yang sama.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Academic Period</label>
            <Select
              value={selectedPeriodId}
              onValueChange={setSelectedPeriodId}
              disabled={loadingPeriods}
            >
              <SelectTrigger className="mt-1">
                <SelectValue
                  placeholder={loadingPeriods ? "Memuat..." : "Pilih period"}
                />
              </SelectTrigger>
              <SelectContent>
                {periods.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Tidak ada period tersedia
                  </SelectItem>
                ) : (
                  periods.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {p.isActive && " (Aktif)"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Info period yang dipilih */}
          {selectedPeriod && (
            <div className="rounded-lg border p-3 bg-muted/40 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Periode:</span>{" "}
                {new Date(selectedPeriod.startDate).toLocaleDateString("id-ID")}{" "}
                — {new Date(selectedPeriod.endDate).toLocaleDateString("id-ID")}
              </p>
              <p>
                <span className="text-muted-foreground">Status:</span>{" "}
                {selectedPeriod.isActive ? "Aktif" : "Tidak aktif"}
              </p>
              {/* Tambah info reset terakhir */}
              {selectedPeriod.lastResetAt ? (
                <p className="text-amber-700">
                  ⚠️ Pernah direset pada{" "}
                  {new Date(selectedPeriod.lastResetAt).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                  . Reset lagi hanya akan snapshot poin sejak tanggal tersebut.
                </p>
              ) : (
                <p className="text-green-700">✓ Belum pernah direset</p>
              )}
            </div>
          )}

          {message && (
            <Alert
              className={
                message.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  message.type === "success" ? "text-green-800" : "text-red-800"
                }
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={loading || !selectedPeriodId || periods.length === 0}
          >
            {loading ? "Memproses..." : "Konfirmasi Reset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
