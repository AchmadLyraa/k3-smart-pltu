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

// app/actions/worker.ts
export async function checkAndSubmitExpiredSessions() {
  const user = await getCurrentUser();
  if (!user) return;

  try {
    // Cari semua session IN_PROGRESS yang sudah expired
    const expiredSessions = await prisma.quizSession.findMany({
      where: {
        userId: user.id,
        status: "IN_PROGRESS",
      },
      include: { quizConfig: true },
    });

    for (const session of expiredSessions) {
      const elapsed = Math.floor(
        (Date.now() - new Date(session.startedAt).getTime()) / 1000,
      );

      if (elapsed >= session.quizConfig.timeLimit) {
        // Auto submit dengan jawaban yang sudah ada
        await completeQuiz(session.id);
      }
    }
  } catch (error) {
    console.error("[checkAndSubmitExpiredSessions error]", error);
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

    await checkAndSubmitExpiredSessions();

    // ← Cek apakah ada session IN_PROGRESS yang belum expired
    const existingSession = await prisma.quizSession.findFirst({
      where: {
        userId: user.id,
        quizConfigId,
        status: "IN_PROGRESS",
      },
      include: {
        questions: {
          include: {
            question: { include: { answerOptions: true } },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (existingSession) {
      const elapsed = Math.floor(
        (Date.now() - new Date(existingSession.startedAt).getTime()) / 1000,
      );
      const timeLeft = quizConfig.timeLimit - elapsed;

      if (timeLeft > 0) {
        // Fetch jawaban yang sudah diisi
        const existingAnswers = await prisma.userAnswer.findMany({
          where: { quizSessionId: existingSession.id },
          select: { questionId: true, answer: true },
        });

        return {
          success: true,
          data: {
            session: existingSession,
            quizConfig,
            existingAnswers, // ← tambah ini
          },
        };
      }
    }

    // Check attempt limit
    const attemptCount = await prisma.quizSession.count({
      where: {
        userId: user.id,
        quizConfigId,
        status: { not: "IN_PROGRESS" },
      },
    });

    if (!quizConfig.allowRetake && attemptCount > 0)
      return { success: false, error: "Retake tidak diizinkan" };

    if (quizConfig.allowRetake && attemptCount >= quizConfig.maxRetries)
      return { success: false, error: "Batas percobaan telah habis" };

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
            question: { include: { answerOptions: true } },
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

    // Filter null — soal mungkin sudah dihapus
    const validAnswers = userAnswers.filter((a) => a.question !== null);

    let totalPoints = 0;
    let correctCount = 0;

    // Ambil semua soal di session ini
    const sessionQuestions = await prisma.quizSessionQuestion.findMany({
      where: { quizSessionId: sessionId },
      include: {
        question: { select: { id: true, points: true } },
      },
    });

    // maxPossiblePoints dari SEMUA soal di session, bukan cuma yang dijawab
    const maxPossiblePoints = sessionQuestions
      .filter((sq) => sq.question !== null)
      .reduce((sum, sq) => sum + sq.question.points, 0);

    const updatedAnswers = await Promise.all(
      validAnswers.map(async (a) => {
        const correctAnswers = a.question.correctAnswer
          .split(",")
          .map((s) => s.trim())
          .sort();
        const userAnswerList = a.answer
          .split(",")
          .map((s) => s.trim())
          .sort();
        const isCorrect =
          JSON.stringify(correctAnswers) === JSON.stringify(userAnswerList);

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
    const unusedTime = Math.max(0, timeLimit - timeUsed);
    const unusedPercentage = unusedTime / timeLimit;
    const timeBonus = Math.floor(unusedPercentage * 100);

    let deadlinePenalty = 0;
    let daysLate = 0;
    let penaltyPoints = 0;
    let adjustedPoints = totalPoints;
    let totalPointsWithBonus = 0;

    await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: "GRADED",
        submittedAt,
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
        let description = `Quiz selesai: ${session.quizConfig.name}`;

        if (session.quizConfig.deadline) {
          const deadlineDate = new Date(session.quizConfig.deadline);
          if (submittedAt > deadlineDate) {
            daysLate = Math.ceil(
              (submittedAt.getTime() - deadlineDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            deadlinePenalty = Math.min(daysLate * 5, 40);
          }
        }

        penaltyPoints = Math.floor((totalPoints * deadlinePenalty) / 100);
        adjustedPoints = totalPoints - penaltyPoints;
        totalPointsWithBonus = adjustedPoints + timeBonus;

        if (deadlinePenalty > 0) {
          description += ` (Terlambat ${daysLate} hari, -${deadlinePenalty}%)`;
        }
        if (timeBonus > 0) {
          description += ` (+${timeBonus} time bonus)`;
        }

        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            points: totalPointsWithBonus,
            transactionType: "QUIZ_COMPLETION",
            description,
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
        totalQuestions: sessionQuestions.length,
        totalPoints,
        timeBonus,
        penaltyPercent: deadlinePenalty,
        penaltyPoints,
        daysLate,
        adjustedPoints,
        totalPointsWithBonus,
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
    const [
      pointTransactions,
      materialsCompleted,
      quizPassed,
      semesterSummaries,
    ] = await Promise.all([
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
      prisma.semesterSummary.findMany({
        where: { userId: user.id },
        select: { totalPoints: true },
      }),
    ]);

    const totalEarned = pointTransactions
      .filter((t) => t.points > 0)
      .reduce((sum, t) => sum + t.points, 0);

    const totalSpent = pointTransactions
      .filter((t) => t.points < 0)
      .reduce((sum, t) => sum + Math.abs(t.points), 0);

    const availablePoints = totalEarned - totalSpent;

    // Akumulasi dari semester-semester lalu + aktif sekarang
    const historicalPoints = semesterSummaries.reduce(
      (sum, s) => sum + s.totalPoints,
      0,
    );
    const allTimePoints = historicalPoints + totalEarned;

    return {
      success: true,
      data: {
        allTimePoints, // total dari awal sampai sekarang
        totalPoints: totalEarned, // poin semester berjalan
        availablePoints, // bisa ditukar (earned - spent semester ini)
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

export async function getWorkerQuizHistory() {
  const session = await requireAuth(["WORKER"]);
  const userId = (session.user as any).id as string;

  try {
    const histories = await prisma.quizSession.findMany({
      where: {
        userId,

        status: {
          in: ["SUBMITTED", "GRADED"],
        },
      },

      select: {
        id: true,
        score: true,
        passed: true,
        submittedAt: true,
        createdAt: true,

        quizConfig: {
          select: {
            id: true,
            name: true,
            passingScore: true,

            material: {
              select: {
                id: true,
                title: true,

                topic: {
                  select: {
                    name: true,
                  },
                },

                period: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },

      orderBy: {
        submittedAt: "desc",
      },
    });

    const passed = histories.filter((h) => h.passed === true).length;

    const failed = histories.filter((h) => h.passed === false).length;

    return {
      success: true,

      data: {
        histories,

        stats: {
          total: histories.length,
          passed,
          failed,
        },
      },
    };
  } catch (error) {
    console.error("[getWorkerQuizHistory error]", error);

    return {
      success: false,
      error: "Failed to load quiz history",
    };
  }
}

export async function getQuizHistoryDetail(sessionId: string) {
  const session = await requireAuth(["WORKER"]);
  const userId = (session.user as any).id as string;

  try {
    const detail = await prisma.quizSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },

      select: {
        id: true,
        score: true,
        passed: true,
        submittedAt: true,
        correctAnswers: true,
        totalQuestions: true,

        quizConfig: {
          select: {
            name: true,
            passingScore: true,
          },
        },

        userAnswers: {
          select: {
            id: true,
            answer: true,
            isCorrect: true,
            pointsEarned: true,

            question: {
              select: {
                text: true,
                correctAnswer: true,
              },
            },
          },
        },
      },
    });

    if (!detail) {
      return {
        success: false,
        error: "Quiz history not found",
      };
    }

    return {
      success: true,
      data: detail,
    };
  } catch (error) {
    console.error("[getQuizHistoryDetail error]", error);

    return {
      success: false,
      error: "Failed to load quiz detail",
    };
  }
}
