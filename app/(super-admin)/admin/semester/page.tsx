import SemesterTabs from "@/components/admin/semester-tabs";
import SemesterResetDialog from "@/components/admin/semester-reset-dialog";
import { prisma } from "@/lib/prisma";

// Updated types to match Prisma schema
type SemesterSummary = {
  id: string;
  year: number;
  semester: string;
  totalPoints: number;
  user: { name: string | null; nip: string | null };
  period?: { name: string; lastResetAt: Date | null } | null;
  periodId?: string | null;
};

type Worker = {
  id: string;
  name: string | null;
  nip: string | null;
  historicalPoints: number;
  activePoints: number;
  availablePoints: number;
  allTimePoints: number;
};

async function getSemesterHistory(): Promise<SemesterSummary[]> {
  return prisma.semesterSummary.findMany({
    orderBy: [{ year: "desc" }, { semester: "desc" }],
    include: {
      user: { select: { name: true, nip: true } },
      period: { select: { name: true, lastResetAt: true } },
    },
  });
}

async function getAllWorkerPoints(): Promise<Worker[]> {
  const workers = await prisma.user.findMany({
    where: { role: "WORKER" },
    select: {
      id: true,
      name: true,
      nip: true,
      semesterSummaries: { select: { totalPoints: true } },
      pointTransactions: { select: { points: true } },
    },
  });

  return workers
    .map((w) => {
      const historical = w.semesterSummaries.reduce((s, s2) => s + s2.totalPoints, 0);
      const earned = w.pointTransactions
        .filter((t) => t.points > 0)
        .reduce((s, t) => s + t.points, 0);
      const spent = w.pointTransactions
        .filter((t) => t.points < 0)
        .reduce((s, t) => s + Math.abs(t.points), 0);
      return {
        id: w.id,
        name: w.name,
        nip: w.nip,
        historicalPoints: historical,
        activePoints: earned,
        availablePoints: earned - spent,
        allTimePoints: historical + earned,
      };
    })
    .sort((a, b) => b.allTimePoints - a.allTimePoints);
}

export default async function SemesterPage() {
  const [summaries, workers] = await Promise.all([
    getSemesterHistory(),
    getAllWorkerPoints(),
  ]);

  const grouped = summaries.reduce<Record<string, any>>((acc, s) => {
    const key = s.periodId ?? `${s.year}-${s.semester}`;
    if (!acc[key]) {
      acc[key] = {
        key,
        label: s.period?.name ?? `Semester ${s.semester} — ${s.year}`,
        lastResetAt: s.period?.lastResetAt ?? null,
        entries: [],
      };
    }
    acc[key].entries.push(s);
    return acc;
  }, {});

  const groups = Object.values(grouped);

  return (
    <div className="space-y-6">
      <div className="sa-welcome mb-8">
        <div>
          <h1 className="sa-welcome__title">Semester Management</h1>
          <p className="sa-welcome__subtitle">
            Reset poin pekerja setiap semester dan lihat riwayat akumulasi poin
          </p>
        </div>
        <SemesterResetDialog />
      </div>

      <SemesterTabs groups={groups} workers={workers} />
    </div>
  );
}