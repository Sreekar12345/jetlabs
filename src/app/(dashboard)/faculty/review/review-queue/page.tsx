import { ReviewQueueBoard } from "@/components/dashboard/review-queue-board";
import { requirePageSession } from "@/lib/auth/session";
import { getReviewQueueData } from "@/lib/services/review-service";

export default async function ReviewQueuePage() {
  const session = await requirePageSession();
  const data = await getReviewQueueData({
    userId: session.user.id,
    role: session.user.role,
  });

  return <ReviewQueueBoard initialData={data} />;
}
