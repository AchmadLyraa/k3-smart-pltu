"use client";

import { useState } from "react";
import { LeaderboardUser } from "@/app/actions/leaderboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Medal, Star, Trophy, Award, Sparkles, Building, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardClientProps {
  initialData: LeaderboardUser[];
  currentUserId: string;
}

export default function LeaderboardClient({ initialData, currentUserId }: LeaderboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"semester" | "alltime">("semester");

  // Determine sort key based on tab
  const getSortValue = (user: LeaderboardUser) => {
    return activeTab === "semester" ? user.activePoints : user.allTimePoints;
  };

  // Sort and filter workers
  const sortedAndFiltered = initialData
    .sort((a, b) => {
      const valA = getSortValue(a);
      const valB = getSortValue(b);
      if (valB !== valA) return valB - valA;
      return a.name.localeCompare(b.name);
    })
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.nip.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pageSize = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sortedAndFiltered.length / pageSize);
  const paginatedData = sortedAndFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Separate top 3 for podium
  const top3 = sortedAndFiltered.slice(0, 3);
  const remaining = sortedAndFiltered.slice(3);

  // Rearrange top 3 for podium layout: [2nd, 1st, 3rd]
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ ...top3[1], rank: 2 });
  if (top3[0]) podiumOrder.push({ ...top3[0], rank: 1 });
  if (top3[2]) podiumOrder.push({ ...top3[2], rank: 3 });

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-red-900 via-red-950 to-red-900 p-4 md:p-5 text-white overflow-hidden  border border-red-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(239,71,111,0.15),transparent)] pointer-events-none" />
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Crown className="w-48 h-48 text-red-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-500/20 text-red-300">
                <Trophy className="w-6 h-6 text-red-400" />
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-red-300 flex items-center gap-1">
                Leaderboard <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-red-200 bg-clip-text text-transparent">
              Papan Peringkat K3 Smart PLTU
            </h1>
            <p className="text-sm text-slate-300">
              Tingkatkan kedisiplinan K3 Anda, selesaikan materi & kuis untuk meraih poin tertinggi semester ini!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">

            {/* Tab Selector */}
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as "semester" | "alltime")}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-2 bg-white text-slate-400">
                <TabsTrigger
                  value="semester"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-md whitespace-nowrap px-3"
                >
                  Semester Ini
                </TabsTrigger>
                <TabsTrigger
                  value="alltime"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-md whitespace-nowrap px-3"
                >
                  All-Time
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Podium Section (Only show if we have enough users and no search query filter is active, or if search matches top users) */}
      {top3.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-red-500" />
              Top 3 Pekerja Terbaik
            </h2>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-3 lg:gap-4 max-w-5xl mx-auto py-1 px-1 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
              {podiumOrder.map((user) => {
              const points = getSortValue(user);
              const isCurrentUser = user.id === currentUserId;

              let rankStyle = {
                podiumHeight: "h-28 md:h-36",
                podiumBg: "bg-white border-slate-200 shadow-sm",
                badgeBg: "bg-slate-200 text-slate-700",
                avatarSize: "w-14 h-14 md:w-16 md:h-16",
                avatarBg: "bg-slate-100 text-slate-600",
                avatarRing: "ring-2 ring-slate-200",
                icon: null as React.ReactNode,
                titleColor: "text-slate-700",
                order: "order-2 md:order-1",
                nameSize: "text-sm",
                pointsSize: "text-lg md:text-xl",
                starColor: "text-slate-300",
              };

              if (user.rank === 1) {
                rankStyle = {
                  podiumHeight: "h-40 md:h-52",
                  podiumBg: "bg-gradient-to-b from-red-100 to-red-200 border-red-300 shadow-[0_4px_24px_rgba(251,191,36,0.2)]",
                  badgeBg: "bg-gradient-to-r from-red-500 to-red-500 text-white",
                  avatarSize: "w-20 h-20 md:w-24 md:h-24",
                  avatarBg: "bg-gradient-to-br from-red-400 to-red-500 text-white",
                  avatarRing: "ring-4 ring-red-400 ring-offset-4 ring-offset-background",
                  icon: <Crown className="w-8 h-8 md:w-10 md:h-10 text-red-500 drop-shadow-md" />,
                  titleColor: "text-red-800 font-extrabold",
                  order: "order-1 md:order-2 z-10 scale-105 md:scale-110",
                  nameSize: "text-sm md:text-base",
                  pointsSize: "text-2xl md:text-3xl",
                  starColor: "text-amber-400",
                };
              } else if (user.rank === 2) {
                rankStyle = {
                  podiumHeight: "h-32 md:h-44",
                  podiumBg: "bg-gradient-to-b from-orange-50 to-amber-50 border-orange-200",
                  badgeBg: "bg-amber-600 text-white",
                  avatarSize: "w-14 h-14 md:w-16 md:h-16",
                  avatarBg: "bg-amber-100 text-amber-700",
                  avatarRing: "ring-2 ring-amber-300",
                  icon: <Medal className="w-5 h-5 text-amber-500" />,
                  titleColor: "text-slate-700 font-semibold",
                  order: "order-2 md:order-1",
                  nameSize: "text-sm",
                  pointsSize: "text-lg md:text-xl",
                  starColor: "text-slate-300",
                };
              } else if (user.rank === 3) {
                rankStyle = {
                  podiumHeight: "h-24 md:h-32",
                  podiumBg: "bg-gradient-to-b from-slate-50 to-slate-100 border-slate-300",
                  badgeBg: "bg-slate-400 text-white",
                  avatarSize: "w-12 h-12 md:w-14 md:h-14",
                  avatarBg: "bg-slate-300 text-white",
                  avatarRing: "ring-2 ring-slate-300",
                  icon: <Medal className="w-5 h-5 text-slate-400" />,
                  titleColor: "text-amber-800 font-bold",
                  order: "order-3",
                  nameSize: "text-sm",
                  pointsSize: "text-base md:text-lg",
                  starColor: "text-amber-300",
                };
              }

              return (
                <div
                  key={user.id}
                  className={cn(
                    "flex flex-col items-center w-full md:w-56 transition-all duration-500 hover:-translate-y-2",
                    rankStyle.order
                  )}
                >
                  {/* Avatar & Crown/icon */}
                  <div className="relative flex flex-col items-center mb-3">
                    {user.rank === 1 && (
                      <div className="absolute -top-10 z-20">
                        {rankStyle.icon}
                      </div>
                    )}
                    <Avatar className={cn(rankStyle.avatarSize, rankStyle.avatarRing, "border-2 border-background")}>
                      <AvatarFallback className={cn("text-base md:text-lg font-bold", rankStyle.avatarBg)}>
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {user.rank !== 1 && (
                      <div className="absolute -top-2 -right-1 p-1 bg-background rounded-full shadow-sm border">
                        {rankStyle.icon}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-center space-y-0.5 mb-2">
                    <p className={cn("font-bold truncate flex items-center justify-center gap-1", rankStyle.nameSize, rankStyle.titleColor)}>
                      {user.name}
                      {isCurrentUser && (
                        <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">Anda</span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">NIP: {user.nip}</p>
                  </div>

                  {/* Podium Stand */}
                  <div
                    className={cn(
                      "w-full rounded-t-2xl border-t border-x flex flex-col items-center justify-center py-3 px-4 transition-all",
                      rankStyle.podiumHeight,
                      rankStyle.podiumBg
                    )}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {user.rank === 1 && <Star className={cn("w-4 h-4 fill-current", rankStyle.starColor)} />}
                      <span className={cn("text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full", rankStyle.badgeBg)}>
                        #{user.rank}
                      </span>
                      {user.rank === 1 && <Star className={cn("w-4 h-4 fill-current", rankStyle.starColor)} />}
                    </div>
                    <span className={cn("font-black font-mono tracking-tight", rankStyle.pointsSize)}>{points}</span>
                    <span className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-wider">Poin</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Remaining Rankings List */}
      <Card className="border border-slate-150 shadow-sm">
        <CardHeader className="pb-2 pt-4 border-b">
          <CardTitle className="text-base font-bold">Daftar Peringkat</CardTitle>
          <CardDescription>
            {sortedAndFiltered.length} total pekerja ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {sortedAndFiltered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Tidak ada pekerja yang sesuai dengan pencarian Anda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Header List - Desktop Only */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-5">Pekerja</div>
                <div className="col-span-4">Unit / Divisi</div>
                <div className="col-span-2 text-right">Total Poin</div>
              </div>

              {/* Items */}
              {paginatedData.map((user, index) => {
                const rank = (currentPage - 1) * pageSize + index + 1;
                const points = getSortValue(user);
                const isCurrentUser = user.id === currentUserId;

                return (
                  <div
                    key={user.id}
                    className={cn(
                      "grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-muted/30",
                      isCurrentUser && "bg-red-50/40 dark:bg-red-950/10 border-y border-red-100 dark:border-red-950/30"
                    )}
                  >
                    {/* Rank */}
                    <div className="col-span-2 md:col-span-1 flex justify-center">
                      {rank <= 3 ? (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center p-0 font-extrabold border-none",
                            rank === 1 && "bg-red-500 text-white",
                            rank === 2 && "bg-amber-500 text-white",
                            rank === 3 && "bg-slate-400 text-white"
                          )}
                        >
                          {rank}
                        </Badge>
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground font-mono w-7 text-center">
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* Profile & Name */}
                    <div className="col-span-10 md:col-span-5 flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className={cn("text-xs font-bold", isCurrentUser ? "bg-red-600 text-white" : "bg-slate-100")}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate flex items-center gap-1.5">
                          {user.name}
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600 border-red-200 dark:border-red-900 py-0 px-1.5">
                              Anda
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate font-mono">NIP: {user.nip}</p>
                      </div>
                    </div>

                    {/* Unit / Division */}
                    <div className="col-span-8 md:col-span-4 offset-2 md:offset-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-xs text-muted-foreground pl-12 md:pl-0">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 shrink-0" />
                        {user.unit}
                      </span>
                      <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 shrink-0" />
                        {user.division}
                      </span>
                    </div>

                    {/* Points */}
                    <div className="col-span-4 md:col-span-2 text-right">
                      <span className="text-sm font-black font-mono tracking-tight text-foreground block">
                        {points} <span className="text-[10px] font-semibold text-muted-foreground uppercase">Poin</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {user.historicalPoints} hist + {user.activePoints} aktif
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
              {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-2 mt-2 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
  );
}
