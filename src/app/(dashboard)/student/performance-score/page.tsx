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

const headerStats = [
  { label: "Current rank", value: "#3", detail: "in batch", icon: Trophy },
  { label: "Percentile", value: "Top 12%", detail: "engineering profile", icon: Crown },
  { label: "Weekly growth", value: "+6", detail: "this month", icon: TrendingUp },
  { label: "Streak", value: "14-day", detail: "consistency", icon: Flame },
];

const strengths = ["Strong project execution", "Excellent consistency"];
const risks = ["Low research output", "Weak IEEE contribution"];

const dimensions: Dimension[] = [
  {
    label: "Project Execution",
    score: 91,
    trend: "+8",
    benchmark: "Top 15% in batch",
    recommendation: "Keep shipping weekly evidence with demo links.",
    icon: Rocket,
    tone: "bg-emerald-500",
  },
  {
    label: "Technical Depth",
    score: 84,
    trend: "+4",
    benchmark: "Above department average",
    recommendation: "Add architecture tradeoffs to weekly notes.",
    icon: Code2,
    tone: "bg-blue-500",
  },
  {
    label: "Research Contribution",
    score: 62,
    trend: "-2",
    benchmark: "Top 40% in research",
    recommendation: "Complete IEEE draft and cite benchmark evidence.",
    icon: BookOpenCheck,
    tone: "bg-orange-500",
  },
  {
    label: "Consistency",
    score: 93,
    trend: "+5",
    benchmark: "Faster than 82% of batch",
    recommendation: "Protect the current submission rhythm.",
    icon: Flame,
    tone: "bg-rose-500",
  },
  {
    label: "Viva Readiness",
    score: 71,
    trend: "+3",
    benchmark: "Slightly above average",
    recommendation: "Run 2 mock-viva simulations this week.",
    icon: MessageSquareText,
    tone: "bg-purple-500",
  },
  {
    label: "Deployment Readiness",
    score: 78,
    trend: "+7",
    benchmark: "Top 25% for product proof",
    recommendation: "Finish production environment checklist.",
    icon: Gauge,
    tone: "bg-cyan-500",
  },
  {
    label: "Collaboration",
    score: 82,
    trend: "+2",
    benchmark: "Strong peer review signal",
    recommendation: "Document ownership across final deliverables.",
    icon: Users2,
    tone: "bg-indigo-500",
  },
  {
    label: "Leadership",
    score: 76,
    trend: "+1",
    benchmark: "Mentor-visible ownership",
    recommendation: "Lead the next faculty demo narrative.",
    icon: Medal,
    tone: "bg-amber-500",
  },
  {
    label: "Documentation Quality",
    score: 58,
    trend: "-4",
    benchmark: "Below department average",
    recommendation: "Update README, IEEE appendix, and API notes.",
    icon: ClipboardCheck,
    tone: "bg-slate-700",
  },
];

const weeklyCells = [
  2, 4, 3, 5, 7, 6, 8,
  3, 4, 6, 5, 8, 7, 9,
  1, 3, 5, 6, 7, 9, 8,
  4, 5, 7, 8, 8, 9, 10,
  3, 6, 6, 7, 9, 10, 9,
  5, 7, 8, 8, 10, 9, 10,
].map((value, index) => ({ id: `week-cell-${index + 1}`, value }));

const growthEvents = [
  {
    week: "W1",
    score: 68,
    title: "Problem validation completed",
    detail: "Scope clarity improved project execution index.",
  },
  {
    week: "W2",
    score: 73,
    title: "Repository activity increased",
    detail: "Build streak started after API and model work landed.",
  },
  {
    week: "W3",
    score: 78,
    title: "Faculty feedback closed",
    detail: "Review completion raised consistency and ownership signals.",
  },
  {
    week: "W4",
    score: 84,
    title: "Deployment preview verified",
    detail: "Product-readiness milestone unlocked a high-impact boost.",
  },
  {
    week: "W5",
    score: 86,
    title: "Achievement proof added",
    detail: "Portfolio strength improved ranking stability.",
  },
];

const streaks = [
  { label: "Submission streak", value: "14 days", progress: 93, icon: Flame },
  { label: "Weekly consistency", value: "8/9", progress: 89, icon: ListChecks },
  { label: "Research streak", value: "3 weeks", progress: 61, icon: BookOpenCheck },
  { label: "Build streak", value: "22 commits", progress: 86, icon: GitBranch },
  { label: "Practice streak", value: "4 drills", progress: 58, icon: MessageSquareText },
];

const healthFactors = [
  { label: "Backlogs", value: "Low", state: "Healthy" },
  { label: "Deadlines missed", value: "0", state: "Elite" },
  { label: "Weekly activity", value: "High", state: "Healthy" },
  { label: "Progress velocity", value: "+12%", state: "Elite" },
  { label: "Review completion", value: "89%", state: "Healthy" },
];

const actions = [
  {
    priority: "High impact",
    title: "Complete IEEE draft submission",
    gain: "+4 score potential",
    detail: "Research and documentation are the current score bottlenecks.",
    icon: BookOpenCheck,
    className: "border-purple-200 bg-purple-50 text-purple-800",
  },
  {
    priority: "Medium impact",
    title: "Finish deployment setup",
    gain: "+2 score potential",
    detail: "Production readiness will stabilize final evaluation signals.",
    icon: Rocket,
    className: "border-blue-200 bg-blue-50 text-blue-800",
  },
  {
    priority: "Low impact",
    title: "Improve attendance consistency",
    gain: "+1 score potential",
    detail: "Protects reliability and mentor response scoring.",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
];

const tiers = [
  { label: "Builder", active: false },
  { label: "Researcher", active: false },
  { label: "Elite Executor", active: true },
  { label: "System Architect", active: false },
  { label: "Consistency Leader", active: false },
];

function HeaderStat({ stat }: { stat: (typeof headerStats)[number] }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-2xl border border-border bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {stat.label}
      </div>
      <p className="mt-2 text-xl font-semibold tracking-normal text-foreground">{stat.value}</p>
      <p className="text-xs text-muted-foreground">{stat.detail}</p>
    </div>
  );
}

function ScoreRing() {
  return (
    <div
      className="relative grid size-56 shrink-0 place-items-center rounded-full"
      style={{
        background: "conic-gradient(#22c55e 0deg 302deg, rgba(255,255,255,0.12) 302deg 360deg)",
      }}
      aria-label="Engineering performance score is 84 out of 100"
    >
      <div className="grid size-44 place-items-center rounded-full border border-white/10 bg-slate-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="text-center">
          <p className="text-6xl font-semibold tracking-normal text-white">84</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-normal text-emerald-200">
            Elite Performer
          </p>
        </div>
      </div>
    </div>
  );
}

function DimensionCard({ item }: { item: Dimension }) {
  const Icon = item.icon;
  const positive = !item.trend.startsWith("-");

  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl border border-border bg-muted/35 text-foreground">
              <Icon className="size-5" />
            </span>
            <div>
              <h3 className="font-semibold text-foreground">{item.label}</h3>
              <p className="text-xs text-muted-foreground">{item.benchmark}</p>
            </div>
          </div>
          <Badge
            className={
              positive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-orange-200 bg-orange-50 text-orange-700"
            }
          >
            {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {item.trend}
          </Badge>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capability score</span>
            <span className="font-semibold text-foreground">{item.score}/100</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={cn("h-full rounded-full transition-all duration-500", item.tone)}
              style={{ width: `${item.score}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/25 p-3">
          <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Improve next
          </p>
          <p className="mt-1 text-sm leading-6 text-foreground">{item.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ContributionCell({ value }: { value: number }) {
  const intensity =
    value >= 9
      ? "bg-emerald-600"
      : value >= 7
        ? "bg-emerald-400"
        : value >= 5
          ? "bg-emerald-200"
          : value >= 3
            ? "bg-slate-300"
            : "bg-slate-100";

  return <span className={cn("size-4 rounded", intensity)} title={`Momentum ${value}`} />;
}

function EvolutionTimeline() {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Execution growth timeline</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Weekly momentum, faculty feedback impact, milestones, and unlocks.
            </p>
          </div>
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            +18 points in 5 weeks
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 p-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div>
          <p className="text-sm font-semibold text-foreground">Momentum contribution map</p>
          <div className="mt-4 grid grid-cols-7 gap-2 rounded-2xl border border-border bg-muted/20 p-4">
            {weeklyCells.map((cell) => (
              <ContributionCell key={cell.id} value={cell.value} />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Low</span>
            {[1, 3, 5, 7, 9].map((value) => (
              <ContributionCell key={`legend-${value}`} value={value} />
            ))}
            <span>High</span>
          </div>
        </div>

        <div className="space-y-4">
          {growthEvents.map((event) => (
            <div key={event.week} className="grid gap-4 rounded-2xl border border-border bg-white p-4 sm:grid-cols-[64px_minmax(0,1fr)_70px] sm:items-center">
              <span className="grid size-12 place-items-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
                {event.week}
              </span>
              <div>
                <p className="font-semibold text-foreground">{event.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.detail}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-xl font-semibold tracking-normal text-foreground">
                  {event.score}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PeerBenchmarking() {
  const rows = [
    { label: "Project execution", you: 91, peer: 76, top: 94 },
    { label: "Research contribution", you: 62, peer: 68, top: 88 },
    { label: "Documentation quality", you: 58, peer: 66, top: 82 },
    { label: "Deployment readiness", you: 78, peer: 64, top: 90 },
  ];

  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <CardTitle className="text-2xl">Peer Benchmarking</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Compare your execution profile against batch averages and top performers.
        </p>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Batch percentile", "Top 12%"],
            ["Department average", "71"],
            ["Improvement gap", "Research +10"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-muted/25 p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 text-lg font-semibold tracking-normal text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{row.label}</span>
                <span className="text-muted-foreground">You {row.you}</span>
              </div>
              <div className="relative h-3 rounded-full bg-slate-200">
                <span
                  className="absolute top-0 h-3 rounded-full bg-slate-950"
                  style={{ left: 0, width: `${row.you}%` }}
                />
                <span
                  className="absolute top-[-4px] h-5 w-1 rounded-full bg-blue-500"
                  style={{ left: `${row.peer}%` }}
                  title="Department average"
                />
                <span
                  className="absolute top-[-4px] h-5 w-1 rounded-full bg-emerald-500"
                  style={{ left: `${row.top}%` }}
                  title="Top performer"
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>You</span>
                <span>Blue: avg</span>
                <span>Green: top</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StreakMomentum() {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <CardTitle className="text-2xl">Streak and momentum system</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Reliability, discipline, research motion, and build habits.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
        {streaks.map((streak) => {
          const Icon = streak.icon;

          return (
            <div key={streak.label} className="rounded-3xl border border-border bg-muted/20 p-4">
              <span className="grid size-11 place-items-center rounded-xl border border-border bg-white text-foreground">
                <Icon className="size-5" />
              </span>
              <p className="mt-4 text-sm font-medium text-muted-foreground">{streak.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-normal text-foreground">
                {streak.value}
              </p>
              <Progress value={streak.progress} className="mt-4 h-1.5 bg-slate-200" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function StudentPerformanceScorePage() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-end">
        <div>
          <h1 className="text-balance">Engineering Performance Index</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Real-time evaluation of execution, consistency, technical depth, and
            project progress.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge className="border-slate-200 bg-white text-slate-700">
              Reputation level: Elite Executor
            </Badge>
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Elite Momentum
            </Badge>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {headerStats.map((stat) => (
            <HeaderStat key={stat.label} stat={stat} />
          ))}
        </div>
      </div>

      <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white shadow-[0_28px_85px_rgba(15,23,42,0.2)]">
        <CardContent className="grid gap-7 p-6 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:items-center">
          <div className="flex justify-center">
            <ScoreRing />
          </div>

          <div className="space-y-5">
            <div>
              <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                Top 12% percentile ranking
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal text-white">
                Your execution reputation is compounding.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Score is up 6 points this month, driven by weekly delivery,
                verified deployment progress, and consistent faculty feedback closure.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Percentile", "Top 12%"],
                ["Trend", "+6 this month"],
                ["Last month", "+18 total"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs text-white/45">{label}</p>
                  <p className="mt-2 text-lg font-semibold tracking-normal text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-semibold text-white">Performance insights</p>
            <div className="mt-4 grid gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-emerald-200">
                  Strengths
                </p>
                <div className="mt-2 space-y-2">
                  {strengths.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-white/76">
                      <CheckCircle2 className="size-4 text-emerald-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-orange-200">
                  Weak areas
                </p>
                <div className="mt-2 space-y-2">
                  {risks.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-white/76">
                      <AlertTriangle className="size-4 text-orange-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcff_52%,#eef2ff_100%)]">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                  AI Performance Analysis
                </Badge>
                <h2 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">
                  Execution Intelligence
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                  Your strongest trait is execution consistency. You submit faster
                  than 82% of your batch, but research documentation and viva
                  confidence are pulling the total index down.
                </p>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
                <BrainCircuit className="size-6" />
              </span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
                  Strongest trait
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-900">
                  Execution consistency and fast feedback closure.
                </p>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-normal text-orange-700">
                  Risk areas
                </p>
                <p className="mt-2 text-sm leading-6 text-orange-900">
                  Research documentation and viva confidence.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-normal text-blue-700">
                  Recommendation
                </p>
                <p className="mt-2 text-sm leading-6 text-blue-900">
                  Complete 2 mock-viva simulations this week.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="space-y-4 p-6">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Engineering Health Score
            </Badge>
            <div>
              <p className="text-4xl font-semibold tracking-normal text-foreground">Healthy</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Elite momentum: no missed deadlines and strong weekly activity.
              </p>
            </div>
            <div className="space-y-3">
              {healthFactors.map((factor) => (
                <div key={factor.label} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{factor.label}</p>
                    <p className="text-xs text-muted-foreground">{factor.state}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{factor.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">
              Performance breakdown
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Capability bars, benchmarks, trends, and next improvement actions.
            </p>
          </div>
          <Badge variant="outline" className="bg-white">
            9 dimensions tracked
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dimensions.map((item) => (
            <DimensionCard key={item.label} item={item} />
          ))}
        </div>
      </div>

      <EvolutionTimeline />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <PeerBenchmarking />

        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardHeader className="border-b border-white/10 pb-5">
            <CardTitle className="text-2xl text-white">Professional tier system</CardTitle>
            <p className="text-sm leading-6 text-white/60">
              Performance titles are earned through execution signals, not marks.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {tiers.map((tier) => (
              <div
                key={tier.label}
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition duration-200",
                  tier.active
                    ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                    : "border-white/10 bg-white/[0.04] text-white/65",
                )}
              >
                <span className="font-medium">{tier.label}</span>
                {tier.active ? (
                  <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                    Active
                  </Badge>
                ) : (
                  <CircleDot className="size-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <StreakMomentum />

      <Card>
        <CardHeader className="border-b border-border pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-2xl">Recommended Actions</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Operational moves ranked by expected score impact.
              </p>
            </div>
            <Button className="rounded-xl">
              Open weekly plan
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <div
                key={action.title}
                className={cn(
                  "rounded-3xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]",
                  action.className,
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-xl border border-current/20 bg-white/70">
                    <Icon className="size-5" />
                  </span>
                  <Badge className={action.className}>{action.priority}</Badge>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-normal">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 opacity-80">{action.detail}</p>
                <div className="mt-5 rounded-2xl border border-current/15 bg-white/65 px-3 py-2 text-sm font-semibold">
                  {action.gain}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
