import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // optional: bikin unit dulu biar relasi aman
  const unit = await prisma.unit.upsert({
    where: { code: "UNIT001" },
    update: {},
    create: {
      name: "Unit Demo",
      code: "UNIT001",
    },
  });

  // USER ADMIN
  await prisma.user.upsert({
    where: { email: "admin@mail.com" },
    update: {},
    create: {
      email: "admin@mail.com",
      name: "Super Admin",
      password,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      unitId: unit.id,
    },
  });

  // USER SUPERVISOR
  await prisma.user.upsert({
    where: { email: "supervisor@mail.com" },
    update: {},
    create: {
      email: "supervisor@mail.com",
      name: "Supervisor",
      password,
      role: "SUPERVISOR",
      status: "ACTIVE",
      unitId: unit.id,
    },
  });

  // USER WORKER
  await prisma.user.upsert({
    where: { email: "worker@mail.com" },
    update: {},
    create: {
      email: "worker@mail.com",
      name: "Worker",
      password,
      role: "WORKER",
      status: "ACTIVE",
      unitId: unit.id,
    },
  });

  console.log("✅ Seed selesai. Login pakai:");
  console.log("admin@mail.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
