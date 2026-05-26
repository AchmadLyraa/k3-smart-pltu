"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, validatePasswordStrength } from "@/auth";
import { registerSchema } from "@/lib/validations";

export async function registerUser(data: {
  email: string;
  name: string;
  password: string;
  nip?: string;
  unitId?: string;
  divisionId?: string;
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) return { success: false, error: "Email sudah terdaftar" };

    if (data.nip) {
      const existingNip = await prisma.user.findUnique({
        where: { nip: data.nip },
      });
      if (existingNip) return { success: false, error: "NIP sudah terdaftar" };
    }

    const passwordStrength = validatePasswordStrength(data.password);
    if (!passwordStrength.isValid) {
      return { success: false, error: passwordStrength.errors[0] };
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        nip: data.nip || null,
        unitId: data.unitId || null,
        divisionId: data.divisionId || null,
        role: "WORKER",
        status: "ACTIVE",
      },
      select: { id: true, email: true, name: true },
    });

    return { success: true, user };
  } catch (error) {
    console.error("[registerUser error]", error);
    return { success: false, error: "Registrasi gagal. Coba lagi." };
  }
}

// Fetch untuk dropdown
export async function getUnitsForRegister() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
    return { success: true, data: units };
  } catch {
    return { success: false, data: [] };
  }
}

export async function getDivisionsForRegister(unitId: string) {
  try {
    const divisions = await prisma.division.findMany({
      where: { unitId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
    return { success: true, data: divisions };
  } catch {
    return { success: false, data: [] };
  }
}

export async function getShiftsForRegister(divisionId: string) {
  try {
    const shifts = await prisma.shift.findMany({
      where: { divisionId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        startTime: true,
        endTime: true,
      },
    });
    return { success: true, data: shifts };
  } catch {
    return { success: false, data: [] };
  }
}
