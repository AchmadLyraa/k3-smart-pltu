"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Trophy, BookOpen, Check, ShieldAlert, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWorkerStatsByPeriod } from "@/app/actions/worker";

interface Material {
  id: string;
  title: string;
  type: string;
  duration?: number;
  topic: {
    name: string;
  };
  progress?: Array<{
    status: string;
  }>;
}

interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  materials: Material[];
}

interface WorkerDashboardClientProps {
  stats: {
    totalPoints: number;
    availablePoints: number;
    materialsCompleted: number;
    quizPassed: number;
  } | null;
  periods: Period[];
  latestMaterials: any[];
  userName?: string;
}

export default function WorkerDashboardClient({
  stats: initialStats,
  periods,
  latestMaterials,
  userName = "Electricity Warrior",
}: WorkerDashboardClientProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    periods.find((p) => p.isActive)?.id || periods[0]?.id || ""
  );
  const [stats, setStats] = useState(initialStats);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!selectedPeriodId) return;

    const fetchStats = async () => {
      setStatsLoading(true);
      const result = await getWorkerStatsByPeriod(selectedPeriodId);
      if (result.success) {
        setStats(result.data as any);
      }
      setStatsLoading(false);
    };

    fetchStats();
  }, [selectedPeriodId]);

  const currentPeriod = useMemo(() => {
    return periods.find((p) => p.id === selectedPeriodId) || periods[0];
  }, [selectedPeriodId, periods]);

  const extractYouTubeId = (url: string): string | null => {
    try {
      const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
      const match = url.match(ytRegex);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const getMaterialThumbnail = (material: any): string | null => {
    if (!material) return null;
    if (material.thumbnail) return material.thumbnail;
    if (material.type === "INFOGRAPHIC" && material.mediaFiles?.[0]?.url) {
      return material.mediaFiles[0].url;
    }
    if (material.type === "VIDEO" && material.mediaFiles?.[0]?.url) {
      const ytId = extractYouTubeId(material.mediaFiles[0].url);
      if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
    return null;
  };

  const stepStatuses = useMemo(() => {
    const currentMaterials = currentPeriod?.materials || [];
    const totalMaterials = currentMaterials.length;
    
    const steps = [
      { id: 1, label: "1", status: "LOCKED" },
      { id: 2, label: "2", status: "LOCKED" },
      { id: 3, label: "3", status: "LOCKED" },
      { id: 4, label: "4", status: "LOCKED" },
    ];

    if (totalMaterials === 0) return steps;

    const baseItemsPerStep = Math.floor(totalMaterials / 4);
    const remainder = totalMaterials % 4;

    let currentIdx = 0;
    for (let i = 0; i < 4; i++) {
      const itemsInThisStep = baseItemsPerStep + (i < remainder ? 1 : 0);
      if (itemsInThisStep === 0) continue;

      const stepMaterials = currentMaterials.slice(currentIdx, currentIdx + itemsInThisStep);
      currentIdx += itemsInThisStep;

      const allCompleted = stepMaterials.every(
        (m) => m.progress?.[0]?.status === "COMPLETED"
      );

      if (allCompleted) {
        steps[i].status = "COMPLETED";
      } else {
        steps[i].status = "ACTIVE";
        break;
      }
    }

    if (steps.every(s => s.status === "LOCKED")) {
      steps[0].status = "ACTIVE";
    }

    return steps;
  }, [currentPeriod]);

  const latestMaterialItem = latestMaterials?.[0];
  const latestMaterialThumbnail = getMaterialThumbnail(latestMaterialItem);

  return (
    /* PERBAIKAN DI SINI: min-h-screen diganti h-auto, pb-28 dikurangi jadi pb-24 agar fit pas layar */
    <div className="mx-auto max-w-md h-auto bg-slate-50/50 pb-24 font-sans antialiased overflow-x-hidden">
      <div className="px-1 space-y-6 pt-0">
        
        {/* 1. WELCOME CARD */}
        <section className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-zinc-100">
          <div className="bg-[#FF3B30] p-5 text-white space-y-4">
            <div>
              <p className="text-xs text-white/80 font-medium uppercase tracking-wider">Selamat datang</p>
              <h2 className="text-xl font-bold tracking-tight mt-0.5">
                Electricity Warrior
              </h2>
            </div>

            <div className="w-full flex items-center justify-between bg-white/10 p-2 rounded-[20px] backdrop-blur-sm border border-white/5">
              <div className="bg-[#FF3B30] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center shrink-0 shadow-sm border border-white/10">
                <select
                  value={selectedPeriodId}
                  onChange={(e) => setSelectedPeriodId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-1"
                >
                  {periods.map((p) => (
                    <option key={p.id} value={p.id} className="bg-zinc-900 text-white font-semibold">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-around w-full pl-2">
                {stepStatuses.map((step, idx) => (
                  <div key={step.id} className="flex items-center relative w-full justify-center">
                    {step.status === "COMPLETED" ? (
                      <div className="w-6 h-6 rounded-full bg-white text-[#FF3B30] flex items-center justify-center font-bold text-[11px] shadow-sm z-10">
                        ✓
                      </div>
                    ) : step.status === "ACTIVE" ? (
                      <div className="w-6 h-6 rounded-full bg-white text-[#FF3B30] flex items-center justify-center font-extrabold text-[11px] shadow-sm z-10">
                        {step.label}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/20 text-white/50 flex items-center justify-center font-bold text-[11px] z-10">
                        🔒
                      </div>
                    )}
                    
                    {idx < 3 && (
                      <div 
                        className={cn(
                          "absolute left-[50%] right-[-50%] top-1/2 h-[2px] -translate-y-1/2 z-0",
                          stepStatuses[idx].status === "COMPLETED" ? "bg-white" : "bg-white/20"
                        )} 
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-zinc-100 bg-white p-4 text-center">
            <div className="flex flex-col justify-center py-1">
              <span className="text-[11px] font-medium text-zinc-500 mb-1">Poin saya/Semester</span>
              <span className="text-2xl font-bold text-zinc-900">{stats?.totalPoints ?? 0}</span>
            </div>
            <div className="flex flex-col justify-center py-1">
              <span className="text-[11px] font-medium text-zinc-500 mb-1">Saldo Poin</span>
              <span className="text-2xl font-bold text-zinc-900">{stats?.availablePoints ?? 0}</span>
            </div>
          </div>
        </section>

        {/* 2. MATERI TERBARU SECTION */}
        <section className="space-y-2">
          {latestMaterialItem ? (
            <Link href={`/worker/materials/${latestMaterialItem.id}`} className="block">
              <div className="relative overflow-hidden rounded-[28px] h-48 shadow-md group">
                {latestMaterialThumbnail ? (
                  <img
                    src={latestMaterialThumbnail}
                    alt={latestMaterialItem.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-zinc-900" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF3B30]/95 via-[#FF3B30]/75 to-transparent" />
                
                <div className="relative z-10 h-full p-6 flex flex-col justify-center max-w-[75%] text-white">
                  <span className="bg-white/20 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit mb-2 backdrop-blur-sm">
                    {latestMaterialItem.type || "MATERI"}
                  </span>
                  <h3 className="font-bold text-lg leading-snug drop-shadow-sm line-clamp-2">
                    {latestMaterialItem.title}
                  </h3>
                  <p className="mt-1.5 text-[11px] text-white/90 leading-relaxed font-light line-clamp-2">
                    Topik: {latestMaterialItem.topic?.name || "Umum"} • Silakan pelajari submateri ini untuk meningkatkan kompetensi dan poin Anda.
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-[28px] border border-dashed border-zinc-200 bg-white py-12 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Belum ada materi pembelajaran terbaru.
            </div>
          )}
        </section>

        {/* 3. PROGRESS BELAJAR TIMELINE SECTION */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-zinc-800">Progress Belajar</h3>
            <Link href="/worker/materials" className="text-xs font-semibold text-[#FF3B30] hover:underline">
              Lihat semua
            </Link>
          </div>

          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-zinc-100 relative">
            <div className="absolute left-[29px] top-8 bottom-12 w-0.5 bg-zinc-100" />
            <div className="max-h-[320px] overflow-y-auto no-scrollbar space-y-5">
              {/* Progress Timeline Items */}
              {(() => {
                const currentMaterials = currentPeriod?.materials || [];
                const sortedMaterials = [...currentMaterials].sort(
                  (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                // Find the first non-completed material index
                let firstIncompleteIdx = sortedMaterials.findIndex(
                  (m: any) => m.progress?.[0]?.status !== "COMPLETED"
                );

                // If all completed, firstIncompleteIdx = length (after last)
                if (firstIncompleteIdx === -1) firstIncompleteIdx = sortedMaterials.length;

                return (
                  <>
                    {sortedMaterials.map((material: any, idx: number) => {
                      const isCompleted = material.progress?.[0]?.status === "COMPLETED";
                      const isActive = idx === firstIncompleteIdx;
                      const isLocked = idx > firstIncompleteIdx;

                      return (
                        <div key={material.id} className="flex items-start gap-4 relative z-10">
                          {isCompleted ? (
                            <Link href={`/worker/materials/${material.id}`} className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm mt-0.5 hover:bg-emerald-600 transition-colors">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </Link>
                          ) : isActive ? (
                            <Link href={`/worker/materials/${material.id}`} className="w-5 h-5 rounded-full bg-[#FF3B30] flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5 hover:bg-red-700 transition-colors">
                              <span className="text-[9px] font-extrabold">{idx + 1}</span>
                            </Link>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-200 text-[10px] mt-0.5">
                              <Lock className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <div className="space-y-0.5 min-w-0 flex-1">
                            {isCompleted || isActive ? (
                              <Link
                                href={`/worker/materials/${material.id}`}
                                className={cn(
                                  "text-xs leading-tight hover:underline block truncate",
                                  isCompleted ? "font-bold text-zinc-900" : "font-bold text-[#FF3B30]"
                                )}
                              >
                                {material.title}
                              </Link>
                            ) : (
                              <h4 className="text-xs font-bold text-zinc-400 leading-tight truncate">
                                {material.title}
                              </h4>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Mendatang — always locked at bottom */}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-200 text-[10px] mt-0.5">
                        <Lock className="w-2.5 h-2.5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-zinc-400 leading-tight">
                          Mendatang
                        </h4>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}