import "dotenv/config";
import { createRequire } from "module";
import { prisma } from "../lib/prisma";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs") as {
  hash(value: string, saltRounds: number): Promise<string>;
};

async function main() {
  const password = await bcrypt.hash("password123", 10);
  // const workerEmail = "worker@mail.com";
  // const rewardName = "Voucher Kopi Demo";

  // optional: bikin unit dulu biar relasi aman
  // const unit = await prisma.unit.upsert({
  //   where: { code: "UNIT001" },
  //   update: {},
  //   create: {
  //     name: "Unit Demo",
  //     code: "UNIT001",
  //   },
  // });

  // USER ADMIN
  // await prisma.user.upsert({
  //   where: { email: "admin@mail.com" },
  //   update: {},
  //   create: {
  //     email: "admin@mail.com",
  //     name: "Super Admin",
  //     password,
  //     role: "SUPER_ADMIN",
  //     status: "ACTIVE",
  //     unitId: unit.id,
  //   },
  // });

  // USER WORKER
  // const worker = await prisma.user.upsert({
  //   where: { email: workerEmail },
  //   update: {},
  //   create: {
  //     email: workerEmail,
  //     name: "Worker",
  //     password,
  //     role: "WORKER",
  //     status: "ACTIVE",
  //     unitId: unit.id,
  //   },
  // });

  // REWARD TEST UNTUK REDemption
  // const rewardData = {
  //   name: rewardName,
  //   description: "Reward test untuk cek redemption worker",
  //   pointCost: 100,
  //   quantity: 10,
  //   status: "AVAILABLE" as const,
  // };

  // const existingReward = await prisma.reward.findFirst({
  //   where: { name: rewardName },
  // });

  // if (existingReward) {
  //   await prisma.reward.update({
  //     where: { id: existingReward.id },
  //     data: rewardData,
  //   });
  // } else {
  //   await prisma.reward.create({ data: rewardData });
  // }

  // TOP UP POIN MANUAL UNTUK TEST REDEMPTION
  // await prisma.pointTransaction.deleteMany({
  //   where: {
  //     userId: worker.id,
  //     reference: "seed:worker:test-topup",
  //   },
  // });

  // await prisma.pointTransaction.create({
  //   data: {
  //     userId: worker.id,
  //     points: 100,
  //     transactionType: "MANUAL_ADJUSTMENT",
  //     reference: "seed:worker:test-topup",
  //     description: "Seed poin manual untuk uji redemption reward",
  //   },
  // });

  // ============================================================================
  // DIVISIONS
  // ============================================================================

  const divisions = await Promise.all([
    prisma.division.upsert({
      where: { unitId_code: { unitId: unit.id, code: "K3" } },
      update: {},
      create: { unitId: unit.id, name: "K3 & Keamanan", code: "K3" },
    }),
    prisma.division.upsert({
      where: { unitId_code: { unitId: unit.id, code: "LNG" } },
      update: {},
      create: { unitId: unit.id, name: "Lingkungan", code: "LNG" },
    }),
    prisma.division.upsert({
      where: { unitId_code: { unitId: unit.id, code: "KIM" } },
      update: {},
      create: { unitId: unit.id, name: "Kimia", code: "KIM" },
    }),
    prisma.division.upsert({
      where: { unitId_code: { unitId: unit.id, code: "PML" } },
      update: {},
      create: { unitId: unit.id, name: "Pemeliharaan", code: "PML" },
    }),
    prisma.division.upsert({
      where: { unitId_code: { unitId: unit.id, code: "RPM" } },
      update: {},
      create: { unitId: unit.id, name: "Rendal Pemeliharaan", code: "RPM" },
    }),
  ]);

  const [divK3, divLng, divKim, divPml, divRpm] = divisions;

  // ============================================================================
  // WORKERS
  // ============================================================================

  const workerData = [
    {
      name: "Yerdi",
      nip: "8616037TKM",
      divisionId: divK3.id,
      email: "yerdi@mail.com",
    },
    {
      name: "Abriadi Said",
      nip: "9623475WTK",
      divisionId: divK3.id,
      email: "abriadi@mail.com",
    },
    {
      name: "Gerry Ristian",
      nip: "9624465WTK",
      divisionId: divK3.id,
      email: "gerry@mail.com",
    },
    {
      name: "Masduki Afif",
      nip: "0024466WTK",
      divisionId: divK3.id,
      email: "masduki@mail.com",
    },
    {
      name: "Bhekty Crisviandi",
      nip: "9116099PC",
      divisionId: divLng.id,
      email: "bhekty@mail.com",
    },
    {
      name: "Andi Ayu Wildana",
      nip: "9317002TB",
      divisionId: divLng.id,
      email: "andi.ayu@mail.com",
    },
    {
      name: "Kokoh Wahyu Adillah",
      nip: "9014056RB",
      divisionId: divLng.id,
      email: "kokoh@mail.com",
    },
    {
      name: "Jumadi",
      nip: "8917090TKM",
      divisionId: divLng.id,
      email: "jumadi@mail.com",
    },
    {
      name: "Cecep Akbar Supriyatno",
      nip: "9522468WTK",
      divisionId: divLng.id,
      email: "cecep@mail.com",
    },
    {
      name: "Gugun Gumelar",
      nip: "9920466WTK",
      divisionId: divKim.id,
      email: "gugun@mail.com",
    },
    {
      name: "Doni Putra Wicaksono",
      nip: "9323476WTK",
      divisionId: divKim.id,
      email: "doni@mail.com",
    },
    {
      name: "Misdiyanto",
      nip: "8410073JA",
      divisionId: divPml.id,
      email: "misdiyanto@mail.com",
    },
    {
      name: "Nasri Mathar",
      nip: "8811100JA",
      divisionId: divRpm.id,
      email: "nasri@mail.com",
    },
    {
      name: "Bangkit Indra Pratama",
      nip: "9116017TB",
      divisionId: divRpm.id,
      email: "bangkit@mail.com",
    },
  ];

  for (const w of workerData) {
    await prisma.user.upsert({
      where: { email: w.email },
      update: {},
      create: {
        email: w.email,
        name: w.name,
        nip: w.nip,
        password,
        role: "WORKER",
        status: "ACTIVE",
        unitId: unit.id,
        divisionId: w.divisionId,
      },
    });
  }

  console.log(`✅ ${workerData.length} worker berhasil di-seed`);

  // ============================================================================
  // TOPICS
  // ============================================================================

  const topicAPD = await prisma.topic.upsert({
    where: { slug: "alat-pelindung-diri" },
    update: {},
    create: {
      name: "Alat Pelindung Diri",
      slug: "alat-pelindung-diri",
      icon: "🦺",
      description:
        "Panduan penggunaan alat pelindung diri (APD) yang benar di lingkungan kerja industri",
    },
  });

  const topicKebakaran = await prisma.topic.upsert({
    where: { slug: "keselamatan-kebakaran" },
    update: {},
    create: {
      name: "Keselamatan Kebakaran",
      slug: "keselamatan-kebakaran",
      icon: "🔥",
      description:
        "Prosedur dan pengetahuan dasar tentang pencegahan dan penanganan kebakaran di tempat kerja",
    },
  });

  const topicErgonomi = await prisma.topic.upsert({
    where: { slug: "kesehatan-kerja" },
    update: {},
    create: {
      name: "Kesehatan Kerja",
      slug: "kesehatan-kerja",
      icon: "💪",
      description:
        "Panduan menjaga kesehatan fisik dan mental di lingkungan kerja",
    },
  });

  console.log("✅ 3 topic berhasil di-seed");

  // ============================================================================
  // MATERIALS
  // ============================================================================

  await prisma.material.upsert({
    where: { id: "seed-material-apd" },
    update: {},
    create: {
      id: "seed-material-apd",
      topicId: topicAPD.id,
      title: "Pentingnya Penggunaan APD di Tempat Kerja",
      description:
        "Pelajari jenis-jenis APD dan cara penggunaan yang benar untuk melindungi diri dari bahaya kerja",
      type: "VIDEO",
      duration: 300,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.material.upsert({
    where: { id: "seed-material-kebakaran" },
    update: {},
    create: {
      id: "seed-material-kebakaran",
      topicId: topicKebakaran.id,
      title: "Prosedur Evakuasi dan Penggunaan APAR",
      description:
        "Panduan lengkap prosedur evakuasi darurat dan cara penggunaan Alat Pemadam Api Ringan (APAR)",
      type: "ARTICLE",
      duration: 180,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.material.upsert({
    where: { id: "seed-material-ergonomi" },
    update: {},
    create: {
      id: "seed-material-ergonomi",
      topicId: topicErgonomi.id,
      title: "Ergonomi dan Postur Kerja yang Benar",
      description:
        "Panduan visual postur kerja yang ergonomis untuk mencegah cedera dan meningkatkan produktivitas",
      type: "INFOGRAPHIC",
      duration: 120,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  console.log("✅ 3 material berhasil di-seed");

  // ============================================================================
  // QUESTIONS
  // ============================================================================

  const questions = [
    // APD
    {
      id: "seed-q-apd-1",
      text: "Apa fungsi utama helm safety di tempat kerja?",
      type: "MULTIPLE_CHOICE" as const,
      difficulty: "easy",
      points: 10,
      correctAnswer: "Melindungi kepala dari benturan dan kejatuhan benda",
      answers: [
        {
          text: "Melindungi kepala dari benturan dan kejatuhan benda",
          isCorrect: true,
        },
        { text: "Sebagai aksesori fashion pekerja lapangan", isCorrect: false },
        { text: "Penanda jabatan dan divisi karyawan", isCorrect: false },
        { text: "Pelindung mata dari debu dan percikan", isCorrect: false },
      ],
    },
    {
      id: "seed-q-apd-2",
      text: "Kapan pekerja wajib menggunakan APD?",
      type: "MULTIPLE_CHOICE" as const,
      difficulty: "medium",
      points: 10,
      correctAnswer:
        "Setiap saat ketika berada di area kerja yang memiliki potensi bahaya",
      answers: [
        {
          text: "Setiap saat ketika berada di area kerja yang memiliki potensi bahaya",
          isCorrect: true,
        },
        {
          text: "Hanya saat ada inspeksi atau kunjungan dari atasan",
          isCorrect: false,
        },
        { text: "Hanya saat bekerja shift malam hari", isCorrect: false },
        {
          text: "Tidak wajib jika sudah berpengalaman lebih dari 5 tahun",
          isCorrect: false,
        },
      ],
    },
    {
      id: "seed-q-apd-3",
      text: "Sarung tangan safety wajib digunakan saat menangani bahan kimia berbahaya",
      type: "TRUE_FALSE" as const,
      difficulty: "easy",
      points: 10,
      correctAnswer:
        "Benar, sarung tangan melindungi kulit dari paparan bahan kimia",
      answers: [
        {
          text: "Benar, sarung tangan melindungi kulit dari paparan bahan kimia",
          isCorrect: true,
        },
        {
          text: "Tidak perlu jika bahan kimia dalam jumlah kecil",
          isCorrect: false,
        },
      ],
    },

    // Kebakaran
    {
      id: "seed-q-kebakaran-1",
      text: "Apa metode penggunaan APAR yang benar?",
      type: "MULTIPLE_CHOICE" as const,
      difficulty: "medium",
      points: 10,
      correctAnswer: "PASS — Pull, Aim, Squeeze, Sweep",
      answers: [
        { text: "PASS — Pull, Aim, Squeeze, Sweep", isCorrect: true },
        { text: "STOP — Stop, Think, Observe, Plan", isCorrect: false },
        { text: "RACE — Rescue, Alarm, Contain, Extinguish", isCorrect: false },
        { text: "FASS — Find, Aim, Shoot, Spray", isCorrect: false },
      ],
    },
    {
      id: "seed-q-kebakaran-2",
      text: "Lift boleh digunakan saat evakuasi kebakaran jika kondisi masih terlihat aman",
      type: "TRUE_FALSE" as const,
      difficulty: "easy",
      points: 10,
      correctAnswer:
        "Tidak boleh, lift dapat berhenti mendadak dan menjebak penumpang",
      answers: [
        {
          text: "Tidak boleh, lift dapat berhenti mendadak dan menjebak penumpang",
          isCorrect: true,
        },
        {
          text: "Boleh digunakan jika api masih jauh dari area lift",
          isCorrect: false,
        },
      ],
    },
    {
      id: "seed-q-kebakaran-3",
      text: "Apa yang harus dilakukan pertama kali saat mendengar alarm kebakaran berbunyi?",
      type: "MULTIPLE_CHOICE" as const,
      difficulty: "medium",
      points: 10,
      correctAnswer:
        "Hentikan aktivitas, matikan peralatan listrik, dan ikuti jalur evakuasi",
      answers: [
        {
          text: "Hentikan aktivitas, matikan peralatan listrik, dan ikuti jalur evakuasi",
          isCorrect: true,
        },
        {
          text: "Langsung berlari keluar gedung secepat mungkin tanpa melihat situasi",
          isCorrect: false,
        },
        {
          text: "Hubungi atasan dan tunggu instruksi lebih lanjut",
          isCorrect: false,
        },
        {
          text: "Ambil barang bawaan pribadi terlebih dahulu sebelum keluar",
          isCorrect: false,
        },
      ],
    },

    // Ergonomi
    {
      id: "seed-q-ergonomi-1",
      text: "Berapa derajat sudut ideal siku saat mengetik di komputer agar tidak cepat lelah?",
      type: "MULTIPLE_CHOICE" as const,
      difficulty: "easy",
      points: 10,
      correctAnswer: "90 derajat, agar otot lengan tidak tegang berlebihan",
      answers: [
        {
          text: "90 derajat, agar otot lengan tidak tegang berlebihan",
          isCorrect: true,
        },
        {
          text: "45 derajat, agar lebih mudah menjangkau keyboard",
          isCorrect: false,
        },
        { text: "120 derajat, agar posisi lebih santai", isCorrect: false },
        {
          text: "60 derajat, agar penglihatan ke layar lebih baik",
          isCorrect: false,
        },
      ],
    },
    {
      id: "seed-q-ergonomi-2",
      text: "Postur membungkuk saat bekerja dalam jangka panjang dapat menyebabkan cedera punggung permanen",
      type: "TRUE_FALSE" as const,
      difficulty: "easy",
      points: 10,
      correctAnswer:
        "Benar, postur membungkuk membebani tulang belakang secara berlebihan",
      answers: [
        {
          text: "Benar, postur membungkuk membebani tulang belakang secara berlebihan",
          isCorrect: true,
        },
        {
          text: "Tidak benar, tubuh akan beradaptasi dengan sendirinya",
          isCorrect: false,
        },
      ],
    },
    {
      id: "seed-q-ergonomi-3",
      text: "Apa dampak buruk yang paling umum akibat duduk terlalu lama tanpa istirahat?",
      type: "MULTIPLE_CHOICE" as const,
      difficulty: "medium",
      points: 10,
      correctAnswer:
        "Nyeri punggung bawah dan gangguan sirkulasi darah di kaki",
      answers: [
        {
          text: "Nyeri punggung bawah dan gangguan sirkulasi darah di kaki",
          isCorrect: true,
        },
        {
          text: "Tidak ada dampak selama menggunakan kursi yang nyaman",
          isCorrect: false,
        },
        {
          text: "Hanya menyebabkan rasa mengantuk dan kurang fokus",
          isCorrect: false,
        },
        {
          text: "Justru meningkatkan produktivitas karena tidak banyak bergerak",
          isCorrect: false,
        },
      ],
    },
  ];

  for (const q of questions) {
    const existing = await prisma.questionBank.findUnique({
      where: { id: q.id },
    });
    if (!existing) {
      await prisma.questionBank.create({
        data: {
          id: q.id,
          text: q.text,
          type: q.type,
          difficulty: q.difficulty,
          points: q.points,
          correctAnswer: q.correctAnswer,
          answerOptions: {
            createMany: {
              data: q.answers.map((a, idx) => ({
                text: a.text,
                isCorrect: a.isCorrect,
                orderIndex: idx,
              })),
            },
          },
        },
      });
    }
  }

  console.log(`✅ ${questions.length} soal berhasil di-seed`);

  console.log("✅ Seed selesai. Login pakai:");
  console.log("admin@mail.com / password123");
  // console.log(`Worker test: ${workerEmail} dengan 100 poin awal`);
  // console.log(`Reward test: ${rewardName} (100 poin)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
