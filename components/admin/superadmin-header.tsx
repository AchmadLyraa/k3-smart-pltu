"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Moon, LogOut, User, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { SuperAdminNotificationBell } from "@/components/admin/superadmin-notification-bell";

import { useEffect, useState } from "react";

interface SuperAdminHeaderProps {
  userName: string;
  userEmail: string;
}

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin/dashboard": "Dashboard / Dashboard",
  "/admin/users": "Dashboard / Kelola Pengguna",
  "/admin/reward-admin": "Dashboard / Kelola Hadiah",
  "/admin/cms": "Dashboard / CMS",
  "/admin/leaderboard": "Dashboard / Leaderboard",
  "/admin/semester": "Dashboard / Riwayat Semester",
  "/admin/profile": "Dashboard / Profile",
};

export default function SuperAdminHeader({
  userName,
  userEmail,
}: SuperAdminHeaderProps) {
  const pathname = usePathname();
  const breadcrumb = BREADCRUMB_MAP[pathname] || "Dashboard / Admin";
  const parts = breadcrumb.split(" / ");
  const [scrolled, setScrolled] = useState(false);

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const handleToggle = () => {
      const sidebar = document.querySelector(".sa-sidebar");
      if (sidebar) {
        sidebar.classList.toggle("open");
      }
    };
    const button = document.getElementById("sa-mobile-toggle");
    button?.addEventListener("click", handleToggle);

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      button?.removeEventListener("click", handleToggle);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`sa-header ${scrolled ? "sa-header--scrolled" : ""}`}>
      <div className="sa-header__left">
        <button className="sa-header__mobile-toggle" id="sa-mobile-toggle">
          <Menu className="sa-header__mobile-icon" />
        </button>
        <span className="sa-header__breadcrumb">
          {parts[0]} / <span style={{ color: "var(--sa-primary, #E74C3C)", fontWeight: 700 }}>{parts[1]}</span>
        </span>
      </div>

      <div className="sa-header__right">

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="sa-header__user">
              <span className="sa-header__user-greeting">
                Hello, {userName.split(" ")[0]}
              </span>
              <Avatar style={{ width: 36, height: 36 }}>
                <AvatarFallback
                  style={{
                    background: "var(--sa-primary, #E74C3C)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/admin/profile" className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
