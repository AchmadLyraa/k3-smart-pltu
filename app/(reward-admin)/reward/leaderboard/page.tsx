import { getLeaderboardData } from "@/app/actions/leaderboard";
import LeaderboardClient from "@/components/general/leaderboard-client";

export default async function LeaderboardPage() {
  const result = await getLeaderboardData();

  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Error loading leaderboard: {result.error ?? "Unknown error"}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <LeaderboardClient
        initialData={result.data}
        currentUserId={result.currentUserId ?? ""}
      />
    </div>
  );
}
