"use client";

import { useCallback, useEffect, useState } from "react";
import { 
  getRedemptions, 
  updateRedemptionShippingStatus,
  approveRedemption,
  rejectRedemption,
  completeRedemption
} from "@/app/actions/rewards";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Save, Check, X, CheckCircle2, Search, ChevronLeft, ChevronRight } from "lucide-react";

type RedemptionItem = {
  id: string;
  status: string;
  shippingStatus?: string | null;
  pointsUsed: number;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  completedAt?: string | Date | null;
  user: {
    id: string;
    name?: string | null;
    email: string;
    nip?: string | null;
  };
  reward: {
    id: string;
    name: string;
    pointCost: number;
  };
};

export default function RewardRedemptionList() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const loadRedemptions = useCallback(async (targetPage: number = 1, searchTerm: string = "") => {
    setLoading(true);
    setError(null);

    try {
      const result = await getRedemptions(targetPage, 20, searchTerm);

        if (result.success) {
          const items = result.data ?? [];
          setRedemptions(items);
          if (result.pagination) {
            setPagination(result.pagination);
          }
          setPage(targetPage);

        const nextDrafts: Record<string, string> = {};
        items.forEach((item: RedemptionItem) => {
          nextDrafts[item.id] = item.shippingStatus || "Sedang diproses";
        });
        setDrafts(nextDrafts);
      } else {
        setError(result.error || "Failed to load redemptions");
      }
    } catch (err) {
      console.error("Error fetching redemptions:", err);
      setError("An error occurred while loading redemptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRedemptions(1, debouncedSearch);
  }, [loadRedemptions, debouncedSearch]);

  const handleSave = async (redemptionId: string) => {
    const shippingStatus = drafts[redemptionId]?.trim();

    if (!shippingStatus) {
      toast({
        title: "Gagal",
        description: "Status pengiriman tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setSavingId(redemptionId);
    try {
      const result = await updateRedemptionShippingStatus(redemptionId, shippingStatus);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: result.message || "Status pengiriman berhasil diperbarui",
        });
        await loadRedemptions(page, debouncedSearch);
      } else {
        toast({
          title: "Gagal",
          description: result.error || "Gagal memperbarui status pengiriman",
          variant: "destructive",
        });
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleApprove = async (redemptionId: string) => {
    if (!confirm("Setujui penukaran reward ini?")) return;

    setSavingId(redemptionId);
    try {
      const result = await approveRedemption(redemptionId);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Penukaran reward berhasil disetujui",
        });
        await loadRedemptions(page, debouncedSearch);
      } else {
        toast({
          title: "Gagal",
          description: result.error || "Gagal menyetujui penukaran",
          variant: "destructive",
        });
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleReject = async (redemptionId: string) => {
    const reason = prompt("Alasan penolakan (poin akan dikembalikan ke user):");
    if (reason === null) return;
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Alasan penolakan wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setSavingId(redemptionId);
    try {
      const result = await rejectRedemption(redemptionId, reason);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Penukaran reward ditolak dan poin dikembalikan",
        });
        await loadRedemptions(page, debouncedSearch);
      } else {
        toast({
          title: "Gagal",
          description: result.error || "Gagal menolak penukaran",
          variant: "destructive",
        });
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleComplete = async (redemptionId: string) => {
    if (!confirm("Tandai pengiriman reward ini sudah selesai/diterima?")) return;

    setSavingId(redemptionId);
    try {
      const result = await completeRedemption(redemptionId);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Penukaran reward telah selesai",
        });
        await loadRedemptions(page, debouncedSearch);
      } else {
        toast({
          title: "Gagal",
          description: result.error || "Gagal menyelesaikan penukaran",
          variant: "destructive",
        });
      }
    } finally {
      setSavingId(null);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-[24px] shadow-sm border border-red-200 p-6">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6">
      <div className="mb-4">
        <h2 className="text-[15px] font-bold text-black">Status Pengiriman Hadiah</h2>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4 relative">
        <div className="relative flex-1">
          <Input
            placeholder="Cari Nama"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-4 pr-12 rounded-[24px] border-[#E2E8F0] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 text-sm"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => loadRedemptions(page, debouncedSearch)} disabled={loading} className="rounded-full w-12 h-12 flex-shrink-0">
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Memuat data pengiriman reward...
          </div>
        ) : redemptions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Belum ada data redemption reward.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-[12px] border border-slate-100 pb-2">
              <table className="w-full text-sm">
                <thead className="bg-[#FFF0EE] text-[#E74C3C] font-semibold">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold rounded-tl-[12px]">PIC</th>
                    <th className="text-left py-4 px-6 font-semibold">Hadiah</th>
                    <th className="text-center py-4 px-6 font-semibold">Status transaksi</th>
                    <th className="text-center py-4 px-6 font-semibold">Status Pengiriman</th>
                    <th className="text-center py-4 px-6 font-semibold">Terakhir Update</th>
                    <th className="text-center py-4 px-6 font-semibold rounded-tr-[12px]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-medium leading-none">
                            {item.user.name || item.user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.user.email}</p>
                          {item.user.nip && (
                            <p className="text-xs text-muted-foreground">NIP: {item.user.nip}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-medium leading-none text-gray-700">{item.reward.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.pointsUsed.toLocaleString("id-ID")} poin
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge 
                          className={
                            item.status === "COMPLETED" 
                              ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" 
                              : item.status === "Disetujui"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"
                                : item.status === "Ditolak"
                                  ? "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                          }
                          variant="outline"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Input
                          value={drafts[item.id] ?? ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          placeholder="Contoh: sedang dikirimkan"
                          className="min-w-[220px]"
                        />
                      </td>
                      <td className="py-4 px-6 text-center text-sm text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                                onClick={() => handleApprove(item.id)}
                                disabled={savingId === item.id}
                                title="Disetujui"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 w-8 p-0"
                                onClick={() => handleReject(item.id)}
                                disabled={savingId === item.id}
                                title="Ditolak"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {item.status === "APPROVED" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 h-8 w-8 p-0"
                              onClick={() => handleComplete(item.id)}
                              disabled={savingId === item.id}
                              title="Selesaikan"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handleSave(item.id)}
                            disabled={savingId === item.id}
                            title="Update Status Pengiriman"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.total > 0 && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages || 1}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadRedemptions(Math.max(1, page - 1), debouncedSearch)}
                    disabled={page === 1 || loading}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => loadRedemptions(Math.min(pagination.pages, page + 1), debouncedSearch)}
                    disabled={page >= pagination.pages || loading}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
    </div>
  );
}
