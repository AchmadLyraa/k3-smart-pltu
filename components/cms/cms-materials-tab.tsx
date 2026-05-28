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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

// Helper to extract YouTube video ID from URL
const extractYouTubeId = (url: string): string | null => {
  try {
    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(ytRegex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};
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
  SquarePen,
  Trash2,
  FileVideo,
  FileImage,
  FileText,
  ClipboardList,
  Plus,
  Archive,
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
  DRAFT: "bg-[#FFB3B3] text-[#FF4B4B]",
  PUBLISHED: "bg-[#FF4B4B] text-white",
  ARCHIVED: "bg-[#FF6666] text-white",
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
  const router = useRouter();
  const { toast } = useToast();

  // Material state
  const [materials, setMaterials] = useState<MaterialItem[]>(
    initialMaterials || [],
  );

  // Sinkronisasi prop-to-state pasca router.refresh()
  useEffect(() => {
    setMaterials(initialMaterials || []);
  }, [initialMaterials]);
  const [materialPagination, setMaterialPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [materialSearch, setMaterialSearch] = useState("");
  const debouncedMaterialSearch = useDebounce(materialSearch, 300);
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
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSearch, setQuizSearch] = useState("");
  const debouncedQuizSearch = useDebounce(quizSearch, 300);
  const [showQuizForm, setShowQuizForm] = useState(false);
  // State for question selection and search
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questionSearch, setQuestionSearch] = useState("");
  const debouncedQuestionSearch = useDebounce(questionSearch, 300);
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
        const result = await fetchMaterials(
          undefined,
          undefined,
          page,
          10,
          debouncedMaterialSearch,
        );
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
    [debouncedMaterialSearch],
  );

  // Load quiz configs
  const loadQuizConfigs = useCallback(
    async (materialId: string, page: number = 1) => {
      setQuizLoading(true);
      try {
        const result = await getQuizConfigs(materialId, page, 10, debouncedQuizSearch);
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
  }, [debouncedMaterialSearch, loadMaterials]);

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
    if (!quizFormData.name.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama quiz wajib diisi",
        variant: "destructive",
      });
      return;
    }
    if (selectedQuestions.length === 0) {
      toast({
        title: "Validasi Gagal",
        description: "Pilih minimal 1 soal",
        variant: "destructive",
      });
      return;
    }

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
        toast({
          title: "Quiz Berhasil Dibuat",
          description: `Quiz "${quizFormData.name}" berhasil dibuat.`,
          variant: "success",
        });
      } else {
        toast({
          title: "Gagal Membuat Quiz",
          description: result.error ?? "Gagal buat quiz",
          variant: "destructive",
        });
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
    if (!editData.title.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Judul wajib diisi",
        variant: "destructive",
      });
      return;
    }
    if (!editData.topicId) {
      toast({
        title: "Validasi Gagal",
        description: "Topik wajib diisi",
        variant: "destructive",
      });
      return;
    }
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
        toast({
          title: "Materi Berhasil Diperbarui!",
          description: `Materi "${editData.title}" berhasil diperbarui.`,
          variant: "success",
        });
        router.refresh();
      } else {
        toast({
          title: "Gagal Memperbarui Materi",
          description: result.error || "Terjadi kesalahan pada server",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const materialToDelete = materials.find((m) => m.id === id);
    if (!confirm(`Yakin mau hapus material "${materialToDelete?.title || ""}"?`)) return;
    const result = await deleteMaterial(id);
    if (result.success) {
      toast({
        title: "Materi Berhasil Dihapus",
        description: `Materi "${materialToDelete?.title || ""}" berhasil dihapus secara permanen.`,
        variant: "success",
      });
      router.refresh();
    } else {
      toast({
        title: "Gagal Menghapus Materi",
        description: result.error || "Gagal hapus material",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async (id: string) => {
    const materialToPublish = materials.find((m) => m.id === id);
    if (!confirm(`Publish material "${materialToPublish?.title || ""}"?`)) return;
    const result = await publishMaterial(id);
    if (result.success) {
      toast({
        title: "Materi Dipublikasikan",
        description: `Materi "${materialToPublish?.title || ""}" sekarang berstatus PUBLISHED.`,
        variant: "success",
      });
      router.refresh();
    } else {
      toast({
        title: "Gagal Memublikasikan Materi",
        description: result.error || "Gagal publish material",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (id: string) => {
    const materialToArchive = materials.find((m) => m.id === id);
    if (!confirm(`Archive material "${materialToArchive?.title || ""}"?`)) return;
    const result = await archiveMaterial(id);
    if (result.success) {
      toast({
        title: "Materi Diarsipkan",
        description: `Materi "${materialToArchive?.title || ""}" sekarang berstatus ARCHIVED.`,
        variant: "success",
      });
      router.refresh();
    } else {
      toast({
        title: "Gagal Mengarsipkan Materi",
        description: result.error || "Gagal archive material",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Materials</CardTitle>
              <CardDescription>
                Total: {materialPagination.total} material{materialPagination.total !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button
              className="bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] px-6 h-10 shadow-sm transition-all font-semibold"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "+ Buat Materi"}
            </Button>
          </div>
        </CardHeader>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-5xl w-full max-h-screen overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Buat Materi</DialogTitle>
            </DialogHeader>
            <MaterialForm
              topics={topics}
              onSuccess={() => {
                setShowForm(false);
                loadMaterials(1);
              }}
            />
          </DialogContent>
        </Dialog>

        <CardContent className="space-y-4">
          <Input
            placeholder="Cari Materi..."
            value={materialSearch}
            onChange={(e) => setMaterialSearch(e.target.value)}
            className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6"
          />
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-5xl w-full max-h-screen overflow-y-auto" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Buat Materi</DialogTitle>
              </DialogHeader>
              <MaterialForm
                topics={topics}
                onSuccess={() => {
                  setShowForm(false);
                  loadMaterials(1);
                }}
              />
            </DialogContent>
          </Dialog>

          {materials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Materi Tidak Ditemukan
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {materials.map((m: MaterialItem, idx: number) => {
                  const Icon = typeIcon[m.type] ?? FileText;
                  // Determine thumbnail URL
                  const thumbnailUrl =
                    m.thumbnail ||
                    (m.type === "VIDEO" &&
                      m.mediaFiles?.find((f) => f.type === "video")?.url &&
                      (() => {
                        const id = extractYouTubeId(
                          m.mediaFiles?.find((f) => f.type === "video")!.url
                        );
                        return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
                      })());
                  return (
                    <div
                      key={m.id}
                      className="border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3 items-start flex-1 min-w-0">
                          <span className="text-sm text-muted-foreground mt-0.5 shrink-0">#
                            {(materialPagination.page - 1) * materialPagination.limit + idx + 1}
                          </span>
                          {thumbnailUrl && (
                            <img src={thumbnailUrl} alt="thumbnail" className="w-32 h-20 object-cover rounded-[12px]" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{m.title}</p>
                            {m.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.description}</p>
                            )}
                            <div className="flex gap-2 mt-1.5 text-xs text-muted-foreground">
                              <span>{m.topic?.name ?? "-"}</span>
                              <span>•</span>
                              <span>{Math.floor(m.duration / 60)}m {m.duration % 60}s</span>
                              <span>•</span>
                              <span>{m.mediaFiles?.length ?? 0} files</span>
                              <span>•</span>
                              <span>{m.quizConfigs?.length ?? 0} quiz</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[m.status]}`}>{m.status}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{typeLabel[m.type] ?? m.type}</span>
                          <div className="flex gap-1 mt-1 flex-wrap justify-end">
                            {m.status !== "PUBLISHED" && (
                              <button className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Publish" onClick={() => handlePublish(m.id)}>
                                <CheckCircle2 className="w-[18px] h-[18px]" strokeWidth={2} />
                              </button>
                            )}
                            {m.status === "PUBLISHED" && (
                              <button className="p-1.5 text-yellow-500 hover:bg-yellow-100 rounded transition-colors" title="Archive" onClick={() => handleArchive(m.id)}>
                                <Archive className="w-[18px] h-[18px]" strokeWidth={2} />
                              </button>
                            )}
                            <button className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Quiz" onClick={() => openQuizDialog(m)}>
                              <ClipboardList className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit" onClick={() => openEdit(m)}>
                              <SquarePen className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                            <button className="p-1.5 text-[#E74C3C] hover:bg-red-50 rounded transition-colors" title="Delete" onClick={() => handleDelete(m.id)}>
                              <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
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
      {/* Quiz Dialog */}
      <Dialog
        open={!!quizMaterial}
        onOpenChange={(open) => !open && setQuizMaterial(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] p-6" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Manage Quiz — {quizMaterial?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* =================================== Existing quizzes ======================================= */}
            {quizConfigs.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Quiz yang sudah ada:</p>
                <div className="space-y-2">
                  {quizConfigs.map((quiz: any) => (
                    <div
                      key={quiz.id}
                      className="border border-slate-100 rounded-[16px] p-4 flex justify-between items-center bg-white shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">{quiz.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
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
                  <p className="text-xs text-slate-500">
                    Page {quizPagination.page} of {quizPagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-[#E2E8F0]"
                      onClick={() =>
                        quizMaterial &&
                        loadQuizConfigs(
                          quizMaterial.id,
                          quizPagination.page - 1,
                        )
                      }
                      disabled={quizPagination.page === 1 || quizLoading}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-[#E2E8F0]"
                      onClick={() =>
                        quizMaterial &&
                        loadQuizConfigs(
                          quizMaterial.id,
                          quizPagination.page + 1,
                        )
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
              <div className="text-center py-6 text-sm text-slate-500 border-2 border-dashed rounded-[16px]">
                Belum ada quiz config.
              </div>
            )}

            {/* Toggle form */}
            {!showQuizForm ? (
              <Button onClick={() => setShowQuizForm(true)} className="w-full bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold">
                <Plus className="w-4 h-4 mr-2" /> Tambah Quiz Config
              </Button>
            ) : (
              <div className="border border-slate-100 rounded-[16px] p-5 space-y-4 bg-white shadow-sm">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-slate-800">Quiz Baru</p>
                  <button
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => setShowQuizForm(false)}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Nama Quiz</label>
                  <Input
                    value={quizFormData.name}
                    onChange={(e) =>
                      setQuizFormData({ ...quizFormData, name: e.target.value })
                    }
                    placeholder="Nama quiz"
                    className="w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Jumlah Soal</label>
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
                      className="w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Nilai Lulus (%)</label>
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
                      className="w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Waktu (menit)</label>
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
                      className="w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Deadline (opsional)</label>
                    <Input
                      type="datetime-local"
                      value={quizFormData.deadline}
                      onChange={(e) =>
                        setQuizFormData({
                          ...quizFormData,
                          deadline: e.target.value,
                        })
                      }
                      className="w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1 ml-1">
                      Lewat deadline: -5% per hari, maks -40%
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
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
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
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
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
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
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Pilih Soal ({selectedQuestions.length} dipilih)
                  </p>

                  {/* Search bar untuk soal */}
                  <Input
                    placeholder="Search soal..."
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    className="w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm mb-2"
                  />

                  {questions.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Belum ada soal di bank soal.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-100 rounded-[16px] p-3">
                      {questions
                        .filter((q: any) =>
                          q.text
                            .toLowerCase()
                            .includes(debouncedQuestionSearch.toLowerCase()),
                        )
                        .map((q: QuestionItem) => (
                          <label
                            key={q.id}
                            className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
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
                              <p className="text-sm text-slate-800">{q.text}</p>
                              <div className="flex gap-2 mt-0.5">
                                <span className="text-xs text-slate-500">{q.type}</span>
                                <span
                                  className={`text-xs px-1.5 rounded-full ${difficultyColor[q.difficulty] ?? ""}`}
                                >
                                  {q.difficulty}
                                </span>
                                <span className="text-xs text-slate-500">{q.points} pts</span>
                              </div>
                            </div>
                          </label>
                        ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-[24px] h-10 border-[#E2E8F0] hover:border-gray-300 transition-all font-semibold"
                    onClick={() => setShowQuizForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateQuiz}
                    disabled={savingQuiz}
                    className="flex-1 bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold"
                  >
                    {savingQuiz ? "Menyimpan..." : "Simpan Quiz Config"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ====================== Edit Dialog =============================*/}
      <Dialog
        open={!!editMaterial}
        onOpenChange={(open) => !open && setEditMaterial(null)}
      >
        <DialogContent className="max-w-5xl w-full max-h-screen overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
          </DialogHeader>

          {editData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Topik
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
                <label className="block text-sm font-medium mb-2">Judul</label>
                <Input
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Deskripsi
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
                  <p className="text-sm font-medium">Pengaturan Video</p>
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
                      Durasi (detik)
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
                  <p className="text-sm font-medium">Pengaturan Infografik</p>
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
                  <p className="text-sm font-medium">Pengaturan Artikel</p>
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
                  className="flex-1 rounded-[20px]"
                  onClick={() => setEditMaterial(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[20px] px-6 h-10 shadow-sm transition-all font-semibold flex-1"
                  onClick={handleSave}
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
