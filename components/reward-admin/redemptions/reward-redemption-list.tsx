"use client";

import { useCallback, useEffect, useState } from "react";
import { getRedemptions, updateRedemptionShippingStatus } from "@/app/actions/rewards";
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
import { RefreshCw, Save } from "lucide-react";

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

  const loadRedemptions = useCallback(async (targetPage: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getRedemptions(targetPage, 20);

      if (result.success) {
        const items = result.data ?? [];
        setRedemptions(items);
        setPagination(result.pagination);
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
    loadRedemptions(1);
  }, [loadRedemptions]);

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
        await loadRedemptions(page);
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Status Pengiriman Reward</CardTitle>
            <CardDescription>
              Update status manual seperti sedang diproses, sedang dikirimkan, atau sudah diserahkan.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadRedemptions(page)} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
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
                        <Badge variant="outline">{item.status}</Badge>
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
                        <Button
                          size="sm"
                          onClick={() => handleSave(item.id)}
                          disabled={savingId === item.id}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {savingId === item.id ? "Menyimpan" : "Simpan"}
                        </Button>
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
                    onClick={() => loadRedemptions(Math.max(1, page - 1))}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadRedemptions(Math.min(pagination.pages, page + 1))}
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
