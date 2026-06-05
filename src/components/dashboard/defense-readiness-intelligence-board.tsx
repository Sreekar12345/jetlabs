"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Bot,
  Brain,
  ClipboardCheck,
  Code2,
  Database,
  FileText,
  Gauge,
  Layers3,
  LineChart,
  Mic2,
  MonitorCheck,
  Presentation,
  RadioTower,
  ServerCrash,
  ShieldAlert,
  Target,
  TrendingUp,
  Users2,
  Zap,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  DefenseArtifact,
  DefenseCompetency,
  DefenseReadinessData,
  DefenseReadinessMember,
  DefenseReadinessTeam,
  MockVivaQuestion,
} from "@/types/aoip";

type Tone = "ready" | "stable" | "watch" | "risk" | "critical" | "insight";
type SimulationMode =
  | "Technical"
  | "Research"
  | "Architecture"
  | "Deployment"
  | "Dataset"
  | "Scalability"
  | "Failure handling";

const simulationModes: Array<{ id: SimulationMode; label: string; icon: LucideIcon }> = [
  { id: "Technical", label: "Technical", icon: Code2 },
  { id: "Research", label: "Research", icon: Brain },
  { id: "Architecture", label: "Architecture", icon: Layers3 },
  { id: "Deployment", label: "Deployment", icon: RadioTower },
  { id: "Dataset", label: "Dataset", icon: Database },
  { id: "Scalability", label: "Scalability", icon: TrendingUp },
  { id: "Failure handling", label: "Failure", icon: ServerCrash },
];

const artifactIcons: Record<DefenseArtifact["type"], LucideIcon> = {
  PPT: Presentation,
  Demo: MonitorCheck,
  Paper: FileText,
  Architecture: Layers3,
};

function readinessTone(state: DefenseReadinessTeam["readinessState"]): Tone {
  if (state === "Defense Ready") {
    return "ready";
  }

  if (state === "Recoverable") {
    return "stable";
  }

  if (state === "Vulnerable") {
    return "watch";
  }

  if (state === "Fake Ready") {
    return "risk";
  }

  return "critical";
}

function memberTone(member: DefenseReadinessMember): Tone {
  if (member.riskState === "Low") {
    return "ready";
  }

  if (member.riskState === "Watch") {
    return "watch";
  }

  if (member.riskState === "High") {
    return "risk";
  }

  return "critical";
}

function scoreTone(value: number): Tone {
  if (value >= 78) {
    return "ready";
  }

  if (value >= 66) {
    return "stable";
  }

  if (value >= 54) {
    return "watch";
  }

  return "critical";
}

function toneStyles(tone: Tone) {
  if (tone === "ready") {
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

  if (tone === "watch") {
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

  if (tone === "risk") {
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

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function Meter({
  label,
  value,
  tone = scoreTone(value),
  detail,
}: {
  label: string;
  value: number;
  tone?: Tone;
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
        <div className={cn("h-full rounded-full", styles.fill)} style={{ width: `${value}%` }} />
      </div>
      {detail ? <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

function ScoreRing({ score, tone }: { score: number; tone: Tone }) {
  const styles = toneStyles(tone);

  return (
    <div
      className="grid size-28 shrink-0 place-items-center rounded-full p-2"
      style={{
        background: `conic-gradient(${styles.ring} ${score * 3.6}deg, rgba(15, 23, 42, 0.08) 0deg)`,
      }}
    >
      <div className="grid size-full place-items-center rounded-full bg-white text-center">
        <div>
          <p className="text-3xl font-semibold text-foreground">{score}</p>
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">defense</p>
        </div>
      </div>
    </div>
  );
}

function TimelineStrip({ team }: { team: DefenseReadinessTeam }) {
  const rows: Array<{
    key: keyof DefenseReadinessTeam["timeline"][number];
    label: string;
  }> = [
    { key: "readiness", label: "Readiness" },
    { key: "technicalConfidence", label: "Technical" },
    { key: "researchMaturity", label: "Research" },
    { key: "pressureHandling", label: "Pressure" },
  ];

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
          <span className="text-xs text-muted-foreground">{row.label}</span>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(1, team.timeline.length)}, minmax(0, 1fr))` }}>
            {team.timeline.map((point) => {
              const value = Number(point[row.key]);
              const styles = toneStyles(scoreTone(value));

              return (
                <span
                  key={`${team.id}-${row.label}-${point.label}`}
                  className={cn("h-6 rounded-sm border border-white", value >= 66 ? styles.fill : value >= 50 ? "bg-slate-300" : "bg-slate-200")}
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

function PortfolioHeader({ data }: { data: DefenseReadinessData }) {
  return (
    <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
      <CardContent className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Badge className="border-white/10 bg-white/5 text-white/70">
            <Bot className="size-3" />
            AI readiness diagnosis
          </Badge>
          <div>
            <h2 className="text-3xl font-semibold text-white">Defense Readiness Intelligence</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">{data.aiSummary}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            {[
              { label: "Overall readiness", value: data.portfolio.overallReadiness, icon: Gauge },
              { label: "Confidence score", value: data.portfolio.confidenceScore, icon: Mic2 },
              { label: "Technical depth", value: data.portfolio.technicalDepthScore, icon: Code2 },
              { label: "Research maturity", value: data.portfolio.researchMaturity, icon: Brain },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <Icon className="size-4 text-white/55" />
                  <p className="mt-3 text-3xl font-semibold text-white">{item.value}%</p>
                  <p className="mt-1 text-xs text-white/50">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-semibold text-white">Portfolio diagnosis</p>
          <p className="mt-3 text-sm leading-7 text-white/62">{data.portfolio.diagnosis}</p>
          <div className="mt-5 grid gap-3">
            {data.stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-white/50">{stat.label}</p>
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                </div>
                <p className="mt-1 text-xs leading-5 text-white/50">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamQueue({
  teams,
  selectedTeamId,
  onSelectTeam,
}: {
  teams: DefenseReadinessTeam[];
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <Badge className="border-slate-200 bg-slate-50 text-slate-700">
          <ShieldAlert className="size-3" />
          Defense risk queue
        </Badge>
        <CardTitle className="mt-3 text-xl">Teams sorted by external viva failure risk</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {teams.map((team) => {
          const tone = readinessTone(team.readinessState);
          const styles = toneStyles(tone);
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
                <Badge className={styles.soft}>{team.readinessState}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Ready</p>
                  <p className="text-sm font-semibold text-foreground">{team.readinessScore}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Fail risk</p>
                  <p className="text-sm font-semibold text-foreground">{team.failureProbability}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">External</p>
                  <p className="text-sm font-semibold text-foreground">{team.externalVivaConfidence}%</p>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function DefenseIntelligencePanel({ team }: { team: DefenseReadinessTeam }) {
  const tone = readinessTone(team.readinessState);
  const styles = toneStyles(tone);

  return (
    <Card className={cn("overflow-hidden", styles.border)}>
      <CardContent className="grid gap-0 p-0 xl:grid-cols-[240px_minmax(0,1fr)_330px]">
        <div className={cn("border-b border-border p-5 xl:border-b-0 xl:border-r", styles.bg)}>
          <ScoreRing score={team.readinessScore} tone={tone} />
          <div className="mt-5 space-y-3">
            <Badge className={styles.soft}>{team.readinessState}</Badge>
            <div>
              <p className="text-sm font-semibold text-foreground">{team.trend}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{team.improvementVelocity}</p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{team.aiDiagnosis}</p>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-white">{team.batch}</Badge>
              <Badge variant="outline" className="bg-white">{team.mentor}</Badge>
              <Badge className={styles.soft}>AI risk diagnosis</Badge>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">{team.team}</h2>
            <p className="mt-1 text-sm font-medium text-foreground">{team.project}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Meter label="Technical preparedness" value={team.technicalDepthScore} tone={tone} detail="Implementation, demo, and code ownership." />
            <Meter label="Research preparedness" value={team.researchMaturityScore} tone={tone} detail="Literature, methodology, novelty, and paper defense." />
            <Meter label="Communication readiness" value={team.communicationReadiness} tone={tone} detail="Clarity under pressure and explanation confidence." />
            <Meter label="Architecture understanding" value={team.architectureUnderstanding} tone={tone} detail="System flow, component boundaries, and failure paths." />
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">AI readiness insights</p>
            <div className="grid gap-2">
              {team.riskDetections.map((signal) => (
                <div key={signal} className="flex gap-2 text-sm leading-6 text-foreground">
                  <span className={cn("mt-2 size-1.5 shrink-0 rounded-full", styles.dot)} />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-border bg-slate-50 p-5 xl:border-l xl:border-t-0">
          <p className="text-xs font-semibold uppercase text-muted-foreground">External viva forecasting</p>
          <div className="grid gap-3">
            <Meter label="External viva confidence" value={team.externalVivaConfidence} tone={tone} />
            <Meter label="Failure probability" value={team.failureProbability} tone={scoreTone(100 - team.failureProbability)} />
            <Meter label="Technical rejection probability" value={team.technicalRejectionProbability} tone={scoreTone(100 - team.technicalRejectionProbability)} />
            <Meter label="Communication breakdown risk" value={team.communicationBreakdownRisk} tone={scoreTone(100 - team.communicationBreakdownRisk)} />
            <Meter label="Research questioning survival" value={team.researchQuestioningSurvival} tone={tone} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ArtifactVerification({ artifacts }: { artifacts: DefenseArtifact[] }) {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <Badge className="border-blue-200 bg-blue-50 text-blue-700">
          <ClipboardCheck className="size-3" />
          Defense asset verification
        </Badge>
        <CardTitle className="mt-3 text-xl">Artifacts scanned for panel-readiness</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 xl:grid-cols-2">
        {artifacts.map((artifact) => {
          const Icon = artifactIcons[artifact.type];
          const tone = scoreTone(average([
            artifact.uploadCompleteness,
            artifact.facultyVerification,
            artifact.aiQualityScan,
            artifact.technicalDepthValidation,
            artifact.presentationReadiness,
          ]));
          const styles = toneStyles(tone);

          return (
            <div key={artifact.id} className={cn("rounded-xl border p-4", styles.border, styles.bg)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("size-4", styles.text)} />
                    <p className="font-semibold text-foreground">{artifact.label}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{artifact.intelligence}</p>
                </div>
                <Badge className={styles.soft}>{artifact.reviewStatus}</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Meter label="Upload completeness" value={artifact.uploadCompleteness} tone={tone} />
                <Meter label="Faculty verification" value={artifact.facultyVerification} tone={tone} />
                <Meter label="AI quality scan" value={artifact.aiQualityScan} tone={tone} />
                <Meter label="Technical depth validation" value={artifact.technicalDepthValidation} tone={tone} />
                <Meter label="Presentation readiness" value={artifact.presentationReadiness} tone={tone} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {artifact.missingSections.map((section) => (
                  <Badge key={`${artifact.id}-${section}`} variant="outline" className="bg-white">
                    {section}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CompetencyMatrix({ competencies }: { competencies: DefenseCompetency[] }) {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
          <BadgeCheck className="size-3" />
          Defense competency matrix
        </Badge>
        <CardTitle className="mt-3 text-xl">Technical evaluation dimensions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
        {competencies.map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-muted/20 p-4">
            <Meter label={item.label} value={item.value} detail={item.detail} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MemberReadiness({ members }: { members: DefenseReadinessMember[] }) {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <Badge className="border-orange-200 bg-orange-50 text-orange-700">
          <Users2 className="size-3" />
          Member-level defense readiness
        </Badge>
        <CardTitle className="mt-3 text-xl">Who can actually answer panel questions?</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 2xl:grid-cols-2">
        {members.map((member) => {
          const tone = memberTone(member);
          const styles = toneStyles(tone);

          return (
            <div key={member.id} className={cn("rounded-xl border p-4", styles.border)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={styles.soft}>{member.readinessLabel}</Badge>
                    <Badge variant="outline" className="bg-white">{member.riskState}</Badge>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-foreground">{member.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
                </div>
                <div className={cn("grid size-14 shrink-0 place-items-center rounded-xl border text-xl font-semibold", styles.soft)}>
                  {member.confidenceUnderPressure}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Meter label="Can explain architecture" value={member.architectureExplanation} tone={tone} />
                <Meter label="Can answer research" value={member.researchAnswering} tone={tone} />
                <Meter label="Can debug live" value={member.liveDebugging} tone={tone} />
                <Meter label="Can explain implementation" value={member.implementationExplanation} tone={tone} />
                <Meter label="Can defend decisions" value={member.decisionDefense} tone={tone} />
                <Meter label="Dataset/model defense" value={member.datasetModelDefense} tone={tone} />
                <Meter label="Scalability answers" value={member.scalabilityAnswering} tone={tone} />
              </div>

              <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">AI member signals</p>
                {member.aiSignals.map((signal) => (
                  <div key={signal} className="flex gap-2 text-sm leading-6 text-foreground">
                    <span className={cn("mt-2 size-1.5 shrink-0 rounded-full", styles.dot)} />
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function MockVivaSimulation({
  questions,
  mode,
  onModeChange,
}: {
  questions: MockVivaQuestion[];
  mode: SimulationMode;
  onModeChange: (mode: SimulationMode) => void;
}) {
  const filteredQuestions = questions.filter((question) => question.category === mode);
  const visibleQuestions = filteredQuestions.length > 0 ? filteredQuestions : questions.slice(0, 3);
  const activeMode = simulationModes.find((item) => item.id === mode) ?? simulationModes[0];
  const ActiveIcon = activeMode.icon;

  return (
    <Card className="border-slate-900 bg-slate-950 text-white">
      <CardContent className="space-y-6 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Badge className="border-white/10 bg-white/5 text-white/70">
              <Mic2 className="size-3" />
              Defense simulation engine
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold text-white">Run panel pressure before the panel does.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/62">
              AI-generated mock questions adapt to project type, weak areas, technical stack, research maturity, and missing concepts.
            </p>
          </div>
          <Tabs defaultValue="Technical" value={mode} onValueChange={(value) => onModeChange(value as SimulationMode)}>
            <TabsList className="flex flex-wrap rounded-xl border-white/10 bg-white/5">
              {simulationModes.map((item) => {
                const Icon = item.icon;

                return (
                  <TabsTrigger key={item.id} value={item.id} className="rounded-lg px-3 py-2 text-xs text-white/70 data-[state=active]:bg-white data-[state=active]:text-slate-950">
                    <Icon className="size-3.5" />
                    {item.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <ActiveIcon className="size-6 text-white/70" />
            <p className="mt-4 text-xl font-semibold text-white">{activeMode.label} questioning</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["Timer", "04:00"],
                ["Follow-ups", "3"],
                ["Intensity", "Panel"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs text-white/45">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full justify-between rounded-xl bg-white text-slate-950 hover:bg-white/90">
              Start simulated defense
              <ArrowUpRight className="size-4" />
            </Button>
          </div>

          <div className="grid gap-3">
            {visibleQuestions.map((question) => (
              <div key={question.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-white/10 bg-white/5 text-white/70">{question.category}</Badge>
                  <Badge className={cn("border-white/10", question.pressure === "Stress test" ? "bg-red-400/15 text-red-100" : "bg-white/5 text-white/70")}>
                    {question.pressure}
                  </Badge>
                </div>
                <p className="mt-3 text-base font-semibold leading-7 text-white">{question.question}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <p className="text-xs font-semibold uppercase text-white/45">Expected evidence</p>
                    <p className="mt-2 text-sm leading-6 text-white/65">{question.expectedEvidence}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <p className="text-xs font-semibold uppercase text-white/45">Weak signal</p>
                    <p className="mt-2 text-sm leading-6 text-white/65">{question.weakSignal}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StressAndForecast({ team }: { team: DefenseReadinessTeam }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader className="border-b border-border pb-5">
          <Badge className="border-red-200 bg-red-50 text-red-700">
            <AlertTriangle className="size-3" />
            Question stress analysis
          </Badge>
          <CardTitle className="mt-3 text-xl">Behavioral risk under cross-questioning</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          {team.stressAnalysis.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-muted/20 p-4">
              <Meter label={item.label} value={item.value} tone={scoreTone(100 - item.value)} detail={item.detail} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border pb-5">
          <Badge className="border-violet-200 bg-violet-50 text-violet-700">
            <Target className="size-3" />
            High-risk questioning
          </Badge>
          <CardTitle className="mt-3 text-xl">Panel probes to rehearse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          {team.highRiskQuestioningAreas.map((area) => (
            <div key={area} className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-sm font-semibold text-foreground">{area}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Force a timed answer and follow-up question before approval.</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineAndActions({ team }: { team: DefenseReadinessTeam }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader className="border-b border-border pb-5">
          <Badge className="border-blue-200 bg-blue-50 text-blue-700">
            <LineChart className="size-3" />
            Readiness timeline
          </Badge>
          <CardTitle className="mt-3 text-xl">Defense progression and pressure confidence</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <TimelineStrip team={team} />
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {team.timeline.map((point) => (
              <div key={`${team.id}-${point.label}`} className="rounded-xl border border-border bg-muted/20 p-3">
                <p className="text-xs font-semibold text-muted-foreground">{point.label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{point.readiness}%</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">readiness score</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-900 bg-slate-950 text-white">
        <CardContent className="space-y-5 p-5">
          <Badge className="border-white/10 bg-white/5 text-white/70">
            <Zap className="size-3" />
            Faculty action system
          </Badge>
          <h2 className="text-2xl font-semibold text-white">Intervene before external evaluation.</h2>
          <div className="grid gap-3">
            {team.actions.map((action) => (
              <Button key={`${team.id}-${action}`} variant="secondary" className="h-11 justify-between rounded-xl bg-white text-slate-950 hover:bg-white/90">
                {action}
                <ArrowUpRight className="size-4" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DefenseReadinessIntelligenceBoard({ data }: { data: DefenseReadinessData }) {
  const [selectedTeamId, setSelectedTeamId] = useState(data.teams[0]?.id ?? "");
  const [simulationMode, setSimulationMode] = useState<SimulationMode>("Technical");
  const teams = useMemo(
    () =>
      [...data.teams].sort(
        (left, right) =>
          right.failureProbability +
          (right.readinessState === "Fake Ready" ? 20 : 0) -
          (left.failureProbability + (left.readinessState === "Fake Ready" ? 20 : 0)),
      ),
    [data.teams],
  );
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0];

  return (
    <PageContainer
      eyebrow="Faculty evaluation"
      title="Defense Readiness Intelligence"
      description="An AI-powered technical evaluation and defense-readiness command center for identifying fake readiness, weak implementation ownership, panel-questioning risk, and external viva failure probability."
    >
      <PortfolioHeader data={data} />

      {selectedTeam ? (
        <>
          <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
            <TeamQueue teams={teams} selectedTeamId={selectedTeam.id} onSelectTeam={setSelectedTeamId} />
            <DefenseIntelligencePanel team={selectedTeam} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <ArtifactVerification artifacts={selectedTeam.artifacts} />
            <CompetencyMatrix competencies={selectedTeam.competencies} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <MemberReadiness members={selectedTeam.members} />
            <MockVivaSimulation
              questions={selectedTeam.mockQuestions}
              mode={simulationMode}
              onModeChange={setSimulationMode}
            />
          </div>

          <StressAndForecast team={selectedTeam} />

          <TimelineAndActions team={selectedTeam} />
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-semibold text-foreground">No teams ready for defense monitoring yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Defense intelligence will appear once faculty teams start submitting artifacts.</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
