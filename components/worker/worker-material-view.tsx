"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  markMaterialComplete,
  getMaterialProgress,
} from "@/app/actions/worker";
import { ArrowLeft, CheckCircle } from "lucide-react";

interface MediaFile {
  id: string;
  type: string;
  url: string;
}

interface Material {
  id: string;
  title: string;
  description?: string;
  type: string;
  duration?: number;
  mediaFiles: MediaFile[];
  topic: {
    id: string;
    name: string;
  };
}

interface WorkerMaterialViewProps {
  material: Material;
  onBack: () => void;
  onComplete: (materialId: string) => void;
}

export default function WorkerMaterialView({
  material,
  onBack,
  onComplete,
}: WorkerMaterialViewProps) {
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleMarkComplete = async () => {
    setLoading(true);
    try {
      const result = await markMaterialComplete(material.id);
      if (result.success) {
        setIsComplete(true);
        setTimeout(() => onComplete(material.id), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const getVideoEmbed = (url: string) => {
    // Extract YouTube video ID
    const youtubeMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    // Handle Google Drive links
    if (url.includes("drive.google.com")) {
      const driveMatch = url.match(/\/d\/([^/]+)/);
      if (driveMatch) {
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
      }
    }
    return url;
  };

  const renderMedia = () => {
    if (!material.mediaFiles || material.mediaFiles.length === 0) {
      return (
        <div className="bg-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No media content</p>
        </div>
      );
    }

    const media = material.mediaFiles[0];

    if (material.type === "VIDEO") {
      const embedUrl = getVideoEmbed(media.url);
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (material.type === "INFOGRAPHIC") {
      return (
        <div className="rounded-lg overflow-hidden bg-muted">
          <img src={media.url} alt={material.title} className="w-full h-auto" />
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        <p>{media.url}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Materials
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {material.topic.name}
                </p>
                <CardTitle>{material.title}</CardTitle>
                {material.description && (
                  <CardDescription className="mt-2">
                    {material.description}
                  </CardDescription>
                )}
              </div>
              {isComplete && <CheckCircle className="w-6 h-6 text-green-600" />}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">{renderMedia()}</CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Material Type: {material.type}
            {material.duration &&
              ` • Duration: ${Math.ceil(material.duration / 60)}m`}
          </p>

          <Button
            onClick={handleMarkComplete}
            disabled={loading || isComplete}
            size="lg"
          >
            {isComplete ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              "Mark as Complete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
