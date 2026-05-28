"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  History,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  ChevronLeft,
  FileText,
  CalendarDays,
  BookOpen,
  ScrollText,
  Filter,
  Search,
  BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getQuizHistoryDetail } from "@/app/actions/worker";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// ──────────────────── TYPES ────────────────────

interface QuizHistory {
  id: string;
  score: number | null;
  passed: boolean | null;
  submittedAt: string | Date | null;

  quizConfig: {
    name: string;
    material: {
      title: string;
      topic: { name: string };
      period?: { id: string; name: string } | null;
    };
  } | null;

  quizCampaign?: {
    id: string;
    title: string;
    passingScore: number;
    period?: { id: string; name: string } | null;
  } | null;
}

interface WorkerQuizHistoryListProps {
  histories: QuizHistory[];
  stats: { total: number; passed: number; failed: number };
}

// ──────────────────── HELPERS ────────────────────

function getQuizTitle(h: QuizHistory): string {
  return h.quizConfig?.material?.title ?? h.quizCampaign?.title ?? "Quiz Campaign";
}

function getQuizSubtitle(h: QuizHistory): string {
  return h.quizConfig?.name ?? "Quiz Khusus Bulanan";
}

function getPeriodName(h: QuizHistory): string | null {
  return h.quizConfig?.material?.period?.name ?? h.quizCampaign?.period?.name ?? null;
}

function getPeriodId(h: QuizHistory): string | null {
  return h.quizConfig?.material?.period?.id ?? h.quizCampaign?.period?.id ?? null;
}

function getTopicName(h: QuizHistory): string | null {
  return h.quizConfig?.material?.topic?.name ?? null;
}

function getQuizType(h: QuizHistory): "material" | "campaign" {
  return h.quizConfig ? "material" : "campaign";
}

function formatDate(d: string | Date | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ──────────────────── MAIN COMPONENT ────────────────────

export default function WorkerQuizHistoryList({
  histories,
  stats,
}: WorkerQuizHistoryListProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "material" | "campaign">("all");
  const [detail, setDetail] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── derive period options ──
  const periodOptions = useMemo(() => {
    const map = new Map<string, string>();
    histories.forEach((h) => {
      const pid = getPeriodId(h);
      const pname = getPeriodName(h);
      if (pid && pname) map.set(pid, pname);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [histories]);

  // ── filtered + paginated ──
  const filteredHistories = useMemo(() => {
    return histories.filter((h) => {
      if (selectedPeriod !== "all" && getPeriodId(h) !== selectedPeriod) return false;
      if (selectedType === "material" && getQuizType(h) !== "material") return false;
      if (selectedType === "campaign" && getQuizType(h) !== "campaign") return false;
      return true;
    });
  }, [histories, selectedPeriod, selectedType]);

  const totalPages = Math.ceil(filteredHistories.length / Number(rowsPerPage));
  const paginatedHistories = useMemo(() => {
    const start = (currentPage - 1) * Number(rowsPerPage);
    return filteredHistories.slice(start, start + Number(rowsPerPage));
  }, [filteredHistories, currentPage, rowsPerPage]);

  const openDetail = (id: string) => {
    startTransition(async () => {
      const res = await getQuizHistoryDetail(id);
      if (res.success) {
        setDetail(res.data);
        setOpen(true);
      }
    });
  };

  // ── empty state ──
  if (histories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-2 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
          <ScrollText className="w-9 h-9 text-red-300" />
        </div>
        <div>
          <p className="text-base font-bold text-zinc-800">Belum Ada Riwayat Quiz</p>
          <p className="text-sm text-zinc-400 mt-1 max-w-xs">
            Setiap quiz yang kamu kerjakan akan tercatat di sini.
          </p>
        </div>
        <Link
          href="/worker/materials"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-2xl bg-[#FF3B30] text-white text-sm font-bold hover:bg-red-600 transition-all active:scale-[0.97]"
        >
          <BookOpen className="w-4 h-4" /> Mulai Belajar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-2">
      {/* Back Button */}
      <button
        onClick={() => router.push("/worker/home")}
        className="w-10 h-10 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-900 active:scale-95 transition-all shrink-0 shadow-sm"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* ════ HEADER CARD (seperti Reward Center) ════ */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-zinc-950 via-red-950 to-red-600 p-6 md:p-7 text-white shadow-xl border border-red-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(239,68,68,0.25),transparent_45%)] pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[radial-gradient(circle,rgba(239,68,68,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <BrainCircuit className="w-52 h-52 text-white" />
        </div>


        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
              <History className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-red-300 flex items-center gap-1">
              Riwayat K3 <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Riwayat Kuis
          </h1>

          <p className="text-xs md:text-sm text-red-100/80 font-medium max-w-xl">
            Pantau riwayat pengerjaan seluruh kuis keselamatan kerja Anda.
          </p>
        </div>
      </div>

      {/* ════ STATS CARDS ════ */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Quiz", value: stats.total, color: "text-zinc-900" },
          { label: "Lulus", value: stats.passed, color: "text-emerald-600" },
          { label: "Gagal", value: stats.failed, color: "text-red-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-[20px] p-4 border border-zinc-100 shadow-[0_1px_6px_rgba(0,0,0,0.02)] text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              {s.label}
            </p>
            <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ════ FILTERS ════ */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Select
            value={selectedPeriod}
            onValueChange={(v) => { setSelectedPeriod(v); setCurrentPage(1); }}
          >
            <SelectTrigger className="w-full h-11 rounded-2xl border-zinc-200 bg-white text-sm font-medium shadow-sm">
              <SelectValue placeholder="Semua Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Periode</SelectItem>
              {periodOptions.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <Select
            value={selectedType}
            onValueChange={(v: "all" | "material" | "campaign") => { setSelectedType(v); setCurrentPage(1); }}
          >
            <SelectTrigger className="w-full h-11 rounded-2xl border-zinc-200 bg-white text-sm font-medium shadow-sm">
              <SelectValue placeholder="Semua Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="material">Quiz Pemahaman Materi</SelectItem>
              <SelectItem value="campaign">Quiz Bulanan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[130px]">
          <Select
            value={rowsPerPage}
            onValueChange={(v) => { setRowsPerPage(v); setCurrentPage(1); }}
          >
            <SelectTrigger className="w-full h-11 rounded-2xl border-zinc-200 bg-white text-sm font-medium shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Baris</SelectItem>
              <SelectItem value="10">10 Baris</SelectItem>
              <SelectItem value="20">20 Baris</SelectItem>
              <SelectItem value="50">50 Baris</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ════ HISTORY CARDS ════ */}
      <div className="space-y-3">
        {paginatedHistories.map((h) => {
          const isMaterial = getQuizType(h) === "material";
          return (
            <div
              key={h.id}
              className="bg-white rounded-[24px] border border-zinc-100 p-5 shadow-[0_1px_6px_rgba(0,0,0,0.02)] transition-colors duration-200 active:scale-[0.995]"
            >
              <div className="flex items-start justify-between gap-3">
                {/* LEFT */}
                <div className="min-w-0 flex-1 space-y-2">
                  {/* title row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* type badge */}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                        isMaterial
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "bg-purple-50 text-purple-600 border border-purple-200",
                      )}
                    >
                      {isMaterial ? (
                        <FileText className="w-3 h-3" />
                      ) : (
                        <CalendarDays className="w-3 h-3" />
                      )}
                      {isMaterial ? "Materi" : "Bulanan"}
                    </span>

                    {/* pass/fail badge */}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                        h.passed
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200",
                      )}
                    >
                      {h.passed ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {h.passed ? "Lulus" : "Gagal"}
                    </span>
                  </div>

                  {/* title */}
                  <h3 className="font-bold text-sm text-zinc-900 leading-snug">
                    {getQuizTitle(h)}
                  </h3>

                  {/* subtitle (quiz config name / campaign) */}
                  <p className="text-xs text-zinc-400 font-medium">
                    {getQuizSubtitle(h)}
                  </p>

                  {/* meta row */}
                  <div className="flex items-center gap-3 flex-wrap text-[11px] text-zinc-400">
                    {getTopicName(h) && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {getTopicName(h)}
                      </span>
                    )}
                    {getPeriodName(h) && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {getPeriodName(h)}
                      </span>
                    )}
                    {h.submittedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(h.submittedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* RIGHT: score + detail button */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Skor
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {!h.passed ? (
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span className="font-black text-base text-zinc-900">
                        {h.score ?? 0}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openDetail(h.id)}
                    className="h-8 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-[10px] font-bold text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 active:scale-[0.95] transition-all flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" /> Detail
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ════ PAGINATION ════ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={cn(
              "h-9 px-4 rounded-xl border text-xs font-bold transition-all active:scale-[0.95]",
              currentPage === 1
                ? "border-zinc-100 text-zinc-300 cursor-not-allowed"
                : "border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50",
            )}
          >
            Prev
          </button>

          <span className="text-xs font-bold text-zinc-400">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={cn(
              "h-9 px-4 rounded-xl border text-xs font-bold transition-all active:scale-[0.95]",
              currentPage >= totalPages
                ? "border-zinc-100 text-zinc-300 cursor-not-allowed"
                : "border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50",
            )}
          >
            Next
          </button>
        </div>
      )}

      {/* ════ DETAIL MODAL ════ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-[28px] border-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-red-500" />
              Detail Quiz
            </DialogTitle>
          </DialogHeader>

          {isPending ? (
            <div className="py-12 text-center text-sm font-bold text-zinc-400">
              <div className="w-8 h-8 rounded-full border-2 border-red-200 border-t-red-500 animate-spin mx-auto mb-3" />
              Memuat detail...
            </div>
          ) : detail ? (
            <div className="space-y-4">
              {/* summary card */}
              <div className="bg-zinc-50 rounded-[20px] p-4 border border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm text-zinc-900">
                      {detail.quizConfig?.name ?? "Quiz"}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Passing Score: {detail.quizConfig?.passingScore ?? "-"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      detail.passed
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-red-50 text-red-600 border-red-200",
                    )}
                  >
                    {detail.passed ? "LULUS" : "GAGAL"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Skor", value: detail.score ?? 0 },
                    { label: "Benar", value: detail.correctAnswers ?? 0 },
                    { label: "Soal", value: detail.totalQuestions },
                  ].map((x) => (
                    <div
                      key={x.label}
                      className="bg-white rounded-xl p-3 text-center border border-zinc-100"
                    >
                      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                        {x.label}
                      </p>
                      <p className="text-lg font-black text-zinc-900 mt-0.5">
                        {x.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* user answers list */}
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                Jawaban ({detail.userAnswers?.length ?? 0})
              </p>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
                {detail.userAnswers?.map((a: any, idx: number) => (
                  <div
                    key={a.id ?? idx}
                    className={cn(
                      "rounded-[18px] border p-4 bg-white",
                      a.isCorrect
                        ? "border-emerald-200/60"
                        : "border-red-200/60",
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      {a.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 leading-snug">
                          {a.question?.text ?? "Soal telah dihapus"}
                        </p>
                        <div className="mt-2 space-y-0.5 text-xs">
                          <p className="text-zinc-500">
                            Jawaban:{" "}
                            <span
                              className={
                                a.isCorrect
                                  ? "text-emerald-600 font-bold"
                                  : "text-red-500 font-bold"
                              }
                            >
                              {a.answer ?? "-"}
                            </span>
                          </p>
                          {!a.isCorrect && a.question?.correctAnswer && (
                            <p className="text-zinc-500">
                              Kunci:{" "}
                              <span className="text-emerald-600 font-bold">
                                {a.question.correctAnswer}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}