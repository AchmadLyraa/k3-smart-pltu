"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markMaterialComplete } from "@/app/actions/worker";
import { cn } from "@/lib/utils";
import { ChevronLeft, Play, Clock, BookOpen, CheckCircle } from "lucide-react";
import Link from "next/link";

interface WorkerMaterialViewProps {
  material: any;
}

export default function WorkerMaterialView({ material }: WorkerMaterialViewProps) {
  const router = useRouter();
  const alreadyComplete = material.progress?.[0]?.status === "COMPLETED";
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(alreadyComplete);
  
  // State baru untuk mengontrol kapan video benar-benar berputar menggantikan thumbnail
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMarkComplete = async () => {
    if (isComplete) return;
    setLoading(true);
    try {
      const result = await markMaterialComplete(material.id);
      if (result.success) {
        setIsComplete(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const getVideoEmbed = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    // Tambahkan autoplay=1 agar saat diklik video langsung otomatis berputar
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
    if (url.includes("drive.google.com")) {
      const driveMatch = url.match(/\/d\/([^/]+)/);
      if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview?autoplay=1`;
    }
    return url;
  };

  // Fallback thumbnail jika database kosong agar styling tidak hancur
  const thumbnailUtama = material.thumbnail || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="h-[100dvh] px-4 w-full bg-zinc-50/40 flex flex-col justify-between overflow-hidden pt-5 pb-6 animate-in fade-in duration-300">
      
      {/* AREA KONTEN ATAS */}
      <div className="flex-1 flex flex-col justify-start space-y-5 min-h-0 overflow-y-auto no-scrollbar">
        
        {/* TOMBOL BACK (STANDALONE) */}
        <button 
          onClick={() => router.push("/worker/materials")}
          className="w-10 h-10 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-900 active:scale-95 transition-all shrink-0 shadow-sm"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* CARD 1: BLOK JUDUL & DESKRIPSI UTAMA */}
        <div className="bg-white rounded-[28px] border border-zinc-200/50 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] shrink-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-black text-zinc-900 tracking-tight leading-tight">
              {material.title}
            </h1>
            {isComplete && (
              <span className="bg-red-50 text-[#FF3B30] text-[10px] font-black px-2.5 py-1 rounded-full border border-red-100/60 uppercase shrink-0">
                Selesai ✓
              </span>
            )}
          </div>
          {material.description && (
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
              {material.description}
            </p>
          )}
        </div>

        {/* CARD 2: BLOK MEDIA VIDEO / THUMBNAIL DENGAN LOGIKA PREVIEW */}
        {material.mediaFiles && material.mediaFiles.length > 0 && material.type === "VIDEO" && (
          <div className="relative w-full h-44 rounded-[28px] overflow-hidden bg-zinc-950 border border-zinc-200/40 shadow-sm shrink-0">
            {isPlaying ? (
              /* TAMPILAN MODAL IFRAME JIKA TOMBOL NONTON SUDAH DITEKAN */
              <iframe
                width="100%"
                height="100%"
                src={getVideoEmbed(material.mediaFiles[0].url)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full object-cover animate-in fade-in duration-200"
              />
            ) : (
              /* TAMPILAN THUMBNAIL ASLI SEPERTI DI BERANDA */
              <div 
                onClick={() => setIsPlaying(true)}
                className="relative w-full h-full cursor-pointer group"
              >
                {/* Image Thumbnail Identik Beranda */}
                <img 
                  src={thumbnailUtama} 
                  alt={material.title}
                  className="w-full h-full object-cover opacity-50 group-hover:scale-[1.01] transition-all duration-300"
                />

                {/* OVERLAY GRADASI MERAH BRAND */}
                {!isComplete && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#FF3B30]/90 via-[#FF3B30]/40 to-transparent mix-blend-multiply" />
                )}

                {/* DETAIL DATA DI ATAS VIDEO */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 text-white">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-black tracking-tight drop-shadow-sm">{material.topic?.name || "Fire Safety Basics"}</h2>
                    <p className="text-[10px] text-white/80 font-medium max-w-[85%] leading-tight drop-shadow-sm">
                      Learn how to identify fire classes and operate extinguisher safety
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(true);
                      }}
                      className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full hover:bg-white/30 transition-all active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-white text-white" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Tonton Video</span>
                    </button>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-white/90">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{material.duration ? Math.ceil(material.duration / 60) : 3} menit</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CARD 3: BLOK KUIS TERKAIT MATERI */}
        {material.quizConfigs?.length > 0 && (
          <div className="bg-white rounded-[28px] border border-zinc-200/50 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] shrink-0 space-y-3">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
              Kuis Terkait Materi
            </h3>
            <div className="space-y-2">
              {material.quizConfigs.map((quiz: any) => {
                const lastSession = quiz.quizSessions?.[0];
                const hasPassed = lastSession?.passed;
                const hasFailed = lastSession && !lastSession.passed;

                return (
                  <div 
                    key={quiz.id} 
                    className={cn(
                      "p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors",
                      hasPassed ? "bg-emerald-50/40 border-emerald-100" : "bg-zinc-50/50 border-zinc-100"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-800 truncate">{quiz.name}</p>
                      {hasPassed ? (
                        <p className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 mt-0.5">
                          <CheckCircle className="w-3 h-3 stroke-[2.5]" /> Sudah lulus — {lastSession.score} pts
                        </p>
                      ) : hasFailed ? (
                        <p className="text-[10px] text-[#FF3B30] font-bold mt-0.5">
                          Belum lulus — {lastSession.score} pts
                        </p>
                      ) : (
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                          Kuis tersedia
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CARD 4: FOOTER ACTION BUTTON */}
      <div className="w-full shrink-0 pt-1">
        {isComplete && material.quizConfigs?.length > 0 ? (
          <Link href={`/worker/materials/${material.id}/quiz`} className="w-full">
            <button className="w-full h-12 bg-[#FF3B30] text-white rounded-3xl font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              Kerjakan Quiz
            </button>
          </Link>
        ) : (
          <button
            onClick={handleMarkComplete}
            disabled={loading || isComplete}
            className={cn(
              "w-full h-12 rounded-2xl font-black text-sm flex items-center justify-center transition-all shadow-sm",
              isComplete
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-zinc-950 hover:bg-zinc-900 text-white active:scale-[0.98]"
            )}
          >
            {loading ? "Menyimpan progress..." : "Tandai Selesai & Buka Quiz"}
          </button>
        )}
      </div>

    </div>
  );
}