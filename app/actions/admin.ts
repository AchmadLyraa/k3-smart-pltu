"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/role-guard";

export async function getAcademicPeriodsForFilter() {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN", "REWARD_ADMIN"]);

  try {
    const periods = await prisma.academicPeriod.findMany({
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    });
    return { success: true, data: periods };
  } catch (error) {
    return { success: false, error: "Failed to fetch periods" };
  }
}

export async function getAdminDashboardStats(periodId?: string) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN", "REWARD_ADMIN"]);

  try {
    const materialWhere = periodId
      ? { status: "PUBLISHED", periodId }
      : { status: "PUBLISHED" };

    const [
      totalMaterials,
      totalQuizConfigs,
      totalWorkers,
      totalPointTransactions,
    ] = await Promise.all([
      prisma.material.count({ where: materialWhere } as any),
      prisma.quizConfig.count({
        where: periodId ? { material: { periodId } } : undefined,
      }),
      prisma.user.count({ where: { role: "WORKER" } }),
      periodId
        ? prisma.pointTransaction.findMany({
            where: {
              points: { gt: 0 },
            },
          })
        : prisma.pointTransaction.findMany({
            where: { points: { gt: 0 } },
          }),
    ]);

    let totalPointsAwarded = 0;

    if (periodId) {
      // Filter point transactions by quiz sessions in this period
      const materialsInPeriod = await prisma.material.findMany({
        where: { periodId },
        select: {
          quizConfigs: {
            select: {
              quizSessions: {
                select: { id: true },
              },
            },
          },
        },
      });

      const sessionIds = materialsInPeriod.flatMap((m) =>
        m.quizConfigs.flatMap((qc) => qc.quizSessions.map((s) => s.id)),
      );

      if (sessionIds.length > 0) {
        const periodPoints = await prisma.pointTransaction.findMany({
          where: {
            points: { gt: 0 },
            reference: { in: sessionIds },
          },
        });
        totalPointsAwarded = periodPoints.reduce((sum, t) => sum + t.points, 0);
      }
    } else {
      totalPointsAwarded = totalPointTransactions.reduce(
        (sum, t) => sum + t.points,
        0,
      );
    }

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

export async function getWorkerPerformanceList(periodId?: string) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN", "REWARD_ADMIN"]);

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
        materialProgress: periodId
          ? {
              where: { material: { periodId } },
              select: { status: true, materialId: true },
            }
          : {
              select: { status: true, materialId: true },
            },
        quizSessions: periodId
          ? {
              where: {
                status: "GRADED",
                quizConfig: { material: { periodId } },
              },
              select: {
                passed: true,
                score: true,
                submittedAt: true,
                startedAt: true,
              },
            }
          : {
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
      where: periodId
        ? { status: "PUBLISHED", periodId }
        : { status: "PUBLISHED" },
    });
    const totalQuizConfigs = await prisma.quizConfig.count({
      where: periodId ? { material: { periodId } } : undefined,
    });

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

export async function getActiveUsersReport(periodId?: string) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN", "REWARD_ADMIN"]);

  try {
    const materialWhere = periodId ? { material: { periodId } } : {};

    const activeUsers = await prisma.materialProgress.findMany({
      where: {
        ...materialWhere,
        status: { in: ["IN_PROGRESS", "COMPLETED"] },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nip: true,
            unit: { select: { name: true } },
            division: { select: { name: true } },
          },
        },
        material: {
          select: { title: true },
        },
      },
      orderBy: { lastAccessed: "desc" },
    });

    // Group by user
    const userMap = new Map<
      string,
      {
        name: string | null;
        nip: string | null;
        unit: string;
        division: string;
        materialsAccessed: Set<string>;
        materialsProgress: { title: string; status: string }[];
        lastAccessed: Date | null;
      }
    >();

    for (const progress of activeUsers) {
      if (!progress.user) continue;
      const userId = progress.user.id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          name: progress.user.name,
          nip: progress.user.nip,
          unit: progress.user.unit?.name ?? "-",
          division: progress.user.division?.name ?? "-",
          materialsAccessed: new Set(),
          materialsProgress: [],
          lastAccessed: progress.lastAccessed,
        });
      }
      const entry = userMap.get(userId)!;
      entry.materialsAccessed.add(progress.materialId);
      entry.materialsProgress.push({
        title: progress.material.title,
        status: progress.status,
      });
      if (
        progress.lastAccessed &&
        (!entry.lastAccessed || progress.lastAccessed > entry.lastAccessed)
      ) {
        entry.lastAccessed = progress.lastAccessed;
      }
    }

    const report = Array.from(userMap.entries()).map(
      ([userId, data], index) => ({
        no: index + 1,
        id: userId,
        name: data.name ?? "-",
        nip: data.nip ?? "-",
        unit: data.unit,
        division: data.division,
        totalMateriDiakses: data.materialsAccessed.size,
        materiDiproses: data.materialsProgress.filter(
          (m) => m.status === "IN_PROGRESS",
        ).length,
        materiSelesai: data.materialsProgress.filter(
          (m) => m.status === "COMPLETED",
        ).length,
        lastAccessed: data.lastAccessed
          ? data.lastAccessed.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
      }),
    );

    return { success: true, data: report };
  } catch (error) {
    console.error("[getActiveUsersReport error]", error);
    return { success: false, data: [] };
  }
}

export async function getPeriodMonthlyActivity(periodId?: string) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN", "REWARD_ADMIN"]);

  try {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    // Determine month range based on period
    let monthLabels: string[] = [];
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (periodId) {
      const period = await prisma.academicPeriod.findUnique({
        where: { id: periodId },
        select: { startDate: true, endDate: true, name: true },
      });

      if (!period) {
        return { success: false, error: "Periode tidak ditemukan" };
      }

      startDate = period.startDate;
      endDate = period.endDate;

      // Calculate total months in period
      const startMonthIndex = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const endMonthIndex = endDate.getMonth();
      const endYear = endDate.getFullYear();

      const totalMonths =
        (endYear - startYear) * 12 + (endMonthIndex - startMonthIndex) + 1;

      if (totalMonths > 12) {
        return {
          success: false,
          error: `Periode "${period.name}" memiliki durasi ${totalMonths} bulan (> 12 bulan). Tidak dapat menampilkan chart.`,
        };
      }

      // Build month labels by iterating month indices from start to end
      for (let i = 0; i < totalMonths; i++) {
        const monthIndex = (startMonthIndex + i) % 12;
        monthLabels.push(monthNames[monthIndex]);
      }
    }

    const quizSessionWhere: any = {
      status: "GRADED",
    };

    if (periodId) {
      quizSessionWhere.quizConfig = {
        material: { periodId },
      };
    }

    const sessions = await prisma.quizSession.findMany({
      where: quizSessionWhere,
      select: {
        userId: true,
        submittedAt: true,
      },
    });

    // Use all 12 months as reference for "all" mode
    if (!periodId) {
      monthLabels = [...monthNames];
    }

    // Initialize map with actual month labels
    const monthCount = new Map<string, Set<string>>();
    for (const label of monthLabels) {
      monthCount.set(label, new Set());
    }

    for (const session of sessions) {
      if (!session.submittedAt) continue;

      if (periodId && startDate && endDate) {
        // Period mode: filter by actual date range
        if (session.submittedAt < startDate || session.submittedAt > endDate)
          continue;
      }

      const monthName = monthNames[session.submittedAt.getMonth()];
      // Only count if this month is in our label set
      if (monthCount.has(monthName)) {
        monthCount.get(monthName)?.add(session.userId);
      }
    }

    const monthlyData = Array.from(monthCount.entries()).map(
      ([name, workers]) => ({
        name,
        akses: workers.size,
      }),
    );

    return { success: true, data: monthlyData };
  } catch (error) {
    console.error("[getPeriodMonthlyActivity error]", error);
    return { success: false, data: [] };
  }
}

export async function getWorkerDetail(userId: string, page = 1, limit = 10) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN", "REWARD_ADMIN"]);

  try {
    const skip = (page - 1) * limit;

    const [worker, totalQuizSessions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },

        select: {
          id: true,
          name: true,
          email: true,
          nip: true,

          unit: {
            select: {
              name: true,
            },
          },

          division: {
            select: {
              name: true,
            },
          },

          quizSessions: {
            where: {
              status: "GRADED",
            },

            include: {
              quizConfig: {
                select: {
                  name: true,
                  passingScore: true,
                },
              },

              userAnswers: {
                include: {
                  question: {
                    select: {
                      text: true,
                      points: true,
                    },
                  },
                },
              },
            },

            orderBy: {
              submittedAt: "desc",
            },

            skip,
            take: limit,
          },

          pointTransactions: {
            orderBy: {
              createdAt: "desc",
            },

            take: 20,
          },
        },
      }),

      prisma.quizSession.count({
        where: {
          userId,
          status: "GRADED",
        },
      }),
    ]);

    if (!worker) {
      return {
        success: false,
        error: "Worker not found",
      };
    }

    return {
      success: true,

      data: {
        ...worker,

        pagination: {
          page,
          limit,
          total: totalQuizSessions,
          totalPages: Math.ceil(totalQuizSessions / limit),
          hasMore: skip + worker.quizSessions.length < totalQuizSessions,
        },
      },
    };
  } catch (error) {
    console.error("[getWorkerDetail error]", error);

    return {
      success: false,
      error: "Failed to fetch worker detail",
    };
  }
}
