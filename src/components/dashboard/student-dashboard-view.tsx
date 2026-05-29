"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquareText,
  NotebookTabs,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ActivityFeedItem, StudentDashboardData } from "@/types/aoip";

type StudentDashboardViewProps = {
  data: StudentDashboardData;
};

type MetricCard = {
  title: string;
  value: string;
  helper: string;
  progress: number;
  icon: typeof CheckCircle2;
};

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function numberFromValue(value?: string) {
  if (!value) {
    return 0;
  }

  const number = Number.parseInt(value.replace(/[^\d]/g, ""), 10);

  if (Number.isNaN(number)) {
    return 0;
  }

  return clampProgress(number);
}

function greetingFromTitle(title: string) {
  const cleaned = title.replace(/\.$/, "");
  const name = cleaned.split(",")[1]?.trim();

  if (name) {
    return `Welcome back, ${name}`;
  }

  return cleaned;
}

function getCurrentWeek(data: StudentDashboardData["researchSeries"]) {
  const latest = data.at(-1)?.week ?? "";
  const parsed = Number.parseInt(latest.replace(/[^\d]/g, ""), 10);

  if (Number.isNaN(parsed)) {
    return 4;
  }

  return Math.min(8, Math.max(1, parsed));
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getLatestResearch(data: StudentDashboardData["researchSeries"]) {
  return data.at(-1) ?? { week: "W4", literature: 62, experimentation: 48, writing: 56 };
}

function getChartData(data: StudentDashboardData["researchSeries"]) {
  const source =
    data.length > 0
      ? data.slice(-5)
      : [
          { week: "W1", literature: 24, experimentation: 18, writing: 14 },
          { week: "W2", literature: 38, experimentation: 25, writing: 22 },
          { week: "W3", literature: 51, experimentation: 36, writing: 34 },
          { week: "W4", literature: 63, experimentation: 48, writing: 49 },
          { week: "W5", literature: 72, experimentation: 58, writing: 61 },
        ];

  return source.map((point, index) => ({
    week: `W${index + 1}`,
    progress: Math.round((point.literature + point.experimentation + point.writing) / 3),
    submitted: Math.max(2, Math.round(point.experimentation / 12)),
  }));
}

function getMetrics(data: StudentDashboardData): MetricCard[] {
  const latestResearch = getLatestResearch(data.researchSeries);
  const cadence = data.stats.find((stat) =>
    stat.label.toLowerCase().includes("cadence"),
  );
  const paperCompletion = clampProgress(latestResearch.writing);
  const pendingComments = data.feedback.length;

  return [
    {
      title: "Overall progress",
      value: data.stats[0]?.value ?? "0%",
      helper: data.stats[0]?.detail ?? "Project progress will appear here.",
      progress: numberFromValue(data.stats[0]?.value),
      icon: CheckCircle2,
    },
    {
      title: "Paper completion",
      value: `${paperCompletion}%`,
      helper: "IEEE writing and publication readiness.",
      progress: paperCompletion,
      icon: FileText,
    },
    {
      title: "On-time streak",
      value: cadence?.value ?? "4 weeks",
      helper: cadence?.detail ?? "Weekly submissions are landing on schedule.",
      progress: 82,
      icon: CalendarDays,
    },
    {
      title: "Pending faculty comments",
      value: `${pendingComments}`,
      helper:
        pendingComments > 0
          ? "Feedback notes to acknowledge this week."
          : "No pending faculty comments right now.",
      progress: pendingComments > 0 ? clampProgress(100 - pendingComments * 18) : 100,
      icon: MessageSquareText,
    },
  ];
}

function statusTone(status: string) {
  if (status === "Completed") {
    return "border-emerald-100 bg-emerald-50 text-emerald-900";
  }

  if (status === "Active") {
    return "border-border bg-muted text-foreground";
  }

  return "border-border bg-[#fafafa] text-muted-foreground";
}

function commentStatus(index: number) {
  return index % 2 === 0 ? "Approved" : "Revision";
}

function commentStatusClass(status: string) {
  return status === "Approved"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-orange-200 bg-orange-50 text-orange-700";
}

function progressRows(data: StudentDashboardData) {
  const latest = getLatestResearch(data.researchSeries);

  return [
    { label: "Abstract", value: clampProgress(latest.writing + 8) },
    { label: "Literature review", value: clampProgress(latest.literature) },
    { label: "Methodology", value: clampProgress(latest.experimentation) },
    { label: "Results", value: clampProgress(latest.writing - 4) },
    { label: "References", value: clampProgress(latest.literature + 4) },
  ];
}

function timelineIcon(item: ActivityFeedItem) {
  if (item.tone === "positive") {
    return CheckCircle2;
  }

  if (item.tone === "warning" || item.tone === "critical") {
    return Clock3;
  }

  return NotebookTabs;
}

export function StudentDashboardView({ data }: StudentDashboardViewProps) {
  const heading = greetingFromTitle(data.welcome.title);
  const currentWeek = getCurrentWeek(data.researchSeries);
  const projectTitle =
    data.welcome.project && data.welcome.project !== "Project pending"
      ? data.welcome.project
      : "Crop Disease Detection with CNN";
  const chartData = getChartData(data.researchSeries);
  const latestResearch = getLatestResearch(data.researchSeries);
  const submissionsNeedingRevision = data.submissions.filter(
    (submission) => submission.status === "Needs revision",
  ).length;
  const averageScore =
    data.scorecards.find((card) => card.title.toLowerCase().includes("performance"))
      ?.value ?? data.stats[2]?.value ?? "84";
  const roadmap =
    data.progressTrackers.length > 0
      ? data.progressTrackers
      : [
          {
            id: "fallback-1",
            phase: "Problem discovery",
            owner: "Research pod",
            progress: 100,
            note: "Initial problem framing completed.",
            status: "Completed" as const,
          },
          {
            id: "fallback-2",
            phase: "IEEE paper drafting",
            owner: "Paper pod",
            progress: 64,
            note: "Current week focus is methodology and experiment evidence.",
            status: "Active" as const,
          },
          {
            id: "fallback-3",
            phase: "Final demo package",
            owner: "Execution pod",
            progress: 24,
            note: "Future submission work is queued.",
            status: "Queued" as const,
          },
        ];

  return (
    <PageContainer
      title={heading}
      description={`Week ${currentWeek} of 8 · ${projectTitle}`}
      actions={
        <>
          <Button asChild variant="outline" className="h-11 px-5">
            <Link href="/student/research/problem-market">Explore problems</Link>
          </Button>
          <Button asChild className="h-11 px-5">
            <Link href="/student/execution/weekly-submissions">
              Continue submission
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {getMetrics(data).map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.title} className="min-h-[174px]">
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="mt-3 text-3xl font-bold tracking-normal text-foreground">
                      {metric.value}
                    </p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted text-foreground">
                    <Icon className="size-4" />
                  </span>
                </div>
                <Progress value={metric.progress} className="h-2 bg-[#f0f0f0]" />
                <p className="text-sm leading-6 text-muted-foreground">{metric.helper}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Weekly roadmap</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Milestone progress from project selection through final submission.
                </p>
              </div>
              <Badge variant="outline">Week {currentWeek}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-3">
              {roadmap.map((tracker) => (
                <div
                  key={tracker.id}
                  className={cn(
                    "rounded-xl border p-4 transition-colors",
                    statusTone(tracker.status),
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {tracker.phase}
                      </p>
                      <p className="text-xs text-muted-foreground">{tracker.owner}</p>
                    </div>
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full border",
                        tracker.status === "Completed"
                          ? "border-emerald-200 bg-white text-emerald-600"
                          : "border-border bg-white text-muted-foreground",
                      )}
                    >
                      {tracker.status === "Completed" ? (
                        <Check className="size-3.5" />
                      ) : (
                        <span className="size-2 rounded-full bg-current" />
                      )}
                    </span>
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{tracker.progress}%</span>
                    </div>
                    <Progress value={tracker.progress} className="h-2 bg-white/80" />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-white p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Completion velocity
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Weekly movement across research, build, and writing.
                  </p>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                  +{Math.max(4, Math.round(latestResearch.writing / 12))}% this week
                </span>
              </div>
              <ChartContainer className="h-[260px]">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="roadmapFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(15,23,42,0.08)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="week"
                    tickLine={false}
                    tick={{ fill: "#737373", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#737373", fontSize: 12 }}
                    width={32}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="progress"
                    fill="url(#roadmapFill)"
                    name="Progress"
                    stroke="#f97316"
                    strokeWidth={2.4}
                    type="monotone"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Faculty comments</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recent approval notes and revision requests.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data.feedback.length > 0 ? data.feedback : []).map((feedback, index) => {
              const status = commentStatus(index);

              return (
                <div key={feedback.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-9 border border-border">
                      <AvatarFallback className="bg-muted text-xs font-semibold">
                        {initials(feedback.faculty)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {feedback.faculty}
                        </p>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs font-medium",
                            commentStatusClass(status),
                          )}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {feedback.area} · {feedback.timestamp}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {feedback.note}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {data.feedback.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <p className="text-sm font-semibold text-foreground">
                  No faculty comments yet
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Feedback will appear here as soon as submissions are reviewed.
                </p>
              </div>
            ) : null}
            <Button asChild variant="outline" className="h-11 w-full">
              <Link href="/student/execution/weekly-submissions">
                View all submissions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">IEEE paper progress</CardTitle>
            <p className="text-sm text-muted-foreground">
              Section-level readiness for the publication package.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {progressRows(data).map((row) => (
              <div key={row.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{row.label}</span>
                  <span className="text-muted-foreground">{row.value}%</span>
                </div>
                <Progress value={row.value} className="h-2 bg-[#f0f0f0]" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submission calendar</CardTitle>
            <p className="text-sm text-muted-foreground">
              Weekly submission volume and review outcomes.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <ChartContainer className="h-[214px]">
              <BarChart data={chartData}>
                <CartesianGrid
                  stroke="rgba(15,23,42,0.08)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="week"
                  tickLine={false}
                  tick={{ fill: "#737373", fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltipContent />} cursor={{ fill: "#f5f5f5" }} />
                <Bar
                  dataKey="submitted"
                  fill="#0f766e"
                  maxBarSize={34}
                  name="Submissions"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["On time", `${Math.max(1, data.submissions.length - submissionsNeedingRevision)}`],
                ["Revisions", `${submissionsNeedingRevision}`],
                ["Streak", "4w"],
                ["Avg score", averageScore],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity timeline</CardTitle>
            <p className="text-sm text-muted-foreground">
              Compact view of recent academic execution signals.
            </p>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-5 before:absolute before:left-[17px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
              {data.activity.slice(0, 5).map((item) => {
                const Icon = timelineIcon(item);

                return (
                  <li key={item.id} className="relative flex gap-4">
                    <span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 border-b border-border pb-5 last:border-b-0 last:pb-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        {item.tag ? <Badge variant="outline">{item.tag}</Badge> : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.detail}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">{item.timestamp}</p>
                    </div>
                  </li>
                );
              })}
              {data.activity.length === 0 ? (
                <li className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                  Activity will appear once the team starts submitting work.
                </li>
              ) : null}
            </ol>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
