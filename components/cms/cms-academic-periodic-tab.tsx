"use client";

import { useState } from "react";
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
  Pencil,
  Trash2,
  Plus,
  FileVideo,
  FileImage,
  FileText,
  CheckCircle,
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

  const toggleExpand = (id: string) => {
    setExpandedPeriods((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return alert("Nama wajib diisi");
    if (!formData.startDate || !formData.endDate)
      return alert("Tanggal wajib diisi");
    setSaving(true);
    const result = await createAcademicPeriod({
      name: formData.name,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });
    setSaving(false);
    if (result.success) {
      router.refresh();
    } else alert(result.error);
  };

  const handleUpdate = async () => {
    if (!editPeriod) return;
    setSaving(true);
    const result = await updateAcademicPeriod(editPeriod.id, {
      name: editPeriod.name,
      startDate: new Date(editPeriod.startDate),
      endDate: new Date(editPeriod.endDate),
    });
    setSaving(false);
    if (result.success) router.refresh();
    else alert(result.error);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm("Hapus period ini? Materi yang terassign akan jadi unassigned.")
    )
      return;
    const result = await deleteAcademicPeriod(id);
    if (result.success) router.refresh();
    else alert(result.error);
  };

  const handleSetActive = async (id: string) => {
    const result = await setActivePeriod(id);

    if (result.success) {
      setPeriods((prev: any[]) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)),
      );
    } else {
      alert(result.error);
    }
  };

  const handleAssign = async (materialId: string, periodId: string) => {
    const result = await assignMaterialToPeriod(materialId, periodId);
    if (result.success) router.refresh();
    else alert(result.error);
  };

  const handleUnassign = async (materialId: string) => {
    if (!confirm("Lepas materi dari period ini?")) return;
    const result = await assignMaterialToPeriod(materialId, null);
    if (result.success) router.refresh();
    else alert(result.error);
  };

  const handlePublish = async (id: string) => {
    if (!confirm("Publish material ini?")) return;
    const result = await publishMaterial(id);
    if (result.success) router.refresh();
    else alert(result.error);
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archive material ini?")) return;
    const result = await archiveMaterial(id);
    if (result.success) router.refresh();
    else alert(result.error);
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Hapus material ini?")) return;
    const result = await deleteMaterial(id);
    if (result.success) router.refresh();
    else alert(result.error);
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
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs text-green-600 hover:bg-green-50"
              onClick={() => handlePublish(m.id)}
            >
              Publish
            </Button>
          )}
          {m.status === "PUBLISHED" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => handleArchive(m.id)}
            >
              Archive
            </Button>
          )}
          {periodId && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs text-orange-600 hover:bg-orange-50"
              onClick={() => handleUnassign(m.id)}
            >
              Unassign
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
            onClick={() => handleDeleteMaterial(m.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header + Create */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Academic Periods</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? "Cancel" : "Buat Period"}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Nama Period</label>
              <Input
                className="mt-1"
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
                <Input
                  className="mt-1"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tanggal Selesai</label>
                <Input
                  className="mt-1"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
            <Button onClick={handleCreate} disabled={saving} className="w-full">
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
                  <Button
                    size="sm"
                    variant={period.isActive ? "default" : "outline"}
                    className={`h-7 px-2 text-xs ${
                      period.isActive
                        ? "bg-green-600 hover:bg-green-700"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    onClick={() => handleSetActive(period.id)}
                  >
                    {period.isActive ? "Aktif" : "Set Aktif"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => setShowAssignDialog(period.id)}
                  >
                    + Assign Materi
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      setEditPeriod({
                        ...period,
                        startDate: period.startDate.toString().slice(0, 10),
                        endDate: period.endDate.toString().slice(0, 10),
                      })
                    }
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(period.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
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
                <Input
                  className="mt-1"
                  value={editPeriod.name}
                  onChange={(e) =>
                    setEditPeriod({ ...editPeriod, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Mulai</label>
                  <Input
                    className="mt-1"
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
                  <Input
                    className="mt-1"
                    type="date"
                    value={editPeriod.endDate}
                    onChange={(e) =>
                      setEditPeriod({ ...editPeriod, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditPeriod(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdate}
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
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
