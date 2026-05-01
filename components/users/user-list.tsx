"use client";

import { useState, useCallback, useEffect } from "react";
import { getAllUsers } from "@/app/actions/users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserTable from "./user-table";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadUsers = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const result = await getAllUsers(page, 10);
      if (result.success) {
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
  }, [loadUsers]);

  const filteredUsers = users.filter(
    (user) =>
      searchQuery === "" ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Users Management</CardTitle>
            <CardDescription>Total Users: {pagination.total}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers(pagination.page)}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <UserTable
          users={filteredUsers}
          onRefresh={() => loadUsers(pagination.page)}
        />

        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadUsers(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadUsers(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || loading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
