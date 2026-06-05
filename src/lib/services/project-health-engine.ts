import { HealthStatus } from "@prisma/client";

export type TeamHealthInput = {
  progress: number;
  averageContribution: number;
  inactiveDays: number;
  missedSubmissions: number;
  revisionCount: number;
  pendingReviewCount: number;
};

export type TeamHealthResult = {
  riskScore: number;
  healthStatus: HealthStatus;
  velocity: string;
  alerts: string[];
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateTeamHealth(input: TeamHealthInput): TeamHealthResult {
  let score = 0;
  const alerts: string[] = [];

  if (input.progress < 45) {
    score += 20;
    alerts.push("Project completion is lagging behind the expected operating pace.");
  } else if (input.progress < 65) {
    score += 10;
  }

  if (input.averageContribution < 50) {
    score += 25;
    alerts.push("Contribution density is low across the team.");
  } else if (input.averageContribution < 70) {
    score += 12;
  }

  if (input.inactiveDays >= 14) {
    score += 25;
    alerts.push("The team has been inactive for more than two weeks.");
  } else if (input.inactiveDays >= 7) {
    score += 15;
    alerts.push("Recent execution activity has slowed down.");
  }

  if (input.missedSubmissions >= 2) {
    score += 20;
    alerts.push("Multiple expected submission windows were missed.");
  } else if (input.missedSubmissions === 1) {
    score += 10;
  }

  if (input.revisionCount >= 2) {
    score += 12;
    alerts.push("Repeated revision cycles are slowing delivery confidence.");
  } else if (input.pendingReviewCount >= 2) {
    score += 6;
  }

  const riskScore = clampScore(score);
  const healthStatus =
    riskScore >= 70 ? HealthStatus.HIGH : riskScore >= 40 ? HealthStatus.MEDIUM : HealthStatus.LOW;

  const velocity =
    healthStatus === HealthStatus.HIGH
      ? "Critical"
      : healthStatus === HealthStatus.MEDIUM
        ? "Slipping"
        : input.progress >= 80
          ? "Ahead"
          : "Stable";

  return {
    riskScore,
    healthStatus,
    velocity,
    alerts,
  };
}
