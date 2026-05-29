import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  BookOpenCheck,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Command,
  FileText,
  Flame,
  Gauge,
  HeartPulse,
  LineChart,
  MailWarning,
  MessageSquareText,
  RadioTower,
  Rocket,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  Users2,
  Video,
  Zap,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ModulePageData } from "@/types/aoip";

type RiskState = "Healthy" | "Slowing Down" | "At Risk" | "Critical";
type Tone = "healthy" | "attention" | "critical" | "insight";

type StudentSignal = {
  id: string;
  name: string;
  roll: string;
  batch: string;
  department: string;
  avatar: string;
  risk: RiskState;
  confidence: number;
  priority: string;
  concern: string;
  streak: string;
  reputation: string;
  attendance: number;
  submissions: number;
  velocity: number;
  ieee: number;
  viva: number;
  backlog: string;
  project: string;
  milestone: string;
  deployment: string;
  bottleneck: string;
  trend: string;
  prediction: string;
  recommendation: string;
  signals: string[];
  activity: number[];
};

type FacultyStudentIntelligenceViewProps = {
  module: ModulePageData;
};

const facultyActions: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Launch quick review", href: "/faculty/review/quick-review", icon: Zap },
  { label: "Export intervention report", href: "/faculty/analytics", icon: FileText },
  { label: "Schedule mentor sync", href: "/faculty/management/teams-batches", icon: CalendarClock },
  { label: "AI insights", href: "/faculty/dashboard", icon: Bot },
  { label: "Open high-risk students", href: "/faculty/monitoring/project-health", icon: ShieldAlert },
];

const filterGroups = [
  {
    label: "Risk",
    icon: ShieldAlert,
    items: ["Critical", "High risk", "Slowing down", "Healthy"],
  },
  {
    label: "Execution",
    icon: Rocket,
    items: ["No submissions", "Delayed teams", "Low paper progress", "Weak viva readiness"],
  },
  {
    label: "Behavior",
    icon: HeartPulse,
    items: ["Attendance decline", "Inactive students", "Sudden slowdown", "Burnout risk"],
  },
  {
    label: "Project",
    icon: BookOpenCheck,
    items: ["Deployment pending", "IEEE delayed", "Viva not started"],
  },
];

const savedViews = ["My intervention queue", "CSE-A risk board", "IEEE delays", "Viva unreadiness"];

const students: StudentSignal[] = [
  {
    id: "stu-1",
    name: "Rahul Verma",
    roll: "CSE-1824",
    batch: "CSE-A",
    department: "Computer Science",
    avatar: "RV",
    risk: "Critical",
    confidence: 92,
    priority: "P0",
    concern: "Faculty concern high",
    streak: "0 days",
    reputation: "Execution unstable",
    attendance: 48,
    submissions: 31,
    velocity: 38,
    ieee: 26,
    viva: 18,
    backlog: "2 active",
    project: "Smart Attendance Analytics",
    milestone: "Baseline validation blocked",
    deployment: "Not started",
    bottleneck: "No recent submission evidence",
    trend: "Attendance dropped 14% in 3 weeks",
    prediction: "Likely delayed submission risk.",
    recommendation: "Faculty intervention within 5 days.",
    signals: ["Attendance decline", "No viva practice", "IEEE stagnant"],
    activity: [1, 0, 2, 1, 0, 0, 1, 0, 0, 1, 0, 0],
  },
  {
    id: "stu-2",
    name: "Riya Kapoor",
    roll: "AIML-1907",
    batch: "AIML-B",
    department: "AI and ML",
    avatar: "RK",
    risk: "Healthy",
    confidence: 86,
    priority: "P3",
    concern: "High potential",
    streak: "18 days",
    reputation: "Innovation candidate",
    attendance: 91,
    submissions: 94,
    velocity: 89,
    ieee: 78,
    viva: 82,
    backlog: "Clear",
    project: "Crop Disease Detection",
    milestone: "Deployment polish",
    deployment: "Preview live",
    bottleneck: "Needs publication tightening",
    trend: "Execution velocity up 11%",
    prediction: "Likely showcase candidate.",
    recommendation: "Nominate for innovation showcase.",
    signals: ["Strong consistency", "Fast approvals", "High project velocity"],
    activity: [6, 8, 7, 9, 8, 9, 10, 8, 9, 10, 9, 10],
  },
  {
    id: "stu-3",
    name: "Ayaan Khan",
    roll: "DS-1162",
    batch: "DS-A",
    department: "Data Science",
    avatar: "AK",
    risk: "Slowing Down",
    confidence: 67,
    priority: "P2",
    concern: "Momentum fading",
    streak: "4 days",
    reputation: "Recoverable",
    attendance: 76,
    submissions: 64,
    velocity: 58,
    ieee: 51,
    viva: 46,
    backlog: "Clear",
    project: "Student Risk Scoring",
    milestone: "Model evaluation",
    deployment: "Pending",
    bottleneck: "Review update overdue",
    trend: "Submission latency rising",
    prediction: "Velocity loss could affect final approval.",
    recommendation: "Assign deployment checkpoint.",
    signals: ["Delayed team", "Deployment pending", "Viva weak"],
    activity: [5, 6, 6, 5, 5, 4, 4, 3, 3, 3, 2, 2],
  },
  {
    id: "stu-4",
    name: "Nisha Rao",
    roll: "CSE-1749",
    batch: "CSE-B",
    department: "Computer Science",
    avatar: "NR",
    risk: "At Risk",
    confidence: 74,
    priority: "P1",
    concern: "Research bottleneck",
    streak: "6 days",
    reputation: "Strong builder, weak writing",
    attendance: 82,
    submissions: 71,
    velocity: 66,
    ieee: 39,
    viva: 53,
    backlog: "Clear",
    project: "Healthcare Triage Assistant",
    milestone: "IEEE methodology",
    deployment: "Preview unstable",
    bottleneck: "Low paper progress",
    trend: "Research velocity flat for 2 weeks",
    prediction: "Build may pass, academic defense may struggle.",
    recommendation: "Assign IEEE checkpoint and mentor note.",
    signals: ["IEEE delayed", "Review bottleneck", "Weak viva readiness"],
    activity: [5, 6, 5, 6, 5, 4, 4, 4, 4, 3, 3, 3],
  },
  {
    id: "stu-5",
    name: "Imran Shaikh",
    roll: "ECE-1420",
    batch: "ECE-C",
    department: "Electronics",
    avatar: "IS",
    risk: "At Risk",
    confidence: 71,
    priority: "P1",
    concern: "Inactive build proof",
    streak: "2 days",
    reputation: "Needs structure",
    attendance: 69,
    submissions: 49,
    velocity: 52,
    ieee: 44,
    viva: 37,
    backlog: "1 active",
    project: "IoT Energy Monitor",
    milestone: "Hardware integration",
    deployment: "Blocked",
    bottleneck: "No recent demo evidence",
    trend: "Activity dropped after lab review",
    prediction: "Hardware proof may miss review window.",
    recommendation: "Schedule sync and request demo update.",
    signals: ["Inactive student", "Deployment pending", "Backlog pressure"],
    activity: [6, 5, 5, 3, 4, 3, 2, 2, 1, 1, 2, 1],
  },
  {
    id: "stu-6",
    name: "Priya Menon",
    roll: "CSE-1615",
    batch: "CSE-A",
    department: "Computer Science",
    avatar: "PM",
    risk: "Healthy",
    confidence: 89,
    priority: "P3",
    concern: "Leader track",
    streak: "21 days",
    reputation: "Reliable executor",
    attendance: 88,
    submissions: 91,
    velocity: 87,
    ieee: 73,
    viva: 79,
    backlog: "Clear",
    project: "Academic Workflow OS",
    milestone: "Final validation",
    deployment: "Live",
    bottleneck: "Needs final proofbook export",
    trend: "Review responsiveness high",
    prediction: "Likely final-evaluation leader.",
    recommendation: "Use as model submission for batch.",
    signals: ["Strong consistency", "Fast faculty response", "High contribution"],
    activity: [7, 8, 8, 9, 8, 9, 8, 9, 9, 10, 9, 10],
  },
];

const attentionQueue = [
  {
    student: "Rahul Verma",
    priority: "P0",
    reason: "Attendance decline plus no viva practice",
    action: "Schedule sync",
    tone: "critical" as const,
  },
  {
    student: "Nisha Rao",
    priority: "P1",
    reason: "IEEE methodology stagnant",
    action: "Assign checkpoint",
    tone: "attention" as const,
  },
  {
    student: "Imran Shaikh",
    priority: "P1",
    reason: "No deployment proof after lab review",
    action: "Request update",
    tone: "attention" as const,
  },
  {
    student: "Ayaan Khan",
    priority: "P2",
    reason: "Team velocity slowing",
    action: "Send reminder",
    tone: "insight" as const,
  },
];

const momentumSignals = [
  { label: "Weekly execution score", value: 78, trend: "+4", icon: LineChart },
  { label: "Submission streak", value: 83, trend: "83%", icon: Flame },
  { label: "Research velocity", value: 61, trend: "-8", icon: BookOpenCheck },
  { label: "Faculty responsiveness", value: 86, trend: "+9", icon: MessageSquareText },
  { label: "Recovery momentum", value: 64, trend: "+6", icon: HeartPulse },
];

const mentorshipInsights: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Likely delayed submission risk", icon: AlertTriangle },
  { label: "Faculty intervention within 5 days", icon: BellRing },
  { label: "Assign recovery checkpoint", icon: Target },
  { label: "Trigger mock viva", icon: Video },
];

const behavioralRiskStates: Array<{
  state: RiskState;
  detail: string;
  icon: LucideIcon;
}> = [
  { state: "Healthy", detail: "Consistent submissions and strong execution.", icon: CheckCircle2 },
  { state: "Slowing Down", detail: "Reduced activity patterns detected.", icon: TrendingDown },
  { state: "At Risk", detail: "Multiple weak indicators across project and academics.", icon: MailWarning },
  { state: "Critical", detail: "High probability of project failure or detention.", icon: ShieldAlert },
];

function toneForRisk(risk: RiskState): Tone {
  if (risk === "Critical") {
    return "critical";
  }

  if (risk === "At Risk" || risk === "Slowing Down") {
    return "attention";
  }

  return "healthy";
}

function toneStyles(tone: Tone) {
  if (tone === "critical") {
    return {
      border: "border-red-200",
      bg: "bg-red-50",
      text: "text-red-700",
      fill: "bg-red-500",
      soft: "border-red-200 bg-red-50 text-red-700",
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

  if (tone === "healthy") {
    return {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      fill: "bg-emerald-500",
      soft: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    border: "border-indigo-200",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    fill: "bg-indigo-500",
    soft: "border-indigo-200 bg-indigo-50 text-indigo-700",
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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

function ActivityHeat({ values, tone }: { values: number[]; tone: Tone }) {
  const fillClass = toneStyles(tone).fill;

  return (
    <div className="grid grid-cols-12 gap-1">
      {values.map((value, index) => (
        <span
          key={`${value}-${index + 1}`}
          className={cn(
            "h-7 rounded-md border border-white/70",
            value >= 8 ? fillClass : value >= 5 ? "bg-slate-300" : value >= 2 ? "bg-slate-200" : "bg-slate-100",
          )}
        />
      ))}
    </div>
  );
}

function FilterGroup({ group }: { group: (typeof filterGroups)[number] }) {
  const Icon = group.icon;

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="size-4 text-muted-foreground" />
        {group.label}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {group.items.map((item) => (
          <button
            key={item}
            type="button"
            className="rounded-full border border-border bg-muted/25 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-slate-300 hover:bg-white hover:text-foreground"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function StudentIntelligenceCard({ student }: { student: StudentSignal }) {
  const tone = toneForRisk(student.risk);
  const styles = toneStyles(tone);
  const executionMetrics: Array<{
    label: string;
    value: string;
    meter: number;
    icon: LucideIcon;
  }> = [
    { label: "Attendance", value: `${student.attendance}%`, meter: student.attendance, icon: TrendingDown },
    { label: "Submissions", value: `${student.submissions}%`, meter: student.submissions, icon: ClipboardCheck },
    { label: "Project velocity", value: `${student.velocity}%`, meter: student.velocity, icon: Rocket },
    { label: "IEEE", value: `${student.ieee}%`, meter: student.ieee, icon: BookOpenCheck },
    { label: "Viva", value: `${student.viva}%`, meter: student.viva, icon: Video },
    {
      label: "Backlog",
      value: student.backlog,
      meter: student.backlog === "Clear" ? 100 : 42,
      icon: AlertTriangle,
    },
  ];

  return (
    <details className={cn("group rounded-3xl border bg-white p-4 transition duration-200 open:shadow-[0_20px_55px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(15,23,42,0.07)]", styles.border)}>
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_320px] xl:items-start">
          <div className="flex gap-4">
            <Avatar className="size-14 border border-border">
              <AvatarFallback className="bg-slate-950 text-sm font-semibold text-white">
                {student.avatar || initials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={styles.soft}>{student.risk}</Badge>
                <Badge variant="outline" className="bg-white">{student.priority}</Badge>
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">{student.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {student.roll} - {student.batch} - {student.department}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Execution streak</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{student.streak}</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Reputation</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{student.reputation}</p>
                </div>
                <div className={cn("rounded-2xl border p-3", styles.bg, styles.border)}>
                  <p className={cn("text-xs", styles.text)}>Faculty concern</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{student.concern}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {executionMetrics.map((metric) => {
                const SignalIcon = metric.icon;
                return (
                  <div key={metric.label} className="rounded-2xl border border-border bg-muted/20 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <SignalIcon className="size-3.5" />
                        {metric.label}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {metric.value}
                      </span>
                    </div>
                    <Meter value={metric.meter} tone={tone} className="h-1.5" />
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border bg-white p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Weekly execution intensity</p>
                <span className="text-xs text-muted-foreground">{student.trend}</span>
              </div>
              <ActivityHeat values={student.activity} tone={tone} />
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-3">
              <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                AI warning
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">{student.prediction}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className={cn("rounded-2xl border p-4", styles.bg, styles.border)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn("text-xs font-semibold uppercase tracking-normal", styles.text)}>
                    Risk prediction
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
                    {student.confidence}%
                  </p>
                </div>
                <Gauge className={cn("size-5", styles.text)} />
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground">{student.recommendation}</p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-semibold text-foreground">{student.project}</p>
              <p className="mt-1 text-xs text-muted-foreground">{student.milestone}</p>
              <div className="mt-3 grid gap-2">
                {[
                  ["Deployment", student.deployment],
                  ["Bottleneck", student.bottleneck],
                  ["Priority", student.priority],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-right font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </summary>

      <div className="mt-5 grid gap-4 border-t border-border pt-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-2xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Behavioral signals
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {student.signals.map((signal) => (
              <Badge key={signal} variant="outline" className="bg-white">
                {signal}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {["Open profile", "Send warning", "Schedule meeting", "Trigger intervention", "Add faculty note", "Request review update"].map((action) => (
            <Button key={action} variant="outline" size="sm" className="rounded-xl">
              {action}
            </Button>
          ))}
        </div>
      </div>
    </details>
  );
}

function AttentionQueueCard({ item }: { item: (typeof attentionQueue)[number] }) {
  const styles = toneStyles(item.tone);

  return (
    <div className={cn("rounded-2xl border bg-white p-4", styles.border)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge className={styles.soft}>{item.priority}</Badge>
            <span className="text-xs text-muted-foreground">{item.student}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">{item.reason}</p>
        </div>
        <Button size="sm" className="rounded-xl">
          {item.action}
        </Button>
      </div>
    </div>
  );
}

export function FacultyStudentIntelligenceView({
  module,
}: FacultyStudentIntelligenceViewProps) {
  const monitoredStudents = module.stats[0]?.value ?? "46";
  const attentionRequired = module.stats[1]?.value ?? "7";
  const healthyCadence = module.stats[2]?.value ?? "83%";
  const mentorCoverage = module.stats[3]?.value ?? "100%";
  const criticalCount = students.filter((student) => student.risk === "Critical").length;
  const atRiskCount = students.filter((student) => student.risk === "At Risk").length;
  const headerMetrics: Array<{ label: string; value: string; icon: LucideIcon }> = [
    { label: "Live monitored", value: monitoredStudents, icon: Users2 },
    { label: "High-risk", value: `${criticalCount + atRiskCount}`, icon: ShieldAlert },
    { label: "Review queue", value: attentionRequired, icon: ClipboardCheck },
  ];

  return (
    <section className="space-y-8">
      <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white shadow-[0_28px_90px_rgba(15,23,42,0.16)]">
        <CardContent className="grid gap-7 p-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
          <div className="space-y-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <Badge className="border-white/10 bg-white/5 text-white/70">
                  <Command className="size-3" />
                  Faculty intelligence system
                </Badge>
                <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white">
                  Student Intelligence
                </h1>
                <p className="mt-3 text-sm leading-7 text-white/65 sm:text-base">
                  Monitor execution, academic stability, project momentum, and intervention risks across all batches.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                {headerMetrics.map((metric) => {
                  const MetricIcon = metric.icon;
                  return (
                    <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <MetricIcon className="size-4 text-white/55" />
                      <p className="mt-3 text-2xl font-semibold tracking-normal text-white">{metric.value}</p>
                      <p className="mt-1 text-xs text-white/50">{metric.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Healthy cadence", healthyCadence, "Share maintaining weekly momentum"],
                ["Mentor coverage", mentorCoverage, "Every student has an owner"],
                ["AI confidence", "88%", "Risk predictions mapped to signals"],
                ["Intervention SLA", "5d", "Recommended response window"],
              ].map(([label, value, detail]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-white/50">{label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-normal text-white">{value}</p>
                  <p className="mt-2 text-xs leading-5 text-white/50">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <Badge className="border-white/10 bg-white/5 text-white/70">Quick faculty actions</Badge>
            <div className="mt-4 grid gap-3">
              {facultyActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Button
                    key={action.label}
                    asChild
                    variant="secondary"
                    className="h-11 justify-between rounded-xl bg-white text-slate-950 hover:bg-white/90"
                  >
                    <Link href={action.href}>
                      <span className="flex items-center gap-2">
                        <ActionIcon className="size-4" />
                        {action.label}
                      </span>
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-12 rounded-2xl border-border bg-muted/30 pl-11 text-sm shadow-none"
                  placeholder="Command filter students by risk, behavior, project, or intervention need..."
                />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {filterGroups.map((group) => (
                  <FilterGroup key={group.label} group={group} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <Badge className="border-indigo-200 bg-white text-indigo-700">
                <Sparkles className="size-3" />
                Smart AI filtering
              </Badge>
              <p className="mt-3 text-sm leading-6 text-indigo-950">
                Suggested view: students with viva unreadiness, stalled IEEE progress, and falling activity.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {savedViews.map((view) => (
                  <Badge key={view} variant="outline" className="bg-white text-indigo-700">
                    {view}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="space-y-5 p-5">
            <Badge className="border-white/10 bg-white/5 text-white/70">
              <Bot className="size-3" />
              AI Mentorship Intelligence
            </Badge>
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-white">
                Rahul Verma is the highest priority intervention this week.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Signals: attendance dropped 14% in 3 weeks, no viva practice activity, and IEEE progress is stagnant.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {mentorshipInsights.map((insight) => {
                const InsightIcon = insight.icon;
                return (
                  <button
                    key={insight.label}
                    type="button"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left text-sm text-white/78 transition hover:bg-white/[0.08]"
                  >
                    <span className="flex items-center gap-2">
                      <InsightIcon className="size-4 text-blue-200" />
                      {insight.label}
                    </span>
                    <ArrowUpRight className="size-4" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-red-200 bg-red-50 text-red-700">
              Faculty Attention Queue
            </Badge>
            <CardTitle className="mt-4 text-2xl">Auto-ranked intervention queue</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Ranked by risk severity, delays, inactivity, viva unreadiness, and research stagnation.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {attentionQueue.map((item) => (
              <AttentionQueueCard key={item.student} item={item} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {momentumSignals.map((signal) => {
          const Icon = signal.icon;
          return (
            <Card key={signal.label} className="transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-border bg-muted/30">
                    <Icon className="size-5 text-slate-700" />
                  </span>
                  <Badge className="border-blue-200 bg-blue-50 text-blue-700">{signal.trend}</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{signal.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
                    {signal.value}%
                  </p>
                </div>
                <Progress value={signal.value} className="h-2 bg-slate-200" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                <RadioTower className="size-3" />
                Live student intelligence cards
              </Badge>
              <CardTitle className="mt-4 text-2xl">Monitored engineering execution profiles</CardTitle>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                Each profile combines identity, behavioral risk, execution health, project intelligence, and faculty action paths.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Department comparison", "Batch mode", "Saved views", "AI sort"].map((item) => (
                <Badge key={item} variant="outline" className="bg-white">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {students.map((student) => (
            <StudentIntelligenceCard key={student.id} student={student} />
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcff_55%,#eef2ff_100%)]">
          <CardContent className="space-y-5 p-5">
            <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
              Behavioral Risk Intelligence
            </Badge>
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">
              Risk is now explained by behavior, not just labeled.
            </h2>
            <div className="grid gap-3">
              {behavioralRiskStates.map((item) => {
                const StateIcon = item.icon;
                const tone = item.state === "Healthy" ? "healthy" : item.state === "Critical" ? "critical" : "attention";
                return (
                  <div key={item.state} className={cn("rounded-2xl border p-4", toneStyles(tone).border, toneStyles(tone).bg)}>
                    <div className="flex items-center gap-3">
                      <StateIcon className={cn("size-5", toneStyles(tone).text)} />
                      <div>
                        <p className="font-semibold text-foreground">{item.state}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <ActivityFeed
          title="Recent mentorship activity"
          description="Signals from the existing faculty student-management workflow."
          items={module.activity}
        />
      </div>
    </section>
  );
}
