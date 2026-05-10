import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        activePoints: earned, // ← earned semester ini, bukan earned - spent
        availablePoints: earned - spent, // ← ini yang bisa ditukar
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

  // Group by periodId kalau ada, fallback ke year-semester
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Semester Management</h1>
        <p className="text-muted-foreground">
          Reset poin pekerja setiap semester dan lihat riwayat akumulasi poin
        </p>
      </div>

      {/* Reset Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reset Semester</CardTitle>
          <CardDescription>
            Snapshot poin aktif semua pekerja ke riwayat, lalu reset ke 0
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SemesterResetDialog />
        </CardContent>
      </Card>

      <Tabs defaultValue="history">
        <TabsList className="mb-4">
          <TabsTrigger value="history">Riwayat Per Semester</TabsTrigger>
          <TabsTrigger value="accumulation">Akumulasi Per Worker</TabsTrigger>
        </TabsList>

        {/* Tab 1: Riwayat per semester */}
        <TabsContent value="history">
          {groups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Belum ada riwayat semester. Lakukan reset semester pertama.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {groups.map((group: any) => (
                <Card key={group.key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{group.label}</CardTitle>
                    <CardDescription>
                      {group.entries.length} pekerja • Total poin:{" "}
                      {group.entries.reduce(
                        (s: number, e: any) => s + e.totalPoints,
                        0,
                      )}
                      {group.lastResetAt && (
                        <span className="ml-2">
                          • Reset:{" "}
                          {new Date(group.lastResetAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {group.entries
                        .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
                        .map((entry: any, idx: number) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground w-6">
                                #{idx + 1}
                              </span>
                              <div>
                                <p className="text-sm font-medium">
                                  {entry.user.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.user.nip ?? "-"}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-sm">
                              {entry.totalPoints} poin
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Akumulasi total per worker */}
        <TabsContent value="accumulation">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Akumulasi Poin</CardTitle>
              <CardDescription>
                Poin keseluruhan dari semua semester + poin aktif saat ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada data worker.
                </p>
              ) : (
                <div className="space-y-2">
                  {workers.map((w, idx) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{w.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {w.nip ?? "-"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {w.allTimePoints} poin
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {w.historicalPoints} hist + {w.activePoints} poin sekarang
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
