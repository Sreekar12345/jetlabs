// @ts-nocheck
import { ReviewDecision } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  getSubmissionScopeWhere,
  type ViewerContext,
} from "@/lib/permissions";
import { syncProjectHealthForTeam } from "@/lib/services/project-health-service";
import {
  average,
  clampPercentage,
  formatDateTimeLabel,
} from "@/lib/services/shared";
import type { ReviewQueueData, ReviewQueueItem } from "@/types/aoip";

const queueSubmissionInclude = {
  team: {
    include: {
      project: {
        include: {
          analytics: {
            orderBy: {
              sequence: "asc",
            },
          },
        },
      },
      students: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              performance: {
                select: {
                  score: true,
                },
              },
            },
          },
        },
      },
    },
  },
  submittedBy: {
    select: {
      name: true,
    },
  },
  reviews: {
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.SubmissionInclude;

type QueueSubmissionRecord = Prisma.SubmissionGetPayload<{
  include: typeof queueSubmissionInclude;
}>;

function hoursSince(date: Date) {
  return Math.max(1, Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60)));
}

function getQueueStatus(submission: QueueSubmissionRecord): ReviewQueueItem["status"] {
  if (submission.status === "REVISION_REQUIRED") {
    return "Re-review";
  }

  if (hoursSince(submission.submittedAt) > 72) {
    return "SLA risk";
  }

  return "Pending";
}

function getUrgency(submission: QueueSubmissionRecord): ReviewQueueItem["urgency"] {
  const ageInHours = hoursSince(submission.submittedAt);

  if (
    submission.status === "REVISION_REQUIRED" ||
    ageInHours >= 96 ||
    submission.team.project.healthStatus === "HIGH"
  ) {
    return "Critical";
  }

  if (ageInHours >= 72 || submission.team.project.healthStatus === "MEDIUM") {
    return "High";
  }

  if (ageInHours >= 36) {
    return "Medium";
  }

  return "Low";
}

function getRubricTags(submission: QueueSubmissionRecord) {
  return [
    submission.type,
    submission.team.project.domain,
    submission.team.project.status.replaceAll("_", " "),
  ];
}

function getScoreHint(submission: QueueSubmissionRecord) {
  const priorScores = submission.team.students
    .map((member) => member.user.performance?.score)
    .filter((score): score is number => typeof score === "number");

  if (priorScores.length === 0) {
    return "Team score baseline unavailable";
  }

  return `Team average ${average(priorScores)} / 100`;
}

function mapQueueItem(submission: QueueSubmissionRecord): ReviewQueueItem {
  return {
    id: submission.id,
    team: submission.team.name,
    batch: submission.team.batch,
    project: submission.team.project.title,
    submissionTitle: submission.title,
    submittedAt: formatDateTimeLabel(submission.submittedAt),
    status: getQueueStatus(submission),
    urgency: getUrgency(submission),
    preview: submission.content,
    rubric: getRubricTags(submission),
    scoreHint: getScoreHint(submission),
  };
}

export async function getReviewQueueData(
  viewer: ViewerContext,
): Promise<ReviewQueueData> {
  const submissions = await db.submission.findMany({
    where: {
      ...getSubmissionScopeWhere(viewer),
      status: {
        in: ["PENDING_REVIEW", "UNDER_REVIEW", "REVISION_REQUIRED"],
      },
    },
    orderBy: [{ submittedAt: "desc" }],
    relationLoadStrategy: "join",
    include: queueSubmissionInclude,
  });

  const items = submissions.map(mapQueueItem);
  const accessibleTeams = [...new Set(submissions.map((submission) => submission.team.id))];
  const snapshotsByLabel = new Map<
    string,
    { pending: number; completed: number; overdue: number }
  >();

  for (const submission of submissions) {
    for (const snapshot of submission.team.project.analytics) {
      const current = snapshotsByLabel.get(snapshot.label) ?? {
        pending: 0,
        completed: 0,
        overdue: 0,
      };
      current.pending += Math.max(0, snapshot.submittedCount - snapshot.reviewedCount);
      current.completed += snapshot.reviewedCount;
      current.overdue += snapshot.escalatedCount;
      snapshotsByLabel.set(snapshot.label, current);
    }
  }

  const criticalCount = items.filter((item) => item.urgency === "Critical").length;
  const completedScores = submissions
    .flatMap((submission) => submission.reviews.map((review) => review.score))
    .filter((score): score is number => typeof score === "number");
  const completionRate =
    accessibleTeams.length > 0
      ? clampPercentage(
          ((submissions.length - items.filter((item) => item.status === "Pending").length) /
            submissions.length) *
            100,
        )
      : 0;

  return {
    stats: [
      {
        label: "Pending reviews",
        value: `${items.length}`,
        detail: `${accessibleTeams.length} active team review lanes`,
        tone: items.length > 0 ? "warning" : "positive",
      },
      {
        label: "SLA risk",
        value: `${items.filter((item) => item.status === "SLA risk").length}`,
        detail: "Submissions close to or beyond the operational review window",
        tone: criticalCount > 0 ? "critical" : "warning",
      },
      {
        label: "Average score",
        value: completedScores.length > 0 ? `${average(completedScores)} / 100` : "N/A",
        detail: "Latest completed review average across assigned teams",
        tone: completedScores.length > 0 ? "positive" : "neutral",
      },
      {
        label: "Review completion",
        value: `${completionRate}%`,
        detail: "Queue movement against submitted review load",
      },
    ],
    analytics: [...snapshotsByLabel.entries()].map(([week, value]) => ({
      week,
      pending: value.pending,
      completed: value.completed,
      overdue: value.overdue,
    })),
    queue: items,
    templates: [
      "Approve when the evidence is complete and the next checkpoint is clear.",
      "Request revision when the submission is directionally correct but operationally incomplete.",
      "Escalate when project risk, evidence quality, or delivery confidence is trending unsafe.",
    ],
  };
}

function mapReviewDecisionToSubmissionStatus(decision: ReviewDecision) {
  switch (decision) {
    case ReviewDecision.APPROVED:
      return "APPROVED";
    case ReviewDecision.REVISION_REQUIRED:
      return "REVISION_REQUIRED";
    case ReviewDecision.REJECTED:
      return "REJECTED";
    case ReviewDecision.ESCALATED:
    default:
      return "UNDER_REVIEW";
  }
}

export async function submitSubmissionReview(input: {
  viewer: ViewerContext;
  submissionId: string;
  decision: ReviewDecision;
  score: number;
  comments: string;
}) {
  const submission = await db.submission.findFirst({
    where: {
      id: input.submissionId,
      ...getSubmissionScopeWhere(input.viewer),
    },
    relationLoadStrategy: "join",
    include: {
      team: {
        select: {
          id: true,
          name: true,
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new Error("SUBMISSION_NOT_FOUND");
  }

  await db.$transaction([
    db.review.create({
      data: {
        submissionId: submission.id,
        reviewerId: input.viewer.userId,
        score: input.score,
        comments: input.comments,
        decision: input.decision,
      },
    }),
    db.submission.update({
      where: {
        id: submission.id,
      },
      data: {
        status: mapReviewDecisionToSubmissionStatus(input.decision),
        reviewedAt: new Date(),
        reviewedById: input.viewer.userId,
        feedback: input.comments,
        score: input.score,
      },
    }),
    db.activityEvent.create({
      data: {
        teamId: submission.team.id,
        projectId: submission.team.project.id,
        userId: input.viewer.userId,
        type: "review",
        title: `Review completed for ${submission.title}`,
        detail: input.comments,
      },
    }),
  ]);

  await syncProjectHealthForTeam(submission.team.id);

  return {
    success: true,
  };
}
