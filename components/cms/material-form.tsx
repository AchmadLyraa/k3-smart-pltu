"use client";

import { useState } from "react";
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

export default function MaterialForm({
  topics,
  onSuccess,
}: {
  topics: any[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
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
  };

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

      if (result.success && result.data) {
        const materialId = result.data.id;

        if (formData.type === "VIDEO" && formData.videoUrl.trim()) {
          await addMediaFile({
            materialId,
            url: formData.videoUrl,
            type: "video",
            fileName: formData.title,
            duration: formData.duration,
          });
        }

        if (formData.type === "INFOGRAPHIC" && formData.imageUrl.trim()) {
          await addMediaFile({
            materialId,
            url: formData.imageUrl,
            type: "image",
            fileName: formData.title,
          });
        }

        if (formData.type === "ARTICLE" && formData.articleContent.trim()) {
          await addMediaFile({
            materialId,
            url: formData.articleContent, // store content as url field, atau...
            type: "article",
            fileName: formData.title,
          });
        }

        onSuccess();
      } else {
        alert(result.error ?? "Gagal create material");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Material</CardTitle>
        <CardDescription>Upload new learning material</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-sm mb-1">
                  URL Video (YouTube / direct link)
                </label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Duration (seconds)</label>
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
              {formData.videoUrl && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                  <div className="aspect-video rounded overflow-hidden bg-black">
                    <iframe
                      src={formData.videoUrl.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INFOGRAPHIC */}
          {formData.type === "INFOGRAPHIC" && (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium">Infographic Settings</p>
              <div>
                <label className="block text-sm mb-1">URL Gambar</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.png"
                />
              </div>
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
              <div>
                <label className="block text-sm mb-1">Konten Artikel</label>
                <Textarea
                  value={formData.articleContent}
                  onChange={(e) =>
                    setFormData({ ...formData, articleContent: e.target.value })
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Material"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
