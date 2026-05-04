"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAuth } from "@/lib/role-guard";

export async function getWorkerMaterials() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const materials = await prisma.material.findMany({
      where: { status: "PUBLISHED" },
      include: {
        topic: true,
        mediaFiles: {
          select: { id: true, type: true, url: true },
        },
        progress: {
          where: { userId: user.id },
          select: { status: true, completedAt: true },
        },
        quizConfigs: {
          select: {
            id: true,
            name: true,
            totalQuestions: true,
            timeLimit: true,
            passingScore: true,
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
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const progress = await prisma.materialProgress.upsert({
      where: {
        userId_materialId: { userId: user.id, materialId },
      },
      update: {
        status: "COMPLETED",
        completedAt: new Date(),
        lastAccessed: new Date(),
      },
      create: {
        userId: user.id,
        materialId,
        status: "COMPLETED",
        startedAt: new Date(),
        completedAt: new Date(),
        lastAccessed: new Date(),
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
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const quizConfig = await prisma.quizConfig.findUnique({
      where: { id: quizConfigId },
      include: { questions: true },
    });

    if (!quizConfig) return { success: false, error: "Quiz not found" };

    const progress = await prisma.materialProgress.findUnique({
      where: {
        userId_materialId: {
          userId: user.id,
          materialId: quizConfig.materialId,
        },
      },
    });

    if (!progress?.completedAt)
      return { success: false, error: "Please complete the material first" };

    // Check attempt limit
    const attemptCount = await prisma.quizSession.count({
      where: {
        userId: user.id,
        quizConfigId,
        status: { not: "IN_PROGRESS" },
      },
    });

    if (!quizConfig.allowRetake && attemptCount > 0) {
      return { success: false, error: "Retake tidak diizinkan" };
    }

    if (quizConfig.allowRetake && attemptCount >= quizConfig.maxRetries) {
      return { success: false, error: "Batas percobaan telah habis" };
    }

    const questions = quizConfig.shuffleQuestions
      ? quizConfig.questions.sort(() => Math.random() - 0.5)
      : quizConfig.questions;

    const selectedQuestions = questions.slice(0, quizConfig.totalQuestions);

    const session = await prisma.quizSession.create({
      data: {
        userId: user.id,
        quizConfigId,
        totalQuestions: selectedQuestions.length,
        status: "IN_PROGRESS",
        questions: {
          create: selectedQuestions.map((q, idx) => ({
            questionId: q.id,
            orderIndex: idx,
          })),
        },
      },
      include: {
        questions: {
          include: {
            question: {
              include: { answerOptions: true },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return { success: true, data: { session, quizConfig } };
  } catch (error) {
    console.error("[startQuiz error]", error);
    return { success: false, error: "Failed to start quiz" };
  }
}

export async function submitQuizAnswer(
  sessionId: string,
  questionId: string,
  answer: string,
) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const userAnswer = await prisma.userAnswer.upsert({
      where: {
        quizSessionId_questionId: {
          quizSessionId: sessionId,
          questionId,
        },
      } as any,
      update: { answer },
      create: {
        quizSessionId: sessionId,
        userId: user.id,
        questionId,
        answer,
      },
    });

    return { success: true, data: userAnswer };
  } catch (error) {
    console.error("[submitQuizAnswer error]", error);
    return { success: false, error: "Failed to submit answer" };
  }
}

export async function completeQuiz(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const userAnswers = await prisma.userAnswer.findMany({
      where: { quizSessionId: sessionId },
      include: {
        question: { select: { id: true, correctAnswer: true, points: true } },
      },
    });

    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: { quizConfig: true },
    });

    if (!session) return { success: false, error: "Session not found" };

    let totalPoints = 0;
    let correctCount = 0;
    const maxPossiblePoints = userAnswers.reduce(
      (sum, a) => sum + a.question.points,
      0,
    );

    const updatedAnswers = await Promise.all(
      userAnswers.map(async (a) => {
        const isCorrect = a.answer === a.question.correctAnswer;
        if (isCorrect) {
          correctCount++;
          totalPoints += a.question.points;
        }
        return prisma.userAnswer.update({
          where: { id: a.id },
          data: { isCorrect, pointsEarned: isCorrect ? a.question.points : 0 },
        });
      }),
    );

    const percentage =
      maxPossiblePoints > 0
        ? Math.round((totalPoints / maxPossiblePoints) * 100)
        : 0;
    const passed = percentage >= session.quizConfig.passingScore;

    // Hitung time bonus
    const startedAt = session.startedAt;
    const submittedAt = new Date();
    const timeUsed = Math.round(
      (submittedAt.getTime() - startedAt.getTime()) / 1000,
    );
    const timeLimit = session.quizConfig.timeLimit;
    const unusedTime = Math.max(0, timeLimit - timeUsed); // jangan minus
    const unusedPercentage = unusedTime / timeLimit;
    const timeBonus = Math.floor(unusedPercentage * 100); // max 100 pts

    const updatedSession = await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: "GRADED",
        submittedAt: new Date(),
        score: totalPoints,
        correctAnswers: correctCount,
        passed,
      },
    });

    if (passed) {
      const alreadyPassed = await prisma.quizSession.findFirst({
        where: {
          userId: user.id,
          quizConfigId: session.quizConfigId,
          passed: true,
          id: { not: sessionId },
        },
      });

      if (!alreadyPassed) {
        const totalPointsWithBonus = totalPoints + timeBonus;

        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            points: totalPointsWithBonus,
            transactionType: "QUIZ_COMPLETION",
            description: `Quiz selesai: ${session.quizConfig.name} (+${timeBonus} time bonus)`,
            reference: sessionId,
          },
        });
      }
    }

    return {
      success: true,
      data: {
        passed,
        percentage,
        correctCount,
        totalQuestions: userAnswers.length,
        totalPoints,
        timeBonus,
        totalPointsWithBonus: passed ? totalPoints + timeBonus : 0,
        showCorrectAns: session.quizConfig.showCorrectAns,
        answers: updatedAnswers,
      },
    };
  } catch (error) {
    console.error("[completeQuiz error]", error);
    return { success: false, error: "Failed to complete quiz" };
  }
}

export async function getQuizByMaterial(materialId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const quizConfigs = await prisma.quizConfig.findMany({
      where: { materialId },
      include: {
        questions: { select: { id: true } },
      },
    });

    const quizWithAttempts = await Promise.all(
      quizConfigs.map(async (quiz) => {
        const attemptCount = await prisma.quizSession.count({
          where: {
            userId: user.id,
            quizConfigId: quiz.id,
            status: { not: "IN_PROGRESS" },
          },
        });
        const lastSession = await prisma.quizSession.findFirst({
          where: {
            userId: user.id,
            quizConfigId: quiz.id,
            status: { not: "IN_PROGRESS" },
          },
          orderBy: { createdAt: "desc" },
        });
        return { ...quiz, attemptCount, lastSession };
      }),
    );

    return { success: true, data: quizWithAttempts };
  } catch (error) {
    console.error("[getQuizByMaterial error]", error);
    return { success: false, error: "Failed to fetch quiz" };
  }
}

export async function getWorkerStats() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const [pointTransactions, materialsCompleted, quizPassed] =
      await Promise.all([
        prisma.pointTransaction.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.materialProgress.count({
          where: { userId: user.id, status: "COMPLETED" },
        }),
        prisma.quizSession.count({
          where: { userId: user.id, passed: true },
        }),
      ]);

    const totalEarned = pointTransactions
      .filter((t) => t.points > 0)
      .reduce((sum, t) => sum + t.points, 0);

    const totalSpent = pointTransactions
      .filter((t) => t.points < 0)
      .reduce((sum, t) => sum + Math.abs(t.points), 0);

    const availablePoints = totalEarned - totalSpent;

    return {
      success: true,
      data: {
        totalPoints: totalEarned,
        availablePoints,
        materialsCompleted,
        quizPassed,
        recentTransactions: pointTransactions.slice(0, 5),
      },
    };
  } catch (error) {
    console.error("[getWorkerStats error]", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
