import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  switch (role) {
    case "SUPER_ADMIN":
      redirect("/admin/dashboard");
    case "HSE_ADMIN":
      redirect("/hse/dashboard");
    case "REWARD_ADMIN":
      redirect("/reward/dashboard");
    case "WORKER":
      redirect("/worker/home");
    default:
      redirect("/login");
  }
}
