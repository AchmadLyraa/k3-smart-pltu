"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import {
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreVertical,
  Users,
  User,
  HelpCircle,
  BookOpen,
  Coins,
  Calendar,
} from "lucide-react";
import { getWorkerDetail, getActiveUsersReport } from "@/app/actions/admin";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

/* ─── Donut Chart Component ─── */
function DonutChart({
  percentage,
  label,
  color = "var(--sa-primary, #E74C3C)",
}: {
  percentage: number;
  label: string;
  color?: string;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="sa-donut">
      <svg width="110" height="110" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--sa-primary-bg, #FDE8E4)"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="16"
          fontWeight="700"
          fill="var(--sa-text-dark, #1A1A2E)"
          fontFamily="'Buckin', sans-serif"
        >
          {percentage}%
        </text>
      </svg>
      <span className="sa-donut__label">{label}</span>
    </div>
  );
}

/* ─── Stat Card Component ─── */
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="sa-stat-card">
      <div className="sa-stat-card__icon">{icon}</div>
      <div className="sa-stat-card__info">
        <span className="sa-stat-card__value">{value}</span>
        <span className="sa-stat-card__label">{label}</span>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function AdminDashboard({
  stats,
  workers,
  periods = [],
  defaultPeriodId = "all",
  monthlyData = [],
  monthlyDataError = null,
}: {
  stats: any;
  workers: any[];
  periods?: any[];
  defaultPeriodId?: string;
  monthlyData?: { name: string; akses: number }[];
  monthlyDataError?: string | null;
}) {
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [workerDetail, setWorkerDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showValue, setShowValue] = useState(true);
  const [selectedPeriodId, setSelectedPeriodId] = useState(defaultPeriodId);
  const [workerPage, setWorkerPage] = useState(1);
  const WORKER_PAGE_SIZE = 10;
  const [isNavigating, setIsNavigating] = useState(false);
  const { toast } = useToast();

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodId(periodId);
    setIsNavigating(true);
    const params = new URLSearchParams(window.location.search);
    if (periodId && periodId !== "all") {
      params.set("periodId", periodId);
    } else {
      params.delete("periodId");
    }
    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.location.href = newUrl;
  };

  const currentPeriodName =
    selectedPeriodId === "all"
      ? "Semua Periode"
      : periods.find((p) => p.id === selectedPeriodId)?.name || "Pilih Periode";

  const openWorkerDetail = async (worker: any) => {
    // Use worker.id directly if present; fallback to name for legacy data
    const workerId = worker.id ?? worker.name;
    console.log('[openWorkerDetail] Selected worker ID:', workerId, 'Name:', worker.name);
    setSelectedWorker(worker);
    setWorkerDetail(null);
    setPage(1);
    await fetchWorkerDetail(workerId, 1, false);
  };

  const fetchWorkerDetail = async (
    userId: string,
    targetPage: number,
    append = false
  ) => {
    setLoadingDetail(true);
    try {
      const result = await getWorkerDetail(userId, targetPage, 10);
      console.log('[fetchWorkerDetail] API result for userId', userId, 'page', targetPage, ':', result);
      if (result.success && result.data) {
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
        console.log('[fetchWorkerDetail] Updated workerDetail state:', result.data);
        setPage(targetPage);
      } else {
        console.error('[fetchWorkerDetail] Failed to fetch worker detail:', result.error);
        setWorkerDetail({ error: result.error || 'Failed to load' } as any);
      }
    } catch (e) {
      console.error('[fetchWorkerDetail] Exception:', e);
      setWorkerDetail({ error: (e as any).message || 'Exception occurred' } as any);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadMoreQuiz = async () => {
    if (!selectedWorker) return;
    await fetchWorkerDetail(selectedWorker.id, page + 1, true);
  };

  const handleSaveReport = async () => {
    try {
      const result = await getActiveUsersReport(
        selectedPeriodId === "all" ? undefined : selectedPeriodId
      );
      if (!result.success || !result.data || result.data.length === 0) {
        toast({
  title: "Tidak ada data pengguna aktif",
  description: "Tidak ada data pengguna aktif untuk periode ini.",
  variant: "destructive",
});
        return;
      }

      // Get period name
      const periodName =
        selectedPeriodId === "all"
          ? "Semua Periode"
          : periods.find((p) => p.id === selectedPeriodId)?.name || "Periode";

      // Generate CSV
      const headers = [
        "No",
        "Nama",
        "NIP",
        "Unit",
        "Divisi",
        "Total Materi Diakses",
        "Sedang Diproses",
        "Selesai",
        "Aktivitas Terakhir",
      ];
      const csvRows = result.data.map((row: any) =>
        [
          row.no,
          row.name,
          row.nip,
          row.unit,
          row.division,
          row.totalMateriDiakses,
          row.materiDiproses,
          row.materiSelesai,
          row.lastAccessed,
        ].join(",")
      );
      const csvContent = [headers.join(","), ...csvRows].join("\n");

      // Trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const today = new Date().toLocaleDateString("id-ID").replace(/\//g, "-");
      link.download = `laporan-aktivitas-${periodName.replace(/\s+/g, "-")}-${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[handleSaveReport error]", error);
      toast({
  title: "Gagal",
  description: "Gagal mengunduh laporan.",
  variant: "destructive",
});
    }
  };

  // Filter workers by search
  const filteredWorkers = useMemo(() => {
    if (!searchQuery.trim()) return workers;
    const q = searchQuery.toLowerCase();
    return workers.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        w.email?.toLowerCase().includes(q)
    );
  }, [workers, searchQuery]);

  // Pagination for workers table
  const totalWorkerPages = Math.max(1, Math.ceil(filteredWorkers.length / WORKER_PAGE_SIZE));
  const paginatedWorkers = useMemo(() => {
    const start = (workerPage - 1) * WORKER_PAGE_SIZE;
    return filteredWorkers.slice(start, start + WORKER_PAGE_SIZE);
  }, [filteredWorkers, workerPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setWorkerPage(1);
  }, [searchQuery]);

  // Calculate progress percentages
  const progressData = useMemo(() => {
    if (!workers || workers.length === 0)
      return { notStarted: 0, inProgress: 0, completed: 0 };
    const total = workers.length;
    const completed = workers.filter(
      (w) => w.materialsCompleted >= w.totalMaterials && w.totalMaterials > 0
    ).length;
    const notStarted = workers.filter(
      (w) => w.materialsCompleted === 0
    ).length;
    const inProgress = total - completed - notStarted;
    return {
      notStarted: Math.round((notStarted / total) * 100),
      inProgress: Math.round((inProgress / total) * 100),
      completed: Math.round((completed / total) * 100),
    };
  }, [workers]);

  return (
    <div className="sa-dashboard">
      {/* Welcome Section */}
      <div className="sa-welcome">
        <div>
          <h1 className="sa-welcome__title">Hai admin!</h1>
          <p className="sa-welcome__subtitle">
            Welcome back to K3 Smart Admin
          </p>
        </div>
        <select
          className="sa-filter-periode"
          value={selectedPeriodId}
          onChange={(e) => handlePeriodChange(e.target.value)}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            cursor: "pointer",
            border: "none",
            background: "#fff",
            fontFamily: "inherit",
            fontSize: "inherit",
            color: "inherit",
            outline: "none",
          }}
        >
          <option value="all">Semua Periode</option>
          {periods.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}{p.isActive ? " (Aktif)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Stat Cards */}
      <div className="sa-stats-grid">
        <StatCard
          icon={<User size={22} />}
          value={stats?.totalWorkers ?? 0}
          label="Total Pengguna"
        />
        <StatCard
          icon={<HelpCircle size={22} />}
          value={stats?.totalMaterials ?? 0}
          label="Materi Aktif"
        />
        <StatCard
          icon={<BookOpen size={22} />}
          value={stats?.totalQuizConfigs ?? 0}
          label="Total Quiz"
        />
        <StatCard
          icon={<Coins size={22} />}
          value={stats?.totalPointsAwarded ?? 0}
          label="Point Dibagikan"
        />
      </div>

      {/* Charts Row */}
      <div className="sa-charts-row">
        {/* Progress Belajar */}
        <div className="sa-card sa-progress-card">
          <div className="sa-card__header">
            <h3 className="sa-card__title">Progress Belajar</h3>
            <div className="sa-card__header-actions">
            </div>
          </div>
          <div className="sa-donut-row">
            <DonutChart
              percentage={progressData.notStarted}
              label="Belum Mulai"
              color="var(--sa-primary, #E74C3C)"
            />
            <DonutChart
              percentage={progressData.inProgress}
              label="Sedang Belajar"
              color="var(--sa-primary-light, #FF6B6B)"
            />
            <DonutChart
              percentage={progressData.completed}
              label="Selesai"
              color="var(--sa-primary, #E74C3C)"
            />
          </div>
        </div>

        {/* Aktif User */}
        <div className="sa-card sa-aktif-card">
          <div className="sa-card__header">
            <div>
              <h3 className="sa-card__title">Aktif user</h3>
              <p className="sa-card__desc">Statistik keaktifan pengguna</p>
            </div>
            <button className="sa-save-report" onClick={handleSaveReport}>
              <Download size={14} />
              <span>Save Report</span>
            </button>
          </div>
          <div className="sa-aktif-chart">
            {monthlyDataError ? (
              <div className="flex items-center justify-center h-[140px] text-red-600 bg-red-50 rounded-md px-4 text-sm font-medium text-center">
                ⚠️ {monthlyDataError}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorAkses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E74C3C" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#E74C3C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#7C8DB5" }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #eee",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="akses"
                    stroke="#E74C3C"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAkses)"
                    dot={{ r: 3, fill: "#E74C3C", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#E74C3C", strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Performa Worker */}
      <div className="sa-card sa-performa-card">
        <h3 className="sa-card__title" style={{ marginBottom: 16 }}>
          Performa Worker
        </h3>

        {/* Search */}
        <div className="sa-search">
          <input
            type="text"
            placeholder="Cari Nama atau Email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sa-search__input"
          />
          <Search size={18} className="sa-search__icon" />
        </div>

        {/* Table */}
        <div className="sa-table-wrapper">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Unit</th>
                <th>Materi</th>
                <th>Quiz</th>
                <th>Lulus</th>
                <th>Point</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="sa-table__empty">
                    {searchQuery
                      ? "Tidak ada hasil yang ditemukan"
                      : "Belum ada worker terdaftar"}
                  </td>
                </tr>
              ) : (
                paginatedWorkers.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => openWorkerDetail(w)}
                    className="sa-table__row"
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') openWorkerDetail(w); }}
                  >
                    <td>
                      <div className="sa-table__name">
                        <span className="sa-table__name-text">{w.name}</span>
                        <span className="sa-table__name-email">{w.email}</span>
                      </div>
                    </td>
                    <td className="sa-table__center">{w.unit || "-"}</td>
                    <td className="sa-table__center">
                      {w.materialsCompleted}/{w.totalMaterials}
                    </td>
                    <td className="sa-table__center">{w.quizAttempted}</td>
                    <td className="sa-table__center">{w.quizPassed}</td>
                    <td className="sa-table__center sa-table__point">
                      {w.totalPoints}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredWorkers.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted-foreground">
              Page {workerPage} of {totalWorkerPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setWorkerPage(p => Math.max(p - 1, 1))}
                disabled={workerPage === 1}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWorkerPage(p => Math.min(p + 1, totalWorkerPages))}
                disabled={workerPage >= totalWorkerPages}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="worker-dialog-description" aria-labelledby="worker-dialog-title">
          <DialogHeader>
            <DialogTitle className="sr-only">Worker Dialog</DialogTitle>
          </DialogHeader>
          <DialogHeader>
            <DialogTitle id="worker-dialog-title">{selectedWorker?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedWorker?.email}
            </p>
          </DialogHeader>
          <DialogDescription id="worker-dialog-description" className="sr-only">
            Detailed performance information for the selected worker, including quiz history and point transactions.
          </DialogDescription>

          {loadingDetail && !workerDetail ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : workerDetail ? (
            workerDetail.error ? (
              <div className="p-4 text-red-600">Error: {workerDetail.error}</div>
            ) : (
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
                                1000
                            )
                          : null;

                      const correctCount = session.userAnswers.filter(
                        (a: any) => a.isCorrect
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
                                  "id-ID"
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
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
