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
import { markMaterialComplete, getQuizByMaterial } from "@/app/actions/worker";
import { ArrowLeft, CheckCircle, PlayCircle } from "lucide-react";
import WorkerQuizList from "./worker-quiz-list";

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
  topic: { id: string; name: string };
  quizConfigs?: any[];
  progress?: Array<{ status: string; completedAt: string | null }>;
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
  const alreadyComplete = material.progress?.[0]?.status === "COMPLETED";
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(alreadyComplete);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizConfigs, setQuizConfigs] = useState<any[]>(
    material.quizConfigs ?? [],
  );

  const handleMarkComplete = async () => {
    setLoading(true);
    try {
      const result = await markMaterialComplete(material.id);
      if (result.success) {
        setIsComplete(true);
        onComplete(material.id);

        // Fetch quiz kalau belum ada
        if (quizConfigs.length === 0) {
          const quizResult = await getQuizByMaterial(material.id);
          if (quizResult.success) setQuizConfigs(quizResult.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getVideoEmbed = (url: string) => {
    const youtubeMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    );
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    if (url.includes("drive.google.com")) {
      const driveMatch = url.match(/\/d\/([^/]+)/);
      if (driveMatch)
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
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
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={getVideoEmbed(media.url)}
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

    if (material.type === "ARTICLE") {
      return (
        <div className="prose prose-sm max-w-none p-4 bg-muted/30 rounded-lg">
          <p className="whitespace-pre-wrap">{media.url}</p>
        </div>
      );
    }

    return null;
  };

  if (showQuiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <WorkerQuizList
          quizConfigs={quizConfigs}
          onBack={() => setShowQuiz(false)}
        />
      </div>
    );
  }

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

        {isComplete && quizConfigs.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                {quizConfigs.map((quiz) => {
                  const deadline = quiz.deadline
                    ? new Date(quiz.deadline)
                    : null;
                  const now = new Date();
                  const isOverdue = deadline && now > deadline;

                  // Hitung hari telat pakai ceil dari selisih positif
                  const daysLate = deadline
                    ? Math.ceil(
                        (now.getTime() - deadline.getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : 0;

                  const daysLeft = deadline
                    ? Math.ceil(
                        (deadline.getTime() - now.getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : null;

                  return (
                    <div key={quiz.id} className="text-sm">
                      <p className="font-medium">{quiz.name}</p>
                      {deadline && (
                        <p
                          className={
                            isOverdue ? "text-red-600" : "text-amber-700"
                          }
                        >
                          {isOverdue
                            ? `⚠️ Terlambat ${daysLate} hari (Poin berkurang ${Math.min(daysLate * 5, 40)}%)`
                            : `📅 Deadline: ${deadline.toLocaleDateString("id-ID")} (${daysLeft} hari lagi)`}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {material.type}
            {material.duration
              ? ` • ${Math.ceil(material.duration / 60)}m`
              : ""}
          </p>

          <div className="flex gap-2">
            {isComplete && quizConfigs.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowQuiz(true)}
                className="gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                Take Quiz
              </Button>
            )}

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
              ) : loading ? (
                "Menyimpan..."
              ) : (
                "Mark as Complete"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
