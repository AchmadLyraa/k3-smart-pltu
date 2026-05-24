"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAuth } from "@/lib/role-guard";

// ============================================================================
// QUIZ CAMPAIGN — CRUD
// ============================================================================

export async function createQuizCampaign(data: {
  title: string;
  description?: string;
  periodId?: string;
  basePoints: number;
  deadline?: Date;
  timeLimit: number;
  totalQuestions: number;
  passingScore: number;
  allowRetake: boolean;
  maxRetries: number;
  shuffleQuestions: boolean;
  showCorrectAns: boolean;
  questionIds: string[];
}) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const campaign = await prisma.quizCampaign.create({
      data: {
        title: data.title,
        description: data.description,
        periodId: data.periodId,
        basePoints: data.basePoints,
        deadline: data.deadline,
        timeLimit: data.timeLimit,
        totalQuestions: data.totalQuestions,
        passingScore: data.passingScore,
        allowRetake: data.allowRetake,
        maxRetries: data.maxRetries,
        shuffleQuestions: data.shuffleQuestions,
        showCorrectAns: data.showCorrectAns,
        questions: {
          create: data.questionIds.map((qId, idx) => ({
            questionId: qId,
            orderIndex: idx,
          })),
        },
      },
      include: {
        questions: {
          include: { question: { include: { answerOptions: true } } },
        },
      },
    });

    return { success: true, data: campaign };
  } catch (error) {
    console.error("[createQuizCampaign error]", error);
    return { success: false, error: "Failed to create quiz campaign" };
  }
}

export async function updateQuizCampaign(
  id: string,
  data: {
    title?: string;
    description?: string;
    periodId?: string;
    basePoints?: number;
    deadline?: Date | null;
    timeLimit?: number;
    totalQuestions?: number;
    passingScore?: number;
    status?: string;
    allowRetake?: boolean;
    maxRetries?: number;
    shuffleQuestions?: boolean;
    showCorrectAns?: boolean;
    questionIds?: string[];
  },
) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const updateData: any = { ...data };
    delete updateData.questionIds;

    // Jika ada perubahan questionIds, update relasi
    if (data.questionIds) {
      await prisma.quizCampaignQuestion.deleteMany({
        where: { campaignId: id },
      });
      await prisma.quizCampaignQuestion.createMany({
        data: data.questionIds.map((qId, idx) => ({
          campaignId: id,
          questionId: qId,
          orderIndex: idx,
        })),
      });
    }

    const campaign = await prisma.quizCampaign.update({
      where: { id },
      data: updateData,
      include: {
        questions: {
          include: { question: { include: { answerOptions: true } } },
        },
      },
    });

    return { success: true, data: campaign };
  } catch (error) {
    console.error("[updateQuizCampaign error]", error);
    return { success: false, error: "Failed to update quiz campaign" };
  }
}

export async function deleteQuizCampaign(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    await prisma.quizCampaign.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("[deleteQuizCampaign error]", error);
    return { success: false, error: "Failed to delete quiz campaign" };
  }
}

export async function getQuizCampaigns() {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const campaigns = await prisma.quizCampaign.findMany({
      include: {
        period: { select: { id: true, name: true } },
        _count: { select: { questions: true, sessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: campaigns };
  } catch (error) {
    console.error("[getQuizCampaigns error]", error);
    return { success: false, error: "Failed to fetch quiz campaigns" };
  }
}

export async function getQuizCampaign(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const campaign = await prisma.quizCampaign.findUnique({
      where: { id },
      include: {
        period: { select: { id: true, name: true } },
        questions: {
          include: { question: { include: { answerOptions: true } } },
        },
      },
    });

    if (!campaign) return { success: false, error: "Campaign not found" };

    return { success: true, data: campaign };
  } catch (error) {
    console.error("[getQuizCampaign error]", error);
    return { success: false, error: "Failed to fetch quiz campaign" };
  }
}

// ============================================================================
// WORKER — GET ACTIVE CAMPAIGNS
// ============================================================================

export async function getActiveCampaigns() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const campaigns = await prisma.quizCampaign.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        _count: { select: { questions: true } },
        sessions: {
          where: { userId: user.id },
          select: { id: true, passed: true, score: true, status: true, submittedAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { deadline: "asc" },
    });

    // Add attempt count for each campaign
    const campaignsWithAttempts = await Promise.all(
      campaigns.map(async (c) => {
        const attemptCount = await prisma.quizSession.count({
          where: {
            userId: user.id,
            quizCampaignId: c.id,
            status: { not: "IN_PROGRESS" },
          },
        });
        return {
          ...c,
          attemptCount,
          maxRetries: c.maxRetries,
        };
      }),
    );

    return { success: true, data: campaignsWithAttempts };
  } catch (error) {
    console.error("[getActiveCampaigns error]", error);
    return { success: false, error: "Failed to fetch campaigns" };
  }
}

// ============================================================================
// WORKER — START CAMPAIGN QUIZ
// ============================================================================

export async function startCampaignQuiz(campaignId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const campaign = await prisma.quizCampaign.findUnique({
      where: { id: campaignId, status: "PUBLISHED" },
      include: {
        questions: {
          include: { question: { include: { answerOptions: true } } },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!campaign) return { success: false, error: "Campaign not found or not published" };

    // Check if there's already an IN_PROGRESS session
    const existingSession = await prisma.quizSession.findFirst({
      where: {
        userId: user.id,
        quizCampaignId: campaignId,
        status: "IN_PROGRESS",
      },
      include: {
        questions: {
          include: { question: { include: { answerOptions: true } } },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (existingSession) {
      const timeLimit = campaign.timeLimit;
      const elapsed = Math.floor((Date.now() - new Date(existingSession.startedAt).getTime()) / 1000);
      const timeLeft = timeLimit - elapsed;

      if (timeLeft > 0) {
        const existingAnswers = await prisma.userAnswer.findMany({
          where: { quizSessionId: existingSession.id },
          select: { questionId: true, answer: true },
        });

        return {
          success: true,
          data: {
            session: existingSession,
            campaign,
            existingAnswers,
          },
        };
      }
    }

    // Check attempt limit
    const attemptCount = await prisma.quizSession.count({
      where: {
        userId: user.id,
        quizCampaignId: campaignId,
        status: { not: "IN_PROGRESS" },
      },
    });

    if (!campaign.allowRetake && attemptCount > 0) {
      return { success: false, error: "Kuis ini hanya bisa dikerjakan 1 kali" };
    }

    if (campaign.allowRetake && attemptCount >= campaign.maxRetries) {
      return { success: false, error: "Batas percobaan telah habis" };
    }

    // Select & shuffle questions
    let selectedQuestions = campaign.questions;
    if (campaign.shuffleQuestions) {
      selectedQuestions = [...selectedQuestions].sort(() => Math.random() - 0.5);
    }

    const limitedQuestions = selectedQuestions.slice(0, campaign.totalQuestions);

    const session = await prisma.quizSession.create({
      data: {
        userId: user.id,
        quizConfigId: null,
        quizCampaignId: campaignId,
        totalQuestions: limitedQuestions.length,
        status: "IN_PROGRESS",
        questions: {
          create: limitedQuestions.map((q, idx) => ({
            questionId: q.question.id,
            orderIndex: idx,
          })),
        },
      },
      include: {
        questions: {
          include: { question: { include: { answerOptions: true } } },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return {
      success: true,
      data: { session, campaign, existingAnswers: [] },
    };
  } catch (error) {
    console.error("[startCampaignQuiz error]", error);
    return { success: false, error: "Failed to start campaign quiz" };
  }
}

// ============================================================================
// WORKER — COMPLETE CAMPAIGN QUIZ
// ============================================================================

export async function completeCampaignQuiz(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        quizCampaign: true,
        questions: {
          include: { question: { select: { id: true, points: true } } },
        },
      },
    });

    if (!session?.quizCampaign) return { success: false, error: "Session or campaign not found" };

    const campaign = session.quizCampaign;

    // Get user answers
    const userAnswers = await prisma.userAnswer.findMany({
      where: { quizSessionId: sessionId },
      include: {
        question: { select: { id: true, correctAnswer: true, points: true } },
      },
    });

    const validAnswers = userAnswers.filter((a): a is typeof a & { question: NonNullable<typeof a.question> } => a.question !== null);

    // Calculate score based on basePoints
    const correctCount = validAnswers.filter((a) => {
      const correctAnswers = a.question.correctAnswer.split(",").map((s) => s.trim()).sort();
      const userAnswerList = a.answer.split(",").map((s) => s.trim()).sort();
      return JSON.stringify(correctAnswers) === JSON.stringify(userAnswerList);
    }).length;

    const percentage = Math.round((correctCount / session.totalQuestions) * 100);
    const passed = percentage >= campaign.passingScore;

    // Calculate points: (correct / total) * basePoints
    const rawPoints = Math.round((correctCount / session.totalQuestions) * campaign.basePoints);

    // Time bonus & penalty (same as quiz material logic)
    const startedAt = session.startedAt;
    const submittedAt = new Date();
    const timeUsed = Math.round((submittedAt.getTime() - startedAt.getTime()) / 1000);
    const unusedTime = Math.max(0, campaign.timeLimit - timeUsed);
    const unusedPercentage = unusedTime / campaign.timeLimit;
    const timeBonus = Math.floor(unusedPercentage * 100);

    let deadlinePenalty = 0;
    let daysLate = 0;
    let penaltyPoints = 0;
    let adjustedPoints = rawPoints;
    let totalPointsWithBonus = rawPoints;

    // Update answers with isCorrect
    await Promise.all(
      validAnswers.map(async (a) => {
        const correctAnswers = a.question.correctAnswer.split(",").map((s) => s.trim()).sort();
        const userAnswerList = a.answer.split(",").map((s) => s.trim()).sort();
        const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswerList);
        return prisma.userAnswer.update({
          where: { id: a.id },
          data: { isCorrect, pointsEarned: isCorrect ? Math.round(campaign.basePoints / session.totalQuestions) : 0 },
        });
      }),
    );

    // Check deadline
    if (campaign.deadline) {
      const deadlineDate = new Date(campaign.deadline);
      if (submittedAt > deadlineDate) {
        // Time bonus = 0 if past deadline
        // But penalty still applies
        daysLate = Math.ceil((submittedAt.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24));
        deadlinePenalty = Math.min(daysLate * 5, 40);
        penaltyPoints = Math.floor((rawPoints * deadlinePenalty) / 100);
        adjustedPoints = rawPoints - penaltyPoints;
        totalPointsWithBonus = adjustedPoints; // No time bonus if past deadline
      } else {
        totalPointsWithBonus = rawPoints + timeBonus;
      }
    } else {
      totalPointsWithBonus = rawPoints + timeBonus;
    }

    // Update session
    await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: "GRADED",
        submittedAt,
        score: rawPoints,
        correctAnswers: correctCount,
        passed,
      },
    });

    // Award points if passed and not already awarded
    if (passed) {
      const alreadyPassed = await prisma.quizSession.findFirst({
        where: {
          userId: user.id,
          quizCampaignId: campaign.id,
          passed: true,
          id: { not: sessionId },
        },
      });

      if (!alreadyPassed) {
        let description = `Quiz campaign: ${campaign.title}`;
        if (deadlinePenalty > 0) {
          description += ` (Terlambat ${daysLate} hari, -${deadlinePenalty}%)`;
        }
        if (timeBonus > 0 && (!campaign.deadline || submittedAt <= campaign.deadline)) {
          description += ` (+${timeBonus} time bonus)`;
        }

        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            periodId: campaign.periodId,
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
        totalQuestions: session.totalQuestions,
        totalPoints: rawPoints,
        timeBonus: (campaign.deadline && submittedAt > campaign.deadline) ? 0 : timeBonus,
        penaltyPercent: deadlinePenalty,
        penaltyPoints,
        daysLate,
        adjustedPoints,
        totalPointsWithBonus,
        showCorrectAns: campaign.showCorrectAns,
        answers: validAnswers.map((a) => ({
          questionId: a.questionId,
          answer: a.answer,
          isCorrect: a.isCorrect ?? false,
        })),
      },
    };
  } catch (error) {
    console.error("[completeCampaignQuiz error]", error);
    return { success: false, error: "Failed to complete campaign quiz" };
  }
}