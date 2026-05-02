"use client";

import { useState } from "react";
import { createQuizConfig, getQuestions } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";

export default function QuizConfigForm({
  materialId,
  onSuccess,
}: {
  materialId: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    totalQuestions: 5,
    passingScore: 70,
    timeLimit: 600,
    allowRetake: true,
    maxRetries: 3,
    showCorrectAns: true,
    shuffleQuestions: true,
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const result = await getQuestions(1, 100);
    if (result.success) {
      setQuestions(result.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createQuizConfig({
        materialId,
        ...formData,
        questionIds: selectedQuestions,
      });

      if (result.success) {
        setFormData({
          name: "",
          description: "",
          totalQuestions: 5,
          passingScore: 70,
          timeLimit: 600,
          allowRetake: true,
          maxRetries: 3,
          showCorrectAns: true,
          shuffleQuestions: true,
        });
        setSelectedQuestions([]);
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId],
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Quiz</CardTitle>
        <CardDescription>
          Set up quiz rules and select questions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Quiz Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Quiz title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Quiz description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Questions
                </label>
                <Input
                  type="number"
                  value={formData.totalQuestions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalQuestions: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max={selectedQuestions.length}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Passing Score (%)
                </label>
                <Input
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passingScore: parseInt(e.target.value),
                    })
                  }
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Time Limit (seconds)
                </label>
                <Input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeLimit: parseInt(e.target.value),
                    })
                  }
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Retries
                </label>
                <Input
                  type="number"
                  value={formData.maxRetries}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxRetries: parseInt(e.target.value),
                    })
                  }
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.allowRetake}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      allowRetake: checked as boolean,
                    })
                  }
                />
                <span className="text-sm font-medium">Allow Retake</span>
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.showCorrectAns}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      showCorrectAns: checked as boolean,
                    })
                  }
                />
                <span className="text-sm font-medium">
                  Show Correct Answers
                </span>
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.shuffleQuestions}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      shuffleQuestions: checked as boolean,
                    })
                  }
                />
                <span className="text-sm font-medium">Shuffle Questions</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Select Questions</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {questions.map((question) => (
                <label
                  key={question.id}
                  className="flex items-start gap-2 p-2 hover:bg-muted rounded"
                >
                  <Checkbox
                    checked={selectedQuestions.includes(question.id)}
                    onCheckedChange={() => toggleQuestion(question.id)}
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{question.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {question.difficulty} • {question.type}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || selectedQuestions.length === 0}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Quiz Config"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
