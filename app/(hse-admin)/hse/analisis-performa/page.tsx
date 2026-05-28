import {
  getPerformanceAnalytics,
} from "@/app/actions/performance-analytics";
import { getAcademicPeriodsForFilter } from "@/app/actions/admin";
import PerformanceAnalyticsPanel from "@/components/admin/performance-analytics-panel";

export const metadata = { title: "Analisis Performa - K3 SMART" };

export default async function HseAnalisisPerformaPage(props: {
  searchParams?: Promise<{ periodId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const periodsResult = await getAcademicPeriodsForFilter();
  const periods: any[] =
    periodsResult.success && periodsResult.data ? periodsResult.data : [];

  const activePeriodId = periods.find((p: any) => p.isActive)?.id || "";
  const resolvedPeriodId = searchParams?.periodId || activePeriodId || "";

  const analyticsResult = await getPerformanceAnalytics(
    resolvedPeriodId || undefined
  );

  const data: any = analyticsResult.success ? analyticsResult.data : null;
  const defaultPeriodId = resolvedPeriodId || "all";

  return (
    <PerformanceAnalyticsPanel
      data={data}
      periods={periods}
      defaultPeriodId={defaultPeriodId}
    />
  );
}
