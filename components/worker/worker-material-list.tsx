"use client";

import { useState } from "react";

import Link from "next/link";

import {
  Clock3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

interface Material {
  id: string;
  title: string;
  description?: string;
  type: string;
  duration?: number;

  topic: {
    id: string;
    name: string;
  };

  progress?: Array<{
    status: string;
    completedAt: string | null;
  }>;

  quizMeta?: {
    count: number;
    completedCount: number;
    allDone: boolean;
  } | null;
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

  const [expandedPeriods, setExpandedPeriods] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedPeriods((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircle className="h-4 w-4 text-red-500" />;

      case "INFOGRAPHIC":
        return <BarChart3 className="h-4 w-4 text-red-500" />;

      case "ARTICLE":
        return <FileText className="h-4 w-4 text-red-500" />;

      default:
        return <FileText className="h-4 w-4 text-red-500" />;
    }
  };

  const MaterialRow = ({ material }: { material: Material }) => {
    const isCompleted = completedIds.includes(material.id);

    return (
      <Link href={`/worker/materials/${material.id}`} className="block">
        <div className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 transition-all duration-200 hover:border-red-200 hover:shadow-md">
          {/* ICON */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
            {getTypeIcon(material.type)}
          </div>

          {/* CONTENT */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-zinc-900">
                  {material.title}
                </h3>

                {isCompleted && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                )}
              </div>

              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-red-600">
                {material.topic.name}
              </span>

              <span className="text-[10px] text-zinc-300">•</span>

              <Badge className="h-4 rounded-full border-0 bg-black px-1.5 text-[8px] font-medium text-white hover:bg-black">
                {material.type}
              </Badge>

              {material.duration !== undefined &&
                material.duration !== null && (
                  <>
                    <span className="text-[10px] text-zinc-300">•</span>

                    <div className="flex items-center gap-1 leading-none text-[10px] text-zinc-500">
                      <Clock3 className="mt-[-1px] h-2.5 w-2.5 shrink-0" />

                      {Math.max(
                        1,
                        Math.ceil(material.duration / 60),
                      )}
                      m
                    </div>
                  </>
                )}

              {material.quizMeta && (
  <>
    <span className="text-[10px] text-zinc-300">•</span>
    <Badge
      className={cn(
        "rounded-full border-0 px-2 py-0.5 text-[10px] font-bold text-white",
        material.quizMeta.allDone
          ? "bg-green-600 hover:bg-green-600"
          : "bg-amber-600 hover:bg-amber-600",
      )}
    >
      {material.quizMeta.allDone
        ? `✓ ${material.quizMeta.count} Quiz Selesai`
        : `${material.quizMeta.completedCount}/${material.quizMeta.count} Quiz`}
    </Badge>
  </>
)}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-4">
      {periods.map((period) => (
        <div
          key={period.id}
          className="overflow-hidden rounded-[26px] border border-zinc-200 bg-white"
        >
          {/* HEADER */}
          <button
            onClick={() => toggleExpand(period.id)}
            className="flex w-full items-center justify-between bg-zinc-50 px-4 py-3 text-left transition hover:bg-zinc-100"
          >
            <div className="flex w-full items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                {expandedPeriods.includes(period.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-zinc-900">
                    {period.name}
                  </span>

                  {period.isActive && (
                    <Badge className="border-0 bg-green-100 text-[10px] text-green-700 hover:bg-green-100">
                      Aktif
                    </Badge>
                  )}
                </div>

                <div className="mt-2 w-full">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-[11px] font-medium text-zinc-500">
                      {
                        period.materials.filter((m) =>
                          completedIds.includes(m.id),
                        ).length
                      }
                      /{period.materials.length} selesai
                    </p>

                    <span className="text-[10px] font-semibold text-zinc-500">
                      {Math.round(
                        period.materials.length > 0
                          ? (period.materials.filter((m) =>
                              completedIds.includes(m.id),
                            ).length /
                              period.materials.length) *
                              100
                          : 0,
                      )}
                      %
                    </span>
                  </div>

                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-red-600 to-black transition-all duration-500"
                      style={{
                        width: `${
                          period.materials.length > 0
                            ? (period.materials.filter((m) =>
                                completedIds.includes(m.id),
                              ).length /
                                period.materials.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* CONTENT */}
          {expandedPeriods.includes(period.id) && (
            <div className="space-y-2 p-3">
              {period.materials.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-500">
                  Belum ada materi di period ini.
                </div>
              ) : (
                period.materials.map((m) => (
                  <MaterialRow key={m.id} material={m} />
                ))
              )}
            </div>
          )}
        </div>
      ))}

      {/* UNASSIGNED */}
      {unassigned.length > 0 && (
        <div className="overflow-hidden rounded-[26px] border border-zinc-200 bg-white">
          <button
            onClick={() => toggleExpand("unassigned")}
            className="flex w-full items-center justify-between bg-zinc-50 px-4 py-3 text-left transition hover:bg-zinc-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white">
                {expandedPeriods.includes("unassigned") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>

              <div>
                <h2 className="text-sm font-bold text-zinc-900">
                  Materi Lainnya
                </h2>

                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {unassigned.length} materi
                </p>
              </div>
            </div>
          </button>

          {expandedPeriods.includes("unassigned") && (
            <div className="space-y-2 p-3">
              {unassigned.map((m) => (
                <MaterialRow key={m.id} material={m} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* EMPTY */}
      {periods.length === 0 && unassigned.length === 0 && (
        <div className="rounded-[26px] border border-zinc-200 bg-white py-10 text-center text-sm text-zinc-500">
          Belum ada materi tersedia.
        </div>
      )}
    </div>
  );
}
