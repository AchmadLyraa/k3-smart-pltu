// app/dashboard/admin/page.tsx
import { requireAuth } from "@/lib/role-guard";
import UserList from "@/components/users/user-list";
import CreateUserForm from "@/components/users/create-user-form";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  try {
    await requireAuth(["SUPER_ADMIN", "HSE_ADMIN"]);
  } catch {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users and system settings
        </p>
      </div>
      <div className="grid gap-6 mb-6">
        <CreateUserForm />
      </div>
      <UserList />
    </div>
  );
}
