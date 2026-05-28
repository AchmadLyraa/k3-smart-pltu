"use client";

import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { getSessionParticipants } from "@/app/actions/performance-analytics";

/* ─── Types ─── */
interface PerformanceData {
  avgScore: number;
  perfectScoreRatio: number;
  perfectScoreCount: number;
  hardestQuizName: string;
  firstTryPassRate: number;
  totalWorkers: number;
  totalSessions: number;
  doughnutData: { name: string; value: number; color: string }[];
  barChartData: {
    name: string;
    fullName: string;
    rataRata: number;
    skorSempurna: number;
  }[];
  evaluationTable: {
    quizConfigId: string;
    sessionName: string;
    materialTitle: string;
    totalParticipants: number;
    avgScore: number;
    perfectCount: number;
    perfectPct: number;
    status: "Sangat Baik" | "Baik" | "Perlu Ditinjau";
  }[];
}

interface PerformanceAnalyticsPanelProps {
  data: PerformanceData | null;
  periods: any[];
  defaultPeriodId: string;
}

/* ─── Stat Card Component ─── */
function PerfStatCard({
  icon,
  value,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sublabel?: string;
}) {
  const isLongValue = typeof value === "string" && value.length > 10;
  return (
    <div className="sa-stat-card sa-perf-stat-card">
      <div className="sa-stat-card__icon">{icon}</div>
      <div className="sa-stat-card__info">
        <span className={`sa-stat-card__value ${isLongValue ? "sa-stat-card__value--small" : ""}`}>
          {value}
        </span>
        <span className="sa-stat-card__label">{label}</span>
        {sublabel && (
          <span className="sa-perf-stat-card__sublabel">{sublabel}</span>
        )}
      </div>
    </div>
  );
}

/* ─── Custom Tooltip for Bar Chart ─── */
function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const fullName = payload[0]?.payload?.fullName || label;
  return (
    <div className="sa-perf-tooltip">
      <p className="sa-perf-tooltip__title">{fullName}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="sa-perf-tooltip__item" style={{ color: entry.color }}>
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
}

/* ─── Custom Tooltip for Doughnut ─── */
function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="sa-perf-tooltip">
      <p className="sa-perf-tooltip__item" style={{ color: payload[0].payload.color }}>
        {payload[0].name}: {payload[0].value} karyawan
      </p>
    </div>
  );
}

/* ─── Badge Status Component ─── */
function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Sangat Baik"
      ? "sa-perf-badge sa-perf-badge--green"
      : status === "Baik"
        ? "sa-perf-badge sa-perf-badge--yellow"
        : "sa-perf-badge sa-perf-badge--red";
  return <span className={cls}>{status}</span>;
}

/* ─── Main Panel ─── */
export default function PerformanceAnalyticsPanel({
  data,
  periods = [],
  defaultPeriodId = "all",
}: PerformanceAnalyticsPanelProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(defaultPeriodId);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [tablePage, setTablePage] = useState(1);
  const TABLE_PAGE_SIZE = 10;

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailSearch, setDetailSearch] = useState("");
  const debouncedDetailSearch = useDebounce(detailSearch, 300);

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodId(periodId);
    const params = new URLSearchParams(window.location.search);
    if (periodId && periodId !== "all") {
      params.set("periodId", periodId);
    } else {
      params.delete("periodId");
    }
    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.location.href = newUrl;
  };

  // Filter table by search
  const filteredTable = useMemo(() => {
    if (!data?.evaluationTable) return [];
    if (!debouncedSearch.trim()) return data.evaluationTable;
    const q = debouncedSearch.toLowerCase();
    return data.evaluationTable.filter(
      (row) =>
        row.sessionName.toLowerCase().includes(q) ||
        row.materialTitle.toLowerCase().includes(q)
    );
  }, [data?.evaluationTable, debouncedSearch]);

  // Table pagination
  const totalTablePages = Math.max(
    1,
    Math.ceil(filteredTable.length / TABLE_PAGE_SIZE)
  );
  const paginatedTable = useMemo(() => {
    const start = (tablePage - 1) * TABLE_PAGE_SIZE;
    return filteredTable.slice(start, start + TABLE_PAGE_SIZE);
  }, [filteredTable, tablePage]);

  // Detail dialog participants filtered by search
  const filteredParticipants = useMemo(() => {
    if (!detailData?.participants) return [];
    if (!debouncedDetailSearch.trim()) return detailData.participants;
    const q = debouncedDetailSearch.toLowerCase();
    return detailData.participants.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.nip?.toLowerCase().includes(q)
    );
  }, [detailData?.participants, debouncedDetailSearch]);

  const openDetail = async (quizConfigId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    setDetailSearch("");
    try {
      const periodParam =
        selectedPeriodId !== "all" ? selectedPeriodId : undefined;
      const result = await getSessionParticipants(quizConfigId, periodParam);
      if (result.success && result.data) {
        setDetailData(result.data);
      }
    } catch (err) {
      console.error("[openDetail error]", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data?.evaluationTable || data.evaluationTable.length === 0) return;
    const headers = [
      "Nama Sesi",
      "Material",
      "Total Partisipan",
      "Rata-Rata Skor",
      "Karyawan Skor 100%",
      "Persentase Skor 100%",
      "Status",
    ];
    const rows = data.evaluationTable.map((row) =>
      [
        `"${row.sessionName}"`,
        `"${row.materialTitle}"`,
        row.totalParticipants,
        `${row.avgScore}%`,
        row.perfectCount,
        `${row.perfectPct}%`,
        row.status,
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analisis-performa-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!data) {
    return (
      <div className="sa-dashboard">
        <div className="sa-perf-empty">
          <p>Tidak ada data analisis performa tersedia.</p>
        </div>
      </div>
    );
  }

  const totalDoughnut = data.doughnutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="sa-dashboard">
      {/* Welcome / Header Section */}
      <div className="sa-welcome">
        <div>
          <h1 className="sa-welcome__title">Analisis Performa</h1>
          <p className="sa-welcome__subtitle">
            Evaluasi tingkat pemahaman karyawan terhadap materi & kuis
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
              {p.name}
              {p.isActive ? " (Aktif)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* ─── BARIS 1: 4 Stat Cards ─── */}
      <div className="sa-stats-grid">
        <PerfStatCard
          icon={<TrendingUp size={22} />}
          value={`${data.avgScore}%`}
          label="Rata-Rata Nilai"
          sublabel="Tingkat Pemahaman"
        />
        <PerfStatCard
          icon={<Award size={22} />}
          value={`${data.perfectScoreRatio}%`}
          label="Rasio Skor Sempurna"
          sublabel={`${data.perfectScoreCount} dari ${data.totalWorkers} User`}
        />
        <PerfStatCard
          icon={<AlertTriangle size={22} />}
          value={data.hardestQuizName}
          label="Materi Tersulit"
          sublabel="Nilai Terendah"
        />
        <PerfStatCard
          icon={<CheckCircle size={22} />}
          value={`${data.firstTryPassRate}%`}
          label="Kelulusan Pertama"
          sublabel="First-Try Pass Rate"
        />
      </div>

      {/* ─── BARIS 2: Charts Row ─── */}
      <div className="sa-perf-charts-row">
        {/* Doughnut Chart */}
        <div className="sa-card sa-perf-doughnut-card">
          <div className="sa-card__header">
            <div>
              <h3 className="sa-card__title">Distribusi Nilai Karyawan</h3>
              <p className="sa-card__desc">
                Segmentasi tingkat pemahaman karyawan
              </p>
            </div>
          </div>
          <div className="sa-perf-doughnut-body">
            <div className="sa-perf-doughnut-chart">
              {totalDoughnut > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.doughnutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {data.doughnutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="sa-perf-chart-empty">
                  <p>Belum ada data</p>
                </div>
              )}
            </div>
            <div className="sa-perf-doughnut-legend">
              {data.doughnutData.map((d, i) => (
                <div key={i} className="sa-perf-legend-item">
                  <span
                    className="sa-perf-legend-dot"
                    style={{ background: d.color }}
                  />
                  <span className="sa-perf-legend-label">{d.name}</span>
                  <span className="sa-perf-legend-value">
                    {d.value} ({totalDoughnut > 0 ? Math.round((d.value / totalDoughnut) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grouped Bar Chart */}
        <div className="sa-card sa-perf-bar-card">
          <div className="sa-card__header">
            <div>
              <h3 className="sa-card__title">Perbandingan Performa Per Sesi</h3>
              <p className="sa-card__desc">
                Rata-rata nilai vs persentase skor sempurna
              </p>
            </div>
          </div>
          <div className="sa-perf-bar-body">
            {data.barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={data.barChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  barCategoryGap="20%"
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#7C8DB5" }}
                    interval={0}
                    angle={data.barChartData.length > 5 ? -20 : 0}
                    textAnchor={data.barChartData.length > 5 ? "end" : "middle"}
                    height={data.barChartData.length > 5 ? 60 : 30}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#7C8DB5" }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar
                    dataKey="rataRata"
                    name="Rata-rata Nilai"
                    fill="#E74C3C"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="skorSempurna"
                    name="Skor Sempurna"
                    fill="#FF8C7C"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="sa-perf-chart-empty">
                <p>Belum ada data sesi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── BARIS 3: Tabel Matriks Evaluasi Modul ─── */}
      <div className="sa-card sa-performa-card">
        <div className="sa-card__header">
          <h3 className="sa-card__title">Matriks Evaluasi Modul</h3>
          <button className="sa-save-report" onClick={handleExportCSV}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Search */}
        <div className="sa-search">
          <input
            type="text"
            placeholder="Cari nama sesi atau materi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setTablePage(1);
            }}
            className="sa-search__input"
          />
          <Search size={18} className="sa-search__icon" />
        </div>

        {/* Table */}
        <div className="sa-table-wrapper">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Nama Sesi / Materi</th>
                <th>Total Partisipan</th>
                <th>Rata-Rata Skor</th>
                <th>Skor 100%</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTable.length === 0 ? (
                <tr>
                  <td colSpan={6} className="sa-table__empty">
                    {searchQuery
                      ? "Tidak ada hasil yang ditemukan"
                      : "Belum ada data evaluasi"}
                  </td>
                </tr>
              ) : (
                paginatedTable.map((row) => (
                  <tr key={row.quizConfigId} className="sa-table__row">
                    <td>
                      <div className="sa-table__name">
                        <span className="sa-table__name-text">
                          {row.sessionName}
                        </span>
                        <span className="sa-table__name-email">
                          {row.materialTitle}
                        </span>
                      </div>
                    </td>
                    <td className="sa-table__center">
                      {row.totalParticipants}
                    </td>
                    <td className="sa-table__center sa-table__point">
                      {row.avgScore}%
                    </td>
                    <td className="sa-table__center">
                      {row.perfectCount} ({row.perfectPct}%)
                    </td>
                    <td className="sa-table__center">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="sa-table__center">
                      <button
                        className="sa-perf-detail-btn"
                        onClick={() => openDetail(row.quizConfigId)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {filteredTable.length > 0 && (
          <div className="sa-perf-pagination">
            <p className="sa-perf-pagination__info">
              Page {tablePage} of {totalTablePages} ({filteredTable.length}{" "}
              sesi)
            </p>
            <div className="sa-perf-pagination__actions">
              <button
                onClick={() => setTablePage((p) => Math.max(p - 1, 1))}
                disabled={tablePage === 1}
                className="sa-perf-pagination__btn"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setTablePage((p) => Math.min(p + 1, totalTablePages))
                }
                disabled={tablePage >= totalTablePages}
                className="sa-perf-pagination__btn"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Detail Dialog ─── */}
      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDetailOpen(false);
            setDetailData(null);
            setDetailSearch("");
          }
        }}
      >
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>
              {detailData?.quizName ?? "Detail Sesi"}
            </DialogTitle>
            {detailData?.materialTitle && (
              <p className="text-sm text-muted-foreground">
                {detailData.materialTitle}
              </p>
            )}
          </DialogHeader>
          <DialogDescription
            className="sr-only"
          >
            Daftar peserta beserta nilai individu pada sesi ini.
          </DialogDescription>

          {detailLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : detailData ? (
            <div>
              {/* Search in dialog */}
              <div className="sa-search" style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Cari nama atau NIP..."
                  value={detailSearch}
                  onChange={(e) => setDetailSearch(e.target.value)}
                  className="sa-search__input"
                />
                <Search size={18} className="sa-search__icon" />
              </div>

              <div className="sa-table-wrapper">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>NIP</th>
                      <th>Unit</th>
                      <th>Divisi</th>
                      <th>Skor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="sa-table__empty">
                          Tidak ada data peserta
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p: any) => (
                        <tr key={p.userId} className="sa-table__row">
                          <td>
                            <span className="sa-table__name-text">
                              {p.name}
                            </span>
                          </td>
                          <td className="sa-table__center">{p.nip}</td>
                          <td className="sa-table__center">{p.unit}</td>
                          <td className="sa-table__center">{p.division}</td>
                          <td className="sa-table__center sa-table__point">
                            {p.scorePct}%
                          </td>
                          <td className="sa-table__center">
                            <span
                              className={`sa-perf-badge ${
                                p.passed
                                  ? "sa-perf-badge--green"
                                  : "sa-perf-badge--red"
                              }`}
                            >
                              {p.passed ? "Lulus" : "Tidak Lulus"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <p
                className="text-sm text-muted-foreground"
                style={{ marginTop: 12 }}
              >
                Total: {detailData.participants?.length ?? 0} peserta
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
