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
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Material {
  id: string;
  title: string;
  description?: string;
  type: string;
  duration?: number;
  topic: { id: string; name: string };
  progress?: Array<{ status: string; completedAt: string | null }>;
}

interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  materials: Material[];
}

interface WorkerMaterialListProps {
  periods: Period[];
  unassigned: Material[];
}

export default function WorkerMaterialList({
  periods,
  unassigned,
}: WorkerMaterialListProps) {
  const completedIds = [...periods.flatMap((p) => p.materials), ...unassigned]
    .filter((m) => m.progress?.[0]?.status === "COMPLETED")
    .map((m) => m.id);

  const [expandedPeriods, setExpandedPeriods] = useState<string[]>(() =>
    periods.filter((p) => p.isActive).map((p) => p.id),
  );

  const toggleExpand = (id: string) => {
    setExpandedPeriods((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return "🎥";
      case "INFOGRAPHIC":
        return "📊";
      case "ARTICLE":
        return "📄";
      default:
        return "📚";
    }
  };

  const MaterialCard = ({ material }: { material: Material }) => {
    const isCompleted = completedIds.includes(material.id);
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <span className="text-2xl">{getTypeIcon(material.type)}</span>
            {isCompleted && (
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            )}
          </div>
          <CardTitle className="text-base line-clamp-2">
            {material.title}
          </CardTitle>
          <CardDescription>{material.topic.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {material.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {material.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{material.type}</Badge>
            {material.duration && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.ceil(material.duration / 60)}m
              </Badge>
            )}
          </div>
          <Link href={`/worker/materials/${material.id}`}>
            <Button
              className="w-full"
              variant={isCompleted ? "outline" : "default"}
            >
              {isCompleted ? "Review" : "Pelajari"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {periods.map((period) => (
        <div key={period.id} className="border rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
            onClick={() => toggleExpand(period.id)}
          >
            <div className="flex items-center gap-3">
              {expandedPeriods.includes(period.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
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
                  {period.materials.length} materi •{" "}
                  {
                    period.materials.filter((m) => completedIds.includes(m.id))
                      .length
                  }{" "}
                  selesai
                </p>
              </div>
            </div>
          </button>

          {expandedPeriods.includes(period.id) && (
            <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {period.materials.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                  Belum ada materi di period ini.
                </p>
              ) : (
                period.materials.map((m) => (
                  <MaterialCard key={m.id} material={m} />
                ))
              )}
            </div>
          )}
        </div>
      ))}

      {unassigned.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center gap-3 p-4 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
            onClick={() => toggleExpand("unassigned")}
          >
            {expandedPeriods.includes("unassigned") ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="font-semibold text-muted-foreground">
              Materi Lainnya ({unassigned.length})
            </span>
          </button>
          {expandedPeriods.includes("unassigned") && (
            <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unassigned.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          )}
        </div>
      )}

      {periods.length === 0 && unassigned.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Belum ada materi tersedia.
        </div>
      )}
    </div>
  );
}
