import { StudentDashboardView } from "@/components/dashboard/student-dashboard-view";
import { requirePageSession } from "@/lib/auth/session";
import { getStudentDashboardData } from "@/lib/services/dashboard-service";

export default async function StudentDashboardPage() {
  const session = await requirePageSession();
  const data = await getStudentDashboardData(session.user.id);

  return <StudentDashboardView data={data} />;
}
