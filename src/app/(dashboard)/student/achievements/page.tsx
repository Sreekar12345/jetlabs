import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  Award,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  Code2,
  Crown,
  Download,
  ExternalLink,
  FileDown,
  FileText,
  Github,
  LockKeyhole,
  Medal,
  Plus,
  Rocket,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users2,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Achievement = {
  category: "Research" | "Hackathon" | "Sports" | "Cultural" | "Project Awards";
  level: "College" | "State" | "National" | "International";
  status: "Verified" | "Under review" | "Faculty approved";
  title: string;
  description: string;
  role: string;
  team: string;
  outcome: string;
  skills: string[];
  date: string;
  organization: string;
  impact: number;
  points: number;
  proof: string;
  project?: string;
  publication?: string;
};

type BadgeItem = {
  name: string;
  tier: "Legendary" | "Rare" | "Earned" | "Locked";
  condition: string;
  progress: number;
  icon: LucideIcon;
};

const metrics = [
  {
    label: "Total achievements",
    value: "18",
    detail: "+4 this semester",
    icon: Trophy,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    label: "Verified accomplishments",
    value: "14",
    detail: "78% proof-backed",
    icon: ShieldCheck,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    label: "National recognitions",
    value: "3",
    detail: "Top-tier profile signal",
    icon: Crown,
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
  {
    label: "Research contributions",
    value: "5",
    detail: "Paper, poster, citations",
    icon: BookOpenCheck,
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  {
    label: "Hackathon wins",
    value: "4",
    detail: "2 finalist outcomes",
    icon: Zap,
    className: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  {
    label: "Leadership activities",
    value: "6",
    detail: "Teams, clubs, mentoring",
    icon: Users2,
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
];

const achievements: Achievement[] = [
  {
    category: "Hackathon",
    level: "National",
    status: "Verified",
    title: "Smart India Hackathon - Grand Finalist",
    description:
      "Built a crop-disease triage prototype with live inference, dashboard evidence, and mentor-reviewed deployment notes.",
    role: "ML pipeline lead",
    team: "6 students",
    outcome: "National finalist, agriculture track",
    skills: ["TensorFlow", "FastAPI", "Product demo"],
    date: "Dec 2025",
    organization: "Ministry of Education Innovation Cell",
    impact: 94,
    points: 420,
    proof: "SIH finalist certificate verified",
    project: "grid-sense.vercel.app",
  },
  {
    category: "Research",
    level: "International",
    status: "Faculty approved",
    title: "IEEE Student Paper - Internal Review Cleared",
    description:
      "Authored methodology, evaluation, and results sections for a CNN-based crop disease detection paper.",
    role: "First author",
    team: "3 authors",
    outcome: "Ready for conference submission",
    skills: ["IEEE writing", "Evaluation", "Literature synthesis"],
    date: "Jan 2026",
    organization: "JetLabs Research Cell",
    impact: 88,
    points: 360,
    proof: "Faculty review memo attached",
    publication: "ieee-draft-v4.pdf",
  },
  {
    category: "Project Awards",
    level: "College",
    status: "Verified",
    title: "Best Engineering Prototype - Research Expo",
    description:
      "Presented an end-to-end working system with deployment, model metrics, and evaluator-ready documentation.",
    role: "Full-stack builder",
    team: "4 students",
    outcome: "Best prototype award",
    skills: ["React", "Deployment", "System design"],
    date: "Nov 2025",
    organization: "CSE Research Expo",
    impact: 82,
    points: 280,
    proof: "Expo result sheet verified",
    project: "github.com/team/grid-sense",
  },
  {
    category: "Cultural",
    level: "State",
    status: "Under review",
    title: "Technical Storytelling Lead - Innovation Fest",
    description:
      "Led demo narration, slide structure, and evaluator Q&A framing for the finalist showcase team.",
    role: "Presentation lead",
    team: "5 students",
    outcome: "State showcase shortlist",
    skills: ["Storytelling", "Leadership", "Pitching"],
    date: "Oct 2025",
    organization: "State Innovation Fest",
    impact: 74,
    points: 190,
    proof: "Event proof pending faculty verification",
  },
  {
    category: "Sports",
    level: "College",
    status: "Verified",
    title: "Inter-department Sprint Relay - Silver Medal",
    description:
      "Represented CSE in the annual athletic meet and placed second in a team relay event.",
    role: "Relay anchor",
    team: "4 athletes",
    outcome: "Silver medal",
    skills: ["Discipline", "Teamwork", "Consistency"],
    date: "Aug 2025",
    organization: "College Sports Council",
    impact: 61,
    points: 120,
    proof: "Medal record verified",
  },
];

const timeline = [
  {
    year: "2026",
    items: [
      {
        title: "IEEE paper review cleared",
        detail: "Publication evidence added to portfolio",
        status: "Faculty approved",
      },
      {
        title: "Proofbook verification reached 78%",
        detail: "Most achievements now have validated proof links",
        status: "Verified",
      },
    ],
  },
  {
    year: "2025",
    items: [
      {
        title: "Smart India Hackathon finalist",
        detail: "National-level competitive engineering milestone",
        status: "Verified",
      },
      {
        title: "Best prototype at research expo",
        detail: "Product-building credibility signal unlocked",
        status: "Verified",
      },
      {
        title: "Innovation Fest storytelling lead",
        detail: "Leadership and public defense capability added",
        status: "Under review",
      },
    ],
  },
];

const badges: BadgeItem[] = [
  {
    name: "National Finalist",
    tier: "Legendary",
    condition: "Earn 1 verified national competitive milestone",
    progress: 100,
    icon: Crown,
  },
  {
    name: "Researcher",
    tier: "Rare",
    condition: "Publish or clear faculty review for 3 research outputs",
    progress: 82,
    icon: BookOpenCheck,
  },
  {
    name: "Builder",
    tier: "Earned",
    condition: "Submit 3 verified project artifacts",
    progress: 100,
    icon: Code2,
  },
  {
    name: "Team Leader",
    tier: "Earned",
    condition: "Lead 2 team outcomes with proof",
    progress: 100,
    icon: Users2,
  },
  {
    name: "IEEE Author",
    tier: "Rare",
    condition: "Submit the final IEEE paper pack",
    progress: 72,
    icon: FileText,
  },
  {
    name: "Open-source Contributor",
    tier: "Locked",
    condition: "Merge 5 public pull requests",
    progress: 28,
    icon: Github,
  },
  {
    name: "AI Engineer",
    tier: "Rare",
    condition: "Verify model evaluation and deployment evidence",
    progress: 76,
    icon: Activity,
  },
  {
    name: "Full-stack Builder",
    tier: "Locked",
    condition: "Verify frontend, backend, DB, and deployment proof",
    progress: 64,
    icon: Rocket,
  },
];

const scoreFactors = [
  { label: "Verification quality", value: 78, tone: "bg-emerald-500" },
  { label: "National achievements", value: 84, tone: "bg-purple-500" },
  { label: "Technical depth", value: 72, tone: "bg-blue-500" },
  { label: "Research output", value: 68, tone: "bg-indigo-500" },
  { label: "Team participation", value: 81, tone: "bg-cyan-500" },
  { label: "Consistency", value: 74, tone: "bg-amber-500" },
];

function categoryStyles(category: Achievement["category"]) {
  if (category === "Research") {
    return {
      card: "border-indigo-200 bg-[linear-gradient(135deg,#ffffff_0%,#faf7ff_54%,#eef2ff_100%)]",
      chip: "border-indigo-200 bg-indigo-50 text-indigo-700",
      icon: BookOpenCheck,
      iconClass: "border-indigo-200 bg-indigo-50 text-indigo-700",
      proof: "bg-[linear-gradient(120deg,rgba(99,102,241,0.08),rgba(147,51,234,0.12))]",
    };
  }

  if (category === "Hackathon") {
    return {
      card: "border-cyan-200 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdff_45%,#ecfeff_100%)]",
      chip: "border-cyan-200 bg-cyan-50 text-cyan-700",
      icon: Zap,
      iconClass: "border-cyan-200 bg-cyan-50 text-cyan-700",
      proof: "bg-[linear-gradient(120deg,rgba(6,182,212,0.10),rgba(17,24,39,0.08))]",
    };
  }

  if (category === "Sports") {
    return {
      card: "border-red-200 bg-[linear-gradient(135deg,#ffffff_0%,#fff7f7_55%,#fee2e2_100%)]",
      chip: "border-red-200 bg-red-50 text-red-700",
      icon: Medal,
      iconClass: "border-red-200 bg-red-50 text-red-700",
      proof: "bg-[linear-gradient(120deg,rgba(239,68,68,0.10),rgba(251,191,36,0.08))]",
    };
  }

  if (category === "Cultural") {
    return {
      card: "border-orange-200 bg-[linear-gradient(135deg,#ffffff_0%,#fff8f1_55%,#ffedd5_100%)]",
      chip: "border-orange-200 bg-orange-50 text-orange-700",
      icon: Star,
      iconClass: "border-orange-200 bg-orange-50 text-orange-700",
      proof: "bg-[linear-gradient(120deg,rgba(249,115,22,0.10),rgba(251,191,36,0.10))]",
    };
  }

  return {
    card: "border-blue-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_52%,#dbeafe_100%)]",
    chip: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Code2,
    iconClass: "border-blue-200 bg-blue-50 text-blue-700",
    proof: "bg-[linear-gradient(120deg,rgba(37,99,235,0.10),rgba(14,165,233,0.10))]",
  };
}

function statusClass(status: Achievement["status"]) {
  if (status === "Verified") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Faculty approved") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-orange-200 bg-orange-50 text-orange-700";
}

function tierClass(tier: BadgeItem["tier"]) {
  if (tier === "Legendary") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (tier === "Rare") {
    return "border-purple-200 bg-purple-50 text-purple-800";
  }

  if (tier === "Earned") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  return "border-slate-200 bg-slate-50 text-slate-500";
}

function MetricCard({ metric }: { metric: (typeof metrics)[number] }) {
  const Icon = metric.icon;

  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <span className={cn("grid size-11 place-items-center rounded-xl border", metric.className)}>
            <Icon className="size-5" />
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Rising
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
            {metric.value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{metric.detail}</p>
        </div>
        <div className="flex items-end gap-1.5">
          {[34, 48, 42, 64, 58, 76, 88].map((height) => (
            <span
              key={height}
              className="w-full rounded-t bg-slate-900/80 transition duration-200 group-hover:bg-slate-950"
              style={{ height: `${height / 4}px` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const styles = categoryStyles(achievement.category);
  const Icon = styles.icon;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-3xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]",
        styles.card,
      )}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-4">
          <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl border", styles.iconClass)}>
            <Icon className="size-6" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge className={styles.chip}>{achievement.category}</Badge>
              <Badge variant="outline" className="bg-white">
                {achievement.level}
              </Badge>
              <Badge className={statusClass(achievement.status)}>
                <ShieldCheck className="size-3" />
                {achievement.status}
              </Badge>
            </div>
            <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-normal text-foreground">
              {achievement.title}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              {achievement.description}
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-right shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Impact score
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-normal text-foreground">
            {achievement.impact}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Role", achievement.role],
              ["Team size", achievement.team],
              ["Outcome", achievement.outcome],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-black/5 bg-white/70 p-3">
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-foreground">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {achievement.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-black/5 bg-white/75 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className={cn("rounded-3xl border border-white/80 p-4", styles.proof)}>
          <div className="rounded-2xl border border-white/80 bg-white/75 p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-white">
                <FileText className="size-5 text-slate-700" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                  Proof preview
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-foreground">
                  {achievement.proof}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Button variant="outline" className="justify-between rounded-xl bg-white">
                View proof
                <ExternalLink className="size-4" />
              </Button>
              {achievement.project ? (
                <Button variant="outline" className="justify-between rounded-xl bg-white">
                  View project
                  <ArrowUpRight className="size-4" />
                </Button>
              ) : null}
              {achievement.publication ? (
                <Button variant="outline" className="justify-between rounded-xl bg-white">
                  View publication
                  <ArrowUpRight className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {achievement.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="size-4" />
            {achievement.organization}
          </span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-amber-600" />
          +{achievement.points} credibility points
        </div>
      </div>
    </article>
  );
}

function CredibilityScore() {
  return (
    <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcff_52%,#eef2ff_100%)]">
      <CardContent className="grid gap-6 p-6 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-center">
        <div className="relative mx-auto grid size-64 place-items-center">
          <div className="absolute size-60 rounded-full border border-slate-200" />
          <div className="absolute size-44 rounded-full border border-slate-200" />
          <div className="absolute size-28 rounded-full border border-slate-200" />
          <div className="absolute h-px w-60 bg-slate-200" />
          <div className="absolute h-60 w-px bg-slate-200" />
          <div
            className="absolute size-52 bg-slate-950/88"
            style={{
              clipPath: "polygon(50% 5%, 86% 26%, 84% 68%, 51% 90%, 17% 69%, 14% 27%)",
            }}
          />
          <div
            className="absolute size-52 border border-cyan-300/40 bg-cyan-300/20"
            style={{
              clipPath: "polygon(50% 14%, 78% 32%, 73% 65%, 53% 78%, 27% 66%, 24% 34%)",
            }}
          />
          <span className="relative grid size-24 place-items-center rounded-full bg-white text-center shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
            <span>
              <span className="block text-3xl font-semibold tracking-normal text-foreground">
                842
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
                Score
              </span>
            </span>
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <Badge className="border-slate-200 bg-white text-slate-700">
              Engineering Credibility Score
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">
              Reputation built from verified proof, not claims.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              Score combines verification quality, competitive level, research depth,
              technical output, leadership, and consistency.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Strongest domain", "Hackathon"],
              ["Weakest domain", "Research output"],
              ["Growth", "+18%"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border bg-white p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 text-lg font-semibold tracking-normal text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {scoreFactors.map((factor) => (
              <div key={factor.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{factor.label}</span>
                  <span className="text-muted-foreground">{factor.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", factor.tone)}
                    style={{ width: `${factor.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeSystem() {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Earned reputation badges</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Rare signals unlock as proof quality and impact increase.
            </p>
          </div>
          <Badge variant="outline" className="bg-white">
            5 unlocked
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 xl:grid-cols-4">
        {badges.map((badge) => {
          const Icon = badge.icon;
          const locked = badge.tier === "Locked";

          return (
            <div
              key={badge.name}
              className={cn(
                "group rounded-3xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]",
                tierClass(badge.tier),
                locked && "opacity-75",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-12 place-items-center rounded-2xl border border-current/20 bg-white/65">
                  {locked ? <LockKeyhole className="size-5" /> : <Icon className="size-5" />}
                </span>
                <Badge className={tierClass(badge.tier)}>{badge.tier}</Badge>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-normal">{badge.name}</h3>
              <p className="mt-2 text-sm leading-6 opacity-80">{badge.condition}</p>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs font-medium">
                  <span>Progress</span>
                  <span>{badge.progress}%</span>
                </div>
                <Progress value={badge.progress} className="h-1.5 bg-white/70" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TimelineMap() {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <CardTitle className="text-2xl">Career progression map</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          A timeline of verified proof, recognition, and portfolio growth.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-8">
          {timeline.map((year) => (
            <div key={year.year} className="grid gap-4 md:grid-cols-[90px_minmax(0,1fr)]">
              <div className="text-2xl font-semibold tracking-normal text-foreground">
                {year.year}
              </div>
              <div className="relative space-y-4 border-l border-border pl-5">
                {year.items.map((item) => (
                  <details key={item.title} className="group rounded-2xl border border-border bg-white p-4 transition duration-200 open:shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
                    <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <div className="absolute -left-2.5 mt-1 size-5 rounded-full border border-white bg-slate-950 shadow-[0_0_0_4px_#f8fafc]" />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {item.detail}
                          </p>
                        </div>
                        <Badge className={item.status === "Under review" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>
                          {item.status}
                        </Badge>
                      </div>
                    </summary>
                    <div className="mt-4 rounded-xl border border-border bg-muted/25 p-3 text-sm leading-6 text-muted-foreground">
                      Verification event recorded in the proofbook and connected to the
                      student credibility score.
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentAchievementsPage() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-start">
        <div className="flex gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
            <Trophy className="size-7" />
          </span>
          <div>
            <h1 className="text-balance">Achievement Portfolio</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              Verified proof of academic, technical, leadership, and competitive
              accomplishments.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge className="border-slate-200 bg-white text-slate-700">
                Top 12% engineering profile
              </Badge>
              <Badge className="border-purple-200 bg-purple-50 text-purple-700">
                Credibility level: Advanced
              </Badge>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                78% verified
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <Button className="rounded-xl">
            <Plus className="size-4" />
            Add Achievement
          </Button>
          <Button variant="outline" className="rounded-xl bg-white">
            <Download className="size-4" />
            Export portfolio
          </Button>
          <Button variant="outline" className="rounded-xl bg-white">
            <Share2 className="size-4" />
            Share profile
          </Button>
          <Button variant="outline" className="rounded-xl bg-white">
            <FileDown className="size-4" />
            Proofbook PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <CredibilityScore />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-foreground">
                Verified milestones
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Proof-backed accomplishments with role, outcome, and impact context.
              </p>
            </div>
            <Badge variant="outline" className="bg-white">
              {achievements.length} featured
            </Badge>
          </div>
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.title} achievement={achievement} />
          ))}
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white">
            <CardContent className="space-y-5 p-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
                <Award className="size-3.5" />
                Public Portfolio Mode
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-normal text-white">
                  Recruiter-ready proof profile
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  Generate a shareable achievement profile for faculty review,
                  resumes, interviews, and public portfolio pages.
                </p>
              </div>
              <div className="grid gap-3">
                {["Shareable profile", "Faculty review mode", "Resume export"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/78"
                  >
                    <CheckCircle2 className="size-4 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
              <Button className="w-full rounded-xl bg-white text-slate-950 hover:bg-white/90">
                Open showcase mode
                <ArrowUpRight className="size-4" />
              </Button>
            </CardContent>
          </Card>

          <TimelineMap />
        </div>
      </div>

      <BadgeSystem />
    </section>
  );
}
