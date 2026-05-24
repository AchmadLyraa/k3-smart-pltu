import { startCampaignQuiz } from "@/app/actions/quiz-campaign";
import WorkerQuizCampaignPageClient from "@/components/worker/worker-quiz-campaign-page";

export const metadata = {
  title: "Quiz Campaign - K3 SMART",
  description: "Kerjakan quiz khusus bulanan K3",
};

export default async function QuizCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Start or resume the campaign quiz
  const result = await startCampaignQuiz(id);

  return (
    <WorkerQuizCampaignPageClient
      session={result.success && result.data ? result.data.session : null}
      campaign={result.success && result.data ? result.data.campaign : null}
      error={!result.success ? result.error : undefined}
      campaignId={id}
    />
  );
}