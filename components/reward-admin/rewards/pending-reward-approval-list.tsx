"use client";

import { useEffect, useState } from "react";
import { approveReward, getPendingRewards, rejectReward } from "@/app/actions/rewards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";

interface PendingRewardApprovalListProps {
  onRefresh?: () => void;
}

interface PendingRewardItem {
  id: string;
  name: string;
  description: string | null;
  pointCost: number;
  quantity: number;
  status: string;
  approvalNotes: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PendingRewardApprovalList({
  onRefresh,
}: PendingRewardApprovalListProps) {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<PendingRewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedReward, setSelectedReward] = useState<PendingRewardItem | null>(null);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");

  const fetchPendingRewards = async () => {
    setLoading(true);
    try {
      const result = await getPendingRewards(page, 10);
      if (result.success) {
        setRewards(result.data || []);
        setPagination(result.pagination);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load pending rewards",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching pending rewards:", error);
      toast({
        title: "Error",
        description: "An error occurred while loading pending rewards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openDialog = (reward: PendingRewardItem, mode: "approve" | "reject") => {
    setSelectedReward(reward);
    setDialogMode(mode);
    setNotes(mode === "reject" ? "" : reward.approvalNotes || "");
  };

  const closeDialog = () => {
    setSelectedReward(null);
    setDialogMode(null);
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!selectedReward || !dialogMode) {
      return;
    }

    setSubmitting(true);
    try {
      const result =
        dialogMode === "approve"
          ? await approveReward(selectedReward.id, notes)
          : await rejectReward(selectedReward.id, notes);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Reward berhasil diproses",
        });
        closeDialog();
        await fetchPendingRewards();
        onRefresh?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal memproses reward",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing reward approval:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing reward approval",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Reward Masuk</CardTitle>
        <CardDescription>
          Daftar reward yang diajukan reward admin dan menunggu persetujuan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : rewards.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">Tidak ada reward pending.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{reward.name}</h3>
                      <Badge variant="secondary">PENDING</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                      {reward.description || "-"}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Poin: {reward.pointCost}</span>
                      <span>Qty: {reward.quantity}</span>
                      <span>Dibuat: {new Date(reward.createdAt).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => openDialog(reward, "approve")}
                      disabled={submitting}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => openDialog(reward, "reject")}
                      disabled={submitting}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {pagination && pagination.pages > 1 && (
              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages} (Total: {pagination.total})
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "approve" ? "Approve Reward" : "Reject Reward"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "approve"
                ? "Tambahkan catatan jika perlu sebelum menyetujui reward ini."
                : "Tuliskan alasan penolakan reward ini."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="approval-notes">
              {dialogMode === "approve" ? "Notes Approval" : "Alasan Reject"}
            </Label>
            <Textarea
              id="approval-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={
                dialogMode === "approve"
                  ? "Catatan tambahan approval (opsional)"
                  : "Contoh: data reward belum lengkap, deskripsi kurang jelas, dll."
              }
              rows={4}
              disabled={submitting}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>
              Batal
            </Button>
            <Button
              variant={dialogMode === "approve" ? "default" : "destructive"}
              onClick={handleSubmit}
              disabled={submitting || !selectedReward}
            >
              {submitting
                ? "Processing..."
                : dialogMode === "approve"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
