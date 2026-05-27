"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/role-guard";

export async function createTopic(data: {
  name: string;
  slug: string;
  description?: string;
}) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);

  try {
    // Check if slug already exists
    const existing = await prisma.topic.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return { success: false, error: "Slug already exists" };
    }

    const topic = await prisma.topic.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
      },
    });

    return { success: true, data: topic };
  } catch (error) {
    console.error("[createTopic error]", error);
    return { success: false, error: "Failed to create topic" };
  }
}

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

export async function deleteTopic(id: string) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);

  try {
    await prisma.topic.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("[deleteTopic error]", error);
    return { success: false, error: "Failed to delete topic" };
  }
}

export async function updateTopic(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string | null;
  },
) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);

  try {
    // Check if slug already exists for another topic
    const existing = await prisma.topic.findFirst({
      where: {
        slug: data.slug,
        id: { not: id },
      },
    });

    if (existing) {
      return { success: false, error: "Slug already exists" };
    }

    const topic = await prisma.topic.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
      },
    });

    return { success: true, data: topic };
  } catch (error) {
    console.error("[updateTopic error]", error);
    return { success: false, error: "Failed to update topic" };
  }
}
