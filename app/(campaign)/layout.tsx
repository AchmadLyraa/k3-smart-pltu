import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session as any).user?.role !== "WORKER") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      {children}
    </div>
  );
}