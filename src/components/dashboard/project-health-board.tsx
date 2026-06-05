"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  BookOpenCheck,
  Bot,
  CalendarClock,
  CheckCircle2,
  Cloud,
  Code2,
  FileCheck2,
  Gauge,
  GitBranch,
  HeartPulse,
  LineChart,
  RadioTower,
  Rocket,
  ShieldAlert,
  Sparkles,
  Target,
  TimerReset,
  TrendingDown,
  TrendingUp,
  Users2,
  Workflow,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ProjectHealthData, ProjectHealthTeam } from "@/types/aoip";

type Tone = "healthy" | "stable" | "attention" | "risk" | "critical" | "blocked" | "insight";
type Mode =
  | "delivery"
  | "research"
  | "technical"
  | "escalation"
  | "viva"
  | "ieee"
  | "sprint";

type ProjectHealthBoardProps = {
  data: ProjectHealthData;
};

const modes: Array<{ id: Mode; label: string; icon: LucideIcon; detail: string }> = [
  { id: "delivery", label: "Delivery", icon: RadioTower, detail: "On-time risk and completion confidence" },
  { id: "research", label: "Research", icon: BookOpenCheck, detail: "Paper velocity and research blockage" },
  { id: "technical", label: "Technical", icon: Code2, detail: "Build evidence and demo stability" },
  { id: "escalation", label: "Escalation", icon: ShieldAlert, detail: "Critical intervention priority" },
  { id: "viva", label: "Viva", icon: FileCheck2, detail: "Defense readiness and proof quality" },
  { id: "ieee", label: "IEEE", icon: GitBranch, detail: "Publication maturity and review flow" },
  { id: "sprint", label: "Sprint", icon: Workflow, detail: "Weekly discipline and submission cadence" },
];

const interventionActions = [
  "Assign mentor sync",
  "Trigger escalation",
  "Request emergency review",
  "Recommend technical support",
  "Push revision checklist",
  "Freeze approval",
  "Schedule viva checkpoint",
];

function riskTone(riskLayer: ProjectHealthTeam["riskLayer"]): Tone {
  if (riskLayer === "Healthy") {
    return "healthy";
  }

  if (riskLayer === "Stable") {
    return "stable";
  }

  if (riskLayer === "Slipping" || riskLayer === "Mentor Dependent") {
    return "attention";
  }

  if (riskLayer === "Research Blocked" || riskLayer === "Fake Progress") {
    return "blocked";
  }

  if (riskLayer === "At Risk") {
    return "risk";
  }

  return "critical";
}

function toneStyles(tone: Tone) {
  if (tone === "healthy") {
    return {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      soft: "border-emerald-200 bg-emerald-50 text-emerald-700",
      text: "text-emerald-700",
      fill: "bg-emerald-500",
      ring: "#10b981",
      dot: "bg-emerald-500",
    };
  }

  if (tone === "stable") {
    return {
      border: "border-sky-200",
      bg: "bg-sky-50",
      soft: "border-sky-200 bg-sky-50 text-sky-700",
      text: "text-sky-700",
      fill: "bg-sky-500",
      ring: "#0ea5e9",
      dot: "bg-sky-500",
    };
  }

  if (tone === "attention") {
    return {
      border: "border-amber-200",
      bg: "bg-amber-50",
      soft: "border-amber-200 bg-amber-50 text-amber-700",
      text: "text-amber-700",
      fill: "bg-amber-500",
      ring: "#f59e0b",
      dot: "bg-amber-500",
    };
  }

  if (tone === "blocked") {
    return {
      border: "border-violet-200",
      bg: "bg-violet-50",
      soft: "border-violet-200 bg-violet-50 text-violet-700",
      text: "text-violet-700",
      fill: "bg-violet-500",
      ring: "#8b5cf6",
      dot: "bg-violet-500",
    };
  }

  if (tone === "risk") {
    return {
      border: "border-orange-200",
      bg: "bg-orange-50",
      soft: "border-orange-200 bg-orange-50 text-orange-700",
      text: "text-orange-700",
      fill: "bg-orange-500",
      ring: "#f97316",
      dot: "bg-orange-500",
    };
  }

  if (tone === "critical") {
    return {
      border: "border-red-200",
      bg: "bg-red-50",
      soft: "border-red-200 bg-red-50 text-red-700",
      text: "text-red-700",
      fill: "bg-red-500",
      ring: "#ef4444",
      dot: "bg-red-500",
    };
  }

  return {
    border: "border-blue-200",
    bg: "bg-blue-50",
    soft: "border-blue-200 bg-blue-50 text-blue-700",
    text: "text-blue-700",
    fill: "bg-blue-500",
    ring: "#3b82f6",
    dot: "bg-blue-500",
  };
}

function compactValue(value: number) {
  return `${Math.max(0, Math.min(100, value))}%`;
}

function modeScore(team: ProjectHealthTeam, mode: Mode) {
  if (mode === "research" || mode === "ieee") {
    return 100 - team.paperCompletionConfidence + team.priorityScore * 0.45;
  }

  if (mode === "technical") {
    return 100 - team.technicalExecutionConfidence + team.backlogItems * 4;
  }

  if (mode === "escalation") {
    return team.priorityScore + (team.interventionUrgency === "Immediate" ? 30 : 0);
  }

  if (mode === "viva") {
    return 100 - team.vivaReadinessConfidence + team.missedSubmissions * 8;
  }

  if (mode === "sprint") {
    return team.missedSubmissions * 16 + team.inactiveDays * 3 + team.priorityScore * 0.5;
  }

  return team.priorityScore + (100 - team.completionConfidence) * 0.4;
}

function SignalMeter({
  label,
  value,
  tone,
  detail,
}: {
  label: string;
  value: number;
  tone: Tone;
  detail?: string;
}) {
  const styles = toneStyles(tone);

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="truncate text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{compactValue(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={cn("h-full rounded-full", styles.fill)} style={{ width: compactValue(value) }} />
      </div>
      {detail ? <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

function ScoreRing({ score, tone }: { score: number; tone: Tone }) {
  const styles = toneStyles(tone);

  return (
    <div
      className="grid size-24 shrink-0 place-items-center rounded-full p-2"
      style={{
        background: `conic-gradient(${styles.ring} ${score * 3.6}deg, rgba(15, 23, 42, 0.08) 0deg)`,
      }}
    >
      <div className="grid size-full place-items-center rounded-full bg-white text-center">
        <div>
          <p className="text-2xl font-semibold text-foreground">{score}</p>
          <p className="text-[10px] font-medium uppercase text-muted-foreground">health</p>
        </div>
      </div>
    </div>
  );
}

function TimelineStrip({ team, tone }: { team: ProjectHealthTeam; tone: Tone }) {
  const styles = toneStyles(tone);
  const rows: Array<{
    key: keyof ProjectHealthTeam["executionTimeline"][number];
    label: string;
  }> = [
    { key: "sprintReliability", label: "Sprint history" },
    { key: "submissionReliability", label: "Submissions" },
    { key: "reviewTurnaround", label: "Review turn" },
    { key: "paperVelocity", label: "Paper velocity" },
    { key: "deploymentStability", label: "Deployment" },
  ];

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3">
          <span className="text-xs text-muted-foreground">{row.label}</span>
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, team.executionTimeline.length)}, minmax(0, 1fr))`,
            }}
          >
            {team.executionTimeline.map((point) => {
              const value = Number(point[row.key]);

              return (
                <span
                  key={`${team.id}-${row.label}-${point.label}`}
                  className={cn("h-5 rounded-sm border border-white", value >= 72 ? styles.fill : value >= 48 ? "bg-slate-300" : "bg-slate-200")}
                  title={`${point.label}: ${value}%`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertList({ teams }: { teams: ProjectHealthTeam[] }) {
  const alertTeams = teams.filter(
    (team) => team.interventionUrgency === "Immediate" || team.interventionUrgency === "High",
  );

  return (
    <Card className="border-red-200">
      <CardHeader className="border-b border-border pb-5">
        <Badge className="border-red-200 bg-red-50 text-red-700">
          <BellRing className="size-3" />
          Critical alerts
        </Badge>
        <CardTitle className="mt-3 text-xl">Intervention queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {(alertTeams.length > 0 ? alertTeams : teams.slice(0, 3)).map((team) => {
          const styles = toneStyles(riskTone(team.riskLayer));

          return (
            <div key={`alert-${team.id}`} className={cn("rounded-xl border p-3", styles.border, styles.bg)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{team.team}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{team.detectedSignals[0]}</p>
                </div>
                <Badge className={styles.soft}>{team.interventionUrgency}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ProjectExecutionCard({ team }: { team: ProjectHealthTeam }) {
  const tone = riskTone(team.riskLayer);
  const styles = toneStyles(tone);
  const forecast = [
    { label: "On-time completion", value: team.completionConfidence, icon: CalendarClock },
    { label: "Paper completion", value: team.paperCompletionConfidence, icon: BookOpenCheck },
    { label: "Viva readiness", value: team.vivaReadinessConfidence, icon: FileCheck2 },
    { label: "Technical execution", value: team.technicalExecutionConfidence, icon: Code2 },
  ];

  return (
    <Card className={cn("overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_52px_rgba(15,23,42,0.08)]", styles.border)}>
      <CardContent className="p-0">
        <div className="grid gap-0 xl:grid-cols-[210px_minmax(0,1fr)_320px]">
          <div className={cn("border-b border-border p-5 xl:border-b-0 xl:border-r", styles.bg)}>
            <ScoreRing score={team.healthScore} tone={tone} />
            <div className="mt-5 space-y-3">
              <Badge className={styles.soft}>{team.riskLayer}</Badge>
              <div>
                <p className="text-sm font-semibold text-foreground">{team.trend}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{team.momentum}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {team.contributionHeatmap.map((value, index) => (
                  <span
                    key={`${team.id}-heat-${index}`}
                    className={cn(
                      "h-8 rounded-md border border-white",
                      value >= 5 ? styles.fill : value >= 3 ? "bg-slate-300" : "bg-slate-200",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-5 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-white">{team.batch}</Badge>
                  <Badge variant="outline" className="bg-white">{team.sprintStatus}</Badge>
                  <Badge className={styles.soft}>{team.aiLabel}</Badge>
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-foreground">{team.team}</h2>
                <p className="mt-1 text-sm font-medium text-foreground">{team.project}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{team.problemStatement}</p>
              </div>
              <div className="shrink-0 rounded-xl border border-border bg-muted/25 px-3 py-2">
                <p className="text-xs text-muted-foreground">Current milestone</p>
                <p className="mt-1 max-w-[260px] text-sm font-semibold text-foreground">{team.currentMilestone}</p>
                <p className="mt-1 text-xs text-muted-foreground">{team.deadlineLabel}</p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-white p-4">
                <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">AI detected signals</p>
                <div className="space-y-2">
                  {team.detectedSignals.map((signal) => (
                    <div key={signal} className="flex gap-2 text-sm leading-6 text-foreground">
                      <span className={cn("mt-2 size-1.5 shrink-0 rounded-full", styles.dot)} />
                      <span>{signal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-4">
                <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Execution timeline</p>
                <TimelineStrip team={team} tone={tone} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {team.qualitySignals.slice(0, 6).map((signal) => (
                <div key={`${team.id}-${signal.label}`} className="rounded-xl border border-border bg-muted/20 p-3">
                  <SignalMeter label={signal.label} value={signal.value} tone={tone} detail={signal.detail} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-border bg-slate-50 p-5 xl:border-l xl:border-t-0">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Delivery risk state</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{team.deliveryRiskState}</p>
              <p className="mt-1 text-sm text-muted-foreground">Mentor load: {team.mentorLoad}</p>
            </div>

            <div className="grid gap-3">
              {forecast.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="rounded-xl border border-border bg-white p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Icon className="size-3.5" />
                        {item.label}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{item.value}%</span>
                    </div>
                    <SignalMeter label="" value={item.value} tone={tone} />
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Mentor intervention</p>
                <Badge className={styles.soft}>{team.interventionUrgency}</Badge>
              </div>
              <div className="mt-3 grid gap-2">
                {interventionActions.slice(0, team.interventionUrgency === "Immediate" ? 5 : 3).map((action) => (
                  <Button key={`${team.id}-${action}`} variant="outline" size="sm" className="justify-between rounded-lg bg-white">
                    {action}
                    <ArrowUpRight className="size-3.5" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PortfolioPulse({ data, teams }: { data: ProjectHealthData; teams: ProjectHealthTeam[] }) {
  const blockedCount = teams.filter((team) =>
    ["Ghost Team", "Fake Progress", "Research Blocked", "Critical"].includes(team.riskLayer),
  ).length;

  return (
    <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
      <CardContent className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-white/10 bg-white/5 text-white/70">
              <Bot className="size-3" />
              AI execution pulse
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/70">
              Live priority sorting
            </Badge>
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-white">Portfolio execution is being monitored as active delivery.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">{data.aiSummary}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <HeartPulse className="size-4 text-emerald-200" />
              <p className="mt-3 text-3xl font-semibold text-white">{data.executionPulse.score}</p>
              <p className="mt-1 text-xs text-white/55">Overall pulse</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <ShieldAlert className="size-4 text-red-200" />
              <p className="mt-3 text-3xl font-semibold text-white">{blockedCount}</p>
              <p className="mt-1 text-xs text-white/55">Unsafe patterns</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <TrendingUp className="size-4 text-sky-200" />
              <p className="mt-3 text-3xl font-semibold text-white">
                {teams.filter((team) => team.trend === "Improving rapidly" || team.trend === "Recovering after revision").length}
              </p>
              <p className="mt-1 text-xs text-white/55">Recovering teams</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <Users2 className="size-4 text-amber-200" />
              <p className="mt-3 text-3xl font-semibold text-white">
                {teams.filter((team) => team.mentorLoad === "High").length}
              </p>
              <p className="mt-1 text-xs text-white/55">High mentor load</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-semibold text-white">Active delivery state</p>
          <p className="mt-2 text-sm leading-6 text-white/60">{data.executionPulse.summary}</p>
          <div className="mt-5 space-y-3">
            {data.riskDistribution.filter((item) => item.count > 0).map((item) => {
              const styles = toneStyles(riskTone(item.label));

              return (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-white/72">
                    <span className={cn("size-2 rounded-full", styles.dot)} />
                    {item.label}
                  </span>
                  <span className="font-semibold text-white">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntelligencePanel({ teams }: { teams: ProjectHealthTeam[] }) {
  const anomalies = teams
    .filter((team) => ["Ghost Team", "Fake Progress", "Research Blocked", "Mentor Dependent"].includes(team.riskLayer))
    .slice(0, 4);
  const dependencyTeams = teams
    .filter((team) => team.detectedSignals.some((signal) => signal.toLowerCase().includes("dependency")))
    .slice(0, 4);
  const researchTeams = [...teams].sort((left, right) => left.paperCompletionConfidence - right.paperCompletionConfidence).slice(0, 4);

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <Card>
        <CardHeader className="border-b border-border pb-5">
          <Badge className="border-violet-200 bg-violet-50 text-violet-700">
            <Sparkles className="size-3" />
            Execution anomalies
          </Badge>
          <CardTitle className="mt-3 text-xl">Pattern detection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          {(anomalies.length > 0 ? anomalies : teams.slice(0, 3)).map((team) => (
            <div key={`anomaly-${team.id}`} className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{team.team}</p>
                <Badge className={toneStyles(riskTone(team.riskLayer)).soft}>{team.riskLayer}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{team.detectedSignals[0]}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border pb-5">
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            <Users2 className="size-3" />
            Team dependency
          </Badge>
          <CardTitle className="mt-3 text-xl">Leadership concentration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          {(dependencyTeams.length > 0 ? dependencyTeams : teams.slice(0, 3)).map((team) => (
            <div key={`dependency-${team.id}`} className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{team.team}</p>
                <span className="text-xs font-semibold text-foreground">{team.mentorLoad} load</span>
              </div>
              <SignalMeter label="Participation equality" value={team.qualitySignals.find((item) => item.label === "Participation equality")?.value ?? 0} tone={riskTone(team.riskLayer)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border pb-5">
          <Badge className="border-sky-200 bg-sky-50 text-sky-700">
            <BookOpenCheck className="size-3" />
            Research velocity
          </Badge>
          <CardTitle className="mt-3 text-xl">Paper and novelty motion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          {researchTeams.map((team) => (
            <div key={`research-${team.id}`} className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{team.team}</p>
                <span className="text-xs font-semibold text-foreground">{team.paperCompletionConfidence}%</span>
              </div>
              <SignalMeter label="Paper completion confidence" value={team.paperCompletionConfidence} tone={riskTone(team.riskLayer)} detail={team.currentMilestone} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ForecastingPanel({ teams }: { teams: ProjectHealthTeam[] }) {
  const top = teams.slice(0, 5);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <Card>
        <CardHeader className="border-b border-border pb-5">
          <Badge className="border-blue-200 bg-blue-50 text-blue-700">
            <LineChart className="size-3" />
            Delivery forecasting
          </Badge>
          <CardTitle className="mt-3 text-xl">Completion confidence by risk priority</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {top.map((team) => {
            const tone = riskTone(team.riskLayer);

            return (
              <div key={`forecast-${team.id}`} className="grid gap-3 rounded-xl border border-border bg-white p-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                <div>
                  <p className="font-semibold text-foreground">{team.team}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{team.deliveryRiskState}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <SignalMeter label="On-time" value={team.completionConfidence} tone={tone} />
                  <SignalMeter label="Paper" value={team.paperCompletionConfidence} tone={tone} />
                  <SignalMeter label="Viva" value={team.vivaReadinessConfidence} tone={tone} />
                  <SignalMeter label="Technical" value={team.technicalExecutionConfidence} tone={tone} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-slate-900 bg-slate-950 text-white">
        <CardContent className="space-y-5 p-5">
          <Badge className="border-white/10 bg-white/5 text-white/70">
            <Target className="size-3" />
            Intervention recommendations
          </Badge>
          <h2 className="text-2xl font-semibold text-white">Next faculty actions</h2>
          <div className="grid gap-3">
            {top.slice(0, 4).map((team) => (
              <div key={`recommend-${team.id}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{team.team}</p>
                  <span className="text-xs text-white/50">{team.interventionUrgency}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/60">{team.detectedSignals[0]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProjectHealthBoard({ data }: ProjectHealthBoardProps) {
  const [mode, setMode] = useState<Mode>("delivery");
  const prioritizedTeams = useMemo(
    () => [...data.teams].sort((left, right) => modeScore(right, mode) - modeScore(left, mode)),
    [data.teams, mode],
  );
  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];
  const ActiveModeIcon = activeMode.icon;

  return (
    <PageContainer
      eyebrow="Faculty monitoring"
      title="Project Health"
      description="A live engineering delivery monitoring system for spotting silent failure, recoverable delay, fake progress, and intervention urgency across project teams."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/faculty/review/review-queue">Open review queue</Link>
          </Button>
          <Button>
            Sync intervention board
            <ArrowUpRight className="size-4" />
          </Button>
        </>
      }
    >
      <PortfolioPulse data={data} teams={data.teams} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
              <div>
                <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                  <ActiveModeIcon className="size-3" />
                  Faculty action mode
                </Badge>
                <CardTitle className="mt-3 text-xl">{activeMode.label} monitoring</CardTitle>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeMode.detail}. Cards are re-prioritized automatically for this operating lens.</p>
              </div>
              <Tabs defaultValue="delivery" value={mode} onValueChange={(value) => setMode(value as Mode)} className="min-w-0">
                <TabsList className="flex max-w-full flex-wrap rounded-xl bg-muted/70">
                  {modes.map((item) => {
                    const Icon = item.icon;

                    return (
                      <TabsTrigger key={item.id} value={item.id} className="rounded-lg px-3 py-2 text-xs">
                        <Icon className="size-3.5" />
                        {item.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {prioritizedTeams.length > 0 ? (
              prioritizedTeams.map((team) => <ProjectExecutionCard key={team.id} team={team} />)
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="font-semibold text-foreground">No monitored teams found.</p>
                <p className="mt-2 text-sm text-muted-foreground">Project health data will appear once teams start shipping evidence.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <AlertList teams={prioritizedTeams} />
          <Card>
            <CardHeader className="border-b border-border pb-5">
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="size-3" />
                Active delivery state
              </Badge>
              <CardTitle className="mt-3 text-xl">{data.executionPulse.state}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {data.stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                    <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <IntelligencePanel teams={prioritizedTeams} />

      <ForecastingPanel teams={prioritizedTeams} />

      <Card>
        <CardHeader className="border-b border-border pb-5">
          <Badge className="border-slate-200 bg-slate-50 text-slate-700">
            <Gauge className="size-3" />
            Trend intelligence
          </Badge>
          <CardTitle className="mt-3 text-xl">Portfolio health movement</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-4">
          {[
            { label: "Improving rapidly", value: prioritizedTeams.filter((team) => team.trend === "Improving rapidly").length, icon: TrendingUp, tone: "healthy" as Tone },
            { label: "Declining slowly", value: prioritizedTeams.filter((team) => team.trend === "Declining slowly").length, icon: TrendingDown, tone: "risk" as Tone },
            { label: "Stagnating", value: prioritizedTeams.filter((team) => team.trend === "Stagnating").length, icon: TimerReset, tone: "blocked" as Tone },
            { label: "Consistent execution", value: prioritizedTeams.filter((team) => team.trend === "Consistent execution").length, icon: Rocket, tone: "stable" as Tone },
          ].map((item) => {
            const Icon = item.icon;
            const styles = toneStyles(item.tone);

            return (
              <div key={item.label} className={cn("rounded-xl border p-4", styles.border, styles.bg)}>
                <Icon className={cn("size-5", styles.text)} />
                <p className="mt-3 text-3xl font-semibold text-foreground">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-cyan-200 bg-cyan-50 text-cyan-700">
              <Cloud className="size-3" />
              Deployment intelligence
            </Badge>
            <CardTitle className="mt-3 text-xl">Stability versus backlog pressure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {prioritizedTeams.slice(0, 5).map((team) => {
              const stability = team.qualitySignals.find((signal) => signal.label === "Deployment uptime")?.value ?? team.technicalExecutionConfidence;

              return (
                <div key={`deployment-${team.id}`} className="grid gap-3 rounded-xl border border-border bg-white p-4 sm:grid-cols-[180px_minmax(0,1fr)_100px] sm:items-center">
                  <div>
                    <p className="font-semibold text-foreground">{team.team}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{team.backlogItems} open backlog items</p>
                  </div>
                  <SignalMeter label="Deployment stability" value={stability} tone={riskTone(team.riskLayer)} />
                  <Badge className={toneStyles(riskTone(team.riskLayer)).soft}>{team.riskLayer}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-orange-200 bg-orange-50 text-orange-700">
              <AlertTriangle className="size-3" />
              Escalation likelihood
            </Badge>
            <CardTitle className="mt-3 text-xl">Who needs faculty time first</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {prioritizedTeams.slice(0, 5).map((team) => (
              <div key={`escalation-${team.id}`} className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{team.team}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{team.mentor} - {team.deadlineLabel}</p>
                  </div>
                  <span className="text-2xl font-semibold text-foreground">{team.priorityScore}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{team.detectedSignals[0]}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
