import { db } from "@/lib/db";
import { EvaluationStatus } from "@prisma/client";

export async function getFacultyWorkspaceData(facultyId: string) {
  // Query all teams assigned to this faculty guide
  const teams = await db.team.findMany({
    where: { facultyId },
    include: {
      students: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              performance: {
                select: {
                  score: true,
                  attendanceScore: true,
                  submissionScore: true,
                  reviewScore: true,
                },
              },
            },
          },
        },
      },
      project: {
        include: {
          milestones: {
            orderBy: { position: "asc" },
          },
          projectTasks: {
            orderBy: { dueDate: "asc" },
          },
          weeklyMilestones: {
            orderBy: { weekNumber: "asc" },
          },
        },
      },
      selectedProblemStatement: true,
      submissions: {
        orderBy: { submittedAt: "desc" },
        include: {
          reviews: {
            orderBy: { createdAt: "desc" },
          },
          submittedBy: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const projectIds = teams.map((t) => t.project?.id).filter(Boolean) as string[];

  // Query all weekly contributions for these projects
  const contributions = await db.contribution.findMany({
    where: {
      milestone: {
        projectId: { in: projectIds },
      },
    },
    include: {
      milestone: true,
      assignee: {
        select: { id: true, name: true, email: true },
      },
      evaluations: {
        include: {
          faculty: { select: { name: true } },
          auditLogs: {
            orderBy: { timestamp: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  // Query notifications for this faculty guide
  const notifications = await db.notification.findMany({
    where: {
      userId: facultyId,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Query evaluation audit logs for actions performed by this faculty guide
  const auditLogs = await db.evaluationAuditLog.findMany({
    where: {
      facultyId,
    },
    include: {
      evaluation: {
        include: {
          team: { select: { name: true } },
          contribution: { select: { title: true } },
        },
      },
    },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  // Process the datasets into user-friendly shapes for UI consumption
  const processedTeams = teams.map((team) => {
    const memberCount = team.students.length;
    const sortedStudents = [...team.students].sort((a, b) => {
      if (a.role === "TEAM_LEAD" && b.role !== "TEAM_LEAD") return -1;
      if (a.role !== "TEAM_LEAD" && b.role === "TEAM_LEAD") return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const projectProgress = team.project?.progressPercentage ?? 0;
    const completedMilestones =
      team.project?.milestones?.filter((m) => m.status === "COMPLETED").length ?? 0;
    const totalMilestones = team.project?.milestones?.length ?? 0;
    const milestoneProgress =
      totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    const latestMilestone = team.project?.milestones?.find((m) => m.status !== "COMPLETED");

    // Submissions
    const milestoneSubmissionCount = team.submissions.length;
    const pendingMilestoneReviews = team.submissions.filter(
      (s) => s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW"
    ).length;

    // Contributions (weekly tasks)
    const teamContributions = contributions.filter((c) => c.milestone.projectId === team.project?.id);
    const pendingWeeklyReviews = teamContributions.filter(
      (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW"
    ).length;

    const totalPendingReviews = pendingMilestoneReviews + pendingWeeklyReviews;

    // Days since last activity
    const lastSubmission = team.submissions[0];
    const lastContribution = [...teamContributions].sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    })[0];

    const activeDates: Date[] = [];
    if (lastSubmission?.submittedAt) activeDates.push(lastSubmission.submittedAt);
    if (lastContribution?.submittedAt) activeDates.push(lastContribution.submittedAt);
    activeDates.push(team.createdAt);

    const lastActiveDate = activeDates.sort((a, b) => b.getTime() - a.getTime())[0];

    const daysSinceLastActive = lastActiveDate
      ? Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let state:
      | "Healthy execution"
      | "Needs review"
      | "Slowing down"
      | "Blocked"
      | "High risk"
      | "Critical" = "Healthy execution";
    if (projectProgress === 0 && milestoneSubmissionCount === 0) {
      state = "Blocked";
    } else if (daysSinceLastActive > 10) {
      state = "High risk";
    } else if (daysSinceLastActive > 5) {
      state = "Slowing down";
    } else if (totalPendingReviews > 0) {
      state = "Needs review";
    }

    const confidence = Math.min(
      100,
      Math.max(
        0,
        projectProgress * 0.4 + milestoneProgress * 0.3 + Math.min(milestoneSubmissionCount * 5, 30)
      )
    );

    return {
      id: team.id,
      name: team.name,
      teamCode: team.teamCode,
      batch: team.batch,
      members: memberCount,
      studentsList: sortedStudents.map((s) => ({
        id: s.user.id,
        name: s.user.name,
        email: s.user.email,
        role: s.role,
        roleLabel: s.roleLabel,
        avatar: s.user.avatar,
        performance: s.user.performance,
      })),
      selectedProblemStatement: team.selectedProblemStatement,
      project: team.project
        ? {
            id: team.project.id,
            title: team.project.title,
            description: team.project.description,
            domain: team.project.domain,
            difficulty: team.project.difficulty,
            progress: projectProgress,
            milestones: team.project.milestones,
            projectTasks: team.project.projectTasks,
            weeklyMilestones: team.project.weeklyMilestones,
          }
        : null,
      currentWeek: Math.max(
        1,
        Math.ceil((Date.now() - team.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000))
      ),
      state,
      confidence: Math.round(confidence),
      priority: confidence >= 80 ? "P3" : confidence >= 60 ? "P2" : confidence >= 40 ? "P1" : "P0",
      submissions: team.submissions,
      contributions: teamContributions,
      totalPendingReviews,
      daysSinceLastActive,
      lastActiveDate,
    };
  });

  return {
    assignedTeams: processedTeams,
    contributions,
    notifications,
    auditLogs,
  };
}
