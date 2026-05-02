"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Menu,
  LogOut,
  ChevronDown,
  Shield,
  Leaf,
  Award,
  HardHat,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Session } from "next-auth";

interface NavbarProps {
  session: Session;
}

type Role = "SUPER_ADMIN" | "HSE_ADMIN" | "REWARD_ADMIN" | "WORKER";

interface NavItem {
  label: string;
  href: string;
}

const NAV_CONFIG: Record<
  Role,
  { label: string; color: string; icon: React.ReactNode; items: NavItem[] }
> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    color: "bg-rose-600",
    icon: <Shield className="w-4 h-4" />,
    items: [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Kelola User", href: "/admin/users" },
      { label: "Reward Management", href: "/admin/reward-admin" },
      { label: "CMS", href: "/admin/cms" },
    ],
  },
  HSE_ADMIN: {
    label: "HSE Admin",
    color: "bg-emerald-600",
    icon: <Leaf className="w-4 h-4" />,
    items: [{ label: "Dashboard", href: "/hse/dashboard" }],
  },
  REWARD_ADMIN: {
    label: "Reward Admin",
    color: "bg-amber-500",
    icon: <Award className="w-4 h-4" />,
    items: [{ label: "Dashboard", href: "/reward/dashboard" }],
  },
  WORKER: {
    label: "Worker",
    color: "bg-sky-600",
    icon: <HardHat className="w-4 h-4" />,
    items: [
      { label: "Home", href: "/worker/home" },
      { label: "Reward", href: "/worker/home/reward-users" },
      { label: "Material", href: "/worker/materials" },
    ],
  },
};

export default function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const role = (session?.user as any)?.role as Role;
  const config = NAV_CONFIG[role];

  if (!session || !config) return null;

  const name = session.user?.name ?? session.user?.email ?? "User";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg shrink-0"
        >
          <span className="text-primary">K3</span>
          <span className="hidden sm:inline text-muted-foreground font-normal text-sm">
            SMART
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {config.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Role badge - desktop only */}
          <Badge
            variant="secondary"
            className="hidden md:flex items-center gap-1 text-xs"
          >
            {config.icon}
            {config.label}
          </Badge>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-9 px-2"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback
                    className={cn("text-white text-xs", config.color)}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm max-w-[120px] truncate">
                  {name}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium truncate">{name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {session.user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
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

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Sidebar navigation for user menu
              </SheetDescription>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        className={cn("text-white text-sm", config.color)}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">
                        {name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="w-fit mt-0.5 text-xs flex items-center gap-1"
                      >
                        {config.icon}
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 p-3 flex flex-col gap-1">
                  {config.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <Separator />

                {/* Logout */}
                <div className="p-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
