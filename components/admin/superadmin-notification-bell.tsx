"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
} from "@/app/actions/notification";

interface Notification {
  id: string;
  type: string;
  subject: string;
  message: string;
  createdAt: Date;
  material?: { id: string; title: string } | null;
}

export function SuperAdminNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const result = await getUnreadNotificationCount();
      if (result.success && typeof result.data === "number") {
        setUnreadCount(result.data);
      }
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const result = await getNotifications(1, 5);
      if (result.success && result.data) {
        // Dropdown only shows PENDING notifications
        setNotifications(
          result.data.filter((n: any) => n.status === "PENDING")
        );
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (open) {
      await loadUnreadCount();
      await loadNotifications();
      if (unreadCount > 0) {
        await markAllNotificationsAsRead();
        setUnreadCount(0);
      }
    }
  };

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_MATERIAL":
        return "📚";
      case "QUIZ_REMINDER":
        return "⏰";
      case "QUIZ_AVAILABLE":
        return "📝";
      default:
        return "📢";
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className="sa-header__icon-btn relative" title="Notifications">
          <Bell size={18} style={{ color: "var(--sa-primary, #E74C3C)" }} />
          {unreadCount > 0 && (
            <span className="sa-header__notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 super-admin-layout">
        <DropdownMenuLabel className="font-semibold text-sm px-4 py-2 text-slate-800">
          Notifikasi
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Tidak ada notifikasi baru
            </div>
          ) : (
            notifications.map((notif: any) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-red-50/50 focus:bg-red-50/50"
              >
                <div className="flex gap-2 w-full">
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">
                      {notif.subject}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    {notif.material && (
                      <p className="text-xs text-red-600 mt-1 font-medium hover:underline">
                        📚 {notif.material.title}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="text-center justify-center p-2.5">
          <Link
            href="/admin/notifications"
            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline w-full text-center block"
          >
            Lihat Semua Notifikasi
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
