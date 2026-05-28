"use client";

import { useState, useMemo } from "react";
import WorkerQuizCampaignSection from "./worker-quiz-campaign-section";
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
  Award,
  TrendingUp,
  Target,
  ShieldCheck,
  BarChart3,
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
  quizConfigs?: Array<{
    id: string;
    quizSessions: Array<{
      id: string;
      passed: boolean;
    }>;
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
    if (!currentPeriod) {
      return {
        totalMaterials: 0,
        completedMaterials: 0,
        totalQuizzes: 0,
        completedQuizzes: 0,
        totalPassedQuizzes: 0,
        earnedPoints: 0,
        maxPoints: 0,
        percent: 0,
        quizAccuracy: 0,
      };
    }
    const mats = currentPeriod.materials || [];
    const totalMaterials = mats.length;
    const completedMaterials = mats.filter((m) => completedIds.includes(m.id)).length;

    let totalQuizzes = 0;
    let completedQuizzes = 0;
    let totalPassedQuizzes = 0;

    mats.forEach((m) => {
      if (m.quizMeta) {
        totalQuizzes += m.quizMeta.count;
        completedQuizzes += m.quizMeta.completedCount;
      }
      if (m.quizConfigs) {
        m.quizConfigs.forEach((qc) => {
          if (qc.quizSessions && qc.quizSessions.length > 0) {
            const hasPassed = qc.quizSessions.some((qs) => qs.passed);
            if (hasPassed) {
              totalPassedQuizzes += 1;
            }
          }
        });
      }
    });

    const earnedPoints = (completedMaterials * 10) + (completedQuizzes * 10);
    const maxPoints = (totalMaterials * 10) + (totalQuizzes * 10);
    const percent = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
    const quizAccuracy = completedQuizzes > 0 ? Math.round((totalPassedQuizzes / completedQuizzes) * 100) : 0;

    return {
      totalMaterials,
      completedMaterials,
      totalQuizzes,
      completedQuizzes,
      totalPassedQuizzes,
      earnedPoints,
      maxPoints,
      percent,
      quizAccuracy,
    };
  }, [currentPeriod, completedIds]);

  const topicStats = useMemo(() => {
    if (!currentPeriod || !currentPeriod.materials) return [];
    const mats = currentPeriod.materials;
    
    // Group by topic name
    const topicMap: Record<string, { total: number; completed: number }> = {};
    
    mats.forEach((m) => {
      const topicName = m.topic?.name || "Umum";
      if (!topicMap[topicName]) {
        topicMap[topicName] = { total: 0, completed: 0 };
      }
      topicMap[topicName].total += 1;
      if (completedIds.includes(m.id)) {
        topicMap[topicName].completed += 1;
      }
    });
    
    return Object.entries(topicMap).map(([name, data]) => {
      const percent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
      return {
        name,
        total: data.total,
        completed: data.completed,
        percent,
      };
    });
  }, [currentPeriod, completedIds]);

  const competence = useMemo(() => {
    const p = stats.percent;
    if (p === 100) {
      return {
        title: "K3 Safety Champion",
        color: "bg-emerald-500 text-white border-emerald-600 shadow-emerald-200/50",
        bgLight: "bg-emerald-50/50 border-emerald-100/60",
        textColor: "text-emerald-600",
        ringColor: "text-emerald-500",
        ringHex: "#10b981",
        iconColor: "text-emerald-500",
        icon: ShieldCheck,
        desc: "Sempurna! Anda telah menyelesaikan seluruh materi & kuis K3 periode ini dengan tingkat kepatuhan 100%. Luar biasa!",
      };
    } else if (p >= 76) {
      return {
        title: "K3 Safety Advanced",
        color: "bg-emerald-600 text-white border-emerald-700 shadow-emerald-100/50",
        bgLight: "bg-emerald-50/30 border-emerald-100/30",
        textColor: "text-emerald-600",
        ringColor: "text-emerald-600",
        ringHex: "#059669",
        iconColor: "text-emerald-600",
        icon: Award,
        desc: "Sangat baik! Tinggal sedikit lagi untuk mencapai kepatuhan K3 100%. Tetap pertahankan kedisiplinan belajar Anda!",
      };
    } else if (p >= 41) {
      return {
        title: "K3 Safety Competent",
        color: "bg-amber-500 text-white border-amber-600 shadow-amber-100/50",
        bgLight: "bg-amber-50/40 border-amber-100/40",
        textColor: "text-amber-600",
        ringColor: "text-amber-500",
        ringHex: "#f59e0b",
        iconColor: "text-amber-500",
        icon: TrendingUp,
        desc: "Bagus! Anda sedang berprogres dengan baik. Selesaikan sisa materi untuk memperkuat pemahaman K3 Anda di lapangan.",
      };
    } else {
      return {
        title: "K3 Safety Novice",
        color: "bg-red-500 text-white border-red-600 shadow-red-100/50",
        bgLight: "bg-red-50/40 border-red-100/40",
        textColor: "text-red-600",
        ringColor: "text-[#FF3B30]",
        ringHex: "#FF3B30",
        iconColor: "text-[#FF3B30]",
        icon: Target,
        desc: "Ayo mulai! Keamanan kerja adalah prioritas utama kita. Segera selesaikan materi & kuis K3 pertama Anda.",
      };
    }
  }, [stats.percent]);

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
    <div className="w-full space-y-4 px-2 pt-2 flex flex-col justify-start">
      
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
      <div className="w-full flex items-center justify-between bg-white p-1 rounded-full border border-zinc-200/40 shrink-0">
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
      <div className="w-full pb-4">
        
        {/* TAB OVERVIEW */}
        {activeTab === "Overview" && (
          <div className="space-y-5">
            {/* 1. CARD PROGRESS & PERFORMA UTAMA */}
            <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, border: '1px solid #e4e4e7' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#FF3B30]" />
                  <h3 style={{ fontSize: 14, fontWeight: 900, color: '#18181b' }}>Performa K3 Saya</h3>
                </div>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#a1a1aa', backgroundColor: '#f4f4f5', padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {currentPeriod?.name || "Semester"}
                </span>
              </div>

              {/* Progress Ring & Competence Info */}
              <div className="flex items-center gap-5" style={{ padding: 16, borderRadius: 16, backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}>
                {/* Circular Gauge */}
                <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
                  <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                    <path stroke="#E4E4E7" strokeWidth="3.2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path 
                      strokeDasharray={`${stats.percent || 2}, 100`} 
                      strokeWidth="3.8" 
                      strokeLinecap="round"
                      stroke={competence?.ringHex || "#FF3B30"} 
                      fill="none" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#18181b', lineHeight: 1 }}>{stats.percent || 0}%</span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#a1a1aa', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Kepatuhan</span>
                  </div>
                </div>

                {/* Badge & Level */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Level Kompetensi</div>
                  {competence && (
                    <div className={cn("text-xs font-black px-2.5 py-1 rounded-full border flex items-center gap-1 w-fit", competence.color)}>
                      <competence.icon className="w-3.5 h-3.5" />
                      {competence.title}
                    </div>
                  )}
                  <p style={{ fontSize: 11, color: '#71717a', fontWeight: 500, lineHeight: 1.5, marginTop: 8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {competence?.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. BAGAN VISUAL TOPIK K3 (Mini Horizontal Bar Chart) */}
            <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, border: '1px solid #e4e4e7' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                <BarChart3 className="w-5 h-5 text-[#FF3B30]" />
                <h3 style={{ fontSize: 14, fontWeight: 900, color: '#18181b' }}>Kepatuhan per Topik K3</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {topicStats.length > 0 ? (
                  topicStats.map((topic, i) => {
                    const barHex = 
                      topic.percent === 100 ? "#10b981" :
                      topic.percent >= 50 ? "#f59e0b" : "#FF3B30";

                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between" style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                          <span style={{ color: '#3f3f46', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{topic.name}</span>
                          <span style={{ color: '#71717a', fontWeight: 800, flexShrink: 0 }}>
                            {topic.completed}/{topic.total} <span style={{ fontSize: 10, fontWeight: 500, color: '#a1a1aa' }}>({topic.percent}%)</span>
                          </span>
                        </div>
                        <div style={{ width: '100%', height: 10, backgroundColor: '#f4f4f5', borderRadius: 999, overflow: 'hidden' }}>
                          <div 
                            style={{ height: '100%', borderRadius: 999, backgroundColor: barHex, width: `${Math.max(topic.percent, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Belum ada topik materi terdaftar
                  </div>
                )}
              </div>
            </div>

            {/* 3. STATISTIK DETAIL — menggunakan flexbox, bukan CSS grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {/* Box 1: Materi */}
              <div style={{ width: 'calc(50% - 7px)', backgroundColor: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e4e4e7', boxSizing: 'border-box' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <div style={{ padding: 8, backgroundColor: '#fef2f2', color: '#FF3B30', borderRadius: 12 }}><BookOpen className="w-4 h-4" /></div>
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Materi</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#09090b', lineHeight: 1 }}>
                  {stats.completedMaterials}/{stats.totalMaterials}
                </div>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', marginTop: 4 }}>Selesai Dibaca</p>
              </div>

              {/* Box 2: Quiz */}
              <div style={{ width: 'calc(50% - 7px)', backgroundColor: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e4e4e7', boxSizing: 'border-box' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <div style={{ padding: 8, backgroundColor: '#fef2f2', color: '#FF3B30', borderRadius: 12 }}><CheckSquare className="w-4 h-4" /></div>
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Kuis</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#09090b', lineHeight: 1 }}>
                  {stats.completedQuizzes}/{stats.totalQuizzes}
                </div>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', marginTop: 4 }}>Telah Dikerjakan</p>
              </div>

              {/* Box 3: Poin */}
              <div style={{ width: 'calc(50% - 7px)', backgroundColor: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e4e4e7', boxSizing: 'border-box' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <div style={{ padding: 8, backgroundColor: '#fef2f2', color: '#FF3B30', borderRadius: 12 }}><CircleDollarSign className="w-4 h-4" /></div>
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Poin K3</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#09090b', lineHeight: 1 }}>
                  {stats.earnedPoints}/{stats.maxPoints}
                </div>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', marginTop: 4 }}>Akumulasi Poin</p>
              </div>

              {/* Box 4: Akurasi Kuis */}
              <div style={{ width: 'calc(50% - 7px)', backgroundColor: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e4e4e7', boxSizing: 'border-box' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <div style={{ padding: 8, backgroundColor: '#fef2f2', color: '#FF3B30', borderRadius: 12 }}><Target className="w-4 h-4" /></div>
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Kelulusan</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#09090b', lineHeight: 1 }}>
                  {stats.quizAccuracy}%
                </div>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', marginTop: 4 }}>Akurasi Kuis Lulus</p>
              </div>
            </div>

          </div>
        )}

        {/* TAB MATERI — TIMELINE DENGAN MEKANISME 2 KLIK (compact → preview → lihat full) */}
        {activeTab === "Materi" && (
          <div className="relative pl-8 pt-2 pb-2 border-l-2 border-zinc-100 ml-4 animate-in fade-in duration-300">
            {(() => {
              const sortedMaterials = [...(currentPeriod.materials || [])].sort(
                (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );

              if (sortedMaterials.length === 0) {
                return (
                  <div className="rounded-[28px] border border-dashed border-zinc-200 bg-white py-12 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider -ml-8">
                    Belum ada data pembelajaran pada semester ini.
                  </div>
                );
              }

              // Find first incomplete material index
              let firstIncompleteIdx = sortedMaterials.findIndex(
                (m) => !completedIds.includes(m.id)
              );
              if (firstIncompleteIdx === -1) firstIncompleteIdx = sortedMaterials.length;

              return (
                <>
                  {sortedMaterials.map((material, idx) => {
                    const isCompleted = idx < firstIncompleteIdx;
                    const isActive = idx === firstIncompleteIdx;
                    const isLocked = idx > firstIncompleteIdx;
                    const isCurrentlyOpened = openedMaterialId === material.id;

                    return (
                      <div key={material.id} className="relative w-full mb-6">
                        {/* INDIKATOR BULAT TIMELINE */}
                        <div 
                          className={cn(
                            "absolute -left-[43px] top-4 w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 transition-all shadow-sm cursor-pointer",
                            isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                            isCurrentlyOpened && "bg-white border-[#FF3B30] text-[#FF3B30] scale-105",
                            (isActive && !isCurrentlyOpened) && "bg-[#FF3B30] border-[#FF3B30] text-white",
                            isLocked && "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                          )}
                          onClick={() => handleMaterialClick(material.id, isLocked)}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                          ) : isLocked ? (
                            <Lock className="w-2.5 h-2.5" />
                          ) : (
                            <span className="text-[11px] font-extrabold">{idx + 1}</span>
                          )}
                        </div>

                        {/* LOCKED ROW */}
                        {isLocked && (
                          <div className="bg-white/60 opacity-60 rounded-[24px] p-4 border border-zinc-100 flex items-center justify-between select-none cursor-not-allowed">
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-zinc-400 truncate">{material.title}</h4>
                              <div className="flex items-center gap-3 text-[11px] text-zinc-300 font-medium">
                                <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> 1</span>
                                <span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> {material.duration ? Math.ceil(material.duration / 60) : 5} menit</span>
                              </div>
                            </div>
                            <div className="bg-zinc-100 text-zinc-500 font-black text-xs px-3 py-1.5 rounded-full">
                              + 20 Poin
                            </div>
                          </div>
                        )}

                        {/* UNIFIED CARD — untuk non-locked */}
                        {!isLocked && (
                          <div 
                            className={cn(
                              "bg-white border transition-all duration-300 ease-in-out overflow-hidden transform-gpu",
                              isCurrentlyOpened
                                ? "rounded-[32px] shadow-[0_10px_25px_rgba(0,0,0,0.03)] border-zinc-100/50"
                                : "rounded-[24px] shadow-[0_4px_15px_rgba(0,0,0,0.01)] border-zinc-100/80 hover:border-zinc-200 cursor-pointer"
                            )}
                          >
                            {/* Thumbnail (only visible when opened) */}
                            <div
                              onClick={() => handleMaterialClick(material.id, isLocked)}
                              className={cn(
                                "relative w-full bg-zinc-900 overflow-hidden transition-all duration-300 ease-in-out cursor-pointer",
                                isCurrentlyOpened ? "h-40 opacity-100" : "h-0 opacity-0"
                              )}
                            >
                              <img 
                                src={material.thumbnail || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop"} 
                                alt={material.title}
                                className="w-full h-full object-cover opacity-80"
                              />
                            </div>

                            {/* Card Body */}
                            <div className="p-4 space-y-3">
                              {/* Header info (Always visible, but layout adjusts when opened) */}
                              <div 
                                onClick={() => handleMaterialClick(material.id, isLocked)}
                                className={cn(
                                  "min-w-0 flex-1",
                                  !isCurrentlyOpened && "flex items-center justify-between gap-2"
                                )}
                              >
                                <div className="space-y-1 min-w-0 flex-1">
                                  <h4 
                                    className={cn(
                                      "font-extrabold leading-snug cursor-pointer transition-colors hover:text-[#FF3B30] truncate-none",
                                      isCurrentlyOpened ? "text-base text-zinc-900" : "text-sm text-zinc-800 truncate"
                                    )}
                                  >
                                    {material.title}
                                  </h4>
                                  
                                  {/* Play and Clock icons (Always visible) */}
                                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium">
                                    <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5 text-zinc-300" /> 1</span>
                                    <span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5 text-zinc-300" /> {material.duration ? Math.ceil(material.duration / 60) : 5} menit</span>
                                  </div>
                                </div>

                                {/* Compact state action button (hidden when opened) */}
                                {!isCurrentlyOpened && (
                                  <div className="shrink-0 ml-2">
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
                              </div>

                              {/* Expanded Description and Link (visible when opened) */}
                              <div
                                className={cn(
                                  "transition-all duration-300 ease-in-out overflow-hidden space-y-3",
                                  isCurrentlyOpened ? "max-h-[200px] opacity-100 pt-1" : "max-h-0 opacity-0 pointer-events-none"
                                )}
                              >
                                <p className="text-xs text-zinc-500 font-normal leading-relaxed line-clamp-3">
                                  {material.description || "Materi pembelajaran penting terkait K3 keselamatan kerja operasional."}
                                </p>

                                <div className="pt-2 flex items-center justify-between border-t border-zinc-50">
                                  <span className="text-[11px] text-zinc-400 font-bold">
                                    {isCompleted ? "Status: Selesai" : "Status: Belum Selesai"}
                                  </span>
                                  
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
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* MENDATANG — always locked at bottom */}
                  <div className="relative w-full mb-6">
                    <div className="absolute -left-[43px] top-4 w-6 h-6 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center z-10 text-zinc-400">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                    <div className="bg-white/60 opacity-60 rounded-[24px] p-4 border border-zinc-100 select-none cursor-not-allowed">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-zinc-400">Mendatang</h4>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-300 font-medium">
                          <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> -</span>
                          <span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> - menit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* TAB QUIZ — QUIZ CAMPAIGN + QUIZ MATERI */}
        {activeTab === "Quiz" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* QUIZ CAMPAIGN SECTION — QUIZ KHUSUS BULANAN */}
            <WorkerQuizCampaignSection />

            {/* QUIZ MATERI — LINK KE QUIZ TIAP MATERI */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <CheckSquare className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-black text-zinc-800 uppercase tracking-wider">
                  Quiz Pemahaman Materi
                </h3>
              </div>
              <div className="bg-white rounded-[28px] border border-zinc-200/50 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] space-y-3">
                {currentPeriod?.materials?.length > 0 ? (
                  <div className="space-y-2">
                    {currentPeriod.materials.map((material) => (
                      <Link
                        key={material.id}
                        href={`/worker/materials/${material.id}/quiz`}
                        className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50/50 border border-zinc-100 hover:bg-zinc-100 transition-all active:scale-[0.99]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-800 truncate">
                            {material.title}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                            {material.quizMeta?.count || 0} quiz tersedia
                          </p>
                        </div>
                        <div className="text-xs font-bold shrink-0 ml-2 flex items-center gap-1">
                          {!material.quizMeta || material.quizMeta.count === 0 ? (
                            <span className="text-zinc-300">Tidak ada quiz</span>
                          ) : material.quizMeta.allDone ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                            </span>
                          ) : (
                            <span className="text-[#FF3B30]">Kerjakan →</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 font-medium text-center py-4">
                    Belum ada materi dengan quiz tersedia.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}