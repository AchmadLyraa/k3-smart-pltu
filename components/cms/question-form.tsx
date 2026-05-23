"use client";

import { useState } from "react";
import { createQuestion } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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

// Answer option type
type AnswerOption = {
  text: string;
  isCorrect: boolean;
};

// Question type keys
type QuestionType = "MULTIPLE_CHOICE" | "MULTIPLE_SELECT" | "TRUE_FALSE";

// Default answers per question type
const defaultAnswers: Record<QuestionType, AnswerOption[]> = {
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
    { text: "Benar", isCorrect: true },
    { text: "Salah", isCorrect: false },
  ],
};

export default function QuestionForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    text: "",
    type: "MULTIPLE_CHOICE" as QuestionType,
    difficulty: "medium",
    points: 10,
    answers: defaultAnswers.MULTIPLE_CHOICE,
  });

  const handleTypeChange = (val: QuestionType) => {
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
if (!formData.text.trim()) {
  toast({
    title: "Error",
    description: "Text Soal wajib diisi",
    variant: "destructive",
  });
  return;
}

    if (!formData.answers.some((a) => a.isCorrect)) {
        toast({
          title: "Error",
          description: "Mesti ada satu jawapan betul",
          variant: "destructive",
        });
        return;
    }
    
    if (!formData.answers.every((a) => a.text.trim())) {
      toast({
        title: "Error",
        description: "Semua option mesti diisi",
        variant: "destructive",
      });
      return;
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
          type: "MULTIPLE_CHOICE" as QuestionType,
          difficulty: "medium",
          points: 10,
          answers: defaultAnswers.MULTIPLE_CHOICE,
        });
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: result.error ?? "Gagal create question",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Teks Soal
          </label>
          <Textarea
            value={formData.text}
            onChange={(e) =>
              setFormData({ ...formData, text: e.target.value })
            }
            placeholder="Masukan Soal"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
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
              Level
            </label>
            <Select
              value={formData.difficulty}
              onValueChange={(val) =>
                setFormData({ ...formData, difficulty: val })
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
              className="w-full"
            />
          </div>
        </div>

        {/* MULTIPLE CHOICE */}
        {formData.type === "MULTIPLE_CHOICE" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Pilihan Jawaban
            </label>
            {formData.answers.map((answer, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={answer.text}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder={`Pilihan ${idx + 1}`}
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
                  {answer.isCorrect ? "✓ Benar" : "Set Jawaban"}
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
                className="w-full rounded-[24px] border-[#FF4B4B] text-[#FF4B4B] hover:bg-[#FF4B4B]/10 transition-all font-semibold h-10"
              >
                <Plus className="w-4 h-4 mr-2" /> Tambah Pilihan
              </Button>
            )}
          </div>
        )}

        {/* TRUE/FALSE */}
        {formData.type === "TRUE_FALSE" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Jawaban Benar
            </label>
            {formData.answers.map((answer, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input value={answer.text} disabled className="bg-muted" />
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
                  {answer.isCorrect ? "✓ Benar" : "Set Jawaban"}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* MULTIPLE SELECT */}
        {formData.type === "MULTIPLE_SELECT" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Pilihan Jawaban{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (bisa pilih lebih dari 1 benar)
              </span>
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
                  onClick={() =>
                    setFormData({
                      ...formData,
                      answers: formData.answers.map((a, i) =>
                        i === idx ? { ...a, isCorrect: !a.isCorrect } : a,
                      ),
                    })
                  }
                  className={`whitespace-nowrap rounded-[24px] transition-all font-semibold h-10 px-5 ${
                    answer.isCorrect
                      ? "bg-[#FF4B4B] hover:bg-[#FF3333] text-white border-none"
                      : "border-[#E2E8F0] hover:border-[#FF4B4B] hover:text-[#FF4B4B]"
                  }`}
                >
                  {answer.isCorrect ? "✓ Benar" : "Set Benar"}
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
                className="w-full rounded-[24px] border-[#FF4B4B] text-[#FF4B4B] hover:bg-[#FF4B4B]/10 transition-all font-semibold h-10"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Option
              </Button>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] px-6 h-12 shadow-sm transition-all font-semibold"
        >
          {loading ? "Membuat..." : "Buat Soal"}
        </Button>
      </form>
    </div>
  );
}
