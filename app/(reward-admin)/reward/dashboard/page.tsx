import { auth } from "@/auth";

export const metadata = {
  title: "Reward Dashboard - K3 SMART",
};

export default async function RewardDashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-3xl font-bold">Reward Admin Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Kelola reward, penukaran, hadiah - fitur segera hadir
      </p>
    </div>
  );
}
