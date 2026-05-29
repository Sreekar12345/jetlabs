import { ReviewQueueBoard } from "@/components/dashboard/review-queue-board";
import { requirePageSession } from "@/lib/auth/session";
import { getReviewQueueData } from "@/lib/services/review-service";

export default async function Page() {
  const session = await requirePageSession();
  const data = await getReviewQueueData({
    role: session.user.role,
    userId: session.user.id,
  });

  return <ReviewQueueBoard initialData={data} />;
}
