import { db } from "@/lib/db";
import { EvaluationStatus } from "@prisma/client";

export interface EvaluationInput {
  teamId: string;
  projectId: string;
  weekNumber: number;
  submissionId: string; // contributionId
  facultyId: string;
  status: EvaluationStatus;
  feedback?: string;
  score: number; // 0 to 10
  completeness: number;
  quality: number;
  documentation: number;
  timeliness: number;
  revisionNotes?: string;
}

/**
 * Record a new evaluation, create audit log, and update project progress and team performance.
 */
export async function createEvaluation(input: EvaluationInput) {
  return await db.$transaction(async (tx) => {
    // 1. Create the new Evaluation record
    const evaluation = await tx.evaluation.create({
      data: {
        teamId: input.teamId,
        projectId: input.projectId,
        weekNumber: input.weekNumber,
        submissionId: input.submissionId,
        facultyId: input.facultyId,
        status: input.status,
        feedback: input.feedback || null,
        score: input.score,
        completeness: input.completeness,
        quality: input.quality,
        documentation: input.documentation,
        timeliness: input.timeliness,
        revisionNotes: input.revisionNotes || null,
      },
    });

    // 2. Add an entry to the EvaluationAuditLog
    await tx.evaluationAuditLog.create({
      data: {
        evaluationId: evaluation.id,
        facultyId: input.facultyId,
        previousStatus: "NONE", // Initial status
        newStatus: input.status,
      },
    });

    // 3. Update the corresponding Contribution record's status & marks
    // APPROVED -> REVIEWED
    // REJECTED -> REJECTED
    // REVISION_REQUIRED -> REJECTED (so student can resubmit)
    let contribStatus: "REVIEWED" | "REJECTED" = "REJECTED";
    if (input.status === EvaluationStatus.APPROVED) {
      contribStatus = "REVIEWED";
    }

    await tx.contribution.update({
      where: { id: input.submissionId },
      data: {
        status: contribStatus,
        feedback: input.feedback || null,
        feedbackSuggestions: input.revisionNotes || null,
        facultyMarks: Math.round(input.score),
        reviewedAt: new Date(),
      },
    });

    // 4. Update WeeklyMilestone status if all team contributions for that week are reviewed
    const contribution = await tx.contribution.findUnique({
      where: { id: input.submissionId },
      select: { milestoneId: true },
    });

    if (contribution?.milestoneId) {
      const allMilestoneContributions = await tx.contribution.findMany({
        where: { milestoneId: contribution.milestoneId },
      });

      const allReviewed = allMilestoneContributions.every((c) => c.status === "REVIEWED");
      const anyRejected = allMilestoneContributions.some((c) => c.status === "REJECTED");

      let newMilestoneStatus: "COMPLETED" | "IN_PROGRESS" | "REVIEW_PENDING" = "IN_PROGRESS";
      if (allReviewed) {
        newMilestoneStatus = "COMPLETED";
      } else if (anyRejected) {
        newMilestoneStatus = "IN_PROGRESS";
      } else {
        const allSubmittedOrReviewed = allMilestoneContributions.every(
          (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW" || c.status === "REVIEWED"
        );
        newMilestoneStatus = allSubmittedOrReviewed ? "REVIEW_PENDING" : "IN_PROGRESS";
      }

      await tx.weeklyMilestone.update({
        where: { id: contribution.milestoneId },
        data: { status: newMilestoneStatus },
      });

      // If milestone becomes completed, unlock next week's milestone if locked
      if (newMilestoneStatus === "COMPLETED") {
        const currentMilestone = await tx.weeklyMilestone.findUnique({
          where: { id: contribution.milestoneId },
          select: { weekNumber: true },
        });

        if (currentMilestone) {
          const nextWeekMilestone = await tx.weeklyMilestone.findFirst({
            where: { projectId: input.projectId, weekNumber: currentMilestone.weekNumber + 1 },
          });

          if (nextWeekMilestone && nextWeekMilestone.status === "NOT_STARTED") {
            await tx.weeklyMilestone.update({
              where: { id: nextWeekMilestone.id },
              data: { status: "IN_PROGRESS" },
            });

            // Notify team members
            const team = await tx.team.findUnique({
              where: { id: input.teamId },
              include: { students: true },
            });
            if (team) {
              for (const student of team.students) {
                await tx.notification.create({
                  data: {
                    userId: student.userId,
                    userRole: "STUDENT",
                    title: "Week Activated",
                    message: `Week ${currentMilestone.weekNumber + 1} milestone ("${nextWeekMilestone.title}") is now active. Please check your tasks.`,
                    type: "WEEK_ACTIVATED",
                    relatedEntityId: nextWeekMilestone.id,
                    triggerEvent: "WEEK_ACTIVATED",
                  },
                });
              }
            }
          }
        }
      }
    }

    // 5. Recalculate Project Progress & Team Performance
    const teamStudents = await tx.teamMember.findMany({
      where: { teamId: input.teamId },
    });
    const memberCount = teamStudents.length;
    const totalExpectedTasks = memberCount > 0 ? memberCount * 8 : 8;

    // Completed Tasks
    const completedCount = await tx.contribution.count({
      where: {
        milestone: { projectId: input.projectId },
        status: "REVIEWED",
      },
    });

    const newProgress = Math.min(100, Math.round((completedCount / totalExpectedTasks) * 100));

    // Get the latest evaluation for each contribution that has been evaluated
    const allProjectContributions = await tx.contribution.findMany({
      where: { milestone: { projectId: input.projectId } },
      select: { id: true },
    });

    const contributionIds = allProjectContributions.map((c) => c.id);

    let totalEarnedScore = 0;
    let evaluatedCount = 0;

    for (const cId of contributionIds) {
      const latestEval = await tx.evaluation.findFirst({
        where: { submissionId: cId },
        orderBy: { createdAt: "desc" },
      });
      if (latestEval && latestEval.status === EvaluationStatus.APPROVED) {
        totalEarnedScore += latestEval.score;
        evaluatedCount++;
      }
    }

    const teamPerformance = evaluatedCount > 0
      ? Math.min(100, Math.round((totalEarnedScore / (evaluatedCount * 10)) * 100))
      : 100; // Default to 100 if none evaluated yet

    // Update Project progress
    await tx.project.update({
      where: { id: input.projectId },
      data: {
        progressPercentage: newProgress,
      },
    });

    // We can store the team performance metrics or dynamic stats. Since we have a Performance table
    // or can store it on Project/Team or derive it, let's keep it derived. But let's also update User Performance scorecards!
    // We can update the performance record for each student assignee
    const currentContrib = await tx.contribution.findUnique({
      where: { id: input.submissionId },
      select: { assignedTo: true },
    });

    if (currentContrib?.assignedTo) {
      const studentId = currentContrib.assignedTo;
      // Get all evaluated contributions for this student
      const studentContributions = await tx.contribution.findMany({
        where: {
          assignedTo: studentId,
          status: "REVIEWED",
        },
        select: { id: true },
      });

      const sContribIds = studentContributions.map((c) => c.id);
      let studentEarned = 0;
      let studentCount = 0;

      for (const sId of sContribIds) {
        const latestSEval = await tx.evaluation.findFirst({
          where: { submissionId: sId },
          orderBy: { createdAt: "desc" },
        });
        if (latestSEval) {
          studentEarned += latestSEval.score;
          studentCount++;
        }
      }

      const submissionScore = studentCount > 0 ? Math.round((studentEarned / (studentCount * 10)) * 100) : 0;

      const performanceRecord = await tx.performance.findUnique({
        where: { userId: studentId },
      });

      if (performanceRecord) {
        await tx.performance.update({
          where: { userId: studentId },
          data: {
            submissionScore,
            score: Math.round((performanceRecord.attendanceScore + submissionScore + performanceRecord.reviewScore) / 3),
          },
        });
      }
    }

    return evaluation;
  });
}

/**
 * Retrieve evaluation and status audit history for a specific contribution/submission
 */
export async function getEvaluationHistory(contributionId: string) {
  const evaluations = await db.evaluation.findMany({
    where: { submissionId: contributionId },
    include: {
      faculty: { select: { name: true } },
      auditLogs: {
        orderBy: { timestamp: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return evaluations;
}

/**
 * Returns faculty evaluation metrics, including count by status and team metrics.
 */
export async function getFacultyEvaluationMetrics(facultyId: string) {
  // Find all teams taught by this faculty member
  const teams = await db.team.findMany({
    where: { facultyId },
    include: {
      project: true,
      students: { include: { user: true } },
    },
  });

  const teamIds = teams.map((t) => t.id);
  const projectIds = teams.map((t) => t.project.id);

  // Fetch all contributions for these projects
  const contributions = await db.contribution.findMany({
    where: {
      milestone: { projectId: { in: projectIds } },
    },
    include: {
      milestone: true,
      assignee: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  // Count metrics based on Contribution status
  const pending = contributions.filter((c: any) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW").length;
  const approved = contributions.filter((c: any) => c.status === "REVIEWED").length;

  // For rejected and revision requests:
  // Let's count from the latest evaluation records
  let rejected = 0;
  let revisionRequests = 0;

  for (const c of contributions) {
    const latestEval = await db.evaluation.findFirst({
      where: { submissionId: c.id },
      orderBy: { createdAt: "desc" },
    });
    if (latestEval) {
      if (latestEval.status === EvaluationStatus.REJECTED) {
        rejected++;
      } else if (latestEval.status === EvaluationStatus.REVISION_REQUIRED) {
        revisionRequests++;
      }
    }
  }

  // Calculate team metrics
  const teamMetrics = await Promise.all(
    teams.map(async (team) => {
      const projectContributions = contributions.filter((c: any) => c.milestone.projectId === team.project.id);
      const projectContribIds = projectContributions.map((c) => c.id);

      let totalEarnedScore = 0;
      let evaluatedCount = 0;

      for (const cId of projectContribIds) {
        const latestEval = await db.evaluation.findFirst({
          where: { submissionId: cId },
          orderBy: { createdAt: "desc" },
        });
        if (latestEval && latestEval.status === EvaluationStatus.APPROVED) {
          totalEarnedScore += latestEval.score;
          evaluatedCount++;
        }
      }

      const teamPerf = evaluatedCount > 0
        ? Math.round((totalEarnedScore / (evaluatedCount * 10)) * 100)
        : 100;

      const memberCount = team.students.length;
      const totalExpectedTasks = memberCount > 0 ? memberCount * 8 : 8;
      const completedTasks = projectContributions.filter((c: any) => c.status === "REVIEWED").length;
      const progress = Math.min(100, Math.round((completedTasks / totalExpectedTasks) * 100));

      return {
        teamId: team.id,
        teamName: team.name,
        batch: team.batch,
        projectTitle: team.project.title,
        progressPercentage: progress,
        performanceScore: teamPerf,
      };
    })
  );

  return {
    metrics: {
      pending,
      approved,
      rejected,
      revisionRequests,
    },
    teamMetrics,
    submissions: contributions.map((c: any) => ({
      id: c.id,
      title: c.title,
      studentName: c.assignee.name,
      weekNumber: c.milestone.weekNumber,
      submittedAt: c.submittedAt ? c.submittedAt.toISOString() : null,
      status: c.status,
      githubUrl: c.githubUrl,
      demoUrl: c.demoUrl,
      uploadedFiles: c.uploadedFiles,
      notes: c.notes,
      teamId: teams.find((t: any) => t.project.id === c.milestone.projectId)?.id ?? "",
      teamName: teams.find((t: any) => t.project.id === c.milestone.projectId)?.name ?? "",
      projectId: c.milestone.projectId,
    })),
  };
}

/**
 * Returns evaluation data for a student, including scores, history, and progress.
 */
export async function getStudentEvaluationData(studentId: string) {
  // Find team membership
  const membership = await db.teamMember.findFirst({
    where: { userId: studentId },
    include: {
      user: true,
      team: {
        include: {
          project: true,
          students: { include: { user: true } },
        },
      },
    },
  });

  if (!membership) {
    return null;
  }

  const team = membership.team;
  const project = team.project;

  // Fetch all contributions assigned to this student
  const studentContributions = await db.contribution.findMany({
    where: { assignedTo: studentId },
    include: { milestone: true },
    orderBy: { milestone: { weekNumber: "asc" } },
  });

  const contributionIds = studentContributions.map((c) => c.id);

  // Fetch all evaluations for these contributions
  const evaluations = await db.evaluation.findMany({
    where: { submissionId: { in: contributionIds } },
    include: {
      faculty: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Overall calculations
  const teamStudents = team.students;
  const memberCount = teamStudents.length;
  const totalExpectedTasks = memberCount > 0 ? memberCount * 8 : 8;

  // Completed Tasks for the project
  const completedCount = await db.contribution.count({
    where: {
      milestone: { projectId: project.id },
      status: "REVIEWED",
    },
  });

  const progress = Math.min(100, Math.round((completedCount / totalExpectedTasks) * 100));

  // Team Performance
  const projectContributions = await db.contribution.findMany({
    where: { milestone: { projectId: project.id } },
    select: { id: true },
  });

  const pContribIds = projectContributions.map((c) => c.id);

  let totalEarnedScore = 0;
  let evaluatedCount = 0;

  for (const cId of pContribIds) {
    const latestEval = await db.evaluation.findFirst({
      where: { submissionId: cId },
      orderBy: { createdAt: "desc" },
    });
    if (latestEval && latestEval.status === EvaluationStatus.APPROVED) {
      totalEarnedScore += latestEval.score;
      evaluatedCount++;
    }
  }

  const teamPerf = evaluatedCount > 0
    ? Math.round((totalEarnedScore / (evaluatedCount * 10)) * 100)
    : 100;

  // Student specific average
  const approvedEvals = evaluations.filter((e: any) => e.status === EvaluationStatus.APPROVED);
  const studentAvgScore = approvedEvals.length > 0
    ? Number((approvedEvals.reduce((sum: number, e: any) => sum + e.score, 0) / approvedEvals.length).toFixed(1))
    : 0;

  return {
    studentName: membership.user.name,
    teamName: team.name,
    projectTitle: project.title,
    progressPercentage: progress,
    teamPerformance: teamPerf,
    studentAverageScore: studentAvgScore,
    weeklyScores: studentContributions.map((c) => {
      const contribEvals = evaluations.filter((e: any) => e.submissionId === c.id);
      const latestApproved = contribEvals.find((e: any) => e.status === EvaluationStatus.APPROVED);
      const latestRevision = contribEvals.find((e: any) => e.status === EvaluationStatus.REVISION_REQUIRED);

      return {
        weekNumber: c.milestone.weekNumber,
        taskTitle: c.title,
        status: c.status,
        score: latestApproved ? latestApproved.score : null,
        feedback: latestApproved ? latestApproved.feedback : latestRevision ? latestRevision.feedback : null,
        completeness: latestApproved ? latestApproved.completeness : null,
        quality: latestApproved ? latestApproved.quality : null,
        documentation: latestApproved ? latestApproved.documentation : null,
        timeliness: latestApproved ? latestApproved.timeliness : null,
        isRevisionRequired: latestRevision && (!latestApproved || latestApproved.createdAt < latestRevision.createdAt),
      };
    }),
    evaluationHistory: evaluations.map((e: any) => ({
      id: e.id,
      weekNumber: e.weekNumber,
      taskTitle: studentContributions.find((c) => c.id === e.submissionId)?.title ?? "Weekly Task",
      facultyName: e.faculty.name,
      status: e.status,
      feedback: e.feedback,
      score: e.score,
      completeness: e.completeness,
      quality: e.quality,
      documentation: e.documentation,
      timeliness: e.timeliness,
      revisionNotes: e.revisionNotes,
      reviewDate: e.reviewDate.toISOString(),
    })),
  };
}
