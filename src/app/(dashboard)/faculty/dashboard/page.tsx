import { FacultyDashboardView } from "@/components/dashboard/faculty-dashboard-view";
import { requirePageSession } from "@/lib/auth/session";
import { getFacultyDashboardData } from "@/lib/services/dashboard-service";
import { getFacultyWorkspaceData } from "@/lib/services/faculty-workspace-service";

export default async function FacultyDashboardPage() {
  const session = await requirePageSession();
  const data = await getFacultyDashboardData(session.user.id);
  const workspaceData = await getFacultyWorkspaceData(session.user.id);

  const enrichedData = {
    ...data,
    ...workspaceData,
  };

  return <FacultyDashboardView data={enrichedData} />;
}
