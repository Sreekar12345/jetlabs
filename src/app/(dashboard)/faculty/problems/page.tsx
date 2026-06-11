import { requirePageSession } from "@/lib/auth/session";
import { getProblemMarketData } from "@/lib/services/problem-market-service";
import { ProblemMarketBoard } from "@/components/dashboard/problem-market-board";

export default async function ProblemLibraryPage() {
  const session = await requirePageSession();
  const data = await getProblemMarketData({
    userId: session.user.id,
    role: session.user.role,
  });

  return <ProblemMarketBoard initialData={data} />;
}