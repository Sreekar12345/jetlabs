import { DefenseReadinessIntelligenceBoard } from "@/components/dashboard/defense-readiness-intelligence-board";
import { requirePageSession } from "@/lib/auth/session";
import { getDefenseReadinessData } from "@/lib/services/defense-readiness-service";

export default async function Page() {
  const session = await requirePageSession();
  const data = await getDefenseReadinessData({
    userId: session.user.id,
    role: session.user.role,
  });

  return <DefenseReadinessIntelligenceBoard data={data} />;
}
