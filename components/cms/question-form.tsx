"use client";

import { useState } from "react";
import { createQuestion } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";

const defaultAnswers = {
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
  SHORT_ANSWER: [],
};

export default function QuestionForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: "",
    type: "MULTIPLE_CHOICE",
    difficulty: "medium",
    points: 10,
    answers: defaultAnswers.MULTIPLE_CHOICE,
  });

  const handleTypeChange = (val: string) => {
    setFormData({
      ...formData,
      type: val,
      answers: defaultAnswers[val] ?? [],
    });
  };

  const handleAnswerChange = (idx: number, text: string) => {
    const newAnswers = [...formData.answers];
    newAnswers[idx] = { ...newAnswers[idx], text };
    setFormData({ ...formData, answers: newAnswers });
  };

  const handleSetCorrect = (idx: number) => {
    setFormData({
      ...formData,
      answers: formData.answers.map((a, i) => ({ ...a, isCorrect: i === idx })),
    });
  };

  const addAnswer = () => {
    setFormData({
      ...formData,
      answers: [...formData.answers, { text: "", isCorrect: false }],
    });
  };

  const removeAnswer = (idx: number) => {
    setFormData({
      ...formData,
      answers: formData.answers.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) return alert("Question text wajib diisi");

    if (formData.type !== "SHORT_ANSWER") {
      if (!formData.answers.some((a) => a.isCorrect))
        return alert("Mesti ada satu jawapan betul");
      if (!formData.answers.every((a) => a.text.trim()))
        return alert("Semua option mesti diisi");
    }

    setLoading(true);
    try {
      const result = await createQuestion({
        text: formData.text,
        type: formData.type,
        difficulty: formData.difficulty,
        points: formData.points,
        answers: formData.answers,
      });

      if (result.success) {
        setFormData({
          text: "",
          type: "MULTIPLE_CHOICE",
          difficulty: "medium",
          points: 10,
          answers: defaultAnswers.MULTIPLE_CHOICE,
        });
        onSuccess();
      } else {
        alert(result.error ?? "Gagal create question");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Question</CardTitle>
        <CardDescription>Add question to question bank</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Question Text
            </label>
            <Textarea
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              placeholder="Enter question"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
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
                value={formData.difficulty}
                onValueChange={(val) =>
                  setFormData({ ...formData, difficulty: val })
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
              <label className="block text-sm font-medium mb-2">Points</label>
              <Input
                type="number"
                value={formData.points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points: parseInt(e.target.value) || 10,
                  })
                }
                min="1"
              />
            </div>
          </div>

          {/* MULTIPLE CHOICE */}
          {formData.type === "MULTIPLE_CHOICE" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Answer Options
              </label>
              {formData.answers.map((answer, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                  />
                  <Button
                    type="button"
                    variant={answer.isCorrect ? "default" : "outline"}
                    onClick={() => handleSetCorrect(idx)}
                    className="whitespace-nowrap"
                  >
                    {answer.isCorrect ? "✓ Correct" : "Set Correct"}
                  </Button>
                  {formData.answers.length > 2 && (
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
              {formData.answers.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAnswer}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Option
                </Button>
              )}
            </div>
          )}

          {/* TRUE/FALSE */}
          {formData.type === "TRUE_FALSE" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Correct Answer
              </label>
              {formData.answers.map((answer, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input value={answer.text} disabled className="bg-muted" />
                  <Button
                    type="button"
                    variant={answer.isCorrect ? "default" : "outline"}
                    onClick={() => handleSetCorrect(idx)}
                    className="whitespace-nowrap"
                  >
                    {answer.isCorrect ? "✓ Correct" : "Set Correct"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* SHORT ANSWER */}
          {formData.type === "SHORT_ANSWER" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Expected Answer
              </label>
              <Input
                value={formData.answers[0]?.text ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Question"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
