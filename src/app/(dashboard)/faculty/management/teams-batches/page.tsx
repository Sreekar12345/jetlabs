import { FacultyTeamExecutionView } from "@/components/dashboard/faculty-team-execution-view";
import { dashboardModules } from "@/data/dashboard-modules";
import { db } from "@/lib/db";
import { requirePageSession } from "@/lib/auth/session";

export default async function FacultyTeamsBatchesPage() {
  const session = await requirePageSession();
  const dbTeams = await db.team.findMany({
    where: { facultyId: session.user.id },
    include: {
      students: { include: { user: { select: { id: true, name: true } } } },
      project: { include: { milestones: { orderBy: { position: "asc" } } } },
      submissions: { orderBy: { submittedAt: "desc" } },
      faculty: { select: { name: true } },
      selectedProblemStatement: true,
      tasks: { orderBy: [{ week: "asc" }, { createdAt: "desc" }] },
    },
    orderBy: { createdAt: "desc" },
  });

  const initialTeams = dbTeams.map((team) => {
    const memberCount = team.students.length;
    const sortedStudents = [...team.students].sort((a, b) => {
      if (a.role === "TEAM_LEAD" && b.role !== "TEAM_LEAD") return -1;
      if (a.role !== "TEAM_LEAD" && b.role === "TEAM_LEAD") return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    const submissionCount = team.submissions.length;
    const projectProgress = team.project?.progress ?? 0;
    const completedMilestones = team.project?.milestones?.filter(m => m.status === "COMPLETED").length ?? 0;
    const totalMilestones = team.project?.milestones?.length ?? 0;
    const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    const latestMilestone = team.project?.milestones?.find(m => m.status !== "COMPLETED");
    const pendingReviews = team.submissions.filter(s => s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW").length;
    const lastSubmission = team.submissions[0];
    const daysSinceLastSubmission = lastSubmission ? Math.floor((Date.now() - lastSubmission.submittedAt.getTime()) / (1000 * 60 * 60 * 24)) : 999;

    let state: "Healthy execution" | "Needs review" | "Slowing down" | "Blocked" | "High risk" | "Critical" = "Healthy execution";
    if (projectProgress === 0 && submissionCount === 0) state = "Blocked";
    else if (daysSinceLastSubmission > 10) state = "High risk";
    else if (daysSinceLastSubmission > 5) state = "Slowing down";
    else if (pendingReviews > 2) state = "Needs review";

    const confidence = Math.min(100, Math.max(0, projectProgress * 0.4 + milestoneProgress * 0.3 + Math.min(submissionCount * 5, 30)));

    return {
      id: team.id,
      name: team.name,
      department: team.batch,
      members: memberCount,
      mentor: team.faculty?.name ?? "Unassigned",
      sprint: `Week ${Math.max(1, Math.ceil((Date.now() - team.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)))}`,
      state,
      confidence: Math.round(confidence),
      priority: confidence >= 80 ? "P3" : confidence >= 60 ? "P2" : confidence >= 40 ? "P1" : "P0",
      project: team.project?.title ?? team.projectTitle,
      milestone: latestMilestone?.title ?? "No milestones",
      submissions: Math.min(100, submissionCount * 10),
      velocity: projectProgress,
      ieee: 0,
      viva: 0,
      deployment: 0,
      collaboration: memberCount > 0 ? Math.min(100, memberCount * 25) : 0,
      pendingReviews,
      lastMentor: daysSinceLastSubmission < 999 ? (daysSinceLastSubmission === 0 ? "today" : `${daysSinceLastSubmission} day${daysSinceLastSubmission > 1 ? "s" : ""} ago`) : "No submissions",
      streak: submissionCount > 0 ? `${submissionCount} total submissions` : "No submissions yet",
      bottleneck: pendingReviews > 2 ? `${pendingReviews} pending reviews` : daysSinceLastSubmission > 7 ? "Inactive" : "None",
      prediction: confidence >= 80 ? "On track for completion." : confidence >= 50 ? "Monitor progress." : "Intervention recommended.",
      recommendation: confidence >= 80 ? "Maintain current pace." : confidence >= 50 ? "Schedule check-in." : "Immediate mentor review needed.",
      signals: [
        ...(daysSinceLastSubmission > 7 ? ["Inactive"] : []),
        ...(pendingReviews > 0 ? [`${pendingReviews} pending reviews`] : []),
        ...(projectProgress >= 70 ? ["Good progress"] : []),
      ],
      contribution: sortedStudents.map((s) => ({
        member: s.user.name?.split(" ")[0] ?? "Member",
        value: memberCount > 0 ? Math.round(100 / memberCount) : 0,
        status: s.role === "TEAM_LEAD" ? "Team Lead" : "Member",
        role: s.role,
        roleLabel: s.roleLabel,
      })),
      heatmap: Array.from({ length: 12 }, () => Math.min(10, Math.max(0, Math.round(projectProgress / 10)))),
      timeline: [
        ...(submissionCount > 0 ? [{ label: "First submission", type: "submission" as const, week: "W1" }] : []),
        ...(latestMilestone ? [{ label: latestMilestone.title, type: "review" as const, week: `W${Math.max(1, Math.ceil((Date.now() - team.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)))}` }] : []),
      ],
      selectedProblemStatement: team.selectedProblemStatement,
      tasks: team.tasks,
      projectId: team.projectId,
    };
  });

  return (
    <FacultyTeamExecutionView
      module={dashboardModules["/faculty/management/teams-batches"]}
      initialTeams={initialTeams}
    />
  );
}
