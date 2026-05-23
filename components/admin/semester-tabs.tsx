// 'use client'

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

export default function SemesterTabs({ groups, workers }: { groups: any[]; workers: any[] }) {
  const pageSize = 10;

  // pagination state
  const [historyPage, setHistoryPage] = useState(1);
  const [accumPage, setAccumPage] = useState(1);

  const totalHistoryPages = Math.max(1, Math.ceil(groups.length / pageSize));
  const totalAccumPages = Math.max(1, Math.ceil(workers.length / pageSize));

  const paginatedGroups = groups.slice((historyPage - 1) * pageSize, historyPage * pageSize);
  const paginatedWorkers = workers.slice((accumPage - 1) * pageSize, accumPage * pageSize);

  return (
    <Tabs defaultValue="history" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="history">Riwayat Per Semester</TabsTrigger>
        <TabsTrigger value="accumulation">Akumulasi Per Worker</TabsTrigger>
      </TabsList>

      {/* Tab 1: Riwayat per semester */}
      <TabsContent value="history" className="space-y-4">
        {groups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-[24px] bg-white">
            Belum ada riwayat semester. Lakukan reset semester pertama.
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedGroups.map((group: any) => (
                <div key={group.key} className="bg-white border rounded-lg p-5 shadow-sm">
                  {/* Sub-header */}
                  <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{group.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {group.entries.length} pekerja
                        {group.lastResetAt && (
                          <span>
                            {" "}• Reset pada:{" "}
                            {new Date(group.lastResetAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
                      Total: {group.entries.reduce((s: number, e: any) => s + e.totalPoints, 0)} pts
                    </span>
                  </div>
                  {/* List workers */}
                  <div className="space-y-2">
                    {group.entries
                      .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
                      .map((entry: any, idx: number) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between py-2 border-b last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground w-6 font-medium">#{idx + 1}</span>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{entry.user?.name ?? "-"}</p>
                              <p className="text-xs text-muted-foreground">{entry.user.nip ?? "-"}</p>
                            </div>
                          </div>
                          <span className="font-bold text-sm text-slate-700">{entry.totalPoints} poin</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <button
                    onClick={() => setHistoryPage(p => Math.max(p - 1, 1))}
                    disabled={historyPage === 1}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </PaginationItem>
                {[...Array(totalHistoryPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink isActive={historyPage === i + 1} onClick={() => setHistoryPage(i + 1)}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <button
                    onClick={() => setHistoryPage(p => Math.min(p + 1, totalHistoryPages))}
                    disabled={historyPage === totalHistoryPages}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </TabsContent>

      {/* Tab 2: Akumulasi per worker */}
      <TabsContent value="accumulation">
        {workers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-white">
            Belum ada data worker.
          </div>
        ) : (
          <>
            <div className="bg-white border rounded-lg p-5 shadow-sm space-y-0">
              {paginatedWorkers.map((w, idx) => (
                <div key={w.id} className="flex items-center justify-between py-3 border-b last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-6 font-medium">#{idx + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{w.name}</p>
                      <p className="text-xs text-muted-foreground">{w.nip ?? "-"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-slate-900">{w.allTimePoints} poin</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {w.historicalPoints} hist + {w.activePoints} aktif semester ini
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <button
                    onClick={() => setAccumPage(p => Math.max(p - 1, 1))}
                    disabled={accumPage === 1}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </PaginationItem>
                {[...Array(totalAccumPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink isActive={accumPage === i + 1} onClick={() => setAccumPage(i + 1)}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <button
                    onClick={() => setAccumPage(p => Math.min(p + 1, totalAccumPages))}
                    disabled={accumPage === totalAccumPages}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
