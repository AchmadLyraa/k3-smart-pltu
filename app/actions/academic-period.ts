"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/role-guard";

export async function getAcademicPeriods() {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const periods = await prisma.academicPeriod.findMany({
      orderBy: { startDate: "desc" },
      include: {
        materials: {
          include: {
            topic: true,
            // mediaFiles: true,
            quizConfigs: true,
          },
        },
      },
    });

    const unassigned = await prisma.material.findMany({
      where: {
        periodId: null,
      },
      include: {
        topic: true,
        // mediaFiles: true,
        quizConfigs: true,
      },
    });

    return {
      success: true,
      data: {
        periods,
        unassigned,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch periods" };
  }
}

export async function createAcademicPeriod(data: {
  name: string;
  startDate: Date;
  endDate: Date;
}) {
  await requireAuth(["SUPER_ADMIN"]);
  try {
    const period = await prisma.academicPeriod.create({ data });
    return { success: true, data: period };
  } catch (error) {
    return { success: false, error: "Failed to create period" };
  }
}

export async function updateAcademicPeriod(
  id: string,
  data: { name?: string; startDate?: Date; endDate?: Date },
) {
  await requireAuth(["SUPER_ADMIN"]);
  try {
    const period = await prisma.academicPeriod.update({ where: { id }, data });
    return { success: true, data: period };
  } catch (error) {
    return { success: false, error: "Failed to update period" };
  }
}

export async function deleteAcademicPeriod(id: string) {
  await requireAuth(["SUPER_ADMIN"]);
  try {
    await prisma.academicPeriod.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete period" };
  }
}

export async function setActivePeriod(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const period = await prisma.academicPeriod.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!period) {
      return {
        success: false,
        error: "Period not found",
      };
    }

    await prisma.academicPeriod.update({
      where: { id },
      data: {
        isActive: !period.isActive,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[setActivePeriod error]", error);

    return {
      success: false,
      error: "Failed to set active period",
    };
  }
}

export async function assignMaterialToPeriod(
  materialId: string,
  periodId: string | null,
) {
  await requireAuth(["SUPER_ADMIN"]);
  try {
    await prisma.material.update({
      where: { id: materialId },
      data: { periodId },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to assign material" };
  }
}

// Untuk worker — fetch materi aktif digroup per period
export async function getWorkerMaterialsByPeriod() {
  const { prisma } = await import("@/lib/prisma");
  const { auth } = await import("@/auth");

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const userId = session.user.id;

  try {
    const periods = await prisma.academicPeriod.findMany({
      where: {
        materials: { some: { status: "PUBLISHED" } },
      },
      orderBy: { startDate: "desc" },
      include: {
        materials: {
          where: { status: "PUBLISHED" },
          include: {
            topic: true,
            // mediaFiles: true,
            quizConfigs: true,
            progress: {
              where: { userId }, // ← filter by user yang login
            },
          },
        },
      },
    });

    const unassigned = await prisma.material.findMany({
      where: { status: "PUBLISHED", periodId: null },
      include: {
        topic: true,
        // mediaFiles: true,
        quizConfigs: true,
        progress: {
          where: { userId }, // ← filter by user yang login
        },
      },
    });

    return { success: true, data: { periods, unassigned } };
  } catch (error) {
    return { success: false, error: "Failed to fetch materials" };
  }
}
