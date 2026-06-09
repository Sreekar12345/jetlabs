import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireSession, getSessionUserRole } from "@/lib/auth/session";
import { generateReportCSV, logAnalyticsAudit } from "@/lib/services/analytics-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const role = getSessionUserRole(session);
    const userId = session.user.id;

    if (!role) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "team";
    const format = searchParams.get("format") || "csv";
    const teamIdFilter = searchParams.get("teamId") || undefined;
    const batchFilter = searchParams.get("batch") || undefined;

    let data: any[] = [];
    let filename = `report_${type}_${Date.now()}.${format === "xlsx" ? "csv" : "csv"}`;

    // 1. Team Report
    if (type === "team") {
      const teams = await db.team.findMany({
        where: role === "FACULTY" ? { facultyId: userId } : undefined,
        include: {
          project: true,
          faculty: { select: { name: true } },
          students: { include: { user: true } },
          submissions: true
        }
      });
      
      let filteredTeams = teams;
      if (batchFilter) filteredTeams = filteredTeams.filter(t => t.batch === batchFilter);
      if (teamIdFilter) filteredTeams = filteredTeams.filter(t => t.id === teamIdFilter);

      data = filteredTeams.map(t => ({
        "Team ID": t.id,
        "Team Name": t.name,
        "Batch": t.batch,
        "Project Title": t.project.title,
        "Faculty Advisor": t.faculty.name,
        "Progress (%)": t.project.progress,
        "Health Status": t.project.healthStatus,
        "Risk Score": t.project.riskScore,
        "Status": t.status,
        "Total Submissions": t.submissions.length,
        "Student Count": t.students.length
      }));
    } 
    // 2. Faculty Report (Admin Only)
    else if (type === "faculty") {
      if (role !== "ADMIN") {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }
      const faculties = await db.user.findMany({
        where: { role: "FACULTY" },
        include: {
          taughtTeams: true,
          evaluations: true
        }
      });
      data = faculties.map(f => ({
        "Faculty ID": f.id,
        "Name": f.name,
        "Email": f.email,
        "Department": f.department || "N/A",
        "Teams Mentored": f.taughtTeams.length,
        "Evaluations Logged": f.evaluations.length,
      }));
    }
    // 3. Student Report
    else if (type === "student") {
      const students = await db.user.findMany({
        where: {
          role: "STUDENT",
          memberships: role === "FACULTY" ? { some: { team: { facultyId: userId } } } : undefined
        },
        include: {
          memberships: { include: { team: true } },
          performance: true
        }
      });
      data = students.map(s => {
        const team = s.memberships[0]?.team;
        return {
          "Student ID": s.id,
          "Name": s.name,
          "Email": s.email,
          "Roll Number": s.rollNumber || "N/A",
          "Batch": team?.batch || "N/A",
          "Team Name": team?.name || "N/A",
          "Performance Score": s.performance?.score ?? 0,
          "Attendance Score": s.performance?.attendanceScore ?? 0,
          "Submission Score": s.performance?.submissionScore ?? 0,
          "Review Score": s.performance?.reviewScore ?? 0,
        };
      });
    }
    // 4. Project Report
    else if (type === "project") {
      const projects = await db.project.findMany({
        where: role === "FACULTY" ? { team: { facultyId: userId } } : undefined,
        include: {
          team: true
        }
      });
      data = projects.map(p => ({
        "Project ID": p.id,
        "Title": p.title,
        "Domain": p.domain,
        "Difficulty": p.difficulty,
        "Status": p.status,
        "Progress (%)": p.progress,
        "Health": p.healthStatus,
        "Risk Score": p.riskScore,
        "Team Name": p.team?.name || "N/A"
      }));
    }
    // 5. Submission Report
    else if (type === "submission") {
      const submissions = await db.submission.findMany({
        where: role === "FACULTY" ? { team: { facultyId: userId } } : undefined,
        include: {
          team: true,
          submittedBy: { select: { name: true } },
          reviewedBy: { select: { name: true } }
        }
      });
      data = submissions.map(s => ({
        "Submission ID": s.id,
        "Team Name": s.team.name,
        "Title": s.title,
        "Type": s.type,
        "Status": s.status,
        "Submitted By": s.submittedBy?.name || "N/A",
        "Submitted At": s.submittedAt,
        "Reviewed By": s.reviewedBy?.name || "N/A",
        "Reviewed At": s.reviewedAt || "N/A",
        "Score": s.score ?? "N/A"
      }));
    }
    // 6. Evaluation Report
    else if (type === "evaluation") {
      const evaluations = await db.evaluation.findMany({
        where: role === "FACULTY" ? { facultyId: userId } : undefined,
        include: {
          team: true,
          project: true,
          faculty: { select: { name: true } }
        }
      });
      data = evaluations.map(e => ({
        "Evaluation ID": e.id,
        "Team Name": e.team.name,
        "Project Title": e.project.title,
        "Week": e.weekNumber,
        "Evaluator": e.faculty.name,
        "Review Date": e.reviewDate,
        "Status": e.status,
        "Score (0-10)": e.score,
        "Completeness": e.completeness,
        "Quality": e.quality,
        "Documentation": e.documentation,
        "Timeliness": e.timeliness,
        "Feedback": e.feedback || "N/A"
      }));
    } else {
      return new Response(JSON.stringify({ error: "Invalid report type" }), { status: 400 });
    }

    // Generate CSV string
    const csvContent = generateReportCSV(type, data);

    // Audit Logging
    await logAnalyticsAudit(
      userId,
      "EXPORT_ACTIVITY",
      type.toUpperCase(),
      format.toUpperCase(),
      `Generated and exported ${type} report containing ${data.length} records.`
    );

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error("Error in export route:", error);
    return new Response(JSON.stringify({ error: "Server error during export" }), { status: 500 });
  }
}
