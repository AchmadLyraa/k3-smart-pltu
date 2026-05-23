"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  BookOpen,
  CheckSquare,
  CircleDollarSign,
  Lock,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Material {
  id: string;
  title: string;
  description?: string;
  type: string;
  duration?: number;
  thumbnail?: string;
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

type TabType = "Overview" | "Materi" | "Quiz";

export default function WorkerMaterialList({
  periods,
  unassigned,
}: WorkerMaterialListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Materi");
  const [currentPeriodIdx, setCurrentPeriodIdx] = useState<number>(
    periods.findIndex((p) => p.isActive) !== -1 ? periods.findIndex((p) => p.isActive) : 0
  );

  const currentPeriod = periods[currentPeriodIdx] || periods[0];

  // State untuk menyimpan ID materi yang sedang di-klik/buka preview-nya di tempat (Khusus Tab Materi)
  const [openedMaterialId, setOpenedMaterialId] = useState<string | null>(
    currentPeriod?.materials?.[0]?.id || null
  );

  const completedIds = useMemo(() => {
    return [...periods.flatMap((p) => p.materials), ...unassigned]
      .filter((m) => m.progress?.[0]?.status === "COMPLETED")
      .map((m) => m.id);
  }, [periods, unassigned]);

  const handleMaterialClick = (materialId: string, isLocked: boolean) => {
    if (isLocked) return;
    setOpenedMaterialId((prevId) => (prevId === materialId ? null : materialId));
  };

  const handlePrevPeriod = () => {
    if (currentPeriodIdx > 0) {
      setCurrentPeriodIdx((prev) => prev - 1);
      setOpenedMaterialId(periods[currentPeriodIdx - 1]?.materials?.[0]?.id || null);
    }
  };

  const handleNextPeriod = () => {
    if (currentPeriodIdx < periods.length - 1) {
      setCurrentPeriodIdx((prev) => prev + 1);
      setOpenedMaterialId(periods[currentPeriodIdx + 1]?.materials?.[0]?.id || null);
    }
  };

  const stats = useMemo(() => {
    if (!currentPeriod) return { totalMaterials: 0, completedMaterials: 0, totalQuizzes: 0, completedQuizzes: 0, earnedPoints: 0, maxPoints: 0, percent: 0 };
    const mats = currentPeriod.materials || [];
    const totalMaterials = mats.length;
    const completedMaterials = mats.filter((m) => completedIds.includes(m.id)).length;

    let totalQuizzes = 0;
    let completedQuizzes = 0;
    mats.forEach((m) => {
      if (m.quizMeta) {
        totalQuizzes += m.quizMeta.count;
        completedQuizzes += m.quizMeta.completedCount;
      }
    });

    const earnedPoints = (completedMaterials * 10) + (completedQuizzes * 10);
    const maxPoints = (totalMaterials * 10) + (totalQuizzes * 10);
    const percent = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;

    return { totalMaterials, completedMaterials, totalQuizzes, completedQuizzes, earnedPoints, maxPoints, percent };
  }, [currentPeriod, completedIds]);

  // Logic formatting tanggal terpusat untuk kebutuhan admin periodik kuis
  const formatDateRange = (start: string, end: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const startDateFormatted = new Date(start).toLocaleDateString('id-ID', options);
    
    const startTime = new Date(start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
    const endTime = new Date(end).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');

    return {
      date: startDateFormatted,
      time: `${startTime} sd ${endTime}`
    };
  };

  const periodTime = currentPeriod 
    ? formatDateRange(currentPeriod.startDate, currentPeriod.endDate)
    : { date: "Jumat, 25 Maret 2026", time: "08.00 sd 16.30" };

  return (
    // Mengunci container agar fit screen tanpa scroll palsu di area global
    <div className="w-full space-y-5 px-1 pt-2 h-full flex flex-col justify-start overflow-hidden">
      
      {/* 1. SEMESTER CAROUSEL SELECTOR */}
      <div className="w-full flex items-center justify-between bg-white rounded-full border border-zinc-100 shadow-sm px-2 py-1.5 shrink-0">
        <button
          onClick={handlePrevPeriod}
          disabled={currentPeriodIdx === 0}
          className={cn(
            "w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 active:scale-95 transition-transform",
            currentPeriodIdx === 0 && "opacity-40 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <span className="text-sm font-extrabold text-zinc-900 tracking-tight">
          {currentPeriod?.name || "Semester 1"}
        </span>
        <button
          onClick={handleNextPeriod}
          disabled={currentPeriodIdx === periods.length - 1}
          className={cn(
            "w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 active:scale-95 transition-transform",
            currentPeriodIdx === periods.length - 1 && "opacity-40 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 2. SUB-MENU NAVIGATION TABS */}
      <div className="w-full flex items-center justify-between bg-zinc-100/50 p-1 rounded-full border border-zinc-200/40 shrink-0">
        {(["Overview", "Materi", "Quiz"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 text-center text-xs font-bold transition-all py-2 rounded-full",
              activeTab === tab
                ? "bg-[#FF3B30] text-white shadow-sm font-black scale-[1.02]"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/30"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. KONTEN BERDASARKAN TAB */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-4">
        
        {/* TAB OVERVIEW */}
        {activeTab === "Overview" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] p-5 shadow-sm border border-zinc-100 space-y-3">
              <div className="flex items-center justify-between bg-red-50/60 rounded-2xl p-4 border border-red-100/40">
                <div className="flex items-center gap-3">
                  <div className="text-[#FF3B30]"><BookOpen className="w-6 h-6" /></div>
                  <span className="text-sm font-black text-zinc-900">Materi</span>
                </div>
                <span className="text-base font-black text-[#FF3B30]">{stats.completedMaterials}/{stats.totalMaterials}</span>
              </div>

              <div className="flex items-center justify-between bg-red-50/60 rounded-2xl p-4 border border-red-100/40">
                <div className="flex items-center gap-3">
                  <div className="text-[#FF3B30]"><CheckSquare className="w-6 h-6" /></div>
                  <span className="text-sm font-black text-zinc-900">Quiz</span>
                </div>
                <span className="text-base font-black text-[#FF3B30]">{stats.completedQuizzes}/{stats.totalQuizzes}</span>
              </div>

              <div className="flex items-center justify-between bg-red-50/60 rounded-2xl p-4 border border-red-100/40">
                <div className="flex items-center gap-3">
                  <div className="text-[#FF3B30]"><CircleDollarSign className="w-6 h-6" /></div>
                  <span className="text-sm font-black text-zinc-900">Poin</span>
                </div>
                <span className="text-base font-black text-[#FF3B30]">{stats.earnedPoints}/{stats.maxPoints}</span>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-zinc-900">Progress saya</h3>
              <div className="relative flex items-center justify-center w-20 h-20">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-zinc-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#FF3B30] transition-all duration-500" strokeDasharray={`${stats.percent || 2}, 100`} strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute text-sm font-black text-[#FF3B30]">{stats.percent || 2}%</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB MATERI (DENGAN GARIS VERTIKAL TIMELINE) */}
        {activeTab === "Materi" && (
          <div className="relative pl-8 space-y-6 pt-2 pb-2 border-l-2 border-zinc-100 ml-4 animate-in fade-in duration-300">
            {currentPeriod.materials.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-zinc-200 bg-white py-12 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider -ml-8">
                Belum ada data pembelajaran pada semester ini.
              </div>
            ) : (
              currentPeriod.materials.map((material, idx) => {
                const isCompleted = completedIds.includes(material.id);
                const firstUncompletedIdx = currentPeriod.materials.findIndex((m) => !completedIds.includes(m.id));
                const isLocked = firstUncompletedIdx !== -1 && idx > firstUncompletedIdx;
                const isCurrentlyOpened = openedMaterialId === material.id;

                return (
                  <div key={material.id} className="relative w-full">
                    {/* INDIKATOR BULAT TIMELINE */}
                    <div 
                      className={cn(
                        "absolute -left-[43px] top-4 w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 transition-all shadow-sm cursor-pointer",
                        isCompleted && "bg-[#FF3B30] border-[#FF3B30] text-white",
                        isCurrentlyOpened && "bg-white border-[#FF3B30] text-[#FF3B30] scale-105",
                        (!isCompleted && !isCurrentlyOpened && !isLocked) && "bg-white border-zinc-400 text-zinc-600",
                        isLocked && "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                      )}
                      onClick={() => handleMaterialClick(material.id, isLocked)}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      ) : isLocked ? (
                        <Lock className="w-2.5 h-2.5" />
                      ) : (
                        <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                    </div>

                    {/* OPEN PREVIEW CARD */}
                    {isCurrentlyOpened && !isLocked && (
                      <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.03)] border border-zinc-100/50 transition-all duration-300 animate-in slide-in-from-top-2">
                        <div 
                          onClick={() => handleMaterialClick(material.id, isLocked)}
                          className="relative h-40 w-full bg-zinc-900 overflow-hidden cursor-pointer"
                        >
                          <img 
                            src={material.thumbnail || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop"} 
                            alt={material.title}
                            className="w-full h-full object-cover opacity-80"
                          />
                        </div>
                        
                        <div className="p-5 space-y-3">
                          <h3 
                            onClick={() => handleMaterialClick(material.id, isLocked)}
                            className="font-extrabold text-base text-zinc-900 leading-snug cursor-pointer hover:text-[#FF3B30]"
                          >
                            {material.title}
                          </h3>
                          <p className="text-xs text-zinc-500 font-normal leading-relaxed line-clamp-2">
                            {material.description || "Materi pembelajaran penting terkait K3 keselamatan kerja operasional."}
                          </p>

                          <div className="pt-2 flex items-center justify-between border-t border-zinc-50">
                            <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-bold">
                              <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5 text-zinc-400" /> 1</span>
                              <span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5 text-zinc-400" /> {material.duration ? Math.ceil(material.duration / 60) : 5} menit</span>
                            </div>
                            
                            <Link 
                              href={`/worker/materials/${material.id}`}
                              className="bg-[#FF3B30] text-white text-xs font-black px-5 py-2.5 rounded-full shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Lihat full
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CLOSE COMPACT ROW */}
                    {!isCurrentlyOpened && !isLocked && (
                      <div 
                        onClick={() => handleMaterialClick(material.id, isLocked)}
                        className="bg-white rounded-[24px] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] border border-zinc-100/80 flex items-center justify-between cursor-pointer hover:border-zinc-200 transition-all"
                      >
                        <div className="space-y-1 min-w-0 flex-1 pr-2">
                          <h4 className="text-sm font-bold text-zinc-800 truncate">{material.title}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium">
                            <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5 text-zinc-300" /> 1</span>
                            <span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.3 text-zinc-300" /> {material.duration ? Math.ceil(material.duration / 60) : 5} menit</span>
                          </div>
                        </div>
                        
                        {isCompleted ? (
                          <div className="bg-red-50 text-[#FF3B30] font-black text-xs px-4 py-2 rounded-full border border-red-100 shrink-0">
                            Selesai ✓
                          </div>
                        ) : (
                          <div className="bg-zinc-50 text-zinc-600 font-bold text-xs px-4 py-2 rounded-full border border-zinc-100 shrink-0">
                            Buka
                          </div>
                        )}
                      </div>
                    )}

                    {/* LOCKED ROW */}
                    {isLocked && (
                      <div className="bg-white/60 opacity-60 rounded-[24px] p-4 border border-zinc-100 flex items-center justify-between select-none cursor-not-allowed">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-zinc-400">Materi lainnya</h4>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-300 font-medium">
                            <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> 1</span>
                            <span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> 5 menit</span>
                          </div>
                        </div>
                        <div className="bg-zinc-100 text-zinc-500 font-black text-xs px-3 py-1.5 rounded-full">
                          + 20 Poin
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB QUIZ (SUPER MINIMALIS BERSIH - TANPA TIMELINE & BERDIRI SENDIRI SESUAI DESAIN) */}
        {activeTab === "Quiz" && (
          <div className="w-full flex flex-col items-center justify-center pt-2 px-1 animate-in zoom-in-95 duration-200">
            <div className="w-full bg-white rounded-[40px] border border-zinc-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.02)] p-8 flex flex-col items-center text-center space-y-6">
              
              {/* 1. ILUSTRASI UTAMA TAB QUIZ */}
              <div className="w-full max-w-[200px] aspect-square relative flex items-center justify-center">
                <img 
                  src="https://illustrations.popsy.co/blue/test-passing.svg" 
                  alt="Quiz Illustration"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 2. AREA JUDUL STATUS DAN ACTION BUTTON */}
              <div className="space-y-4 w-full">
                <h3 className="text-sm font-black text-zinc-500 uppercase tracking-wider">
                  Quiz Telah Dibuka
                </h3>
                
                {/* Tombol Besar Utama Eksekusi Kuis */}
                <div className="w-full">
                  <Link 
                    href={currentPeriod?.materials?.[0] ? `/worker/materials/${currentPeriod.materials[0].id}/quiz` : "#"} 
                    className="block w-full"
                  >
                    <button className="w-full bg-[#FF3B30] text-white font-black text-base py-3.5 rounded-3xl shadow-md active:scale-[0.98] transition-all">
                      Kerjakan Sekarang!
                    </button>
                  </Link>
                </div>
              </div>

              {/* 3. BLOK INFORMASI WAKTU OPERASIONAL (ADMIN SETTING) */}
              <div className="pt-4 border-t border-zinc-100 w-full">
                <p className="text-xs font-bold text-zinc-800 leading-relaxed tracking-tight">
                  {periodTime.date}
                </p>
                <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">
                  {periodTime.time}
                </p>
              </div>

            </div>

            {/* SYARAT KETENTUAN BONUS SKOR PENGERJAAN CEPAT */}
            <div className="mt-5 px-6 text-center">
              <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                *Semakin cepat Anda menyelesaikan evaluasi kuis ini dengan benar,<br /> 
                kesempatan akumulasi bonus poin tambahan akan semakin tinggi.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}