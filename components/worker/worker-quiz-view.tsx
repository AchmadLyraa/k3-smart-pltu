"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitQuizAnswer, completeQuiz } from "@/app/actions/worker";
import { completeCampaignQuiz } from "@/app/actions/quiz-campaign";
import { CheckCircle2, Circle, Clock, ChevronLeft, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import WorkerQuizResult from "./worker-quiz-result";

interface WorkerQuizViewProps {
  session: any;
  quizConfig: any;
  existingAnswers?: Array<{ questionId: string; answer: string }>;
  onBack: () => void;
  onRetry?: () => void;
  isCampaign?: boolean;
}

export default function WorkerQuizView({
  session,
  quizConfig,
  existingAnswers = [],
  onBack,
  onRetry,
  isCampaign = false,
}: WorkerQuizViewProps) {
  const questions = session.questions;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    existingAnswers.forEach((a) => {
      if (a.questionId) initial[a.questionId] = a.answer;
    });
    return initial;
  });
  const [timeLeft, setTimeLeft] = useState(quizConfig.timeLimit);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Adjust timer for resumed sessions (client-side only, avoids hydration mismatch)
  useEffect(() => {
    const startedAt = new Date(session.startedAt).getTime();
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const remaining = Math.max(0, quizConfig.timeLimit - elapsed);
    setTimeLeft(remaining);
  }, []);

  const handleComplete = useCallback(
    async (isAutoSubmit = false) => {
      if (submitting) return;

      if (!isAutoSubmit) {
        const unanswered = questions.filter((q: any) => {
          const qId = q?.question?.id;
          return !answers[qId] || answers[qId].trim() === "";
        });

        if (unanswered.length > 0) {
          const confirmed = window.confirm(
            `Masih ada ${unanswered.length} soal yang belum dijawab. Yakin mau submit sekarang? Soal yang belum dijawab akan dianggap salah.`,
          );
          if (!confirmed) return;
        }
      }

      setSubmitting(true);
      try {
        const res = isCampaign
          ? await completeCampaignQuiz(session.id)
          : await completeQuiz(session.id);
        if (res.success) {
          setResult({ ...res.data, questions });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [session.id, submitting, questions, answers],
  );

  // Timer
  useEffect(() => {
    if (result) return;
    if (timeLeft <= 0) {
      handleComplete(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t: number) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, result, handleComplete]);

  const handleSelectAnswer = async (questionId: string, answer: string) => {
    let newAnswer = answer;

    const currentQ = questions[currentIdx];
    const question = currentQ?.question;
    if (question?.type === "MULTIPLE_SELECT") {
      const current = answers[questionId] ? answers[questionId].split(",") : [];
      const updated = current.includes(answer)
        ? current.filter((a) => a !== answer)
        : [...current, answer];
      newAnswer = updated.join(",");
    }

    setAnswers((prev) => ({ ...prev, [questionId]: newAnswer }));
    await submitQuizAnswer(session.id, questionId, newAnswer);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (result) {
    return (
      <WorkerQuizResult
        result={result}
        questions={questions}
        onRetry={onRetry ?? onBack}
        onBack={onBack}
      />
    );
  }

  const currentQ = questions[currentIdx];
  const question = currentQ?.question;
  const answeredCount = Object.keys(answers).length;
  const isTimeLow = timeLeft <= 60;
  const progressPercent = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="h-[100dvh] px-2 w-full bg-zinc-50/40 flex flex-col overflow-hidden pt-0 pb-6 animate-in fade-in duration-300">
      
      {/* AREA KONTEN ATAS */}
      <div className="flex-1 flex flex-col justify-start space-y-4 min-h-0 overflow-y-auto no-scrollbar">
        
        {/* HEADER: BACK BUTTON + TIMER + DEADLINE */}
        <div className="flex items-center justify-between shrink-0 pt-1">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-900 active:scale-95 transition-all shrink-0 shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold",
                isTimeLow
                  ? "bg-red-50 text-[#FF3B30] border border-red-100/60"
                  : "bg-white text-zinc-700 border border-zinc-200/60 shadow-sm"
              )}
            >
              <Clock className={cn("w-3.5 h-3.5", isTimeLow && "animate-pulse")} />
              {formatTime(timeLeft)}
            </div>

            {quizConfig.deadline &&
              (() => {
                const deadline = new Date(quizConfig.deadline);
                const now = new Date();
                const isLate = now > deadline;
                const daysLate = Math.ceil(
                  (now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24),
                );
                const diffMs = deadline.getTime() - now.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor(
                  (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
                );

                return (
                  <div
                    className={cn(
                      "text-[10px] font-bold px-3 py-1.5 rounded-full",
                      isLate
                        ? "bg-red-50 text-[#FF3B30] border border-red-100/60"
                        : "bg-amber-50 text-amber-700 border border-amber-100/60"
                    )}
                  >
                    {isLate ? (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Terlambat {daysLate}h -{Math.min(daysLate * 5, 40)}%
                      </span>
                    ) : (
                      <>
                        ⏰ {diffDays}h {diffHours}j
                      </>
                    )}
                  </div>
                );
              })()}
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="shrink-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">
              Soal {currentIdx + 1} dari {questions.length}
            </span>
            <span className="text-xs font-bold text-zinc-400">
              {answeredCount}/{questions.length} dijawab
            </span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#FF3B30] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* QUESTION CARD */}
        <Card className="rounded-[28px] border border-zinc-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.015)] shrink-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base font-black text-zinc-900 tracking-tight leading-snug">
              {question?.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2.5">
            {question?.answerOptions?.map((opt: any) => {
              const isMultiSelect = question.type === "MULTIPLE_SELECT";
              const selectedValues = answers[question.id]?.split(",") ?? [];
              const selected = isMultiSelect
                ? selectedValues.includes(opt.text)
                : answers[question.id] === opt.text;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectAnswer(question.id, opt.text)}
                  className={cn(
                    "w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all active:scale-[0.99]",
                    selected
                      ? "border-[#FF3B30] bg-red-50/60 text-[#FF3B30] font-bold"
                      : "border-zinc-200/60 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm"
                  )}
                >
                  {selected ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-[#FF3B30]" />
                  ) : (
                    <Circle className="w-5 h-5 shrink-0 text-zinc-300" />
                  )}
                  <span>{opt.text}</span>
                </button>
              );
            })}
            {question?.type === "MULTIPLE_SELECT" && (
              <p className="text-[10px] text-zinc-400 font-medium pt-1">
                Pilih semua jawaban yang benar
              </p>
            )}
          </CardContent>
        </Card>

        {/* QUESTION NAVIGATION DOTS */}
        <div className="flex flex-wrap gap-2 justify-center shrink-0 pb-1">
          {questions.map((_: any, idx: number) => {
            const qId = questions[idx]?.question?.id;
            const answered = qId && answers[qId];
            return (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs font-bold transition-all",
                  idx === currentIdx
                    ? "bg-[#FF3B30] text-white shadow-sm scale-110"
                    : answered
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200/60"
                      : "bg-zinc-100 text-zinc-400 border border-zinc-200/60"
                )}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM NAVIGATION BUTTONS */}
      <div className="w-full shrink-0 pt-3 flex items-center gap-3">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className={cn(
            "h-12 px-6 rounded-2xl font-black text-sm transition-all shadow-sm border",
            currentIdx === 0
              ? "bg-zinc-100 text-zinc-300 border-zinc-200/60 cursor-not-allowed"
              : "bg-white text-zinc-700 border-zinc-200/60 hover:bg-zinc-50 active:scale-[0.98]"
          )}
        >
          Sebelumnya
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx((i) => i + 1)}
            className="flex-1 h-12 rounded-2xl font-black text-sm bg-zinc-950 hover:bg-zinc-900 text-white active:scale-[0.98] transition-all shadow-sm"
          >
            Selanjutnya
          </button>
        ) : (
          <button
            onClick={() => handleComplete(false)}
            disabled={submitting}
            className="flex-1 h-12 rounded-2xl font-black text-sm bg-[#FF3B30] hover:bg-red-600 text-white active:scale-[0.98] transition-all shadow-sm"
          >
            {submitting ? "Mengirim..." : "Submit Quiz"}
          </button>
        )}
      </div>
    </div>
  );
}