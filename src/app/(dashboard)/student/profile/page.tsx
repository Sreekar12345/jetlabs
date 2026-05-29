import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  BrainCircuit,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Database,
  Flame,
  GitBranch,
  GraduationCap,
  HeartPulse,
  Layers3,
  LineChart,
  Medal,
  MessageSquareText,
  MonitorCheck,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users2,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Metric = {
  label: string;
  value: string;
  detail: string;
  trend: string;
  icon: LucideIcon;
};

const profileMetrics: Metric[] = [
  { label: "CGPA", value: "8.6", detail: "Stable academic base", trend: "+0.2", icon: GraduationCap },
  { label: "Project readiness", value: "84%", detail: "Final delivery almost ready", trend: "+8", icon: Rocket },
  { label: "Execution score", value: "91", detail: "Elite consistency band", trend: "+6", icon: Flame },
  { label: "Research activity", value: "68%", detail: "IEEE draft needs closure", trend: "+3", icon: BookOpenCheck },
  { label: "Viva confidence", value: "74%", detail: "2 simulations recommended", trend: "+5", icon: MessageSquareText },
  { label: "Risk level", value: "Low", detail: "No active academic debt", trend: "Healthy", icon: ShieldCheck },
];

const skills = [
  { label: "Python", value: 92, verified: true },
  { label: "TensorFlow", value: 84, verified: true },
  { label: "React", value: 81, verified: true },
  { label: "ML Engineering", value: 78, verified: true },
  { label: "System Design", value: 66, verified: false },
  { label: "Technical Writing", value: 72, verified: true },
];

const readiness = [
  {
    label: "Project readiness",
    value: 88,
    risk: "Low",
    trend: "+8",
    recommendation: "Lock final demo path and record proof.",
  },
  {
    label: "Deployment readiness",
    value: 82,
    risk: "Low",
    trend: "+7",
    recommendation: "Complete production environment checklist.",
  },
  {
    label: "Research readiness",
    value: 58,
    risk: "Medium",
    trend: "-2",
    recommendation: "Complete methodology section within 5 days.",
  },
  {
    label: "Viva readiness",
    value: 74,
    risk: "Medium",
    trend: "+5",
    recommendation: "Complete 2 defense simulations this week.",
  },
  {
    label: "Collaboration readiness",
    value: 83,
    risk: "Low",
    trend: "+3",
    recommendation: "Document ownership split for final review.",
  },
  {
    label: "Industry readiness",
    value: 79,
    risk: "Low",
    trend: "+4",
    recommendation: "Polish public portfolio and README.",
  },
  {
    label: "Communication",
    value: 71,
    risk: "Medium",
    trend: "+2",
    recommendation: "Practice concise architecture explanation.",
  },
  {
    label: "Submission discipline",
    value: 93,
    risk: "Low",
    trend: "+6",
    recommendation: "Protect the current streak.",
  },
];

const timelineEvents = [
  {
    type: "Deployment",
    title: "Production preview verified",
    detail: "Faculty can inspect the current deployment path.",
    time: "This week",
    icon: Rocket,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    type: "Research",
    title: "Methodology draft revised",
    detail: "IEEE paper section now includes benchmark framing.",
    time: "3 days ago",
    icon: BookOpenCheck,
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
  {
    type: "Submission",
    title: "Week 4 evidence pack submitted",
    detail: "Model checkpoint, demo screenshot, and GitHub evidence attached.",
    time: "5 days ago",
    icon: ClipboardCheck,
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    type: "Faculty",
    title: "Mentor feedback closed",
    detail: "Architecture notes and validation limitations addressed.",
    time: "Last week",
    icon: MessageSquareText,
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  {
    type: "Achievement",
    title: "Research expo prototype selected",
    detail: "Project entered proof-of-work portfolio as verified outcome.",
    time: "March",
    icon: Trophy,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    type: "Risk",
    title: "Documentation slowdown detected",
    detail: "AI insight recommended README and API note cleanup.",
    time: "February",
    icon: AlertTriangle,
    className: "border-red-200 bg-red-50 text-red-700",
  },
];

const reputation = [
  { label: "Reliability", value: 91, icon: ShieldCheck },
  { label: "Technical depth", value: 82, icon: Code2 },
  { label: "Research contribution", value: 68, icon: BookOpenCheck },
  { label: "Team contribution", value: 84, icon: Users2 },
  { label: "Leadership", value: 76, icon: Medal },
  { label: "Consistency", value: 93, icon: Flame },
];

const performanceDimensions = [
  {
    label: "Execution consistency",
    value: 91,
    trend: "+6 this month",
    insight: "Submits proof faster than 82% of the batch.",
    icon: Activity,
  },
  {
    label: "Technical depth",
    value: 82,
    trend: "+4 this month",
    insight: "Strong model pipeline reasoning, needs more system tradeoffs.",
    icon: BrainCircuit,
  },
  {
    label: "Research output",
    value: 68,
    trend: "+3 this month",
    insight: "Literature framing is improving, methodology remains the bottleneck.",
    icon: LineChart,
  },
  {
    label: "Final evaluation focus",
    value: 76,
    trend: "+5 this month",
    insight: "Viva and documentation are the highest leverage next actions.",
    icon: Target,
  },
];

const researchArtifacts = [
  { label: "IEEE draft", status: "Faculty review", value: 71, icon: BookOpenCheck },
  { label: "Dataset notes", status: "Verified", value: 84, icon: Database },
  { label: "Experiment log", status: "Active", value: 78, icon: GitBranch },
  { label: "Publication readiness", status: "Needs methodology", value: 62, icon: Sparkles },
];

const executionSignals: Array<{ label: string; value: number; icon: LucideIcon }> = [
  { label: "Project velocity", value: 84, icon: Rocket },
  { label: "Architecture maturity", value: 77, icon: Layers3 },
  { label: "Repository proof", value: 89, icon: GitBranch },
  { label: "Data pipeline readiness", value: 80, icon: Database },
  { label: "Mentor feedback closure", value: 89, icon: MessageSquareText },
  { label: "Deployment motion", value: 82, icon: MonitorCheck },
];

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="rounded-2xl border border-border bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-9 place-items-center rounded-xl border border-border bg-muted/40 text-foreground">
          <Icon className="size-4" />
        </span>
        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{metric.trend}</Badge>
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground">{metric.label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-normal text-foreground">{metric.value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{metric.detail}</p>
    </div>
  );
}

function SkillBar({ skill }: { skill: (typeof skills)[number] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{skill.label}</span>
          {skill.verified ? (
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              <BadgeCheck className="size-3" />
              Verified
            </Badge>
          ) : null}
        </div>
        <span className="text-muted-foreground">{skill.value}%</span>
      </div>
      <Progress value={skill.value} className="h-2 bg-slate-200" />
    </div>
  );
}

function ReadinessCard({ item }: { item: (typeof readiness)[number] }) {
  const risky = item.risk !== "Low";

  return (
    <Card className="transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground">{item.label}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Trend {item.trend}</p>
          </div>
          <Badge
            className={
              risky
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }
          >
            {item.risk} risk
          </Badge>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Readiness</span>
            <span className="font-semibold text-foreground">{item.value}%</span>
          </div>
          <Progress value={item.value} className="h-2 bg-slate-200" />
        </div>
        <div className="rounded-2xl border border-border bg-muted/25 p-3">
          <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            AI recommendation
          </p>
          <p className="mt-1 text-sm leading-6 text-foreground">{item.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ContributionGrid() {
  const values = [
    1, 2, 3, 5, 4, 6, 7,
    2, 3, 5, 5, 7, 8, 6,
    3, 4, 6, 7, 8, 9, 8,
    1, 3, 4, 6, 7, 7, 9,
    2, 5, 6, 7, 8, 10, 9,
  ];

  return (
    <div className="grid grid-cols-7 gap-2 rounded-2xl border border-border bg-muted/20 p-4">
      {values.map((value, index) => (
        <span
          key={`activity-${index + 1}`}
          className={cn(
            "size-4 rounded",
            value >= 9
              ? "bg-emerald-600"
              : value >= 7
                ? "bg-emerald-400"
                : value >= 5
                  ? "bg-emerald-200"
                  : value >= 3
                    ? "bg-slate-300"
                    : "bg-slate-100",
          )}
        />
      ))}
    </div>
  );
}

function IdentityTab() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-2xl">Engineering Identity</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              A builder profile focused on applied AI, product execution, and research-backed delivery.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            {[
              ["Bio", "AI/ML builder translating crop disease detection research into a deployable product."],
              ["Interests", "Computer vision, product systems, applied research, engineering ops."],
              ["Career focus", "ML engineering roles in product/startup environments."],
              ["Technical domains", "Machine learning, full-stack apps, deployment, evaluation."],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">{label}</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-2xl">Core Skills</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Verified technologies, contribution areas, and competency indicators.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            {skills.map((skill) => (
              <SkillBar key={skill.label} skill={skill} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="space-y-5 p-5">
            <Badge className="border-white/10 bg-white/5 text-white/70">Current Mission</Badge>
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-white">
                Crop Disease Detection Platform
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Converting a research-backed CNN pipeline into a final deployable platform.
              </p>
            </div>
            <div className="grid gap-3">
              {["IEEE publication", "Final deployment", "Viva readiness"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/78">
                  <CheckCircle2 className="size-4 text-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["Python", "TensorFlow", "React", "FastAPI", "Vercel"].map((tech) => (
                <span key={tech} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/72">
                  {tech}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-xl">Research & Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {["IEEE draft under faculty review", "AWS Cloud Practitioner", "DeepLearning.AI specialization", "CV workshop certificate"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-3 py-2 text-sm">
                <BookOpenCheck className="size-4 text-indigo-600" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AcademicHealthTab() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader className="border-b border-border pb-5">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CalendarCheck2 className="size-5 text-slate-700" />
            Consistency & Reliability Intelligence
          </CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Attendance momentum, reliability trend, discipline score, and faculty observation insights.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700">Semester discipline score</p>
              <p className="mt-2 text-5xl font-semibold tracking-normal text-emerald-950">86%</p>
              <p className="mt-3 text-sm leading-6 text-emerald-800">
                Your attendance consistency improved by 12% after October.
              </p>
            </div>
            <ContributionGrid />
          </div>
          <div className="space-y-4">
            {[
              ["Attendance momentum", "Improving", 86],
              ["Reliability trend", "Stable", 82],
              ["Faculty observation", "Strong mentor response", 88],
              ["Risk forecast", "Low academic drift", 92],
            ].map(([label, value, score]) => (
              <div key={label} className="rounded-2xl border border-border bg-white p-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
                <Progress value={Number(score)} className="h-2 bg-slate-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border pb-5">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <HeartPulse className="size-5 text-emerald-700" />
            Academic Stability System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-700">Academic debt</p>
            <p className="mt-2 text-3xl font-semibold tracking-normal text-emerald-950">
              Zero active debt
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Zero active academic debt maintained for 4 semesters.
            </p>
          </div>
          {["Recovery velocity: no active recovery needed", "Subject weakness: mathematics revision watch", "Stress-risk: low", "Escalation alerts: none"].map((item) => (
            <div key={item} className="rounded-2xl border border-border bg-muted/20 px-3 py-2 text-sm text-foreground">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[260px_minmax(0,1fr)_340px] lg:items-center">
          <div className="relative grid size-52 place-items-center rounded-full bg-[conic-gradient(#60a5fa_0deg_328deg,rgba(255,255,255,0.12)_328deg_360deg)]">
            <div className="absolute inset-4 rounded-full border border-white/10" />
            <div className="grid size-36 place-items-center rounded-full bg-slate-950 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div>
                <p className="text-5xl font-semibold tracking-normal text-white">91</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-blue-200">
                  Elite Builder
                </p>
              </div>
            </div>
          </div>
          <div>
            <Badge className="border-white/10 bg-white/5 text-white/75">
              Engineering performance index
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-white">
              Your execution reputation is compounding.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
              Strong weekly proof, high mentor-response velocity, and consistent project delivery place Aarav in the top execution band.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Rank #3 in batch", "Top 12%", "+6 this month", "14-day streak"].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/72">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Zap className="size-4 text-blue-200" />
              Performance intelligence
            </p>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Highest leverage path: close methodology, document architecture, and rehearse viva defense twice this week.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {performanceDimensions.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-border bg-muted/30">
                    <Icon className="size-5 text-slate-700" />
                  </span>
                  <Badge className="border-blue-200 bg-blue-50 text-blue-700">{item.trend}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.insight}</p>
                </div>
                <Progress value={item.value} className="h-2 bg-slate-200" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function RiskTab() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcff_52%,#eef2ff_100%)]">
        <CardContent className="space-y-5 p-6">
          <Badge className="border-slate-200 bg-white text-slate-700">Student Success Intelligence</Badge>
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">
              Risk forecasting engine
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              Low viva preparation confidence detected. Signals include low mock-viva participation and weak presentation practice consistency.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Submission risk", "Low", 88, "bg-emerald-500"],
              ["Viva risk", "Medium", 62, "bg-orange-500"],
              ["Research completion risk", "Medium", 58, "bg-orange-500"],
            ].map(([label, value, score, tone]) => (
              <div key={label} className="rounded-2xl border border-border bg-white p-4">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{value}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className={cn("h-full rounded-full", tone)} style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="space-y-4 p-5">
          <Badge className="border-orange-200 bg-white text-orange-700">Recommended intervention</Badge>
          <h3 className="text-2xl font-semibold tracking-normal text-orange-950">
            Complete 2 defense simulations this week.
          </h3>
          <p className="text-sm leading-7 text-orange-900">
            This should improve viva confidence and reduce final-evaluation uncertainty.
          </p>
          <Button className="rounded-xl">
            Open viva simulator
            <ArrowUpRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ResearchTab() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader className="border-b border-border pb-5">
          <CardTitle className="text-2xl">Research Operating Layer</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Publication progress, experiment quality, certification signals, and faculty-review readiness.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          {researchArtifacts.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-border bg-muted/20 p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-purple-100 bg-purple-50 text-purple-700">
                    <Icon className="size-5" />
                  </span>
                  <Badge className="border-purple-200 bg-purple-50 text-purple-700">{item.status}</Badge>
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{item.label}</h3>
                <div className="mt-4 flex items-center gap-3">
                  <Progress value={item.value} className="h-2 flex-1 bg-slate-200" />
                  <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="space-y-4 p-5">
            <Badge className="border-purple-200 bg-white text-purple-700">Research intelligence</Badge>
            <h3 className="text-2xl font-semibold tracking-normal text-purple-950">
              Methodology is the publication bottleneck.
            </h3>
            <p className="text-sm leading-7 text-purple-900">
              Faculty feedback shows the strongest research gap is benchmark explanation, not implementation quality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-xl">Certifications & Signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {["DeepLearning.AI computer vision track", "AWS Cloud Practitioner", "IEEE student author workflow", "Research expo prototype selection"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-3 py-2 text-sm text-foreground">
                <CheckCircle2 className="size-4 text-emerald-600" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReadinessTab() {
  return (
    <div className="space-y-5">
      <Card className="border-slate-900 bg-slate-950 text-white">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[220px_minmax(0,1fr)_360px] lg:items-center">
          <div className="grid size-48 place-items-center rounded-full bg-[conic-gradient(#22c55e_0deg_317deg,rgba(255,255,255,0.12)_317deg_360deg)]">
            <div className="grid size-36 place-items-center rounded-full bg-slate-950 text-center">
              <div>
                <p className="text-5xl font-semibold tracking-normal text-white">88</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-emerald-200">
                  Placement Ready
                </p>
              </div>
            </div>
          </div>
          <div>
            <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
              Top 18% readiness percentile
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-white">
              Strong execution readiness with research risk.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/65">
              High for product/startup roles. Moderate for research-heavy roles until IEEE draft is closed.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">AI Readiness Analysis</p>
            <p className="mt-2 text-sm leading-7 text-white/65">
              Your strongest readiness signal is execution discipline. Complete 2 viva simulations and finish the IEEE draft next.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {readiness.map((item) => (
          <ReadinessCard key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

function TimelineTab() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader className="border-b border-border pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">Engineering Journey Timeline</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Product development log, research progress, mentor feedback, and growth history.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Academic", "Project", "Research", "Viva", "Risk", "Faculty", "Achievements"].map((filter) => (
                <Badge key={filter} variant="outline" className="bg-white">{filter}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {timelineEvents.map((event) => {
            const Icon = event.icon;
            return (
              <details key={event.title} className="group rounded-2xl border border-border bg-white p-4 transition duration-200 open:shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-start gap-4">
                    <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl border", event.className)}>
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={event.className}>{event.type}</Badge>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>
                      <p className="mt-2 font-semibold text-foreground">{event.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.detail}</p>
                    </div>
                  </div>
                </summary>
                <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3 text-sm leading-6 text-muted-foreground">
                  Momentum indicator recorded. This event contributes to project velocity and reputation context.
                </div>
              </details>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcff_55%,#eef2ff_100%)]">
        <CardContent className="space-y-4 p-5">
          <Badge className="border-blue-200 bg-blue-50 text-blue-700">Timeline intelligence</Badge>
          <h3 className="text-2xl font-semibold tracking-normal text-foreground">
            Most productive during March-April.
          </h3>
          <p className="text-sm leading-7 text-muted-foreground">
            Milestone clustering shows strongest growth after faculty feedback loops and deployment verification.
          </p>
          {["Weekly mode", "Semester mode", "Full journey mode"].map((mode) => (
            <div key={mode} className="rounded-2xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground">
              {mode}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ReputationTab() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader className="border-b border-border pb-5">
          <CardTitle className="text-2xl">Engineering Reputation Layer</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Reliability, depth, research, team contribution, leadership, and consistency.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          {reputation.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-border bg-white">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.value}% reputation signal</p>
                  </div>
                </div>
                <Progress value={item.value} className="mt-4 h-2 bg-slate-200" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-slate-900 bg-slate-950 text-white">
        <CardContent className="space-y-5 p-5">
          <Badge className="border-white/10 bg-white/5 text-white/70">AI Growth Intelligence</Badge>
          <h3 className="text-2xl font-semibold tracking-normal text-white">
            You perform strongest under structured milestone systems.
          </h3>
          <p className="text-sm leading-7 text-white/65">
            Highest growth area this semester: project execution consistency. Documentation quality may reduce final evaluation score.
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/78">
            Recommended next action: complete architecture documentation.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentProfilePage() {
  return (
    <section className="space-y-8">
      <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcff_48%,#eef2ff_100%)] shadow-[0_24px_75px_rgba(15,23,42,0.07)]">
        <CardContent className="grid gap-7 p-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_420px] xl:items-stretch">
          <div className="space-y-5">
            <div className="flex gap-5">
              <Avatar className="size-24 border border-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
                <AvatarFallback className="bg-slate-950 text-2xl font-semibold text-white">
                  AS
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="size-3" />
                  Verified student identity
                </Badge>
                <h1 className="mt-3 text-balance">Aarav Sharma</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  AI/ML Engineer - Builder - Research Contributor
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["College", "JetLabs Institute"],
                ["Department", "Computer Science"],
                ["Semester", "VIII"],
                ["Batch", "2026"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-border bg-white/75 p-3">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="border-slate-200 bg-white text-slate-700">
                <Sparkles className="size-3" />
                Elite Builder
              </Badge>
              {["Research-active", "High execution consistency"].map((item) => (
                <Badge key={item} className="border-slate-200 bg-white text-slate-700">{item}</Badge>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/72 p-5">
            <Badge className="border-blue-200 bg-blue-50 text-blue-700">Current focus</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-foreground">
              Currently building: Crop Disease Detection Platform
            </h2>
            <div className="mt-5 grid gap-3">
              {["IEEE publication", "Final deployment", "Viva readiness"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-3 py-2 text-sm">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Computer Vision", "ML Engineering", "Full-stack", "Research Writing"].map((domain) => (
                <span key={domain} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground">
                  {domain}
                </span>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-border bg-white p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Weekly activity streak</span>
                <span className="text-muted-foreground">14 days</span>
              </div>
              <Progress value={93} className="h-2 bg-slate-200" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Badge className="border-slate-200 bg-white text-slate-700">
                Performance Intelligence Snapshot
              </Badge>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Compact growth signals across academics, execution, research, and readiness.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {profileMetrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="identity" className="space-y-6">
        <div className="sticky top-[72px] z-20 -mx-4 border-y border-border bg-white/92 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
          <TabsList className="flex w-full gap-1 overflow-x-auto rounded-2xl bg-muted/70 p-1">
            {[
              ["identity", "Identity"],
              ["performance", "Performance"],
              ["academic", "Academic Health"],
              ["execution", "Execution"],
              ["risk", "Risk Intelligence"],
              ["research", "Research"],
              ["readiness", "Readiness"],
              ["timeline", "Timeline"],
              ["reputation", "Reputation"],
            ].map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="shrink-0 rounded-xl px-3 py-2">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="identity">
          <IdentityTab />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTab />
        </TabsContent>

        <TabsContent value="academic">
          <AcademicHealthTab />
        </TabsContent>

        <TabsContent value="execution">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card>
              <CardHeader className="border-b border-border pb-5">
                <CardTitle className="text-2xl">Execution Operating System</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  Project velocity, weekly submissions, mentor feedback, and deployment motion.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                {executionSignals.map((signal) => {
                  const IconComponent = signal.icon;
                  return (
                    <div key={signal.label} className="rounded-2xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center gap-3">
                        <IconComponent className="size-5 text-slate-700" />
                        <p className="font-semibold text-foreground">{signal.label}</p>
                      </div>
                      <Progress value={signal.value} className="mt-4 h-2 bg-slate-200" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card className="border-slate-900 bg-slate-950 text-white">
              <CardContent className="space-y-4 p-5">
                <Badge className="border-white/10 bg-white/5 text-white/70">Execution insight</Badge>
                <h3 className="text-2xl font-semibold tracking-normal text-white">
                  You perform strongest when milestones are explicit.
                </h3>
                <p className="text-sm leading-7 text-white/65">
                  Convert research writing and viva prep into weekly deliverables to keep the execution index rising.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <RiskTab />
        </TabsContent>

        <TabsContent value="research">
          <ResearchTab />
        </TabsContent>

        <TabsContent value="readiness">
          <ReadinessTab />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineTab />
        </TabsContent>

        <TabsContent value="reputation">
          <ReputationTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}
