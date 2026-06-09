import { redirect } from "next/navigation";
import { ProblemMarketBoard } from "@/components/dashboard/problem-market-board";
import { requirePageSession } from "@/lib/auth/session";
import { getProblemMarketData } from "@/lib/services/problem-market-service";
import { db } from "@/lib/db";

export default async function ProblemMarketPage() {
  const session = await requirePageSession();
  const userId = session.user.id;

  // Enforce: Only TEAM_LEAD can access the Problem Statement Selection page
  const teamMember = await db.teamMember.findFirst({
    where: { userId },
  });

  if (!teamMember || teamMember.role !== "TEAM_LEAD") {
    redirect("/student/dashboard?error=only_team_lead_can_select_problems");
  }

  const data = await getProblemMarketData({
    userId: session.user.id,
    role: session.user.role,
  });

  return <ProblemMarketBoard initialData={data} />;
}
