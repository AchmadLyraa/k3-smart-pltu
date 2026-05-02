"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/role-guard";
import { redeemRewardSchema } from "@/lib/validations";

export async function getWorkerRewardDashboard() {
  const session = await requireAuth(["WORKER"]);
  const userId = (session.user as any).id as string;

  try {
    const [balanceResult, rewards, redemptions, user] = await Promise.all([
      prisma.pointTransaction.aggregate({
        where: { userId },
        _sum: { points: true },
      }),
      prisma.reward.findMany({
        where: {
          status: "AVAILABLE",
          quantity: { gt: 0 },
        },
        select: {
          id: true,
          name: true,
          description: true,
          pointCost: true,
          quantity: true,
          status: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: "desc" }],
      }),
      prisma.redemption.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          pointsUsed: true,
          createdAt: true,
          completedAt: true,
          reward: {
            select: {
              id: true,
              name: true,
              pointCost: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        user,
        balance: balanceResult._sum.points ?? 0,
        rewards,
        redemptions,
      },
    };
  } catch (error) {
    console.error("[getWorkerRewardDashboard error]", error);
    return {
      success: false,
      error: "Failed to load reward dashboard",
    };
  }
}

export async function redeemReward(rewardId: string) {
  const session = await requireAuth(["WORKER"]);
  const userId = (session.user as any).id as string;

  const validated = redeemRewardSchema.safeParse({ rewardId });
  if (!validated.success) {
    return {
      success: false,
      error: "Validation failed",
    };
  }

  try {
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      select: {
        id: true,
        name: true,
        pointCost: true,
        quantity: true,
        status: true,
      },
    });

    if (!reward) {
      return {
        success: false,
        error: "Reward not found",
      };
    }

    if (reward.status !== "AVAILABLE" || reward.quantity < 1) {
      return {
        success: false,
        error: "Reward is not available",
      };
    }

    const balanceResult = await prisma.pointTransaction.aggregate({
      where: { userId },
      _sum: { points: true },
    });
    const balance = balanceResult._sum.points ?? 0;

    if (balance < reward.pointCost) {
      return {
        success: false,
        error: "Poin Anda tidak mencukupi untuk menukar reward ini",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const stockUpdate = await tx.reward.updateMany({
        where: {
          id: rewardId,
          quantity: { gt: 0 },
          status: "AVAILABLE",
        },
        data: {
          quantity: { decrement: 1 },
        },
      });

      if (stockUpdate.count === 0) {
        throw new Error("Reward stock is no longer available");
      }

      const redemption = await tx.redemption.create({
        data: {
          userId,
          rewardId,
          status: "COMPLETED",
          pointsUsed: reward.pointCost,
          completedAt: new Date(),
        },
        select: {
          id: true,
          status: true,
          pointsUsed: true,
          createdAt: true,
          completedAt: true,
          reward: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      await tx.pointTransaction.create({
        data: {
          userId,
          points: -reward.pointCost,
          transactionType: "MANUAL_ADJUSTMENT",
          reference: redemption.id,
          description: `Redeemed reward: ${reward.name}`,
        },
      });

      return redemption;
    });

    return {
      success: true,
      data: result,
      message: "Reward berhasil ditukar",
    };
  } catch (error) {
    console.error("[redeemReward error]", error);
    return {
      success: false,
      error: "Failed to redeem reward",
    };
  }
}