import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SuperAdminSidebar from "@/components/admin/superadmin-sidebar";
import SuperAdminHeader from "@/components/admin/superadmin-header";
import "@/styles/superadmin.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!session || userRole !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const userName = session.user?.name ?? session.user?.email ?? "Admin";
  const userEmail = session.user?.email ?? "";

  return (
    <div
      className="super-admin-layout"
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--sa-body-bg, #F5F6FA)",
      }}
    >
      <SuperAdminSidebar />
      <main
        className="sa-main-content"
        style={{
          flex: 1,
          marginLeft: "var(--sa-sidebar-width, 250px)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <SuperAdminHeader userName={userName} userEmail={userEmail} />
        <div style={{ flex: 1, padding: "0 32px 32px" }}>{children}</div>
      </main>
    </div>
  );
}
