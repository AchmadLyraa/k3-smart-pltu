"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/role-guard";
import { MaterialType, MaterialStatus } from "@/prisma/generated/client";

// ============================================================================
// MATERIAL ACTIONS
// ============================================================================

export async function createMaterial(data: {
  topicId: string;
  title: string;
  description?: string;
  type: MaterialType;
  duration?: number;
  thumbnail?: string;
}) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const material = await prisma.material.create({
      data: {
        topicId: data.topicId,
        title: data.title,
        description: data.description,
        type: data.type,
        duration: data.duration || 0,
        thumbnail: data.thumbnail,
        status: MaterialStatus.DRAFT,
      },
    });

    return { success: true, data: material };
  } catch (error) {
    console.error("[createMaterial error]", error);
    return { success: false, error: "Failed to create material" };
  }
}

export async function updateMaterial(
  id: string,
  data: {
    title?: string;
    description?: string;
    type?: MaterialType;
    topicId?: string;
    duration?: number;
    thumbnail?: string;
  },
) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const material = await prisma.material.update({
      where: { id },
      data,
    });

    return { success: true, data: material };
  } catch (error) {
    console.error("[updateMaterial error]", error);
    return { success: false, error: "Failed to update material" };
  }
}

export async function publishMaterial(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const material = await prisma.material.update({
      where: { id },
      data: {
        status: MaterialStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        topic: true,
      },
    });

    // Ambil semua worker yang ACTIVE
    const workers = await prisma.user.findMany({
      where: {
        role: "WORKER",
        status: "ACTIVE",
      },
      select: { id: true },
    });

    // Bulk insert notifikasi ke semua worker
    if (workers.length > 0) {
      await prisma.notificationLog.createMany({
        data: workers.map((worker) => ({
          userId: worker.id,
          materialId: material.id,
          type: "NEW_MATERIAL",
          subject: "Materi Baru Tersedia! 📚",
          message: `Materi baru "${material.title}" dari topik ${material.topic.name} telah dipublikasikan. Yuk pelajari sekarang!`,
          status: "PENDING",
        })),
        skipDuplicates: true,
      });
    }

    return { success: true, data: material };
  } catch (error) {
    console.error("[publishMaterial error]", error);
    return { success: false, error: "Failed to publish material" };
  }
}

export async function archiveMaterial(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const material = await prisma.material.update({
      where: { id },
      data: { status: MaterialStatus.ARCHIVED },
    });

    return { success: true, data: material };
  } catch (error) {
    console.error("[archiveMaterial error]", error);
    return { success: false, error: "Failed to archive material" };
  }
}

export async function deleteMaterial(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    await prisma.material.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("[deleteMaterial error]", error);
    return { success: false, error: "Failed to delete material" };
  }
}

export async function getMaterials(
  status?: MaterialStatus,
  topicId?: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (topicId) where.topicId = topicId;
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        include: {
          topic: true,
          mediaFiles: true,
          quizConfigs: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.material.count({ where }),
    ]);

    return {
      success: true,
      data: materials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getMaterials error]", error);
    return { success: false, error: "Failed to fetch materials" };
  }
}

export async function getMaterialDetail(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        topic: true,
        mediaFiles: true,
        quizConfigs: {
          include: {
            questionBankIds: true,
          },
        },
      },
    });

    if (!material) {
      return { success: false, error: "Material not found" };
    }

    return { success: true, data: material };
  } catch (error) {
    console.error("[getMaterialDetail error]", error);
    return { success: false, error: "Failed to fetch material" };
  }
}

// ============================================================================
// MEDIA FILE ACTIONS
// ============================================================================

export async function addMediaFile(data: {
  materialId: string;
  url: string;
  type: string;
  fileName: string;
  duration?: number;
}) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const mediaFile = await prisma.mediaFile.create({
      data: {
        materialId: data.materialId,
        url: data.url,
        type: data.type,
        fileName: data.fileName,
        duration: data.duration || 0,
      },
    });

    return { success: true, data: mediaFile };
  } catch (error) {
    console.error("[addMediaFile error]", error);
    return { success: false, error: "Failed to add media file" };
  }
}

export async function removeMediaFile(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    await prisma.mediaFile.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("[removeMediaFile error]", error);
    return { success: false, error: "Failed to remove media file" };
  }
}

// ============================================================================
// TOPIC ACTIONS
// ============================================================================

export async function getAllTopics() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: topics };
  } catch (error) {
    console.error("[getAllTopics error]", error);
    return { success: false, error: "Failed to fetch topics" };
  }
}

export async function createTopic(data: {
  name: string;
  slug: string;
  icon?: string;
}) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const topic = await prisma.topic.create({
      data,
    });
    return { success: true, data: topic };
  } catch (error) {
    console.error("[createTopic error]", error);
    return { success: false, error: "Failed to create topic" };
  }
}
