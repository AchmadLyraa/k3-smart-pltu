"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Circle, SquarePen, X, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import QuestionForm from "./question-form";
import { updateQuestion, deleteQuestion, getQuestions as fetchQuestions } from "@/app/actions/quiz";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

type QuestionItem = {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  points: number;
  answerOptions?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
};

interface CMSQuestionsTabProps {
  questions?: QuestionItem[];
}

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

const typeLabel: Record<string, string> = {
  MULTIPLE_CHOICE: "Multiple Choice",
  MULTIPLE_SELECT: "Multiple Select",
  TRUE_FALSE: "True / False",
};

export default function CMSQuestionsTab({ questions: initialQuestions }: CMSQuestionsTabProps) {
  const router = useRouter();
  const { toast } = useToast();

  // State untuk questions
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions || []);

  // Sinkronisasi prop-to-state pasca router.refresh()
  useEffect(() => {
    setQuestions(initialQuestions || []);
  }, [initialQuestions]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editQuestion, setEditQuestion] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);

  // Load questions dengan search
  const loadQuestions = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const result = await fetchQuestions(page, 20, debouncedSearchQuery);
        if (result.success && result.data) {
          setQuestions(result.data);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearchQuery],
  );

  useEffect(() => {
    loadQuestions(1);
  }, [debouncedSearchQuery, loadQuestions]);

  const openEdit = (q: any) => {
    setEditQuestion(q);
    setEditData({
      text: q.text,
      type: q.type,
      difficulty: q.difficulty,
      points: q.points,
      answers: q.answerOptions.map((o: any) => ({
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    });
  };

  const handleDelete = async (id: string) => {
    const questionToDelete = questions.find((q) => q.id === id);
    if (!confirm(`Yakin mau hapus soal "${questionToDelete?.text.substring(0, 40) || ""}..."?`)) return;
    const result = await deleteQuestion(id);
    if (result.success) {
      toast({
        title: "Soal Berhasil Dihapus",
        description: "Soal berhasil dihapus secara permanen.",
        variant: "success",
      });
      loadQuestions(pagination.page);
      router.refresh();
    } else {
      toast({
        title: "Gagal Menghapus Soal",
        description: result.error || "Gagal hapus soal",
        variant: "destructive",
      });
    }
  };

  const handleAnswerChange = (idx: number, text: string) => {
    const newAnswers = [...editData.answers];
    newAnswers[idx].text = text;
    setEditData({ ...editData, answers: newAnswers });
  };

  const handleSetCorrect = (idx: number) => {
    if (editData.type === "MULTIPLE_SELECT") {
      // Toggle — tidak reset yang lain
      setEditData({
        ...editData,
        answers: editData.answers.map((a: any, i: number) =>
          i === idx ? { ...a, isCorrect: !a.isCorrect } : a,
        ),
      });
    } else {
      // Reset semua, set yang dipilih
      setEditData({
        ...editData,
        answers: editData.answers.map((a: any, i: number) => ({
          ...a,
          isCorrect: i === idx,
        })),
      });
    }
  };

  const addAnswer = () => {
    setEditData({
      ...editData,
      answers: [...editData.answers, { text: "", isCorrect: false }],
    });
  };

  const removeAnswer = (idx: number) => {
    if (editData.answers.length <= 2) return;
    setEditData({
      ...editData,
      answers: editData.answers.filter((_: any, i: number) => i !== idx),
    });
  };

  const handleSave = async () => {
    if (!editData.text.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Question text wajib diisi",
        variant: "destructive",
      });
      return;
    }
    if (!editData.answers.some((a: any) => a.isCorrect)) {
      toast({
        title: "Validasi Gagal",
        description: "Mesti ada minimal satu jawaban benar",
        variant: "destructive",
      });
      return;
    }
    if (!editData.answers.every((a: any) => a.text.trim())) {
      toast({
        title: "Validasi Gagal",
        description: "Semua option mesti diisi",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await updateQuestion(editQuestion.id, editData);
      if (result.success) {
        setEditQuestion(null);
        toast({
          title: "Soal Berhasil Diperbarui!",
          description: "Soal berhasil diperbarui di bank soal.",
          variant: "success",
        });
        loadQuestions(pagination.page);
        router.refresh();
      } else {
        toast({
          title: "Gagal Memperbarui Soal",
          description: result.error || "Terjadi kesalahan pada server",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Bank Soal</CardTitle>
              <CardDescription>
                Total: {pagination.total} question
                {pagination.total !== 1 ? "s" : ""}
              </CardDescription>
            </div>
                          
      <Button className="bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] px-6 h-10 shadow-sm transition-all font-semibold" onClick={() => setShowForm(!showForm)}>
      {showForm ? "Cancel" : "+ Buat Soal"}
      </Button>
          </div>
        </CardHeader>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          
  <DialogContent className="max-w-5xl w-full max-h-screen overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Buat Soal</DialogTitle>
    </DialogHeader>
    <QuestionForm
      onSuccess={() => {
        setShowForm(false);
        loadQuestions(1);
      }}
    />
  </DialogContent>
</Dialog>

<CardContent className="space-y-4">
          {/* Search Bar */}
          <Input
            placeholder="Cari Soal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6"
          />

          {questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Soal tidak ditemukan.. Buat Soal Pertama Anda.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {questions.map((q: QuestionItem, idx: number) => (
                  <div
                    key={q.id}
                    className="border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 items-start flex-1 min-w-0">
                        <span className="text-sm text-muted-foreground mt-0.5 shrink-0">
                          #{(pagination.page - 1) * pagination.limit + idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-snug">
                            {q.text}
                          </p>
                          {q.answerOptions && q.answerOptions.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {q.answerOptions.map((opt: any) => (
                                <div
                                  key={opt.id}
                                  className="flex items-center gap-2 text-xs text-muted-foreground"
                                >
                                  {opt.isCorrect ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 shrink-0" />
                                  )}
                                  <span
                                    className={
                                      opt.isCorrect
                                        ? "text-green-700 font-medium"
                                        : ""
                                    }
                                  >
                                    {opt.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 items-end shrink-0">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {typeLabel[q.type] ?? q.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[q.difficulty] ?? "bg-muted text-muted-foreground"} ml-2`}>
                          {q.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {q.points} pts
                        </span>
                        <button
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                          onClick={() => openEdit(q)}
                        >
                          <SquarePen className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
                        <button
                          className="p-1.5 text-[#E74C3C] hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                          onClick={() => handleDelete(q.id)}
                        >
                          <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadQuestions(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadQuestions(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages || loading}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editQuestion}
        onOpenChange={(open) => !open && setEditQuestion(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>

          {editData && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Question Text
                </label>
                <Textarea
                  value={editData.text}
                  onChange={(e) =>
                    setEditData({ ...editData, text: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select
                    value={editData.type}
                    onValueChange={(val) => {
                      const defaults: Record<string, { text: string; isCorrect: boolean; }[]> = {
                        MULTIPLE_CHOICE: [
                          { text: "", isCorrect: true },
                          { text: "", isCorrect: false },
                          { text: "", isCorrect: false },
                          { text: "", isCorrect: false },
                        ],
                        MULTIPLE_SELECT: [
                          { text: "", isCorrect: true },
                          { text: "", isCorrect: false },
                          { text: "", isCorrect: false },
                          { text: "", isCorrect: false },
                        ],
                        TRUE_FALSE: [
                          { text: "True", isCorrect: true },
                          { text: "False", isCorrect: false },
                        ],
                      };
                      setEditData({
                        ...editData,
                        type: val,
                        answers: defaults[val] ?? [],
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="MULTIPLE_SELECT">
                        Multiple Select
                      </SelectItem>
                      <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Difficulty
                  </label>
                  <Select
                    value={editData.difficulty}
                    onValueChange={(val) =>
                      setEditData({ ...editData, difficulty: val })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Points
                  </label>
                  <Input
                    type="number"
                    value={editData.points}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        points: parseInt(e.target.value) || 10,
                      })
                    }
                    min="1"
                    className="w-full"
                  />
                </div>
              </div>

              {/* MULTIPLE CHOICE */}
              {editData.type === "MULTIPLE_CHOICE" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Answer Options
                  </label>
                  <div className="space-y-2">
                    {editData.answers.map((answer: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          value={answer.text}
                          onChange={(e) =>
                            handleAnswerChange(idx, e.target.value)
                          }
                          placeholder={`Option ${idx + 1}`}
                        />
                        <Button
                          type="button"
                          variant={answer.isCorrect ? "default" : "outline"}
                          onClick={() => handleSetCorrect(idx)}
                          className={`whitespace-nowrap rounded-[24px] transition-all font-semibold h-10 px-5 ${
                            answer.isCorrect
                              ? "bg-[#FF4B4B] hover:bg-[#FF3333] text-white border-none"
                              : "border-[#E2E8F0] hover:border-[#FF4B4B] hover:text-[#FF4B4B]"
                          }`}
                        >
                          {answer.isCorrect ? "✓ Correct" : "Set Correct"}
                        </Button>
                        {editData.answers.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAnswer(idx)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {editData.answers.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addAnswer}
                      className="w-full mt-2 rounded-[24px] border-[#FF4B4B] text-[#FF4B4B] hover:bg-[#FF4B4B]/10 transition-all font-semibold h-10"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Option
                    </Button>
                  )}
                </div>
              )}

              {/* TRUE/FALSE */}
              {editData.type === "TRUE_FALSE" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Correct Answer
                  </label>
                  <div className="space-y-2">
                    {editData.answers.map((answer: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          value={answer.text}
                          disabled
                          className="bg-muted"
                        />
                        <Button
                          type="button"
                          variant={answer.isCorrect ? "default" : "outline"}
                          onClick={() => handleSetCorrect(idx)}
                          className={`whitespace-nowrap rounded-[24px] transition-all font-semibold h-10 px-5 ${
                            answer.isCorrect
                              ? "bg-[#FF4B4B] hover:bg-[#FF3333] text-white border-none"
                              : "border-[#E2E8F0] hover:border-[#FF4B4B] hover:text-[#FF4B4B]"
                          }`}
                        >
                          {answer.isCorrect ? "✓ Correct" : "Set Correct"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MULTIPLE SELECT */}
              {editData.type === "MULTIPLE_SELECT" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Answer Options{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      (bisa pilih lebih dari 1 benar)
                    </span>
                  </label>
                  <div className="space-y-2">
                    {editData.answers.map((answer: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          value={answer.text}
                          onChange={(e) =>
                            handleAnswerChange(idx, e.target.value)
                          }
                          placeholder={`Option ${idx + 1}`}
                        />
                        <Button
                          type="button"
                          variant={answer.isCorrect ? "default" : "outline"}
                          onClick={() => handleSetCorrect(idx)}
                          className={`whitespace-nowrap rounded-[24px] transition-all font-semibold h-10 px-5 ${
                            answer.isCorrect
                              ? "bg-[#FF4B4B] hover:bg-[#FF3333] text-white border-none"
                              : "border-[#E2E8F0] hover:border-[#FF4B4B] hover:text-[#FF4B4B]"
                          }`}
                        >
                          {answer.isCorrect ? "✓ Benar" : "Set Benar"}
                        </Button>
                        {editData.answers.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAnswer(idx)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {editData.answers.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addAnswer}
                      className="w-full mt-2 rounded-[24px] border-[#FF4B4B] text-[#FF4B4B] hover:bg-[#FF4B4B]/10 transition-all font-semibold h-10"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Option
                    </Button>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-[24px] h-10 border-[#E2E8F0] hover:border-gray-300 transition-all font-semibold"
                  onClick={() => setEditQuestion(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
