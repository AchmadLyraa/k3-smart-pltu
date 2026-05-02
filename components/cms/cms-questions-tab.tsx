"use client";

import { useState } from "react";
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
import { CheckCircle2, Circle, Pencil, X, Plus, Trash2 } from "lucide-react";
import QuestionForm from "./question-form";
import { updateQuestion, deleteQuestion } from "@/app/actions/quiz";

const difficultyColor = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

const typeLabel = {
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
  SHORT_ANSWER: "Short Answer",
};

export default function CMSQuestionsTab({ questions }) {
  const [showForm, setShowForm] = useState(false);
  const [editQuestion, setEditQuestion] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

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
    if (!confirm("Yakin mau hapus soal ini?")) return;
    const result = await deleteQuestion(id);
    if (result.success) {
      window.location.reload();
    } else {
      alert("Gagal hapus soal");
    }
  };

  const handleAnswerChange = (idx: number, text: string) => {
    const newAnswers = [...editData.answers];
    newAnswers[idx].text = text;
    setEditData({ ...editData, answers: newAnswers });
  };

  const handleSetCorrect = (idx: number) => {
    setEditData({
      ...editData,
      answers: editData.answers.map((a: any, i: number) => ({
        ...a,
        isCorrect: i === idx,
      })),
    });
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
    if (!editData.text.trim()) return alert("Question text wajib diisi");
    if (!editData.answers.some((a: any) => a.isCorrect))
      return alert("Mesti ada satu jawapan betul");
    if (!editData.answers.every((a: any) => a.text.trim()))
      return alert("Semua option mesti diisi");

    setSaving(true);
    try {
      const result = await updateQuestion(editQuestion.id, editData);
      if (result.success) {
        setEditQuestion(null);
        window.location.reload();
      } else {
        alert(result.error);
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
              <CardTitle>Question Bank</CardTitle>
              <CardDescription>
                {questions.length} question{questions.length !== 1 ? "s" : ""}{" "}
                total
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "+ Create Question"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {showForm && (
            <div className="mb-6">
              <QuestionForm
                onSuccess={() => {
                  setShowForm(false);
                  window.location.reload();
                }}
              />
            </div>
          )}

          {questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No questions yet. Create your first question.
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q: any, idx: number) => (
                <div
                  key={q.id}
                  className="border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 items-start flex-1 min-w-0">
                      <span className="text-sm text-muted-foreground mt-0.5 shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-snug">
                          {q.text}
                        </p>
                        {q.answerOptions?.length > 0 && (
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
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[q.difficulty] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {q.points} pts
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1 h-7 px-2 text-xs"
                        onClick={() => openEdit(q)}
                      >
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1 h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(q.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select
                    value={editData.type}
                    onValueChange={(val) => {
                      const defaults = {
                        MULTIPLE_CHOICE: [
                          { text: "", isCorrect: true },
                          { text: "", isCorrect: false },
                          { text: "", isCorrect: false },
                          { text: "", isCorrect: false },
                        ],
                        TRUE_FALSE: [
                          { text: "True", isCorrect: true },
                          { text: "False", isCorrect: false },
                        ],
                        SHORT_ANSWER: [{ text: "", isCorrect: true }],
                      };
                      setEditData({
                        ...editData,
                        type: val,
                        answers: defaults[val] ?? [],
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                      <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
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
                    <SelectTrigger>
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
                          size="sm"
                          variant={answer.isCorrect ? "default" : "outline"}
                          onClick={() => handleSetCorrect(idx)}
                          className="shrink-0 text-xs px-2"
                        >
                          {answer.isCorrect ? "✓" : "Set"}
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
                      className="w-full mt-2"
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
                          size="sm"
                          variant={answer.isCorrect ? "default" : "outline"}
                          onClick={() => handleSetCorrect(idx)}
                          className="shrink-0 text-xs px-2"
                        >
                          {answer.isCorrect ? "✓" : "Set"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SHORT ANSWER */}
              {editData.type === "SHORT_ANSWER" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expected Answer
                  </label>
                  <Input
                    value={editData.answers[0]?.text ?? ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        answers: [{ text: e.target.value, isCorrect: true }],
                      })
                    }
                    placeholder="Jawaban yang diharapkan"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Jawaban worker akan dicocokkan dengan teks ini
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditQuestion(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
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
