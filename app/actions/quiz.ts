"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAuth } from "@/lib/role-guard";

// ============================================================================
// QUESTION BANK ACTIONS
// ============================================================================

export async function createQuestion(data: {
  text: string;
  type: string;
  difficulty: string;
  points?: number;
  explanation?: string;
  answers: Array<{ text: string; isCorrect: boolean }>;
}) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    // Find the correct answer
    const correctAnswer = data.answers.find((a) => a.isCorrect)?.text;
    if (!correctAnswer) {
      return { success: false, error: "Must have exactly one correct answer" };
    }

    const question = await prisma.questionBank.create({
      data: {
        text: data.text,
        type: data.type as any,
        difficulty: data.difficulty,
        points: data.points || 10,
        correctAnswer,
        answerOptions: {
          createMany: {
            data: data.answers.map((answer, idx) => ({
              text: answer.text,
              isCorrect: answer.isCorrect,
              orderIndex: idx,
            })),
          },
        },
      },
      include: {
        answerOptions: true,
      },
    });

    return { success: true, data: question };
  } catch (error) {
    console.error("[createQuestion error]", error);
    return { success: false, error: "Failed to create question" };
  }
}

export async function updateQuestion(
  id: string,
  data: {
    text?: string;
    difficulty?: string;
    points?: number;
    answers?: Array<{ text: string; isCorrect: boolean }>;
  },
) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const correctAnswer = data.answers?.find((a) => a.isCorrect)?.text;

    const question = await prisma.questionBank.update({
      where: { id },
      data: {
        ...(data.text && { text: data.text }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.points && { points: data.points }),
        ...(correctAnswer && { correctAnswer }),
        ...(data.answers && {
          answerOptions: {
            deleteMany: {},
            createMany: {
              data: data.answers.map((a, idx) => ({
                text: a.text,
                isCorrect: a.isCorrect,
                orderIndex: idx,
              })),
            },
          },
        }),
      },
      include: { answerOptions: true },
    });

    return { success: true, data: question };
  } catch (error) {
    console.error("[updateQuestion error]", error);
    return { success: false, error: "Failed to update question" };
  }
}

export async function deleteQuestion(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    await prisma.questionBank.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("[deleteQuestion error]", error);
    return { success: false, error: "Failed to delete question" };
  }
}

export async function getQuestions(page: number = 1, limit: number = 20) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const [questions, total] = await Promise.all([
      prisma.questionBank.findMany({
        include: { answerOptions: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.questionBank.count(),
    ]);

    return {
      success: true,
      data: questions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("[getQuestions error]", error);
    return { success: false, error: "Failed to fetch questions" };
  }
}

// ============================================================================
// QUIZ CONFIG ACTIONS
// ============================================================================

export async function createQuizConfig(data: {
  materialId: string;
  name: string;
  description?: string;
  totalQuestions: number;
  passingScore: number;
  timeLimit: number;
  allowRetake: boolean;
  maxRetries: number;
  showCorrectAns: boolean;
  shuffleQuestions: boolean;
  questionIds: string[];
  deadline?: Date; // ← tambah
}) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const quizConfig = await prisma.quizConfig.create({
      data: {
        materialId: data.materialId,
        name: data.name,
        description: data.description,
        totalQuestions: data.totalQuestions,
        passingScore: data.passingScore,
        timeLimit: data.timeLimit,
        allowRetake: data.allowRetake,
        maxRetries: data.maxRetries,
        showCorrectAns: data.showCorrectAns,
        shuffleQuestions: data.shuffleQuestions,
        deadline: data.deadline, // ← tambah
        questions: {
          connect: data.questionIds.map((id) => ({ id })),
        },
      },
    });

    return { success: true, data: quizConfig };
  } catch (error) {
    console.error("[createQuizConfig error]", error);
    return { success: false, error: "Failed to create quiz config" };
  }
}

export async function getQuizByMaterial(materialId: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const quizConfigs = await prisma.quizConfig.findMany({
      where: { materialId },
      include: {
        questions: { select: { id: true } },
      },
    });

    return {
      success: true,
      data: quizConfigs.map((q) => ({
        ...q,
        questionCount: q.questions.length,
      })),
    };
  } catch (error) {
    console.error("[getQuizByMaterial error]", error);
    return { success: false, error: "Failed to fetch quiz" };
  }
}

// ============================================================================
// QUIZ SESSION ACTIONS (WORKER)
// ============================================================================

// export async function startQuizSession(quizConfigId: string) {
//   const user = await getCurrentUser();
//   if (!user) return { success: false, error: "Unauthorized" };

//   try {
//     const quizConfig = await prisma.quizConfig.findUnique({
//       where: { id: quizConfigId },
//       include: { questionBankIds: true },
//     });

//     if (!quizConfig) {
//       return { success: false, error: "Quiz config not found" };
//     }

//     // Check material progress
//     const materialProgress = await prisma.materialProgress.findFirst({
//       where: {
//         userId: user.id,
//         materialId: quizConfig.materialId,
//       },
//     });

//     if (!materialProgress?.isCompleted) {
//       return { success: false, error: "You must complete the material first" };
//     }

//     // Check retry limit
//     const previousSessions = await prisma.quizSession.count({
//       where: {
//         userId: user.id,
//         quizConfigId,
//       },
//     });

//     if (!quizConfig.allowRetake && previousSessions > 0) {
//       return { success: false, error: "Retake not allowed" };
//     }

//     if (previousSessions >= quizConfig.maxRetries) {
//       return { success: false, error: "Max retries exceeded" };
//     }

//     // Create session
//     const session = await prisma.quizSession.create({
//       data: {
//         userId: user.id,
//         quizConfigId,
//         status: "ACTIVE",
//         startedAt: new Date(),
//         expiresAt: new Date(Date.now() + quizConfig.timeLimit * 1000),
//       },
//     });

//     return { success: true, data: session };
//   } catch (error) {
//     console.error("[startQuizSession error]", error);
//     return { success: false, error: "Failed to start quiz" };
//   }
// }

// export async function submitAnswer(
//   sessionId: string,
//   questionId: string,
//   answerId: string,
// ) {
//   const user = await getCurrentUser();
//   if (!user) return { success: false, error: "Unauthorized" };

//   try {
//     const answer = await prisma.userAnswer.create({
//       data: {
//         userId: user.id,
//         quizSessionId: sessionId,
//         questionId,
//         selectedAnswerId: answerId,
//         answeredAt: new Date(),
//       },
//     });

//     return { success: true, data: answer };
//   } catch (error) {
//     console.error("[submitAnswer error]", error);
//     return { success: false, error: "Failed to submit answer" };
//   }
// }

// export async function submitQuiz(sessionId: string) {
//   const user = await getCurrentUser();
//   if (!user) return { success: false, error: "Unauthorized" };

//   try {
//     const session = await prisma.quizSession.findUnique({
//       where: { id: sessionId },
//       include: {
//         userAnswers: {
//           include: {
//             question: true,
//             selectedAnswer: true,
//           },
//         },
//         quizConfig: true,
//       },
//     });

//     if (!session) return { success: false, error: "Session not found" };

//     // Calculate score
//     let correctCount = 0;
//     const userAnswers = session.userAnswers || [];

//     for (const userAnswer of userAnswers) {
//       if (userAnswer.selectedAnswer?.isCorrect) {
//         correctCount++;
//       }
//     }

//     const totalQuestions = session.quizConfig.totalQuestions;
//     const score = Math.round((correctCount / totalQuestions) * 100);
//     const passed = score >= session.quizConfig.passingScore;

//     // Update session
//     const updatedSession = await prisma.quizSession.update({
//       where: { id: sessionId },
//       data: {
//         status: "COMPLETED",
//         completedAt: new Date(),
//         score,
//         passed,
//       },
//     });

//     // Award points if passed
//     if (passed) {
//       const pointValue = session.quizConfig.totalQuestions * 10; // 10 pts per question
//       await prisma.pointTransaction.create({
//         data: {
//           userId: user.id,
//           amount: pointValue,
//           type: "QUIZ_COMPLETION",
//           referenceId: sessionId,
//           description: `Quiz passed: ${session.quizConfig.name}`,
//         },
//       });

//       // Update monthly summary
//       const now = new Date();
//       const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

//       await prisma.monthlyPointSummary.upsert({
//         where: {
//           userId_month: {
//             userId: user.id,
//             month: monthKey,
//           },
//         },
//         create: {
//           userId: user.id,
//           month: monthKey,
//           totalPoints: pointValue,
//           quizCompleted: 1,
//         },
//         update: {
//           totalPoints: {
//             increment: pointValue,
//           },
//           quizCompleted: {
//             increment: 1,
//           },
//         },
//       });
//     }

//     return { success: true, data: updatedSession };
//   } catch (error) {
//     console.error("[submitQuiz error]", error);
//     return { success: false, error: "Failed to submit quiz" };
//   }
// }
