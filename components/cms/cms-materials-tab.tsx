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
import { Pencil, Trash2, FileVideo, FileImage, FileText } from "lucide-react";
import MaterialForm from "./material-form";

import {
  updateMaterial,
  deleteMaterial,
  publishMaterial,
  archiveMaterial,
  addMediaFile,
  removeMediaFile,
} from "@/app/actions/content";

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

export default function CMSMaterialsTab({ topics, materials }) {
  const [showForm, setShowForm] = useState(false);
  const [editMaterial, setEditMaterial] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

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
      articleContent: "",
    });
  };

  const handleSave = async () => {
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
        // Hapus media files lama dulu, ganti dengan yang baru
        const existingFiles = editMaterial.mediaFiles ?? [];
        for (const f of existingFiles) {
          await removeMediaFile(f.id);
        }

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
                {materials.length} material{materials.length !== 1 ? "s" : ""}{" "}
                total
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "+ Create Material"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {showForm && (
            <div className="mb-6">
              <MaterialForm
                topics={topics}
                onSuccess={() => {
                  setShowForm(false);
                  window.location.reload();
                }}
              />
            </div>
          )}

          {materials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No materials yet. Create your first material.
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((m: any, idx: number) => {
                const Icon = typeIcon[m.type] ?? FileText;
                return (
                  <div
                    key={m.id}
                    className="border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 items-start flex-1 min-w-0">
                        <span className="text-sm text-muted-foreground mt-0.5 shrink-0">
                          #{idx + 1}
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
                        <div className="flex gap-1 mt-1">
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
          )}
        </CardContent>
      </Card>

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

              {/* VIDEO */}
              {editData.type === "VIDEO" && (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm font-medium">Video Settings</p>
                  <div>
                    <label className="block text-sm mb-1">
                      URL Video (YouTube / direct link)
                    </label>
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
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Preview:
                      </p>
                      <div className="aspect-video rounded overflow-hidden bg-black">
                        <iframe
                          src={editData.videoUrl.replace("watch?v=", "embed/")}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INFOGRAPHIC */}
              {editData.type === "INFOGRAPHIC" && (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm font-medium">Infographic Settings</p>
                  <div>
                    <label className="block text-sm mb-1">URL Gambar</label>
                    <Input
                      value={editData.imageUrl}
                      onChange={(e) =>
                        setEditData({ ...editData, imageUrl: e.target.value })
                      }
                      placeholder="https://example.com/image.png"
                    />
                  </div>
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

              {/* ARTICLE */}
              {editData.type === "ARTICLE" && (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm font-medium">Article Settings</p>
                  <div>
                    <label className="block text-sm mb-1">Konten Artikel</label>
                    <Textarea
                      value={editData.articleContent}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          articleContent: e.target.value,
                        })
                      }
                      placeholder="Tulis konten artikel di sini..."
                      rows={8}
                    />
                  </div>
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
