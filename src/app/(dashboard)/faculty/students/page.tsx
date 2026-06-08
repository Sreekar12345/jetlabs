import { FacultyStudentIntelligenceView } from "@/components/dashboard/faculty-student-intelligence-view";
import { facultyModules } from "@/data/dashboard-modules";
import { db } from "@/lib/db";
import { requirePageSession } from "@/lib/auth/session";

export default async function Page() {
  const session = await requirePageSession();
  const dbStudents = await db.user.findMany({
    where: {
      role: "STUDENT",
      memberships: {
        some: {
          team: {
            facultyId: session.user.id,
          },
        },
      },
    },
    include: {
      performance: {
        select: { score: true, attendanceScore: true, submissionScore: true, reviewScore: true },
      },
      memberships: {
        take: 1,
        orderBy: { updatedAt: "desc" },
        include: {
          team: {
            include: {
              project: { select: { title: true, progress: true, status: true } },
              submissions: { orderBy: { submittedAt: "desc" }, take: 5 },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const initialStudents = dbStudents.map((student) => {
    const membership = student.memberships[0];
    const team = membership?.team;
    const perf = student.performance;
    const attendance = perf?.attendanceScore ?? 0;
    const submissions = perf?.submissionScore ?? 0;
    const projectProgress = team?.project?.progress ?? 0;
    const submissionCount = team?.submissions?.length ?? 0;
    const lastSubmission = team?.submissions?.[0];
    const daysSinceLastSubmission = lastSubmission
      ? Math.floor((Date.now() - lastSubmission.submittedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let risk: "Healthy" | "Slowing Down" | "At Risk" | "Critical" = "Healthy";
    if (attendance < 65) risk = "Critical";
    else if (attendance < 75 || daysSinceLastSubmission > 10) risk = "At Risk";
    else if (daysSinceLastSubmission > 5 || submissions < 50) risk = "Slowing Down";

    const confidence = Math.min(100, Math.max(0, attendance * 0.3 + submissions * 0.3 + projectProgress * 0.4));
    const initials = (student.name ?? "").split(" ").filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("");

    return {
      id: student.id,
      name: student.name ?? "Unknown",
      roll: student.rollNumber ?? student.id.slice(-6).toUpperCase(),
      batch: team?.batch ?? "Unassigned",
      department: student.department ?? "N/A",
      avatar: initials,
      risk,
      confidence: Math.round(confidence),
      priority: confidence >= 80 ? "P3" : confidence >= 60 ? "P2" : confidence >= 40 ? "P1" : "P0",
      concern: risk === "Healthy" ? "On track" : risk === "Critical" ? "Immediate attention needed" : "Monitor closely",
      streak: submissionCount > 0 ? `${submissionCount} submissions` : "0 days",
      reputation: risk === "Healthy" ? "Consistent" : risk === "Critical" ? "At risk" : "Needs attention",
      attendance,
      submissions,
      velocity: projectProgress,
      ieee: 0,
      viva: 0,
      backlog: "Clear",
      project: team?.project?.title ?? "No project",
      milestone: "N/A",
      deployment: "N/A",
      bottleneck: daysSinceLastSubmission > 7 ? "Inactive" : "None",
      trend: risk === "Healthy" ? "Stable execution" : "Needs improvement",
      prediction: risk === "Healthy" ? "On track for completion" : "Risk of delay",
      recommendation: risk === "Critical" ? "Immediate intervention" : risk === "At Risk" ? "Schedule check-in" : "Maintain pace",
      signals: [
        ...(attendance < 75 ? ["Low attendance"] : []),
        ...(daysSinceLastSubmission > 7 ? ["Inactive"] : []),
        ...(submissions >= 80 ? ["Good submissions"] : []),
      ],
      activity: Array.from({ length: 12 }, () => Math.min(10, Math.max(0, Math.round(attendance / 10)))),
      cgpa: Number(((perf?.score ?? 0) / 10).toFixed(1)),
      section: team?.batch?.includes("B") ? "Sec B" : "Sec A",
      paper: 0,
    };
  });

  return <FacultyStudentIntelligenceView module={facultyModules["students"]} initialStudents={initialStudents} />;
}
