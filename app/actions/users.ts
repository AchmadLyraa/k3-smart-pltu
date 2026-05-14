"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/auth";
import { requireAuth, isAdmin } from "@/lib/role-guard";
import { updateProfileSchema } from "@/lib/validations";

/**
 * Create new user (admin only)
 */
export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  nip?: string;
  role?: string;
}) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        error: "Invalid email format",
      };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email already in use",
      };
    }

    // Validate password strength
    if (data.password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters",
      };
    }

    if (!/[A-Z]/.test(data.password)) {
      return {
        success: false,
        error: "Password must contain uppercase letter",
      };
    }

    if (!/[a-z]/.test(data.password)) {
      return {
        success: false,
        error: "Password must contain lowercase letter",
      };
    }

    if (!/[0-9]/.test(data.password)) {
      return {
        success: false,
        error: "Password must contain number",
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        nip: data.nip,
        role: (data.role || "WORKER") as any,
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("[createUser error]", error);
    return {
      success: false,
      error: "Failed to create user",
    };
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(page = 1, limit = 10) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);

  const skip = (page - 1) * limit;

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          nip: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          unit: {
            select: { id: true, name: true },
          },
          division: {
            select: { id: true, name: true },
          },
          shift: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getAllUsers error]", error);
    return {
      success: false,
      error: "Failed to fetch users",
    };
  }
}

/**
 * Get user by ID
 */
export async function getUser(userId: string) {
  await requireAuth();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        nip: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        unitId: true,
        divisionId: true,
        shiftId: true,
        unit: {
          select: { id: true, name: true },
        },
        division: {
          select: { id: true, name: true },
        },
        shift: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("[getUser error]", error);
    return {
      success: false,
      error: "Failed to fetch user",
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    email?: string;
    nip?: string;
    unitId?: string;
    divisionId?: string;
    shiftId?: string;
  },
) {
  const session = await requireAuth();
  const currentUser = session.user as any;

  // Users can only update their own profile unless admin
  if (currentUser.id !== userId && currentUser.role !== "SUPER_ADMIN") {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const validated = updateProfileSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: "Validation failed",
    };
  }

  try {
    // Check if email is already taken
    if (validated.data.email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: validated.data.email,
          id: { not: userId },
        },
      });

      if (existing) {
        return {
          success: false,
          error: "Email already in use",
        };
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validated.data.name,
        email: validated.data.email,
        nip: validated.data.nip,
        unitId: validated.data.unitId,
        divisionId: validated.data.divisionId,
        shiftId: validated.data.shiftId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nip: true,
        role: true,
        status: true,
      },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("[updateUserProfile error]", error);
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: string) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);

  const validRoles = ["SUPER_ADMIN", "HSE_ADMIN", "SUPERVISOR", "WORKER"];
  if (!validRoles.includes(role)) {
    return {
      success: false,
      error: "Invalid role",
    };
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("[updateUserRole error]", error);
    return {
      success: false,
      error: "Failed to update user role",
    };
  }
}

/**
 * Update user status (admin only)
 */
export async function updateUserStatus(userId: string, status: string) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);

  const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"];
  if (!validStatuses.includes(status)) {
    return {
      success: false,
      error: "Invalid status",
    };
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("[updateUserStatus error]", error);
    return {
      success: false,
      error: "Failed to update user status",
    };
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("[deleteUser error]", error);
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
}

/**
 * Generate random strong password
 */
function generateRandomPassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";

  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  const all = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password.split("").sort(() => Math.random() - 0.5).join("");
}

/**
 * Get user profile (with full details)
 */
export async function getUserProfile(userId: string) {
  await requireAuth();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        nip: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        unitId: true,
        divisionId: true,
        shiftId: true,
        unit: {
          select: { id: true, name: true },
        },
        division: {
          select: { id: true, name: true },
        },
        shift: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("[getUserProfile error]", error);
    return {
      success: false,
      error: "Failed to fetch profile",
    };
  }
}

/**
 * Change password (user action)
 */
export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
) {
  await requireAuth();

  const user = await getUserProfile(userId);
  if (!user.success || !user.data) {
    return {
      success: false,
      error: "User not found",
    };
  }

  try {
    // Get current user's password hash
    const userWithPassword = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!userWithPassword || !userWithPassword.password) {
      return {
        success: false,
        error: "User password not set",
      };
    }

    // Verify old password
    const { verifyPassword } = await import("@/auth");
    const isPasswordCorrect = await verifyPassword(
      oldPassword,
      userWithPassword.password,
    );

    if (!isPasswordCorrect) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return {
        success: false,
        error: "New password must be at least 8 characters",
      };
    }

    if (!/[A-Z]/.test(newPassword)) {
      return {
        success: false,
        error: "New password must contain uppercase letter",
      };
    }

    if (!/[a-z]/.test(newPassword)) {
      return {
        success: false,
        error: "New password must contain lowercase letter",
      };
    }

    if (!/[0-9]/.test(newPassword)) {
      return {
        success: false,
        error: "New password must contain number",
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("[changePassword error]", error);
    return {
      success: false,
      error: "Failed to change password",
    };
  }
}

/**
 * Reset password (admin only) - generates new password
 */
export async function resetPassword(userId: string) {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Generate new password
    const newPassword = generateRandomPassword();
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        newPassword: newPassword,
      },
      message: "Password reset successfully. New password generated.",
    };
  } catch (error) {
    console.error("[resetPassword error]", error);
    return {
      success: false,
      error: "Failed to reset password",
    };
  }
}
