"use client";

import { useState, useMemo } from "react";
import { LeaderboardUser } from "@/app/actions/leaderboard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardClientProps {
  initialData: LeaderboardUser[];
  currentUserId: string;
}

export default function LeaderboardClient({ initialData, currentUserId }: LeaderboardClientProps) {
  // Mengubah default active tab menjadi "semester" sesuai opsi kanan di gambar referensi
  const [activeTab, setActiveTab] = useState<"bulanan" | "semester">("semester");

  // Pemetaan nilai poin berdasarkan tab yang dipilih
  const getSortValue = (user: LeaderboardUser) => {
    return activeTab === "semester" ? user.activePoints : user.historicalPoints; // Simulasi data bulanan/semester
  };

  // Pengurutan data pekerja
  const sortedData = useMemo(() => {
    return [...initialData].sort((a, b) => {
      const valA = getSortValue(a);
      const valB = getSortValue(b);
      if (valB !== valA) return valB - valA;
      return a.name.localeCompare(b.name);
    });
  }, [initialData, activeTab]);

  // Pagination Setup (Sesuai mockup bawah: ikon panah, angka halaman aktif, dan sisa angka abu-abu)
  const pageSize = 5; // Ukuran baris diperkecil agar pas dalam layar mockup handphone
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(Math.max(sortedData.length - 3, 0) / pageSize) || 1;

  // Memisahkan Top 3 utama untuk komponen Podium
  const top3 = useMemo(() => sortedData.slice(0, 3), [sortedData]);
  
  // Data list sisa peringkat setelah dipotong Top 3
  const remainingData = useMemo(() => sortedData.slice(3), [sortedData]);
  const paginatedData = useMemo(() => {
    return remainingData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [remainingData, currentPage]);

  // Penyusunan struktur visual urutan Podium dari kiri ke kanan: Rank 2, Rank 1, Rank 3
  const podiumOrder = useMemo(() => {
    const order = [];
    if (top3[1]) order.push({ ...top3[1], rank: 2 });
    if (top3[0]) order.push({ ...top3[0], rank: 1 });
    if (top3[2]) order.push({ ...top3[2], rank: 3 });
    return order;
  }, [top3]);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="w-full flex flex-col justify-start space-y-5 px-1 pt-0 pb-20 animate-in fade-in duration-300">
      
      {/* JUDUL UTAMA HALAMAN */}
      <h1 className="text-2xl font-black text-center text-zinc-900 tracking-tight">
        Papan Peringkat
      </h1>

      {/* TABS SELECTOR (Pill minimalis putih & merah terang) */}
      <div className="w-full flex items-center justify-between bg-white p-1.5 rounded-full border border-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => { setActiveTab("bulanan"); setCurrentPage(1); }}
          className={cn(
            "flex-1 text-center text-xs font-bold py-2.5 rounded-full transition-all duration-200",
            activeTab === "bulanan" ? "bg-[#FF3B30] text-white font-black" : "text-zinc-800"
          )}
        >
          All-time
        </button>
        <button
          onClick={() => { setActiveTab("semester"); setCurrentPage(1); }}
          className={cn(
            "flex-1 text-center text-xs font-bold py-2.5 rounded-full transition-all duration-200",
            activeTab === "semester" ? "bg-[#FF3B30] text-white font-black" : "text-zinc-800"
          )}
        >
          Semester
        </button>
      </div>

      {/* 3D CURVED PODIUM SECTION */}
      {top3.length > 0 && (
        <div className="w-full flex justify-center items-end gap-3 pt-6 pb-2 px-2 relative max-w-sm mx-auto">
          {podiumOrder.map((user) => {
            const points = getSortValue(user);

            // Styling modular berdasarkan tingkat nomor rank podium
            let config = {
              height: "h-20",
              gradient: "from-[#FF5E55] to-[#FF3B30]/90",
              avatarSize: "w-14 h-14",
              textOrder: "mt-1",
              fontSize: "text-lg",
              avatarRing: "ring-[3px] ring-emerald-500",
            };

            if (user.rank === 1) {
              config = {
                height: "h-28",
                gradient: "from-[#FF6B6B] to-[#FF4A40]",
                avatarSize: "w-20 h-20",
                textOrder: "-mt-1",
                fontSize: "text-xl",
                avatarRing: "ring-[4px] ring-amber-400 scale-105 z-10",
              };
            } else if (user.rank === 2) {
              config = {
                height: "h-24",
                gradient: "from-[#FF5E55] to-[#FF3B30]/90",
                avatarSize: "w-16 h-16",
                textOrder: "mt-0",
                fontSize: "text-lg",
                avatarRing: "ring-[3px] ring-emerald-500",
              };
            } else if (user.rank === 3) {
              config = {
                height: "h-18",
                gradient: "from-[#FF736B] to-[#FF4D44]",
                avatarSize: "w-14 h-14",
                textOrder: "mt-2",
                fontSize: "text-base",
                avatarRing: "ring-[3px] ring-indigo-400",
              };
            }

            return (
              <div key={user.id} className="flex-1 flex flex-col items-center relative min-w-0">
                {/* Lingkaran Avatar User */}
                <div className="relative mb-2">
                  <Avatar className={cn(config.avatarSize, config.avatarRing, "bg-white shadow-md transition-transform")}>
                    <AvatarFallback className="text-xs font-black bg-zinc-100 text-zinc-700">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Username & Sub-text Identitas */}
                <div className="text-center w-full px-0.5 z-10 mb-1">
                  <p className="text-[11px] font-black text-zinc-900 truncate">
                    @{user.name.toLowerCase().replace(/\s+/g, "")}
                  </p>
                  <p className="text-[9px] font-bold text-zinc-400 truncate uppercase tracking-tight">
                    {user.division || "SDM"}
                  </p>
                </div>

                {/* Struktur Tiang Podia Melengkung */}
                <div
                  className={cn(
                    "w-full rounded-t-[24px] bg-gradient-to-b text-white flex flex-col items-center justify-center p-2 shadow-md border-t border-white/20",
                    config.height,
                    config.gradient
                  )}
                >
                  <span className="text-base font-black leading-none drop-shadow-sm">{user.rank}</span>
                  <span className={cn("font-bold tracking-tighter opacity-90 font-mono mt-0.5", config.fontSize)}>
                    {points}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING LIST RANKINGS BARIS TERPISAH (Gaya Kapsul Lonjong Putih) */}
      <div className="w-full flex flex-col space-y-3.5 pt-2">
        {paginatedData.length === 0 ? (
          <div className="py-10 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Belum ada peringkat pekerja lainnya.
          </div>
        ) : (
          paginatedData.map((user, index) => {
            const absoluteRank = 3 + (currentPage - 1) * pageSize + index + 1;
            const points = getSortValue(user);
            const isCurrentUser = user.id === currentUserId;

            return (
              <div
                key={user.id}
                className={cn(
                  "w-full bg-white rounded-[32px] p-4 flex items-center justify-between border transition-all shadow-[0_4px_15px_rgba(0,0,0,0.015)]",
                  isCurrentUser 
                    ? "border-[#FF3B30] bg-red-50/[0.02] shadow-sm" 
                    : "border-zinc-100/80 hover:border-zinc-200"
                )}
              >
                {/* Sisi Kiri: Angka Posisi, Avatar Bulat, Detail Teks */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Angka No Peringkat */}
                  <span className="text-xs font-black text-zinc-900 w-5 text-center font-mono shrink-0">
                    {absoluteRank}
                  </span>

                  {/* Foto Profil / Inisial */}
                  <Avatar className="w-10 h-10 border border-zinc-100 shrink-0">
                    <AvatarFallback className="text-xs font-black bg-zinc-100 text-zinc-600">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Nama Pekerja & Unit Kerja */}
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-extrabold text-zinc-900 truncate tracking-tight flex items-center gap-1.5">
                      {user.name.toLowerCase().includes("@") ? user.name : `${user.name.toLowerCase().replace(/\s+/g, "")}@payroll.com`}
                      {isCurrentUser && (
                        <span className="text-[8px] bg-[#FF3B30] text-white px-1.5 py-0.5 rounded-full font-black uppercase">Anda</span>
                      )}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 truncate">
                      {user.unit || "IT Support"}
                    </p>
                  </div>
                </div>

                {/* Sisi Kanan: Tampilan Total Skor Poin */}
                <div className="text-right shrink-0 pl-2">
                  <span className="text-xs font-black font-mono text-zinc-900 tracking-tight">
                    {points}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PANELS NAVIGASI PAGINATION KOMPAK (Bulat Minimalis Abu-Abu) */}
      {totalPages > 1 && (
        <div className="w-full flex items-center justify-center space-x-3.5 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={cn(
              "w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 active:scale-90 transition-all",
              currentPage === 1 && "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Deretan Indikator Angka Halaman */}
          <div className="flex items-center space-x-2 text-xs font-mono font-bold">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  "w-5 text-center transition-all",
                  currentPage === pageNum 
                    ? "text-[#FF3B30] font-black scale-110" 
                    : "text-zinc-300 hover:text-zinc-400"
                )}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={cn(
              "w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 active:scale-90 transition-all",
              currentPage === totalPages && "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

    </div>
  );
}