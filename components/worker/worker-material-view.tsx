"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markMaterialComplete } from "@/app/actions/worker";
import { ArrowLeft, CheckCircle, PlayCircle } from "lucide-react";
import Link from "next/link";

interface WorkerMaterialViewProps {
  material: any;
}

export default function WorkerMaterialView({
  material,
}: WorkerMaterialViewProps) {
  const router = useRouter();
  const alreadyComplete = material.progress?.[0]?.status === "COMPLETED";
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(alreadyComplete);

  const handleMarkComplete = async () => {
    setLoading(true);
    try {
      const result = await markMaterialComplete(material.id);
      if (result.success) {
        setIsComplete(true);
        router.refresh(); // refresh server data
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/worker/home")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
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

        {/* Deadline info */}
        {isComplete && material.quizConfigs?.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {material.quizConfigs.map((quiz: any) => {
                  const deadline = quiz.deadline
                    ? new Date(quiz.deadline)
                    : null;
                  const now = new Date();
                  const isOverdue = deadline && now > deadline;
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
                  const lastSession = quiz.quizSessions?.[0];
                  const hasPassed = lastSession?.passed;
                  const hasFailed = lastSession && !lastSession.passed;

                  return (
                    <div
                      key={quiz.id}
                      className="text-sm flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-medium">{quiz.name}</p>
                        {hasPassed ? (
                          <p className="text-green-600 flex items-center gap-1 mt-0.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Sudah lulus — {lastSession.score} pts
                          </p>
                        ) : hasFailed ? (
                          <p className="text-red-500 mt-0.5">
                            ❌ Belum lulus — {lastSession.score} pts
                          </p>
                        ) : deadline ? (
                          <p
                            className={
                              isOverdue ? "text-red-600" : "text-amber-700"
                            }
                          >
                            {isOverdue
                              ? `⚠️ Terlambat ${daysLate} hari (Poin berkurang ${Math.min(daysLate * 5, 40)}%)`
                              : `📅 Deadline: ${deadline.toLocaleDateString("id-ID")} (${daysLeft} hari lagi)`}
                          </p>
                        ) : null}
                      </div>
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
            {isComplete && material.quizConfigs?.length > 0 && (
              <Link href={`/worker/materials/${material.id}/quiz`}>
                <Button variant="outline" className="gap-2">
                  <PlayCircle className="w-4 h-4" />
                  Take Quiz
                </Button>
              </Link>
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
