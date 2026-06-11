import { requirePageRole } from "@/lib/auth/session";
import { AdminControlCenter } from "@/components/dashboard/admin-control-center";
import {
  getAdminOverviewStats,
  getAdminStudents,
  getAdminFaculty,
  getAdminTeams,
  getAdminProjects,
  getAdminSubmissions,
  getAdminEvaluations,
  getAdminNotifications,
  getAdminSystemHealth,
  getAdminApplications
} from "@/lib/services/admin-service";
import { getAuditLogs } from "@/lib/services/audit-service";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminDashboardPage() {
  await requirePageRole("ADMIN");

  const [
    stats,
    students,
    faculty,
    teams,
    projects,
    submissions,
    evaluations,
    notifications,
    health,
    auditLogs,
    applications
  ] = await Promise.all([
    getAdminOverviewStats(),
    getAdminStudents(),
    getAdminFaculty(),
    getAdminTeams(),
    getAdminProjects(),
    getAdminSubmissions(),
    getAdminEvaluations(),
    getAdminNotifications(),
    getAdminSystemHealth(),
    getAuditLogs(),
    getAdminApplications()
  ]);

  // Convert Date objects to strings to prevent serialisation issues in React Client Components
  const serializedStudents = JSON.parse(JSON.stringify(students));
  const serializedSubmissions = JSON.parse(JSON.stringify(submissions));
  const serializedEvaluations = JSON.parse(JSON.stringify(evaluations));
  const serializedNotifications = JSON.parse(JSON.stringify(notifications));
  const serializedAuditLogs = JSON.parse(JSON.stringify(auditLogs));
  const serializedApplications = JSON.parse(JSON.stringify(applications));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tracking-tight text-2xl font-black text-slate-900">Admin Control Center</h1>
          <p className="text-slate-500 text-sm">
            Centralized platform oversight, user management directories, telemetry, and audit logs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-slate-900 text-white hover:bg-slate-850 font-bold rounded-xl shadow-sm h-10 px-4">
            <Link href="/admin/analytics">Platform Analytics</Link>
          </Button>
        </div>
      </div>

      <AdminControlCenter
        stats={stats}
        students={serializedStudents}
        faculty={faculty}
        teams={teams}
        projects={projects}
        submissions={serializedSubmissions}
        evaluations={serializedEvaluations}
        notifications={serializedNotifications}
        health={health}
        auditLogs={serializedAuditLogs}
        applications={serializedApplications}
      />
    </div>
  );
}
