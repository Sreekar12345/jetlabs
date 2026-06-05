/**
 * Analytics and charting types.
 * Used across dashboard charts, KPI cards, and analytics pages.
 */

export type KpiTone = "default" | "success" | "warn" | "bad";

export type KpiData = {
  label: string;
  value: string;
  hint: string;
  tone: KpiTone;
  delta?: number;
};

export type WeeklyChartPoint = {
  week: string;
  submissions: number;
  approved: number;
};

export type ProgressChartPoint = {
  week: string;
  done: number;
  target: number;
};

export type AttendancePoint = {
  month: string;
  pct: number;
};

export type BatchAnalytics = {
  batchId: string;
  batchName: string;
  avgProgress: number;
  avgAttendance: number;
  atRiskCount: number;
  totalStudents: number;
};

export type PerformanceDistribution = {
  band: string;
  count: number;
  percentage: number;
};
