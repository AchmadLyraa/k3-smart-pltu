"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/role-guard";
import { rewardSchema } from "@/lib/validations";

/**
 * Create new reward (super admin only)
 */
export async function createReward(data: {
  name: string;
  description?: string;
  pointCost: number;
  quantity: number;
  status?: string;
}) {
  await requireAuth(["SUPER_ADMIN"]);

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
        status: (validated.data.status || "AVAILABLE") as any,
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
 * Get all rewards (super admin only)
 */
export async function getRewards(page = 1, limit = 10) {
  await requireAuth(["SUPER_ADMIN"]);

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
