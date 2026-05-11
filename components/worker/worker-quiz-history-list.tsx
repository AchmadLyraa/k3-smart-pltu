"use client";

import { useMemo, useState, useTransition } from "react";

import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

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

import { CheckCircle, Clock, Eye, XCircle } from "lucide-react";

import { getQuizHistoryDetail } from "@/app/actions/worker";

interface QuizHistory {
  id: string;
  score: number | null;
  passed: boolean | null;
  submittedAt: string | Date | null;

  quizConfig: {
    name: string;

    material: {
      title: string;

      topic: {
        name: string;
      };

      period?: {
        id: string;
        name: string;
      } | null;
    };
  };
}

interface WorkerQuizHistoryListProps {
  histories: QuizHistory[];

  stats: {
    total: number;
    passed: number;
    failed: number;
  };
}

export default function WorkerQuizHistoryList({
  histories,
  stats,
}: WorkerQuizHistoryListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState("10");

  const [selectedSemester, setSelectedSemester] = useState("all");

  const [detail, setDetail] = useState<any>(null);

  const [open, setOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const semesterOptions = useMemo(() => {
    const map = new Map();

    histories.forEach((h) => {
      const period = h.quizConfig.material.period;

      if (period) {
        map.set(period.id, period.name);
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [histories]);

  const filteredHistories = useMemo(() => {
    if (selectedSemester === "all") {
      return histories;
    }

    return histories.filter(
      (h) => h.quizConfig.material.period?.id === selectedSemester,
    );
  }, [histories, selectedSemester]);

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

  if (histories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Belum ada riwayat quiz.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Total Quiz</p>

              <p className="text-xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Lulus</p>

              <p className="text-xl font-bold text-green-600">{stats.passed}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Gagal</p>

              <p className="text-xl font-bold text-red-600">{stats.failed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={selectedSemester}
            onValueChange={(v) => {
              setSelectedSemester(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter Semester" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Semua Semester</SelectItem>

              {semesterOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={rowsPerPage}
            onValueChange={(v) => {
              setRowsPerPage(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="5">5 Rows</SelectItem>
              <SelectItem value="10">10 Rows</SelectItem>
              <SelectItem value="20">20 Rows</SelectItem>
              <SelectItem value="50">50 Rows</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {paginatedHistories.map((history) => (
            <Card key={history.id}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">
                        {history.quizConfig.material.title}
                      </h3>

                      <Badge
                        className={
                          history.passed
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {history.passed ? "LULUS" : "GAGAL"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {history.quizConfig.name}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{history.quizConfig.material.topic.name}</span>

                      {history.quizConfig.material.period && (
                        <span>• {history.quizConfig.material.period.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Score</p>

                      <div className="flex items-center gap-1">
                        {history.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}

                        <span className="font-bold text-sm">
                          {history.score ?? 0}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>

                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />

                        <span className="text-xs">
                          {history.submittedAt
                            ? new Date(history.submittedAt).toLocaleDateString(
                                "id-ID",
                              )
                            : "-"}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetail(history.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages || 1}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Quiz</DialogTitle>
          </DialogHeader>

          {isPending ? (
            <div className="py-8 text-center">Loading...</div>
          ) : detail ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{detail.quizConfig.name}</p>

                    <p className="text-sm text-muted-foreground">
                      Passing Score: {detail.quizConfig.passingScore}
                    </p>
                  </div>

                  <Badge
                    className={
                      detail.passed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {detail.passed ? "LULUS" : "GAGAL"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Card>
                  <CardContent className="py-3">
                    <p className="text-xs text-muted-foreground">Score</p>

                    <p className="font-bold text-lg">{detail.score ?? 0}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="py-3">
                    <p className="text-xs text-muted-foreground">Correct</p>

                    <p className="font-bold text-lg">
                      {detail.correctAnswers ?? 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="py-3">
                    <p className="text-xs text-muted-foreground">Questions</p>

                    <p className="font-bold text-lg">{detail.totalQuestions}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {detail.userAnswers.map((a: any) => (
                  <div key={a.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-sm">
                        {a.question?.text ?? "Question deleted"}
                      </p>

                      <Badge
                        className={
                          a.isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {a.isCorrect ? "Benar" : "Salah"}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Jawaban:</span> {a.answer}
                      </p>

                      <p className="text-muted-foreground">
                        <span className="font-medium">Kunci:</span>{" "}
                        {a.question?.correctAnswer ?? "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
