"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image"
import {
  Home,
  BookOpen,
  Trophy,
  User,
} from "lucide-react";

import { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/worker/notification-bell";

const MENUS = [
  {
    label: "Beranda",
    href: "/worker/home",
    icon: Home,
  },
  {
    label: "Materi",
    href: "/worker/materials",
    icon: BookOpen,
  },
  {
    label: "Peringkat",
    href: "/worker/leaderboard",
    icon: Trophy,
  },
  {
    label: "Profil",
    href: "/worker/profile",
    icon: User,
  },
];

// Halaman yang tidak menampilkan bottom navbar
const HIDDEN_PATHS = [
  "/worker/materials/",
  "/worker/reward-users",
  "/worker/quiz-history",
];

interface Props {
  session: Session;
}

export default function WorkerMobileNavbar({ session }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/worker/home";

  // Sembunyikan navbar di halaman detail/full
  const shouldHide = HIDDEN_PATHS.some((path) => pathname.startsWith(path));
  if (shouldHide) return null;

  return (
    <>
      {/* TOP NAVBAR (HANYA MUNCUL DI BERANDA / HOME) */}
      {isHome && (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-6 pt-5 pb-4">
            
            {/* LOGO ASLI ANDA (TETAP DIPERTAHANKAN) */}
            <Link
              href="/worker/home"
              className="flex items-center gap-3 shrink-0 transition-transform duration-200 active:scale-95"
            >
              <div className="relative h-10 w-32 overflow-hidden">
                <Image
                  src="/images/logonew-k3.svg"
                  alt="K3 SMART"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* RIGHT - NOTIFIKASI */}
            <div className="flex items-center justify-center text-[#FF3B30] stroke-red-500">
              <NotificationBell />
            </div>

          </div>
        </header>
      )}

      {/* BOTTOM NAVBAR (FLOATING PREMIUM DOCK - HITAM SOLID OVAL) */}
      <nav className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:w-[448px] md:-translate-x-1/2 z-50 rounded-full bg-black shadow-[0_10px_30px_rgba(0,0,0,0.3)] px-2 py-1">
        <div className="flex h-14 w-full items-center justify-between px-2">
          {MENUS.map((menu) => {
            const Icon = menu.icon;
            const active = pathname === menu.href || pathname.startsWith(`${menu.href}/`);

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-full text-xs font-bold transition-all duration-300 py-2 px-4",
                  active 
                    ? "bg-[#FF3B30] text-white shadow-md scale-105" 
                    : "text-white/70 hover:text-white"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", active ? "stroke-[2.5]" : "stroke-[2]")} />
                
                {active && (
                  <span className="text-[11px] font-bold tracking-tight">
                    {menu.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}