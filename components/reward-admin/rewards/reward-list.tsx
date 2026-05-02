"use client";

import { useEffect, useState } from "react";
import { getRewards } from "@/app/actions/rewards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RewardTable from "./reward-table";
import { Spinner } from "@/components/ui/spinner";

interface RewardListProps {
  refreshTrigger?: number;
}

export default function RewardList({ refreshTrigger = 0 }: RewardListProps) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchRewards = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getRewards(page, 10);

      if (result.success) {
        setRewards(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.error || "Failed to load rewards");
      }
    } catch (err) {
      console.error("Error fetching rewards:", err);
      setError("An error occurred while loading rewards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [page, refreshTrigger]);

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
        <CardTitle>Daftar Reward</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            <RewardTable rewards={rewards} onRefresh={fetchRewards} />
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages} (Total: {" "}
                  {pagination.total})
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPage(Math.min(pagination.pages, page + 1))
                    }
                    disabled={page === pagination.pages}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
