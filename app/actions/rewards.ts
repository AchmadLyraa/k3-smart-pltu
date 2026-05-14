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
        status: "PENDING",
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
  await requireAuth(["SUPER_ADMIN"]);

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
export async function getRedemptions(page = 1, limit = 20) {
  await requireAuth(["SUPER_ADMIN"]);

  const skip = (page - 1) * limit;

  try {
    const [redemptions, total] = await Promise.all([
      prisma.redemption.findMany({
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
      prisma.redemption.count(),
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
  await requireAuth(["SUPER_ADMIN"]);

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
  await requireAuth(["SUPER_ADMIN"]);

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
  await requireAuth(["SUPER_ADMIN"]);

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
 * Approve a pending reward (super admin only)
 */
export async function approveReward(rewardId: string, notes?: string) {
  const session = await requireAuth(["SUPER_ADMIN"]);

  try {
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      select: { id: true, status: true },
    });

    if (!reward) {
      return {
        success: false,
        error: "Reward not found",
      };
    }

    if (reward.status !== "PENDING") {
      return {
        success: false,
        error: "Only pending rewards can be approved",
      };
    }

    const updatedReward = await prisma.reward.update({
      where: { id: rewardId },
      data: {
        status: "AVAILABLE",
        approvalNotes: notes?.trim() || null,
        approvedAt: new Date(),
        approvedBy: session.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        pointCost: true,
        quantity: true,
        status: true,
        approvalNotes: true,
        approvedAt: true,
        approvedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: updatedReward,
      message: "Reward approved successfully",
    };
  } catch (error) {
    console.error("[approveReward error]", error);
    return {
      success: false,
      error: "Failed to approve reward",
    };
  }
}

/**
 * Reject a pending reward (super admin only)
 */
export async function rejectReward(rewardId: string, rejectionNotes: string) {
  const session = await requireAuth(["SUPER_ADMIN"]);

  const notes = rejectionNotes.trim();
  if (!notes) {
    return {
      success: false,
      error: "Rejection notes are required",
    };
  }

  try {
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      select: { id: true, status: true },
    });

    if (!reward) {
      return {
        success: false,
        error: "Reward not found",
      };
    }

    if (reward.status !== "PENDING") {
      return {
        success: false,
        error: "Only pending rewards can be rejected",
      };
    }

    const updatedReward = await prisma.reward.update({
      where: { id: rewardId },
      data: {
        status: "REJECTED",
        approvalNotes: notes,
        approvedAt: new Date(),
        approvedBy: session.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        pointCost: true,
        quantity: true,
        status: true,
        approvalNotes: true,
        approvedAt: true,
        approvedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: updatedReward,
      message: "Reward rejected successfully",
    };
  } catch (error) {
    console.error("[rejectReward error]", error);
    return {
      success: false,
      error: "Failed to reject reward",
    };
  }
}

/**
 * Get pending rewards for admin approval.
 */
export async function getPendingRewards(page = 1, limit = 10) {
  await requireAuth(["SUPER_ADMIN"]);

  const skip = (page - 1) * limit;

  try {
    const [rewards, total] = await Promise.all([
      prisma.reward.findMany({
        where: { status: "PENDING" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          pointCost: true,
          quantity: true,
          status: true,
          approvalNotes: true,
          approvedAt: true,
          approvedBy: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.reward.count({ where: { status: "PENDING" } }),
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
    console.error("[getPendingRewards error]", error);
    return {
      success: false,
      error: "Failed to fetch pending rewards",
    };
  }
}

