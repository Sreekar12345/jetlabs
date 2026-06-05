"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Brain,
  BriefcaseBusiness,
  ClipboardCheck,
  Code2,
  FileText,
  GitCommitHorizontal,
  GitPullRequest,
  Handshake,
  LineChart,
  RadioTower,
  Scale,
  ShieldAlert,
  Sparkles,
  Target,
  UserCheck,
  Users2,
  Workflow,
  Zap,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  ExecutionOwnershipMember,
  ExecutionOwnershipTeam,
  TeamContributionData,
} from "@/types/aoip";

type Tone = "healthy" | "stable" | "attention" | "risk" | "critical" | "insight";
type Mode = "ownership" | "research" | "technical" | "imbalance" | "sprint" | "trust";

const modes: Array<{ id: Mode; label: string; icon: LucideIcon; detail: string }> = [
  { id: "ownership", label: "Ownership", icon: Scale, detail: "Responsibility spread and dependency risk" },
  { id: "research", label: "Research", icon: Brain, detail: "Paper, literature, and novelty ownership" },
  { id: "technical", label: "Technical", icon: Code2, detail: "Implementation, deployment, and commit evidence" },
  { id: "imbalance", label: "Imbalance", icon: ShieldAlert, detail: "Free-rider, overload, and collapse signals" },
  { id: "sprint", label: "Sprint", icon: Workflow, detail: "Weekly responsibility movement" },
  { id: "trust", label: "Trust", icon: BadgeCheck, detail: "Validated execution evidence" },
];

const mentorActions = [
  "Rebalance workload",
  "Flag free rider",
  "Assign mentorship",
  "Trigger peer review",
  "Require sync meeting",
  "Escalate imbalance",
  "Force responsibility redistribution",
];

function teamTone(team: ExecutionOwnershipTeam): Tone {
  if (team.riskState === "Healthy") {
    return "healthy";
  }

  if (team.riskState === "Watch") {
    return "attention";
  }

  if (team.riskState === "Imbalanced") {
    return "risk";
  }

  return "critical";
}

function memberTone(member: ExecutionOwnershipMember): Tone {
  if (member.riskState === "Low") {
    return "healthy";
  }

  if (member.riskState === "Watch") {
    return "attention";
  }

  if (member.riskState === "High") {
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
      dot: "bg-amber-500",
    };
  }

  if (tone === "risk") {
    return {
      border: "border-orange-200",
      bg: "bg-orange-50",
      soft: "border-orange-200 bg-orange-50 text-orange-700",
      text: "text-orange-700",
      fill: "bg-orange-500",
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
      dot: "bg-red-500",
    };
  }

  return {
    border: "border-blue-200",
    bg: "bg-blue-50",
    soft: "border-blue-200 bg-blue-50 text-blue-700",
    text: "text-blue-700",
    fill: "bg-blue-500",
    dot: "bg-blue-500",
  };
}

function modeScore(team: ExecutionOwnershipTeam, mode: Mode) {
  if (mode === "research") {
    return 100 - average(team.members.map((member) => member.researchContribution)) + team.priorityScore * 0.4;
  }

  if (mode === "technical") {
    return team.dependencyScore + (100 - average(team.members.map((member) => member.technicalContribution))) * 0.4;
  }

  if (mode === "imbalance") {
    return team.priorityScore + team.dependencyScore;
  }

  if (mode === "sprint") {
    return 100 - average(team.members.map((member) => member.sprintParticipation)) + team.priorityScore * 0.45;
  }

  if (mode === "trust") {
    return 100 - average(
      team.members.map((member) => average(member.trustSignals.map((signal) => signal.value))),
    );
  }

  return team.priorityScore + team.dependencyScore * 0.5;
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function Meter({
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
        <span className="font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={cn("h-full rounded-full", styles.fill)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      {detail ? <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

function TrendDots({ values, tone }: { values: number[]; tone: Tone }) {
  const styles = toneStyles(tone);

  return (
    <div className="grid grid-cols-6 gap-1">
      {values.slice(-6).map((value, index) => (
        <span
          key={`${value}-${index}`}
          className={cn("h-7 rounded-sm border border-white", value >= 72 ? styles.fill : value >= 48 ? "bg-slate-300" : "bg-slate-200")}
          title={`${value}%`}
        />
      ))}
    </div>
  );
}

function TeamQueue({
  teams,
  selectedTeamId,
  onSelectTeam,
}: {
  teams: ExecutionOwnershipTeam[];
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <Badge className="border-slate-200 bg-slate-50 text-slate-700">
          <RadioTower className="size-3" />
          Operational priority
        </Badge>
        <CardTitle className="mt-3 text-xl">Teams sorted by ownership risk</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {teams.map((team) => {
          const styles = toneStyles(teamTone(team));
          const selected = team.id === selectedTeamId;

          return (
            <button
              key={team.id}
              type="button"
              onClick={() => onSelectTeam(team.id)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]",
                selected ? cn(styles.border, styles.bg) : "border-border bg-white",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{team.team}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{team.project}</p>
                </div>
                <Badge className={styles.soft}>{team.riskState}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Balance</p>
                  <p className="text-sm font-semibold text-foreground">{team.balanceScore}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Dependency</p>
                  <p className="text-sm font-semibold text-foreground">{team.dependencyScore}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Priority</p>
                  <p className="text-sm font-semibold text-foreground">{team.priorityScore}</p>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function MemberExecutionCard({ member }: { member: ExecutionOwnershipMember }) {
  const tone = memberTone(member);
  const styles = toneStyles(tone);
  const metrics = [
    { label: "Ownership", value: member.ownership, icon: BriefcaseBusiness },
    { label: "Technical", value: member.technicalContribution, icon: Code2 },
    { label: "Research", value: member.researchContribution, icon: Brain },
    { label: "Sprint", value: member.sprintParticipation, icon: Workflow },
    { label: "Documentation", value: member.documentationOwnership, icon: FileText },
    { label: "Reliability", value: member.reliability, icon: UserCheck },
  ];

  return (
    <Card className={cn("overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(15,23,42,0.08)]", styles.border)}>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={styles.soft}>{member.aiLabel}</Badge>
              <Badge variant="outline" className="bg-white">{member.riskState}</Badge>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-foreground">{member.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{member.role} - active {member.lastActiveLabel}</p>
          </div>
          <div className={cn("grid size-16 shrink-0 place-items-center rounded-xl border text-2xl font-semibold", styles.soft)}>
            {member.ownership}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div key={metric.label} className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="size-3.5" />
                    {metric.label}
                  </span>
                  <span className="text-xs font-semibold text-foreground">{metric.value}%</span>
                </div>
                <Meter label="" value={metric.value} tone={tone} />
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">AI contribution insight</p>
          <div className="space-y-2">
            {member.insights.map((insight) => (
              <div key={insight} className="flex gap-2 text-sm leading-6 text-foreground">
                <span className={cn("mt-2 size-1.5 shrink-0 rounded-full", styles.dot)} />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Workload anomalies</p>
            <div className="space-y-2">
              {member.anomalies.map((anomaly) => (
                <p key={anomaly} className="text-xs leading-5 text-muted-foreground">{anomaly}</p>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Weekly trend</p>
            <TrendDots values={member.weeklyTrend} tone={tone} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkloadDistribution({ team }: { team: ExecutionOwnershipTeam }) {
  const colors = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-violet-500", "bg-red-500", "bg-slate-500"];
  const areas = team.members[0]?.ownershipAreas.map((area) => area.label) ?? [];

  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <Badge className="border-blue-200 bg-blue-50 text-blue-700">
          <BarChart3 className="size-3" />
          Workload distribution
        </Badge>
        <CardTitle className="mt-3 text-xl">Ownership split across execution areas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {team.members.map((member, index) => (
            <Badge key={member.id} variant="outline" className="bg-white">
              <span className={cn("size-2 rounded-full", colors[index % colors.length])} />
              {member.name}
            </Badge>
          ))}
        </div>
        {areas.map((area) => {
          const values = team.members.map((member) => member.ownershipAreas.find((item) => item.label === area)?.value ?? 0);
          const total = Math.max(1, values.reduce((sum, value) => sum + value, 0));

          return (
            <div key={area} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{area}</p>
                <p className="text-xs text-muted-foreground">{Math.round(total / team.members.length)} avg</p>
              </div>
              <div className="flex h-8 overflow-hidden rounded-lg border border-border bg-slate-100">
                {values.map((value, index) => (
                  <span
                    key={`${area}-${team.members[index]?.id}`}
                    className={cn("h-full", colors[index % colors.length])}
                    style={{ width: `${(value / total) * 100}%` }}
                    title={`${team.members[index]?.name}: ${value}%`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TrustSignals({ team }: { team: ExecutionOwnershipTeam }) {
  const signals = team.members.flatMap((member) =>
    member.trustSignals.map((signal) => ({
      ...signal,
      member: member.name,
      tone: memberTone(member),
    })),
  );

  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
          <GitPullRequest className="size-3" />
          Contribution trust signals
        </Badge>
        <CardTitle className="mt-3 text-xl">Evidence validation surface</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
        {signals.slice(0, 12).map((signal) => (
          <div key={`${signal.member}-${signal.label}`} className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{signal.label}</p>
              <span className="text-xs text-muted-foreground">{signal.member}</span>
            </div>
            <Meter label="" value={signal.value} tone={signal.tone} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DynamicsPanel({ team }: { team: ExecutionOwnershipTeam }) {
  const styles = toneStyles(teamTone(team));

  return (
    <Card className={styles.border}>
      <CardHeader className="border-b border-border pb-5">
        <Badge className={styles.soft}>
          <Sparkles className="size-3" />
          AI team diagnosis
        </Badge>
        <CardTitle className="mt-3 text-xl">{team.collaborationHealth}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <p className="text-sm leading-7 text-muted-foreground">{team.aiDiagnosis}</p>
        <div className="grid gap-3">
          {team.dynamics.map((dynamic) => (
            <div key={dynamic} className="flex gap-3 rounded-xl border border-border bg-muted/20 p-3">
              <span className={cn("mt-2 size-2 shrink-0 rounded-full", styles.dot)} />
              <p className="text-sm leading-6 text-foreground">{dynamic}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ForecastPanel({ team }: { team: ExecutionOwnershipTeam }) {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <Badge className="border-orange-200 bg-orange-50 text-orange-700">
          <LineChart className="size-3" />
          Team stability forecasting
        </Badge>
        <CardTitle className="mt-3 text-xl">Next-sprint collaboration risk</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {team.forecasts.map((forecast) => (
          <div key={forecast.label} className="rounded-xl border border-border bg-white p-4">
            <Meter label={forecast.label} value={forecast.value} tone={teamTone(team)} detail={forecast.detail} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ActionPanel({ team }: { team: ExecutionOwnershipTeam }) {
  return (
    <Card className="border-slate-900 bg-slate-950 text-white">
      <CardContent className="space-y-5 p-5">
        <Badge className="border-white/10 bg-white/5 text-white/70">
          <Target className="size-3" />
          Mentor intervention system
        </Badge>
        <h2 className="text-2xl font-semibold text-white">Act on ownership imbalance.</h2>
        <div className="grid gap-3">
          {[...new Set([...team.interventions, ...mentorActions])].slice(0, 8).map((action) => (
            <Button key={`${team.id}-${action}`} variant="secondary" className="h-11 justify-between rounded-xl bg-white text-slate-950 hover:bg-white/90">
              {action}
              <ArrowUpRight className="size-4" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Header({ data, teams }: { data: TeamContributionData; teams: ExecutionOwnershipTeam[] }) {
  const criticalMembers = teams.flatMap((team) => team.members).filter((member) => member.riskState === "Critical").length;
  const overloaded = teams.flatMap((team) => team.members).filter((member) => member.aiLabel === "Burnout Risk").length;

  return (
    <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
      <CardContent className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Badge className="border-white/10 bg-white/5 text-white/70">
            <Bot className="size-3" />
            Collaboration intelligence
          </Badge>
          <div>
            <h2 className="text-3xl font-semibold text-white">Execution Ownership reveals how work actually happens inside teams.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">{data.aiSummary}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {data.stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-white/50">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-xs leading-5 text-white/50">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-semibold text-white">System diagnosis</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <Users2 className="size-4 text-sky-200" />
              <p className="mt-3 text-3xl font-semibold text-white">{teams.length}</p>
              <p className="mt-1 text-xs text-white/55">Teams under ownership monitoring</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <ShieldAlert className="size-4 text-red-200" />
              <p className="mt-3 text-3xl font-semibold text-white">{criticalMembers}</p>
              <p className="mt-1 text-xs text-white/55">Critical member patterns</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <Zap className="size-4 text-amber-200" />
              <p className="mt-3 text-3xl font-semibold text-white">{overloaded}</p>
              <p className="mt-1 text-xs text-white/55">Overloaded leaders</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamContributionIntelligenceBoard({ data }: { data: TeamContributionData }) {
  const [mode, setMode] = useState<Mode>("ownership");
  const sortedTeams = useMemo(
    () => [...data.teams].sort((left, right) => modeScore(right, mode) - modeScore(left, mode)),
    [data.teams, mode],
  );
  const [selectedTeamId, setSelectedTeamId] = useState(sortedTeams[0]?.id ?? "");
  const selectedTeam =
    sortedTeams.find((team) => team.id === selectedTeamId) ?? sortedTeams[0];
  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];
  const ActiveModeIcon = activeMode.icon;

  return (
    <PageContainer
      eyebrow="Faculty monitoring"
      title="Execution Ownership"
      description="An AI-powered collaboration intelligence system for detecting real execution ownership, free-rider patterns, overloaded leaders, and responsibility imbalance inside student teams."
    >
      <Header data={data} teams={data.teams} />

      {selectedTeam ? (
        <>
          <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
            <div className="space-y-5">
              <Card>
                <CardHeader className="border-b border-border pb-5">
                  <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                    <ActiveModeIcon className="size-3" />
                    Faculty action mode
                  </Badge>
                  <CardTitle className="mt-3 text-xl">{activeMode.label} intelligence</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeMode.detail}. The team queue updates to surface the highest operational concern.</p>
                </CardHeader>
                <CardContent className="p-5">
                  <Tabs defaultValue="ownership" value={mode} onValueChange={(value) => setMode(value as Mode)}>
                    <TabsList className="flex flex-wrap rounded-xl bg-muted/70">
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
                </CardContent>
              </Card>

              <TeamQueue teams={sortedTeams} selectedTeamId={selectedTeam.id} onSelectTeam={setSelectedTeamId} />
            </div>

            <div className="space-y-5">
              <DynamicsPanel team={selectedTeam} />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Balance score", value: selectedTeam.balanceScore, icon: Scale },
                  { label: "Dependency score", value: selectedTeam.dependencyScore, icon: Users2 },
                  { label: "Dominant owner", value: selectedTeam.dominantMember, icon: UserCheck },
                  { label: "Priority score", value: selectedTeam.priorityScore, icon: AlertTriangle },
                ].map((item) => {
                  const Icon = item.icon;
                  const styles = toneStyles(teamTone(selectedTeam));

                  return (
                    <div key={item.label} className={cn("rounded-xl border p-4", styles.border, styles.bg)}>
                      <Icon className={cn("size-5", styles.text)} />
                      <p className="mt-3 text-2xl font-semibold text-foreground">{item.value}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                      <Handshake className="size-3" />
                      Individual execution profiles
                    </Badge>
                    <h2 className="mt-3 text-2xl font-semibold text-foreground">{selectedTeam.team}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{selectedTeam.batch} - {selectedTeam.project}</p>
                  </div>
                  <Badge className={toneStyles(teamTone(selectedTeam)).soft}>{selectedTeam.collaborationHealth}</Badge>
                </div>
                <div className="grid gap-4 2xl:grid-cols-2">
                  {selectedTeam.members.map((member) => (
                    <MemberExecutionCard key={member.id} member={member} />
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <WorkloadDistribution team={selectedTeam} />
            <TrustSignals team={selectedTeam} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_360px]">
            <ForecastPanel team={selectedTeam} />

            <Card>
              <CardHeader className="border-b border-border pb-5">
                <Badge className="border-violet-200 bg-violet-50 text-violet-700">
                  <GitCommitHorizontal className="size-3" />
                  Sprint responsibility map
                </Badge>
                <CardTitle className="mt-3 text-xl">Historical participation trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                {selectedTeam.members.map((member) => (
                  <div key={`trend-${member.id}`} className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{member.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{member.aiLabel}</p>
                      </div>
                      <Badge className={toneStyles(memberTone(member)).soft}>{member.ownership}%</Badge>
                    </div>
                    <TrendDots values={member.weeklyTrend} tone={memberTone(member)} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <ActionPanel team={selectedTeam} />
          </div>

          <Card>
            <CardHeader className="border-b border-border pb-5">
              <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                <ClipboardCheck className="size-3" />
                Execution reliability score
              </Badge>
              <CardTitle className="mt-3 text-xl">Reliability, consistency, deadline discipline, collaboration, and review response</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-4">
              {selectedTeam.members.map((member) => (
                <div key={`reliability-${member.id}`} className="rounded-xl border border-border bg-white p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{member.name}</p>
                    <Badge className={toneStyles(memberTone(member)).soft}>{member.riskState}</Badge>
                  </div>
                  <div className="space-y-3">
                    <Meter label="Reliability" value={member.reliability} tone={memberTone(member)} />
                    <Meter label="Ownership consistency" value={member.ownershipConsistency} tone={memberTone(member)} />
                    <Meter label="Deadline discipline" value={member.deadlineDiscipline} tone={memberTone(member)} />
                    <Meter label="Collaboration quality" value={member.collaborationQuality} tone={memberTone(member)} />
                    <Meter label="Review responsiveness" value={member.reviewResponsiveness} tone={memberTone(member)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-semibold text-foreground">No monitored teams found.</p>
            <p className="mt-2 text-sm text-muted-foreground">Execution ownership intelligence will appear once teams and members are onboarded.</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
