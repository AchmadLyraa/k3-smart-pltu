"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAuth } from "@/lib/role-guard";

export async function getWorkerMaterials() {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const materials = await prisma.material.findMany({
      where: { status: "PUBLISHED" },
      include: {
        topic: true,
        mediaFiles: {
          select: {
            id: true,
            type: true,
            url: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: materials };
  } catch (error) {
    console.error("[getWorkerMaterials error]", error);
    return { success: false, error: "Failed to fetch materials" };
  }
}

export async function markMaterialComplete(materialId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const progress = await prisma.materialProgress.upsert({
      where: {
        userId_materialId: {
          userId: user.id,
          materialId: materialId,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        materialId: materialId,
        completedAt: new Date(),
      },
    });

    return { success: true, data: progress };
  } catch (error) {
    console.error("[markMaterialComplete error]", error);
    return { success: false, error: "Failed to mark material complete" };
  }
}

export async function getMaterialProgress(materialId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const progress = await prisma.materialProgress.findUnique({
      where: {
        userId_materialId: {
          userId: user.id,
          materialId: materialId,
        },
      },
    });

    return { success: true, data: progress };
  } catch (error) {
    console.error("[getMaterialProgress error]", error);
    return { success: false, error: "Failed to fetch progress" };
  }
}

export async function startQuiz(quizConfigId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const quizConfig = await prisma.quizConfig.findUnique({
      where: { id: quizConfigId },
    });

    if (!quizConfig) {
      return { success: false, error: "Quiz not found" };
    }

    // Check if material is completed first
    const material = await prisma.material.findUnique({
      where: { id: quizConfig.materialId },
    });

    if (!material) {
      return { success: false, error: "Material not found" };
    }

    const progress = await prisma.materialProgress.findUnique({
      where: {
        userId_materialId: {
          userId: user.id,
          materialId: material.id,
        },
      },
    });

    if (!progress || !progress.completedAt) {
      return { success: false, error: "Please complete the material first" };
    }

    // Create quiz session
    const session = await prisma.quizSession.create({
      data: {
        userId: user.id,
        quizConfigId: quizConfigId,
        startedAt: new Date(),
      },
    });

    return { success: true, data: session };
  } catch (error) {
    console.error("[startQuiz error]", error);
    return { success: false, error: "Failed to start quiz" };
  }
}

export async function submitQuizAnswer(
  sessionId: string,
  questionId: string,
  selectedAnswer: string,
) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const answer = await prisma.userAnswer.upsert({
      where: {
        sessionId_questionId: {
          sessionId: sessionId,
          questionId: questionId,
        },
      },
      update: {
        selectedAnswer: selectedAnswer,
      },
      create: {
        sessionId: sessionId,
        questionId: questionId,
        selectedAnswer: selectedAnswer,
      },
    });

    return { success: true, data: answer };
  } catch (error) {
    console.error("[submitQuizAnswer error]", error);
    return { success: false, error: "Failed to submit answer" };
  }
}

export async function completeQuiz(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get all answers for this session
    const userAnswers = await prisma.userAnswer.findMany({
      where: { sessionId },
      include: {
        question: {
          select: {
            id: true,
            correctAnswer: true,
            points: true,
          },
        },
      },
    });

    // Calculate score
    let totalPoints = 0;
    let correctCount = 0;

    userAnswers.forEach((answer) => {
      if (answer.selectedAnswer === answer.question.correctAnswer) {
        correctCount++;
        totalPoints += answer.question.points;
      }
    });

    // Update quiz session
    const session = await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        score: totalPoints,
      },
      include: {
        quizConfig: true,
      },
    });

    // Check if passed
    const passingScore = session.quizConfig.passingScore || 70;
    const percentage = (totalPoints / (userAnswers.length * 10)) * 100;
    const passed = percentage >= passingScore;

    // Award points if passed
    if (passed) {
      const pointsToAward = session.quizConfig.pointsForCompletion || 50;
      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          points: pointsToAward,
          type: "QUIZ_COMPLETION",
          description: `Quiz completion: ${session.quizConfig.title}`,
        },
      });
    }

    return {
      success: true,
      data: {
        session,
        passed,
        percentage: Math.round(percentage),
        correctCount,
        totalQuestions: userAnswers.length,
      },
    };
  } catch (error) {
    console.error("[completeQuiz error]", error);
    return { success: false, error: "Failed to complete quiz" };
  }
}
