import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  BookOpenCheck,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Cloud,
  Code2,
  Command,
  FileText,
  GitBranch,
  Gauge,
  Layers3,
  RadioTower,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  TrendingDown,
  TrendingUp,
  Users2,
  Video,
  WandSparkles,
  Zap,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ModulePageData } from "@/types/aoip";

type TeamState =
  | "Healthy execution"
  | "Needs review"
  | "Slowing down"
  | "Blocked"
  | "High risk"
  | "Critical";

type Tone = "healthy" | "attention" | "critical" | "blocked" | "insight";

type TeamSignal = {
  id: string;
  name: string;
  department: string;
  members: number;
  mentor: string;
  sprint: string;
  state: TeamState;
  confidence: number;
  priority: string;
  project: string;
  milestone: string;
  submissions: number;
  velocity: number;
  ieee: number;
  viva: number;
  deployment: number;
  collaboration: number;
  pendingReviews: number;
  lastMentor: string;
  streak: string;
  bottleneck: string;
  prediction: string;
  recommendation: string;
  signals: string[];
  contribution: Array<{ member: string; value: number; status: string }>;
  heatmap: number[];
  timeline: Array<{ label: string; type: "submission" | "review" | "ieee" | "viva" | "risk" | "recovery"; week: string }>;
};

type FacultyTeamExecutionViewProps = {
  module: ModulePageData;
};

const quickActions: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "AI execution insights", href: "/faculty/dashboard", icon: Bot },
  { label: "Review bottlenecks", href: "/faculty/review/review-queue", icon: ClipboardCheck },
  { label: "Open delayed teams", href: "/faculty/monitoring/project-health", icon: ShieldAlert },
  { label: "Mentor sync planner", href: "/faculty/management/teams-batches", icon: CalendarClock },
  { label: "Export execution report", href: "/faculty/analytics", icon: FileText },
];

const teams: TeamSignal[] = [
  {
    id: "team-nova",
    name: "Team Nova",
    department: "AIML-B",
    members: 4,
    mentor: "Dr. Mehta",
    sprint: "Week 6",
    state: "Slowing down",
    confidence: 58,
    priority: "P1",
    project: "Vision-based crop disease detection",
    milestone: "Model validation and deployment evidence",
    submissions: 42,
    velocity: 48,
    ieee: 39,
    viva: 46,
    deployment: 34,
    collaboration: 41,
    pendingReviews: 2,
    lastMentor: "6 days ago",
    streak: "0 submissions in 5 days",
    bottleneck: "IEEE progress unchanged and low team activity",
    prediction: "High probability of delayed final submission.",
    recommendation: "Mentor intervention within 3 days.",
    signals: ["No submissions in 5 days", "IEEE unchanged", "Low collaboration activity"],
    contribution: [
      { member: "Riya", value: 42, status: "Overloaded" },
      { member: "Kabir", value: 24, status: "Quiet" },
      { member: "Neel", value: 21, status: "Silent" },
      { member: "Anu", value: 13, status: "Inactive" },
    ],
    heatmap: [7, 6, 5, 4, 3, 2, 2, 1, 1, 0, 1, 0],
    timeline: [
      { label: "Baseline submitted", type: "submission", week: "W3" },
      { label: "Mentor revision", type: "review", week: "W4" },
      { label: "IEEE stalled", type: "risk", week: "W5" },
      { label: "Deployment missed", type: "risk", week: "W6" },
    ],
  },
  {
    id: "team-atlas",
    name: "Team Atlas",
    department: "CSE-A",
    members: 4,
    mentor: "Prof. Arjun",
    sprint: "Week 6",
    state: "Healthy execution",
    confidence: 91,
    priority: "P3",
    project: "Academic workflow automation",
    milestone: "Final validation",
    submissions: 92,
    velocity: 88,
    ieee: 81,
    viva: 84,
    deployment: 86,
    collaboration: 90,
    pendingReviews: 0,
    lastMentor: "Today",
    streak: "18-day delivery streak",
    bottleneck: "Needs final proofbook export",
    prediction: "High confidence final delivery.",
    recommendation: "Shortlist for innovation showcase.",
    signals: ["Fast review turnaround", "Strong consistency", "Early paper completion"],
    contribution: [
      { member: "Priya", value: 28, status: "Balanced" },
      { member: "Aarav", value: 26, status: "Balanced" },
      { member: "Meera", value: 24, status: "Balanced" },
      { member: "Rohan", value: 22, status: "Balanced" },
    ],
    heatmap: [8, 9, 8, 10, 9, 8, 10, 9, 10, 9, 10, 10],
    timeline: [
      { label: "Architecture approved", type: "review", week: "W3" },
      { label: "IEEE draft cleared", type: "ieee", week: "W4" },
      { label: "Deployment live", type: "submission", week: "W5" },
      { label: "Viva simulation passed", type: "viva", week: "W6" },
    ],
  },
  {
    id: "team-pulse",
    name: "Team Pulse",
    department: "ECE-C",
    members: 3,
    mentor: "Dr. Nisha",
    sprint: "Week 6",
    state: "Blocked",
    confidence: 44,
    priority: "P0",
    project: "IoT energy monitoring system",
    milestone: "Hardware integration",
    submissions: 37,
    velocity: 33,
    ieee: 42,
    viva: 29,
    deployment: 18,
    collaboration: 36,
    pendingReviews: 3,
    lastMentor: "8 days ago",
    streak: "Review loop active",
    bottleneck: "Hardware proof and mentor review chain blocked",
    prediction: "Potential project failure risk if demo evidence is not restored.",
    recommendation: "Escalate issue and request live demo proof.",
    signals: ["Pending reviews", "Hardware proof missing", "Silent member detected"],
    contribution: [
      { member: "Imran", value: 52, status: "Overloaded" },
      { member: "Sana", value: 31, status: "Active" },
      { member: "Dev", value: 17, status: "Silent" },
    ],
    heatmap: [6, 5, 4, 4, 2, 2, 1, 1, 0, 0, 1, 0],
    timeline: [
      { label: "Prototype video submitted", type: "submission", week: "W2" },
      { label: "Review loop opened", type: "review", week: "W4" },
      { label: "Hardware proof missing", type: "risk", week: "W5" },
      { label: "Escalation pending", type: "risk", week: "W6" },
    ],
  },
  {
    id: "team-lyra",
    name: "Team Lyra",
    department: "DS-A",
    members: 4,
    mentor: "Dr. Iyer",
    sprint: "Week 6",
    state: "Needs review",
    confidence: 76,
    priority: "P2",
    project: "Student risk prediction engine",
    milestone: "Benchmark comparison",
    submissions: 78,
    velocity: 72,
    ieee: 64,
    viva: 63,
    deployment: 58,
    collaboration: 74,
    pendingReviews: 2,
    lastMentor: "Yesterday",
    streak: "9-day delivery streak",
    bottleneck: "Benchmark review waiting on faculty decision",
    prediction: "Review bottleneck could delay deployment approval.",
    recommendation: "Move benchmark packet into quick review.",
    signals: ["Pending reviews", "Benchmark ambiguity", "Deployment waiting"],
    contribution: [
      { member: "Nisha", value: 30, status: "Active" },
      { member: "Ayaan", value: 27, status: "Active" },
      { member: "Tara", value: 23, status: "Active" },
      { member: "Om", value: 20, status: "Quiet" },
    ],
    heatmap: [6, 7, 7, 8, 7, 6, 8, 7, 7, 6, 6, 5],
    timeline: [
      { label: "Metrics submitted", type: "submission", week: "W3" },
      { label: "Benchmark questioned", type: "review", week: "W4" },
      { label: "IEEE methods updated", type: "ieee", week: "W5" },
      { label: "Review pending", type: "risk", week: "W6" },
    ],
  },
  {
    id: "team-vega",
    name: "Team Vega",
    department: "CSE-B",
    members: 5,
    mentor: "Prof. Raman",
    sprint: "Week 6",
    state: "High risk",
    confidence: 52,
    priority: "P1",
    project: "Healthcare triage assistant",
    milestone: "Clinical workflow validation",
    submissions: 55,
    velocity: 49,
    ieee: 35,
    viva: 41,
    deployment: 46,
    collaboration: 58,
    pendingReviews: 1,
    lastMentor: "5 days ago",
    streak: "Research stalled",
    bottleneck: "Paper incompletion and weak validation story",
    prediction: "Viva failure risk increasing due to research gap.",
    recommendation: "Trigger IEEE recovery plan and panel simulation.",
    signals: ["Paper incomplete", "Viva unprepared", "Validation weak"],
    contribution: [
      { member: "Nisha", value: 34, status: "Active" },
      { member: "Karan", value: 27, status: "Active" },
      { member: "Ira", value: 18, status: "Quiet" },
      { member: "Manav", value: 13, status: "Silent" },
      { member: "Zoya", value: 8, status: "Inactive" },
    ],
    heatmap: [5, 5, 4, 5, 4, 3, 3, 2, 2, 2, 1, 1],
    timeline: [
      { label: "Dataset approved", type: "review", week: "W2" },
      { label: "IEEE lag detected", type: "risk", week: "W4" },
      { label: "Viva readiness low", type: "viva", week: "W5" },
      { label: "Recovery plan needed", type: "risk", week: "W6" },
    ],
  },
];

const healthOverview: Array<{ label: string; value: string; trend: string; tone: Tone; icon: LucideIcon }> = [
  { label: "Active teams", value: "18", trend: "+2 this cycle", tone: "insight", icon: Users2 },
  { label: "Healthy execution", value: "11", trend: "+4 improving", tone: "healthy", icon: CheckCircle2 },
  { label: "Slowing teams", value: "4", trend: "+2 vs last week", tone: "attention", icon: TrendingDown },
  { label: "At-risk teams", value: "3", trend: "1 critical", tone: "critical", icon: ShieldAlert },
  { label: "No submission activity", value: "2", trend: "5-day silence", tone: "critical", icon: TimerReset },
  { label: "IEEE delayed", value: "7", trend: "-8% velocity", tone: "attention", icon: BookOpenCheck },
  { label: "Viva unprepared", value: "9", trend: "needs practice", tone: "attention", icon: Video },
  { label: "Mentor attention", value: "6", trend: "sync required", tone: "insight", icon: BellRing },
];

const pipelineColumns: Array<{ state: TeamState; detail: string }> = [
  { state: "Healthy execution", detail: "Strong delivery momentum" },
  { state: "Needs review", detail: "Faculty decision pending" },
  { state: "Slowing down", detail: "Reduced progress consistency" },
  { state: "Blocked", detail: "Submission or review dependency" },
  { state: "High risk", detail: "Delay probability increasing" },
];

const predictionSignals = [
  { label: "Submission delay risk", value: 63, tone: "attention" as const },
  { label: "Viva failure risk", value: 49, tone: "attention" as const },
  { label: "Paper incompletion", value: 58, tone: "critical" as const },
  { label: "Team inactivity", value: 44, tone: "blocked" as const },
];

const teamIntelligenceActions: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Predict delayed final submission", icon: AlertTriangle },
  { label: "Recommend mentor intervention", icon: BellRing },
  { label: "Shortlist Team Atlas", icon: BadgeCheck },
  { label: "Detect review bottlenecks", icon: RadioTower },
];

const operationalAlerts = [
  { label: "4 teams missed milestone deadlines this week", trend: "+12% risk load", tone: "critical" as Tone, action: "Open review queue" },
  { label: "AIML batch leads in research quality", trend: "▲ 11% vs last sprint", tone: "healthy" as Tone, action: "Share benchmark" },
  { label: "Submission approvals dropped 18%", trend: "▼ faculty turnaround", tone: "attention" as Tone, action: "Reassign reviewers" },
  { label: "3 teams flagged for consistency risk", trend: "Needs checkpoint", tone: "blocked" as Tone, action: "Schedule intervention" },
];

const qualityDimensions = [
  { label: "Execution", score: 84, delta: "+6", note: "Stable delivery cadence" },
  { label: "Research", score: 76, delta: "-2", note: "Needs validation depth" },
  { label: "UI/UX", score: 81, delta: "+4", note: "Prototype polish improved" },
  { label: "Documentation", score: 68, delta: "-5", note: "Proofbook quality slipped" },
  { label: "Feasibility", score: 79, delta: "+3", note: "Implementation path clear" },
  { label: "Innovation", score: 87, delta: "+8", note: "Strong differentiation" },
];

const velocitySignals = [
  { label: "Approval rate", value: 74, delta: "-8%", tone: "attention" as Tone },
  { label: "Sprint velocity", value: 83, delta: "+11%", tone: "healthy" as Tone },
  { label: "Feedback turnaround", value: 66, delta: "-4 days", tone: "critical" as Tone },
  { label: "Consistency score", value: 79, delta: "+5%", tone: "insight" as Tone },
];

const readinessMatrix = [
  { label: "Prototype maturity", value: 82, band: "Ready" },
  { label: "Research completeness", value: 68, band: "Monitor" },
  { label: "Technical readiness", value: 75, band: "Ready" },
  { label: "Demo preparedness", value: 71, band: "Watch" },
  { label: "UI/UX quality", value: 78, band: "Ready" },
  { label: "Validation readiness", value: 64, band: "Risk" },
];

const milestoneTracker = [
  { name: "Problem Finalization", confidence: 91, risk: "Low", owner: "Team Atlas", status: "Approved" },
  { name: "Dataset Baseline", confidence: 76, risk: "Medium", owner: "Team Lyra", status: "In review" },
  { name: "Improved Model", confidence: 62, risk: "High", owner: "Team Nova", status: "Needs checkpoint" },
  { name: "Frontend Prototype", confidence: 83, risk: "Low", owner: "Team Pulse", status: "Stable" },
  { name: "Integration", confidence: 57, risk: "Critical", owner: "Team Vega", status: "Blocked" },
  { name: "Paper Draft", confidence: 69, risk: "Medium", owner: "Team Atlas", status: "Reviewing" },
];

const riskQuadrants = [
  { label: "High progress / low risk", teams: "Atlas, Lyra", tone: "healthy" },
  { label: "High progress / high risk", teams: "Nova, Vega", tone: "attention" },
  { label: "Low progress / high risk", teams: "Pulse", tone: "critical" },
  { label: "Low progress / recovering", teams: "CSE-B, ECE-C", tone: "insight" },
];

const leaderboard = [
  { rank: 1, team: "Team Atlas", score: 92, note: "Best delivery consistency" },
  { rank: 2, team: "Team Lyra", score: 86, note: "Strong review responsiveness" },
  { rank: 3, team: "Team Nova", score: 71, note: "Recovery path open" },
  { rank: 4, team: "Team Pulse", score: 54, note: "Needs mentor escalation" },
];

const interventionCenter = [
  { label: "Urgent review", count: 4, detail: "Pending faculty sign-off" },
  { label: "Missing submissions", count: 3, detail: "5-day inactivity alerts" },
  { label: "Low consistency teams", count: 2, detail: "Prototype and research drift" },
  { label: "Delayed approvals", count: 6, detail: "Mentor cycle recovery" },
];

const aiForecasts = [
  { label: "Likely to miss deadlines", value: "Team Nova, Team Vega" },
  { label: "Likely distinction candidates", value: "Team Atlas, Team Lyra" },
  { label: "Research risk prediction", value: "Documentation quality down 5%" },
  { label: "Execution bottleneck", value: "Approval turnaround and hardware proof" },
];

const executionBlockers: Array<{
  title: string;
  detail: string;
  icon: LucideIcon;
  tone: Tone;
}> = [
  {
    title: "Pending reviews",
    detail: "7 packets waiting for faculty decision",
    icon: ClipboardCheck,
    tone: "attention",
  },
  {
    title: "Student inactivity",
    detail: "2 teams silent for 5+ days",
    icon: TimerReset,
    tone: "critical",
  },
  {
    title: "Review loops",
    detail: "Team Pulse stuck in evidence correction",
    icon: GitBranch,
    tone: "blocked",
  },
  {
    title: "Blocked progress chains",
    detail: "Deployment cannot proceed until mentor sign-off",
    icon: Code2,
    tone: "insight",
  },
];

function toneForState(state: TeamState): Tone {
  if (state === "Healthy execution") {
    return "healthy";
  }

  if (state === "Blocked") {
    return "blocked";
  }

  if (state === "High risk" || state === "Critical") {
    return "critical";
  }

  return "attention";
}

function toneStyles(tone: Tone) {
  if (tone === "healthy") {
    return {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      fill: "bg-emerald-500",
      soft: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (tone === "critical") {
    return {
      border: "border-red-200",
      bg: "bg-red-50",
      text: "text-red-700",
      fill: "bg-red-500",
      soft: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (tone === "blocked") {
    return {
      border: "border-purple-200",
      bg: "bg-purple-50",
      text: "text-purple-700",
      fill: "bg-purple-500",
      soft: "border-purple-200 bg-purple-50 text-purple-700",
    };
  }

  if (tone === "attention") {
    return {
      border: "border-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-700",
      fill: "bg-amber-500",
      soft: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-700",
    fill: "bg-blue-500",
    soft: "border-blue-200 bg-blue-50 text-blue-700",
  };
}

function Meter({
  value,
  tone,
  className,
}: {
  value: number;
  tone: Tone;
  className?: string;
}) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-200", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", toneStyles(tone).fill)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ActivityHeatmap({ values, tone }: { values: number[]; tone: Tone }) {
  const fillClass = toneStyles(tone).fill;

  return (
    <div className="grid grid-cols-12 gap-1">
      {values.map((value, index) => (
        <span
          key={`${value}-${index + 1}`}
          className={cn(
            "h-8 rounded-md border border-white/80",
            value >= 8
              ? fillClass
              : value >= 5
                ? "bg-slate-300"
                : value >= 2
                  ? "bg-slate-200"
                  : "bg-slate-100",
          )}
        />
      ))}
    </div>
  );
}

function HealthCard({
  item,
}: {
  item: (typeof healthOverview)[number];
}) {
  const Icon = item.icon;
  const styles = toneStyles(item.tone);

  return (
    <Card className={cn("transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(15,23,42,0.07)]", styles.border)}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <span className={cn("grid size-10 place-items-center rounded-xl border", styles.soft)}>
            <Icon className="size-5" />
          </span>
          <Badge className={styles.soft}>{item.trend}</Badge>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{item.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-foreground">{item.value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamExecutionCard({ team }: { team: TeamSignal }) {
  const tone = toneForState(team.state);
  const styles = toneStyles(tone);
  const metrics: Array<{ label: string; value: number; icon: LucideIcon }> = [
    { label: "Submission consistency", value: team.submissions, icon: ClipboardCheck },
    { label: "Project velocity", value: team.velocity, icon: Rocket },
    { label: "IEEE progress", value: team.ieee, icon: BookOpenCheck },
    { label: "Viva readiness", value: team.viva, icon: Video },
    { label: "Deployment", value: team.deployment, icon: Cloud },
    { label: "Collaboration", value: team.collaboration, icon: Users2 },
  ];

  return (
    <details className={cn("group rounded-3xl border bg-white p-4 transition duration-200 open:shadow-[0_22px_60px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(15,23,42,0.07)]", styles.border)}>
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_320px] xl:items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                {team.name.split(" ").map((part) => part[0]).join("")}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={styles.soft}>{team.state}</Badge>
                  <Badge variant="outline" className="bg-white">{team.priority}</Badge>
                </div>
                <p className="mt-2 text-lg font-semibold text-foreground">{team.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {team.department} - {team.members} members - {team.sprint}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {[
                ["Faculty mentor", team.mentor],
                ["Current milestone", team.milestone],
                ["Last mentor interaction", team.lastMentor],
                ["Submission streak", team.streak],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="rounded-2xl border border-border bg-muted/20 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Icon className="size-3.5" />
                        {metric.label}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{metric.value}%</span>
                    </div>
                    <Meter value={metric.value} tone={tone} className="h-1.5" />
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border bg-white p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Weekly execution intensity</p>
                <span className="text-xs text-muted-foreground">{team.bottleneck}</span>
              </div>
              <ActivityHeatmap values={team.heatmap} tone={tone} />
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-3">
              <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                AI execution insight
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">{team.prediction}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className={cn("rounded-2xl border p-4", styles.bg, styles.border)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn("text-xs font-semibold uppercase tracking-normal", styles.text)}>
                    Delivery confidence
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
                    {team.confidence}%
                  </p>
                </div>
                <Gauge className={cn("size-5", styles.text)} />
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground">{team.recommendation}</p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-semibold text-foreground">{team.project}</p>
              <p className="mt-1 text-xs text-muted-foreground">Pending reviews: {team.pendingReviews}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {team.signals.map((signal) => (
                  <Badge key={signal} variant="outline" className="bg-white">
                    {signal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </summary>

      <div className="mt-5 grid gap-4 border-t border-border pt-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-2xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Team contribution intelligence
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {team.contribution.map((member) => (
              <div key={member.member} className="rounded-xl border border-border bg-white p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">{member.member}</span>
                  <Badge variant="outline" className="bg-white">{member.status}</Badge>
                </div>
                <Meter value={member.value} tone={member.value < 20 ? "critical" : member.value > 45 ? "attention" : "healthy"} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {["Open workspace", "Send review request", "Schedule sync", "Escalate issue", "Add mentor note", "Flag inactive member"].map((action) => (
            <Button key={action} variant="outline" size="sm" className="rounded-xl">
              {action}
            </Button>
          ))}
        </div>
      </div>
    </details>
  );
}

function PipelineCard({ team }: { team: TeamSignal }) {
  const tone = toneForState(team.state);
  const styles = toneStyles(tone);

  return (
    <div className={cn("rounded-2xl border bg-white p-3", styles.border)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{team.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{team.project}</p>
        </div>
        <Badge className={styles.soft}>{team.confidence}%</Badge>
      </div>
      <div className="mt-3 grid gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Velocity</span>
          <span className="font-semibold text-foreground">{team.velocity}%</span>
        </div>
        <Meter value={team.velocity} tone={tone} className="h-1.5" />
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{team.recommendation}</p>
    </div>
  );
}

function TimelineEvent({ team }: { team: TeamSignal }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-foreground">{team.name}</p>
        <Badge variant="outline" className="bg-white">{team.sprint}</Badge>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {team.timeline.map((event) => (
          <div key={`${team.id}-${event.label}`} className="relative rounded-xl border border-border bg-muted/20 p-3">
            <span className="absolute -left-1 top-4 size-2 rounded-full bg-slate-950" />
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">{event.week}</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{event.label}</p>
            <Badge variant="outline" className="mt-3 bg-white">{event.type}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FacultyTeamExecutionView({ module }: FacultyTeamExecutionViewProps) {
  const activeTeams = module.stats[0]?.value ?? "18";
  const deliveryRhythm = module.stats[3]?.value ?? "78%";
  const capacityGaps = module.stats[2]?.value ?? "2";
  const delayedTeams = teams.filter((team) => team.state === "Slowing down" || team.state === "High risk").length;
  const blockedTeams = teams.filter((team) => team.state === "Blocked").length;
  const highRiskTeams = teams.filter((team) => team.state === "High risk" || team.state === "Critical").length;
  const headerMetrics: Array<{ label: string; value: string; icon: LucideIcon }> = [
    { label: "Active teams", value: activeTeams, icon: Users2 },
    { label: "Delayed teams", value: `${delayedTeams}`, icon: TrendingDown },
    { label: "Blocked submissions", value: `${blockedTeams + 3}`, icon: ShieldAlert },
    { label: "High-risk projects", value: `${highRiskTeams}`, icon: AlertTriangle },
  ];

  return (
    <section className="space-y-8">
      <Card className="overflow-hidden border-slate-900 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#1f2937_100%)] text-white shadow-[0_32px_100px_rgba(15,23,42,0.18)]">
        <CardContent className="grid gap-7 p-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
          <div className="space-y-6">
            <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
              <div className="max-w-4xl">
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-100">
                  <Command className="size-3" />
                  Project Execution Intelligence
                </Badge>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Project Execution Intelligence</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
                  Track delivery velocity, execution quality, research progress, and milestone adherence across all student teams.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 2xl:min-w-[640px] 2xl:grid-cols-4">
                {headerMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <Icon className="size-4 text-white/55" />
                      <p className="mt-3 text-2xl font-semibold tracking-normal text-white">{metric.value}</p>
                      <p className="mt-1 text-xs text-white/50">{metric.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["Delivery rhythm", deliveryRhythm, "Team-level consistency this sprint"],
                ["Capacity gaps", capacityGaps, "Mentor load needs rebalance"],
                ["Prediction confidence", "88%", "AI signals mapped to review data"],
              ].map(([label, value, detail]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">{label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-normal text-white">{value}</p>
                  <p className="mt-2 text-xs leading-5 text-white/55">{detail}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
              {['Department','Batch','Sprint','Project stage','Faculty owner'].map((filter) => (
                <div key={filter} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">{filter}</p>
                  <p className="mt-2 font-medium text-white">{filter === 'Department' ? 'AIML / ECE' : filter === 'Batch' ? 'Y3-B' : filter === 'Sprint' ? 'Week 6' : filter === 'Project stage' ? 'Prototype' : 'Dr. Mehta'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <Badge className="border-purple-400/20 bg-purple-400/10 text-purple-100">Live operational summary</Badge>
            <div className="mt-4 space-y-3">
              {[
                "ECE teams show highest execution risk",
                "Prototype completion velocity improved 24%",
                "Research documentation quality declining in Y3",
              ].map((summary) => (
                <div key={summary} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-white/75">
                  {summary}
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button key={action.label} asChild variant="secondary" className="h-11 justify-between rounded-xl bg-white text-slate-950 hover:bg-white/90">
                    <Link href={action.href}><span className="flex items-center gap-2"><Icon className="size-4" />{action.label}</span><ArrowUpRight className="size-4" /></Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {healthOverview.map((item) => <HealthCard key={item.label} item={item} />)}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {operationalAlerts.map((alert) => (
          <Card key={alert.label} className={cn("border", alert.tone === "critical" ? "border-red-200 bg-red-50" : alert.tone === "healthy" ? "border-emerald-200 bg-emerald-50" : alert.tone === "blocked" ? "border-purple-200 bg-purple-50" : "border-amber-200 bg-amber-50") }>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <Badge className={cn(alert.tone === "critical" ? "border-red-200 bg-red-100 text-red-700" : alert.tone === "healthy" ? "border-emerald-200 bg-emerald-100 text-emerald-700" : alert.tone === "blocked" ? "border-purple-200 bg-purple-100 text-purple-700" : "border-amber-200 bg-amber-100 text-amber-700")}>{alert.trend}</Badge>
                <Activity className="size-4 text-slate-400" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">{alert.label}</p>
              <button type="button" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-700">{alert.action}<ArrowUpRight className="size-3.5" /></button>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-blue-200 bg-blue-50 text-blue-700">Execution Quality Intelligence</Badge>
            <CardTitle className="mt-4 text-2xl">Layered quality dimensions</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">Execution, research, documentation, feasibility, innovation, and delivery consistency scored against faculty benchmarks.</p>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            {qualityDimensions.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <Badge className={item.delta.startsWith("+") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{item.delta}</Badge>
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-semibold text-foreground">{item.score}</span>
                  <span className="pb-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">/100</span>
                </div>
                <Meter value={item.score} tone={item.score > 80 ? "healthy" : item.score > 70 ? "attention" : "critical"} className="mt-3 h-2" />
                <p className="mt-3 text-xs text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="space-y-5 p-5">
            <Badge className="border-white/10 bg-white/5 text-white/70"><Bot className="size-3" />AI execution intelligence</Badge>
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-white">Delivery velocity & approval intelligence</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">Momentum, approval bottlenecks, and risk prediction overlays built for faculty intervention.</p>
            </div>
            <div className="grid gap-3">
              {velocitySignals.map((signal) => (
                <div key={signal.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white/90">{signal.label}</p>
                    <span className="text-sm font-semibold text-white">{signal.value}%</span>
                  </div>
                  <Meter value={signal.value} tone={signal.tone} className="mt-3 h-1.5" />
                  <p className="mt-2 text-xs text-white/55">{signal.delta}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Prototype & research readiness</Badge>
            <CardTitle className="mt-4 text-2xl">Readiness matrix</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">Prototype maturity, research completeness, technical readiness, demo preparedness, and validation confidence.</p>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            {readinessMatrix.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-foreground">{item.label}</p><Badge variant="outline">{item.band}</Badge></div>
                <div className="mt-3 flex items-end gap-2"><span className="text-3xl font-semibold text-foreground">{item.value}</span><span className="pb-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">/100</span></div>
                <Meter value={item.value} tone={item.value >= 80 ? "healthy" : item.value >= 70 ? "attention" : "critical"} className="mt-3 h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-purple-200 bg-purple-50 text-purple-700">AI execution intelligence</Badge>
            <CardTitle className="mt-4 text-2xl">Forecasts & bottlenecks</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">Teams likely to miss deadlines, distinction candidates, risk predictions, and execution bottlenecks.</p>
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            {aiForecasts.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                <Sparkles className="size-3" />
                Live execution cards
              </Badge>
              <CardTitle className="mt-4 text-2xl">Monitored startup squads</CardTitle>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                Each card combines team identity, velocity, review bottlenecks, collaboration health, AI risk, and mentor actions.
              </p>
            </div>
            <div className="relative min-w-0 xl:w-[360px]">
              <Target className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 rounded-2xl bg-muted/30 pl-11 shadow-none" placeholder="Filter teams by risk, sprint, blocker..." />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {teams.map((team) => (
            <TeamExecutionCard key={team.id} team={team} />
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
              Execution workflow pipeline
            </Badge>
            <CardTitle className="mt-4 text-2xl">Kanban execution states</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Healthy execution, needs review, slowing down, blocked, and high-risk lanes with quick intervention suggestions.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 xl:grid-cols-5">
            {pipelineColumns.map((column) => {
              const laneTeams = teams.filter((team) => team.state === column.state);
              return (
                <div key={column.state} className="rounded-2xl border border-border bg-muted/20 p-3">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground">{column.state}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{column.detail}</p>
                  </div>
                  <div className="space-y-3">
                    {laneTeams.length > 0 ? (
                      laneTeams.map((team) => <PipelineCard key={team.id} team={team} />)
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border bg-white p-4 text-xs text-muted-foreground">
                        No teams in this lane.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-purple-200 bg-purple-50 text-purple-700">
              Review bottleneck detection
            </Badge>
            <CardTitle className="mt-4 text-2xl">Execution blockers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {executionBlockers.map((blocker) => {
              const BlockerIcon = blocker.icon;
              return (
                <div key={blocker.title} className={cn("rounded-2xl border p-4", toneStyles(blocker.tone).border, toneStyles(blocker.tone).bg)}>
                  <div className="flex items-start gap-3">
                    <BlockerIcon className={cn("mt-0.5 size-5", toneStyles(blocker.tone).text)} />
                    <div>
                      <p className="font-semibold text-foreground">{blocker.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{blocker.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-amber-200 bg-amber-50 text-amber-700">Milestone Execution Tracker</Badge>
            <CardTitle className="mt-4 text-2xl">Deadline adherence & dependency health</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">Timeline-style execution view with confidence, delay risk, owner, and faculty review signals.</p>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            {milestoneTracker.map((item) => (
              <div key={item.name} className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-foreground">{item.name}</p><Badge className={item.risk === 'Critical' ? 'border-red-200 bg-red-50 text-red-700' : item.risk === 'High' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}>{item.risk}</Badge></div>
                <p className="mt-2 text-xs text-muted-foreground">Owner: {item.owner}</p>
                <div className="mt-3 flex items-end gap-2"><span className="text-2xl font-semibold text-foreground">{item.confidence}%</span><span className="pb-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">confidence</span></div>
                <Meter value={item.confidence} tone={item.confidence >= 80 ? 'healthy' : item.confidence >= 65 ? 'attention' : 'critical'} className="mt-3 h-2" />
                <p className="mt-3 text-xs text-muted-foreground">Status: {item.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">Execution Leaderboard</Badge>
            <CardTitle className="mt-4 text-2xl">Top teams by delivery intelligence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {leaderboard.map((entry) => (
              <div key={entry.team} className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-foreground">#{entry.rank} {entry.team}</p><span className="text-sm font-semibold text-foreground">{entry.score}</span></div>
                <p className="mt-2 text-xs text-muted-foreground">{entry.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Team Risk Matrix</Badge>
            <CardTitle className="mt-4 text-2xl">Quadrant-based risk visibility</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">High progress / low risk, high progress / high risk, low progress / high risk, and recovering lanes for the current cycle.</p>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            {riskQuadrants.map((item) => (
              <div key={item.label} className={cn("rounded-2xl border p-4", item.tone === "healthy" ? "border-emerald-200 bg-emerald-50" : item.tone === "attention" ? "border-amber-200 bg-amber-50" : item.tone === "critical" ? "border-red-200 bg-red-50" : "border-purple-200 bg-purple-50") }>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-2 text-xs text-muted-foreground">{item.teams}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="space-y-5 p-5">
            <Badge className="border-white/10 bg-white/5 text-white/70">Faculty intervention center</Badge>
            <h2 className="text-2xl font-semibold tracking-normal text-white">Immediate action paths for mentors</h2>
            <div className="grid gap-3">
              {interventionCenter.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-white/90">{item.label}</p><span className="text-xl font-semibold text-white">{item.count}</span></div>
                  <p className="mt-2 text-xs text-white/55">{item.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Execution consistency heatmap
            </Badge>
            <CardTitle className="mt-4 text-2xl">Weekly delivery matrix</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Submission intensity, review approvals, activity spikes, delivery gaps, missed milestones, and anomaly markers.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {teams.map((team) => {
              const tone = toneForState(team.state);
              return (
                <div key={`matrix-${team.id}`} className="grid gap-3 rounded-2xl border border-border bg-white p-4 lg:grid-cols-[220px_minmax(0,1fr)_120px] lg:items-center">
                  <div>
                    <p className="font-semibold text-foreground">{team.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{team.state}</p>
                  </div>
                  <ActivityHeatmap values={team.heatmap} tone={tone} />
                  <Badge className={toneStyles(tone).soft}>{team.confidence}% confidence</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="space-y-5 p-5">
            <Badge className="border-white/10 bg-white/5 text-white/70">
              Quick mentor workflows
            </Badge>
            <h2 className="text-2xl font-semibold tracking-normal text-white">
              Act without opening another screen.
            </h2>
            <div className="grid gap-3">
              {["Send warning", "Trigger checkpoint", "Request demo", "Schedule review", "Assign recovery plan", "Escalate project", "Flag inactive member"].map((action) => (
                <button
                  key={action}
                  type="button"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left text-sm text-white/78 transition hover:bg-white/[0.08]"
                >
                  <span>{action}</span>
                  <ArrowUpRight className="size-4" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-blue-200 bg-blue-50 text-blue-700">
              Delivery journey tracking
            </Badge>
            <CardTitle className="mt-4 text-2xl">Team evolution timelines</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Submission events, mentor reviews, IEEE milestones, viva checkpoints, escalation points, delays, and recovery moments.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {teams.map((team) => (
              <TimelineEvent key={`timeline-${team.id}`} team={team} />
            ))}
          </CardContent>
        </Card>

        <ActivityFeed
          title="Team operations activity"
          description="Recent workflow signals from the existing teams and batches module."
          items={module.activity}
        />
      </div>
    </section>
  );
}
