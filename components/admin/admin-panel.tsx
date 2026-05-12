"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  Users,
  BookOpen,
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

import { getWorkerDetail } from "@/app/actions/admin";

export default function AdminDashboard({
  stats,
  workers,
}: {
  stats: any;
  workers: any[];
}) {
  const [selectedWorker, setSelectedWorker] = useState<any>(null);

  const [workerDetail, setWorkerDetail] = useState<any>(null);

  const [loadingDetail, setLoadingDetail] = useState(false);

  const [page, setPage] = useState(1);

  const openWorkerDetail = async (worker: any) => {
    setSelectedWorker(worker);
    setWorkerDetail(null);
    setPage(1);

    await fetchWorkerDetail(worker.id, 1, false);
  };

  const fetchWorkerDetail = async (
    userId: string,
    targetPage: number,
    append = false,
  ) => {
    setLoadingDetail(true);

    try {
      const result = await getWorkerDetail(userId, targetPage, 10);

      if (result.success) {
        if (append) {
          setWorkerDetail((prev: any) => ({
            ...result.data,

            quizSessions: [
              ...(prev?.quizSessions || []),
              ...result.data.quizSessions,
            ],
          }));
        } else {
          setWorkerDetail(result.data);
        }

        setPage(targetPage);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadMoreQuiz = async () => {
    if (!selectedWorker) return;

    await fetchWorkerDetail(selectedWorker.id, page + 1, true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>

        <p className="text-muted-foreground">
          Monitor performa karyawan dan aktivitas platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Worker</p>

              <Users className="w-5 h-5 text-blue-500" />
            </div>

            <p className="text-3xl font-bold">{stats?.totalWorkers ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Materi Aktif</p>

              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>

            <p className="text-3xl font-bold">{stats?.totalMaterials ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Quiz</p>

              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>

            <p className="text-3xl font-bold">{stats?.totalQuizConfigs ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Total Poin Dibagikan
              </p>

              <Star className="w-5 h-5 text-yellow-500" />
            </div>

            <p className="text-3xl font-bold">
              {stats?.totalPointsAwarded ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Worker list */}
      <Card>
        <CardHeader>
          <CardTitle>Performa Karyawan</CardTitle>

          <CardDescription>{workers.length} worker terdaftar</CardDescription>
        </CardHeader>

        <CardContent>
          {workers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada worker terdaftar
            </p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground px-3 pb-1 border-b">
                <span className="col-span-2">Nama</span>
                <span>Unit</span>
                <span className="text-center">Materi</span>
                <span className="text-center">Quiz</span>
                <span className="text-center">Lulus</span>
                <span className="text-center">Poin</span>
              </div>

              {workers.map((w) => (
                <div
                  key={w.id}
                  onClick={() => openWorkerDetail(w)}
                  className="grid grid-cols-7 gap-2 items-center px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm font-medium truncate">{w.name}</p>

                    <p className="text-xs text-muted-foreground truncate">
                      {w.email}
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground truncate">
                    {w.unit}
                  </span>

                  <span className="text-sm text-center">
                    {w.materialsCompleted}/{w.totalMaterials}
                  </span>

                  <span className="text-sm text-center">{w.quizAttempted}</span>

                  <span className="text-sm text-center text-green-600 font-medium">
                    {w.quizPassed}
                  </span>

                  <span className="text-sm text-center font-bold text-yellow-600">
                    {w.totalPoints}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedWorker}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedWorker(null);
            setWorkerDetail(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedWorker?.name}</DialogTitle>

            <p className="text-sm text-muted-foreground">
              {selectedWorker?.email}
            </p>
          </DialogHeader>

          {loadingDetail && !workerDetail ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : workerDetail ? (
            <div className="space-y-6">
              {/* Quiz */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Riwayat Quiz</h3>

                  <span className="text-xs text-muted-foreground">
                    {workerDetail.pagination.total} total
                  </span>
                </div>

                <div className="space-y-3">
                  {workerDetail.quizSessions.map((session: any) => {
                    const duration =
                      session.submittedAt && session.startedAt
                        ? Math.round(
                            (new Date(session.submittedAt).getTime() -
                              new Date(session.startedAt).getTime()) /
                              1000,
                          )
                        : null;

                    const correctCount = session.userAnswers.filter(
                      (a: any) => a.isCorrect,
                    ).length;

                    return (
                      <div key={session.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium">
                              {session.quizConfig.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {new Date(session.submittedAt).toLocaleString(
                                "id-ID",
                              )}
                            </p>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                session.passed
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {session.passed ? "Lulus" : "Tidak Lulus"}
                            </span>

                            <p className="text-sm font-bold mt-1">
                              {session.score} pts
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {session.userAnswers.map((a: any) => (
                            <div
                              key={a.id}
                              className="flex items-start gap-2 text-xs"
                            >
                              {a.isCorrect ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                              )}

                              <span className="text-muted-foreground line-clamp-1">
                                {a.question?.text ?? "Soal dihapus"}
                              </span>

                              {a.isCorrect && (
                                <span className="text-green-600 shrink-0">
                                  +{a.pointsEarned}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                          {correctCount}/{session.userAnswers.length} benar
                          {duration && ` • ${duration} detik`}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {workerDetail.pagination.hasMore && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={loadMoreQuiz}
                    disabled={loadingDetail}
                  >
                    {loadingDetail ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                )}
              </div>

              {/* Point */}
              <div>
                <h3 className="font-semibold mb-3">Riwayat Poin</h3>

                <div className="space-y-2">
                  {workerDetail.pointTransactions.map((t: any) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div>
                        <p className="font-medium">{t.description}</p>

                        <p className="text-xs text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>

                      <span
                        className={`font-bold ${
                          t.points > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {t.points > 0 ? "+" : ""}
                        {t.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
