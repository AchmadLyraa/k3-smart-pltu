// app/actions/master-data.ts

"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/role-guard";

// ========================= GET =========================

export async function getUnits() {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);

  try {
    const units = await prisma.unit.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: units,
    };
  } catch (error) {
    console.error("[getUnits]", error);

    return {
      success: false,
      error: "Gagal mengambil data unit",
    };
  }
}

export async function getDivisions() {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);

  try {
    const divisions = await prisma.division.findMany({
      include: {
        unit: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: divisions,
    };
  } catch (error) {
    console.error("[getDivisions]", error);

    return {
      success: false,
      error: "Gagal mengambil data divisi",
    };
  }
}

export async function getShifts() {
  await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);

  try {
    const shifts = await prisma.shift.findMany({
      include: {
        division: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: shifts,
    };
  } catch (error) {
    console.error("[getShifts]", error);

    return {
      success: false,
      error: "Gagal mengambil data shift",
    };
  }
}

// ========================= CREATE =========================

export async function createUnit(data: { name: string; code: string }) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    if (!data.name || !data.code) {
      return {
        success: false,
        error: "Nama dan kode unit wajib diisi",
      };
    }

    const unit = await prisma.unit.create({
      data: {
        name: data.name,
        code: data.code,
      },
    });

    return {
      success: true,
      data: unit,
    };
  } catch (error) {
    console.error("[createUnit]", error);

    return {
      success: false,
      error: "Gagal membuat unit",
    };
  }
}

export async function createDivision(data: {
  name: string;
  code: string;
  unitId: string;
}) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    if (!data.name || !data.code || !data.unitId) {
      return {
        success: false,
        error: "Data divisi belum lengkap",
      };
    }

    const division = await prisma.division.create({
      data: {
        name: data.name,
        code: data.code,
        unitId: data.unitId,
      },
    });

    return {
      success: true,
      data: division,
    };
  } catch (error) {
    console.error("[createDivision]", error);

    return {
      success: false,
      error: "Gagal membuat divisi",
    };
  }
}

export async function createShift(data: {
  name: string;
  startTime: string;
  endTime: string;
  divisionId: string;
}) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    if (!data.name || !data.startTime || !data.endTime || !data.divisionId) {
      return {
        success: false,
        error: "Data shift belum lengkap",
      };
    }

    const shift = await prisma.shift.create({
      data: {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        divisionId: data.divisionId,
      },
    });

    return {
      success: true,
      data: shift,
    };
  } catch (error) {
    console.error("[createShift]", error);

    return {
      success: false,
      error: "Gagal membuat shift",
    };
  }
}

// ========================= DELETE =========================

export async function deleteUnit(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    await prisma.unit.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[deleteUnit]", error);

    return {
      success: false,
      error: "Gagal menghapus unit",
    };
  }
}

export async function deleteDivision(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    await prisma.division.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[deleteDivision]", error);

    return {
      success: false,
      error: "Gagal menghapus divisi",
    };
  }
}

export async function deleteShift(id: string) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    await prisma.shift.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[deleteShift]", error);

    return {
      success: false,
      error: "Gagal menghapus shift",
    };
  }
}

// ========================= UPDATE =========================

export async function updateUnit(data: {
  id: string;
  name: string;
  code: string;
}) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const unit = await prisma.unit.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        code: data.code,
      },
    });

    return {
      success: true,
      data: unit,
    };
  } catch (error) {
    console.error("[updateUnit]", error);

    return {
      success: false,
      error: "Gagal update unit",
    };
  }
}

export async function updateDivision(data: {
  id: string;
  name: string;
  code: string;
  unitId: string;
}) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const division = await prisma.division.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        code: data.code,
        unitId: data.unitId,
      },
    });

    return {
      success: true,
      data: division,
    };
  } catch (error) {
    console.error("[updateDivision]", error);

    return {
      success: false,
      error: "Gagal update divisi",
    };
  }
}

export async function updateShift(data: {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  divisionId: string;
}) {
  await requireAuth(["SUPER_ADMIN"]);

  try {
    const shift = await prisma.shift.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        divisionId: data.divisionId,
      },
    });

    return {
      success: true,
      data: shift,
    };
  } catch (error) {
    console.error("[updateShift]", error);

    return {
      success: false,
      error: "Gagal update shift",
    };
  }
}
