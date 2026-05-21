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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Kelola Pengguna",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Manajemen Hadiah",
    href: "/admin/reward-admin",
    icon: Gift,
  },
  {
    label: "CMS",
    href: "/admin/cms",
    icon: FileText,
  },
  {
    label: "Leaderboard",
    href: "/admin/leaderboard",
    icon: Trophy,
  },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Check local storage preference
    const saved = localStorage.getItem("sa-sidebar-minimized") === "true";
    setIsMinimized(saved);
    const layout = document.querySelector(".super-admin-layout");
    if (saved && layout) {
      layout.classList.add("super-admin-layout--minimized");
    }
  }, []);

  const toggleMinimize = () => {
    const nextState = !isMinimized;
    setIsMinimized(nextState);
    localStorage.setItem("sa-sidebar-minimized", String(nextState));
    const layout = document.querySelector(".super-admin-layout");
    if (layout) {
      if (nextState) {
        layout.classList.add("super-admin-layout--minimized");
      } else {
        layout.classList.remove("super-admin-layout--minimized");
      }
    }
  };

  const handleItemClick = () => {
    const sidebar = document.querySelector(".sa-sidebar");
    if (sidebar) {
      sidebar.classList.remove("open");
    }
  };

  return (
    <aside className={cn("sa-sidebar", isMinimized && "sa-sidebar--minimized")}>
      {/* Minimize / Toggle Button */}
      <button
        onClick={toggleMinimize}
        className="sa-sidebar__toggle"
        title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
      >
        {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo Section */}
      <div className="sa-sidebar__logo">
        <div className="sa-logo-expanded">
          <Image
            src="/images/logonew-k3.svg"
            alt="K3 SMART"
            width={160}
            height={50}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>
        <div className="sa-logo-collapsed">
          <Image
            src="/images/logo-primary-k3.png"
            alt="K3"
            width={35}
            height={35}
            priority
            className="sa-logo-img"
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="sa-sidebar__nav">
        {SIDEBAR_ITEMS.map((item) => {
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
                isActive && "sa-sidebar__item--active"
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
