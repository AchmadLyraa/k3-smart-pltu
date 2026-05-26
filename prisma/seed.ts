import "dotenv/config";
import bcrypt from "bcryptjs";
import { createRequire } from "module";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🚀 Starting seed...");

  const password = await bcrypt.hash("Password123", 10);

  // ============================================================================
  // CLEAN USER DATA + TRANSAKSI
  // ============================================================================
  await prisma.userAnswer.deleteMany();
  await prisma.quizSessionQuestion.deleteMany();
  await prisma.quizSession.deleteMany();
  await prisma.materialProgress.deleteMany();
  await prisma.dailyCheckin.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.monthlyPointSummary.deleteMany();
  await prisma.semesterSummary.deleteMany();
  await prisma.userStreak.deleteMany();
  await prisma.topic.deleteMany();

  await prisma.user.deleteMany();

  console.log("🗑️ Old user data cleared");

  // ============================================================================
  // ACADEMIC PERIOD
  // ============================================================================

  const period = await prisma.academicPeriod.upsert({
    where: {
      name: "Semester 1 2026",
    },
    update: {},
    create: {
      name: "Semester 1 2026",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-06-30"),
      isActive: true,
    },
  });

  // ============================================================================
  // UNITS
  // ============================================================================

  const unitNP = await prisma.unit.upsert({
    where: { code: "NP" },
    update: {},
    create: {
      name: "Nusantara Power",
      code: "NP",
    },
  });

  const unitNPS = await prisma.unit.upsert({
    where: { code: "NPS" },
    update: {},
    create: {
      name: "Nusantara Power Services",
      code: "NPS",
    },
  });

  const unitMKP = await prisma.unit.upsert({
    where: { code: "MKP" },
    update: {},
    create: {
      name: "Mitra Karya Prima",
      code: "MKP",
    },
  });

  const unitMKPS = await prisma.unit.upsert({
    where: { code: "MKPS" },
    update: {},
    create: {
      name: "Mitra Karya Prima Services",
      code: "MKPS",
    },
  });

  const unitMKPIC = await prisma.unit.upsert({
    where: { code: "MKPIC" },
    update: {},
    create: {
      name: "Mitra Karya Prima Industrial Cleaning",
      code: "MKPIC",
    },
  });

  const unitISI = await prisma.unit.upsert({
    where: { code: "ISI" },
    update: {},
    create: {
      name: "Indikator Sosial Indonesia",
      code: "ISI",
    },
  });

  // ============================================================================
  // DIVISIONS
  // ============================================================================

  const divFinance = await prisma.division.upsert({
    where: {
      unitId_code: {
        unitId: unitMKP.id,
        code: "KEU",
      },
    },
    update: {},
    create: {
      unitId: unitMKP.id,
      name: "Keuangan",
      code: "KEU",
    },
  });

  const divSDM = await prisma.division.upsert({
    where: {
      unitId_code: {
        unitId: unitNPS.id,
        code: "SDM",
      },
    },
    update: {},
    create: {
      unitId: unitNPS.id,
      name: "SDM, Umum & CSR",
      code: "SDM",
    },
  });

  const divK3 = await prisma.division.upsert({
    where: {
      unitId_code: {
        unitId: unitMKP.id,
        code: "K3",
      },
    },
    update: {},
    create: {
      unitId: unitMKP.id,
      name: "K3 & Keamanan",
      code: "K3",
    },
  });

  const divLingkungan = await prisma.division.upsert({
    where: {
      unitId_code: {
        unitId: unitMKP.id,
        code: "LNG",
      },
    },
    update: {},
    create: {
      unitId: unitMKP.id,
      name: "Lingkungan",
      code: "LNG",
    },
  });

  const divAdmin = await prisma.division.upsert({
    where: {
      unitId_code: {
        unitId: unitMKP.id,
        code: "ADM",
      },
    },
    update: {},
    create: {
      unitId: unitMKP.id,
      name: "Administrasi",
      code: "ADM",
    },
  });

  // ============================================================================
  // SHIFT
  // ============================================================================

  const shiftPagi = await prisma.shift.upsert({
    where: {
      divisionId_code: {
        divisionId: divK3.id,
        code: "PAGI",
      },
    },
    update: {},
    create: {
      divisionId: divK3.id,
      name: "Shift Pagi",
      code: "PAGI",
      startTime: "07:00",
      endTime: "15:00",
    },
  });

  // ============================================================================
  // USERS
  // ============================================================================

  const newSuperAdmin = await prisma.user.upsert({
    where: { email: "admin@mail.com" },
    update: {},
    create: {
      email: "admin@mail.com",
      name: "Admin",
      password,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      isEmailVerified: true,
    },
  });

  const dewanJuri = await prisma.user.upsert({
    where: { email: "dewanjuri@demo.com" },
    update: {},
    create: {
      email: "dewanjuri@demo.com",
      name: "Dewan Juri",
      password,
      role: "WORKER",
      status: "ACTIVE",
      isEmailVerified: true,
    },
  });

  const hseAdmin = await prisma.user.upsert({
    where: {
      email: "hseadmin@k3smart.com",
    },
    update: {},
    create: {
      email: "hseadmin@k3smart.com",
      name: "HSE Admin",
      password,
      role: "HSE_ADMIN",
      status: "ACTIVE",
      isEmailVerified: true,
    },
  });

  const rewardAdmin = await prisma.user.upsert({
    where: {
      email: "rewardadmin@k3smart.com",
    },
    update: {},
    create: {
      email: "rewardadmin@k3smart.com",
      name: "Reward Admin",
      password,
      role: "REWARD_ADMIN",
      status: "ACTIVE",
      isEmailVerified: true,
    },
  });

  console.log("✅ Admin accounts created");

  const usersSeed = [
    {
      name: "Nindia Tyasing Kusumawardani",
      nip: "9424470WTK",
      email: "nindia@demo.com",
      role: "WORKER",
      unitId: unitMKPS.id,
      divisionId: divFinance.id,
    },
    {
      name: "Khairun Nisa",
      nip: "9724474WTK",
      email: "khairun@demo.com",
      role: "WORKER",
      unitId: unitMKP.id,
      divisionId: divFinance.id,
    },
    {
      name: "Nathasya March Risty",
      nip: "9425481WTK",
      email: "nathasya@demo.com",
      role: "WORKER",
      unitId: unitMKP.id,
      divisionId: divFinance.id,
    },
    {
      name: "Muhammad Arsyad",
      nip: "9216111TB",
      email: "arsyad@demo.com",
      role: "WORKER",
      unitId: unitNPS.id,
      divisionId: divSDM.id,
    },
    {
      name: "Yuda Wardana",
      nip: "9516072PL",
      email: "yuda@demo.com",
      role: "WORKER",
      unitId: unitNPS.id,
      divisionId: divSDM.id,
    },
    {
      name: "Erma Yunita",
      nip: "9116114TB",
      email: "erma@demo.com",
      role: "WORKER",
      unitId: unitNPS.id,
      divisionId: divSDM.id,
    },
    {
      name: "Yuliani",
      nip: "9324290BLP",
      email: "yuliani@demo.com",
      role: "WORKER",
      unitId: unitMKP.id,
      divisionId: divSDM.id,
    },
    {
      name: "Nur Hidayah",
      nip: "9817082TKM",
      email: "nurhidayah@demo.com",
      role: "WORKER",
      unitId: unitMKP.id,
      divisionId: divSDM.id,
    },
    {
      name: "Rini Puji Astuti",
      nip: "919096WTK",
      email: "rini@demo.com",
      role: "WORKER",
      unitId: unitMKP.id,
      divisionId: divAdmin.id,
    },
    {
      name: "Heri Setiawan",
      nip: "9617088TKM",
      email: "heri@demo.com",
      role: "WORKER",
      unitId: unitMKP.id,
      divisionId: divAdmin.id,
    },
    {
      name: "Rahmat Nurroyyan",
      nip: "9317002RP",
      email: "rahmat@demo.com",
      role: "WORKER",
      unitId: unitNPS.id,
      divisionId: divSDM.id,
    },
    {
      name: "Riza Meirisah",
      nip: "9416102TB",
      email: "riza@demo.com",
      role: "WORKER",
      unitId: unitNPS.id,
      divisionId: divSDM.id,
    },
    {
      name: "Luthfi Abdul Ghoni",
      nip: "9617078TKM",
      email: "luthfi@demo.com",
      role: "WORKER",
      unitId: unitMKPS.id,
      divisionId: divAdmin.id,
    },
    {
      name: "Nurul Aqsha Fajriyani",
      nip: "20250901",
      email: "nurul@demo.com",
      role: "WORKER",
      unitId: unitISI.id,
      divisionId: divAdmin.id,
    },
    {
      name: "Wahyu Budi Dharmawan",
      nip: "9114153ZJY",
      email: "wahyu@demo.com",
      role: "WORKER",
      unitId: unitNP.id,
      divisionId: divAdmin.id,
    },
    {
      name: "Eko Suwarno",
      nip: "9218007ZJY",
      email: "eko@demo.com",
      role: "WORKER",
      unitId: unitNP.id,
      divisionId: divFinance.id,
    },
    {
      name: "Roesy Dananjaya Panji Mahardeka",
      nip: "9216119ZJY",
      email: "roesy@demo.com",
      role: "WORKER",
      unitId: unitNP.id,
      divisionId: divSDM.id,
    },
    {
      name: "Masduki Afif",
      nip: "0024466WTK",
      email: "masduki@demo.com",
      role: "HSE_ADMIN",
      unitId: unitMKP.id,
      divisionId: divK3.id,
    },
    {
      name: "Gerry Ristian",
      nip: "9624465WTK",
      email: "gerry@demo.com",
      role: "HSE_ADMIN",
      unitId: unitMKP.id,
      divisionId: divK3.id,
    },
    {
      name: "Andi Lu'lu Lutfiyatussa'adahaf",
      nip: "0025480WTK",
      email: "andi@demo.com",
      role: "WORKER",
      unitId: unitMKP.id,
      divisionId: divLingkungan.id,
    },
    {
      name: "Arfina Dwi Aryani",
      nip: "9928018WIK",
      email: "arfina@demo.com",
      role: "WORKER",
      unitId: unitMKPIC.id,
      divisionId: divAdmin.id,
    },
    {
      name: "Nourma",
      nip: "9925153WIK",
      email: "nourma@demo.com",
      role: "WORKER",
      unitId: unitMKPIC.id,
      divisionId: divAdmin.id,
    },
    {
      name: "Salman",
      nip: "0124103WIK",
      email: "salman@demo.com",
      role: "WORKER",
      unitId: unitMKPIC.id,
      divisionId: divAdmin.id,
    },
  ];

  const createdUsers = [];

  for (const u of usersSeed) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        nip: u.nip,
        email: u.email,
        password,
        role: u.role as any,
        status: "ACTIVE",
        unitId: u.unitId,
        divisionId: u.divisionId,
        shiftId: shiftPagi.id,
      },
    });

    createdUsers.push(user);
  }

  console.log(`✅ ${createdUsers.length} users created`);

  // ============================================================================
  // TOPICS
  // ============================================================================

  const topic1 = await prisma.topic.upsert({
    where: { slug: "apd" },
    update: {},
    create: {
      name: "APD",
      slug: "apd",
      icon: "🦺",
      description: "Alat pelindung diri",
    },
  });

  const topic2 = await prisma.topic.upsert({
    where: { slug: "kebakaran" },
    update: {},
    create: {
      name: "Keselamatan Kebakaran",
      slug: "kebakaran",
      icon: "🔥",
      description: "Penanganan kebakaran",
    },
  });

  // ============================================================================
  // MATERIALS
  // ============================================================================

  const material1 = await prisma.material.create({
    data: {
      topicId: topic1.id,
      periodId: period.id,
      title: "Penggunaan APD di Area Kerja",
      description: "Materi penggunaan APD",
      type: "VIDEO",
      duration: 600,
      status: "PUBLISHED",
      publishedAt: new Date("2026-01-15"),
    },
  });

  const material2 = await prisma.material.create({
    data: {
      topicId: topic2.id,
      periodId: period.id,
      title: "Simulasi Evakuasi Kebakaran",
      description: "Panduan evakuasi",
      type: "ARTICLE",
      duration: 480,
      status: "PUBLISHED",
      publishedAt: new Date("2026-02-10"),
    },
  });

  // ============================================================================
  // QUESTIONS
  // ============================================================================

  const question1 = await prisma.questionBank.create({
    data: {
      periodId: period.id,
      text: "Apa fungsi APD?",
      type: "MULTIPLE_CHOICE",
      correctAnswer: "Melindungi pekerja",
      points: 10,
      difficulty: "easy",
      answerOptions: {
        create: [
          {
            text: "Melindungi pekerja",
            isCorrect: true,
            orderIndex: 1,
          },
          {
            text: "Aksesoris",
            isCorrect: false,
            orderIndex: 2,
          },
        ],
      },
    },
  });

  const question2 = await prisma.questionBank.create({
    data: {
      periodId: period.id,
      text: "APAR digunakan untuk?",
      type: "MULTIPLE_CHOICE",
      correctAnswer: "Memadamkan api",
      points: 10,
      difficulty: "easy",
      answerOptions: {
        create: [
          {
            text: "Memadamkan api",
            isCorrect: true,
            orderIndex: 1,
          },
          {
            text: "Menghias ruangan",
            isCorrect: false,
            orderIndex: 2,
          },
        ],
      },
    },
  });

  // ============================================================================
  // QUIZ CONFIG
  // ============================================================================

  const quizConfig = await prisma.quizConfig.create({
    data: {
      materialId: material1.id,
      name: "Quiz APD",
      description: "Quiz APD dasar",
      totalQuestions: 2,
      passingScore: 70,
      timeLimit: 600,
      questions: {
        connect: [{ id: question1.id }, { id: question2.id }],
      },
    },
  });

  const randomMay2026 = () => {
    const day = Math.floor(Math.random() * 28) + 1;
    const hour = Math.floor(Math.random() * 10) + 8;
    const minute = Math.floor(Math.random() * 60);

    return new Date(2026, 4, day, hour, minute);
  };

  // ============================================================================
  // SIMULASI APLIKASI SUDAH BERJALAN
  // ============================================================================

  for (const user of createdUsers) {
    const materialPoint = 40 + Math.floor(Math.random() * 40);
    const quizPoint = 80 + Math.floor(Math.random() * 120);

    const totalPoints = materialPoint + quizPoint;

    const score = 60 + Math.floor(Math.random() * 41);
    const passed = score >= 70;

    const streak = 1 + Math.floor(Math.random() * 30);

    const materialDate1 = randomMay2026();
    const materialDate2 = randomMay2026();
    const quizDate = randomMay2026();

    // progress material
    await prisma.materialProgress.create({
      data: {
        userId: user.id,
        materialId: material1.id,
        status: "COMPLETED",
        startedAt: materialDate1,
        completedAt: new Date(materialDate1.getTime() + 1000 * 60 * 15),
        lastAccessed: materialDate1,
      },
    });

    await prisma.materialProgress.create({
      data: {
        userId: user.id,
        materialId: material2.id,
        status: Math.random() > 0.3 ? "COMPLETED" : "IN_PROGRESS",
        startedAt: materialDate2,
        completedAt:
          Math.random() > 0.3
            ? new Date(materialDate2.getTime() + 1000 * 60 * 20)
            : null,
        lastAccessed: materialDate2,
      },
    });

    // quiz session
    const session = await prisma.quizSession.create({
      data: {
        userId: user.id,
        quizConfigId: quizConfig.id,
        status: "GRADED",
        startedAt: quizDate,
        submittedAt: new Date(quizDate.getTime() + 1000 * 60 * 25),
        score,
        totalQuestions: 2,
        correctAnswers: passed ? 2 : 1,
        passed,
        attemptNumber: 1,
      },
    });

    await prisma.quizSessionQuestion.createMany({
      data: [
        {
          quizSessionId: session.id,
          questionId: question1.id,
          orderIndex: 1,
        },
        {
          quizSessionId: session.id,
          questionId: question2.id,
          orderIndex: 2,
        },
      ],
    });

    await prisma.userAnswer.createMany({
      data: [
        {
          quizSessionId: session.id,
          userId: user.id,
          questionId: question1.id,
          answer: "Melindungi pekerja",
          isCorrect: true,
          pointsEarned: 10,
          createdAt: quizDate,
        },
        {
          quizSessionId: session.id,
          userId: user.id,
          questionId: question2.id,
          answer: passed ? "Memadamkan api" : "Menghias ruangan",
          isCorrect: passed,
          pointsEarned: passed ? 10 : 0,
          createdAt: quizDate,
        },
      ],
    });

    // transaksi poin
    await prisma.pointTransaction.createMany({
      data: [
        {
          userId: user.id,
          periodId: period.id,
          points: materialPoint,
          transactionType: "MATERIAL_COMPLETION",
          description: "Menyelesaikan materi APD",
          createdAt: materialDate1,
        },
        {
          userId: user.id,
          periodId: period.id,
          points: quizPoint,
          transactionType: "QUIZ_COMPLETION",
          description: "Menyelesaikan quiz APD",
          createdAt: quizDate,
        },
      ],
    });

    // streak
    await prisma.userStreak.create({
      data: {
        userId: user.id,
        currentStreak: streak,
        maxStreak: streak + Math.floor(Math.random() * 20),
        lastStreakDate: randomMay2026(),
      },
    });

    // checkin random
    const usedDates = new Set<string>();

    for (let i = 0; i < 10; i++) {
      let checkinDate: Date;

      do {
        checkinDate = randomMay2026();
        checkinDate.setHours(0, 0, 0, 0);
      } while (usedDates.has(checkinDate.toISOString()));

      usedDates.add(checkinDate.toISOString());

      await prisma.dailyCheckin.create({
        data: {
          userId: user.id,
          date: checkinDate,
          checkedIn: true,
        },
      });
    }

    // monthly summary
    await prisma.monthlyPointSummary.create({
      data: {
        userId: user.id,
        year: 2026,
        month: 5,
        totalPoints,
      },
    });

    // semester summary
    await prisma.semesterSummary.create({
      data: {
        userId: user.id,
        periodId: period.id,
        year: 2026,
        semester: 1,
        totalPoints,
      },
    });
  }

  console.log("✅ Simulation data created");
  console.log("✅ Seed completed");
  console.log("🔑 password semua akun: Password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
