import { auth } from "@/auth";
import { prisma as db } from "@/lib/prisma";
import WorkerProfileClient from "@/components/worker/worker-profile-client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profil Saya - K3 SMART",
  description: "Informasi real-time akun dan capaian poin K3 pekerja",
};

export default async function ProfilePage() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    redirect("/login");
  }

  // 2. Query data user asli beserta seluruh relasi struktural dan transaksionalnya
  const user = await db.user.findUnique({
    where: { id: currentUserId },
    include: {
      unit: true,
      division: true,
      materialProgress: {
        include: {
          material: true
        }
      },
      pointTransactions: true, // Untuk menghitung akumulasi poin real-time
      semesterSummaries: {
        orderBy: {
          semester: "desc"
        },
        take: 1
      }
    },
  });

  if (!user) {
    redirect("/login");
  }

  // 3. Ambil semester aktif berjalan (fallback ke data summary semester terakhir atau default semester 1)
  const currentSemester = user.semesterSummaries[0]?.semester || 1;

  // 4. Hitung Poin Saya / Semester dari riwayat transaksi poin K3 asli milik user
  const earnedPoints = user.pointTransactions
    .reduce((sum: number, tx: any) => sum + tx.points, 0);

  // 5. Ambil semua material yang ditugaskan atau tersedia pada semester aktif tersebut
  const allSemesterMaterials = await db.material.findMany({
    where: {
      status: "PUBLISHED",
      // Mengambil material yang berelasi dengan AcademicPeriod aktif saat ini
      period: {
        isActive: true
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  // 6. Hitung total poin yang tersedia dari konfigurasi quiz material semester ini
  // Kita ambil quiz config dari material yang aktif untuk kalkulasi max poin tersedia
  const materialIdsInSemester = allSemesterMaterials.map((m: any) => m.id);
  const quizConfigs = await db.quizConfig.findMany({
    where: {
      materialId: { in: materialIdsInSemester }
    },
    include: {
      questions: true
    }
  });

  const totalAvailablePoints = quizConfigs.reduce((sum: number, config: any) => {
    const quizMaxPoints = config.questions.reduce((qSum: number, q: any) => qSum + q.points, 0);
    return sum + quizMaxPoints;
  }, 0);

  // 7. Buat susunan array boolean status progress untuk komponen timeline stepper [true, true, false]
  const completedMaterialIds = new Set(
    user.materialProgress
      .filter((p: any) => p.status === "COMPLETED")
      .map((p: any) => p.materialId)
  );

  const progressSteps = allSemesterMaterials.map((material: any) => 
    completedMaterialIds.has(material.id)
  );

  // 8. Sanitasi data asli. Jika property null dari DB, dikonversi menjadi undefined agar tidak tampil di UI.
  const cleanUserData = {
    name: user.name || "Pekerja K3 SMART",
    email: user.email,
    nip: user.nip ?? undefined, 
    division: user.division?.name ?? undefined, 
    unit: user.unit?.name ?? undefined,
    currentSemester: currentSemester,
    earnedPoints: earnedPoints,
    availablePoints: totalAvailablePoints,
    progressSteps: progressSteps.length > 0 ? progressSteps : [false, false, false, false],
  };

  return (
    <div className="w-full bg-slate-50/30 min-h-screen">
      <WorkerProfileClient user={cleanUserData} />
    </div>
  );
}