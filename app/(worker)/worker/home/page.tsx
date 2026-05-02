import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Trophy, Award } from "lucide-react";

export const metadata = {
  title: "Home - K3 SMART",
};

export default async function WorkerHomePage() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">
          Selamat datang, {session?.user?.name}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Your personalized workplace safety learning platform
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 mb-12 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Learning Materials</CardTitle>
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <CardDescription>Video, infographics, and articles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">New content weekly</p>
            <Button asChild className="w-full">
              <Link href="/materials">Start Learning</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Safety Quiz</CardTitle>
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <CardDescription>Test your knowledge</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">Earn points</p>
            <Button asChild className="w-full" disabled>
              <Link href="/quiz">Coming Soon</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Rewards</CardTitle>
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <CardDescription>Redeem your achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">Your points</p>
            <Button asChild className="w-full" disabled>
              <Link href="/rewards">Coming Soon</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>How it Works</CardTitle>
          <CardDescription>
            Get started with K3-SMART in 3 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Learn from Materials</h3>
                <p className="text-sm text-muted-foreground">
                  Watch videos and explore infographics about workplace safety
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-600 text-white font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Take Quizzes</h3>
                <p className="text-sm text-muted-foreground">
                  Test your knowledge and earn points for correct answers
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-600 text-white font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Claim Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Redeem your accumulated points for exciting rewards
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
