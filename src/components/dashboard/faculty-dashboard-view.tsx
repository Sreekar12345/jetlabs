import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Command,
  FileText,
  Gauge,
  Mic2,
  RadioTower,
  Rocket,
  SearchCheck,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users2,
  Zap,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { FacultyDashboardData } from "@/types/aoip";

type FacultyDashboardViewProps = {
  data: FacultyDashboardData;
};

type AlertTone = "critical" | "attention" | "healthy" | "insight";

const pulseItems = [
  {
    label: "Students needing intervention",
    value: "9",
    detail: "3 require faculty sync inside 72 hours",
    tone: "critical" as const,
    icon: ShieldAlert,
  },
  {
    label: "Review bottlenecks",
    value: "14",
    detail: "Aged queue is pressuring this week's SLA",
    tone: "attention" as const,
    icon: Clock3,
  },
  {
    label: "High-risk clusters",
    value: "3",
    detail: "AIML deployment and IEEE writing delays",
    tone: "critical" as const,
    icon: RadioTower,
  },
  {
    label: "IEEE blockers",
    value: "12",
    detail: "Methodology and references need workshop support",
    tone: "insight" as const,
    icon: FileText,
  },
  {
    label: "Viva readiness gaps",
    value: "18",
    detail: "Confidence is lower than project completion",
    tone: "attention" as const,
    icon: Mic2,
  },
  {
    label: "Healthy momentum",
    value: "61%",
    detail: "Teams with consistent proof-of-work rhythm",
    tone: "healthy" as const,
    icon: TrendingUp,
  },
];

const priorityCards = [
  {
    level: "Critical",
    title: "High-risk students",
    value: "9",
    change: "+3 vs last week",
    urgency: 91,
    recommendation: "Run mentor syncs before Friday and assign recovery checkpoints.",
    cta: "Open risk grid",
    tone: "critical" as const,
    icon: ShieldAlert,
  },
  {
    level: "Attention needed",
    title: "Delayed reviews",
    value: "14",
    change: "+5 queue items",
    urgency: 76,
    recommendation: "Use rapid review mode for low-risk evidence packets.",
    cta: "Start quick review",
    tone: "attention" as const,
    icon: ClipboardCheck,
  },
  {
    level: "Attention needed",
    title: "IEEE velocity drop",
    value: "12",
    change: "-8% completion velocity",
    urgency: 68,
    recommendation: "Schedule a focused IEEE structuring workshop this Friday.",
    cta: "Plan workshop",
    tone: "insight" as const,
    icon: BrainCircuit,
  },
  {
    level: "Healthy",
    title: "Strong project momentum",
    value: "11",
    change: "+4 teams improved",
    urgency: 34,
    recommendation: "Turn top team playbooks into cohort examples.",
    cta: "View leaders",
    tone: "healthy" as const,
    icon: Rocket,
  },
];

const studentSignals = [
  {
    name: "Rahul Verma",
    batch: "CSE-A",
    risk: "Critical",
    concern: 94,
    attendance: 48,
    submissions: 34,
    project: 41,
    research: 29,
    viva: 22,
    signals: ["2 missed submissions", "Attendance falling", "No mock-viva activity"],
    prediction: "High probability of delayed completion.",
    action: "Faculty sync within 3 days.",
  },
  {
    name: "Nisha Rao",
    batch: "AIML-B",
    risk: "At Risk",
    concern: 72,
    attendance: 68,
    submissions: 58,
    project: 63,
    research: 38,
    viva: 51,
    signals: ["IEEE method gap", "Low reference quality", "Slow review closure"],
    prediction: "Likely to pass build review but struggle in research defense.",
    action: "Assign IEEE checkpoint.",
  },
  {
    name: "Ayaan Khan",
    batch: "DS-A",
    risk: "Slowing",
    concern: 61,
    attendance: 74,
    submissions: 66,
    project: 71,
    research: 54,
    viva: 58,
    signals: ["Submission latency rising", "Deployment proof incomplete"],
    prediction: "Velocity loss could affect final approval.",
    action: "Send deployment reminder.",
  },
  {
    name: "Kavya Iyer",
    batch: "CSE-B",
    risk: "Healthy",
    concern: 24,
    attendance: 92,
    submissions: 89,
    project: 86,
    research: 78,
    viva: 81,
    signals: ["Consistent weekly proof", "Strong mentor response"],
    prediction: "High confidence for viva and final launch.",
    action: "Nominate for excellence board.",
  },
  {
    name: "Imran Shaikh",
    batch: "AIML-A",
    risk: "At Risk",
    concern: 69,
    attendance: 72,
    submissions: 49,
    project: 58,
    research: 44,
    viva: 39,
    signals: ["No recent demo evidence", "Weak viva confidence"],
    prediction: "Needs structured defense practice before panel review.",
    action: "Trigger intervention plan.",
  },
  {
    name: "Priya Menon",
    batch: "CSE-A",
    risk: "Healthy",
    concern: 18,
    attendance: 88,
    submissions: 91,
    project: 89,
    research: 74,
    viva: 83,
    signals: ["High contribution density", "Research draft improving"],
    prediction: "Likely final-evaluation leader.",
    action: "Share model submission.",
  },
];

const batchHealth = [
  { batch: "CSE-A", mentorLoad: "High", momentum: 84, risk: 18, reviewLoad: 12, velocity: 78, viva: 74 },
  { batch: "AIML-B", mentorLoad: "Critical", momentum: 61, risk: 38, reviewLoad: 18, velocity: 56, viva: 49 },
  { batch: "DS-A", mentorLoad: "Medium", momentum: 73, risk: 24, reviewLoad: 9, velocity: 69, viva: 66 },
  { batch: "ECE-C", mentorLoad: "Medium", momentum: 70, risk: 29, reviewLoad: 7, velocity: 64, viva: 58 },
];

const interventions = [
  {
    group: "Critical",
    title: "Team Pulse inactive since last sprint",
    reason: "Low contribution density and missed submission proof.",
    age: "4 days silent",
    prediction: "Likely deployment miss without direct sync.",
    action: "Schedule sync",
    tone: "critical" as const,
  },
  {
    group: "At Risk",
    title: "AIML-B IEEE completion velocity below threshold",
    reason: "Research documentation slowed after experiments.",
    age: "6 days since update",
    prediction: "Panel may question academic grounding.",
    action: "Assign checkpoint",
    tone: "attention" as const,
  },
  {
    group: "Slowing Down",
    title: "Three deployment links not reachable",
    reason: "Production readiness evidence is incomplete.",
    age: "2 days open",
    prediction: "Final submission approval could lock.",
    action: "Send reminder",
    tone: "insight" as const,
  },
  {
    group: "Inactive",
    title: "Two students have no viva simulation activity",
    reason: "Practice streak dropped while project work rose.",
    age: "9 days idle",
    prediction: "Defense confidence may trail build quality.",
    action: "Trigger practice plan",
    tone: "attention" as const,
  },
];

const effectiveness = [
  { label: "Avg review time", value: "1.8d", progress: 74, detail: "Tail queue needs rapid mode." },
  { label: "Student improvement", value: "68%", progress: 68, detail: "Post-feedback scores improved." },
  { label: "Project completion success", value: "82%", progress: 82, detail: "On pace for final review." },
  { label: "Viva success readiness", value: "71%", progress: 71, detail: "Needs panel simulation push." },
];

const quickActions: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Open review queue", href: "/faculty/review/review-queue", icon: ClipboardCheck },
  { label: "Schedule mentor sync", href: "/faculty/management/teams-batches", icon: Users2 },
  { label: "Launch quick review mode", href: "/faculty/review/quick-review", icon: Zap },
  { label: "Send batch-wide update", href: "/faculty/management/students", icon: Send },
  { label: "Export faculty insights", href: "/faculty/analytics", icon: ArrowUpRight },
];

const assistantActions: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Summarize weak students", icon: SearchCheck },
  { label: "Recommend interventions", icon: Target },
  { label: "Detect burnout patterns", icon: BellRing },
  { label: "Suggest viva focus areas", icon: Mic2 },
];

function toneStyles(tone: AlertTone) {
  if (tone === "critical") {
    return {
      border: "border-red-200",
      bg: "bg-red-50",
      text: "text-red-700",
      fill: "bg-red-500",
      soft: "bg-red-500/10 text-red-700 border-red-200",
    };
  }

  if (tone === "attention") {
    return {
      border: "border-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-700",
      fill: "bg-amber-500",
      soft: "bg-amber-500/10 text-amber-700 border-amber-200",
    };
  }

  if (tone === "healthy") {
    return {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      fill: "bg-emerald-500",
      soft: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    };
  }

  return {
    border: "border-indigo-200",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    fill: "bg-indigo-500",
    soft: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  };
}

function riskTone(risk: string): AlertTone {
  if (risk === "Critical") {
    return "critical";
  }

  if (risk === "At Risk" || risk === "Slowing") {
    return "attention";
  }

  return "healthy";
}

function MeterBar({
  value,
  tone = "insight",
  className,
}: {
  value: number;
  tone?: AlertTone;
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

function PulseCard({
  item,
}: {
  item: (typeof pulseItems)[number];
}) {
  const Icon = item.icon;
  const styles = toneStyles(item.tone);

  return (
    <div className={cn("rounded-2xl border bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]", styles.border)}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid size-10 place-items-center rounded-xl border", styles.soft)}>
          <Icon className="size-5" />
        </span>
        <p className="text-2xl font-semibold tracking-normal text-foreground">{item.value}</p>
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{item.label}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p>
    </div>
  );
}

function PriorityCard({
  item,
}: {
  item: (typeof priorityCards)[number];
}) {
  const Icon = item.icon;
  const styles = toneStyles(item.tone);

  return (
    <Card className={cn("overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(15,23,42,0.08)]", styles.border)}>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={cn("grid size-11 place-items-center rounded-xl border", styles.soft)}>
              <Icon className="size-5" />
            </span>
            <div>
              <Badge className={styles.soft}>{item.level}</Badge>
              <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
            </div>
          </div>
          <p className="text-4xl font-semibold tracking-normal text-foreground">{item.value}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Urgency score</span>
            <span className="font-semibold text-foreground">{item.urgency}%</span>
          </div>
          <MeterBar value={item.urgency} tone={item.tone} />
        </div>
        <div className={cn("rounded-2xl border p-3", styles.bg, styles.border)}>
          <p className={cn("text-xs font-semibold uppercase tracking-normal", styles.text)}>
            AI recommendation
          </p>
          <p className="mt-1 text-sm leading-6 text-foreground">{item.recommendation}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{item.change}</span>
          <Button variant="outline" size="sm" className="rounded-xl">
            {item.cta}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentIntelligenceCard({
  student,
}: {
  student: (typeof studentSignals)[number];
}) {
  const tone = riskTone(student.risk);
  const styles = toneStyles(tone);

  return (
    <details className={cn("group rounded-2xl border bg-white p-4 transition duration-200 open:shadow-[0_18px_45px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]", styles.border)}>
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={styles.soft}>{student.risk}</Badge>
              <span className="text-xs text-muted-foreground">{student.batch}</span>
            </div>
            <p className="mt-3 text-base font-semibold text-foreground">{student.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Faculty concern {student.concern}%
            </p>
          </div>
          <span className={cn("grid size-10 place-items-center rounded-xl border", styles.soft)}>
            <Gauge className="size-5" />
          </span>
        </div>
        <div className="mt-4 grid gap-2">
          {[
            ["Attendance", student.attendance],
            ["Submission", student.submissions],
            ["Project", student.project],
            ["Research", student.research],
            ["Viva", student.viva],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[82px_minmax(0,1fr)_34px] items-center gap-2 text-xs">
              <span className="text-muted-foreground">{label}</span>
              <MeterBar value={Number(value)} tone={tone} className="h-1.5" />
              <span className="text-right font-medium text-foreground">{value}%</span>
            </div>
          ))}
        </div>
      </summary>
      <div className="mt-4 space-y-3 rounded-2xl border border-border bg-muted/20 p-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Signals
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {student.signals.map((signal) => (
              <Badge key={signal} variant="outline" className="bg-white">
                {signal}
              </Badge>
            ))}
          </div>
        </div>
        <p className="text-sm leading-6 text-foreground">{student.prediction}</p>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">Recommended action</span>
          <span className="text-right text-sm font-semibold text-foreground">{student.action}</span>
        </div>
      </div>
    </details>
  );
}

function BatchHealthCard({ batch }: { batch: (typeof batchHealth)[number] }) {
  const tone = batch.risk >= 35 ? "critical" : batch.risk >= 25 ? "attention" : "healthy";
  const styles = toneStyles(tone);

  return (
    <Card className="transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">{batch.batch}</p>
            <p className="mt-1 text-xs text-muted-foreground">Faculty load: {batch.mentorLoad}</p>
          </div>
          <Badge className={styles.soft}>{batch.risk}% risk</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Momentum", batch.momentum],
            ["Velocity", batch.velocity],
            ["Viva", batch.viva],
            ["Review load", batch.reviewLoad * 5],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {label === "Review load" ? batch.reviewLoad : `${value}%`}
              </p>
            </div>
          ))}
        </div>
        <MeterBar value={batch.momentum} tone={tone} />
      </CardContent>
    </Card>
  );
}

export function FacultyDashboardView({ data }: FacultyDashboardViewProps) {
  const activeTeams = data.stats[0]?.value ?? "18";
  const pendingReviews = data.stats[1]?.value ?? "14";
  const atRiskProjects = data.stats[2]?.value ?? "5";
  const meanPerformance = data.stats[3]?.value ?? "78/100";
  const activeTeamCount = Number.parseInt(activeTeams, 10);
  const pendingReviewCount = Number.parseInt(pendingReviews, 10);
  const atRiskProjectCount = Number.parseInt(atRiskProjects, 10);
  const interventionCount = Number.isFinite(atRiskProjectCount)
    ? `${Math.max(atRiskProjectCount * 3, atRiskProjectCount)}`
    : "9";
  const ieeeBlockers = Number.isFinite(pendingReviewCount)
    ? `${Math.max(pendingReviewCount + 2, 4)}`
    : "12";
  const operationsPulse = pulseItems.map((item) => {
    if (item.label === "Students needing intervention") {
      return { ...item, value: interventionCount };
    }

    if (item.label === "Review bottlenecks") {
      return { ...item, value: pendingReviews };
    }

    if (item.label === "High-risk clusters") {
      return { ...item, value: atRiskProjects };
    }

    if (item.label === "IEEE blockers") {
      return { ...item, value: ieeeBlockers };
    }

    if (item.label === "Healthy momentum") {
      return { ...item, value: `${data.healthIndicators[0]?.progress ?? 61}%` };
    }

    return item;
  });
  const intelligenceCards = priorityCards.map((item) => {
    if (item.title === "High-risk students") {
      return { ...item, value: interventionCount };
    }

    if (item.title === "Delayed reviews") {
      return { ...item, value: pendingReviews };
    }

    if (item.title === "IEEE velocity drop") {
      return { ...item, value: ieeeBlockers };
    }

    if (item.title === "Strong project momentum") {
      return {
        ...item,
        value: Number.isFinite(activeTeamCount) && Number.isFinite(atRiskProjectCount)
          ? `${Math.max(activeTeamCount - atRiskProjectCount, 0)}`
          : item.value,
      };
    }

    return item;
  });

  return (
    <section className="space-y-8">
      <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)]">
        <CardContent className="grid gap-7 p-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.18fr)_360px] xl:items-stretch">
          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-2xl border border-white/10 bg-white text-2xl font-semibold text-slate-950">
                DM
              </div>
              <div>
                <Badge className="border-white/10 bg-white/5 text-white/70">Faculty operations lead</Badge>
                <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white">Dr. Mehta</h1>
                <p className="mt-1 text-sm leading-6 text-white/60">
                  AI/ML Mentor - 7 Batches - 74 Students
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Faculty efficiency", "92%", "Reviews cleared with high signal"],
                ["Review turnaround", "1.8d", "Healthy, tail queue rising"],
                ["Mentorship rating", "4.8", "Student feedback average"],
                ["Intervention success", "64%", "Recovered at-risk teams"],
              ].map(([label, value, detail]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs text-white/50">{label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-normal text-white">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white text-slate-950">
            <div className="border-b border-slate-200 p-5">
              <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
                <RadioTower className="size-3" />
                Academic Operations Pulse
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">
                Real-time batch intelligence and intervention map.
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Prioritized signals across reviews, risk clusters, IEEE blockers, and viva readiness gaps.
              </p>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {operationsPulse.map((item) => (
                <PulseCard key={item.label} item={item} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <Badge className="border-white/10 bg-white/5 text-white/70">Quick actions</Badge>
              <div className="mt-4 grid gap-3">
                {quickActions.map((action) => {
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

            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                <Sparkles className="size-4" />
                AI Faculty Insight
              </p>
              <p className="mt-3 text-sm leading-7 text-emerald-50/80">
                CSE-A has strong project momentum but weak IEEE completion velocity. Conduct a focused IEEE structuring workshop this Friday.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {intelligenceCards.map((item) => (
          <PriorityCard key={item.title} item={item} />
        ))}
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.12fr)_420px]">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                  <Command className="size-3" />
                  Student Intelligence Grid
                </Badge>
                <CardTitle className="mt-4 text-2xl">Risk clustering and intervention preview</CardTitle>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                  Every card compresses attendance momentum, submission consistency, project progress, research progress, viva confidence, and faculty concern.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Critical", "At Risk", "Slowing", "Inactive", "Healthy"].map((filter) => (
                  <Badge key={filter} variant="outline" className="bg-white">
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {studentSignals.map((student) => (
              <StudentIntelligenceCard key={student.name} student={student} />
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="space-y-5 p-5">
            <Badge className="border-white/10 bg-white/5 text-white/70">
              <Bot className="size-3" />
              Faculty Intelligence Assistant
            </Badge>
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-white">
                3 AIML teams likely to miss deployment deadline.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Prediction is based on slow review cycles, low submission consistency, and reduced activity velocity.
              </p>
            </div>
            <div className="grid gap-3">
              {assistantActions.map((action) => {
                const AssistantIcon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left text-sm text-white/78 transition hover:bg-white/[0.08]"
                  >
                    <span className="flex items-center gap-2">
                      <AssistantIcon className="size-4 text-blue-200" />
                      {action.label}
                    </span>
                    <ArrowUpRight className="size-4" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-5">
          <AnalyticsChart
            title="Execution Flow Intelligence"
            description="Submission velocity, approval bottlenecks, faculty review load, and escalation pressure by week."
            data={data.submissionSeries}
            type="bar"
            series={[
              { key: "submitted", label: "Submitted", color: "#0f766e" },
              { key: "reviewed", label: "Reviewed", color: "#111827" },
              { key: "escalated", label: "Escalated", color: "#f97316" },
            ]}
          />

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="grid gap-4 p-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
              <div>
                <Badge className="border-amber-200 bg-white text-amber-700">AI observation</Badge>
                <p className="mt-3 text-2xl font-semibold tracking-normal text-amber-950">
                  Submission rate dropped after internal exams.
                </p>
              </div>
              <p className="text-sm leading-7 text-amber-900">
                The next bottleneck is not student intent; it is delayed evidence review. Low-risk approvals should move into rapid workflow today.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
              Rapid Faculty Workflow
            </Badge>
            <CardTitle className="mt-4 text-2xl">Quick review mode</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Approve, comment, assign improvements, mark risk, and trigger follow-ups without leaving the command center.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {data.quickReview.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-border bg-white text-slate-700">
                    {index === 0 ? <CheckCircle2 className="size-5" /> : index === 1 ? <AlertTriangle className="size-5" /> : <Gauge className="size-5" />}
                  </span>
                  <Badge variant="outline" className="bg-white">Fast lane</Badge>
                </div>
                <p className="mt-4 font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    {item.actionLabel}
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    Voice comment
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-blue-200 bg-blue-50 text-blue-700">Batch Health Monitoring</Badge>
            <CardTitle className="mt-4 text-2xl">Operational batch dashboards</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Execution momentum, risk percentage, review load, completion velocity, faculty workload, and viva readiness.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            {batchHealth.map((batch) => (
              <BatchHealthCard key={batch.batch} batch={batch} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Engineering Excellence Board
            </Badge>
            <CardTitle className="mt-4 text-2xl">Top performing teams</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Project score, IEEE progress, deployment readiness, contribution momentum, innovation score, and faculty sentiment.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {data.topTeams.map((team, index) => {
              const score = Number(team.score.split("/")[0] ?? team.progress);
              const tone = team.risk === "High" ? "critical" : team.risk === "Medium" ? "attention" : "healthy";
              return (
                <div key={team.id} className="rounded-2xl border border-border bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{team.team}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{team.domain}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={toneStyles(tone).soft}>{team.risk} risk</Badge>
                      <Badge variant="outline" className="bg-white">{team.score}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {[
                      ["Project", team.progress],
                      ["IEEE", Math.max(52, score - 9)],
                      ["Deploy", Math.max(48, score - 5)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-border bg-muted/20 p-3">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold text-foreground">{value}%</span>
                        </div>
                        <MeterBar value={Number(value)} tone={tone} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <Badge className="border-red-200 bg-red-50 text-red-700">Intervention Center</Badge>
            <CardTitle className="mt-4 text-2xl">Issues grouped by operational urgency</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Reason, inactivity window, risk prediction, suggested intervention, and one-click faculty action.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {interventions.map((item) => {
              const styles = toneStyles(item.tone);
              return (
                <div key={item.title} className={cn("rounded-2xl border bg-white p-4", styles.border)}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Badge className={styles.soft}>{item.group}</Badge>
                      <p className="mt-3 font-semibold text-foreground">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.reason}</p>
                    </div>
                    <Button size="sm" className="rounded-xl">
                      {item.action}
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">Time since activity</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{item.age}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">Risk prediction</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{item.prediction}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <AnalyticsChart
            title="Performance intelligence"
            description="Cohort score movement against the target band, with review feedback effects visible by month."
            data={data.performanceSeries}
            type="line"
            series={[
              { key: "performance", label: "Performance", color: "#4f46e5" },
              { key: "target", label: "Target", color: "#111827" },
            ]}
          />

          <Card>
            <CardHeader className="border-b border-border pb-5">
              <Badge className="border-slate-200 bg-white text-slate-700">Mentorship Effectiveness</Badge>
              <CardTitle className="mt-4 text-2xl">Faculty productivity analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {effectiveness.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <p className="text-xl font-semibold text-foreground">{item.value}</p>
                  </div>
                  <Progress value={item.progress} className="h-2 bg-slate-200" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <AnalyticsChart
          title="Academic backlog pressure"
          description="Open academic backlogs versus clears so faculty can plan intervention bandwidth."
          data={data.backlogSeries}
          type="area"
          series={[
            { key: "open", label: "Open", color: "#ef4444" },
            { key: "cleared", label: "Cleared", color: "#10b981" },
          ]}
        />
        <ActivityFeed
          title="Operations activity stream"
          description="Material academic events that changed review workload, risk, or evaluation readiness."
          items={data.activity}
        />
      </div>

      <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eef2ff_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
              Command center summary
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">
              {data.header.title}: {activeTeams} active teams, {pendingReviews} pending reviews, {atRiskProjects} at-risk projects.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              Mean cohort performance is {meanPerformance}. The highest leverage next move is clearing low-risk reviews and running IEEE intervention for documentation-heavy teams.
            </p>
          </div>
          <Button asChild className="rounded-xl">
            <Link href="/faculty/review/review-queue">
              Open faculty control queue
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
