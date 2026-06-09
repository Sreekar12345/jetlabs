import { AdminAnalyticsClient } from "./admin-analytics-client";
import { requireRole } from "@/lib/auth/session";
import { getAdminAnalytics, logAnalyticsAudit } from "@/lib/services/analytics-service";

export default async function AdminAnalyticsPage() {
  const session = await requireRole("ADMIN");
  const userId = session.user.id;

  // Fetch admin analytics
  const adminAnalytics = await getAdminAnalytics();

  // Log analytics access audit
  await logAnalyticsAudit(
    userId,
    "ANALYTICS_ACCESS",
    "ADMIN",
    "WEB",
    "Accessed the Admin platform operations dashboard."
  );

  return (
    <AdminAnalyticsClient 
      data={adminAnalytics} 
      adminId={userId} 
    />
  );
}
