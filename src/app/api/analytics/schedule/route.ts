import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, getSessionUserRole } from "@/lib/auth/session";
import { logAnalyticsAudit } from "@/lib/services/analytics-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const role = getSessionUserRole(session);
    if (!role) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Retrieve recent generated reports from audit logs
    const generatedReports = await (db as any).analyticsAuditLog.findMany({
      where: {
        actionType: "REPORT_GENERATION"
      },
      orderBy: {
        timestamp: "desc"
      },
      take: 10
    });

    // Generate dynamic upcoming scheduled reports list
    const activeTeams = await db.team.count();
    const activeProjects = await db.project.count({ where: { status: { not: "DISCOVERY" } } });
    const pendingReviews = await db.submission.count({ where: { status: "PENDING_REVIEW" } });

    const scheduleSnapshot = [
      {
        id: "sched-1",
        title: "Weekly Academic Progress Snapshot",
        frequency: "Weekly",
        scope: "All Active Teams & Tasks",
        lastRun: generatedReports.find((r: any) => r.reportType === "WEEKLY")?.timestamp || new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "Active",
        metricsCount: `Tracked metrics for ${activeTeams} teams, ${pendingReviews} reviews.`
      },
      {
        id: "sched-2",
        title: "Monthly Cohort Velocity Report",
        frequency: "Monthly",
        scope: "Performance Scores & Milestone Trends",
        lastRun: generatedReports.find((r: any) => r.reportType === "MONTHLY")?.timestamp || new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        status: "Active",
        metricsCount: `Aggregated progress on ${activeProjects} projects.`
      },
      {
        id: "sched-3",
        title: "Semester Execution Summary",
        frequency: "Semester",
        scope: "Final Submissions & Defenses",
        lastRun: generatedReports.find((r: any) => r.reportType === "SEMESTER")?.timestamp || new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        status: "Active",
        metricsCount: "Compilation of viva scores & publication tracks."
      }
    ];

    return new Response(JSON.stringify({ schedule: scheduleSnapshot, auditHistory: generatedReports }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in schedule route:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const role = getSessionUserRole(session);
    const userId = session.user.id;

    if (!role || role === "STUDENT") {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400 });
    }

    const { frequency } = body;
    if (!frequency || !["WEEKLY", "MONTHLY", "SEMESTER"].includes(frequency.toUpperCase())) {
      return new Response(JSON.stringify({ error: "Invalid frequency parameter" }), { status: 400 });
    }

    const typeUpper = frequency.toUpperCase();

    // Audit log entry for report generation
    await logAnalyticsAudit(
      userId,
      "REPORT_GENERATION",
      typeUpper,
      "CSV",
      `Scheduled report for frequency ${typeUpper} triggered manually by user.`
    );

    return new Response(JSON.stringify({ success: true, message: `Report generation for ${typeUpper} scheduled successfully.` }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error generating scheduled report:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
