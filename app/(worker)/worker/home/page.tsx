import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Trophy, Award, Star, CheckCircle2 } from "lucide-react";
import { getWorkerStats } from "@/app/actions/worker";
import { checkAndSubmitExpiredSessions } from "@/app/actions/worker";

export const metadata = {
  title: "Home - K3 SMART",
};

export default async function WorkerHomePage() {
  await checkAndSubmitExpiredSessions();
  const session = await auth();
  const statsResult = await getWorkerStats();
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          Selamat datang, {session?.user?.name}! 👋
        </h1>
        <p className="text-muted-foreground">
          Terus belajar dan kumpulkan poin untuk ditukar hadiah menarik.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-5 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Poin</p>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{stats?.allTimePoints ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              akumulasi keseluruhan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Poin Semester ini</p>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{stats?.totalPoints ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              akumulasi semester ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Poin Tersedia</p>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{stats?.availablePoints ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              bisa ditukar sekarang
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Materi Selesai</p>
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">
              {stats?.materialsCompleted ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              materi dipelajari
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Quiz Lulus</p>
              <Trophy className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{stats?.quizPassed ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">quiz berhasil</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent point transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Poin</CardTitle>
            <CardDescription>5 transaksi terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {!stats?.recentTransactions?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada riwayat poin. Selesaikan quiz untuk mendapat poin!
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentTransactions.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{t.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      +{t.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cara Mendapat Poin</CardTitle>
            <CardDescription>Langkah-langkah kumpulkan poin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold">Pelajari Materi</p>
                  <p className="text-xs text-muted-foreground">
                    Tonton video, baca artikel, dan lihat infografis K3
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-yellow-500 text-white text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold">Kerjakan Quiz</p>
                  <p className="text-xs text-muted-foreground">
                    Jawab soal dengan benar untuk mendapat poin
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-green-600 text-white text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  <p className="text-sm font-semibold">Tukar Hadiah</p>
                  <p className="text-xs text-muted-foreground">
                    Gunakan poin untuk redeem reward menarik
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
