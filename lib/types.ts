import { Prisma } from "@/prisma/generated/client";

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = "SUPER_ADMIN" | "HSE_ADMIN" | "REWARD_ADMIN" | "WORKER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface UserWithRelations extends Prisma.UserGetPayload<{
  include: {
    unit: true;
    division: true;
    shift: true;
  };
}> {}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  unitId?: string | null;
  divisionId?: string | null;
  shiftId?: string | null;
}

export interface AuthSession {
  user: AuthPayload;
  expires: string;
}

// ============================================================================
// CONTENT TYPES
// ============================================================================

export type MaterialType = "VIDEO" | "INFOGRAPHIC" | "ARTICLE";
export type MaterialStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface MaterialWithRelations extends Prisma.MaterialGetPayload<{
  include: {
    topic: true;
    mediaFiles: true;
  };
}> {}

// ============================================================================
// QUIZ TYPES
// ============================================================================

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
export type QuizStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";

export interface QuestionWithOptions extends Prisma.QuestionBankGetPayload<{
  include: {
    answerOptions: true;
  };
}> {}

export interface QuizSessionWithDetails extends Prisma.QuizSessionGetPayload<{
  include: {
    quizConfig: {
      include: {
        material: {
          include: {
            topic: true;
          };
        };
      };
    };
    questions: {
      include: {
        question: {
          include: {
            answerOptions: true;
          };
        };
      };
    };
  };
}> {}

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export type TransactionType =
  | "QUIZ_COMPLETION"
  | "MATERIAL_COMPLETION"
  | "DAILY_CHECKIN"
  | "STREAK_BONUS"
  | "BADGE_ACHIEVEMENT"
  | "MANUAL_ADJUSTMENT";
export type RedemptionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export interface UserStats {
  totalPoints: number;
  currentStreak: number;
  maxStreak: number;
  badgesCount: number;
  materialCompleted: number;
  quizzesCompleted: number;
  quizzesPassedCount: number;
  rank?: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(400, message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required") {
    super(401, message, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = "Not authorized") {
    super(403, message, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(404, message, "NOT_FOUND_ERROR");
    this.name = "NotFoundError";
  }
}
