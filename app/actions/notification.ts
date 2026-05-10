"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NotificationStatus } from "@/prisma/generated/client";

export async function getNotifications(page = 1, limit = 10) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          type: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
          sentAt: true,
          material: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notificationLog.count({
        where: { userId: session.user.id },
      }),
    ]);

    return {
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getNotifications error]", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

// Unread = PENDING (belum dibaca)
export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const count = await prisma.notificationLog.count({
      where: {
        userId: session.user.id,
        status: "PENDING", // ← fix: PENDING = belum dibaca
      },
    });
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: "Failed to fetch count" };
  }
}

// Mark as read = update PENDING → SENT
export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.notificationLog.update({
      where: { id: notificationId, userId: session.user.id }, // ← tambah userId biar aman
      data: { status: "SENT", sentAt: new Date() }, // ← SENT = sudah dibaca
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark as read" };
  }
}

// Mark semua as read sekaligus
export async function markAllNotificationsAsRead() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.notificationLog.updateMany({
      where: { userId: session.user.id, status: "PENDING" },
      data: { status: "SENT", sentAt: new Date() },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark all as read" };
  }
}

export async function deleteNotification(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.notificationLog.delete({
      where: { id: notificationId, userId: session.user.id },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function deleteAllNotifications() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.notificationLog.deleteMany({
      where: { userId: session.user.id },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete all notifications" };
  }
}
