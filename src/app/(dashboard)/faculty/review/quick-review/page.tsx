import { SubmissionTriageCenter } from "@/components/dashboard/submission-triage-center";
import { requirePageSession } from "@/lib/auth/session";
import { getReviewQueueData } from "@/lib/services/review-service";

export default async function QuickReviewPage() {
  const session = await requirePageSession();
  const data = await getReviewQueueData({
    role: session.user.role,
    userId: session.user.id,
  });

  return <SubmissionTriageCenter initialData={data} />;
}
