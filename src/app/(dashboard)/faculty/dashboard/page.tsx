import { FacultyDashboardView } from "@/components/dashboard/faculty-dashboard-view";
import { requirePageSession } from "@/lib/auth/session";
import { getFacultyDashboardData } from "@/lib/services/dashboard-service";

export default async function FacultyDashboardPage() {
  const session = await requirePageSession();
  const data = await getFacultyDashboardData(session.user.id);

  return <FacultyDashboardView data={data} />;
}
