"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/role-guard";

export async function getAcademicPeriodsForReset() {
  await requireAuth(["SUPER_ADMIN"]);
  try {
    const periods = await prisma.academicPeriod.findMany({
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
        lastResetAt: true,
      },
    });
    return { success: true, data: periods };
  } catch (error) {
    return { success: false, error: "Gagal ambil data period" };
  }
}

export async function resetSemesterByPeriod(periodId: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const period = await prisma.academicPeriod.findUnique({
      where: { id: periodId },
      include: {
        materials: {
          include: {
            quizConfigs: {
              include: {
                quizSessions: {
                  where: { status: "GRADED" },
                  select: { id: true, userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!period) return { success: false, error: "Academic period tidak ditemukan" };

    const startDate = new Date(period.startDate);
    const year = startDate.getFullYear();
    const semester = startDate.getMonth() < 6 ? 1 : 2;

    // Kumpulkan semua quizSessionId dari period ini
    const quizSessionIds: string[] = [];
    for (const material of period.materials) {
      for (const quizConfig of material.quizConfigs) {
        for (const session of quizConfig.quizSessions) {
          quizSessionIds.push(session.id);
        }
      }
    }

    // Kumpulkan semua userId yang terlibat
    const userIds = [...new Set(
      period.materials
        .flatMap(m => m.quizConfigs)
        .flatMap(qc => qc.quizSessions)
        .map(s => s.userId)
    )];

    // Per user, snapshot poin dari transaksi yang referencenya quiz session period ini
    const workers = await prisma.user.findMany({
      where: { role: "WORKER" },
      select: { id: true },
    });

    for (const user of workers) {
      // Ambil point transactions yang reference-nya quiz session dari period ini
      const transactions = await prisma.pointTransaction.findMany({
        where: {
          userId: user.id,
          points: { gt: 0 },
          reference: { in: quizSessionIds }, // ← hanya dari quiz period ini
        },
        select: { points: true },
      });

      const totalPoints = transactions.reduce((sum, t) => sum + t.points, 0);

      const existing = await prisma.semesterSummary.findUnique({
        where: {
          userId_year_semester: { userId: user.id, year, semester },
        },
      });

      await prisma.semesterSummary.upsert({
        where: {
          userId_year_semester: { userId: user.id, year, semester },
        },
        create: {
          userId: user.id,
          periodId: period.id,
          year,
          semester,
          totalPoints,
        },
        update: {
          totalPoints: (existing?.totalPoints ?? 0) + totalPoints,
          periodId: period.id,
        },
      });

      // Hapus hanya transaksi dari quiz period ini
      await prisma.pointTransaction.deleteMany({
          where: {
            userId: user.id,
            OR: [
              { reference: { in: quizSessionIds } },
              { points: { lt: 0 } },
            ],
          },
        });
    }

    // Reset streak semua worker
    await prisma.userStreak.updateMany({
      where: { userId: { in: workers.map(w => w.id) } },
      data: { currentStreak: 0, lastStreakDate: null },
    });

    await prisma.academicPeriod.update({
      where: { id: periodId },
      data: { lastResetAt: new Date() },
    });

    return {
      success: true,
      message: `Reset period "${period.name}" berhasil.`,
    };
  } catch (error) {
    console.error("[resetSemesterByPeriod error]", error);
    return { success: false, error: "Gagal reset semester" };
  }
}

// Sisanya tetap sama
export async function getUserSemesterHistory(userId: string) {
  try {
    const semesters = await prisma.semesterSummary.findMany({
      where: { userId },
      orderBy: [{ year: "desc" }, { semester: "desc" }],
      include: {
        period: { select: { name: true } },
      },
    });
    return { success: true, data: semesters };
  } catch (error) {
    return { success: false, error: "Gagal mengambil riwayat semester" };
  }
}

export async function getUserAllTimePoints(userId: string) {
  try {
    const [summaries, activeTransactions] = await Promise.all([
      prisma.semesterSummary.findMany({
        where: { userId },
        select: { totalPoints: true },
      }),
      prisma.pointTransaction.findMany({
        where: { userId },
        select: { points: true },
      }),
    ]);

    const historicalPoints = summaries.reduce(
      (sum, s) => sum + s.totalPoints,
      0,
    );
    const activePoints = activeTransactions.reduce(
      (sum, t) => sum + t.points,
      0,
    );

    return {
      success: true,
      data: {
        allTimePoints: historicalPoints + activePoints,
        activePoints,
        historicalPoints,
      },
    };
  } catch (error) {
    return { success: false, error: "Gagal hitung total poin" };
  }
}
