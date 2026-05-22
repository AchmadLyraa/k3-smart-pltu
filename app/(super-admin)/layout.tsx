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
          marginLeft: "calc(var(--sa-sidebar-width, 250px) + 32px)",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          padding: "16px 16px 16px 0",
        }}
      >
        <div className="sa-content-container">
          <SuperAdminHeader userName={userName} userEmail={userEmail} />
          <div className="sa-content-body">{children}</div>
        </div>
      </main>
    </div>
  );
}
