"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  ChevronDown,
  ChevronRight,
  SquarePen,
  Trash2,
  Plus,
  FileVideo,
  FileImage,
  FileText,
  CheckCircle,
  X,
} from "lucide-react";
import {
  createAcademicPeriod,
  updateAcademicPeriod,
  deleteAcademicPeriod,
  setActivePeriod,
  assignMaterialToPeriod,
} from "@/app/actions/academic-period";
import {
  publishMaterial,
  archiveMaterial,
  deleteMaterial,
} from "@/app/actions/content";
import SemesterResetDialog from "@/components/admin/semester-reset-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const typeIcon = {
  VIDEO: FileVideo,
  INFOGRAPHIC: FileImage,
  ARTICLE: FileText,
};
const statusColor = {
  DRAFT: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

export default function CmsAcademicPeriodTab({
  periods: initialPeriods = [],
  unassignedMaterials = [],
}: {
  periods?: any[];
  unassignedMaterials?: any[];
}) {
  const [periods, setPeriods] = useState(initialPeriods);
  const [unassigned, setUnassigned] = useState(unassignedMaterials);
  const [expandedPeriods, setExpandedPeriods] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editPeriod, setEditPeriod] = useState<any>(null);
  const [showAssignDialog, setShowAssignDialog] = useState<string | null>(null); // periodId
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Sinkronisasi prop-to-state agar UI terupdate otomatis pasca router.refresh()
  useEffect(() => {
    setPeriods(initialPeriods);
  }, [initialPeriods]);

  useEffect(() => {
    setUnassigned(unassignedMaterials);
  }, [unassignedMaterials]);

  const toggleExpand = (id: string) => {
    setExpandedPeriods((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama period wajib diisi",
        variant: "destructive",
      });
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Validasi Gagal",
        description: "Tanggal wajib diisi",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const result = await createAcademicPeriod({
      name: formData.name,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });
    setSaving(false);
    if (result.success) {
      toast({
        title: "Berhasil!",
        description: `Academic Period "${formData.name}" berhasil dibuat.`,
        variant: "success",
      });
      setShowCreateForm(false);
      setFormData({ name: "", startDate: "", endDate: "" });
      router.refresh();
    } else {
      toast({
        title: "Gagal Membuat Period",
        description: result.error || "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editPeriod) return;
    if (!editPeriod.name.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama period wajib diisi",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const result = await updateAcademicPeriod(editPeriod.id, {
      name: editPeriod.name,
      startDate: new Date(editPeriod.startDate),
      endDate: new Date(editPeriod.endDate),
    });
    setSaving(false);
    if (result.success) {
      toast({
        title: "Berhasil Diperbarui!",
        description: `Academic Period "${editPeriod.name}" berhasil diperbarui.`,
        variant: "success",
      });
      setEditPeriod(null);
      router.refresh();
    } else {
      toast({
        title: "Gagal Memperbarui",
        description: result.error || "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const periodToDelete = periods.find((p: any) => p.id === id);
    if (
      !confirm(`Hapus period "${periodToDelete?.name || ""}"? Materi yang terassign akan jadi unassigned.`)
    )
      return;
    const result = await deleteAcademicPeriod(id);
    if (result.success) {
      toast({
        title: "Berhasil Dihapus",
        description: `Academic Period "${periodToDelete?.name || ""}" berhasil dihapus.`,
        variant: "success",
      });
      router.refresh();
    } else {
      toast({
        title: "Gagal Menghapus",
        description: result.error || "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const handleSetActive = async (id: string) => {
    const period = periods.find((p: any) => p.id === id);
    const originalActive = period?.isActive;
    const result = await setActivePeriod(id);

    if (result.success) {
      toast({
        title: "Status Diubah!",
        description: `Academic Period "${period?.name || ""}" sekarang ${!originalActive ? "aktif" : "nonaktif"}.`,
        variant: "success",
      });
      router.refresh();
    } else {
      toast({
        title: "Gagal Mengubah Status",
        description: result.error || "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const handleAssign = async (materialId: string, periodId: string) => {
    const material = unassigned.find((m: any) => m.id === materialId);
    const period = periods.find((p: any) => p.id === periodId);
    const result = await assignMaterialToPeriod(materialId, periodId);
    if (result.success) {
      toast({
        title: "Materi Terassign!",
        description: `"${material?.title || ""}" berhasil ditambahkan ke "${period?.name || ""}".`,
        variant: "success",
      });
      router.refresh();
    } else {
      toast({
        title: "Gagal Assign Materi",
        description: result.error || "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const handleUnassign = async (materialId: string) => {
    if (!confirm("Lepas materi dari period ini?")) return;
    const result = await assignMaterialToPeriod(materialId, null);
    if (result.success) {
      toast({
        title: "Materi Dilepas!",
        description: "Materi berhasil dikeluarkan dari period.",
        variant: "success",
      });
      router.refresh();
    } else {
      toast({
        title: "Gagal Melepas Materi",
        description: result.error || "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm("Publish material ini?")) return;
    const result = await publishMaterial(id);
    if (result.success) {
      toast({
        title: "Materi Dipublikasikan!",
        description: "Status materi berhasil diubah menjadi PUBLISHED.",
        variant: "success",
      });
      router.refresh();
    } else {
      toast({
        title: "Gagal Publikasi",
        description: result.error || "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archive material ini?")) return;
    const result = await archiveMaterial(id);
    if (result.success) {
      toast({
        title: "Materi Diarsipkan!",
        description: "Status materi berhasil diubah menjadi ARCHIVED.",
        variant: "success",
      });
      router.refresh();
    } else {
      toast({
        title: "Gagal Mengarsipkan",
        description: result.error || "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Hapus material ini?")) return;
    const result = await deleteMaterial(id);
    if (result.success) {
      toast({
        title: "Materi Dihapus",
        description: "Materi berhasil dihapus secara permanen.",
        variant: "success",
      });
      router.refresh();
    } else {
      toast({
        title: "Gagal Menghapus Materi",
        description: result.error || "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const MaterialRow = ({ m, periodId }: { m: any; periodId?: string }) => {
    const Icon = typeIcon[m.type as keyof typeof typeIcon] ?? FileText;
    return (
      <div className="border rounded-lg p-3 flex items-start justify-between gap-3 bg-background">
        <div className="flex gap-2 items-start flex-1 min-w-0">
          <Icon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{m.title}</p>
            <p className="text-xs text-muted-foreground">{m.topic?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end shrink-0">
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${statusColor[m.status as keyof typeof statusColor]}`}
          >
            {m.status}
          </span>
          {m.status !== "PUBLISHED" && (
            <button
              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Publish"
              onClick={() => handlePublish(m.id)}
            >
              <CheckCircle className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
          )}
          {m.status === "PUBLISHED" && (
            <button
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
              title="Archive"
              onClick={() => handleArchive(m.id)}
            >
              <X className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
          )}
          {periodId && (
            <button
              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
              title="Unassign"
              onClick={() => handleUnassign(m.id)}
            >
              <X className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
          )}
          <button
            className="p-1.5 text-[#E74C3C] hover:bg-red-50 rounded transition-colors"
            title="Delete"
            onClick={() => handleDeleteMaterial(m.id)}
          >
            <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header + Create */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Academic Periods</h2>
        <div className="flex gap-2">
          <SemesterResetDialog />
          <Button
            className="bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] px-6 h-10 shadow-sm transition-all font-semibold"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? "Cancel" : "Buat Period"}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Nama Period</label>
              <Input
                className="mt-1 bg-white rounded-[24px] shadow-sm border border-slate-100 p-2"
                placeholder="cth: 2025/2026 Semester 1"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Tanggal Mulai</label>
                <Input className="mt-1 bg-white rounded-[24px] shadow-sm border border-slate-100 p-2" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Tanggal Selesai</label>
                <Input className="mt-1 bg-white rounded-[24px] shadow-sm border border-slate-100 p-2" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleCreate} disabled={saving} className="bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] px-6 h-10 shadow-sm transition-all font-semibold w-full">
              {saving ? "Menyimpan..." : "Simpan Period"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Period List */}
      {periods.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada academic period.
          </CardContent>
        </Card>
      ) : (
        periods.map((period: any) => (
          <Card
            key={period.id}
            className={period.isActive ? "border-green-400" : ""}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                {/* Left: expand + title */}
                <button
                  className="flex items-center gap-2 flex-1 text-left"
                  onClick={() => toggleExpand(period.id)}
                >
                  {expandedPeriods.includes(period.id) ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{period.name}</span>
                      {period.isActive && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          Aktif
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(period.startDate).toLocaleDateString("id-ID")} —{" "}
                      {new Date(period.endDate).toLocaleDateString("id-ID")} •{" "}
                      {period.materials?.length ?? 0} materi
                    </p>
                  </div>
                </button>

                {/* Right: actions */}
                <div className="flex gap-1 shrink-0">
                  <button
                    className={`p-1.5 rounded transition-colors ${
                      period.isActive
                        ? "text-green-600 bg-green-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={period.isActive ? "Aktif" : "Set Aktif"}
                    onClick={() => handleSetActive(period.id)}
                  >
                    <CheckCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                  <button
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Assign Materi"
                    onClick={() => setShowAssignDialog(period.id)}
                  >
                    <Plus className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                  <button
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                    onClick={() =>
                      setEditPeriod({
                        ...period,
                        startDate: period.startDate.toString().slice(0, 10),
                        endDate: period.endDate.toString().slice(0, 10),
                      })
                    }
                  >
                    <SquarePen className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                  <button
                    className="p-1.5 text-[#E74C3C] hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                    onClick={() => handleDelete(period.id)}
                  >
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </CardHeader>

            {/* Expanded material list */}
            {expandedPeriods.includes(period.id) && (
              <CardContent className="pt-0">
                {period.materials?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada materi di period ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {period.materials.map((m: any) => (
                      <MaterialRow key={m.id} m={m} periodId={period.id} />
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))
      )}

      {/* Unassigned Materials */}
      {unassigned.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Materi Tanpa Period ({unassigned.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unassigned.map((m: any) => (
              <MaterialRow key={m.id} m={m} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Edit Period Dialog */}
      <Dialog
        open={!!editPeriod}
        onOpenChange={(open) => !open && setEditPeriod(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Period</DialogTitle>
          </DialogHeader>
          {editPeriod && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Nama</label>
                <Input className="mt-1 bg-white rounded-[24px] shadow-sm border border-slate-100 p-2" value={editPeriod.name} onChange={(e) => setEditPeriod({ ...editPeriod, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Mulai</label>
                  <Input
                    className="mt-1 bg-white rounded-[24px] shadow-sm border border-slate-100 p-2"
                    type="date"
                    value={editPeriod.startDate}
                    onChange={(e) =>
                      setEditPeriod({
                        ...editPeriod,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Selesai</label>
                  <Input className="mt-1 bg-white rounded-[24px] shadow-sm border border-slate-100 p-2" type="date" value={editPeriod.endDate} onChange={(e) => setEditPeriod({ ...editPeriod, endDate: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-[24px]"
                  onClick={() => setEditPeriod(null)}
                >
                  Cancel
                </Button>
                <Button className="bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] px-6 h-10 shadow-sm transition-all font-semibold" onClick={handleUpdate} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Material Dialog */}
      <Dialog
        open={!!showAssignDialog}
        onOpenChange={(open) => !open && setShowAssignDialog(null)}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Materi ke Period</DialogTitle>
          </DialogHeader>
          {unassigned.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Semua materi sudah ter-assign ke period.
            </p>
          ) : (
            <div className="space-y-2">
              {unassigned.map((m: any) => {
                const Icon =
                  typeIcon[m.type as keyof typeof typeIcon] ?? FileText;
                return (
                  <div
                    key={m.id}
                    className="border rounded-lg p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex gap-2 items-center flex-1 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {m.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.topic?.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleAssign(m.id, showAssignDialog!);
                        setShowAssignDialog(null);
                      }}
                    >
                      Assign
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
