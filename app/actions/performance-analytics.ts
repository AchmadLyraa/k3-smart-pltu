"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/role-guard";

/**
 * Get all performance analytics data for the Analisis Performa page.
 * Returns: stat cards, doughnut chart data, bar chart data, evaluation table data.
 */
export async function getPerformanceAnalytics(periodId?: string) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN", "REWARD_ADMIN"]);

  try {
    // Build the where clause for quiz sessions filtered by period
    const sessionWhere: any = {
      status: "GRADED",
    };
    if (periodId) {
      sessionWhere.quizConfig = { material: { periodId } };
    }

    // Fetch all graded quiz sessions with relevant data
    const allSessions = await prisma.quizSession.findMany({
      where: sessionWhere,
      select: {
        id: true,
        userId: true,
        score: true,
        totalQuestions: true,
        correctAnswers: true,
        passed: true,
        attemptNumber: true,
        quizConfigId: true,
        quizConfig: {
          select: {
            id: true,
            name: true,
            totalQuestions: true,
            passingScore: true,
            material: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Total active workers
    const totalWorkers = await prisma.user.count({
      where: { role: "WORKER", status: "ACTIVE" },
    });

    // ── CARD 1: Rata-Rata Nilai Karyawan (Tingkat Pemahaman) ──
    // Calculate percentage score per session: (correctAnswers / totalQuestions) * 100
    let avgScore = 0;
    if (allSessions.length > 0) {
      const totalPercentage = allSessions.reduce((sum, s) => {
        if (s.totalQuestions > 0 && s.correctAnswers !== null) {
          return sum + (s.correctAnswers / s.totalQuestions) * 100;
        }
        return sum;
      }, 0);
      avgScore = Math.round((totalPercentage / allSessions.length) * 10) / 10;
    }

    // ── CARD 2: Rasio Skor Sempurna ──
    // Users who got 100% (correctAnswers === totalQuestions) on attemptNumber === 1
    const firstAttemptPerfect = allSessions.filter(
      (s) =>
        s.attemptNumber === 1 &&
        s.correctAnswers !== null &&
        s.totalQuestions > 0 &&
        s.correctAnswers === s.totalQuestions
    );
    const uniquePerfectUsers = new Set(firstAttemptPerfect.map((s) => s.userId));
    const perfectScoreRatio =
      totalWorkers > 0
        ? Math.round((uniquePerfectUsers.size / totalWorkers) * 100 * 10) / 10
        : 0;

    // ── CARD 4: First-Try Pass Rate ──
    // Users who passed on attemptNumber === 1
    const firstAttemptSessions = allSessions.filter(
      (s) => s.attemptNumber === 1
    );
    const firstAttemptPassed = firstAttemptSessions.filter((s) => s.passed);
    const uniqueFirstAttemptUsers = new Set(
      firstAttemptSessions.map((s) => s.userId)
    );
    const uniqueFirstAttemptPassed = new Set(
      firstAttemptPassed.map((s) => s.userId)
    );
    const firstTryPassRate =
      uniqueFirstAttemptUsers.size > 0
        ? Math.round(
            (uniqueFirstAttemptPassed.size / uniqueFirstAttemptUsers.size) *
              100 *
              10
          ) / 10
        : 0;

    // ── PER-SESSION AGGREGATION (for Card 3, Bar Chart, Table) ──
    const sessionsByConfig = new Map<
      string,
      {
        configId: string;
        configName: string;
        materialTitle: string;
        sessions: typeof allSessions;
      }
    >();

    for (const s of allSessions) {
      if (!s.quizConfigId || !s.quizConfig) continue;
      const key = s.quizConfigId;
      if (!sessionsByConfig.has(key)) {
        sessionsByConfig.set(key, {
          configId: s.quizConfig.id,
          configName: s.quizConfig.name,
          materialTitle: s.quizConfig.material?.title ?? "",
          sessions: [],
        });
      }
      sessionsByConfig.get(key)!.sessions.push(s);
    }

    // Build per-session stats
    const perSessionStats = Array.from(sessionsByConfig.entries()).map(
      ([, data]) => {
        const { configId, configName, materialTitle, sessions } = data;
        const uniqueParticipants = new Set(sessions.map((s) => s.userId));

        // Average score percentage
        const totalPct = sessions.reduce((sum, s) => {
          if (s.totalQuestions > 0 && s.correctAnswers !== null) {
            return sum + (s.correctAnswers / s.totalQuestions) * 100;
          }
          return sum;
        }, 0);
        const avgPct =
          sessions.length > 0
            ? Math.round((totalPct / sessions.length) * 10) / 10
            : 0;

        // Perfect score count (correctAnswers === totalQuestions)
        const perfectSessions = sessions.filter(
          (s) =>
            s.correctAnswers !== null &&
            s.totalQuestions > 0 &&
            s.correctAnswers === s.totalQuestions
        );
        const uniquePerfect = new Set(perfectSessions.map((s) => s.userId));
        const perfectPct =
          uniqueParticipants.size > 0
            ? Math.round(
                (uniquePerfect.size / uniqueParticipants.size) * 100 * 10
              ) / 10
            : 0;

        // Status badge
        let status: "Sangat Baik" | "Baik" | "Perlu Ditinjau";
        if (avgPct > 85) status = "Sangat Baik";
        else if (avgPct >= 70) status = "Baik";
        else status = "Perlu Ditinjau";

        return {
          quizConfigId: configId,
          sessionName: configName,
          materialTitle,
          totalParticipants: uniqueParticipants.size,
          avgScore: avgPct,
          perfectCount: uniquePerfect.size,
          perfectPct,
          status,
        };
      }
    );

    // Sort by avgScore ascending for display
    perSessionStats.sort((a, b) => a.avgScore - b.avgScore);

    // ── CARD 3: Kuis dengan Nilai Terendah ──
    const hardestSession =
      perSessionStats.length > 0 ? perSessionStats[0] : null;
    const hardestQuizName = hardestSession
      ? hardestSession.sessionName
      : "Belum ada data";

    // ── DOUGHNUT CHART: Distribusi Nilai Karyawan ──
    // Group users by their average score across all sessions
    const userScores = new Map<string, number[]>();
    for (const s of allSessions) {
      if (s.totalQuestions > 0 && s.correctAnswers !== null) {
        const pct = (s.correctAnswers / s.totalQuestions) * 100;
        if (!userScores.has(s.userId)) {
          userScores.set(s.userId, []);
        }
        userScores.get(s.userId)!.push(pct);
      }
    }

    let sangatPaham = 0;
    let cukupPaham = 0;
    let kurangPaham = 0;

    for (const [, scores] of userScores) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg >= 90) sangatPaham++;
      else if (avg >= 70) cukupPaham++;
      else kurangPaham++;
    }

    const doughnutData = [
      { name: "Sangat Paham (90-100)", value: sangatPaham, color: "#E74C3C" },
      { name: "Cukup Paham (70-89)", value: cukupPaham, color: "#FF8C7C" },
      { name: "Kurang Paham (<70)", value: kurangPaham, color: "#D5D5D5" },
    ];

    // ── BAR CHART: Perbandingan Per Sesi ──
    // Sort by session name for chart
    const barChartData = [...perSessionStats]
      .sort((a, b) => a.sessionName.localeCompare(b.sessionName))
      .map((s) => ({
        name:
          s.sessionName.length > 20
            ? s.sessionName.substring(0, 20) + "…"
            : s.sessionName,
        fullName: s.sessionName,
        rataRata: s.avgScore,
        skorSempurna: s.perfectPct,
      }));

    return {
      success: true,
      data: {
        // Stat cards
        avgScore,
        perfectScoreRatio,
        perfectScoreCount: uniquePerfectUsers.size,
        hardestQuizName,
        firstTryPassRate,
        totalWorkers,
        totalSessions: allSessions.length,

        // Charts
        doughnutData,
        barChartData,

        // Table
        evaluationTable: perSessionStats,
      },
    };
  } catch (error) {
    console.error("[getPerformanceAnalytics error]", error);
    return { success: false, error: "Failed to fetch performance analytics" };
  }
}

/**
 * Get participants list for a specific quiz session (detail dialog).
 */
export async function getSessionParticipants(
  quizConfigId: string,
  periodId?: string
) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN", "REWARD_ADMIN"]);

  try {
    const sessionWhere: any = {
      quizConfigId,
      status: "GRADED",
    };
    if (periodId) {
      sessionWhere.quizConfig = { material: { periodId } };
    }

    const sessions = await prisma.quizSession.findMany({
      where: sessionWhere,
      select: {
        userId: true,
        score: true,
        totalQuestions: true,
        correctAnswers: true,
        passed: true,
        attemptNumber: true,
        submittedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            nip: true,
            unit: { select: { name: true } },
            division: { select: { name: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    // Group by user, keep best attempt
    const userBest = new Map<
      string,
      {
        userId: string;
        name: string;
        nip: string;
        unit: string;
        division: string;
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        passed: boolean;
        attemptNumber: number;
        scorePct: number;
      }
    >();

    for (const s of sessions) {
      const scorePct =
        s.totalQuestions > 0 && s.correctAnswers !== null
          ? Math.round((s.correctAnswers / s.totalQuestions) * 100 * 10) / 10
          : 0;

      const existing = userBest.get(s.userId);
      if (!existing || scorePct > existing.scorePct) {
        userBest.set(s.userId, {
          userId: s.userId,
          name: s.user?.name ?? "-",
          nip: s.user?.nip ?? "-",
          unit: s.user?.unit?.name ?? "-",
          division: s.user?.division?.name ?? "-",
          score: s.score ?? 0,
          totalQuestions: s.totalQuestions,
          correctAnswers: s.correctAnswers ?? 0,
          passed: s.passed ?? false,
          attemptNumber: s.attemptNumber,
          scorePct,
        });
      }
    }

    const participants = Array.from(userBest.values()).sort(
      (a, b) => b.scorePct - a.scorePct
    );

    // Get quiz config name
    const quizConfig = await prisma.quizConfig.findUnique({
      where: { id: quizConfigId },
      select: {
        name: true,
        material: { select: { title: true } },
      },
    });

    return {
      success: true,
      data: {
        quizName: quizConfig?.name ?? "Unknown",
        materialTitle: quizConfig?.material?.title ?? "",
        participants,
      },
    };
  } catch (error) {
    console.error("[getSessionParticipants error]", error);
    return { success: false, error: "Failed to fetch session participants" };
  }
}
