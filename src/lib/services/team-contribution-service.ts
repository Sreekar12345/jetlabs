// @ts-nocheck
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getTeamScopeWhere, type ViewerContext } from "@/lib/permissions";
import {
  average,
  buildActivityItem,
  clampPercentage,
  formatActivityTimestamp,
} from "@/lib/services/shared";
import type {
  ExecutionOwnershipMember,
  ExecutionOwnershipTeam,
  TeamContributionData,
} from "@/types/aoip";

const teamContributionInclude = {
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

type ContributionTeamRecord = Prisma.TeamGetPayload<{
  include: typeof teamContributionInclude;
}>;

type ContributionMemberRecord = ContributionTeamRecord["students"][number];

function daysSince(date: Date | null | undefined) {
  if (!date) {
    return 30;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function deliveryRatio(snapshot: ContributionTeamRecord["project"]["analytics"][number] | undefined) {
  if (!snapshot || snapshot.plannedPoints === 0) {
    return 100;
  }

  return clampPercentage((snapshot.deliveredPoints / snapshot.plannedPoints) * 100);
}

function standardDeviation(values: number[]) {
  if (values.length <= 1) {
    return 0;
  }

  const mean = average(values);
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;

  return Math.sqrt(variance);
}

function getSubmissionCount(team: ContributionTeamRecord, userId: string) {
  return team.submissions.filter((submission) => submission.submittedById === userId).length;
}

function roleBias(role: string, area: "technical" | "research" | "documentation" | "presentation" | "deployment") {
  const normalized = role.toLowerCase();

  if (area === "technical" && /(lead|backend|frontend|iot|model|dev|engineering)/.test(normalized)) {
    return 14;
  }

  if (area === "research" && /(research|writing|paper|literature)/.test(normalized)) {
    return 18;
  }

  if (area === "documentation" && /(writing|docs|paper|presentation)/.test(normalized)) {
    return 16;
  }

  if (area === "presentation" && /(presentation|viva|lead)/.test(normalized)) {
    return 14;
  }

  if (area === "deployment" && /(lead|backend|frontend|iot|dev|deployment)/.test(normalized)) {
    return 14;
  }

  return 0;
}

function getAreaScores(
  team: ContributionTeamRecord,
  member: ContributionMemberRecord,
  ownership: number,
) {
  const latest = team.project.analytics.at(-1);
  const submissionCount = getSubmissionCount(team, member.userId);
  const contribution = member.contributionScore;
  const activePenalty = Math.min(24, daysSince(member.lastActiveAt) * 2);

  return {
    technicalContribution: clampPercentage(
      contribution * 0.64 +
        deliveryRatio(latest) * 0.22 +
        submissionCount * 5 +
        roleBias(member.roleLabel, "technical") -
        activePenalty,
    ),
    researchContribution: clampPercentage(
      contribution * 0.45 +
        average([latest?.literatureProgress ?? 0, latest?.writingProgress ?? 0]) * 0.35 +
        roleBias(member.roleLabel, "research") -
        activePenalty * 0.5,
    ),
    sprintParticipation: clampPercentage(
      contribution * 0.55 + submissionCount * 12 + deliveryRatio(latest) * 0.2 - activePenalty,
    ),
    documentationOwnership: clampPercentage(
      contribution * 0.4 +
        (latest?.writingProgress ?? 0) * 0.35 +
        roleBias(member.roleLabel, "documentation"),
    ),
    presentationOwnership: clampPercentage(
      contribution * 0.38 +
        (member.user.performance?.reviewScore ?? 0) * 0.28 +
        roleBias(member.roleLabel, "presentation"),
    ),
    deploymentOwnership: clampPercentage(
      contribution * 0.42 +
        (latest?.experimentationProgress ?? 0) * 0.32 +
        roleBias(member.roleLabel, "deployment") -
        activePenalty,
    ),
    taskOwnership: clampPercentage(ownership * 1.55 + contribution * 0.45 + submissionCount * 6),
  };
}

function getMemberLabel(input: {
  ownership: number;
  technicalContribution: number;
  researchContribution: number;
  sprintParticipation: number;
  lastActiveDays: number;
  dependencyScore: number;
}) {
  if (input.ownership >= 45 && input.dependencyScore >= 48) {
    return "Burnout Risk" as const;
  }

  if (input.ownership >= 36 || input.technicalContribution >= 82) {
    return "Execution Lead" as const;
  }

  if (input.lastActiveDays >= 14) {
    return "Disconnected" as const;
  }

  if (input.ownership <= 12 || input.sprintParticipation < 28) {
    return "Free Rider" as const;
  }

  if (input.researchContribution - input.technicalContribution >= 18) {
    return "Research Heavy" as const;
  }

  if (input.ownership < 22 && input.researchContribution >= 58) {
    return "Silent Contributor" as const;
  }

  if (input.ownership < 22) {
    return "Support Role" as const;
  }

  if (input.sprintParticipation < 45) {
    return "At Risk" as const;
  }

  return "Stable Contributor" as const;
}

function getRiskState(label: ExecutionOwnershipMember["aiLabel"], reliability: number) {
  if (label === "Free Rider" || label === "Disconnected") {
    return "Critical" as const;
  }

  if (label === "Burnout Risk" || reliability < 42) {
    return "High" as const;
  }

  if (label === "At Risk" || label === "Silent Contributor" || reliability < 62) {
    return "Watch" as const;
  }

  return "Low" as const;
}

function getWeeklyTrend(team: ContributionTeamRecord, member: ContributionMemberRecord) {
  const snapshots = team.project.analytics.slice(-6);

  if (snapshots.length === 0) {
    return [member.contributionScore];
  }

  return snapshots.map((snapshot, index) =>
    clampPercentage(
      member.contributionScore * 0.48 +
        snapshot.performanceScore * 0.24 +
        deliveryRatio(snapshot) * 0.2 +
        (index - snapshots.length + 1) * 3,
    ),
  );
}

function buildMemberInsights(
  member: ContributionMemberRecord,
  label: ExecutionOwnershipMember["aiLabel"],
  ownership: number,
  areaScores: ReturnType<typeof getAreaScores>,
) {
  const insights: string[] = [];
  const anomalies: string[] = [];
  const dependencySignals: string[] = [];

  if (label === "Execution Lead") {
    insights.push("Execution leader detected. Handles most technical delivery.");
  }

  if (label === "Burnout Risk") {
    insights.push("High dependency risk. Team progress heavily relies on this member.");
    dependencySignals.push("Leadership overload is above the safe operating band.");
  }

  if (label === "Research Heavy") {
    insights.push("Silent research value is visible despite lower technical activity.");
  }

  if (label === "Free Rider") {
    insights.push("Possible free-rider pattern. Minimal task ownership across recent sprints.");
    anomalies.push("Ownership is below the expected peer accountability threshold.");
  }

  if (label === "Disconnected") {
    insights.push("Disconnected contributor. Activity has gone quiet for more than two weeks.");
    anomalies.push("Sustained inactivity requires faculty validation.");
  }

  if (areaScores.technicalContribution - areaScores.researchContribution >= 24) {
    dependencySignals.push("Technical ownership is isolated around this member.");
  }

  if (areaScores.documentationOwnership < 35 && ownership > 30) {
    anomalies.push("Delivery work is not matched by documentation evidence.");
  }

  if (insights.length === 0) {
    insights.push("Stable contributor. Ownership and evidence are inside the expected band.");
  }

  return {
    insights,
    anomalies: anomalies.length > 0 ? anomalies : ["No critical workload anomaly detected."],
    dependencySignals:
      dependencySignals.length > 0
        ? dependencySignals
        : ["No single-member dependency signal detected."],
  };
}

function buildMembers(team: ContributionTeamRecord) {
  const totalContribution = Math.max(
    1,
    team.students.reduce((sum, member) => sum + member.contributionScore, 0),
  );
  const ownershipShares = team.students.map((member) =>
    clampPercentage((member.contributionScore / totalContribution) * 100),
  );
  const dependencyScore = Math.max(...ownershipShares, 0);

  return team.students.map<ExecutionOwnershipMember>((member, index) => {
    const ownership = ownershipShares[index] ?? 0;
    const areaScores = getAreaScores(team, member, ownership);
    const lastActiveDays = daysSince(member.lastActiveAt);
    const reliability = clampPercentage(
      average([
        member.contributionScore,
        areaScores.sprintParticipation,
        member.user.performance?.submissionScore ?? 0,
        member.user.performance?.reviewScore ?? 0,
        100 - Math.min(80, lastActiveDays * 6),
      ]),
    );
    const ownershipConsistency = clampPercentage(
      100 - standardDeviation(getWeeklyTrend(team, member)) * 1.2,
    );
    const deadlineDiscipline = clampPercentage(
      average([areaScores.sprintParticipation, member.user.performance?.submissionScore ?? 0]),
    );
    const collaborationQuality = clampPercentage(
      average([reliability, ownershipConsistency, member.contributionScore]),
    );
    const reviewResponsiveness = clampPercentage(
      average([member.user.performance?.reviewScore ?? 0, areaScores.documentationOwnership]),
    );
    const aiLabel = getMemberLabel({
      ownership,
      technicalContribution: areaScores.technicalContribution,
      researchContribution: areaScores.researchContribution,
      sprintParticipation: areaScores.sprintParticipation,
      lastActiveDays,
      dependencyScore,
    });
    const riskState = getRiskState(aiLabel, reliability);
    const insightBundle = buildMemberInsights(member, aiLabel, ownership, areaScores);

    return {
      id: member.id,
      name: member.user.name,
      role: member.roleLabel,
      aiLabel,
      riskState,
      ownership,
      technicalContribution: areaScores.technicalContribution,
      researchContribution: areaScores.researchContribution,
      sprintParticipation: areaScores.sprintParticipation,
      documentationOwnership: areaScores.documentationOwnership,
      reliability,
      ownershipConsistency,
      deadlineDiscipline,
      collaborationQuality,
      reviewResponsiveness,
      lastActiveLabel: formatActivityTimestamp(member.lastActiveAt),
      insights: insightBundle.insights,
      anomalies: insightBundle.anomalies,
      dependencySignals: insightBundle.dependencySignals,
      trustSignals: [
        { label: "Actual commits", value: areaScores.technicalContribution },
        { label: "Task ownership", value: areaScores.taskOwnership },
        { label: "Documentation edits", value: areaScores.documentationOwnership },
        { label: "Submission history", value: areaScores.sprintParticipation },
        { label: "Review activity", value: reviewResponsiveness },
        { label: "Deployment involvement", value: areaScores.deploymentOwnership },
      ],
      weeklyTrend: getWeeklyTrend(team, member),
      ownershipAreas: [
        { label: "Commit ownership", value: areaScores.technicalContribution },
        { label: "Research ownership", value: areaScores.researchContribution },
        { label: "Documentation ownership", value: areaScores.documentationOwnership },
        { label: "Task ownership", value: areaScores.taskOwnership },
        { label: "Presentation ownership", value: areaScores.presentationOwnership },
        { label: "Deployment ownership", value: areaScores.deploymentOwnership },
      ],
    };
  });
}

function buildTeamDiagnosis(team: ContributionTeamRecord, members: ExecutionOwnershipMember[]) {
  const lead = members.reduce(
    (current, member) => (member.ownership > current.ownership ? member : current),
    members[0],
  );
  const researchAverage = average(members.map((member) => member.researchContribution));
  const technicalAverage = average(members.map((member) => member.technicalContribution));
  const freeRiders = members.filter(
    (member) => member.aiLabel === "Free Rider" || member.aiLabel === "Disconnected",
  );

  if (freeRiders.length > 0) {
    return `Participation imbalance is unsafe. ${freeRiders.length} member pattern requires validation.`;
  }

  if (lead && lead.ownership >= 45) {
    return `Technical ownership concentrated in ${lead.name}. Rebalance before knowledge silos harden.`;
  }

  if (technicalAverage - researchAverage >= 16) {
    return "This team is execution-heavy but research-weak.";
  }

  if (researchAverage - technicalAverage >= 16) {
    return "Research contribution is ahead of implementation evidence.";
  }

  return "Ownership distribution is within the stable collaboration band.";
}

function buildContributionTeam(team: ContributionTeamRecord): ExecutionOwnershipTeam {
  const members = buildMembers(team);
  const ownershipValues = members.map((member) => member.ownership);
  const dependencyScore = Math.max(...ownershipValues, 0);
  const balanceScore = clampPercentage(100 - standardDeviation(ownershipValues) * 2.4);
  const collaborationScore = average(members.map((member) => member.collaborationQuality));
  const freeRiders = members.filter(
    (member) => member.aiLabel === "Free Rider" || member.aiLabel === "Disconnected",
  );
  const burnoutMembers = members.filter((member) => member.aiLabel === "Burnout Risk");
  const riskState =
    freeRiders.length > 0 || dependencyScore >= 58
      ? "Critical"
      : dependencyScore >= 44 || burnoutMembers.length > 0 || balanceScore < 62
        ? "Imbalanced"
        : collaborationScore < 70
          ? "Watch"
          : "Healthy";
  const dominantMember =
    members.reduce(
      (current, member) => (member.ownership > current.ownership ? member : current),
      members[0],
    )?.name ?? "No dominant member";
  const aiDiagnosis = buildTeamDiagnosis(team, members);
  const priorityScore = clampPercentage(
    dependencyScore * 0.55 +
      (100 - balanceScore) * 0.45 +
      freeRiders.length * 18 +
      burnoutMembers.length * 14 +
      Math.max(0, 72 - collaborationScore),
  );
  const latest = team.project.analytics.at(-1);

  return {
    id: team.id,
    team: team.name,
    project: team.project.title,
    batch: team.batch,
    mentor: team.faculty.name,
    balanceScore,
    dependencyScore,
    collaborationHealth:
      riskState === "Healthy"
        ? "Balanced execution"
        : riskState === "Watch"
          ? "Soft imbalance"
          : riskState === "Imbalanced"
            ? "Dependency risk"
            : "Collapse risk",
    aiDiagnosis,
    riskState,
    priorityScore,
    dominantMember,
    dynamics: [
      aiDiagnosis,
      dependencyScore >= 44
        ? `Execution depends heavily on ${dominantMember}.`
        : "No single-owner collapse pattern detected.",
      average(members.map((member) => member.researchContribution)) <
      average(members.map((member) => member.technicalContribution)) - 12
        ? "Research contribution is trailing implementation work."
        : "Research and implementation ownership are reasonably aligned.",
      latest && latest.reviewedCount < latest.submittedCount
        ? "Review feedback loop is slower than submission activity."
        : "Review responsiveness is not blocking current ownership.",
    ],
    forecasts: [
      {
        label: "Team stability",
        value: clampPercentage(average([balanceScore, collaborationScore, 100 - dependencyScore])),
        detail: "Probability that ownership remains stable next sprint.",
      },
      {
        label: "Free-rider probability",
        value: clampPercentage(freeRiders.length * 34 + Math.max(0, 52 - balanceScore)),
        detail: "Risk inferred from low ownership and inactivity signals.",
      },
      {
        label: "Leader overload",
        value: clampPercentage(dependencyScore + burnoutMembers.length * 18),
        detail: "Expected pressure on the dominant contributor.",
      },
      {
        label: "Redistribution need",
        value: priorityScore,
        detail: "Mentor action priority for workload rebalance.",
      },
    ],
    interventions:
      riskState === "Healthy"
        ? ["Preserve current ownership map", "Capture peer-review evidence", "Prepare viva responsibility split"]
        : [
            "Rebalance workload",
            "Trigger peer review",
            "Require sync meeting",
            "Force responsibility redistribution",
            freeRiders.length > 0 ? "Flag free rider" : "Assign mentorship",
            riskState === "Critical" ? "Escalate imbalance" : "Track recovery next sprint",
          ],
    members,
  };
}

export async function getTeamContributionData(
  viewer: ViewerContext,
): Promise<TeamContributionData> {
  const teams = await db.team.findMany({
    where: getTeamScopeWhere(viewer),
    orderBy: [{ batch: "asc" }, { name: "asc" }],
    relationLoadStrategy: "join",
    include: teamContributionInclude,
  });
  const executionTeams = teams
    .map(buildContributionTeam)
    .sort((left: any, right: any) => right.priorityScore - left.priorityScore);
  const dependencyRiskTeams = executionTeams.filter((team: any) => team.dependencyScore >= 44);
  const freeRiderCount = executionTeams.reduce(
    (sum: any, team: any) =>
      sum +
      team.members.filter(
        (member: any) => member.aiLabel === "Free Rider" || member.aiLabel === "Disconnected",
      ).length,
    0,
  );
  const overloadedLeadCount = executionTeams.reduce(
    (sum: any, team: any) =>
      sum + team.members.filter((member: any) => member.aiLabel === "Burnout Risk").length,
    0,
  );
  const averageTrust = average(
    executionTeams.flatMap((team: any) =>
      team.members.map((member: any) =>
        average(member.trustSignals.map((signal: any) => signal.value)),
      ),
    ),
  );
  const highestRiskTeam = executionTeams[0];

  return {
    stats: [
      {
        label: "Balanced ownership",
        value: `${executionTeams.filter((team: any) => team.riskState === "Healthy").length}/${executionTeams.length}`,
        detail: "Teams with stable responsibility distribution.",
        tone: "positive",
      },
      {
        label: "Dependency risk",
        value: `${dependencyRiskTeams.length}`,
        detail: "Teams with one-person execution concentration.",
        tone: dependencyRiskTeams.length > 0 ? "warning" : "positive",
      },
      {
        label: "Free-rider patterns",
        value: `${freeRiderCount}`,
        detail: "Members with weak ownership and inactivity signals.",
        tone: freeRiderCount > 0 ? "critical" : "positive",
      },
      {
        label: "Trust signal strength",
        value: `${averageTrust}%`,
        detail: "Commit, submission, documentation, and review evidence.",
        tone: averageTrust >= 72 ? "positive" : averageTrust >= 55 ? "warning" : "critical",
      },
      {
        label: "Overloaded leaders",
        value: `${overloadedLeadCount}`,
        detail: "Members carrying unsafe responsibility weight.",
        tone: overloadedLeadCount > 0 ? "warning" : "positive",
      },
    ],
    aiSummary: highestRiskTeam
      ? `${highestRiskTeam.team} should be inspected first. ${highestRiskTeam.aiDiagnosis}`
      : "Ownership intelligence will appear once team activity begins.",
    teams: executionTeams,
    alerts: executionTeams.slice(0, 6).map((team: any) =>
      buildActivityItem({
        id: team.id,
        title: `${team.team} ownership review`,
        detail: team.aiDiagnosis,
        date:
          teams.find((record: any) => record.id === team.id)?.activityEvents[0]?.createdAt ??
          teams.find((record: any) => record.id === team.id)?.updatedAt ??
          new Date(),
        tag: team.collaborationHealth,
        tone:
          team.riskState === "Critical"
            ? "critical"
            : team.riskState === "Imbalanced"
              ? "warning"
              : "neutral",
      }),
    ),
  };
}
