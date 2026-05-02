"use client";

import { useState } from "react";
import { addMediaFile } from "@/app/actions/content";
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
import { X, Play, Image, FileText } from "lucide-react";

export default function MediaFileHandler({
  materialId,
  onSuccess,
}: {
  materialId: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    type: "video",
    fileName: "",
    duration: 0,
  });

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addMediaFile({
        materialId,
        url: formData.url,
        type: formData.type,
        fileName: formData.fileName,
        duration: formData.duration,
      });

      if (result.success) {
        setMediaFiles([...mediaFiles, result.data]);
        setFormData({ url: "", type: "video", fileName: "", duration: 0 });
        setShowForm(false);
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url: string, type: string) => {
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtube.com")
        ? new URL(url).searchParams.get("v")
        : url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Google Drive
    if (url.includes("drive.google.com")) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return url;
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4" />;
      case "image":
        return <Image className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Files</CardTitle>
        <CardDescription>
          Add video, image, or document from Google Drive or YouTube
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm ? (
          <form
            onSubmit={handleAddMedia}
            className="space-y-4 border rounded-lg p-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Media URL
              </label>
              <Input
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="Paste YouTube or Google Drive URL"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supports: YouTube links, Google Drive links
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(val) =>
                    setFormData({ ...formData, type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  File Name
                </label>
                <Input
                  value={formData.fileName}
                  onChange={(e) =>
                    setFormData({ ...formData, fileName: e.target.value })
                  }
                  placeholder="e.g., safety_training.mp4"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Duration (seconds)
              </label>
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

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Media"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setShowForm(true)} className="w-full">
            Add Media File
          </Button>
        )}

        {mediaFiles.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="font-semibold text-sm">Attached Media</h4>
            {mediaFiles.map((file) => (
              <div key={file.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMediaIcon(file.type)}
                    <div>
                      <p className="text-sm font-medium">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.type}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {file.type === "video" && (
                  <div className="w-full h-48 bg-muted rounded">
                    <iframe
                      src={getEmbedUrl(file.url, file.type)}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allowFullScreen
                      className="rounded"
                    />
                  </div>
                )}

                {file.type === "image" && (
                  <img
                    src={getEmbedUrl(file.url, file.type)}
                    alt={file.fileName}
                    className="w-full h-48 object-cover rounded"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
