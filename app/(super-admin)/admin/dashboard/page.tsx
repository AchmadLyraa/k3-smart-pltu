import { auth } from "@/auth";
import AdminPanel from "@/components/admin/admin-panel";

export const metadata = {
  title: "Admin Dashboard - K3 SMART",
};

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      <AdminPanel />
    </div>
  );
}
