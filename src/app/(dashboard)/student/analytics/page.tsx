import { StudentAnalyticsClient } from "./student-analytics-client";
import { requireRole } from "@/lib/auth/session";
import { getStudentAnalytics, logAnalyticsAudit } from "@/lib/services/analytics-service";

export default async function StudentAnalyticsPage() {
  const session = await requireRole("STUDENT");
  const userId = session.user.id;

  // Fetch student analytics data
  const studentAnalytics = await getStudentAnalytics(userId);

  // Log analytics access audit
  await logAnalyticsAudit(
    userId,
    "ANALYTICS_ACCESS",
    "STUDENT",
    "WEB",
    "Accessed the Student Analytics and Performance Insights dashboard."
  );

  return (
    <StudentAnalyticsClient 
      data={studentAnalytics} 
      studentId={userId} 
    />
  );
}
