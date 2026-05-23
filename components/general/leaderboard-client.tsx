"use client";

import { useState } from "react";
import { LeaderboardUser } from "@/app/actions/leaderboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Medal, Trophy, Search, Award, Sparkles, Building, Briefcase } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-red-900 via-red-950 to-red-900 p-6 md:p-8 text-white overflow-hidden shadow-xl border border-red-900/30">
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
            <p className="text-sm text-slate-300 max-w-xl">
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
              <TabsList className="grid grid-cols-2 bg-white border border-slate-800 text-slate-400">
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

          <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-4 lg:gap-8 max-w-4xl mx-auto py-8 px-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
            {podiumOrder.map((user) => {
              const points = getSortValue(user);
              const isCurrentUser = user.id === currentUserId;

              // Styling values based on rank
              let rankStyle = {
                podiumHeight: "h-32 md:h-40",
                podiumBg: "bg-slate-200 dark:bg-slate-800 border-slate-300",
                badgeBg: "bg-slate-300 text-slate-800",
                avatarRing: "ring-slate-300 bg-slate-100",
                icon: <Medal className="w-6 h-6 text-slate-400" />,
                titleColor: "text-slate-700 dark:text-slate-300",
                order: "order-2 md:order-1",
              };

              if (user.rank === 1) {
                rankStyle = {
                  podiumHeight: "h-44 md:h-56",
                  podiumBg: "bg-red-100/80 dark:bg-red-950/30 border-red-300/50 shadow-[0_4px_20px_rgba(239,71,111,0.15)]",
                  badgeBg: "bg-red-400 text-red-950 font-bold",
                  avatarRing: "ring-red-400 ring-offset-4 ring-offset-background bg-red-50",
                  icon: <Crown className="w-10 h-10 text-red-500 drop-shadow-md" />,
                  titleColor: "text-red-800 dark:text-red-400 font-extrabold",
                  order: "order-1 md:order-2 z-10 scale-105 md:scale-110",
                };
              } else if (user.rank === 2) {
                rankStyle = {
                  podiumHeight: "h-36 md:h-48",
                  podiumBg: "bg-red-200/80 dark:bg-red-950/20 border-red-200/50 shadow-[0_4px_20px_rgba(239,71,111,0.1)]",
                  badgeBg: "bg-red-300 text-red-900 font-bold",
                  avatarRing: "ring-red-300 ring-offset-4 ring-offset-background bg-red-100",
                  icon: <Crown className="w-10 h-10 text-red-300" />, // simplified icon
                  titleColor: "text-red-600 dark:text-red-500 font-semibold",
                  order: "order-2 md:order-1",
                };
              } else if (user.rank === 3) {
                rankStyle = {
                  podiumHeight: "h-24 md:h-32",
                  podiumBg: "bg-red-50 dark:bg-red-950/10 border-red-200",
                  badgeBg: "bg-red-600 text-white",
                  avatarRing: "ring-red-500 bg-red-50",
                  icon: <Medal className="w-6 h-6 text-red-600" />,
                  titleColor: "text-red-900 dark:text-red-400",
                  order: "order-3",
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
                  {/* Avatar & Crown/Medal */}
                  <div className="relative flex flex-col items-center mb-4">
                    {user.rank === 1 && (
                      <div className="absolute -top-9 z-20">
                        {rankStyle.icon}
                      </div>
                    )}
                    <Avatar className={cn("w-16 h-16 md:w-20 md:h-20 ring-4 border-2 border-background", rankStyle.avatarRing)}>
                      <AvatarFallback className={cn("text-lg font-bold text-slate-700", user.rank === 1 ? "bg-amber-200" : "bg-slate-200")}>
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {user.rank !== 1 && (
                      <div className="absolute -top-3 -right-3 p-1 bg-background rounded-full shadow border">
                        {rankStyle.icon}
                      </div>
                    )}
                  </div>

                  {/* Info Card */}
                  <div className="text-center space-y-1 mb-3 max-w-[90%]">
                    <p className={cn("font-bold text-sm md:text-base truncate flex items-center justify-center gap-1", rankStyle.titleColor)}>
                      {user.name}
                      {isCurrentUser && (
                        <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                          Anda
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-mono">NIP: {user.nip}</p>
                    <p className="text-xs text-muted-foreground truncate flex items-center justify-center gap-1">
                      <Building className="w-3 h-3 inline" /> {user.unit}
                    </p>
                  </div>

                  {/* Podium Stand */}
                  <div
                    className={cn(
                      "w-full rounded-t-2xl border-t border-x flex flex-col items-center justify-center p-4 transition-all",
                      rankStyle.podiumHeight,
                      rankStyle.podiumBg
                    )}
                  >
                    <span className={cn("text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full mb-2", rankStyle.badgeBg)}>
                      Peringkat {user.rank}
                    </span>
                    <span className="text-xl md:text-2xl font-black font-mono tracking-tight">{points}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Poin</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Remaining Rankings List */}
      <Card className="border border-slate-150 shadow-sm">
        <CardHeader className="pb-3 border-b">
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
                            rank === 1 && "bg-red-400 text-red-950",
                            rank === 2 && "bg-red-300 text-red-900",
                            rank === 3 && "bg-red-600 text-white"
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
          <div className="flex justify-center items-center space-x-2 mt-4">
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
