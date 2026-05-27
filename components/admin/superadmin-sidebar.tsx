"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Gift,
  FileText,
  Trophy,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS_BY_ROLE: Record<
  string,
  { label: string; href: string; icon: any }[]
> = {
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Kelola Pengguna", href: "/admin/users", icon: Users },
    { label: "Kelola Hadiah", href: "/admin/reward-admin", icon: Gift },
    { label: "CMS", href: "/admin/cms", icon: FileText },
    { label: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
    { label: "Semester", href: "/admin/semester", icon: CalendarClock },
  ],
  HSE_ADMIN: [
    { label: "Dashboard", href: "/hse/dashboard", icon: LayoutDashboard },
    { label: "CMS", href: "/hse/cms", icon: FileText },
    { label: "Leaderboard", href: "/hse/leaderboard", icon: Trophy },
  ],
  REWARD_ADMIN: [
    { label: "Dashboard", href: "/reward/dashboard", icon: LayoutDashboard },
    { label: "Kelola Hadiah", href: "/reward/reward-admin", icon: Gift },
    { label: "Leaderboard", href: "/reward/leaderboard", icon: Trophy },
  ],
};

interface SuperAdminSidebarProps {
  role: string;
}

export default function SuperAdminSidebar({ role }: SuperAdminSidebarProps) {
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);

  const items =
    SIDEBAR_ITEMS_BY_ROLE[role] ?? SIDEBAR_ITEMS_BY_ROLE.SUPER_ADMIN;

  useEffect(() => {
    const saved = localStorage.getItem("sa-sidebar-minimized") === "true";
    setIsMinimized(saved);
    const layout = document.querySelector(".super-admin-layout");
    if (saved && layout) layout.classList.add("super-admin-layout--minimized");
  }, []);

  const toggleMinimize = () => {
    const nextState = !isMinimized;
    setIsMinimized(nextState);
    localStorage.setItem("sa-sidebar-minimized", String(nextState));
    const layout = document.querySelector(".super-admin-layout");
    if (layout) {
      if (nextState) layout.classList.add("super-admin-layout--minimized");
      else layout.classList.remove("super-admin-layout--minimized");
    }
  };

  const handleItemClick = () => {
    const sidebar = document.querySelector(".sa-sidebar");
    if (sidebar) sidebar.classList.remove("open");
  };

  return (
    <aside className={cn("sa-sidebar", isMinimized && "sa-sidebar--minimized")}>
      <button
        onClick={toggleMinimize}
        className="sa-sidebar__toggle"
        title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
      >
        {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
      <div className="sa-sidebar__logo">
        <div className="sa-logo-expanded">
          <Image
            src="/images/logonew-k3.svg"
            alt="K3 SMART"
            width={140}
            height={50}
            priority
            style={{ objectFit: "contain", width: "auto", height: "auto" }}
          />
        </div>
        <div className="sa-logo-collapsed">
          <Image
            src="/images/logo-primary-k3.svg"
            alt="K3"
            width={35}
            height={35}
            priority
            className="sa-logo-img"
            style={{ objectFit: "contain", width: "auto", height: "auto" }}
          />
        </div>
      </div>
      <nav className="sa-sidebar__nav">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleItemClick}
              className={cn(
                "sa-sidebar__item",
                isActive && "sa-sidebar__item--active",
              )}
              title={isMinimized ? item.label : undefined}
            >
              <div className="sa-sidebar__item-indicator" />
              <Icon className="sa-sidebar__item-icon" />
              <span className="sa-sidebar__item-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
