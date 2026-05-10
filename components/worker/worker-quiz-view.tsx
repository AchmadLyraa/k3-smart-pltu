"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitQuizAnswer, completeQuiz } from "@/app/actions/worker";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import WorkerQuizResult from "./worker-quiz-result";

interface WorkerQuizViewProps {
  session: any;
  quizConfig: any;
  onBack: () => void;
}

export default function WorkerQuizView({
  session,
  quizConfig,
  onBack,
}: WorkerQuizViewProps) {
  const questions = session.questions;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quizConfig.timeLimit);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleComplete = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await completeQuiz(session.id);
      if (res.success) {
        setResult({ ...res.data, questions });
      }
    } finally {
      setSubmitting(false);
    }
  }, [session.id, submitting, questions]);

  // Timer
  useEffect(() => {
    if (result) return;
    if (timeLeft <= 0) {
      handleComplete();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, result, handleComplete]);

  const handleSelectAnswer = async (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    await submitQuizAnswer(session.id, questionId, answer);
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
        onRetry={onBack}
        onBack={onBack}
      />
    );
  }

  const currentQ = questions[currentIdx];
  const question = currentQ?.question;
  const answeredCount = Object.keys(answers).length;
  const isTimeLow = timeLeft <= 60;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">{quizConfig.name}</p>
          <p className="text-sm font-medium">
            Soal {currentIdx + 1} dari {questions.length}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-mono font-medium ${
            isTimeLow
              ? "bg-red-100 text-red-600"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
        {quizConfig.deadline &&
          (() => {
            const deadline = new Date(quizConfig.deadline);
            const now = new Date();
            const isLate = now > deadline;
            const diffMs = Math.abs(deadline.getTime() - now.getTime());
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(
              (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );

            return (
              <div
                className={`text-xs px-3 py-1.5 rounded-full ${
                  isLate
                    ? "bg-red-100 text-red-600"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {isLate ? (
                  <>
                    ⚠️ Terlambat {diffDays} hari — penalti -
                    {Math.min(diffDays * 5, 40)}%
                  </>
                ) : (
                  <>
                    ⏰ Deadline: {diffDays}h {diffHours}j lagi
                  </>
                )}
              </div>
            );
          })()}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base leading-snug">
            {question?.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {question?.answerOptions?.map((opt: any) => {
            const selected = answers[question.id] === opt.text;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectAnswer(question.id, opt.text)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                }`}
              >
                {selected ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 shrink-0 text-muted-foreground" />
                )}
                {opt.text}
              </button>
            );
          })}

          {/* SHORT ANSWER */}
          {question?.type === "SHORT_ANSWER" && (
            <input
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tulis jawaban kamu..."
              value={answers[question.id] ?? ""}
              onChange={(e) => handleSelectAnswer(question.id, e.target.value)}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          Sebelumnya
        </Button>

        <span className="text-xs text-muted-foreground">
          {answeredCount}/{questions.length} dijawab
        </span>

        {currentIdx < questions.length - 1 ? (
          <Button onClick={() => setCurrentIdx((i) => i + 1)}>
            Selanjutnya
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? "Mengirim..." : "Submit Quiz"}
          </Button>
        )}
      </div>

      {/* Question dots */}
      <div className="flex flex-wrap gap-1.5 justify-center pt-2">
        {questions.map((_: any, idx: number) => {
          const qId = questions[idx]?.question?.id;
          const answered = qId && answers[qId];
          return (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                idx === currentIdx
                  ? "bg-primary text-primary-foreground"
                  : answered
                    ? "bg-green-200 text-green-800"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
