"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/role-guard";
import { rewardSchema } from "@/lib/validations";

/**
 * Create new reward (reward admin only) - status defaults to PENDING for approval
 */
export async function createReward(data: {
  name: string;
  description?: string;
  pointCost: number;
  quantity: number;
}) {
  await requireAuth(["REWARD_ADMIN", "SUPER_ADMIN"]);

  const validated = rewardSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const reward = await prisma.reward.create({
      data: {
        name: validated.data.name,
        description: validated.data.description,
        pointCost: validated.data.pointCost,
        quantity: validated.data.quantity,
        status: "AVAILABLE",
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
    });

    return {
      success: true,
      data: reward,
    };
  } catch (error) {
    console.error("[createReward error]", error);
    return {
      success: false,
      error: "Failed to create reward",
    };
  }
}

/**
 * Get all rewards (super admin and reward admin)
 */
export async function getRewards(page = 1, limit = 10) {
  await requireAuth(["SUPER_ADMIN", "REWARD_ADMIN"]);

  const skip = (page - 1) * limit;

  try {
    const [rewards, total] = await Promise.all([
      prisma.reward.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          pointCost: true,
          quantity: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              redemptions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.reward.count(),
    ]);

    return {
      success: true,
      data: rewards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getRewards error]", error);
    return {
      success: false,
      error: "Failed to fetch rewards",
    };
  }
}

/**
 * Get single reward by ID
 */
export async function getReward(rewardId: string) {
  await requireAuth(["SUPER_ADMIN", "REWARD_ADMIN"]);

  try {
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      select: {
        id: true,
        name: true,
        description: true,
        pointCost: true,
        quantity: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    });

    if (!reward) {
      return {
        success: false,
        error: "Reward not found",
      };
    }

    return {
      success: true,
      data: reward,
    };
  } catch (error) {
    console.error("[getReward error]", error);
    return {
      success: false,
      error: "Failed to fetch reward",
    };
  }
}

/**
 * Get reward redemptions for shipping status tracking.
 */
export async function getRedemptions(page = 1, limit = 20, search?: string) {
  await requireAuth(["SUPER_ADMIN", "REWARD_ADMIN"]);

  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { reward: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  try {
    const [redemptions, total] = await Promise.all([
      prisma.redemption.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          shippingStatus: true,
          pointsUsed: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              nip: true,
            },
          },
          reward: {
            select: {
              id: true,
              name: true,
              pointCost: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.redemption.count({ where }),
    ]);

    return {
      success: true,
      data: redemptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getRedemptions error]", error);
    return {
      success: false,
      error: "Failed to fetch redemptions",
    };
  }
}

/**
 * Update shipping status for a reward redemption.
 */
export async function updateRedemptionShippingStatus(
  redemptionId: string,
  shippingStatus: string,
) {
  await requireAuth(["SUPER_ADMIN", "REWARD_ADMIN"]);

  const cleanedStatus = shippingStatus.trim();
  if (!cleanedStatus) {
    return {
      success: false,
      error: "Shipping status is required",
    };
  }

  try {
    const existingRedemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
      select: { id: true },
    });

    if (!existingRedemption) {
      return {
        success: false,
        error: "Redemption not found",
      };
    }

    const redemption = await prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        shippingStatus: cleanedStatus,
      },
      select: {
        id: true,
        status: true,
        shippingStatus: true,
        pointsUsed: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nip: true,
          },
        },
        reward: {
          select: {
            id: true,
            name: true,
            pointCost: true,
          },
        },
      },
    });

    return {
      success: true,
      data: redemption,
      message: "Shipping status updated successfully",
    };
  } catch (error) {
    console.error("[updateRedemptionShippingStatus error]", error);
    return {
      success: false,
      error: "Failed to update shipping status",
    };
  }
}

/**
 * Update reward (super admin only)
 */
export async function updateReward(
  rewardId: string,
  data: {
    name?: string;
    description?: string;
    pointCost?: number;
    quantity?: number;
    status?: string;
  },
) {
  await requireAuth(["SUPER_ADMIN", "REWARD_ADMIN"]);

  const validated = rewardSchema.partial().safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    // Check if reward exists
    const existingReward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!existingReward) {
      return {
        success: false,
        error: "Reward not found",
      };
    }

    const reward = await prisma.reward.update({
      where: { id: rewardId },
      data: {
        name: validated.data.name,
        description: validated.data.description,
        pointCost: validated.data.pointCost,
        quantity: validated.data.quantity,
        status: validated.data.status as any,
      },
      select: {
        id: true,
        name: true,
        description: true,
        pointCost: true,
        quantity: true,
        status: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: reward,
    };
  } catch (error) {
    console.error("[updateReward error]", error);
    return {
      success: false,
      error: "Failed to update reward",
    };
  }
}

/**
 * Delete reward (super admin only)
 */
export async function deleteReward(rewardId: string) {
  await requireAuth(["SUPER_ADMIN", "REWARD_ADMIN"]);

  try {
    // Check if reward exists
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return {
        success: false,
        error: "Reward not found",
      };
    }

    await prisma.reward.delete({
      where: { id: rewardId },
    });

    return {
      success: true,
      message: "Reward deleted successfully",
    };
  } catch (error) {
    console.error("[deleteReward error]", error);
    return {
      success: false,
      error: "Failed to delete reward",
    };
  }
}

/**
 * Approve a pending redemption (super admin or reward admin)
 */
export async function approveRedemption(redemptionId: string, notes?: string) {
  const session = await requireAuth(["SUPER_ADMIN", "REWARD_ADMIN"]);
  if (!session?.user) return { success: false, error: "Unauthorized" };
  const adminId = (session.user as any).id;

  try {
    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
      select: { id: true, status: true },
    });

    if (!redemption) {
      return { success: false, error: "Redemption not found" };
    }

    if (redemption.status !== "PENDING") {
      return { success: false, error: "Only pending redemptions can be approved" };
    }

    const updated = await prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status: "APPROVED",
        notes: notes?.trim() || null,
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    return {
      success: true,
      data: updated,
      message: "Redemption approved successfully",
    };
  } catch (error) {
    console.error("[approveRedemption error]", error);
    return { success: false, error: "Failed to approve redemption" };
  }
}

/**
 * Reject a pending redemption (super admin or reward admin)
 */
export async function rejectRedemption(redemptionId: string, rejectionNotes: string) {
  const session = await requireAuth(["SUPER_ADMIN", "REWARD_ADMIN"]);
  if (!session?.user) return { success: false, error: "Unauthorized" };
  const adminId = (session.user as any).id;

  const notes = rejectionNotes.trim();
  if (!notes) {
    return { success: false, error: "Rejection notes are required" };
  }

  try {
    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
      select: { 
        id: true, 
        status: true, 
        userId: true, 
        rewardId: true, 
        pointsUsed: true,
        reward: { select: { name: true } }
      },
    });

    if (!redemption) {
      return { success: false, error: "Redemption not found" };
    }

    if (redemption.status !== "PENDING") {
      return { success: false, error: "Only pending redemptions can be rejected" };
    }

    // Run in transaction: Update redemption, refund points, restore stock
    await prisma.$transaction(async (tx) => {
      // 1. Update redemption status
      await tx.redemption.update({
        where: { id: redemptionId },
        data: {
          status: "REJECTED",
          notes: notes,
          shippingStatus: `${notes}`,
          approvedAt: new Date(),
          approvedBy: adminId,
        },
      });

      // 2. Refund points
      const activePeriod = await tx.academicPeriod.findFirst({
        where: { isActive: true },
        select: { id: true },
      });

      await tx.pointTransaction.create({
        data: {
          userId: redemption.userId,
          points: redemption.pointsUsed,
          periodId: activePeriod?.id ?? null,
          transactionType: "MANUAL_ADJUSTMENT",
          reference: redemption.id,
          description: `Refund: Redemption rejected for ${redemption.reward.name}`,
        },
      });

      // 3. Restore stock
      await tx.reward.update({
        where: { id: redemption.rewardId },
        data: {
          quantity: { increment: 1 },
        },
      });
    });

    return {
      success: true,
      message: "Redemption rejected and points refunded successfully",
    };
  } catch (error) {
    console.error("[rejectRedemption error]", error);
    return { success: false, error: "Failed to reject redemption" };
  }
}

/**
 * Complete a reward redemption (mark as finished/received)
 */
export async function completeRedemption(redemptionId: string) {
  const session = await requireAuth(["SUPER_ADMIN", "REWARD_ADMIN"]);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
      select: { id: true, status: true },
    });

    if (!redemption) {
      return { success: false, error: "Redemption not found" };
    }

    if (redemption.status !== "APPROVED") {
      return { success: false, error: "Only approved redemptions can be completed" };
    }

    const updated = await prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status: "COMPLETED",
        shippingStatus: "Reward sudah diterima",
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      data: updated,
      message: "Redemption marked as completed successfully",
    };
  } catch (error) {
    console.error("[completeRedemption error]", error);
    return { success: false, error: "Failed to complete redemption" };
  }
}

