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

  // 2b. Dapatkan periode akademik aktif
  const activePeriod = await db.academicPeriod.findFirst({
    where: { isActive: true },
    select: { id: true },
  });

  // 3. Ambil semester aktif berjalan (fallback ke data summary semester terakhir atau default semester 1)
  const currentSemester = user.semesterSummaries[0]?.semester || 1;

  // 4. Filter transaksi poin berdasarkan periode aktif (jika ada)
  const periodTransactions = activePeriod
    ? user.pointTransactions.filter((tx: any) => tx.periodId === activePeriod.id)
    : user.pointTransactions;

  // 5. Hitung Poin Saya / Semester dari transaksi di periode aktif
  const earnedPoints = periodTransactions
    .filter((t: any) => t.points > 0)
    .reduce((sum: number, t: any) => sum + t.points, 0);

  // 6. Hitung saldo poin real (total poin didapat - total poin terpakai) dari SEMUA transaksi (all-time)
  const totalEarnedAll = user.pointTransactions
    .filter((t: any) => t.points > 0)
    .reduce((sum: number, t: any) => sum + t.points, 0);

  const totalSpentAll = user.pointTransactions
    .filter((t: any) => t.points < 0)
    .reduce((sum: number, t: any) => sum + Math.abs(t.points), 0);

  const availablePoints = totalEarnedAll - totalSpentAll;

  // 6. Ambil semua material yang ditugaskan atau tersedia pada semester aktif tersebut
  const allSemesterMaterials = await db.material.findMany({
    where: {
      status: "PUBLISHED",
      period: {
        isActive: true
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

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
    availablePoints: availablePoints,
    progressSteps: progressSteps.length > 0 ? progressSteps : [false, false, false, false],
  };

  return (
    <div className="w-full bg-slate-50/30 min-h-screen">
      <WorkerProfileClient user={cleanUserData} />
    </div>
  );
}