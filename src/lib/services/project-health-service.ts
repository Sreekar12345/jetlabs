import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getTeamScopeWhere, type ViewerContext } from "@/lib/permissions";
import { calculateTeamHealth } from "@/lib/services/project-health-engine";
import {
  average,
  buildActivityItem,
  clampPercentage,
  formatRelativeDaysLabel,
  mapHealthTone,
  mapProjectStatusLabel,
} from "@/lib/services/shared";
import type { ProjectHealthData, ProjectHealthTeam } from "@/types/aoip";

const healthTeamInclude = {
  faculty: {
    select: {
      id: true,
      name: true,
    },
  },
  students: {
    orderBy: {
      createdAt: "asc",
    },
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
  project: {
    include: {
      analytics: {
        orderBy: {
          sequence: "asc",
        },
      },
      milestones: {
        orderBy: {
          position: "asc",
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
        take: 1,
      },
    },
  },
  activityEvents: {
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  },
} satisfies Prisma.TeamInclude;

type HealthTeamRecord = Prisma.TeamGetPayload<{
  include: typeof healthTeamInclude;
}>;

type TeamHealthSnapshot = {
  team: HealthTeamRecord;
  riskScore: number;
  healthStatus: HealthTeamRecord["project"]["healthStatus"];
  velocity: string;
  alerts: string[];
  inactiveDays: number;
  missedSubmissions: number;
  backlogItems: number;
  completion: number;
  averageContribution: number;
};

function daysSince(date: Date | null | undefined) {
  if (!date) {
    return 30;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function getLatestActivityDate(team: HealthTeamRecord) {
  const dates = [
    team.activityEvents[0]?.createdAt,
    team.submissions[0]?.submittedAt,
    ...team.students.map((member) => member.lastActiveAt),
  ].filter((value): value is Date => Boolean(value));

  if (dates.length === 0) {
    return null;
  }

  return dates.sort((left, right) => right.getTime() - left.getTime())[0];
}

function getMissedSubmissions(team: HealthTeamRecord) {
  const expectedCycles = team.project.analytics.at(-1)?.sequence ?? 0;
  const weeklySubmissions = team.submissions.filter(
    (submission) => submission.type === "WEEKLY",
  ).length;

  return Math.max(0, expectedCycles - weeklySubmissions);
}

function contributionBand(value: number) {
  return Math.max(1, Math.min(5, Math.round(value / 20)));
}

function buildContributionHeatmap(team: HealthTeamRecord, inactiveDays: number) {
  const latestSnapshot = team.project.analytics.at(-1);
  const memberBands = team.students.map((member) =>
    contributionBand(member.contributionScore),
  );
  const operationalBands = [
    latestSnapshot
      ? contributionBand(
          (latestSnapshot.deliveredPoints / Math.max(1, latestSnapshot.plannedPoints)) *
            100,
        )
      : 1,
    latestSnapshot
      ? Math.max(1, 5 - Math.min(4, latestSnapshot.criticalBacklogCount))
      : 1,
    inactiveDays <= 2 ? 5 : inactiveDays <= 5 ? 4 : inactiveDays <= 8 ? 3 : inactiveDays <= 12 ? 2 : 1,
  ];
  const values = [...memberBands, ...operationalBands];

  while (values.length < 5) {
    values.push(average(values));
  }

  return values.slice(0, 5);
}

function deliveryRatio(snapshot: HealthTeamRecord["project"]["analytics"][number] | undefined) {
  if (!snapshot || snapshot.plannedPoints === 0) {
    return 100;
  }

  return clampPercentage((snapshot.deliveredPoints / snapshot.plannedPoints) * 100);
}

function getActiveMilestone(team: HealthTeamRecord) {
  return (
    team.project.milestones.find((milestone) => milestone.status === "BLOCKED") ??
    team.project.milestones.find((milestone) => milestone.status === "IN_PROGRESS") ??
    team.project.milestones.find((milestone) => milestone.status === "PENDING") ??
    team.project.milestones.at(-1)
  );
}

function getRevisionCount(team: HealthTeamRecord) {
  return team.submissions.filter(
    (submission) =>
      submission.status === "REVISION_REQUIRED" || submission.status === "REJECTED",
  ).length;
}

function getPendingReviewCount(team: HealthTeamRecord) {
  return team.submissions.filter(
    (submission) =>
      submission.status === "PENDING_REVIEW" || submission.status === "UNDER_REVIEW",
  ).length;
}

function getResearchVelocity(team: HealthTeamRecord) {
  const latest = team.project.analytics.at(-1);
  const previous = team.project.analytics.at(-2);

  if (!latest) {
    return 0;
  }

  if (!previous) {
    return average([latest.literatureProgress, latest.writingProgress]);
  }

  return Math.max(
    0,
    average([
      latest.literatureProgress - previous.literatureProgress,
      latest.writingProgress - previous.writingProgress,
    ]),
  );
}

function getTrend(team: HealthTeamRecord, inactiveDays: number) {
  const latest = team.project.analytics.at(-1);
  const previous = team.project.analytics.at(-2);
  const latestVelocity = deliveryRatio(latest);
  const previousVelocity = deliveryRatio(previous);
  const delta = latestVelocity - previousVelocity;
  const revisionCount = getRevisionCount(team);

  if (inactiveDays >= 10 || getResearchVelocity(team) <= 1) {
    return "Stagnating" as const;
  }

  if (revisionCount > 0 && delta >= 6) {
    return "Recovering after revision" as const;
  }

  if (Math.abs(delta) >= 24) {
    return "High volatility" as const;
  }

  if (delta >= 12) {
    return "Improving rapidly" as const;
  }

  if (delta <= -8) {
    return "Declining slowly" as const;
  }

  return "Consistent execution" as const;
}

function getMomentum(team: HealthTeamRecord) {
  const latest = team.project.analytics.at(-1);
  const previous = team.project.analytics.at(-2);
  const delta = deliveryRatio(latest) - deliveryRatio(previous);

  if (delta > 0) {
    return `+${delta}% delivery velocity`;
  }

  if (delta < 0) {
    return `${delta}% delivery velocity`;
  }

  return "Velocity unchanged";
}

function getRiskLayer(snapshot: TeamHealthSnapshot) {
  const team = snapshot.team;
  const latest = team.project.analytics.at(-1);
  const latestDelivery = deliveryRatio(latest);
  const pendingReviewCount = getPendingReviewCount(team);
  const researchVelocity = getResearchVelocity(team);

  if (snapshot.inactiveDays >= 14) {
    return "Ghost Team" as const;
  }

  if (snapshot.completion >= 70 && latestDelivery < 55) {
    return "Fake Progress" as const;
  }

  if (researchVelocity <= 1 && average([latest?.literatureProgress ?? 0, latest?.writingProgress ?? 0]) < 70) {
    return "Research Blocked" as const;
  }

  if (pendingReviewCount >= 3) {
    return "Mentor Dependent" as const;
  }

  if (snapshot.riskScore >= 70) {
    return "Critical" as const;
  }

  if (snapshot.riskScore >= 55) {
    return "At Risk" as const;
  }

  if (snapshot.riskScore >= 35 || latestDelivery < 70) {
    return "Slipping" as const;
  }

  if (snapshot.completion >= 75 && latestDelivery >= 80) {
    return "Healthy" as const;
  }

  return "Stable" as const;
}

function getAiLabel(riskLayer: ProjectHealthTeam["riskLayer"], trend: ProjectHealthTeam["trend"]) {
  if (riskLayer === "Ghost Team") {
    return "Silent failure pattern detected";
  }

  if (riskLayer === "Fake Progress") {
    return "Execution mismatch detected";
  }

  if (riskLayer === "Mentor Dependent") {
    return "Approval bottleneck detected";
  }

  if (riskLayer === "Research Blocked") {
    return "Research stagnation detected";
  }

  if (riskLayer === "Critical" || riskLayer === "At Risk") {
    return "Intervention window is closing";
  }

  if (trend === "Improving rapidly" || trend === "Recovering after revision") {
    return "Recoverable velocity detected";
  }

  return "Healthy velocity";
}

function getInterventionUrgency(riskLayer: ProjectHealthTeam["riskLayer"], priorityScore: number) {
  if (riskLayer === "Critical" || riskLayer === "Ghost Team" || priorityScore >= 85) {
    return "Immediate" as const;
  }

  if (riskLayer === "At Risk" || riskLayer === "Fake Progress" || riskLayer === "Research Blocked") {
    return "High" as const;
  }

  if (riskLayer === "Slipping" || riskLayer === "Mentor Dependent") {
    return "Review" as const;
  }

  return "Monitor" as const;
}

function getPriorityScore(snapshot: TeamHealthSnapshot) {
  const team = snapshot.team;
  const activeMilestone = getActiveMilestone(team);
  const duePressure = activeMilestone?.dueAt
    ? Math.max(
        0,
        18 -
          Math.ceil(
            (activeMilestone.dueAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          ),
      )
    : 6;

  return clampPercentage(
    snapshot.riskScore +
      snapshot.inactiveDays * 2 +
      snapshot.missedSubmissions * 9 +
      snapshot.backlogItems * 2 +
      getPendingReviewCount(team) * 5 +
      duePressure,
  );
}

function buildDetectedSignals(snapshot: TeamHealthSnapshot, riskLayer: ProjectHealthTeam["riskLayer"]) {
  const team = snapshot.team;
  const latest = team.project.analytics.at(-1);
  const signals = [...snapshot.alerts];
  const maxContribution = Math.max(...team.students.map((member) => member.contributionScore), 0);
  const avgContribution = snapshot.averageContribution;

  if (riskLayer === "Fake Progress") {
    signals.push("High visible progress but low technical delivery velocity.");
  }

  if (riskLayer === "Research Blocked") {
    signals.push("Paper and literature movement changed by less than 2% this sprint.");
  }

  if (maxContribution - avgContribution >= 22) {
    signals.push(`Possible dependency risk: one member is carrying ${maxContribution}% contribution density.`);
  }

  if ((latest?.submittedCount ?? 0) >= 4 && deliveryRatio(latest) < 65) {
    signals.push("Execution mismatch: frequent submissions are not translating into delivery.");
  }

  if (signals.length === 0) {
    signals.push("Consistent submissions across the current sprint window.");
  }

  return signals.slice(0, 4);
}

function buildQualitySignals(snapshot: TeamHealthSnapshot) {
  const team = snapshot.team;
  const latest = team.project.analytics.at(-1);
  const contributionSpread = team.students.length
    ? Math.min(
        100,
        100 -
          (Math.max(...team.students.map((member) => member.contributionScore)) -
            Math.min(...team.students.map((member) => member.contributionScore))),
      )
    : 0;
  const reviewTurnaround = latest
    ? clampPercentage((latest.reviewedCount / Math.max(1, latest.submittedCount)) * 100)
    : 0;

  return [
    {
      label: "GitHub commit consistency",
      value: clampPercentage((snapshot.averageContribution + deliveryRatio(latest)) / 2),
      detail: "Mapped from technical evidence cadence and contribution density.",
    },
    {
      label: "Deployment uptime",
      value: clampPercentage((latest?.experimentationProgress ?? snapshot.completion) - snapshot.backlogItems * 4),
      detail: `${latest?.criticalBacklogCount ?? 0} critical blockers affecting demo stability.`,
    },
    {
      label: "Documentation maturity",
      value: clampPercentage(average([latest?.writingProgress ?? 0, latest?.literatureProgress ?? 0])),
      detail: "Weighted across paper writing and literature evidence.",
    },
    {
      label: "Research depth",
      value: clampPercentage(latest?.literatureProgress ?? 0),
      detail: "Literature coverage and synthesis maturity.",
    },
    {
      label: "Participation equality",
      value: contributionSpread,
      detail: "Contribution distribution across active members.",
    },
    {
      label: "Sprint discipline",
      value: deliveryRatio(latest),
      detail: `${latest?.deliveredPoints ?? 0}/${latest?.plannedPoints ?? 0} planned points delivered.`,
    },
    {
      label: "Testing evidence",
      value: clampPercentage((latest?.experimentationProgress ?? 0) - (latest?.criticalBacklogCount ?? 0) * 6),
      detail: "Experiment progress discounted by critical backlog.",
    },
    {
      label: "Demo readiness",
      value: clampPercentage(average([snapshot.completion, latest?.experimentationProgress ?? 0, reviewTurnaround])),
      detail: "Completion, experiment stability, and review closure fused.",
    },
    {
      label: "Technical complexity",
      value: team.project.difficulty === "ADVANCED" ? 88 : team.project.difficulty === "INTERMEDIATE" ? 72 : 58,
      detail: `${team.project.domain} project complexity profile.`,
    },
  ];
}

function buildExecutionTimeline(team: HealthTeamRecord) {
  return team.project.analytics.slice(-5).map((snapshot) => ({
    label: snapshot.label,
    sprintReliability: deliveryRatio(snapshot),
    submissionReliability: clampPercentage(snapshot.submittedCount * 18),
    reviewTurnaround: clampPercentage((snapshot.reviewedCount / Math.max(1, snapshot.submittedCount)) * 100),
    paperVelocity: clampPercentage(average([snapshot.literatureProgress, snapshot.writingProgress])),
    deploymentStability: clampPercentage(snapshot.experimentationProgress - snapshot.criticalBacklogCount * 8),
  }));
}

function buildTeamHealthSnapshot(team: HealthTeamRecord): TeamHealthSnapshot {
  const latestActivityDate = getLatestActivityDate(team);
  const inactiveDays = daysSince(latestActivityDate);
  const missedSubmissions = getMissedSubmissions(team);
  const backlogItems = team.project.analytics.at(-1)?.openBacklogCount ?? 0;
  const completion = clampPercentage(team.project.progress);
  const averageContribution = average(
    team.students.map((member) => member.contributionScore),
  );
  const revisionCount = team.submissions.filter(
    (submission) =>
      submission.status === "REVISION_REQUIRED" || submission.status === "REJECTED",
  ).length;
  const pendingReviewCount = team.submissions.filter(
    (submission) =>
      submission.status === "PENDING_REVIEW" || submission.status === "UNDER_REVIEW",
  ).length;

  const health = calculateTeamHealth({
    progress: completion,
    averageContribution,
    inactiveDays,
    missedSubmissions,
    revisionCount,
    pendingReviewCount,
  });

  return {
    team,
    riskScore: health.riskScore,
    healthStatus: health.healthStatus,
    velocity: health.velocity,
    alerts: health.alerts,
    inactiveDays,
    missedSubmissions,
    backlogItems,
    completion,
    averageContribution,
  };
}

async function syncProjectHealth(teamSnapshot: TeamHealthSnapshot) {
  await db.project.update({
    where: {
      id: teamSnapshot.team.projectId,
    },
    data: {
      riskScore: teamSnapshot.riskScore,
      healthStatus: teamSnapshot.healthStatus,
      progress: teamSnapshot.completion,
    },
  });
}

function aggregateSnapshots(teams: HealthTeamRecord[]) {
  const bucket = new Map<
    string,
    {
      planned: number;
      delivered: number;
      open: number;
      critical: number;
    }
  >();

  for (const team of teams) {
    for (const snapshot of team.project.analytics) {
      const current = bucket.get(snapshot.label) ?? {
        planned: 0,
        delivered: 0,
        open: 0,
        critical: 0,
      };

      current.planned += snapshot.plannedPoints;
      current.delivered += snapshot.deliveredPoints;
      current.open += snapshot.openBacklogCount;
      current.critical += snapshot.criticalBacklogCount;

      bucket.set(snapshot.label, current);
    }
  }

  return [...bucket.entries()].map(([label, value]) => ({
    sprint: label,
    planned: value.planned,
    delivered: value.delivered,
    open: value.open,
    critical: value.critical,
  }));
}

export async function getProjectHealthData(
  viewer: ViewerContext,
): Promise<ProjectHealthData> {
  const teams = await db.team.findMany({
    where: getTeamScopeWhere(viewer),
    orderBy: [{ batch: "asc" }, { name: "asc" }],
    include: healthTeamInclude,
  });

  const snapshots = teams.map(buildTeamHealthSnapshot);
  await Promise.all(snapshots.map(syncProjectHealth));

  const aggregatedSnapshots = aggregateSnapshots(teams);
  const highRiskTeams = snapshots.filter((snapshot) => snapshot.healthStatus === "HIGH");
  const mediumRiskTeams = snapshots.filter(
    (snapshot) => snapshot.healthStatus === "MEDIUM",
  );
  const totalMissedSubmissions = snapshots.reduce(
    (sum, snapshot) => sum + snapshot.missedSubmissions,
    0,
  );
  const averageVelocity = average(
    aggregatedSnapshots.map((snapshot) =>
      snapshot.planned === 0
        ? 100
        : clampPercentage((snapshot.delivered / snapshot.planned) * 100),
    ),
  );
  const enrichedTeams = snapshots
    .map<ProjectHealthTeam>((snapshot) => {
      const team = snapshot.team;
      const latest = team.project.analytics.at(-1);
      const activeMilestone = getActiveMilestone(team);
      const priorityScore = getPriorityScore(snapshot);
      const riskLayer = getRiskLayer(snapshot);
      const trend = getTrend(team, snapshot.inactiveDays);
      const completionConfidence = clampPercentage(
        100 -
          snapshot.riskScore +
          deliveryRatio(latest) * 0.16 -
          snapshot.missedSubmissions * 4,
      );
      const paperCompletionConfidence = clampPercentage(
        average([latest?.literatureProgress ?? 0, latest?.writingProgress ?? 0]) -
          (riskLayer === "Research Blocked" ? 12 : 0),
      );
      const technicalExecutionConfidence = clampPercentage(
        average([latest?.experimentationProgress ?? 0, deliveryRatio(latest)]) -
          (latest?.criticalBacklogCount ?? 0) * 5,
      );
      const vivaReadinessConfidence = clampPercentage(
        average([
          completionConfidence,
          paperCompletionConfidence,
          technicalExecutionConfidence,
          latest?.performanceScore ?? 0,
        ]),
      );
      const interventionUrgency = getInterventionUrgency(riskLayer, priorityScore);

      return {
        id: team.id,
        team: team.name,
        project: team.project.title,
        problemStatement: team.project.description,
        batch: team.batch,
        mentor: team.faculty.name,
        completion: snapshot.completion,
        healthScore: clampPercentage(100 - snapshot.riskScore),
        riskScore: snapshot.riskScore,
        priorityScore,
        riskLayer,
        trend,
        momentum: getMomentum(team),
        aiLabel: getAiLabel(riskLayer, trend),
        sprintStatus: latest
          ? `${latest.label} ${latest.deliveredPoints}/${latest.plannedPoints} pts delivered`
          : "Sprint evidence pending",
        deliveryRiskState:
          riskLayer === "Healthy" || riskLayer === "Stable"
            ? "Controlled delivery"
            : riskLayer === "Slipping"
              ? "Delayed but recoverable"
              : riskLayer === "Mentor Dependent"
                ? "Waiting on faculty decision"
                : "Intervention required",
        completionConfidence,
        paperCompletionConfidence,
        vivaReadinessConfidence,
        technicalExecutionConfidence,
        mentorLoad:
          getPendingReviewCount(team) >= 3
            ? "High"
            : getPendingReviewCount(team) > 0 || snapshot.riskScore >= 45
              ? "Medium"
              : "Low",
        interventionUrgency,
        currentMilestone: activeMilestone?.title ?? mapProjectStatusLabel(team.project.status),
        deadlineLabel: activeMilestone?.dueAt
          ? formatRelativeDaysLabel(activeMilestone.dueAt)
          : "Deadline pending",
        backlogItems: snapshot.backlogItems,
        inactiveDays: snapshot.inactiveDays,
        missedSubmissions: snapshot.missedSubmissions,
        velocity: snapshot.velocity,
        alerts:
          snapshot.alerts.length > 0
            ? snapshot.alerts
            : ["Project is operating inside the healthy delivery band."],
        contributionHeatmap: buildContributionHeatmap(
          snapshot.team,
          snapshot.inactiveDays,
        ),
        detectedSignals: buildDetectedSignals(snapshot, riskLayer),
        qualitySignals: buildQualitySignals(snapshot),
        executionTimeline: buildExecutionTimeline(team),
      };
    })
    .sort((left, right) => right.priorityScore - left.priorityScore);
  const riskDistribution = [
    "Critical",
    "Ghost Team",
    "Fake Progress",
    "Research Blocked",
    "Mentor Dependent",
    "At Risk",
    "Slipping",
    "Stable",
    "Healthy",
  ].map((label) => ({
    label: label as ProjectHealthTeam["riskLayer"],
    count: enrichedTeams.filter((team) => team.riskLayer === label).length,
  }));
  const highestRiskTeam = enrichedTeams[0];
  const activeRiskCount = enrichedTeams.filter(
    (team) =>
      team.interventionUrgency === "Immediate" ||
      team.interventionUrgency === "High",
  ).length;

  return {
    stats: [
      {
        label: "Healthy projects",
        value: `${snapshots.filter((snapshot) => snapshot.healthStatus === "LOW").length}`,
        detail: `${snapshots.length} monitored team workspaces`,
        tone: "positive",
      },
      {
        label: "Attention needed",
        value: `${highRiskTeams.length + mediumRiskTeams.length}`,
        detail: `${highRiskTeams.length} high-risk teams require escalation`,
        tone: highRiskTeams.length > 0 ? "critical" : "warning",
      },
      {
        label: "Missed submissions",
        value: `${totalMissedSubmissions}`,
        detail: "Expected weekly evidence packs not yet received",
        tone: totalMissedSubmissions > 0 ? "warning" : "positive",
      },
      {
        label: "Delivery velocity",
        value: `${averageVelocity}%`,
        detail: "Average delivered points against planned workload",
        tone: averageVelocity >= 80 ? "positive" : averageVelocity >= 60 ? "warning" : "critical",
      },
    ],
    executionPulse: {
      score: average(enrichedTeams.map((team) => team.healthScore)),
      state:
        activeRiskCount > 0
          ? `${activeRiskCount} teams need intervention`
          : "Portfolio execution stable",
      summary: highestRiskTeam
        ? `${highestRiskTeam.team} is the highest operational risk: ${highestRiskTeam.aiLabel.toLowerCase()}.`
        : "No project health data is available yet.",
    },
    riskDistribution,
    aiSummary: highestRiskTeam
      ? `${highestRiskTeam.team} should be reviewed first. ${highestRiskTeam.detectedSignals[0]} ${enrichedTeams.filter((team) => team.trend === "Improving rapidly" || team.trend === "Recovering after revision").length} teams show recovery momentum.`
      : "Project intelligence will appear once teams begin submitting evidence.",
    velocitySeries: aggregatedSnapshots.map((snapshot) => ({
      sprint: snapshot.sprint,
      planned: snapshot.planned,
      delivered: snapshot.delivered,
    })),
    backlogSeries: aggregatedSnapshots.map((snapshot) => ({
      sprint: snapshot.sprint,
      open: snapshot.open,
      critical: snapshot.critical,
    })),
    alerts: snapshots
      .filter((snapshot) => snapshot.alerts.length > 0)
      .sort((left, right) => right.riskScore - left.riskScore)
      .slice(0, 6)
      .map((snapshot) =>
        buildActivityItem({
          id: snapshot.team.id,
          title: `${snapshot.team.name} requires intervention`,
          detail: snapshot.alerts[0] ?? "Review workload is trending unsafe.",
          date:
            snapshot.team.activityEvents[0]?.createdAt ??
            snapshot.team.submissions[0]?.submittedAt ??
            snapshot.team.updatedAt,
          tag: `${snapshot.team.batch} · ${snapshot.team.project.title}`,
          tone: mapHealthTone(snapshot.healthStatus),
        }),
      ),
    teams: enrichedTeams,
  };
}

export async function syncProjectHealthForTeam(teamId: string) {
  const team = await db.team.findUnique({
    where: {
      id: teamId,
    },
    include: healthTeamInclude,
  });

  if (!team) {
    return null;
  }

  const snapshot = buildTeamHealthSnapshot(team);
  await syncProjectHealth(snapshot);
  return snapshot;
}
