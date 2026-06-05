import {
  DifficultyLevel,
  HealthStatus,
  ProblemSource,
  ProjectStatus,
  SubmissionStatus,
} from "@prisma/client";
import type {
  ActivityFeedItem,
  MetricTone,
  ProblemListing,
  StudentSubmissionStatus,
} from "@/types/aoip";

export function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, current) => sum + current, 0) / values.length,
  );
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

export function formatDateLabel(date: Date | string | null | undefined) {
  if (!date) {
    return "Date pending";
  }

  const resolvedDate = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(resolvedDate);
}

export function formatDateTimeLabel(date: Date | string | null | undefined) {
  if (!date) {
    return "Pending";
  }

  const resolvedDate = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(resolvedDate);
}

export function formatRelativeDaysLabel(date: Date | string | null | undefined) {
  if (!date) {
    return "No deadline";
  }

  const resolvedDate = typeof date === "string" ? new Date(date) : date;
  const diffInDays = Math.ceil(
    (resolvedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) {
    return "Due today";
  }

  if (diffInDays > 0) {
    return `Due in ${diffInDays} day${diffInDays === 1 ? "" : "s"}`;
  }

  const overdueDays = Math.abs(diffInDays);
  return `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`;
}

export function formatActivityTimestamp(
  date: Date | string | null | undefined,
): string {
  if (!date) {
    return "No activity yet";
  }

  const resolvedDate = typeof date === "string" ? new Date(date) : date;
  const diffInHours = Math.max(
    1,
    Math.round((Date.now() - resolvedDate.getTime()) / (1000 * 60 * 60)),
  );

  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.round(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function mapHealthTone(healthStatus: HealthStatus): MetricTone {
  if (healthStatus === "HIGH") {
    return "critical";
  }

  if (healthStatus === "MEDIUM") {
    return "warning";
  }

  return "positive";
}

export function mapHealthLabel(healthStatus: HealthStatus) {
  if (healthStatus === "HIGH") {
    return "High";
  }

  if (healthStatus === "MEDIUM") {
    return "Medium";
  }

  return "Low";
}

export function mapProjectStatusLabel(status: ProjectStatus) {
  switch (status) {
    case "DISCOVERY":
      return "Discovery";
    case "RESEARCH":
      return "Research";
    case "EXECUTION":
      return "Execution";
    case "EVALUATION":
      return "Evaluation";
    case "COMPLETED":
      return "Completed";
    case "ON_HOLD":
      return "On hold";
    default:
      return "Active";
  }
}

export function mapDifficultyLabel(
  difficulty: DifficultyLevel,
): ProblemListing["difficulty"] {
  if (difficulty === "ADVANCED") {
    return "Advanced";
  }

  if (difficulty === "INTERMEDIATE") {
    return "Intermediate";
  }

  return "Beginner";
}

export function mapProblemSourceLabel(
  source: ProblemSource,
): ProblemListing["source"] {
  if (source === "INDUSTRY") {
    return "Industry";
  }

  if (source === "RESEARCH_LAB") {
    return "Research Lab";
  }

  return "Faculty";
}

export function mapStudentSubmissionStatus(
  status: SubmissionStatus,
): StudentSubmissionStatus {
  switch (status) {
    case "APPROVED":
      return "On track";
    case "REVISION_REQUIRED":
    case "REJECTED":
      return "Needs revision";
    case "DRAFT":
      return "Ready to submit";
    case "UNDER_REVIEW":
    case "PENDING_REVIEW":
    default:
      return "Awaiting review";
  }
}

export function buildActivityItem(input: {
  id: string;
  title: string;
  detail: string;
  date: Date | string;
  tag?: string;
  tone?: MetricTone;
}): ActivityFeedItem {
  return {
    id: input.id,
    title: input.title,
    detail: input.detail,
    timestamp: formatActivityTimestamp(input.date),
    tag: input.tag,
    tone: input.tone,
  };
}
