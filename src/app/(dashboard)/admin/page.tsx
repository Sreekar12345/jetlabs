import { KpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requirePageSession } from "@/lib/auth/session";
import { getAdminDashboardData } from "@/services/dashboard-service";

function submissionBadge(status: string) {
  if (status === "approved") {
    return "secondary";
  }

  if (status === "rejected") {
    return "destructive";
  }

  return "outline";
}

function formatDate(date: string) {
  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default async function AdminDashboardPage() {
  await requirePageSession();
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="tracking-tight">Admin dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Live platform operations sourced from Prisma and Neon
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Users" value={`${data.totalUsers}`} hint="All authenticated accounts" />
        <KpiCard
          label="Students"
          value={`${data.totalStudents}`}
          hint="Student profiles created"
          tone={data.totalStudents > 0 ? "success" : "default"}
        />
        <KpiCard
          label="Faculty"
          value={`${data.totalFaculty}`}
          hint="Faculty profiles created"
          tone={data.totalFaculty > 0 ? "success" : "default"}
        />
        <KpiCard
          label="Projects"
          value={`${data.totalProjects}`}
          hint="Projects linked to teams"
          tone={data.totalProjects > 0 ? "success" : "default"}
        />
        <KpiCard
          label="Teams"
          value={`${data.totalTeams}`}
          hint="Active team records"
          tone={data.totalTeams > 0 ? "success" : "default"}
        />
        <KpiCard
          label="Pending reviews"
          value={`${data.pendingReviewCount}`}
          hint="Submissions waiting for faculty follow-up"
          tone={data.pendingReviewCount > 0 ? "warn" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Batch analytics</CardTitle>
            <CardDescription>Live attendance and project progress by batch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.analytics.length > 0 ? (
              data.analytics.map((batch) => (
                <div key={batch.batchId} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div>{batch.batchName}</div>
                      <div className="text-sm text-muted-foreground">
                        {batch.totalStudents} student{batch.totalStudents === 1 ? "" : "s"} ·{" "}
                        {batch.atRiskCount} at risk
                      </div>
                    </div>
                    <Badge variant="outline">{batch.avgAttendance}% attendance</Badge>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Average progress</span>
                      <span className="text-muted-foreground">{batch.avgProgress}%</span>
                    </div>
                    <Progress value={batch.avgProgress} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No batch analytics are available yet because there are no student dashboard records in
                the database.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project status mix</CardTitle>
            <CardDescription>Current status distribution across all projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.projectStatuses.length > 0 ? (
              data.projectStatuses.map((status) => (
                <div key={status.label} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>{status.label}</div>
                    <Badge variant="outline">{status.count}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No projects exist yet, so there is no status breakdown to show.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent users</CardTitle>
            <CardDescription>Latest user registrations and account state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentUsers.length > 0 ? (
              data.recentUsers.map((user) => (
                <div key={user.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div>{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{user.role}</Badge>
                      <Badge variant={user.isActive ? "secondary" : "destructive"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Created {formatDate(user.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No users have been created yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent submissions</CardTitle>
            <CardDescription>Latest student delivery activity across the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentSubmissions.length > 0 ? (
              data.recentSubmissions.map((submission) => (
                <div key={submission.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div>{submission.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {submission.studentName} · {submission.roll}
                      </div>
                    </div>
                    <Badge variant={submissionBadge(submission.status)}>
                      Week {submission.week} · {submission.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Submitted {formatDate(submission.submittedAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No submission records are stored yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students needing intervention</CardTitle>
          <CardDescription>Cross-platform risk scoring for academic and execution follow-up</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.atRiskStudents.length > 0 ? (
            data.atRiskStudents.map((student) => (
              <div key={student.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div>{student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.roll} · {student.batch}
                    </div>
                  </div>
                  <Badge
                    variant={student.riskLevel === "Critical" ? "destructive" : "outline"}
                  >
                    {student.riskLevel}
                  </Badge>
                </div>
                <div className="text-sm mt-2">{student.project || "No project assigned"}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 flex-wrap">
                  <span>{student.attendanceOverall}% attendance</span>
                  <span>{student.missedSubmissions} missed submissions</span>
                  <span>{student.inactiveDays} inactive days</span>
                  <span>{student.paperProgress}% paper progress</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {student.reasons.map((reason) => (
                    <Badge key={reason} variant="outline">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No high-risk students are currently flagged by the live scoring rules.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
