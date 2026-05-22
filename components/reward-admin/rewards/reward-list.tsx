"use client";

import { useEffect, useState } from "react";
import { getRewards } from "@/app/actions/rewards";
import RewardTable from "./reward-table";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface RewardListProps {
  refreshTrigger?: number;
}

export default function RewardList({ refreshTrigger = 0 }: RewardListProps) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRewards = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getRewards(page, 10);

      if (result.success && result.data) {
        setRewards(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
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

  const filteredRewards = rewards.filter((reward) =>
    searchQuery === "" ||
    reward.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h2 className="text-[15px] font-bold text-black">Daftar Hadiah</h2>
      </div>

      <div className="mb-6 relative">
        <Input
          placeholder="Cari Nama Hadiah"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-4 pr-12 rounded-[24px] border-[#E2E8F0] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 text-sm"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" strokeWidth={1.5} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          <RewardTable rewards={filteredRewards} onRefresh={fetchRewards} />
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages} (Total: {" "}
                {pagination.total})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
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
