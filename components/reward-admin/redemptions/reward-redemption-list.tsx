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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Save, Check, X, CheckCircle2 } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
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
      alert("Alasan penolakan wajib diisi");
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
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Status Pengiriman Reward</CardTitle>
            <CardDescription>
              Update status manual seperti sedang diproses, sedang dikirimkan, atau sudah diserahkan.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Cari user atau reward..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => loadRedemptions(page, debouncedSearch)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PIC</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Status Transaksi</TableHead>
                    <TableHead>Status Pengiriman</TableHead>
                    <TableHead>Terakhir Update</TableHead>
                    <TableHead className="w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium leading-none">
                            {item.user.name || item.user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.user.email}</p>
                          {item.user.nip && (
                            <p className="text-xs text-muted-foreground">NIP: {item.user.nip}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium leading-none">{item.reward.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.pointsUsed.toLocaleString("id-ID")} poin
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            item.status === "COMPLETED" 
                              ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" 
                              : item.status === "APPROVED"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"
                                : item.status === "REJECTED"
                                  ? "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                          }
                          variant="outline"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {item.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                                onClick={() => handleApprove(item.id)}
                                disabled={savingId === item.id}
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 w-8 p-0"
                                onClick={() => handleReject(item.id)}
                                disabled={savingId === item.id}
                                title="Reject"
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
                            title="Update Shipping Status"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination.pages > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages} (Total: {pagination.total})
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadRedemptions(Math.max(1, page - 1), debouncedSearch)}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadRedemptions(Math.min(pagination.pages, page + 1), debouncedSearch)}
                    disabled={page === pagination.pages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
