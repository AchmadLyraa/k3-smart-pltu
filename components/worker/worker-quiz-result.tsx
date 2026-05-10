"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";

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
    <div className="space-y-6">
      {/* Score Card */}
      <Card
        className={
          result.passed
            ? "border-green-300 bg-green-50"
            : "border-red-300 bg-red-50"
        }
      >
        <CardContent className="pt-6 text-center">
          {result.passed ? (
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          )}
          <h2 className="text-2xl font-bold mb-1">
            {result.passed ? "Selamat! Kamu Lulus!" : "Belum Lulus"}
          </h2>
          <p className="text-4xl font-bold my-3">{result.percentage}%</p>
          <p className="text-muted-foreground">
            {result.correctCount} dari {result.totalQuestions} soal benar
          </p>
          {result.passed && (
            <div className="mt-3 space-y-1">
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium">
                <Trophy className="w-4 h-4" />+{result.totalPoints} poin jawaban
                benar
              </div>

              {/* Penalty kalau telat */}
              {result.penaltyPercent > 0 && (
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium ml-2">
                  ⚠️ -{result.penaltyPoints} penalti ({result.daysLate} hari
                  terlambat, -{result.penaltyPercent}%)
                </div>
              )}

              {result.timeBonus > 0 && (
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium ml-2">
                  ⚡ +{result.timeBonus} time bonus
                </div>
              )}

              <p className="text-sm font-bold text-green-600 mt-1">
                Total: +{result.totalPointsWithBonus} poin
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer Review */}
      {result.showCorrectAns && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Jawaban</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q, idx) => {
              const userAnswer = result.answers.find(
                (a) => a.questionId === q.question.id,
              );
              const isCorrect = userAnswer?.isCorrect;
              return (
                <div key={q.id} className="border rounded-lg p-3">
                  <div className="flex gap-2 items-start mb-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-medium">{q.question.text}</p>
                  </div>
                  <div className="ml-6 space-y-1 text-xs">
                    <p className="text-muted-foreground">
                      Jawaban kamu:{" "}
                      <span
                        className={
                          isCorrect
                            ? "text-green-600 font-medium"
                            : "text-red-500 font-medium"
                        }
                      >
                        {userAnswer?.answer ?? "-"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-muted-foreground">
                        Jawaban benar:{" "}
                        <span className="text-green-600 font-medium">
                          {q.question.correctAnswer}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Kembali ke Materi
        </Button>
        {!result.passed && (
          <Button className="flex-1" onClick={onRetry}>
            <RotateCcw className="w-4 h-4 mr-2" /> Coba Lagi
          </Button>
        )}
      </div>
    </div>
  );
}
