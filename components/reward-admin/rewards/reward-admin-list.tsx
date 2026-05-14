"use client";

import { useEffect, useState } from "react";
import { getRewards } from "@/app/actions/rewards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RewardAdminListProps {
  refreshTrigger?: number;
}

export default function RewardAdminList({ refreshTrigger = 0 }: RewardAdminListProps) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const fetchRewards = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getRewards(page, 10);

      if (result.success) {
        const filtered = filterStatus
          ? result.data.filter((r: any) => r.status === filterStatus)
          : result.data;
        setRewards(filtered);
        setPagination(result.pagination);
      } else {
        setError(result.error || "Gagal memuat reward");
      }
    } catch (err) {
      console.error("Error fetching rewards:", err);
      setError("Terjadi error saat memuat reward");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [page, refreshTrigger, filterStatus]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Tersedia";
      case "PENDING":
        return "Pending Approval";
      case "REJECTED":
        return "Ditolak";
      case "DISCONTINUED":
        return "Tidak Tersedia";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      case "DISCONTINUED":
        return "outline";
      default:
        return "secondary";
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
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Daftar Reward Saya</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(null)}
          >
            Semua
          </Button>
          <Button
            variant={filterStatus === "PENDING" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("PENDING")}
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === "AVAILABLE" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("AVAILABLE")}
          >
            Tersedia
          </Button>
          <Button
            variant={filterStatus === "REJECTED" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("REJECTED")}
          >
            Ditolak
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : rewards.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">Tidak ada reward</p>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Reward</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Point Cost</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibuat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell className="font-medium">{reward.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {reward.description || "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {reward.pointCost} pts
                      </TableCell>
                      <TableCell className="text-right">{reward.quantity}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(reward.status)}>
                          {getStatusLabel(reward.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(reward.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
