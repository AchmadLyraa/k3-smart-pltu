import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/general/navbar";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== "WORKER") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} />
      <div className="container mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
