import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">K3-SMART Dashboard</h1>
          <LogoutButton />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>You are logged in successfully</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {user?.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>Role:</strong> {user?.role || "WORKER"}
                </p>
              </div>
            </CardContent>
          </Card>

          {(user?.role === "SUPER_ADMIN" || user?.role === "HSE_ADMIN") && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Admin content will be available here
                </p>
              </CardContent>
            </Card>
          )}

          {(user?.role === "SUPER_ADMIN" ||
            user?.role === "HSE_ADMIN" ||
            user?.role === "SUPERVISOR") && (
            <Card>
              <CardHeader>
                <CardTitle>Supervisor Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Supervisor content will be available here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
