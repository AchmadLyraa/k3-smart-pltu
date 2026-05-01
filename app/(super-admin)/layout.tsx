import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/general/navbar";

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
  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} />
      <div className="container mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
