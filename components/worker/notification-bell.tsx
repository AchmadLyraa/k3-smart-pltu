"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const result = await getUnreadNotificationCount();
      if (result.success) setUnreadCount(result.data);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const result = await getNotifications(1, 5);
      if (result.success) {
        // Bell dropdown hanya tampil yang PENDING
        setNotifications(
          result.data.filter((n: any) => n.status === "PENDING"),
        );
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (open) {
      await loadNotifications(); // load dulu yang pending
      if (unreadCount > 0) {
        await markAllNotificationsAsRead();
        setUnreadCount(0);
      }
    }
  };

  useEffect(() => {
    loadUnreadCount();
    loadNotifications();

    const interval = setInterval(() => {
      loadUnreadCount();
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
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
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-semibold">
          Notifikasi
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Tidak ada notifikasi
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              >
                <div className="flex gap-2 w-full">
                  <span className="text-lg">
                    {getNotificationIcon(notif.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {notif.subject}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>
                    {notif.material && (
                      <p className="text-xs text-blue-600 mt-1">
                        📚 {notif.material.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
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
        <DropdownMenuItem asChild>
          <Link
            href="/worker/notifications"
            className="text-center justify-center"
          >
            Lihat Semua Notifikasi
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
