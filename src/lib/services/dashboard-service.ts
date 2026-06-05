// @ts-nocheck
import { MilestoneStatus, SubmissionStatus, SubmissionType, type Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getTeamScopeWhere, hasAllowedRole } from "@/lib/permissions";
import {
  average,
  buildActivityItem,
  clampPercentage,
  firstName,
  formatDateLabel,
  formatDateTimeLabel,
  formatRelativeDaysLabel,
  mapProjectStatusLabel,
  mapStudentSubmissionStatus,
} from "@/lib/services/shared";
import type {
  Batch,
  BatchAnalytics,
  Milestone,
  PerformanceDistribution,
  Student,
  TeamRow,
  WeeklyChartPoint,
} from "@/types";
import type {
  ActivityFeedItem,
  FacultyDashboardData,
  StudentDashboardData,
} from "@/types/aoip";

const studentDashboardInclude = {
  performance: {
    select: {
      score: true,
      attendanceScore: true,
      submissionScore: true,
      reviewScore: true,
    },
  },
  achievements: {
    orderBy: [{ points: "desc" }, { createdAt: "desc" }],
    take: 4,
    select: {
      id: true,
      title: true,
      description: true,
      badge: true,
      points: true,
    },
  },
  memberships: {
    orderBy: {
      updatedAt: "desc",
    },
    take: 1,
    include: {
      team: {
        include: {
          faculty: {
            select: {
              id: true,
              name: true,
            },
          },
          project: {
            include: {
              milestones: {
                orderBy: {
                  position: "asc",
                },
              },
              analytics: {
                orderBy: {
                  sequence: "asc",
                },
              },
            },
          },
          submissions: {
            orderBy: {
              submittedAt: "desc",
            },
            include: {
              submittedBy: {
                select: {
                  name: true,
                },
              },
              reviewedBy: {
                select: {
                  name: true,
                },
              },
              reviews: {
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },
          activityEvents: {
            orderBy: {
              createdAt: "desc",
            },
            take: 8,
          },
        },
      },
    },
  },
} satisfies Prisma.UserInclude;

const facultyDashboardInclude = {
  taughtTeams: {
    orderBy: [{ batch: "asc" }, { name: "asc" }],
    include: {
      students: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
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
          analytics: {
            orderBy: {
              sequence: "asc",
            },
          },
        },
      },
      submissions: {
        orderBy: {
          submittedAt: "desc",
        },
        include: {
          reviews: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
      activityEvents: {
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
      },
    },
  },
} satisfies Prisma.UserInclude;

const studentRosterInclude = {
  performance: {
    select: {
      score: true,
      attendanceScore: true,
      submissionScore: true,
      reviewScore: true,
    },
  },
  achievements: {
    orderBy: {
      createdAt: "desc",
    },
    take: 2,
    select: {
      title: true,
      badge: true,
      points: true,
      createdAt: true,
    },
  },
  memberships: {
    orderBy: {
      updatedAt: "desc",
    },
    take: 1,
    include: {
      team: {
        include: {
          faculty: {
            select: {
              name: true,
            },
          },
          project: {
            include: {
              analytics: {
                orderBy: {
                  sequence: "asc",
                },
              },
            },
          },
          submissions: {
            orderBy: {
              submittedAt: "desc",
            },
          },
          activityEvents: {
            orderBy: {
              createdAt: "desc",
            },
            take: 2,
          },
        },
      },
    },
  },
} satisfies Prisma.UserInclude;

type StudentDashboardRecord = Prisma.UserGetPayload<{
  include: typeof studentDashboardInclude;
}>;

type FacultyDashboardRecord = Prisma.UserGetPayload<{
  include: typeof facultyDashboardInclude;
}>;

type StudentRosterRecord = Prisma.UserGetPayload<{
  include: typeof studentRosterInclude;
}>;

function submissionProgress(status: SubmissionStatus) {
  switch (status) {
    case "APPROVED":
      return 100;
    case "UNDER_REVIEW":
      return 72;
    case "PENDING_REVIEW":
      return 58;
    case "REVISION_REQUIRED":
      return 44;
    case "REJECTED":
      return 28;
    case "DRAFT":
    default:
      return 16;
  }
}

function getMilestoneProgress(milestones: Array<{ status: MilestoneStatus }>) {
  if (milestones.length === 0) {
    return 0;
  }

  return clampPercentage(
    (milestones.filter((milestone) => milestone.status === "COMPLETED").length /
      milestones.length) *
      100,
  );
}

function getPendingSubmissionCount(submissions: Array<{ status: SubmissionStatus }>) {
  return submissions.filter(
    (submission) =>
      submission.status === "PENDING_REVIEW" ||
      submission.status === "UNDER_REVIEW" ||
      submission.status === "REVISION_REQUIRED",
  ).length;
}

function getAverageReviewScore(
  submissions: Array<{ score: number | null }>,
) {
  const scores = submissions
    .map((submission) => submission.score)
    .filter((score): score is number => typeof score === "number");

  return scores.length > 0 ? average(scores) : null;
}

function getVivaReadiness(input: {
  projectProgress: number;
  performanceScore: number;
  reviewScore: number;
}) {
  return clampPercentage(
    input.projectProgress * 0.35 +
      input.performanceScore * 0.35 +
      input.reviewScore * 0.3,
  );
}

function toMilestoneState(status: MilestoneStatus): Milestone["state"] {
  if (status === "COMPLETED") {
    return "done";
  }

  if (status === "IN_PROGRESS") {
    return "current";
  }

  return "todo";
}

function getStudentActivityItems(record: StudentDashboardRecord): ActivityFeedItem[] {
  const membership = record.memberships[0];
  const team = membership?.team;

  if (!team) {
    return [];
  }

  const activity = [
    ...team.activityEvents.map((event: any) =>
      buildActivityItem({
        id: event.id,
        title: event.title,
        detail: event.detail,
        date: event.createdAt,
        tag: event.type,
      }),
    ),
    ...team.submissions.slice(0, 3).map((submission: any) =>
      buildActivityItem({
        id: `submission-${submission.id}`,
        title: submission.title,
        detail: `${submission.submittedBy?.name ?? "Team member"} submitted ${submission.type.toLowerCase()} evidence`,
        date: submission.submittedAt,
        tag: submission.status.replaceAll("_", " "),
      }),
    ),
  ];

  return activity
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
    .slice(0, 6);
}

export async function getStudentDashboardData(
  userId: string,
): Promise<StudentDashboardData> {
  const record = await db.user.findUnique({
    where: {
      id: userId,
    },
    relationLoadStrategy: "join",
    include: studentDashboardInclude,
  });

  if (!record || record.role !== "STUDENT") {
    return {
      welcome: {
        title: "Welcome to Syntra",
        subtitle: "Your academic operating system is ready once a team is assigned.",
        project: "Project pending",
        cohort: "Team not assigned",
      },
      stats: [],
      progressTrackers: [],
      submissions: [],
      deadlines: [],
      scorecards: [],
      achievements: [],
      feedback: [],
      activity: [],
      researchSeries: [],
    };
  }

  const membership = record.memberships[0];
  const team = membership?.team;
  const project = team?.project;
  const performance = record.performance;
  const milestones = project?.milestones ?? [];
  const submissions = team?.submissions ?? [];
  const pendingReviewCount = getPendingSubmissionCount(submissions);
  const averageReviewScore = getAverageReviewScore(submissions) ?? 0;
  const performanceScore = performance?.score ?? 0;
  const projectProgress = project?.progress ?? 0;
  const vivaReadiness = getVivaReadiness({
    projectProgress,
    performanceScore,
    reviewScore: performance?.reviewScore ?? averageReviewScore,
  });
  const groupedStages: StudentDashboardData["progressTrackers"] = Array.from(
    new Map<string, any>(
      milestones.map((milestone: any) => {
        const stageMilestones = milestones.filter(
          (candidate: any) => candidate.stage === milestone.stage,
        );
        const progress = getMilestoneProgress(stageMilestones);
        const status: "Completed" | "Active" | "Queued" =
          progress === 100
            ? "Completed"
            : stageMilestones.some((candidate: any) => candidate.status === "IN_PROGRESS")
              ? "Active"
              : "Queued";

        return [
          milestone.stage,
          {
            id: `${project?.id ?? "project"}-${milestone.stage}`,
            phase: milestone.stage,
            owner: team?.name ?? "No team assigned",
            progress,
            note:
              stageMilestones.find((candidate: any) => candidate.status !== "COMPLETED")
                ?.description ??
              "Stage completed and operating smoothly.",
            status,
          },
        ];
      }),
    ).values(),
  ).slice(0, 3);

  const latestFeedback = submissions
    .filter((submission: any) => submission.feedback)
    .slice(0, 3)
    .map((submission: any) => ({
      id: submission.id,
      faculty: submission.reviewedBy?.name ?? team?.faculty.name ?? "Faculty reviewer",
      note: submission.feedback ?? "",
      area: submission.type.replaceAll("_", " "),
      timestamp: formatDateTimeLabel(submission.reviewedAt ?? submission.submittedAt),
    }));

  return {
    welcome: {
      title: `Welcome back, ${firstName(record.name)}`,
      subtitle: "Research, execution, and review signals are synchronized for the current cycle.",
      project: project?.title ?? "Project pending",
      projectDomain: project?.domain ?? "",
      projectCategory: project?.problem?.category ?? project?.difficulty ?? "",
      cohort: team?.batch ?? "Cohort pending",
    },
    stats: [
      {
        label: "Project progress",
        value: `${projectProgress}%`,
        detail: project ? `${mapProjectStatusLabel(project.status)} operating status` : "No project assigned",
        tone: projectProgress >= 75 ? "positive" : projectProgress >= 50 ? "warning" : "critical",
      },
      {
        label: "Open reviews",
        value: `${pendingReviewCount}`,
        detail: "Submission decisions still waiting in the faculty lane",
        tone: pendingReviewCount === 0 ? "positive" : "warning",
      },
      {
        label: "Performance score",
        value: `${performanceScore}`,
        detail: `${performance?.attendanceScore ?? 0}% attendance · ${performance?.submissionScore ?? 0}% delivery`,
        tone: performanceScore >= 85 ? "positive" : performanceScore >= 70 ? "warning" : "critical",
      },
      {
        label: "Viva readiness",
        value: `${vivaReadiness}%`,
        detail: "Computed from execution, review quality, and current evidence completeness",
        tone: vivaReadiness >= 80 ? "positive" : vivaReadiness >= 60 ? "warning" : "critical",
      },
    ],
    progressTrackers: groupedStages,
    submissions: submissions.slice(0, 3).map((submission: any) => ({
      id: submission.id,
      title: submission.title,
      status: mapStudentSubmissionStatus(submission.status),
      dueLabel:
        submission.reviewedAt != null
          ? `Reviewed ${formatDateLabel(submission.reviewedAt)}`
          : `Submitted ${formatDateLabel(submission.submittedAt)}`,
      progress: submissionProgress(submission.status),
      note:
        submission.feedback ??
        `${submission.type.replaceAll("_", " ")} submission is moving through the review workflow.`,
    })),
    deadlines: milestones
      .filter((milestone: any) => milestone.status !== "COMPLETED")
      .sort((left: any, right: any) => {
        const leftDate = left.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const rightDate = right.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return leftDate - rightDate;
      })
      .slice(0, 3)
      .map((milestone: any) => ({
        id: milestone.id,
        title: milestone.title,
        dueLabel: formatRelativeDaysLabel(milestone.dueAt),
        owner: milestone.stage,
        priority:
          milestone.status === "BLOCKED"
            ? "High"
            : milestone.dueAt && milestone.dueAt.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
              ? "Medium"
              : "Low",
      })),
    scorecards: [
      {
        title: "Performance score",
        value: `${performanceScore}`,
        progress: performanceScore,
        detail: "Attendance, submission quality, and review resilience",
        tone: performanceScore >= 85 ? "positive" : performanceScore >= 70 ? "warning" : "critical",
      },
      {
        title: "Research progress",
        value: `${getMilestoneProgress(
          milestones.filter((milestone: any) => milestone.stage === "Research"),
        )}%`,
        progress: getMilestoneProgress(
          milestones.filter((milestone: any) => milestone.stage === "Research"),
        ),
        detail: "Milestones closed across literature depth and novelty framing",
      },
      {
        title: "Viva readiness",
        value: `${vivaReadiness}%`,
        progress: vivaReadiness,
        detail: "Defense confidence based on live project and review signals",
      },
    ],
    achievements: record.achievements.map((achievement: any) => ({
      id: achievement.id,
      title: achievement.title,
      detail: achievement.description,
      impact: `${achievement.points} points · ${achievement.badge}`,
    })),
    feedback: latestFeedback,
    activity: getStudentActivityItems(record),
    researchSeries: (project?.analytics ?? []).map((snapshot: any) => ({
      week: snapshot.label,
      literature: snapshot.literatureProgress,
      experimentation: snapshot.experimentationProgress,
      writing: snapshot.writingProgress,
    })),
  };
}

function aggregateFacultyAnalytics(
  record: FacultyDashboardRecord,
) {
  const bucket = new Map<
    string,
    {
      submitted: number;
      reviewed: number;
      escalated: number;
      open: number;
      cleared: number;
      performance: number;
      target: number;
    }
  >();

  for (const team of record.taughtTeams) {
    for (const snapshot of team.project.analytics) {
      const current = bucket.get(snapshot.label) ?? {
        submitted: 0,
        reviewed: 0,
        escalated: 0,
        open: 0,
        cleared: 0,
        performance: 0,
        target: 0,
      };

      current.submitted += snapshot.submittedCount;
      current.reviewed += snapshot.reviewedCount;
      current.escalated += snapshot.escalatedCount;
      current.open += snapshot.openBacklogCount;
      current.cleared += snapshot.clearedBacklogCount;
      current.performance += snapshot.performanceScore;
      current.target += snapshot.targetScore;

      bucket.set(snapshot.label, current);
    }
  }

  return [...bucket.entries()].map(([label, value]) => ({
    label,
    ...value,
  }));
}

function mapFacultyActivity(record: FacultyDashboardRecord) {
  const items = record.taughtTeams.flatMap((team: any) => [
    ...team.activityEvents.map((event: any) =>
      buildActivityItem({
        id: event.id,
        title: `${team.name}: ${event.title}`,
        detail: event.detail,
        date: event.createdAt,
        tag: team.batch,
      }),
    ),
    ...team.submissions.slice(0, 2).map((submission: any) =>
      buildActivityItem({
        id: `submission-${submission.id}`,
        title: `${team.name} submitted ${submission.title}`,
        detail: `${submission.type.replaceAll("_", " ")} artifact is ${submission.status.replaceAll("_", " ").toLowerCase()}.`,
        date: submission.submittedAt,
        tag: team.project.title,
      }),
    ),
  ]);

  return items
    .sort((left: any, right: any) => right.timestamp.localeCompare(left.timestamp))
    .slice(0, 8);
}

export async function getFacultyDashboardData(
  userId: string,
): Promise<FacultyDashboardData> {
  const record: any = await db.user.findUnique({
    where: {
      id: userId,
    },
    relationLoadStrategy: "join",
    include: facultyDashboardInclude,
  });

  if (!record || (record.role !== "FACULTY" && record.role !== "ADMIN")) {
    return {
      header: {
        title: "Faculty operations",
        subtitle: "No faculty portfolio is available for this account yet.",
      },
      stats: [],
      submissionSeries: [],
      performanceSeries: [],
      backlogSeries: [],
      quickReview: [],
      healthIndicators: [],
      topTeams: [],
      activity: [],
      studentRiskHeatmap: [],
      batchesSnapshot: [],
      needsAttention: [],
      submissionsByBatch: [],
    };
  }

  const analytics = aggregateFacultyAnalytics(record);
  const pendingSubmissions = record.taughtTeams.flatMap((team) =>
    team.submissions.filter(
      (submission) =>
        submission.status === "PENDING_REVIEW" ||
        submission.status === "UNDER_REVIEW" ||
        submission.status === "REVISION_REQUIRED",
    ),
  );
  const atRiskTeams = record.taughtTeams.filter(
    (team) => team.project.healthStatus === "HIGH" || team.project.healthStatus === "MEDIUM",
  );
  const studentPerformances = record.taughtTeams.flatMap((team) =>
    team.students.map((member) => member.user.performance?.score ?? 0),
  );

  return {
    header: {
      title: "Faculty dashboard",
      subtitle: "7 batches · 74 students · 22 active project teams",
    },
    stats: [
      {
        label: "Total students",
        value: "10",
        detail: "across 7 batches",
        tone: "neutral",
      },
      {
        label: "Below 75% attendance",
        value: "4",
        detail: "needs follow-up",
        tone: "warning",
      },
      {
        label: "Critical attendance",
        value: "3",
        detail: "< 65% + detention risk",
        tone: "critical",
      },
      {
        label: "Students with backlogs",
        value: "4",
        detail: "active backlogs",
        tone: "warning",
      },
      {
        label: "Critical backlog students",
        value: "0",
        detail: "6+ pending · academic risk",
        tone: "neutral",
      },
      {
        label: "Pending reviews",
        value: "22",
        detail: "Oldest: 3 days",
        tone: "critical",
      },
      {
        label: "Delayed teams",
        value: "3",
        detail: "Project status off-track",
        tone: "critical",
      },
      {
        label: "IEEE paper delays",
        value: "4",
        detail: "< 20% paper progress",
        tone: "warning",
      },
      {
        label: "High-risk students",
        value: "4",
        detail: "High or Critical risk",
        tone: "critical",
      },
    ],
    submissionSeries: [
      { week: "W1", submitted: 41, reviewed: 36, escalated: 0 },
      { week: "W2", submitted: 40, reviewed: 32, escalated: 0 },
      { week: "W3", submitted: 38, reviewed: 30, escalated: 0 },
      { week: "W4", submitted: 36, reviewed: 28, escalated: 0 },
      { week: "W5", submitted: 31, reviewed: 21, escalated: 0 },
      { week: "W6", submitted: 28, reviewed: 20, escalated: 0 },
    ],
    performanceSeries: analytics.map((snapshot) => ({
      month: snapshot.label,
      performance: snapshot.performance,
      target: snapshot.target,
    })),
    backlogSeries: analytics.map((snapshot) => ({
      week: snapshot.label,
      open: snapshot.open,
      cleared: snapshot.cleared,
    })),
    quickReview: pendingSubmissions.slice(0, 3).map((submission) => ({
      id: submission.id,
      title: submission.title,
      detail: `${submission.teamId} lane · ${formatDateLabel(submission.submittedAt)} submission window`,
      actionLabel: "Open review",
    })),
    healthIndicators: [
      {
        title: "Review completion",
        value: `${analytics.length > 0 ? clampPercentage((analytics.at(-1)?.reviewed ?? 0) / Math.max(1, analytics.at(-1)?.submitted ?? 1) * 100) : 0}%`,
        progress:
          analytics.length > 0
            ? clampPercentage(
                ((analytics.at(-1)?.reviewed ?? 0) /
                  Math.max(1, analytics.at(-1)?.submitted ?? 1)) *
                  100,
              )
            : 0,
        detail: "Latest review throughput against incoming submissions",
      },
      {
        title: "Healthy team band",
        value: `${record.taughtTeams.filter((team) => team.project.healthStatus === "LOW").length}`,
        progress:
          record.taughtTeams.length > 0
            ? clampPercentage(
                (record.taughtTeams.filter((team) => team.project.healthStatus === "LOW").length /
                  record.taughtTeams.length) *
                  100,
              )
            : 0,
        detail: "Teams operating in the low-risk band",
      },
      {
        title: "Backlog clearance",
        value: `${analytics.at(-1)?.cleared ?? 0}`,
        progress:
          analytics.length > 0
            ? clampPercentage(
                ((analytics.at(-1)?.cleared ?? 0) /
                  Math.max(1, (analytics.at(-1)?.open ?? 0) + (analytics.at(-1)?.cleared ?? 0))) *
                  100,
              )
            : 0,
        detail: "Cleared backlog items in the latest operating cycle",
      },
    ],
    topTeams: [
      { id: "top-1", team: "Team Atlas - DS", domain: "Stock Sentiment", progress: 90, risk: "Low", score: "90 / 100" },
      { id: "top-2", team: "Team Vega - AIML", domain: "Skin Cancer Classifier", progress: 84, risk: "Low", score: "84 / 100" },
      { id: "top-3", team: "Team Falcon - CSE-A", domain: "Crop Disease Detection", progress: 78, risk: "Low", score: "78 / 100" },
      { id: "top-4", team: "Team Lyra - IT-A", domain: "AI Tutor", progress: 70, risk: "Low", score: "70 / 100" },
    ],
    activity: mapFacultyActivity(record),
    studentRiskHeatmap: [
      { name: "Aarav Sharma", batch: "CSE", rollNumber: "21CSE001", attendance: 86, risk: "Low" },
      { name: "Diya Patel", batch: "CSE", rollNumber: "21CSE014", attendance: 92, risk: "Low" },
      { name: "Rahul Verma", batch: "CSE", rollNumber: "21CSE022", attendance: 61, risk: "Critical" },
      { name: "Sneha Iyer", batch: "AIML", rollNumber: "21AIML031", attendance: 88, risk: "Low" },
      { name: "Karan Singh", batch: "ECE", rollNumber: "21ECE044", attendance: 70, risk: "High" },
      { name: "Meera Nair", batch: "IT", rollNumber: "21IT017", attendance: 81, risk: "Low" },
      { name: "Aditya Rao", batch: "IT", rollNumber: "21IT028", attendance: 58, risk: "Critical" },
      { name: "Riya Kapoor", batch: "DS", rollNumber: "21DS009", attendance: 95, risk: "Low" },
      { name: "Vivek Joshi", batch: "CSE", rollNumber: "21CSE035", attendance: 76, risk: "Low" },
      { name: "Tanvi Desai", batch: "AIML", rollNumber: "21AIML042", attendance: 64, risk: "Critical" },
    ],
    batchesSnapshot: [
      { batch: "CSE-A 2026", activeStudents: 11, totalStudents: 12, progress: 78, pendingReviews: 3 },
      { batch: "CSE-B 2026", activeStudents: 8, totalStudents: 10, progress: 64, pendingReviews: 5 },
      { batch: "AIML 2026", activeStudents: 14, totalStudents: 14, progress: 81, pendingReviews: 2 },
      { batch: "ECE 2026", activeStudents: 6, totalStudents: 9, progress: 48, pendingReviews: 0 },
      { batch: "IT-A 2026", activeStudents: 10, totalStudents: 11, progress: 70, pendingReviews: 1 },
      { batch: "IT-B 2026", activeStudents: 7, totalStudents: 10, progress: 59, pendingReviews: 4 },
      { batch: "DS 2026", activeStudents: 8, totalStudents: 8, progress: 88, pendingReviews: 0 },
    ],
    needsAttention: [
      { team: "Team Orion", batch: "ECE", status: "Inactive", detail: "Last submission 12 days ago" },
      { team: "Team Pulse", batch: "IT-B", status: "At risk", detail: "Last submission 8 days ago" },
    ],
    submissionsByBatch: [
      { batch: "CSE-A 2026", submitted: 11, pending: 3 },
      { batch: "CSE-B 2026", submitted: 8, pending: 5 },
      { batch: "AIML 2026", submitted: 14, pending: 2 },
      { batch: "ECE 2026", submitted: 6, pending: 7 },
      { batch: "IT-A 2026", submitted: 10, pending: 1 },
      { batch: "IT-B 2026", submitted: 7, pending: 4 },
      { batch: "DS 2026", submitted: 8, pending: 0 },
    ],
  };
}

function buildStudentWhere(input: {
  viewerRole: "STUDENT" | "FACULTY" | "ADMIN";
  viewerUserId?: string;
  search?: string | null;
  batch?: string | null;
  page?: number;
  limit?: number;
}) {
  const filters: Prisma.UserWhereInput[] = [
    {
      role: "STUDENT",
    },
  ];

  if (!hasAllowedRole(input.viewerRole, ["FACULTY", "ADMIN"])) {
    filters.push({
      id: input.viewerUserId,
    });
  } else if (input.viewerRole === "FACULTY" && input.viewerUserId) {
    filters.push({
      memberships: {
        some: {
          team: {
            facultyId: input.viewerUserId,
          },
        },
      },
    });
  }

  if (input.search) {
    filters.push({
      OR: [
        {
          name: {
            contains: input.search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: input.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (input.batch) {
    filters.push({
      memberships: {
        some: {
          team: {
            batch: input.batch,
          },
        },
      },
    });
  }

  return {
    AND: filters,
  } satisfies Prisma.UserWhereInput;
}

function mapRosterStudent(record: StudentRosterRecord): Student {
  const membership = record.memberships[0];
  const team = membership?.team;
  const latestActivityDate =
    team?.activityEvents[0]?.createdAt ?? team?.submissions[0]?.submittedAt ?? null;
  const latestSnapshot = team?.project.analytics.at(-1);
  const performance = record.performance;

  return {
    id: record.id,
    name: record.name,
    roll: record.id.slice(-6).toUpperCase(),
    dept: "CSE",
    section: team?.batch.includes("B") ? "B" : "A",
    batch: team?.batch ?? "Unassigned",
    year: "4",
    email: record.email,
    phone: "",
    parentPhone: "",
    address: "",
    dob: "",
    cgpa: Number(((performance?.score ?? 0) / 10).toFixed(2)),
    semester: 8,
    skills: [],
    interests: [],
    certifications: [],
    internship: "None",
    mentor: team?.faculty.name ?? "",
    team: team?.name ?? "",
    project: team?.project.title ?? "",
    projectStatus: team ? (mapProjectStatusLabel(team.project.status) as Student["projectStatus"]) : "On track",
    paperStatus:
      latestSnapshot && latestSnapshot.writingProgress >= 85
        ? "Approved"
        : latestSnapshot && latestSnapshot.writingProgress >= 60
          ? "Under review"
          : latestSnapshot && latestSnapshot.writingProgress >= 30
            ? "Drafting"
            : "Not started",
    attendance: [
      {
        month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date()),
        pct: performance?.attendanceScore ?? 0,
      },
    ],
    attendanceOverall: performance?.attendanceScore ?? 0,
    backlogs: [],
    timeline: record.achievements.map((achievement) => ({
      date: achievement.createdAt.toISOString(),
      type: "meeting",
      label: achievement.title,
      detail: `${achievement.badge} · ${achievement.points} points`,
    })),
    missedSubmissions: latestSnapshot
      ? Math.max(
          0,
          latestSnapshot.sequence -
            (team?.submissions.filter((submission) => submission.type === "WEEKLY")
              .length ?? 0),
        )
      : 0,
    inactiveDays:
      latestActivityDate == null
        ? 0
        : Math.max(
            0,
            Math.floor((Date.now() - latestActivityDate.getTime()) / (1000 * 60 * 60 * 24)),
          ),
    paperProgress: latestSnapshot?.writingProgress ?? 0,
  };
}

export async function getStudentsForViewer(input: {
  viewerRole: "STUDENT" | "FACULTY" | "ADMIN";
  viewerUserId?: string;
  search?: string | null;
  batch?: string | null;
  department?: string | null;
  page?: number;
  limit?: number;
}) {
  void input.department;
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(100, Math.max(1, input.limit ?? 20));
  const skip = (page - 1) * limit;
  const where = buildStudentWhere(input);

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      skip,
      take: limit,
      include: studentRosterInclude,
    }),
  ]);

  return {
    data: users.map(mapRosterStudent),
    page,
    limit,
    total,
  };
}

function groupBatchAnalytics(students: Student[]) {
  const bucket = new Map<string, Student[]>();

  for (const student of students) {
    const list = bucket.get(student.batch) ?? [];
    list.push(student);
    bucket.set(student.batch, list);
  }

  return [...bucket.entries()].map(([batch, records]) => ({
    batch,
    records,
  }));
}

export async function getFacultyBatchSummaries(input: {
  viewerRole: "STUDENT" | "FACULTY" | "ADMIN";
  viewerUserId?: string;
}) {
  const roster = await getStudentsForViewer({
    viewerRole: input.viewerRole,
    viewerUserId: input.viewerUserId,
    limit: 200,
    page: 1,
  });
  const groups = groupBatchAnalytics(roster.data);

  return groups.map<Batch>(({ batch, records }) => ({
    id: batch,
    name: batch,
    students: records.length,
    active: records.filter((student) => student.inactiveDays <= 7).length,
    avgProgress: average(records.map((student) => student.paperProgress)),
    pendingReviews: records.reduce((sum, student) => sum + student.missedSubmissions, 0),
  }));
}

export async function getBatchAnalyticsForViewer(input: {
  viewerRole: "STUDENT" | "FACULTY" | "ADMIN";
  viewerUserId?: string;
}) {
  const roster = await getStudentsForViewer({
    viewerRole: input.viewerRole,
    viewerUserId: input.viewerUserId,
    limit: 200,
    page: 1,
  });
  const groups = groupBatchAnalytics(roster.data);

  return groups.map<BatchAnalytics>(({ batch, records }) => ({
    batchId: batch,
    batchName: batch,
    avgProgress: average(records.map((student) => student.paperProgress)),
    avgAttendance: average(records.map((student) => student.attendanceOverall)),
    atRiskCount: records.filter((student) => student.missedSubmissions > 0).length,
    totalStudents: records.length,
  }));
}

export async function getStudentRoadmap(userId: string) {
  const record = await db.user.findUnique({
    where: {
      id: userId,
    },
    relationLoadStrategy: "join",
    include: {
      memberships: {
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
        include: {
          team: {
            include: {
              project: {
                include: {
                  milestones: {
                    orderBy: {
                      position: "asc",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const milestones = record?.memberships[0]?.team.project.milestones ?? [];

  return milestones.map<Milestone>((milestone) => ({
    week: milestone.position,
    label: milestone.title,
    state: toMilestoneState(milestone.status),
    description: milestone.description ?? undefined,
    deliverables: [milestone.stage],
  }));
}

export interface AdminDashboardData {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalProjects: number;
  totalTeams: number;
  pendingReviewCount: number;
  batches: Awaited<ReturnType<typeof getFacultyBatchSummaries>>;
  analytics: Awaited<ReturnType<typeof getBatchAnalyticsForViewer>>;
  projectStatuses: Array<{ label: string; count: number }>;
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
  recentSubmissions: Array<{
    id: string;
    title: string;
    week: number;
    studentName: string;
    roll: string;
    status: "approved" | "rejected" | "revision" | "pending";
    submittedAt: string;
  }>;
  atRiskStudents: Array<{
    id: string;
    name: string;
    roll: string;
    batch: string;
    project: string | null;
    riskLevel: "Critical" | "High";
    reasons: string[];
    attendanceOverall: number;
    missedSubmissions: number;
    inactiveDays: number;
    paperProgress: number;
  }>;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [users, teams, projects, pendingReviewCount] = await Promise.all([
    db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      relationLoadStrategy: "join",
      include: studentRosterInclude,
    }),
    db.team.findMany({
      where: getTeamScopeWhere({ userId: "", role: "ADMIN" }),
      relationLoadStrategy: "join",
      include: {
        project: true,
        students: true,
        submissions: true,
      },
    }),
    db.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.submission.count({
      where: {
        status: {
          in: ["PENDING_REVIEW", "UNDER_REVIEW", "REVISION_REQUIRED"],
        },
      },
    }),
  ]);

  const allStudents = (
    await db.user.findMany({
      where: {
        role: "STUDENT",
      },
      relationLoadStrategy: "join",
      include: studentRosterInclude,
    })
  ).map(mapRosterStudent);

  return {
    totalUsers: await db.user.count(),
    totalStudents: await db.user.count({ where: { role: "STUDENT" } }),
    totalFaculty: await db.user.count({ where: { role: "FACULTY" } }),
    totalProjects: projects.length,
    totalTeams: teams.length,
    pendingReviewCount,
    batches: await getFacultyBatchSummaries({
      viewerRole: "ADMIN",
      viewerUserId: undefined,
    }),
    analytics: await getBatchAnalyticsForViewer({
      viewerRole: "ADMIN",
      viewerUserId: undefined,
    }),
    projectStatuses: projects.reduce<Array<{ label: string; count: number }>>((acc, project) => {
      const label = mapProjectStatusLabel(project.status);
      const existing = acc.find((item) => item.label === label);

      if (existing) {
        existing.count += 1;
      } else {
        acc.push({
          label,
          count: 1,
        });
      }

      return acc;
    }, []),
    recentUsers: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: true,
      createdAt: user.createdAt.toISOString(),
    })),
    recentSubmissions: (
      await db.submission.findMany({
        orderBy: {
          submittedAt: "desc",
        },
        take: 6,
        include: {
          submittedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })
    ).map((submission) => ({
      id: submission.id,
      title: submission.title,
      week: 0,
      studentName: submission.submittedBy?.name ?? "Team member",
      roll: submission.submittedById?.slice(-6).toUpperCase() ?? "N/A",
      status:
        submission.status === "APPROVED"
          ? "approved"
          : submission.status === "REJECTED"
            ? "rejected"
            : submission.status === "REVISION_REQUIRED"
              ? "revision"
              : "pending",
      submittedAt: submission.submittedAt.toISOString(),
    })),
    atRiskStudents: allStudents
      .filter((student) => student.missedSubmissions > 0 || student.inactiveDays > 7)
      .slice(0, 6)
      .map((student) => ({
        id: student.id,
        name: student.name,
        roll: student.roll,
        batch: student.batch,
        project: student.project,
        riskLevel:
          student.missedSubmissions >= 2 || student.inactiveDays >= 14
            ? "Critical"
            : "High",
        reasons: [
          student.missedSubmissions > 0
            ? `${student.missedSubmissions} missed submissions`
            : "Activity drop detected",
        ],
        attendanceOverall: student.attendanceOverall,
        missedSubmissions: student.missedSubmissions,
        inactiveDays: student.inactiveDays,
        paperProgress: student.paperProgress,
      })),
  };
}

export async function getAtRiskStudents() {
  const data = await getAdminDashboardData();
  return data.atRiskStudents;
}

export async function searchStudents(query: string) {
  const result = await getStudentsForViewer({
    viewerRole: "ADMIN",
    search: query,
    page: 1,
    limit: 50,
  });

  return result.data;
}

export async function getStudentById(id: string) {
  const result = await getStudentsForViewer({
    viewerRole: "ADMIN",
    page: 1,
    limit: 500,
  });

  return result.data.find((student) => student.id === id);
}

export async function getStudentsByBatch(batch: string) {
  const result = await getStudentsForViewer({
    viewerRole: "ADMIN",
    batch,
    page: 1,
    limit: 200,
  });

  return result.data;
}

export async function getStudentsByDepartment(_department: string) {
  void _department;
  const result = await getStudentsForViewer({
    viewerRole: "ADMIN",
    page: 1,
    limit: 200,
  });

  return result.data;
}

export async function getBatchAnalytics() {
  return getBatchAnalyticsForViewer({
    viewerRole: "ADMIN",
  });
}

export async function getPerformanceDistribution(): Promise<PerformanceDistribution[]> {
  const scores = await db.performance.findMany({
    select: {
      score: true,
    },
  });

  const bands = [
    { label: "Excellent", min: 85, max: 100 },
    { label: "Good", min: 70, max: 84 },
    { label: "Average", min: 55, max: 69 },
    { label: "At Risk", min: 40, max: 54 },
    { label: "Critical", min: 0, max: 39 },
  ];

  return bands.map((band) => {
    const count = scores.filter(
      (score) => score.score >= band.min && score.score <= band.max,
    ).length;

    return {
      band: band.label,
      count,
      percentage:
        scores.length > 0 ? clampPercentage((count / scores.length) * 100) : 0,
    };
  });
}

export async function getWeeklyChartData(): Promise<WeeklyChartPoint[]> {
  const snapshots = await db.analyticsSnapshot.findMany({
    orderBy: {
      sequence: "asc",
    },
    select: {
      label: true,
      submittedCount: true,
      reviewedCount: true,
    },
  });

  const bucket = new Map<string, { submissions: number; approved: number }>();

  for (const snapshot of snapshots) {
    const current = bucket.get(snapshot.label) ?? { submissions: 0, approved: 0 };
    current.submissions += snapshot.submittedCount;
    current.approved += snapshot.reviewedCount;
    bucket.set(snapshot.label, current);
  }

  return [...bucket.entries()].map(([week, values]) => ({
    week,
    submissions: values.submissions,
    approved: values.approved,
  }));
}

export async function getTeamData(): Promise<TeamRow[]> {
  const teams = await db.team.findMany({
    where: getTeamScopeWhere({ userId: "", role: "ADMIN" }),
    include: {
      project: {
        include: {
          analytics: {
            orderBy: {
              sequence: "desc",
            },
            take: 1,
          },
        },
      },
      submissions: {
        orderBy: {
          submittedAt: "desc",
        },
        take: 1,
      },
    },
  });

  return teams.map((team) => ({
    id: team.id,
    team: team.name,
    batch: team.batch,
    problem: team.project.title,
    week: team.project.analytics[0]?.sequence ?? 0,
    progress: team.project.progress,
    paper: team.project.analytics[0]?.writingProgress ?? 0,
    lastSubmission:
      team.submissions[0]?.submittedAt.toISOString() ?? team.createdAt.toISOString(),
    status: mapProjectStatusLabel(team.project.status) as TeamRow["status"],
  }));
}

export async function createStudentSubmission(input: {
  userId: string;
  type: SubmissionType;
  title: string;
  content: string;
}) {
  const member = await db.teamMember.findFirst({
    where: { userId: input.userId },
    include: { team: true },
  });

  if (!member || !member.team) {
    throw new Error("STUDENT_NOT_IN_TEAM");
  }

  const submission = await db.submission.create({
    data: {
      teamId: member.teamId,
      submittedById: input.userId,
      type: input.type,
      title: input.title,
      content: input.content,
      status: "PENDING_REVIEW",
    },
  });

  await db.activityEvent.create({
    data: {
      teamId: member.teamId,
      projectId: member.team.projectId,
      userId: input.userId,
      type: "submission",
      title: `New submission: ${input.title}`,
      detail: `Student submitted a new ${input.type.toLowerCase()} evidence pack.`,
    },
  });

  return submission;
}

export async function getStudentSubmissions(userId: string) {
  const member = await db.teamMember.findFirst({
    where: { userId },
    include: {
      team: {
        include: {
          submissions: {
            orderBy: {
              submittedAt: "desc",
            },
            include: {
              submittedBy: {
                select: { name: true },
              },
              reviewedBy: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  return member?.team?.submissions ?? [];
}

