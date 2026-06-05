/**
 * Scoring and risk assessment utilities.
 *
 * Extracted from lib/scoring.ts into the lib/scoring/ directory
 * for better organization as scoring logic grows.
 *
 * TODO: These will move to backend API responses in production.
 */
import type { Student, RiskLevel } from "@/types";

export function attendanceTone(pct: number): {
  label: "Safe" | "Warning" | "Critical";
  cls: string;
  bar: string;
  chip: string;
  warning?: string;
} {
  if (pct >= 75)
    return {
      label: "Safe",
      cls: "text-emerald-600",
      bar: "bg-emerald-500",
      chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
    };
  if (pct >= 65)
    return {
      label: "Warning",
      cls: "text-amber-600",
      bar: "bg-amber-500",
      chip: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900",
      warning: "Attendance Below Safe Threshold",
    };
  return {
    label: "Critical",
    cls: "text-rose-600",
    bar: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900",
    warning: "High Detention Risk",
  };
}

export function riskScore(s: Student): {
  score: number;
  level: RiskLevel;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];
  if (s.attendanceOverall < 65) {
    score += 35;
    reasons.push("Attendance below 65%");
  } else if (s.attendanceOverall < 75) {
    score += 18;
    reasons.push("Attendance below 75%");
  }
  const activeBacklogs = s.backlogs.filter(
    (b) => b.status === "Pending",
  ).length;
  if (activeBacklogs >= 3) {
    score += 25;
    reasons.push(`${activeBacklogs} active backlogs`);
  } else if (activeBacklogs > 0) {
    score += 10;
    reasons.push(
      `${activeBacklogs} active backlog${activeBacklogs > 1 ? "s" : ""}`,
    );
  }
  if (s.missedSubmissions >= 2) {
    score += 15;
    reasons.push(`${s.missedSubmissions} missed submissions`);
  }
  if (s.inactiveDays >= 14) {
    score += 15;
    reasons.push(`Inactive ${s.inactiveDays} days`);
  } else if (s.inactiveDays >= 7) {
    score += 8;
    reasons.push(`Inactive ${s.inactiveDays} days`);
  }
  if (s.paperProgress < 15 && s.semester >= 7) {
    score += 10;
    reasons.push("IEEE paper barely started");
  }
  const level: RiskLevel =
    score >= 60
      ? "Critical"
      : score >= 40
        ? "High"
        : score >= 20
          ? "Medium"
          : "Low";
  return { score: Math.min(100, score), level, reasons };
}
