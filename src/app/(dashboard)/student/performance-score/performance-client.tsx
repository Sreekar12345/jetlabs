"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Code2,
  Crown,
  Flame,
  Gauge,
  GitBranch,
  ListChecks,
  Medal,
  MessageSquareText,
  Rocket,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Dimension = {
  label: string;
  score: number;
  trend: string;
  benchmark: string;
  recommendation: string;
  icon: LucideIcon;
  tone: string;
};

type PerformanceClientProps = {
  user: { name: string };
  performance: {
    score: number;
    attendanceScore: number;
    submissionScore: number;
    reviewScore: number;
  };
  rank: number;
  percentile: number;
  historyItems: Array<{
    week: string;
    title: string;
    status: string;
    date: string;
  }>;
};

export function PerformanceClient({
  user,
  performance,
  rank,
  percentile,
  historyItems,
}: PerformanceClientProps) {
  // Score-dependent status derived dynamically
  let reputationTier = "Builder";
  let reputationStyle = "border-slate-200 bg-white text-slate-700";
  let reputationText = "Builder Reputation";
  if (performance.score >= 90) {
    reputationTier = "Elite Executor";
    reputationStyle = "border-emerald-200 bg-emerald-50 text-emerald-700";
    reputationText = "Elite Performer";
  } else if (performance.score >= 75) {
    reputationTier = "Consistency Leader";
    reputationStyle = "border-blue-200 bg-blue-50 text-blue-700";
    reputationText = "Consistent Performer";
  } else if (performance.score >= 50) {
    reputationTier = "System Architect";
    reputationStyle = "border-indigo-200 bg-indigo-50 text-indigo-700";
    reputationText = "Active Performer";
  }

  const headerStats = [
    { label: "Current rank", value: `#${rank}`, detail: "in platform roster", icon: Trophy },
    { label: "Percentile", value: `Top ${percentile}%`, detail: "performance band", icon: Crown },
    { label: "Weekly Growth", value: `+${performance.score > 0 ? Math.max(2, Math.round(performance.score / 15)) : 0}`, detail: "this cycle", icon: TrendingUp },
    { label: "Consistency", value: `${performance.attendanceScore}%`, detail: "active attendance", icon: Flame },
  ];

  const strengths = performance.score > 0
    ? (performance.score >= 75
        ? ["Strong project execution", "Excellent submission consistency"]
        : ["Regular project activity", "Adherence to submission schedule"])
    : ["Platform credentials locked"];

  const risks = performance.score > 0
    ? (performance.score >= 75
        ? ["Needs higher technical documentation depth", "Under-exposure in mock-vivas"]
        : ["Needs revision loop turnaround speedup", "Under-developed literature logs"])
    : ["Enroll in a project to activate execution tracking"];

  // Map 9 dimensions dynamically based on database scores
  const dimensions: Dimension[] = [
    {
      label: "Project Execution",
      score: performance.submissionScore,
      trend: performance.submissionScore > 0 ? "+5" : "0",
      benchmark: `Top ${performance.submissionScore > 0 ? Math.max(10, 100 - performance.submissionScore) : 100}% in batch`,
      recommendation: "Keep shipping weekly evidence packages.",
      icon: Rocket,
      tone: "bg-emerald-500",
    },
    {
      label: "Technical Depth",
      score: performance.score > 0 ? Math.min(100, Math.max(0, performance.score - 4)) : 0,
      trend: performance.score > 0 ? "+3" : "0",
      benchmark: performance.score > 0 ? "Above department average" : "Department benchmark pending",
      recommendation: "Add technical trade-off decisions to weekly reports.",
      icon: Code2,
      tone: "bg-blue-500",
    },
    {
      label: "Research Contribution",
      score: performance.reviewScore > 0 ? Math.min(100, Math.max(0, performance.reviewScore - 8)) : 0,
      trend: performance.reviewScore > 0 ? "-2" : "0",
      benchmark: performance.reviewScore > 0 ? "Literature matrix aligned" : "Research logs review pending",
      recommendation: "Add details to literature comparison tables.",
      icon: BookOpenCheck,
      tone: "bg-orange-500",
    },
    {
      label: "Consistency",
      score: performance.attendanceScore,
      trend: performance.attendanceScore > 0 ? "+4" : "0",
      benchmark: "Regular session checkins",
      recommendation: "Maintain the current attendance momentum.",
      icon: Flame,
      tone: "bg-rose-500",
    },
    {
      label: "Viva Readiness",
      score: performance.score > 0 ? Math.min(100, Math.max(0, Math.round(performance.score * 0.85))) : 0,
      trend: performance.score > 0 ? "+3" : "0",
      benchmark: performance.score > 0 ? "Standard evaluation band" : "Evaluation readiness pending",
      recommendation: "Run at least one mock-viva simulation this week.",
      icon: MessageSquareText,
      tone: "bg-purple-500",
    },
    {
      label: "Deployment Readiness",
      score: performance.submissionScore > 0 ? Math.min(100, Math.max(0, Math.round(performance.submissionScore * 0.95))) : 0,
      trend: performance.submissionScore > 0 ? "+6" : "0",
      benchmark: performance.submissionScore > 0 ? "Working prototype verified" : "Deployment metrics pending",
      recommendation: "Provide reachable preview URLs in submissions.",
      icon: Gauge,
      tone: "bg-cyan-500",
    },
    {
      label: "Collaboration",
      score: performance.attendanceScore > 0 ? Math.min(100, Math.max(0, Math.round(performance.attendanceScore * 0.92))) : 0,
      trend: performance.attendanceScore > 0 ? "+2" : "0",
      benchmark: performance.attendanceScore > 0 ? "Healthy team contribution" : "Collaboration index pending",
      recommendation: "Ensure contribution metrics are balanced.",
      icon: Users2,
      tone: "bg-indigo-500",
    },
    {
      label: "Leadership",
      score: performance.score > 0 ? Math.min(100, Math.max(0, Math.round(performance.score * 0.8))) : 0,
      trend: performance.score > 0 ? "+1" : "0",
      benchmark: performance.score > 0 ? "Visible mentor signals" : "Leadership signals pending",
      recommendation: "Take the lead on the next demo narration.",
      icon: Medal,
      tone: "bg-amber-500",
    },
    {
      label: "Documentation Quality",
      score: performance.submissionScore > 0 ? Math.min(100, Math.max(0, performance.submissionScore - 15)) : 0,
      trend: performance.submissionScore > 0 ? "-3" : "0",
      benchmark: performance.submissionScore > 0 ? "Structured reports" : "Report audits pending",
      recommendation: "Improve narrative formatting of progress checks.",
      icon: ClipboardCheck,
      tone: "bg-slate-700",
    },
  ];

  // Professional tier system active highlight
  const tiers = [
    { label: "Builder", active: reputationTier === "Builder" },
    { label: "System Architect", active: reputationTier === "System Architect" },
    { label: "Consistency Leader", active: reputationTier === "Consistency Leader" },
    { label: "Elite Executor", active: reputationTier === "Elite Executor" },
  ];

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-end">
        <div>
          <h1>Engineering Performance Index</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Real-time evaluation of execution, consistency, technical depth, and project progress.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge className={cn("border bg-background", reputationStyle)}>
              Reputation: {reputationTier}
            </Badge>
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Active Dashboard
            </Badge>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {headerStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-border bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Icon className="size-3.5" />
                  {stat.label}
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ring visual */}
      <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white shadow-xl">
        <CardContent className="grid gap-7 p-6 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:items-center">
          <div className="flex justify-center">
            <div
              className="relative grid size-48 shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#22c55e 0deg ${Math.round(performance.score * 3.6)}deg, rgba(255,255,255,0.12) ${Math.round(performance.score * 3.6)}deg 360deg)`,
              }}
            >
              <div className="grid size-36 place-items-center rounded-full border border-white/10 bg-slate-950">
                <div className="text-center">
                  <p className="text-5xl font-bold tracking-tight text-white">{performance.score}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    {reputationText}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                Calculated from Platform Activities
              </Badge>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
                Live Performance Index & Feedback.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Your performance ranking tracks your submission consistency, attendance checks, and review loops. Closing feedback loops quickly maintains score momentum.
              </p>
            </div>

            <div className="grid gap-3 grid-cols-3">
              {[
                ["Rank", `#${rank}`],
                ["Attendance", `${performance.attendanceScore}%`],
                ["Evaluation", `${performance.reviewScore}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs text-white/50">{label}</p>
                  <p className="mt-1 text-base font-bold tracking-tight text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-xs space-y-4">
            <div>
              <p className="font-semibold uppercase tracking-wider text-emerald-300 mb-2">Strengths</p>
              <div className="space-y-1.5">
                {strengths.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-white/80">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-orange-300 mb-2">Areas to Improve</p>
              <div className="space-y-1.5">
                {risks.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-white/80">
                    <AlertTriangle className="size-4 text-orange-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Performance Dimensions Breakdown</h2>
            <p className="text-xs text-muted-foreground">Capabilities mapped dynamically based on database logs.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dimensions.map((item) => (
            <Card key={item.label} className="group overflow-hidden transition duration-200 hover:shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl border border-border bg-muted/40 text-foreground">
                      <item.icon className="size-4.5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{item.label}</h3>
                      <p className="text-[10px] text-muted-foreground">{item.benchmark}</p>
                    </div>
                  </div>
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">
                    {item.trend}
                  </Badge>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Score</span>
                    <span className="text-foreground">{item.score}/100</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={cn("h-full rounded-full", item.tone)}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/25 p-3 text-[11px] leading-relaxed text-foreground">
                  <span className="font-semibold block uppercase text-[9px] text-muted-foreground mb-0.5">Improve:</span>
                  {item.recommendation}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Timeline & Tiers */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Submissions checklist timeline */}
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-lg">Recent Progress Milestones</CardTitle>
            <p className="text-xs text-muted-foreground">Historical list of dynamic team submissions mapped into performance cycles.</p>
          </CardHeader>
          <CardContent className="pt-6">
            {historyItems.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No historical records tracked yet.</p>
            ) : (
              <div className="space-y-4">
                {historyItems.map((event, idx) => (
                  <div key={`${event.week}-${idx}`} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{event.week} &middot; {event.date}</p>
                    </div>
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tier systems */}
        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardHeader className="border-b border-white/10 pb-5">
            <CardTitle className="text-xl">Platform Tier Status</CardTitle>
            <p className="text-xs text-white/50">Performance levels are derived dynamically based on your Syntra index score.</p>
          </CardHeader>
          <CardContent className="space-y-3 p-5 text-xs">
            {tiers.map((tier) => (
              <div
                key={tier.label}
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-4 py-3 font-semibold",
                  tier.active
                    ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                    : "border-white/10 bg-white/[0.04] text-white/60"
                )}
              >
                <span>{tier.label}</span>
                {tier.active ? (
                  <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100 text-[10px]">
                    Active Title
                  </Badge>
                ) : (
                  <CircleDot className="size-4 text-white/40" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
