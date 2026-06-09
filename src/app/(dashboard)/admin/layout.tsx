import { requirePageSession, getSessionUserRole } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getDefaultDashboardPath } from "@/lib/auth/routing";
import { logAudit } from "@/lib/services/audit-service";

export default async function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePageSession();
  const role = getSessionUserRole(session);

  if (role !== "ADMIN") {
    try {
      const { logSystemEvent } = await import("@/lib/services/audit-service");
      await logSystemEvent({
        userId: session.user.id,
        userRole: role || "STUDENT",
        actionType: "UNAUTHORIZED_ACCESS",
        eventCategory: "ADMIN",
        entityType: "SystemRoute",
        entityId: "/admin",
        actionPerformed: "Unauthorized attempt to access restricted Administrator Workspace pages.",
      });
    } catch (auditErr) {
      console.error("Failed to log unauthorized access audit:", auditErr);
    }

    redirect(getDefaultDashboardPath(role || "STUDENT"));
  }

  return <>{children}</>;
}
