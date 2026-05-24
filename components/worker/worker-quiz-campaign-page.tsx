"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WorkerQuizView from "@/components/worker/worker-quiz-view";
import WorkerQuizResult from "@/components/worker/worker-quiz-result";
import { completeCampaignQuiz } from "@/app/actions/quiz-campaign";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkerQuizCampaignPageProps {
  session: any;
  campaign: any;
  error?: string;
  campaignId?: string;
}

export default function WorkerQuizCampaignPageClient({
  session,
  campaign,
  error: initialError,
  campaignId,
}: WorkerQuizCampaignPageProps) {
  const router = useRouter();
  const [quizSession, setQuizSession] = useState(session);
  const [quizCampaign, setQuizCampaign] = useState(campaign);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [retrying, setRetrying] = useState(false);

  const handleBack = () => {
    router.push("/worker/materials");
  };

  const handleRetry = () => {
    setRetrying(true);
    // Navigate to same page to trigger fresh server call
    if (campaignId) {
      router.push(`/quiz-campaign/${campaignId}`);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const res = await completeCampaignQuiz(quizSession.id);
      if (res.success) {
        setResult({ ...res.data, questions: quizSession.questions });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // After completing, show result inline
  if (result) {
    return (
      <div className="h-[100dvh] px-2 w-full bg-zinc-50/40 flex flex-col overflow-hidden pt-0 pb-6 animate-in fade-in duration-300">
        <div className="flex-1 flex flex-col justify-start space-y-4 min-h-0 overflow-y-auto no-scrollbar">
          <button 
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-900 active:scale-95 transition-all shrink-0 shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className={cn(
            "rounded-[28px] border p-6 shadow-[0_2px_12px_rgba(0,0,0,0.015)] shrink-0 text-center",
            result.passed
              ? "bg-emerald-50/80 border-emerald-200/60"
              : "bg-red-50/80 border-red-200/60"
          )}>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{result.passed ? "🎉" : "😢"}</span>
            </div>
            <h2 className="text-xl font-black text-zinc-900 mb-1">
              {result.passed ? "Selamat! Kamu Lulus! 🎉" : "Belum Lulus"}
            </h2>
            <div className={cn("text-5xl font-black my-4", result.passed ? "text-emerald-600" : "text-[#FF3B30]")}>
              {result.percentage}%
            </div>
            <p className="text-sm font-medium text-zinc-500">
              {result.correctCount} dari {result.totalQuestions} soal benar
            </p>
            {result.passed && (
              <div className="mt-5 space-y-2">
                <div className="inline-flex items-center gap-2 bg-white/80 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm border border-emerald-200/60">
                  +{result.totalPoints} poin jawaban benar
                </div>
                {result.timeBonus > 0 && (
                  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold ml-2 shadow-sm">
                    ⚡ +{result.timeBonus} time bonus
                  </div>
                )}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-black shadow-sm">
                    Total: +{result.totalPointsWithBonus} poin
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full shrink-0 pt-4">
          <button
            onClick={handleBack}
            className="w-full h-12 rounded-2xl font-black text-sm bg-zinc-950 hover:bg-zinc-900 text-white active:scale-[0.98] transition-all shadow-sm"
          >
            Kembali ke Materi
          </button>
        </div>
      </div>
    );
  }

  // Jika ada error, tampilkan pesan error dengan tombol coba lagi
  if (error || !quizSession || !quizCampaign) {
    return (
      <div className="h-[100dvh] px-2 w-full bg-zinc-50/40 flex flex-col overflow-hidden pt-0 pb-6 animate-in fade-in duration-300">
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 px-4">
          <div className="bg-white rounded-[28px] border border-zinc-200/50 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)] text-center max-w-sm w-full space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto border border-red-100/60">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-black text-zinc-900">Gagal Memulai Quiz</h2>
            <p className="text-sm text-zinc-500 font-medium">
              {error || "Terjadi kesalahan saat memulai quiz"}
            </p>
            {campaignId && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="w-full h-12 rounded-2xl font-black text-sm bg-[#FF3B30] hover:bg-red-600 text-white active:scale-[0.98] transition-all shadow-sm"
              >
                {retrying ? "Memuat..." : "Coba Lagi"}
              </button>
            )}
            <button
              onClick={handleBack}
              className="w-full h-12 rounded-2xl font-black text-sm bg-white text-zinc-700 border border-zinc-200/60 hover:bg-zinc-50 active:scale-[0.98] transition-all shadow-sm"
            >
              Kembali ke Materi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WorkerQuizView
      session={quizSession}
      quizConfig={{
        ...quizCampaign,
        name: quizCampaign.title,
        questions: quizSession.questions,
      }}
      existingAnswers={[]}
      onBack={handleBack}
      onRetry={() => campaignId && router.push(`/quiz-campaign/${campaignId}`)}
      isCampaign={true}
    />
  );
}