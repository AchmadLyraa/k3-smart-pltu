"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Trophy, RotateCcw, ChevronLeft, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizResultProps {
  result: {
    passed: boolean;
    percentage: number;
    correctCount: number;
    totalQuestions: number;
    totalPoints: number;
    timeBonus: number;
    penaltyPercent: number;
    penaltyPoints: number;
    daysLate: number;
    adjustedPoints: number;
    totalPointsWithBonus: number;
    showCorrectAns: boolean;
    answers: any[];
  };
  questions: any[];
  onRetry: () => void;
  onBack: () => void;
}

export default function WorkerQuizResult({
  result,
  questions,
  onRetry,
  onBack,
}: QuizResultProps) {
  return (
    <div className="h-[100dvh] px-2 w-full bg-zinc-50/40 flex flex-col overflow-hidden pt-0 pb-6 animate-in fade-in duration-300">
      
      {/* AREA KONTEN ATAS */}
      <div className="flex-1 flex flex-col justify-start space-y-4 min-h-0 overflow-y-auto no-scrollbar">
        
        {/* TOMBOL BACK (STANDALONE) */}
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-900 active:scale-95 transition-all shrink-0 shadow-sm"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* SCORE CARD */}
        <div className={cn(
          "rounded-[28px] border p-6 shadow-[0_2px_12px_rgba(0,0,0,0.015)] shrink-0 text-center",
          result.passed
            ? "bg-emerald-50/80 border-emerald-200/60"
            : "bg-red-50/80 border-red-200/60"
        )}>
          {result.passed ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-emerald-600" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          )}
          
          <h2 className="text-xl font-black text-zinc-900 mb-1">
            {result.passed ? "Selamat! Kamu Lulus! 🎉" : "Belum Lulus"}
          </h2>
          
          <div className={cn(
            "text-5xl font-black my-4",
            result.passed ? "text-emerald-600" : "text-[#FF3B30]"
          )}>
            {result.percentage}%
          </div>
          
          <p className="text-sm font-medium text-zinc-500">
            {result.correctCount} dari {result.totalQuestions} soal benar
          </p>

          {result.passed && (
            <div className="mt-5 space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/80 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm border border-emerald-200/60">
                <Trophy className="w-4 h-4" /> +{result.totalPoints} poin jawaban benar
              </div>

              {result.penaltyPercent > 0 && (
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold ml-2">
                  ⚠️ -{result.penaltyPoints} penalti ({result.daysLate} hari terlambat, -{result.penaltyPercent}%)
                </div>
              )}

              {result.timeBonus > 0 && (
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold ml-2 shadow-sm">
                  <Clock className="w-4 h-4" /> +{result.timeBonus} time bonus
                </div>
              )}

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-black shadow-sm">
                  <Sparkles className="w-4 h-4" /> Total: +{result.totalPointsWithBonus} poin
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ANSWER REVIEW */}
        {result.showCorrectAns && (
          <div className="shrink-0">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-3 px-1">
              Review Jawaban
            </h3>
            <div className="space-y-2">
              {questions.map((q, idx) => {
                const userAnswer = result.answers.find(
                  (a: any) => a.questionId === q.question.id,
                );
                const isCorrect = userAnswer?.isCorrect;
                return (
                  <div
                    key={q.id}
                    className={cn(
                      "rounded-[20px] border p-4 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)]",
                      isCorrect
                        ? "border-emerald-200/60"
                        : "border-red-200/60"
                    )}
                  >
                    <div className="flex gap-2.5 items-start mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-bold text-zinc-800">
                          {idx + 1}. {q.question.text}
                        </p>
                      </div>
                    </div>
                    <div className="ml-7.5 space-y-1 text-xs pl-0.5">
                      <p className="text-zinc-400 font-medium">
                        Jawaban kamu:{" "}
                        <span
                          className={
                            isCorrect
                              ? "text-emerald-600 font-bold"
                              : "text-red-500 font-bold"
                          }
                        >
                          {userAnswer?.answer ?? "-"}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-zinc-400 font-medium">
                          Jawaban benar:{" "}
                          <span className="text-emerald-600 font-bold">
                            {q.question.correctAnswer}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="w-full shrink-0 pt-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex-1 h-12 rounded-2xl font-black text-sm bg-white text-zinc-700 border border-zinc-200/60 hover:bg-zinc-50 active:scale-[0.98] transition-all shadow-sm"
        >
          Kembali ke Materi
        </button>
        {!result.passed && (
          <button
            onClick={onRetry}
            className="flex-1 h-12 rounded-2xl font-black text-sm bg-[#FF3B30] hover:bg-red-600 text-white active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" /> Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}