import { ProjectHealthBoard } from "@/components/dashboard/project-health-board";
import { requirePageSession } from "@/lib/auth/session";
import { getProjectHealthData } from "@/lib/services/project-health-service";

export default async function ProjectHealthPage() {
  const session = await requirePageSession();
  const data = await getProjectHealthData({
    userId: session.user.id,
    role: session.user.role,
  });

  return <ProjectHealthBoard data={data} />;
}
