import {
  getAdminDashboardStats,
  getWorkerPerformanceList,
  getAcademicPeriodsForFilter,
  getPeriodMonthlyActivity,
} from "@/app/actions/admin";
import AdminDashboard from "@/components/admin/admin-panel";

export const metadata = { title: "Admin Dashboard - K3 SMART" };

export default async function AdminDashboardPage(props: {
  searchParams?: Promise<{ periodId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const periodsResult = await getAcademicPeriodsForFilter();
  const periods: any[] = periodsResult.success && periodsResult.data ? periodsResult.data : [];
  
  // Resolve actual periodId: from URL, or fallback to active period
  const activePeriodId = periods.find((p: any) => p.isActive)?.id || "";
  const resolvedPeriodId = searchParams?.periodId || activePeriodId || "";

  const [statsResult, workersResult, monthlyDataResult] = await Promise.all([
    getAdminDashboardStats(resolvedPeriodId || undefined),
    getWorkerPerformanceList(resolvedPeriodId || undefined),
    getPeriodMonthlyActivity(resolvedPeriodId || undefined),
  ]);

  const stats: any = statsResult.success ? statsResult.data : null;
  const workers: any[] = workersResult.success && workersResult.data ? workersResult.data : [];
  const monthlyData: any[] = monthlyDataResult.success && monthlyDataResult.data ? monthlyDataResult.data : [];
  const monthlyDataError: string | null = !monthlyDataResult.success && monthlyDataResult.error ? monthlyDataResult.error : null;

  const defaultPeriodId = resolvedPeriodId || "all";

  return (
    <AdminDashboard
      stats={stats}
      workers={workers}
      periods={periods}
      defaultPeriodId={defaultPeriodId}
      monthlyData={monthlyData}
      monthlyDataError={monthlyDataError}
    />
  );
}
