import { TeamContributionIntelligenceBoard } from "@/components/dashboard/team-contribution-intelligence-board";
import { requirePageSession } from "@/lib/auth/session";
import { getTeamContributionData } from "@/lib/services/team-contribution-service";

export default async function Page() {
  const session = await requirePageSession();
  const data = await getTeamContributionData({
    userId: session.user.id,
    role: session.user.role,
  });

  return <TeamContributionIntelligenceBoard data={data} />;
}
