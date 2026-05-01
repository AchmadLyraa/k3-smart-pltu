import { auth } from "@/auth";

export const metadata = {
  title: "HSE Dashboard - K3 SMART",
};

export default async function HSEDashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-3xl font-bold">HSE Admin Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Kelola materi, soal, quiz - fitur segera hadir
      </p>
    </div>
  );
}
