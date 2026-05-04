"use client";

import { useState } from "react";
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

  const openWorkerDetail = async (worker: any) => {
    setSelectedWorker(worker);
    setLoadingDetail(true);
    try {
      const result = await getWorkerDetail(worker.id);
      if (result.success) setWorkerDetail(result.data);
    } finally {
      setLoadingDetail(false);
    }
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
              {/* Header */}
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
                  className="grid grid-cols-7 gap-2 items-center px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => openWorkerDetail(w)}
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

      {/* Worker Detail Dialog */}
      <Dialog
        open={!!selectedWorker}
        onOpenChange={(open) => !open && setSelectedWorker(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedWorker?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedWorker?.email}{" "}
              {selectedWorker?.nip ? `• NIP: ${selectedWorker.nip}` : ""}
            </p>
          </DialogHeader>

          {loadingDetail ? (
            <p className="text-center py-8 text-muted-foreground">
              Memuat data...
            </p>
          ) : workerDetail ? (
            <div className="space-y-6">
              {/* Quiz sessions */}
              <div>
                <h3 className="font-semibold mb-3">Riwayat Quiz</h3>
                {workerDetail.quizSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada quiz dikerjakan
                  </p>
                ) : (
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
                                {new Date(
                                  session.submittedAt,
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {duration && (
                                  <span className="ml-2 inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {duration < 60
                                      ? `${duration}d`
                                      : `${Math.floor(duration / 60)}m ${duration % 60}d`}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${session.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                              >
                                {session.passed ? "Lulus" : "Tidak Lulus"}
                              </span>
                              <p className="text-sm font-bold mt-1">
                                {session.score} pts
                              </p>
                            </div>
                          </div>

                          {/* Answer breakdown */}
                          <div className="space-y-1 mt-2">
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
                            {correctCount}/{session.userAnswers.length} soal
                            benar
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Point transactions */}
              <div>
                <h3 className="font-semibold mb-3">Riwayat Poin</h3>
                {workerDetail.pointTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada transaksi poin
                  </p>
                ) : (
                  <div className="space-y-2">
                    {workerDetail.pointTransactions.map((t: any) => (
                      <div
                        key={t.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <div>
                          <p className="font-medium">{t.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(t.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span
                          className={`font-bold ${t.points > 0 ? "text-green-600" : "text-red-500"}`}
                        >
                          {t.points > 0 ? "+" : ""}
                          {t.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
