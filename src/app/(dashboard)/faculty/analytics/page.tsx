import { FacultyAnalyticsClient } from "./faculty-analytics-client";
import { requireRole } from "@/lib/auth/session";
import { getFacultyAnalytics, logAnalyticsAudit } from "@/lib/services/analytics-service";
import { db } from "@/lib/db";

export default async function FacultyAnalyticsPage() {
  const session = await requireRole("FACULTY");
  const userId = session.user.id;

  // Fetch initial analytics
  const initialData = await getFacultyAnalytics(userId);

  // Fetch list of assigned teams for filtering dropdowns
  const teamsList = await db.team.findMany({
    where: { facultyId: userId },
    select: {
      id: true,
      name: true,
      batch: true
    },
    orderBy: { name: "asc" }
  });

  // Log analytics access audit
  await logAnalyticsAudit(
    userId,
    "ANALYTICS_ACCESS",
    "FACULTY",
    "WEB",
    "Accessed the Faculty Analytics and Reports dashboard."
  );

  return (
    <FacultyAnalyticsClient 
      initialData={initialData} 
      teamsList={teamsList} 
      facultyId={userId} 
    />
  );
}
