// app/(worker)/worker/home/page.tsx

import { auth } from "@/auth";

import {
  Trophy,
} from "lucide-react";

import { getWorkerStats } from "@/app/actions/worker";

import { checkAndSubmitExpiredSessions } from "@/app/actions/worker";

import { getWorkerMaterialsByPeriod } from "@/app/actions/academic-period";

import WorkerMaterialList from "@/components/worker/worker-material-list";

export const metadata = {
  title: "Home - K3 SMART",
};

export default async function WorkerHomePage() {
  await checkAndSubmitExpiredSessions();

  const session = await auth();

  const statsResult =
    await getWorkerStats();

  const stats = statsResult.success
    ? statsResult.data
    : null;

  const materialsResult =
    await getWorkerMaterialsByPeriod();

  const periods = materialsResult.success
    ? materialsResult.data.periods
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* HERO */}
<section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-red-600 via-red-700 to-black px-5 py-6 text-white shadow-xl">
  <div className="flex flex-col gap-1">
    {/* TOP */}
    <div>

      <h1 className="mt-4 text-2xl font-black leading-tight md:text-3xl">
        Selamat Datang,
        <br/>
        Electricity Warrior! 👋
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-red-100">
        Tingkatkan pemahaman K3,
        selesaikan quiz,
        dan kumpulkan reward
        dari setiap pembelajaran.
      </p>
    </div>

    {/* INLINE STATS */}
<div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5 md:max-w-md">
  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-red-100/70">
      Poin Semester
    </p>

    <h2 className="mt-2 text-3xl font-black leading-none text-white">
      {stats?.totalPoints ?? 0}
    </h2>

    <p className="mt-1 text-[11px] text-red-100/70">
      semester aktif
    </p>
  </div>

  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-red-100/70">
      Poin Tersedia
    </p>

    <h2 className="mt-2 text-3xl font-black leading-none text-white">
      {stats?.availablePoints ?? 0}
    </h2>

    <p className="mt-1 text-[11px] text-red-100/70">
      siap ditukar
    </p>
  </div>
</div>
  </div>
</section>

      {/* CONTENT */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* MATERIALS */}
        <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                Materi Pembelajaran
              </h2>

              <p className="text-sm text-zinc-500">
                lanjutkan pembelajaran
                K3 terbaru
              </p>
            </div>
          </div>

          <WorkerMaterialList
            periods={periods}
            unassigned={[]}
          />
        </section>

        {/* RIGHT */}
        <section className="space-y-5">
       

          {/* TRANSAKSI */}
          <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-zinc-900">
                Riwayat Poin
              </h2>

              <p className="text-sm text-zinc-500">
                5 transaksi terakhir
              </p>
            </div>

            {!stats?.recentTransactions
              ?.length ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 py-8 text-center text-sm text-zinc-500">
                Belum ada riwayat poin
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTransactions.map(
                  (t: any) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {t.description}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {new Date(
                            t.createdAt
                          ).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      <div className="ml-3 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                        +{t.points}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
