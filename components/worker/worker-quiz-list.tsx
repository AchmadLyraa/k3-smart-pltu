"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { startQuiz } from "@/app/actions/worker";
import { Clock, Trophy, AlertCircle, PlayCircle } from "lucide-react";
import WorkerQuizView from "./worker-quiz-view";

interface WorkerQuizListProps {
  quizConfigs: any[];
  onBack: () => void;
}

export default function WorkerQuizList({
  quizConfigs,
  onBack,
}: WorkerQuizListProps) {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [activeConfig, setActiveConfig] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (quizConfigId: string) => {
    setLoading(quizConfigId);
    setError(null);
    try {
      const result = await startQuiz(quizConfigId);
      if (result.success) {
        setActiveSession(result.data.session);
        setActiveConfig(result.data.quizConfig);
      } else {
        setError(result.error ?? "Gagal memulai quiz");
      }
    } finally {
      setLoading(null);
    }
  };

  if (activeSession && activeConfig) {
    return (
      <WorkerQuizView
        session={activeSession}
        quizConfig={activeConfig}
        onBack={() => {
          setActiveSession(null);
          setActiveConfig(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2 px-0">
        ← Kembali ke Materi
      </Button>

      <h3 className="font-semibold text-lg">Quiz Tersedia</h3>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-3">
        {quizConfigs.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{quiz.name}</CardTitle>
              {quiz.description && (
                <CardDescription>{quiz.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <PlayCircle className="w-3.5 h-3.5" />
                  {quiz._count?.questions ?? quiz.totalQuestions} soal
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.floor(quiz.timeLimit / 60)} menit
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  Nilai lulus: {quiz.passingScore}%
                </span>
                {quiz.attempts > 0 && (
                  <span className="text-yellow-600">
                    {quiz.attempts}x percobaan
                  </span>
                )}
              </div>

              {quiz.lastSession?.passed ? (
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <Trophy className="w-4 h-4" />
                  Sudah lulus — Score: {quiz.lastSession.score} pts
                </div>
              ) : quiz.lastSession && !quiz.lastSession.passed ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-500">
                    Percobaan terakhir: {quiz.lastSession.score} pts — Belum
                    lulus
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => handleStart(quiz.id)}
                    disabled={loading === quiz.id}
                  >
                    {loading === quiz.id
                      ? "Memulai..."
                      : `Coba Lagi (${quiz.attemptCount}/${quiz.allowRetake ? quiz.maxRetries : 1})`}
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleStart(quiz.id)}
                  disabled={loading === quiz.id}
                >
                  {loading === quiz.id ? "Memulai..." : "Mulai Quiz"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
