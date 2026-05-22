"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image"
import {
  Home,
  BookOpen,
  Trophy,
  Gift,
  History,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";

import { Session } from "next-auth";

import { cn } from "@/lib/utils";

import { NotificationBell } from "@/components/worker/notification-bell";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MENUS = [
  {
    label: "Home",
    href: "/worker/home",
    icon: Home,
  },
  {
    label: "Reward",
    href: "/worker/reward-users",
    icon: Gift,
  },
  {
    label: "History",
    href: "/worker/quiz-history",
    icon: History,
  },
  {
    label: "Rank",
    href: "/worker/leaderboard",
    icon: Trophy,
  },
];

interface Props {
  session: Session;
}

export default function WorkerMobileNavbar({ session }: Props) {
  const pathname = usePathname();

  const name = session.user?.name ?? session.user?.email ?? "Worker";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          {/* LOGO */}
          <Link
  href="/worker/home"
  className="flex items-center gap-3 shrink-0"
>
  <div className="relative h-28 w-28 overflow-hidden rounded-2xl">
    <Image
      src="/images/logok3new.png"
      alt="K3 SMART"
      fill
      className="object-contain"
      priority
    />
  </div>

</Link>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <NotificationBell />

            {/* PROFILE */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-2 py-1.5 transition hover:bg-zinc-50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                    {initials}
                  </div>

                  <div className="hidden text-left sm:block">
                    <p className="max-w-[120px] truncate text-sm font-semibold text-zinc-900">
                      {name}
                    </p>

                    <p className="text-[11px] text-zinc-500">Worker</p>
                  </div>

                  <ChevronDown className="hidden h-4 w-4 text-zinc-500 sm:block" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/worker/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() =>
                    signOut({
                      callbackUrl: "/login",
                    })
                  }
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* BOTTOM NAVBAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] border-t border-zinc-800 bg-black/95 shadow-[0_-10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-md items-center justify-between px-3 md:max-w-2xl md:px-6">
          {MENUS.map((menu) => {
            const Icon = menu.icon;

            const active =
              pathname === menu.href || pathname.startsWith(`${menu.href}/`);

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className="flex min-w-[58px] flex-col items-center justify-center gap-1"
              >
                <div
                  className={cn(
                    "rounded-2xl p-2 transition-all duration-200",
                    active ? "bg-red-600/20 text-red-500" : "text-zinc-500",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span
                  className={cn(
                    "text-[10px] font-medium",
                    active ? "text-red-500" : "text-zinc-500",
                  )}
                >
                  {menu.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
