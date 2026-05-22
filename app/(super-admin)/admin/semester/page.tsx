import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SemesterResetDialog from "@/components/admin/semester-reset-dialog";
import { prisma } from "@/lib/prisma";

async function getSemesterHistory() {
  return prisma.semesterSummary.findMany({
    orderBy: [{ year: "desc" }, { semester: "desc" }],
    include: {
      user: { select: { name: true, nip: true } },
      period: { select: { name: true, lastResetAt: true } },
    },
  });
}

async function getAllWorkerPoints() {
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
      const historical = w.semesterSummaries.reduce(
        (sum, s) => sum + s.totalPoints,
        0,
      );

      const earned = w.pointTransactions
        .filter((t) => t.points > 0)
        .reduce((sum, t) => sum + t.points, 0);

      const spent = w.pointTransactions
        .filter((t) => t.points < 0)
        .reduce((sum, t) => sum + Math.abs(t.points), 0);

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

  const grouped = summaries.reduce((acc: any, s) => {
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

  const groups = Object.values(grouped) as any[];

  return (
    <div className="space-y-6">
      {/* 🚀 MENYAMAKAN HEADER DENGAN KELOLA PENGGUNA */}
      <div className="sa-welcome mb-8">
        <div>
          <h1 className="sa-welcome__title">Semester Management</h1>
          <p className="sa-welcome__subtitle">
          Reset poin pekerja setiap semester dan lihat riwayat akumulasi poin
        </p>
      </div>

        {/* Tombol pemicu reset sejajar di sebelah kanan */}
        <SemesterResetDialog />
      </div>
      
      {/* 🚀 TABS LANGSUNG DI-RENDER TANPA BUNGKUSAN CARD LUAR */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="history">Riwayat Per Semester</TabsTrigger>
          <TabsTrigger value="accumulation">Akumulasi Per Worker</TabsTrigger>
        </TabsList>

        {/* Tab 1: Riwayat per semester */}
        <TabsContent value="history" className="space-y-4">
          {groups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-[24px] bg-white">
                Belum ada riwayat semester. Lakukan reset semester pertama.
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group: any) => (
                <div
                  key={group.key}
                  className="bg-white border rounded-lg p-5 shadow-sm"
                >
                  {/* Bagian Sub-Header Group Semester */}
                  <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{group.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {group.entries.length} pekerja
                      {group.lastResetAt && (
                          <span>
                            {" "}• Reset pada:{" "}
                            {new Date(group.lastResetAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                        </span>
                      )}
                      </p>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
                      Total: {group.entries.reduce((s: number, e: any) => s + e.totalPoints, 0)} pts
                    </span>
                  </div>

                  {/* List Worker per Semester */}
                    <div className="space-y-2">
                      {group.entries
                        .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
                        .map((entry: any, idx: number) => (
                          <div
                            key={entry.id}
                          className="flex items-center justify-between py-2 border-b last:border-0 last:pb-0"
                          >
                            <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground w-6 font-medium">
                                #{idx + 1}
                              </span>
                              <div>
                              <p className="text-sm font-semibold text-slate-800">
                                  {entry.user.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.user.nip ?? "-"}
                                </p>
                              </div>
                            </div>
                          <span className="font-bold text-sm text-slate-700">
                              {entry.totalPoints} poin
                            </span>
                          </div>
                        ))}
                    </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Akumulasi total per worker */}
        <TabsContent value="accumulation">
              {workers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-white">
                  Belum ada data worker.
            </div>
              ) : (
            <div className="bg-white border rounded-lg p-5 shadow-sm space-y-0">
                  {workers.map((w, idx) => (
                    <div
                      key={w.id}
                  className="flex items-center justify-between py-3 border-b last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-6 font-medium">
                          #{idx + 1}
                        </span>
                        <div>
                      <p className="text-sm font-semibold text-slate-800">{w.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {w.nip ?? "-"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                    <p className="font-bold text-sm text-slate-900">
                          {w.allTimePoints} poin
                        </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {w.historicalPoints} hist + {w.activePoints} aktif semester ini
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </TabsContent>
      </Tabs>
    </div>
  );
}