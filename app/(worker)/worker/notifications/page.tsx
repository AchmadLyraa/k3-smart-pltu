"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft, Trash2 } from "lucide-react";
import {
  getNotifications,
  deleteNotification,
  deleteAllNotifications,
} from "@/app/actions/notification";

interface Notification {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  material?: { id: string; title: string } | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const loadNotifications = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const result = await getNotifications(page, 20);
      if (result.success) {
        setNotifications(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteNotification(id);
    if (result.success) {
      // Hapus dari state langsung tanpa refetch
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Hapus semua notifikasi?")) return;
    setIsDeletingAll(true);
    const result = await deleteAllNotifications();
    if (result.success) {
      setNotifications([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    }
    setIsDeletingAll(false);
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      NEW_MATERIAL: "📚",
      QUIZ_REMINDER: "⏰",
      QUIZ_AVAILABLE: "📝",
      ACHIEVEMENT: "🏆",
      REWARD: "🎁",
    };
    return icons[type] || "📢";
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "NEW_MATERIAL":
        return "bg-blue-50 border-blue-200";
      case "QUIZ_REMINDER":
      case "QUIZ_AVAILABLE":
        return "bg-amber-50 border-amber-200";
      case "ACHIEVEMENT":
      case "REWARD":
        return "bg-green-50 border-green-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/worker/home">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Notifikasi</h1>
              <p className="text-muted-foreground">
                Total: {pagination.total} notifikasi
              </p>
            </div>
          </div>

          {/* Hapus Semua */}
          {notifications.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeletingAll ? "Menghapus..." : "Hapus Semua"}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Memuat notifikasi...
                </p>
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Tidak ada notifikasi
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`border ${getNotificationColor(notif.type)}`}
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <span className="text-3xl flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {notif.subject}
                          </h3>
                          <Badge variant="outline" className="mt-1">
                            {notif.type.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notif.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                          {/* Tombol hapus per notif */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(notif.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        {notif.message}
                      </p>
                      {notif.material && (
                        <Link href="/worker/materials">
                          <Button variant="outline" size="sm" className="gap-1">
                            Lihat Materi: {notif.material.title}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted-foreground">
              Halaman {pagination.page} dari {pagination.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => loadNotifications(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoading}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={() => loadNotifications(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages || isLoading}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
