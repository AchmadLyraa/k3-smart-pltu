"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getActiveCampaigns } from "@/app/actions/quiz-campaign";
import { Clock, Trophy, Calendar, AlertCircle, PlayCircle, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignData {
  id: string;
  title: string;
  description: string | null;
  basePoints: number;
  deadline: Date | null;
  timeLimit: number;
  totalQuestions: number;
  passingScore: number;
  maxRetries: number;
  allowRetake: boolean;
  attemptCount: number;
  _count: { questions: number };
  sessions: Array<{
    id: string;
    passed: boolean | null;
    score: number | null;
    status: string;
    submittedAt: Date | null;
  }>;
}

export default function WorkerQuizCampaignSection() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const result = await getActiveCampaigns();
    if (result.success && result.data) {
      setCampaigns(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleStart = (campaignId: string) => {
    setStarting(campaignId);
    setError(null);
    // Navigate to dedicated campaign page (outside worker layout — no navbar)
    router.push(`/quiz-campaign/${campaignId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] border border-zinc-200/50 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] space-y-3">
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-24 bg-zinc-100 rounded-full" />
          <div className="h-12 w-full bg-zinc-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-[28px] border border-zinc-200/50 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.015)] shrink-0 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto border border-amber-100/60">
          <Calendar className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-black text-zinc-900">Quiz Bulanan</h3>
          <p className="text-xs text-zinc-400 font-medium mt-1 leading-relaxed">
            Quiz bulanan belum dibuka. Nantikan informasi selanjutnya pada halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-4 h-4 text-[#FF3B30]" />
        <h3 className="text-sm font-black text-zinc-800 uppercase tracking-wider">
          Quiz Khusus Bulan Ini
        </h3>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-2xl border border-red-100/60">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {campaigns.map((campaign) => {
        const lastSession = campaign.sessions?.[0];
        const hasPassed = lastSession?.passed === true;
        const hasFailed = lastSession && lastSession.passed === false;
        const now = new Date();
        const deadline = campaign.deadline ? new Date(campaign.deadline) : null;
        const isPastDeadline = deadline && now > deadline;

        return (
          <div
            key={campaign.id}
            className="bg-white rounded-[28px] border border-zinc-200/50 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-black text-zinc-900 tracking-tight">
                  {campaign.title}
                </h4>
                {campaign.description && (
                  <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
                    {campaign.description}
                  </p>
                )}
              </div>
              {hasPassed && (
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-100/60 uppercase shrink-0">
                  Lulus ✓
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1 bg-zinc-50 px-2.5 py-1 rounded-full">
                <PlayCircle className="w-3.5 h-3.5 text-zinc-500" />
                {campaign._count.questions} soal
              </span>
              <span className="flex items-center gap-1 bg-zinc-50 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {Math.floor(campaign.timeLimit / 60)} menit
              </span>
              <span className="flex items-center gap-1 bg-zinc-50 px-2.5 py-1 rounded-full">
                <Trophy className="w-3.5 h-3.5 text-zinc-500" />
                {campaign.basePoints} poin
              </span>
              <span className="flex items-center gap-1 bg-zinc-50 px-2.5 py-1 rounded-full font-bold">
                {campaign.attemptCount}/{campaign.allowRetake ? campaign.maxRetries : 1} percobaan
              </span>
              {deadline && (
                <span className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full",
                  isPastDeadline ? "bg-red-50 text-red-500" : "bg-zinc-50 text-zinc-500"
                )}>
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(deadline).toLocaleDateString("id-ID", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </span>
              )}
            </div>

            {isPastDeadline && (
              <p className="text-[10px] text-red-500 font-bold">
                ⏰ Deadline sudah lewat. Time bonus tidak tersedia. Penalti keterlambatan berlaku.
              </p>
            )}

            {hasPassed ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                Sudah lulus — {lastSession?.score ?? 0} pts
              </div>
            ) : hasFailed ? (
              <div className="space-y-2">
                <p className="text-xs text-red-500 font-medium">
                  Percobaan terakhir: {lastSession?.score ?? 0} pts — Belum lulus
                </p>
                <button
                  onClick={() => handleStart(campaign.id)}
                  disabled={starting === campaign.id}
                  className="w-full h-11 rounded-2xl font-black text-sm bg-[#FF3B30] hover:bg-red-600 text-white active:scale-[0.98] transition-all shadow-sm"
                >
                  {starting === campaign.id ? "Memuat..." : "Coba Lagi"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleStart(campaign.id)}
                disabled={starting === campaign.id}
                className={cn(
                  "w-full h-11 rounded-2xl font-black text-sm transition-all shadow-sm active:scale-[0.98]",
                  starting === campaign.id
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                    : "bg-zinc-950 hover:bg-zinc-900 text-white"
                )}
              >
                {starting === campaign.id ? "Memuat..." : "Mulai Quiz"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}