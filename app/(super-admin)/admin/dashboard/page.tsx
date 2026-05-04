import {
  getAdminDashboardStats,
  getWorkerPerformanceList,
} from "@/app/actions/admin";
import AdminDashboard from "@/components/admin/admin-panel";

export const metadata = { title: "Admin Dashboard - K3 SMART" };

export default async function AdminDashboardPage() {
  const [statsResult, workersResult] = await Promise.all([
    getAdminDashboardStats(),
    getWorkerPerformanceList(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const workers = workersResult.success ? workersResult.data : [];

  return <AdminDashboard stats={stats} workers={workers} />;
}
