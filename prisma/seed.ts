import "dotenv/config";
import { createRequire } from "module";
import { prisma } from "../lib/prisma";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs") as {
  hash(value: string, saltRounds: number): Promise<string>;
};

async function main() {
  const password = await bcrypt.hash("password123", 10);
  const workerEmail = "worker@mail.com";
  const rewardName = "Voucher Kopi Demo";

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

  // USER WORKER
  const worker = await prisma.user.upsert({
    where: { email: workerEmail },
    update: {},
    create: {
      email: workerEmail,
      name: "Worker",
      password,
      role: "WORKER",
      status: "ACTIVE",
      unitId: unit.id,
    },
  });

  // REWARD TEST UNTUK REDemption
  const rewardData = {
    name: rewardName,
    description: "Reward test untuk cek redemption worker",
    pointCost: 100,
    quantity: 10,
    status: "AVAILABLE" as const,
  };

  const existingReward = await prisma.reward.findFirst({
    where: { name: rewardName },
  });

  if (existingReward) {
    await prisma.reward.update({
      where: { id: existingReward.id },
      data: rewardData,
    });
  } else {
    await prisma.reward.create({ data: rewardData });
  }

  // TOP UP POIN MANUAL UNTUK TEST REDEMPTION
  await prisma.pointTransaction.deleteMany({
    where: {
      userId: worker.id,
      reference: "seed:worker:test-topup",
    },
  });

  await prisma.pointTransaction.create({
    data: {
      userId: worker.id,
      points: 100,
      transactionType: "MANUAL_ADJUSTMENT",
      reference: "seed:worker:test-topup",
      description: "Seed poin manual untuk uji redemption reward",
    },
  });

  console.log("✅ Seed selesai. Login pakai:");
  console.log("admin@mail.com / password123");
  console.log(`Worker test: ${workerEmail} dengan 100 poin awal`);
  console.log(`Reward test: ${rewardName} (100 poin)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
