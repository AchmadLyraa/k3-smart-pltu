import { z } from "zod";

// ============================================================================
// USER VALIDATION
// ============================================================================

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const loginSchema = signInSchema;

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    nip: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  email: z.string().email("Invalid email address").optional(),
  nip: z.string().optional(),
  unitId: z.string().optional(),
  divisionId: z.string().optional(),
  shiftId: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ============================================================================
// ORGANIZATIONAL VALIDATION
// ============================================================================

export const unitSchema = z.object({
  name: z.string().min(1, "Unit name is required").max(100),
  code: z.string().min(1, "Unit code is required").max(20),
  address: z.string().optional(),
});

export const divisionSchema = z.object({
  name: z.string().min(1, "Division name is required").max(100),
  code: z.string().min(1, "Division code is required").max(20),
  unitId: z.string().min(1, "Unit is required"),
});

export const shiftSchema = z.object({
  name: z.string().min(1, "Shift name is required").max(100),
  code: z.string().min(1, "Shift code is required").max(20),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  divisionId: z.string().min(1, "Division is required"),
});

// ============================================================================
// CONTENT VALIDATION
// ============================================================================

export const materialSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "INFOGRAPHIC", "ARTICLE"]),
  duration: z.number().int().nonnegative().default(0),
  topicId: z.string().min(1, "Topic is required"),
  thumbnail: z.string().url().optional(),
});

export const topicSchema = z.object({
  name: z.string().min(1, "Topic name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100),
  icon: z.string().optional(),
});

// ============================================================================
// QUIZ VALIDATION
// ============================================================================

export const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  points: z.number().int().positive().default(10),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export const quizConfigSchema = z.object({
  materialId: z.string().min(1, "Material is required"),
  name: z.string().min(1, "Quiz name is required").max(100),
  description: z.string().optional(),
  totalQuestions: z.number().int().positive().default(5),
  passingScore: z.number().int().min(0).max(100).default(70),
  timeLimit: z.number().int().positive().default(600),
  allowRetake: z.boolean().default(true),
  maxRetries: z.number().int().nonnegative().default(3),
  showCorrectAns: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(true),
});

export const submitAnswerSchema = z.object({
  quizSessionId: z.string().min(1, "Quiz session is required"),
  questionId: z.string().optional(),
  answer: z.string().min(1, "Answer is required"),
});

// ============================================================================
// REWARD VALIDATION
// ============================================================================

export const rewardSchema = z.object({
  name: z.string().min(1, "Reward name is required").max(100),
  description: z.string().optional(),
  pointCost: z.number().int().positive(),
  quantity: z.number().int().nonnegative(),
});

export const redeemRewardSchema = z.object({
  rewardId: z.string().min(1, "Reward is required"),
});

// Types exported from schemas
export type SignInInput = z.infer<typeof signInSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UnitInput = z.infer<typeof unitSchema>;
export type DivisionInput = z.infer<typeof divisionSchema>;
export type ShiftInput = z.infer<typeof shiftSchema>;
export type MaterialInput = z.infer<typeof materialSchema>;
export type TopicInput = z.infer<typeof topicSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type QuizConfigInput = z.infer<typeof quizConfigSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type RewardInput = z.infer<typeof rewardSchema>;
export type RedeemRewardInput = z.infer<typeof redeemRewardSchema>;
