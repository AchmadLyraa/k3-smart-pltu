"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, validatePasswordStrength } from "@/auth";
import { registerSchema } from "@/lib/validations";
import { signIn } from "next-auth/react";

export async function registerUser(data: {
  email: string;
  name: string;
  password: string;
}) {
  try {
    // Validate input
    const validated = registerSchema.safeParse({
      ...data,
      confirmPassword: data.password,
    });

    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message;
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email already registered",
      };
    }

    // Validate password strength
    const passwordStrength = validatePasswordStrength(data.password);
    if (!passwordStrength.isValid) {
      return {
        success: false,
        error: passwordStrength.errors[0],
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
        role: "WORKER",
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("[registerUser error]", error);
    return {
      success: false,
      error: "Registration failed. Please try again.",
    };
  }
}
