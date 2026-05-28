"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { getAllUsers } from "@/app/actions/users";
import { Input } from "@/components/ui/input";
import UserTable from "./user-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface UserListProps {
  refreshTrigger?: number;
}

export default function UserList({ refreshTrigger = 0 }: UserListProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const loadUsers = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const result = await getAllUsers(page, 10);
      if (result.success && result.data && result.pagination) {
        setUsers(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers, refreshTrigger]);

  const filteredUsers = useMemo(() => users.filter(
    (user) =>
      debouncedSearch === "" ||
      user.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearch.toLowerCase()),
  ), [users, debouncedSearch]);

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6">
      <div className="mb-6 relative">
        <Input
          placeholder="Cari Nama atau Email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-4 pr-12 rounded-[24px] border-[#E2E8F0] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 text-sm"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" strokeWidth={1.5} />
        </div>
      </div>

      <UserTable
        users={filteredUsers}
        onRefresh={() => loadUsers(pagination.page)}
      />

      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.pages || 1}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => loadUsers(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => loadUsers(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages || loading}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
