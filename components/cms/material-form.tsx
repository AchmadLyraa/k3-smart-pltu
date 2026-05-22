"use client";

import { useState, useRef } from "react";
import { createMaterial, addMediaFile } from "@/app/actions/content";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Upload, Link, Loader2, CheckCircle } from "lucide-react";

export default function MaterialForm({
  topics,
  onSuccess,
}: {
  topics: any[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);

  const videoFileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);

  const [videoInputMode, setVideoInputMode] = useState<"url" | "upload">("url");
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");

  const [formData, setFormData] = useState({
    topicId: "",
    title: "",
    description: "",
    type: "VIDEO",
    duration: 0,
    videoUrl: "",
    imageUrl: "",
    articleContent: "",
    fileName: "",
  });

  const handleTypeChange = (val: string) => {
    setFormData({
      ...formData,
      type: val,
      videoUrl: "",
      imageUrl: "",
      articleContent: "",
      fileName: "",
    });
    setUploadProgress(0);
    setUploadDone(false);
    setVideoInputMode("url");
    setImageInputMode("url");
  };

  const handleFileUpload = async (
    file: File,
    targetField: "videoUrl" | "imageUrl",
  ) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadDone(false);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      clearInterval(progressInterval);

      if (!res.ok || !data.success) {
        alert(data.error ?? "Upload gagal");
        setUploadProgress(0);
        return;
      }

      setUploadProgress(100);
      setUploadDone(true);
      setFormData((prev) => ({
        ...prev,
        [targetField]: data.url,
        fileName: data.fileName,
      }));

      // Pindah ke tab URL supaya user lihat URL hasil upload
      if (targetField === "videoUrl") setVideoInputMode("url");
      if (targetField === "imageUrl") setImageInputMode("url");
    } catch {
      clearInterval(progressInterval);
      alert("Upload gagal, cek koneksi");
      setUploadProgress(0);
    } finally {
      setUploading(false);
      if (videoFileRef.current) videoFileRef.current.value = "";
      if (imageFileRef.current) imageFileRef.current.value = "";
    }
  };

  const isStorageUrl = (url: string) =>
    url.includes(process.env.NEXT_PUBLIC_S3_BUCKET ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.topicId) return alert("Topic wajib diisi");
    if (!formData.title.trim()) return alert("Title wajib diisi");
    if (formData.type === "VIDEO" && !formData.videoUrl.trim())
      return alert("URL video wajib diisi");
    if (formData.type === "INFOGRAPHIC" && !formData.imageUrl.trim())
      return alert("URL gambar wajib diisi");
    if (formData.type === "ARTICLE" && !formData.articleContent.trim())
      return alert("Konten artikel wajib diisi");

    setLoading(true);
    try {
      const result = await createMaterial({
        topicId: formData.topicId,
        title: formData.title,
        description: formData.description,
        type: formData.type as any,
        duration: formData.duration,
        thumbnail:
          formData.type === "INFOGRAPHIC" ? formData.imageUrl : undefined,
      });

      if (!result.success || !result.data) {
        return alert(result.error ?? "Gagal create material");
      }

      const materialId = result.data.id;

      if (formData.type === "VIDEO") {
        await addMediaFile({
          materialId,
          url: formData.videoUrl,
          type: "video",
          fileName: formData.fileName || formData.title,
          duration: formData.duration,
        });
      }

      if (formData.type === "INFOGRAPHIC") {
        await addMediaFile({
          materialId,
          url: formData.imageUrl,
          type: "image",
          fileName: formData.fileName || formData.title,
        });
      }

      if (formData.type === "ARTICLE") {
        await addMediaFile({
          materialId,
          url: formData.articleContent,
          type: "article",
          fileName: formData.title,
        });
      }

      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  // ── Reusable upload zone ──────────────────────────────────────────────────
  const UploadZone = ({
    fileRef,
    accept,
    targetField,
    label,
  }: {
    fileRef: React.RefObject<HTMLInputElement | null>;
    accept: string;
    targetField: "videoUrl" | "imageUrl";
    label: string;
  }) => (
    <div>
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Mengupload...</p>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
          </div>
        ) : uploadDone ? (
          <div className="space-y-2">
            <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
            <p className="text-sm text-green-600 font-medium">
              Upload berhasil!
            </p>
            <p className="text-xs text-muted-foreground">
              URL sudah terisi otomatis di tab Paste URL
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">Klik untuk pilih {label}</p>
            <p className="text-xs text-muted-foreground">{accept}</p>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, targetField);
        }}
      />
    </div>
  );

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Topic</label>
              <Select
                value={formData.topicId}
                onValueChange={(val) =>
                  setFormData({ ...formData, topicId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Material title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description"
              rows={2}
            />
          </div>

          {/* VIDEO */}
          {formData.type === "VIDEO" && (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium">Video Settings</p>
              <Tabs
                value={videoInputMode}
                onValueChange={(v) => setVideoInputMode(v as any)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="gap-2">
                    <Link className="w-3 h-3" /> Paste URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-2">
                    <Upload className="w-3 h-3" /> Upload File
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="mt-3 space-y-2">
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    placeholder="YouTube, Google Drive, atau URL storage"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mendukung: YouTube, Google Drive, dan link storage
                  </p>
                </TabsContent>

                <TabsContent value="upload" className="mt-3">
                  <UploadZone
                    fileRef={videoFileRef}
                    accept="video/mp4,video/webm,video/ogg"
                    targetField="videoUrl"
                    label="video (MP4, WebM, OGG)"
                  />
                </TabsContent>
              </Tabs>

              <div>
                <label className="block text-sm mb-1">Durasi (detik)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
              </div>

              {/* Preview */}
              {formData.videoUrl && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                  <div className="aspect-video rounded overflow-hidden bg-black">
                    {isStorageUrl(formData.videoUrl) ? (
                      <video
                        src={formData.videoUrl}
                        controls
                        className="w-full h-full"
                      />
                    ) : (
                      <iframe
                        src={formData.videoUrl.replace("watch?v=", "embed/")}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INFOGRAPHIC */}
          {formData.type === "INFOGRAPHIC" && (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium">Infographic Settings</p>
              <Tabs
                value={imageInputMode}
                onValueChange={(v) => setImageInputMode(v as any)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="gap-2">
                    <Link className="w-3 h-3" /> Paste URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-2">
                    <Upload className="w-3 h-3" /> Upload File
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="mt-3 space-y-2">
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="URL gambar atau link storage"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mendukung: Google Drive, dan link storage
                  </p>
                </TabsContent>

                <TabsContent value="upload" className="mt-3">
                  <UploadZone
                    fileRef={imageFileRef}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    targetField="imageUrl"
                    label="gambar (JPG, PNG, GIF, WebP)"
                  />
                </TabsContent>
              </Tabs>

              {/* Preview */}
              {formData.imageUrl && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                  <img
                    src={formData.imageUrl}
                    alt="preview"
                    className="max-h-64 rounded border object-contain w-full"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
            </div>
          )}

          {/* ARTICLE */}
          {formData.type === "ARTICLE" && (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium">Article Settings</p>
              <Textarea
                value={formData.articleContent}
                onChange={(e) =>
                  setFormData({ ...formData, articleContent: e.target.value })
                }
                placeholder="Tulis konten artikel di sini..."
                rows={8}
              />
              <div>
                <label className="block text-sm mb-1">
                  Estimasi Baca (menit)
                </label>
                <Input
                  type="number"
                  value={Math.round(formData.duration / 60)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: (parseInt(e.target.value) || 0) * 60,
                    })
                  }
                  min="0"
                  placeholder="5"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || uploading}
            className="bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] px-6 h-10 shadow-sm transition-all font-semibold"
          >
            {loading ? "Creating..." : "Create Material"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
