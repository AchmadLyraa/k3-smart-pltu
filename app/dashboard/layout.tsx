import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">K3-SMART</h1>
              <p className="text-sm text-muted-foreground">
                Keselamatan Kerja Learning Platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="font-medium">{user?.name || "User"}</p>
                <p className="text-muted-foreground text-xs capitalize">
                  {user?.role?.toLowerCase() || "worker"}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
