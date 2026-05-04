"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/role-guard";

export async function getAdminDashboardStats() {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const [
      totalMaterials,
      totalQuizConfigs,
      totalWorkers,
      totalPointTransactions,
    ] = await Promise.all([
      prisma.material.count({ where: { status: "PUBLISHED" } }),
      prisma.quizConfig.count(),
      prisma.user.count({ where: { role: "WORKER" } }),
      prisma.pointTransaction.findMany({
        where: { points: { gt: 0 } },
      }),
    ]);

    const totalPointsAwarded = totalPointTransactions.reduce(
      (sum, t) => sum + t.points,
      0,
    );

    return {
      success: true,
      data: {
        totalMaterials,
        totalQuizConfigs,
        totalWorkers,
        totalPointsAwarded,
      },
    };
  } catch (error) {
    console.error("[getAdminDashboardStats error]", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

export async function getWorkerPerformanceList() {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const workers = await prisma.user.findMany({
      where: { role: "WORKER" },
      select: {
        id: true,
        name: true,
        email: true,
        nip: true,
        unit: { select: { name: true } },
        division: { select: { name: true } },
        materialProgress: {
          select: { status: true },
        },
        quizSessions: {
          where: { status: "GRADED" },
          select: {
            passed: true,
            score: true,
            submittedAt: true,
            startedAt: true,
          },
        },
        pointTransactions: {
          where: { points: { gt: 0 } },
          select: { points: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const totalMaterials = await prisma.material.count({
      where: { status: "PUBLISHED" },
    });
    const totalQuizConfigs = await prisma.quizConfig.count();

    const result = workers.map((w) => {
      const materialsCompleted = w.materialProgress.filter(
        (p) => p.status === "COMPLETED",
      ).length;
      const quizAttempted = w.quizSessions.length;
      const quizPassed = w.quizSessions.filter((s) => s.passed).length;
      const totalPoints = w.pointTransactions.reduce(
        (sum, t) => sum + t.points,
        0,
      );

      return {
        id: w.id,
        name: w.name,
        email: w.email,
        nip: w.nip,
        unit: w.unit?.name ?? "-",
        division: w.division?.name ?? "-",
        materialsCompleted,
        totalMaterials,
        quizAttempted,
        quizPassed,
        totalQuizConfigs,
        totalPoints,
      };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("[getWorkerPerformanceList error]", error);
    return { success: false, error: "Failed to fetch worker performance" };
  }
}

export async function getWorkerDetail(userId: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const worker = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        nip: true,
        unit: { select: { name: true } },
        division: { select: { name: true } },
        quizSessions: {
          where: { status: "GRADED" },
          include: {
            quizConfig: {
              select: { name: true, passingScore: true },
            },
            userAnswers: {
              include: {
                question: {
                  select: { text: true, points: true },
                },
              },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
        pointTransactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!worker) return { success: false, error: "Worker not found" };

    return { success: true, data: worker };
  } catch (error) {
    console.error("[getWorkerDetail error]", error);
    return { success: false, error: "Failed to fetch worker detail" };
  }
}
