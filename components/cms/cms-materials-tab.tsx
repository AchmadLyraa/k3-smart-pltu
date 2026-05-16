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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Trash2,
  FileVideo,
  FileImage,
  FileText,
  ClipboardList,
  Plus,
  X,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MaterialForm from "./material-form";
import {
  updateMaterial,
  deleteMaterial,
  publishMaterial,
  archiveMaterial,
  addMediaFile,
  removeMediaFile,
  getMaterials as fetchMaterials,
} from "@/app/actions/content";
import {
  createQuizConfig,
  getQuizByMaterial,
  getQuizConfigs,
  deleteQuestion,
} from "@/app/actions/quiz";

const typeIcon = {
  VIDEO: FileVideo,
  INFOGRAPHIC: FileImage,
  ARTICLE: FileText,
};
const typeLabel = {
  VIDEO: "Video",
  INFOGRAPHIC: "Infographic",
  ARTICLE: "Article",
};
const statusColor = {
  DRAFT: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};
const difficultyColor = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

type MaterialType = keyof typeof typeIcon;
type MaterialStatus = keyof typeof statusColor;
type DifficultyLevel = keyof typeof difficultyColor;

type TopicItem = {
  id: string;
  name: string;
};

type MaterialItem = {
  id: string;
  title: string;
  description?: string | null;
  type: MaterialType;
  status: MaterialStatus;
  duration: number;
  topicId?: string;
  thumbnail?: string | null;
  topic?: {
    name: string;
  } | null;
  mediaFiles?: {
    id: string;
    type: string;
    url: string;
  }[];
  quizConfigs?: {
    id: string;
  }[];
};

type QuestionItem = {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "MULTIPLE_SELECT" | "TRUE_FALSE";
  difficulty: DifficultyLevel;
  points: number;
  answerOptions?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
};

type QuizConfigItem = {
  id: string;
  name: string;
  questionCount?: number;
  timeLimit: number;
  passingScore: number;
  deadline?: string | Date | null;
};

type CMSMaterialsTabProps = {
  topics: TopicItem[];
  materials: MaterialItem[];
  questions: QuestionItem[];
};

export default function CMSMaterialsTab({
  topics,
  materials: initialMaterials,
  questions,
}: CMSMaterialsTabProps) {
  // Material state
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials || []);
  const [materialPagination, setMaterialPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialLoading, setMaterialLoading] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editMaterial, setEditMaterial] = useState<MaterialItem | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Quiz dialog state
  const [quizMaterial, setQuizMaterial] = useState<MaterialItem | null>(null);
  const [quizConfigs, setQuizConfigs] = useState<QuizConfigItem[]>([]);
  const [quizPagination, setQuizPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [quizSearch, setQuizSearch] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questionSearch, setQuestionSearch] = useState("");
  const [quizFormData, setQuizFormData] = useState({
    name: "",
    description: "",
    totalQuestions: 5,
    passingScore: 70,
    timeLimit: 600,
    allowRetake: true,
    maxRetries: 3,
    showCorrectAns: true,
    shuffleQuestions: true,
    deadline: "",
  });
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Load materials
  const loadMaterials = useCallback(
    async (page: number = 1) => {
      setMaterialLoading(true);
      try {
        const result = await fetchMaterials(undefined, undefined, page, 10, materialSearch);
        if (result.success) {
          setMaterials((result.data as MaterialItem[]) ?? []);
          setMaterialPagination(
            result.pagination ?? { page: 1, limit: 10, total: 0, pages: 0 },
          );
        }
      } catch (error) {
        console.error("Failed to load materials:", error);
      } finally {
        setMaterialLoading(false);
      }
    },
    [materialSearch],
  );

  // Load quiz configs
  const loadQuizConfigs = useCallback(
    async (materialId: string, page: number = 1) => {
      setQuizLoading(true);
      try {
        const result = await getQuizConfigs(materialId, page, 10, quizSearch);
        if (result.success) {
          setQuizConfigs((result.data as QuizConfigItem[]) ?? []);
          setQuizPagination(
            result.pagination ?? { page: 1, limit: 10, total: 0, pages: 0 },
          );
        }
      } catch (error) {
        console.error("Failed to load quiz configs:", error);
      } finally {
        setQuizLoading(false);
      }
    },
    [quizSearch],
  );

  useEffect(() => {
    loadMaterials(1);
  }, [materialSearch, loadMaterials]);

  const openQuizDialog = async (m: MaterialItem) => {
    setQuizMaterial(m);
    setShowQuizForm(false);
    setSelectedQuestions([]);
    setQuestionSearch("");
    setQuizSearch("");
    setQuizPagination({ page: 1, limit: 10, total: 0, pages: 0 });
    await loadQuizConfigs(m.id, 1);
  };

  const handleCreateQuiz = async () => {
    if (!quizMaterial) return;
    if (!quizFormData.name.trim()) return alert("Nama quiz wajib diisi");
    if (selectedQuestions.length === 0) return alert("Pilih minimal 1 soal");

    setSavingQuiz(true);
    try {
      const result = await createQuizConfig({
        materialId: quizMaterial.id,
        ...quizFormData,
        deadline: quizFormData.deadline
          ? new Date(quizFormData.deadline)
          : undefined,
        totalQuestions: Math.min(
          quizFormData.totalQuestions,
          selectedQuestions.length,
        ),
        questionIds: selectedQuestions,
      });
      if (result.success) {
        await loadQuizConfigs(quizMaterial.id, 1);
        setShowQuizForm(false);
        setSelectedQuestions([]);
        setQuizFormData({
          name: "",
          description: "",
          totalQuestions: 5,
          passingScore: 70,
          timeLimit: 600,
          allowRetake: true,
          maxRetries: 3,
          showCorrectAns: true,
          shuffleQuestions: true,
          deadline: "",
        });
      } else {
        alert(result.error ?? "Gagal buat quiz");
      }
    } finally {
      setSavingQuiz(false);
    }
  };

  const openEdit = (m: any) => {
    setEditMaterial(m);
    setEditData({
      title: m.title,
      description: m.description ?? "",
      type: m.type,
      topicId: m.topicId,
      duration: m.duration,
      videoUrl: m.mediaFiles?.find((f: any) => f.type === "video")?.url ?? "",
      imageUrl: m.thumbnail ?? "",
      articleContent:
        m.mediaFiles?.find((f: any) => f.type === "article")?.url ?? "",
    });
  };

  const handleSave = async () => {
    if (!editMaterial) return;
    if (!editData.title.trim()) return alert("Title wajib diisi");
    if (!editData.topicId) return alert("Topic wajib diisi");
    setSaving(true);
    try {
      const result = await updateMaterial(editMaterial.id, {
        title: editData.title,
        description: editData.description,
        type: editData.type,
        topicId: editData.topicId,
        duration: editData.duration,
        thumbnail:
          editData.type === "INFOGRAPHIC" ? editData.imageUrl : undefined,
      });

      if (result.success) {
        const existingFiles = editMaterial.mediaFiles ?? [];
        for (const f of existingFiles) await removeMediaFile(f.id);

        if (editData.type === "VIDEO" && editData.videoUrl?.trim()) {
          await addMediaFile({
            materialId: editMaterial.id,
            url: editData.videoUrl,
            type: "video",
            fileName: editData.title,
            duration: editData.duration,
          });
        }
        if (editData.type === "INFOGRAPHIC" && editData.imageUrl?.trim()) {
          await addMediaFile({
            materialId: editMaterial.id,
            url: editData.imageUrl,
            type: "image",
            fileName: editData.title,
          });
        }
        if (editData.type === "ARTICLE" && editData.articleContent?.trim()) {
          await addMediaFile({
            materialId: editMaterial.id,
            url: editData.articleContent,
            type: "article",
            fileName: editData.title,
          });
        }

        setEditMaterial(null);
        window.location.reload();
      } else {
        alert(result.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin mau hapus material ini?")) return;
    const result = await deleteMaterial(id);
    if (result.success) window.location.reload();
    else alert("Gagal hapus material");
  };

  const handlePublish = async (id: string) => {
    if (!confirm("Publish material ini?")) return;
    const result = await publishMaterial(id);
    if (result.success) window.location.reload();
    else alert("Gagal publish material");
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archive material ini?")) return;
    const result = await archiveMaterial(id);
    if (result.success) window.location.reload();
    else alert("Gagal archive material");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Materials</CardTitle>
              <CardDescription>
                Total: {materialPagination.total} material
                {materialPagination.total !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "+ Create Material"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {showForm && (
            <div className="mb-6">
              <MaterialForm
                topics={topics}
                onSuccess={() => {
                  setShowForm(false);
                  loadMaterials(1);
                }}
              />
            </div>
          )}

          {/* Search Bar */}
          <Input
            placeholder="Search materials..."
            value={materialSearch}
            onChange={(e) => setMaterialSearch(e.target.value)}
            className="flex-1"
          />

          {materials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No materials found.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {materials.map((m: MaterialItem, idx: number) => {
                  const Icon = typeIcon[m.type] ?? FileText;
                  return (
                    <div
                      key={m.id}
                      className="border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3 items-start flex-1 min-w-0">
                          <span className="text-sm text-muted-foreground mt-0.5 shrink-0">
                            #{(materialPagination.page - 1) * materialPagination.limit + idx + 1}
                          </span>
                          <Icon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{m.title}</p>
                            {m.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {m.description}
                              </p>
                            )}
                            <div className="flex gap-2 mt-1.5 text-xs text-muted-foreground">
                              <span>{m.topic?.name ?? "-"}</span>
                              <span>•</span>
                              <span>
                                {Math.floor(m.duration / 60)}m {m.duration % 60}s
                              </span>
                              <span>•</span>
                              <span>{m.mediaFiles?.length ?? 0} files</span>
                              <span>•</span>
                              <span>{m.quizConfigs?.length ?? 0} quiz</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 items-end shrink-0">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${statusColor[m.status]}`}
                          >
                            {m.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {typeLabel[m.type] ?? m.type}
                          </span>
                          <div className="flex gap-1 mt-1 flex-wrap justify-end">
                            {m.status !== "PUBLISHED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handlePublish(m.id)}
                              >
                                Publish
                              </Button>
                            )}
                            {m.status === "PUBLISHED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-gray-600 hover:bg-gray-50"
                                onClick={() => handleArchive(m.id)}
                              >
                                Archive
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => openQuizDialog(m)}
                            >
                              <ClipboardList className="w-3 h-3 mr-1" /> Quiz
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() => openEdit(m)}
                            >
                              <Pencil className="w-3 h-3 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(m.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {materialPagination.page} of {materialPagination.pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadMaterials(materialPagination.page - 1)}
                    disabled={materialPagination.page === 1 || materialLoading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadMaterials(materialPagination.page + 1)}
                    disabled={
                      materialPagination.page >= materialPagination.pages ||
                      materialLoading
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quiz Dialog */}
      <Dialog
        open={!!quizMaterial}
        onOpenChange={(open) => !open && setQuizMaterial(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Quiz — {quizMaterial?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Existing quizzes */}
            {quizConfigs.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Quiz yang sudah ada:</p>
                <div className="space-y-2">
                  {quizConfigs.map((quiz: any) => (
                    <div
                      key={quiz.id}
                      className="border rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-medium">{quiz.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {quiz.questionCount} soal •{" "}
                          {Math.floor(quiz.timeLimit / 60)} menit • Lulus{" "}
                          {quiz.passingScore}%
                          {quiz.deadline && (
                            <span
                              className={`ml-1 ${new Date() > new Date(quiz.deadline) ? "text-red-500" : "text-amber-600"}`}
                            >
                              • Deadline:{" "}
                              {new Date(quiz.deadline).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quiz Pagination */}
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-muted-foreground">
                    Page {quizPagination.page} of {quizPagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        quizMaterial &&
                        loadQuizConfigs(quizMaterial.id, quizPagination.page - 1)
                      }
                      disabled={quizPagination.page === 1 || quizLoading}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        quizMaterial &&
                        loadQuizConfigs(quizMaterial.id, quizPagination.page + 1)
                      }
                      disabled={
                        quizPagination.page >= quizPagination.pages ||
                        quizLoading
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {quizConfigs.length === 0 && !quizLoading && (
              <p className="text-sm text-muted-foreground">Belum ada quiz config.</p>
            )}

            {/* Toggle form */}
            {!showQuizForm ? (
              <Button onClick={() => setShowQuizForm(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Tambah Quiz Config
              </Button>
            ) : (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm">Quiz Baru</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuizForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Quiz
                  </label>
                  <Input
                    value={quizFormData.name}
                    onChange={(e) =>
                      setQuizFormData({ ...quizFormData, name: e.target.value })
                    }
                    placeholder="Nama quiz"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Jumlah Soal
                    </label>
                    <Input
                      type="number"
                      value={quizFormData.totalQuestions}
                      onChange={(e) =>
                        setQuizFormData({
                          ...quizFormData,
                          totalQuestions: parseInt(e.target.value) || 5,
                        })
                      }
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nilai Lulus (%)
                    </label>
                    <Input
                      type="number"
                      value={quizFormData.passingScore}
                      onChange={(e) =>
                        setQuizFormData({
                          ...quizFormData,
                          passingScore: parseInt(e.target.value) || 70,
                        })
                      }
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Waktu (menit)
                    </label>
                    <Input
                      type="number"
                      value={Math.floor(quizFormData.timeLimit / 60)}
                      onChange={(e) =>
                        setQuizFormData({
                          ...quizFormData,
                          timeLimit: (parseInt(e.target.value) || 10) * 60,
                        })
                      }
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Deadline (opsional)
                    </label>
                    <Input
                      type="datetime-local"
                      value={quizFormData.deadline}
                      onChange={(e) =>
                        setQuizFormData({
                          ...quizFormData,
                          deadline: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lewat deadline: -5% per hari, maks -40%
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={quizFormData.allowRetake}
                      onCheckedChange={(c) =>
                        setQuizFormData({
                          ...quizFormData,
                          allowRetake: c as boolean,
                        })
                      }
                    />
                    Allow Retake
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={quizFormData.showCorrectAns}
                      onCheckedChange={(c) =>
                        setQuizFormData({
                          ...quizFormData,
                          showCorrectAns: c as boolean,
                        })
                      }
                    />
                    Show Answers
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={quizFormData.shuffleQuestions}
                      onCheckedChange={(c) =>
                        setQuizFormData({
                          ...quizFormData,
                          shuffleQuestions: c as boolean,
                        })
                      }
                    />
                    Shuffle
                  </label>
                </div>

                {/* Select questions */}
                <div>
                  <p className="text-sm font-medium mb-2">
                    Pilih Soal ({selectedQuestions.length} dipilih)
                  </p>
                  
                  {/* Search bar untuk soal */}
                  <Input
                    placeholder="Search soal..."
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    className="mb-2"
                  />

                  {questions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Belum ada soal di bank soal.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                      {questions
                        .filter((q: any) =>
                          q.text
                            .toLowerCase()
                            .includes(questionSearch.toLowerCase())
                        )
                        .map((q: QuestionItem) => (
                          <label
                            key={q.id}
                            className="flex items-start gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedQuestions.includes(q.id)}
                              onCheckedChange={(checked) => {
                                setSelectedQuestions((prev) =>
                                  checked
                                    ? [...prev, q.id]
                                    : prev.filter((id) => id !== q.id),
                                );
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{q.text}</p>
                              <div className="flex gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {q.type}
                                </span>
                                <span
                                  className={`text-xs px-1.5 rounded-full ${difficultyColor[q.difficulty] ?? ""}`}
                                >
                                  {q.difficulty}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {q.points} pts
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={handleCreateQuiz}
                  disabled={savingQuiz}
                >
                  {savingQuiz ? "Menyimpan..." : "Simpan Quiz Config"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editMaterial}
        onOpenChange={(open) => !open && setEditMaterial(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
          </DialogHeader>

          {editData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Topic
                  </label>
                  <Select
                    value={editData.topicId}
                    onValueChange={(val) =>
                      setEditData({ ...editData, topicId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select
                    value={editData.type}
                    onValueChange={(val) =>
                      setEditData({
                        ...editData,
                        type: val,
                        videoUrl: "",
                        imageUrl: "",
                        articleContent: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="INFOGRAPHIC">Infographic</SelectItem>
                      <SelectItem value="ARTICLE">Article</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              {editData.type === "VIDEO" && (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm font-medium">Video Settings</p>
                  <div>
                    <label className="block text-sm mb-1">URL Video</label>
                    <Input
                      value={editData.videoUrl}
                      onChange={(e) =>
                        setEditData({ ...editData, videoUrl: e.target.value })
                      }
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      Duration (seconds)
                    </label>
                    <Input
                      type="number"
                      value={editData.duration}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
                  {editData.videoUrl && (
                    <div className="aspect-video rounded overflow-hidden bg-black">
                      <iframe
                        src={editData.videoUrl.replace("watch?v=", "embed/")}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}

              {editData.type === "INFOGRAPHIC" && (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm font-medium">Infographic Settings</p>
                  <Input
                    value={editData.imageUrl}
                    onChange={(e) =>
                      setEditData({ ...editData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.png"
                  />
                  {editData.imageUrl && (
                    <img
                      src={editData.imageUrl}
                      alt="preview"
                      className="max-h-64 rounded border object-contain w-full"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </div>
              )}

              {editData.type === "ARTICLE" && (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm font-medium">Article Settings</p>
                  <Textarea
                    value={editData.articleContent}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        articleContent: e.target.value,
                      })
                    }
                    placeholder="Tulis konten artikel..."
                    rows={8}
                  />
                  <div>
                    <label className="block text-sm mb-1">
                      Estimasi Baca (menit)
                    </label>
                    <Input
                      type="number"
                      value={Math.round(editData.duration / 60)}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          duration: (parseInt(e.target.value) || 0) * 60,
                        })
                      }
                      min="0"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditMaterial(null)}
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
