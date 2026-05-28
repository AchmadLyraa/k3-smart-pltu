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
      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}