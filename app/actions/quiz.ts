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
    const correctAnswers = data.answers
      .filter((a) => a.isCorrect)
      .map((a) => a.text);
    if (correctAnswers.length === 0) {
      return { success: false, error: "Harus ada minimal satu jawaban benar" };
    }

    // Untuk MULTIPLE_SELECT simpan comma-separated, yang lain simpan satu
    const correctAnswer =
      data.type === "MULTIPLE_SELECT"
        ? correctAnswers.sort().join(",")
        : correctAnswers[0];

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
      include: { answerOptions: true },
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
    type?: string;
    difficulty?: string;
    points?: number;
    answers?: Array<{ text: string; isCorrect: boolean }>;
  },
) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    let correctAnswer: string | undefined;

    if (data.answers) {
      const correctAnswers = data.answers
        .filter((a) => a.isCorrect)
        .map((a) => a.text);
      correctAnswer =
        data.type === "MULTIPLE_SELECT"
          ? correctAnswers.sort().join(",")
          : correctAnswers[0];
    }

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
