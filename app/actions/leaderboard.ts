"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/role-guard";

export type LeaderboardUser = {
  id: string;
  name: string;
  email: string;
  nip: string;
  unit: string;
  division: string;
  historicalPoints: number;
  activePoints: number;
  availablePoints: number;
  allTimePoints: number;
};

export async function getLeaderboardData() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { success: false, error: "Not authenticated" };

  try {
    const workers = await prisma.user.findMany({
      where: {
        role: "WORKER",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        nip: true,
        unit: { select: { name: true } },
        division: { select: { name: true } },
        semesterSummaries: { select: { totalPoints: true } },
        pointTransactions: { select: { points: true } },
      },
    });

    const formattedWorkers: LeaderboardUser[] = workers.map((w) => {
      const historicalPoints = w.semesterSummaries.reduce(
        (sum, s) => sum + s.totalPoints,
        0,
      );

      const activePoints = w.pointTransactions
        .filter((t) => t.points > 0)
        .reduce((sum, t) => sum + t.points, 0);

      const spentPoints = w.pointTransactions
        .filter((t) => t.points < 0)
        .reduce((sum, t) => sum + Math.abs(t.points), 0);

      return {
        id: w.id,
        name: w.name ?? w.email ?? "Pekerja",
        email: w.email,
        nip: w.nip ?? "-",
        unit: w.unit?.name ?? "-",
        division: w.division?.name ?? "-",
        historicalPoints,
        activePoints,
        availablePoints: activePoints - spentPoints,
        allTimePoints: historicalPoints + activePoints,
      };
    });

    return {
      success: true,
      data: formattedWorkers,
      currentUserId: currentUser.id,
    };
  } catch (error) {
    console.error("[getLeaderboardData error]", error);
    return { success: false, error: "Failed to fetch leaderboard data" };
  }
}
