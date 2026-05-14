import { auth } from "@/auth";
import RewardAdminPage from "@/components/reward-admin/reward-admin-page";

export const metadata = {
  title: "Manajemen Reward - K3 SMART",
};

export default async function RewardAdminRewardsPage() {
  const session = await auth();

  return <RewardAdminPage />;
}
