"use client";

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Calendar, Clock, Coins, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createQuizCampaign,
  updateQuizCampaign,
  deleteQuizCampaign,
  getQuizCampaigns,
  getQuizCampaign,
} from "@/app/actions/quiz-campaign";
import { getQuestions } from "@/app/actions/quiz";

interface QuizCampaignTabProps {
  periods: any[];
}

export default function CMSQuizCampaignTab({ periods }: QuizCampaignTabProps) {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    periodId: "",
    basePoints: 500,
    deadline: "",
    timeLimit: 1800,
    totalQuestions: 20,
    passingScore: 70,
    allowRetake: true,
    maxRetries: 1,
    shuffleQuestions: true,
    showCorrectAns: true,
    status: "DRAFT" as string,
    questionIds: [] as string[],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [campResult, qResult] = await Promise.all([
      getQuizCampaigns(),
      getQuestions(1, 1000),
    ]);
    if (campResult.success && campResult.data) setCampaigns(campResult.data);
    if (qResult.success && qResult.data) setAllQuestions(qResult.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: "", description: "", periodId: "", basePoints: 500,
      deadline: "", timeLimit: 1800, totalQuestions: 20, passingScore: 70,
      allowRetake: true, maxRetries: 1, shuffleQuestions: true,
      showCorrectAns: true, status: "DRAFT", questionIds: [],
    });
    setDialogOpen(true);
  };

  const openEdit = async (id: string) => {
    const result = await getQuizCampaign(id);
    if (!result.success || !result.data) return;
    const c = result.data;
    setEditingId(id);
    setForm({
      title: c.title,
      description: c.description ?? "",
      periodId: c.periodId ?? "",
      basePoints: c.basePoints,
      deadline: c.deadline ? new Date(c.deadline).toISOString().slice(0, 16) : "",
      timeLimit: c.timeLimit,
      totalQuestions: c.totalQuestions,
      passingScore: c.passingScore,
      allowRetake: c.allowRetake,
      maxRetries: c.maxRetries,
      shuffleQuestions: c.shuffleQuestions,
      showCorrectAns: c.showCorrectAns,
      status: c.status,
      questionIds: c.questions?.map((q: any) => q.question.id) ?? [],
    });
    setDialogOpen(true);
  };

  const toggleQuestion = (qId: string) => {
    setForm((prev) => ({
      ...prev,
      questionIds: prev.questionIds.includes(qId)
        ? prev.questionIds.filter((id) => id !== qId)
        : [...prev.questionIds, qId],
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Error", description: "Judul wajib diisi", variant: "destructive" });
      return;
    }
    if (form.questionIds.length === 0) {
      toast({ title: "Error", description: "Pilih minimal 1 soal", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      description: form.description || undefined,
      periodId: form.periodId || undefined,
      deadline: form.deadline ? new Date(form.deadline) : undefined,
    };

    const result = editingId
      ? await updateQuizCampaign(editingId, payload)
      : await createQuizCampaign(payload as any);

    setSaving(false);

    if (result.success) {
      toast({ title: "Berhasil", description: editingId ? "Campaign diupdate" : "Campaign dibuat" });
      setDialogOpen(false);
      fetchData();
    } else {
      toast({ title: "Gagal", description: result.error, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus campaign ini?")) return;
    const result = await deleteQuizCampaign(id);
    if (result.success) {
      toast({ title: "Berhasil", description: "Campaign dihapus" });
      fetchData();
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "PUBLISHED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "DRAFT": return "bg-amber-100 text-amber-700 border-amber-200";
      case "ARCHIVED": return "bg-zinc-100 text-zinc-500 border-zinc-200";
      default: return "";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-sm text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          Memuat campaign...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Quiz Campaign</h2>
          <p className="text-xs text-zinc-500 font-medium">Kelola quiz khusus bulanan</p>
        </div>
        <Button onClick={openCreate} className="rounded-2xl bg-[#FF4B4B] hover:bg-red-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> Buat Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center text-sm text-zinc-400 font-medium">
            Belum ada quiz campaign. Klik "Buat Campaign" untuk memulai.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <Card key={c.id} className="rounded-2xl border-zinc-200/60">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-black">{c.title}</CardTitle>
                    {c.description && (
                      <CardDescription className="text-xs">{c.description}</CardDescription>
                    )}
                  </div>
                  <Badge className={cn("rounded-full text-[10px] font-bold", statusColor(c.status))}>
                    {c.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-[11px] font-medium text-zinc-500 mb-3">
                  <span className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-full">
                    <Coins className="w-3 h-3" /> {c.basePoints} poin
                  </span>
                  <span className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {c.deadline ? new Date(c.deadline).toLocaleDateString("id-ID") : "No deadline"}
                  </span>
                  <span className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" /> {Math.floor(c.timeLimit / 60)} menit
                  </span>
                  <span className="bg-zinc-50 px-2 py-1 rounded-full">
                    {c._count?.questions ?? 0} soal
                  </span>
                  <span className="bg-zinc-50 px-2 py-1 rounded-full">
                    {c._count?.sessions ?? 0} sesi
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(c.id)}
                    className="rounded-xl text-xs h-8">
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)}
                    className="rounded-xl text-xs h-8 text-red-500 hover:text-red-600 border-red-200">
                    <Trash2 className="w-3 h-3 mr-1" /> Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">
              {editingId ? "Edit Campaign" : "Buat Campaign Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Title */}
            <div>
              <Label className="text-xs font-bold">Judul Campaign</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-2xl h-10 mt-1" placeholder="Quiz Bulanan Juni 2026" />
            </div>

            {/* Description */}
            <div>
              <Label className="text-xs font-bold">Deskripsi</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-2xl h-10 mt-1" placeholder="Deskripsi campaign" />
            </div>

            {/* Period & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold">Periode Akademik</Label>
                <Select value={form.periodId} onValueChange={(v) => setForm({ ...form, periodId: v })}>
                  <SelectTrigger className="rounded-2xl h-10 mt-1">
                    <SelectValue placeholder="Pilih periode" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-bold">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-2xl h-10 mt-1">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Points & Passing */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-bold">Base Points</Label>
                <Input type="number" value={form.basePoints}
                  onChange={(e) => setForm({ ...form, basePoints: Number(e.target.value) })}
                  className="rounded-2xl h-10 mt-1" />
              </div>
              <div>
                <Label className="text-xs font-bold">Time Limit (detik)</Label>
                <Input type="number" value={form.timeLimit}
                  onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })}
                  className="rounded-2xl h-10 mt-1" />
              </div>
              <div>
                <Label className="text-xs font-bold">Passing Score (%)</Label>
                <Input type="number" value={form.passingScore}
                  onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })}
                  className="rounded-2xl h-10 mt-1" />
              </div>
            </div>

            {/* Total Questions & Deadline */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold">Jumlah Soal Tampil</Label>
                <Input type="number" value={form.totalQuestions}
                  onChange={(e) => setForm({ ...form, totalQuestions: Number(e.target.value) })}
                  className="rounded-2xl h-10 mt-1" />
              </div>
              <div>
                <Label className="text-xs font-bold">Deadline</Label>
                <Input type="datetime-local" value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="rounded-2xl h-10 mt-1" />
              </div>
            </div>

            {/* Max Retries */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold">Max Retries</Label>
                <Input type="number" value={form.maxRetries}
                  onChange={(e) => setForm({ ...form, maxRetries: Number(e.target.value) })}
                  className="rounded-2xl h-10 mt-1" disabled={!form.allowRetake} />
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Switch checked={form.allowRetake}
                    onCheckedChange={(v) => {
                      setForm({ ...form, allowRetake: v, maxRetries: v ? 3 : 1 });
                    }} />
                  <span className="text-xs font-medium">Allow Retake</span>
                </div>
              </div>
            </div>

            {/* Switches */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={form.shuffleQuestions}
                  onCheckedChange={(v) => setForm({ ...form, shuffleQuestions: v })} />
                <span className="text-xs font-medium">Shuffle</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.showCorrectAns}
                  onCheckedChange={(v) => setForm({ ...form, showCorrectAns: v })} />
                <span className="text-xs font-medium">Show Answers</span>
              </div>
            </div>

            {/* Question Selection */}
            <div>
              <Label className="text-xs font-bold">
                Pilih Soal ({form.questionIds.length} dipilih)
              </Label>
              <div className="max-h-48 overflow-y-auto mt-2 space-y-1 border rounded-2xl p-2">
                {allQuestions.length === 0 ? (
                  <p className="text-xs text-zinc-400 p-3 text-center">
                    Belum ada soal di bank soal. Buat soal dulu di tab Questions.
                  </p>
                ) : (
                  allQuestions.map((q: any) => (
                    <button
                      key={q.id}
                      onClick={() => toggleQuestion(q.id)}
                      className={cn(
                        "w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all",
                        form.questionIds.includes(q.id)
                          ? "bg-[#FF4B4B]/10 text-[#FF4B4B] font-bold"
                          : "hover:bg-zinc-50 text-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                        form.questionIds.includes(q.id)
                          ? "border-[#FF4B4B] bg-[#FF4B4B]"
                          : "border-zinc-300"
                      )}>
                        {form.questionIds.includes(q.id) && (
                          <span className="text-white text-[8px] font-black">✓</span>
                        )}
                      </div>
                      <span className="truncate">{q.text}</span>
                      <span className="text-[10px] text-zinc-400 ml-auto shrink-0">{q.type}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}
                className="flex-1 rounded-2xl h-10">
                Batal
              </Button>
              <Button onClick={handleSave} disabled={saving}
                className="flex-1 rounded-2xl h-10 bg-[#FF4B4B] hover:bg-red-600 text-white">
                {saving ? "Menyimpan..." : editingId ? "Update" : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}