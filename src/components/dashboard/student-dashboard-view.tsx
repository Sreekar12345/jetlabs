// @ts-nocheck
"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
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
  if (data.length === 0) {
    return 1;
  }
  const latest = data.at(-1)?.week ?? "";
  const parsed = Number.parseInt(latest.replace(/[^\d]/g, ""), 10);

  if (Number.isNaN(parsed)) {
    return 1;
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
  return data.at(-1) ?? { week: "W1", literature: 0, experimentation: 0, writing: 0 };
}

function getChartData(data: StudentDashboardData["researchSeries"]): Array<{ week: string; progress: number; submitted: number }> {
  if (data.length === 0) {
    return [];
  }
  return data.map((point, index) => ({
    week: point.week || `W${index + 1}`,
    progress: Math.round((point.literature + point.experimentation + point.writing) / 3),
    submitted: Math.max(0, Math.round(point.experimentation / 12)),
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
      value: cadence?.value ?? "0 weeks",
      helper: cadence?.detail ?? "Weekly submissions are landing on schedule.",
      progress: cadence ? 100 : 0,
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
  const hasStarted = latest.writing > 0 || latest.literature > 0 || latest.experimentation > 0;

  return [
    { label: "Abstract", value: hasStarted ? clampProgress(latest.writing + 8) : 0 },
    { label: "Literature review", value: clampProgress(latest.literature) },
    { label: "Methodology", value: clampProgress(latest.experimentation) },
    { label: "Results", value: hasStarted ? clampProgress(latest.writing - 4) : 0 },
    { label: "References", value: hasStarted ? clampProgress(latest.literature + 4) : 0 },
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

function getDashboardWeeklyFocus(weekNum: number, projectTitle: string, domain: string, category: string) {
  const cleanTitle = projectTitle || "Capstone project";
  const cleanDomain = domain || "engineering";
  const cleanCategory = category || "technology";

  switch (weekNum) {
    case 1:
      return {
        title: "Week 1: Scope & Problem Validation",
        focus: `Frame the core problem statement for "${cleanTitle}".`,
        tasks: [
          `Audit existing solutions in the "${cleanDomain}" domain`,
          `Formulate a project scope validation memo`,
          `Scaffold Git repository and assign team roles`
        ],
      };
    case 2:
      return {
        title: "Week 2: Literature Survey & Baselines",
        focus: `Investigate prior work and establish performance benchmarks.`,
        tasks: [
          `Review 5+ academic publications in "${cleanDomain}"`,
          `Document competing frameworks and their limitations`,
          `Specify baseline performance criteria (e.g. latency)`
        ],
      };
    case 3:
      return {
        title: "Week 3: System Design & Schema Layout",
        focus: `Draft the technical system architecture and databases.`,
        tasks: [
          `Create visual component data-flow diagrams`,
          `Define database schemas and interface signatures`,
          `Outline API routing constraints for ${cleanCategory}`
        ],
      };
    case 4:
      return {
        title: "Week 4: Core MVP Prototype Setup",
        focus: `Initialize the codebase and build a functional skeleton.`,
        tasks: [
          `Establish core database/model connection`,
          `Code a vertical prototype slice of ${cleanCategory} logic`,
          `Verify basic telemetry logs from simulated sources`
        ],
      };
    case 5:
      return {
        title: "Week 5: Feature Expansion & Deployment",
        focus: `Extend application capabilities and deploy a preview.`,
        tasks: [
          `Build auxiliary controllers and API endpoints`,
          `Deploy a staging build to Vercel/cloud host`,
          `Perform integration checks across all systems`
        ],
      };
    case 6:
      return {
        title: "Week 6: Evaluation & Benchmarking",
        focus: `Conduct performance tests and compare against baselines.`,
        tasks: [
          `Execute system stress and throughput evaluations`,
          `Compare results directly against Week 2 baselines`,
          `Plot comparative charts demonstrating novelty gains`
        ],
      };
    case 7:
      return {
        title: "Week 7: IEEE Paper Drafting",
        focus: `Draft the formal research manuscript and BibTeX references.`,
        tasks: [
          `Write abstract, methodology, and results sections`,
          `Format figures and reference citations in IEEE style`,
          `Submit manuscript draft for mentor review`
        ],
      };
    case 8:
    default:
      return {
        title: "Week 8: Final Packaging & Rehearsal",
        focus: `Package deliverables and prepare for Viva defense.`,
        tasks: [
          `Clean codebase and publish install guides in README`,
          `Record a 3-minute product walk-through video`,
          `Practice defense questions on Viva Simulator`
        ],
      };
  }
}

export function StudentDashboardView({ data }: StudentDashboardViewProps) {
  const heading = greetingFromTitle(data.welcome.title);
  const currentWeek = getCurrentWeek(data.researchSeries);
  const projectTitle =
    data.welcome.project && data.welcome.project !== "Project pending"
      ? data.welcome.project
      : "No Active Project";
  const chartData = getChartData(data.researchSeries);
  const latestResearch = getLatestResearch(data.researchSeries);
  const submissionsNeedingRevision = data.submissions.filter(
    (submission) => submission.status === "Needs revision",
  ).length;
  const averageScore =
    data.scorecards.find((card) => card.title.toLowerCase().includes("performance"))
      ?.value ?? data.stats[2]?.value ?? "0";
  const roadmap = data.progressTrackers;

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
            {roadmap.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-muted/50 p-8 text-center flex flex-col items-center justify-center min-h-[140px] w-full col-span-3">
                <Compass className="size-8 text-slate-400 mb-2 animate-pulse" />
                <p className="text-sm font-semibold text-slate-800">No Active Project Roadmaps</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">Enroll in a capstone project statement to activate your weekly roadmap timeline.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-[1.6fr_1.4fr]">
                {/* Left Column: Milestone list */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Milestone Stages</p>
                  <div className="grid gap-3 md:grid-cols-1">
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
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{tracker.progress}%</span>
                          </div>
                          <Progress value={tracker.progress} className="h-2 bg-white/80" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Weekly Focus & Tasks Card */}
                {(() => {
                  const focus = getDashboardWeeklyFocus(
                    currentWeek,
                    projectTitle,
                    data.welcome.projectDomain || "",
                    data.welcome.projectCategory || ""
                  );
                  return (
                    <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/90 to-slate-900/95 p-5 text-white flex flex-col justify-between shadow-xl">
                      <div>
                        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 mb-4">
                          <div>
                            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Active Week Focus</p>
                            <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                              {focus.title}
                            </h3>
                          </div>
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            <Clock3 className="size-4" />
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-medium italic mb-4">
                          &ldquo;{focus.focus}&rdquo;
                        </p>

                        <div className="space-y-3">
                          <p className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Tasks for this week</p>
                          <div className="space-y-2.5">
                            {focus.tasks.map((task, idx) => (
                              <div key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-200">
                                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/20 text-indigo-300 font-bold text-[9px]">
                                  {idx + 1}
                                </span>
                                <span>{task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10">
                        <Button asChild className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 border-0">
                          <Link href="/student/execution/weekly-submissions">
                            Submit Proof of Work
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

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
                  +{latestResearch.writing > 0 ? Math.max(4, Math.round(latestResearch.writing / 12)) : 0}% this week
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
                ["On time", `${data.submissions.length - submissionsNeedingRevision}`],
                ["Revisions", `${submissionsNeedingRevision}`],
                ["Streak", data.submissions.length > 0 ? "4w" : "0w"],
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
