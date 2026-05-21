// app/(worker)/layout.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";

import WorkerMobileNavbar from "@/components/general/worker-mobile-navbar";

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
    <div className="min-h-screen bg-zinc-100">
      <WorkerMobileNavbar session={session} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
