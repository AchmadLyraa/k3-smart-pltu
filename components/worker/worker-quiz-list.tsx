"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { startQuiz } from "@/app/actions/worker";
import { Clock, Trophy, AlertCircle, PlayCircle, ChevronLeft, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import WorkerQuizView from "./worker-quiz-view";

interface WorkerQuizListProps {
  quizConfigs: any[];
  onBack: string | (() => void);
}

export default function WorkerQuizList({
  quizConfigs,
  onBack,
}: WorkerQuizListProps) {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [activeConfig, setActiveConfig] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingAnswers, setExistingAnswers] = useState<any[]>([]);

  const handleStart = async (quizConfigId: string) => {
    setLoading(quizConfigId);
    setError(null);
    try {
      const result = await startQuiz(quizConfigId);
      if (result.success && result.data) {
        setActiveSession(result.data.session);
        setActiveConfig(result.data.quizConfig);
        setExistingAnswers(result.data.existingAnswers ?? []);
      } else {
        setError(result.error ?? "Gagal memulai quiz");
      }
    } finally {
      setLoading(null);
    }
  };

  const handleBack = () => {
    if (typeof onBack === "string") {
      router.push(onBack);
    } else {
      onBack();
    }
  };

  if (activeSession && activeConfig) {
    return (
      <WorkerQuizView
        session={activeSession}
        quizConfig={activeConfig}
        existingAnswers={existingAnswers}
        onBack={() => {
          setActiveSession(null);
          setActiveConfig(null);
          setExistingAnswers([]);
        }}
      />
    );
  }

  return (
    <div className="h-[100dvh] px-2 w-full bg-zinc-50/40 flex flex-col justify-between overflow-hidden pt-0 pb-6 animate-in fade-in duration-300">
      
      {/* AREA KONTEN ATAS */}
      <div className="flex-1 flex flex-col justify-start space-y-5 min-h-0 overflow-y-auto no-scrollbar">
        
        {/* TOMBOL BACK (STANDALONE) */}
        <button 
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-900 active:scale-95 transition-all shrink-0 shadow-sm"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* HEADER SECTION */}
        <div className="bg-white rounded-[28px] border border-zinc-200/50 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] shrink-0 space-y-1">
          <h1 className="text-xl font-black text-zinc-900 tracking-tight leading-tight">
            Quiz Tersedia
          </h1>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            Kerjakan quiz untuk menguji pemahaman materi keselamatan kerja Anda
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-2xl border border-red-100/60">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* QUIZ CARDS */}
        <div className="space-y-3">
          {quizConfigs.map((quiz) => {
            const hasPassed = quiz.quizSessions?.[0]?.passed;
            const hasFailed = quiz.quizSessions?.[0] && !quiz.quizSessions[0].passed;
            const lastSessionScore = quiz.quizSessions?.[0]?.score;

            return (
              <Card key={quiz.id} className="rounded-[28px] border border-zinc-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.015)] overflow-hidden">
                <CardHeader className="pb-2 px-5 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base font-black text-zinc-900 tracking-tight">
                      {quiz.name}
                    </CardTitle>
                    {hasPassed && (
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-100/60 uppercase shrink-0">
                        Lulus ✓
                      </span>
                    )}
                  </div>
                  {quiz.description && (
                    <CardDescription className="text-xs text-zinc-500 font-medium">
                      {quiz.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0">
                  <div className="flex flex-wrap gap-3 text-xs text-zinc-400 font-medium mb-4 pt-3">
                    <span className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-full">
                      <PlayCircle className="w-3.5 h-3.5 text-zinc-500" />
                      {quiz._count?.questions ?? quiz.totalQuestions} soal
                    </span>
                    <span className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {Math.floor(quiz.timeLimit / 60)} menit
                    </span>
                    <span className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-full">
                      <Trophy className="w-3.5 h-3.5 text-zinc-500" />
                      Nilai lulus: {quiz.passingScore}%
                    </span>
                    {quiz.attempts > 0 && (
                      <span className="text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full">
                        {quiz.attempts}x percobaan
                      </span>
                    )}
                  </div>

                  {hasPassed ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
                      <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                      Sudah lulus — Score: {lastSessionScore} pts
                    </div>
                  ) : hasFailed ? (
                    <div className="space-y-3">
                      <p className="text-sm text-red-500 font-medium">
                        Percobaan terakhir: {lastSessionScore} pts — Belum lulus
                      </p>
                      <button
                        onClick={() => handleStart(quiz.id)}
                        disabled={loading === quiz.id}
                        className={cn(
                          "w-full h-12 rounded-2xl font-black text-sm flex items-center justify-center transition-all shadow-sm",
                          loading === quiz.id
                            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            : "bg-[#FF3B30] hover:bg-red-600 text-white active:scale-[0.98]"
                        )}
                      >
                        {loading === quiz.id
                          ? "Memulai..."
                          : `Coba Lagi (${quiz.attemptCount}/${quiz.allowRetake ? quiz.maxRetries : 1})`}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStart(quiz.id)}
                      disabled={loading === quiz.id}
                      className={cn(
                        "w-full h-12 rounded-2xl font-black text-sm flex items-center justify-center transition-all shadow-sm",
                        loading === quiz.id
                          ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                          : "bg-zinc-950 hover:bg-zinc-900 text-white active:scale-[0.98]"
                      )}
                    >
                      {loading === quiz.id ? "Memulai..." : "Mulai Quiz"}
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}