import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlignLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bookmark,
  Boxes,
  CheckCircle2,
  Clock3,
  Cloud,
  Command,
  Compass,
  Database,
  FileText,
  Folder,
  GraduationCap,
  Layers3,
  ListChecks,
  Mic2,
  Microscope,
  MonitorPlay,
  PenLine,
  Presentation,
  Quote,
  Rocket,
  Route,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquareTerminal,
  Target,
  TrendingUp,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Playbook = {
  title: string;
  value: string;
  duration: string;
  steps: number;
  difficulty: string;
  progress: number;
  icon: LucideIcon;
  saved?: boolean;
};

type Domain = {
  name: string;
  theme: string;
  chip: string;
  accent: string;
  panelClass: string;
  chipClass: string;
  iconClass: string;
  visualClass: string;
  hoverClass: string;
  icon: LucideIcon;
  playbooks: Playbook[];
};

type Stage = {
  title: string;
  description: string;
  domains: Domain[];
};

const filters = [
  "Beginner Friendly",
  "Most Used",
  "Trending",
  "Faculty Recommended",
  "Deployment",
  "IEEE",
  "MVP",
  "Viva",
];

const analytics = [
  { label: "Total playbooks", value: "24", detail: "Across 8 operating domains" },
  { label: "Completion", value: "62%", detail: "7 completed this semester" },
  { label: "Faculty picks", value: "6", detail: "Prioritized for final review" },
];

const learningPath = [
  "Select project",
  "Validate scope",
  "Build MVP",
  "Prove results",
  "Publish pack",
];

const stages: Stage[] = [
  {
    title: "Start Your Project",
    description: "Turn a broad idea into a scoped mission with evidence.",
    domains: [
      {
        name: "Selection",
        theme: "Choosing the right mission",
        chip: "Project discovery",
        accent: "Indigo",
        panelClass:
          "border-indigo-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7f8ff_54%,#eef2ff_100%)]",
        chipClass: "border-indigo-200 bg-indigo-50 text-indigo-700",
        iconClass: "border-indigo-200 bg-indigo-50 text-indigo-700",
        visualClass:
          "bg-[linear-gradient(to_right,rgba(79,70,229,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.10)_1px,transparent_1px)] bg-[size:18px_18px]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(79,70,229,0.14)]",
        icon: Compass,
        playbooks: [
          {
            title: "How to select a project",
            value: "Score ideas by feasibility, novelty, and review value.",
            duration: "35 min",
            steps: 7,
            difficulty: "Beginner",
            progress: 84,
            icon: Compass,
            saved: true,
          },
          {
            title: "Problem validation",
            value: "Convert assumptions into mentor-ready validation notes.",
            duration: "45 min",
            steps: 9,
            difficulty: "Core",
            progress: 58,
            icon: Target,
          },
          {
            title: "Scope analysis",
            value: "Set boundaries before engineering work expands.",
            duration: "30 min",
            steps: 6,
            difficulty: "Core",
            progress: 40,
            icon: Route,
          },
        ],
      },
    ],
  },
  {
    title: "Research & Validation",
    description: "Build the academic intelligence layer and prove the work.",
    domains: [
      {
        name: "Research",
        theme: "Academic intelligence layer",
        chip: "Investigation",
        accent: "Purple",
        panelClass:
          "border-purple-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbf7ff_52%,#f3e8ff_100%)]",
        chipClass: "border-purple-200 bg-purple-50 text-purple-700",
        iconClass: "border-purple-200 bg-purple-50 text-purple-700",
        visualClass:
          "bg-[linear-gradient(115deg,transparent_0%,transparent_42%,rgba(126,34,206,0.08)_42%,rgba(126,34,206,0.08)_58%,transparent_58%)]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(126,34,206,0.13)]",
        icon: Microscope,
        playbooks: [
          {
            title: "Research methodology",
            value: "Frame claims, variables, baselines, and evaluation logic.",
            duration: "55 min",
            steps: 10,
            difficulty: "Advanced",
            progress: 64,
            icon: Microscope,
          },
          {
            title: "Paper analysis",
            value: "Extract methods, datasets, gaps, and reusable evidence.",
            duration: "40 min",
            steps: 8,
            difficulty: "Core",
            progress: 72,
            icon: FileText,
          },
          {
            title: "Dataset collection",
            value: "Build a defensible data source and cleaning protocol.",
            duration: "50 min",
            steps: 9,
            difficulty: "Core",
            progress: 38,
            icon: Database,
          },
          {
            title: "Prior work evaluation",
            value: "Compare related systems without shallow summaries.",
            duration: "45 min",
            steps: 8,
            difficulty: "IEEE",
            progress: 51,
            icon: Quote,
          },
        ],
      },
      {
        name: "Validation",
        theme: "Evidence and proof",
        chip: "Testing",
        accent: "Emerald",
        panelClass:
          "border-emerald-200 bg-[linear-gradient(135deg,#ffffff_0%,#f3fff9_56%,#ecfdf5_100%)]",
        chipClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        iconClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        visualClass:
          "bg-[repeating-linear-gradient(90deg,rgba(16,185,129,0.12)_0px,rgba(16,185,129,0.12)_2px,transparent_2px,transparent_18px)]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(16,185,129,0.14)]",
        icon: ShieldCheck,
        playbooks: [
          {
            title: "Model evaluation",
            value: "Connect metrics to honest model behavior.",
            duration: "45 min",
            steps: 8,
            difficulty: "Core",
            progress: 76,
            icon: Activity,
          },
          {
            title: "Accuracy testing",
            value: "Run repeatable tests and capture failure cases.",
            duration: "30 min",
            steps: 6,
            difficulty: "Beginner",
            progress: 68,
            icon: ShieldCheck,
          },
          {
            title: "Benchmarking",
            value: "Compare performance against a baseline students can defend.",
            duration: "50 min",
            steps: 9,
            difficulty: "Advanced",
            progress: 44,
            icon: BarChart3,
          },
        ],
      },
    ],
  },
  {
    title: "Build & Engineer",
    description: "Move from prototype energy into production-grade execution.",
    domains: [
      {
        name: "Build",
        theme: "Engineering execution",
        chip: "Product engineering",
        accent: "Deep blue",
        panelClass:
          "border-blue-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_50%,#eaf3ff_100%)]",
        chipClass: "border-blue-200 bg-blue-50 text-blue-700",
        iconClass: "border-blue-200 bg-blue-50 text-blue-700",
        visualClass:
          "bg-[linear-gradient(to_right,rgba(37,99,235,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.08)_1px,transparent_1px)] bg-[size:28px_22px]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(37,99,235,0.14)]",
        icon: Layers3,
        playbooks: [
          {
            title: "MVP building",
            value: "Ship a thin but coherent version before adding scope.",
            duration: "60 min",
            steps: 12,
            difficulty: "Core",
            progress: 82,
            icon: Boxes,
            saved: true,
          },
          {
            title: "Architecture diagrams",
            value: "Make system design reviewable before implementation.",
            duration: "35 min",
            steps: 7,
            difficulty: "Core",
            progress: 46,
            icon: Layers3,
          },
          {
            title: "Backend systems",
            value: "Plan APIs, services, auth boundaries, and failure paths.",
            duration: "55 min",
            steps: 10,
            difficulty: "Advanced",
            progress: 33,
            icon: SquareTerminal,
          },
          {
            title: "Database setup",
            value: "Model storage around evidence, access, and future queries.",
            duration: "40 min",
            steps: 8,
            difficulty: "Core",
            progress: 52,
            icon: Database,
          },
        ],
      },
      {
        name: "Deploy",
        theme: "Launch to production",
        chip: "Shipping",
        accent: "Black + neon",
        panelClass:
          "border-slate-800 bg-[linear-gradient(135deg,#0b1020_0%,#111827_54%,#061019_100%)] text-white",
        chipClass: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        iconClass: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        visualClass:
          "bg-[linear-gradient(to_right,rgba(34,211,238,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.10)_1px,transparent_1px)] bg-[size:24px_24px]",
        hoverClass: "hover:shadow-[0_18px_55px_rgba(8,47,73,0.22)]",
        icon: Rocket,
        playbooks: [
          {
            title: "Vercel deployment",
            value: "Deploy, verify, and keep preview links evaluator-safe.",
            duration: "35 min",
            steps: 7,
            difficulty: "Beginner",
            progress: 88,
            icon: Rocket,
          },
          {
            title: "CI/CD basics",
            value: "Turn manual checks into a repeatable release path.",
            duration: "45 min",
            steps: 8,
            difficulty: "Core",
            progress: 28,
            icon: Cloud,
          },
          {
            title: "Production setup",
            value: "Prepare environment, secrets, domains, and monitoring.",
            duration: "50 min",
            steps: 10,
            difficulty: "Advanced",
            progress: 35,
            icon: Server,
          },
        ],
      },
    ],
  },
  {
    title: "Publish & Present",
    description: "Turn engineering progress into a credible academic story.",
    domains: [
      {
        name: "Writing",
        theme: "Professional technical publishing",
        chip: "Technical communication",
        accent: "Graphite",
        panelClass:
          "border-neutral-200 bg-[linear-gradient(135deg,#ffffff_0%,#fafafa_52%,#f4f4f5_100%)]",
        chipClass: "border-neutral-300 bg-neutral-100 text-neutral-700",
        iconClass: "border-neutral-300 bg-neutral-100 text-neutral-700",
        visualClass:
          "bg-[repeating-linear-gradient(0deg,rgba(23,23,23,0.07)_0px,rgba(23,23,23,0.07)_1px,transparent_1px,transparent_18px)]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(23,23,23,0.10)]",
        icon: PenLine,
        playbooks: [
          {
            title: "IEEE writing",
            value: "Draft sections with reviewer expectations in mind.",
            duration: "50 min",
            steps: 9,
            difficulty: "IEEE",
            progress: 69,
            icon: FileText,
          },
          {
            title: "Abstract creation",
            value: "Compress problem, method, result, and contribution.",
            duration: "25 min",
            steps: 5,
            difficulty: "Beginner",
            progress: 91,
            icon: AlignLeft,
          },
          {
            title: "Report formatting",
            value: "Make the final document clean, consistent, and exportable.",
            duration: "35 min",
            steps: 7,
            difficulty: "Core",
            progress: 57,
            icon: PenLine,
          },
        ],
      },
      {
        name: "Presentation",
        theme: "Defending your work",
        chip: "Viva and demo",
        accent: "Orange",
        panelClass:
          "border-orange-200 bg-[linear-gradient(135deg,#ffffff_0%,#fff8f2_54%,#ffedd5_100%)]",
        chipClass: "border-orange-200 bg-orange-50 text-orange-700",
        iconClass: "border-orange-200 bg-orange-50 text-orange-700",
        visualClass:
          "bg-[linear-gradient(90deg,transparent_0%,transparent_20%,rgba(249,115,22,0.10)_20%,rgba(249,115,22,0.10)_80%,transparent_80%)]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(249,115,22,0.14)]",
        icon: Presentation,
        playbooks: [
          {
            title: "Viva preparation",
            value: "Prepare for methodology, tradeoff, and evidence questions.",
            duration: "45 min",
            steps: 9,
            difficulty: "Core",
            progress: 61,
            icon: Mic2,
          },
          {
            title: "Presentation storytelling",
            value: "Structure slides around problem, proof, and impact.",
            duration: "40 min",
            steps: 8,
            difficulty: "Core",
            progress: 54,
            icon: Presentation,
          },
          {
            title: "Demo walkthrough",
            value: "Make the product demo crisp, repeatable, and resilient.",
            duration: "30 min",
            steps: 6,
            difficulty: "Beginner",
            progress: 43,
            icon: MonitorPlay,
          },
        ],
      },
    ],
  },
  {
    title: "Ship & Document",
    description: "Preserve the knowledge system that makes the project credible.",
    domains: [
      {
        name: "Documentation",
        theme: "Project memory system",
        chip: "Knowledge base",
        accent: "Slate",
        panelClass:
          "border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_58%,#eef2f7_100%)]",
        chipClass: "border-slate-200 bg-slate-100 text-slate-700",
        iconClass: "border-slate-200 bg-slate-100 text-slate-700",
        visualClass:
          "bg-[repeating-linear-gradient(90deg,rgba(51,65,85,0.09)_0px,rgba(51,65,85,0.09)_1px,transparent_1px,transparent_28px)]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(51,65,85,0.12)]",
        icon: BookOpen,
        playbooks: [
          {
            title: "Technical documentation",
            value: "Capture setup, system behavior, decisions, and operations.",
            duration: "45 min",
            steps: 8,
            difficulty: "Core",
            progress: 66,
            icon: BookOpen,
          },
          {
            title: "README writing",
            value: "Make the repository understandable in three minutes.",
            duration: "25 min",
            steps: 5,
            difficulty: "Beginner",
            progress: 79,
            icon: FileText,
          },
          {
            title: "API documentation",
            value: "Describe endpoints, payloads, auth rules, and examples.",
            duration: "40 min",
            steps: 7,
            difficulty: "Advanced",
            progress: 32,
            icon: Folder,
          },
        ],
      },
    ],
  },
];

function PlaybookCard({ playbook, domain }: { playbook: Playbook; domain: Domain }) {
  const Icon = playbook.icon;

  return (
    <article
      className={cn(
        "group/playbook relative overflow-hidden rounded-2xl border border-black/5 bg-white/[0.82] p-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur transition duration-200 hover:-translate-y-0.5",
        domain.name === "Deploy" && "border-white/10 bg-white/[0.06] text-white",
        domain.hoverClass,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-20 opacity-70", domain.visualClass)} />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "grid size-10 place-items-center rounded-xl border bg-white",
              domain.iconClass,
            )}
          >
            <Icon className="size-5" />
          </div>
          <button
            type="button"
            aria-label={`Save ${playbook.title}`}
            className={cn(
              "grid size-8 place-items-center rounded-full border border-black/10 bg-white/75 text-muted-foreground transition duration-200 hover:scale-105 hover:text-foreground",
              playbook.saved && "text-foreground",
              domain.name === "Deploy" &&
                "border-white/10 bg-white/10 text-white/60 hover:text-white",
            )}
          >
            <Bookmark className="size-4" />
          </button>
        </div>

        <div>
          <Badge className={domain.chipClass}>{domain.name}</Badge>
          <h3
            className={cn(
              "mt-3 text-lg font-semibold tracking-normal text-foreground",
              domain.name === "Deploy" && "text-white",
            )}
          >
            {playbook.title}
          </h3>
          <p
            className={cn(
              "mt-2 text-sm leading-6 text-muted-foreground",
              domain.name === "Deploy" && "text-white/[0.65]",
            )}
          >
            {playbook.value}
          </p>
        </div>

        <div
          className={cn(
            "grid grid-cols-3 gap-2 text-xs text-muted-foreground",
            domain.name === "Deploy" && "text-white/60",
          )}
        >
          <span className="flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {playbook.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <ListChecks className="size-3.5" />
            {playbook.steps} steps
          </span>
          <span className="truncate rounded-full border border-black/10 bg-white/70 px-2 py-1 text-center font-medium text-foreground">
            {playbook.difficulty}
          </span>
        </div>

        <div className="space-y-2">
          <div
            className={cn(
              "flex items-center justify-between text-xs font-medium text-muted-foreground",
              domain.name === "Deploy" && "text-white/60",
            )}
          >
            <span>Progress</span>
            <span>{playbook.progress}%</span>
          </div>
          <Progress
            value={playbook.progress}
            className={cn(
              "h-1.5 bg-slate-200/80 transition duration-300 group-hover/playbook:bg-slate-200",
              domain.name === "Deploy" && "bg-white/12",
            )}
          />
        </div>
      </div>
    </article>
  );
}

function DomainPanel({ domain }: { domain: Domain }) {
  const Icon = domain.icon;
  const wide = domain.playbooks.length > 3;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border p-4 transition duration-200 sm:p-5",
        domain.panelClass,
      )}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] xl:items-stretch">
        <div className="relative min-h-52 overflow-hidden rounded-2xl border border-black/5 bg-white/[0.62] p-5">
          <div className={cn("absolute inset-0 opacity-90", domain.visualClass)} />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <div
                className={cn(
                  "mb-4 grid size-11 place-items-center rounded-xl border",
                  domain.iconClass,
                )}
              >
                <Icon className="size-5" />
              </div>
              <Badge className={domain.chipClass}>{domain.chip}</Badge>
              <h3 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">
                {domain.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{domain.theme}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-10 rounded-xl border border-black/5 bg-white/[0.65]"
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-3",
            wide ? "md:grid-cols-2" : "md:grid-cols-3 xl:grid-cols-1",
          )}
        >
          {domain.playbooks.map((playbook) => (
            <PlaybookCard key={playbook.title} playbook={playbook} domain={domain} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ExecutionPlaybookPage() {
  return (
    <PageContainer
      title="Execution Playbooks"
      description="Step-by-step operational guides for building production-ready engineering projects."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-white">
            24 playbooks
          </Badge>
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            62% complete
          </Badge>
        </div>
      }
      className="pb-3"
    >
      <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcff_52%,#f3f6fb_100%)]">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-12 rounded-2xl border-slate-200 bg-white pl-11 pr-28 shadow-[0_14px_35px_rgba(15,23,42,0.04)] focus-visible:ring-slate-900/10"
                placeholder="Search playbooks, deployment, viva, MVP..."
              />
              <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-xl border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground sm:flex">
                <Command className="size-3" />
                Playbooks
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {analytics.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-white p-3">
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold tracking-normal text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className="shrink-0 rounded-full border border-border bg-white px-3.5 py-2 text-xs font-medium text-muted-foreground transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-foreground hover:shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
              >
                {filter}
              </button>
            ))}
            <button
              type="button"
              className="shrink-0 rounded-full border border-border bg-slate-950 px-3.5 py-2 text-xs font-medium text-white transition duration-200 hover:-translate-y-0.5"
            >
              <SlidersHorizontal className="mr-1.5 inline size-3.5" />
              More filters
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-slate-200">
          <CardContent className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_220px] sm:p-6">
            <div>
              <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                Recommended next playbook
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">
                MVP building
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Your project scope is stable. Continue with the operating guide
                that turns validated requirements into a working product slice.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button className="rounded-xl">
                  Continue learning
                  <ArrowRight className="size-4" />
                </Button>
                <Button variant="outline" className="rounded-xl">
                  View path
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">Sequential path</p>
              <div className="mt-4 space-y-3">
                {learningPath.map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-6 place-items-center rounded-full border text-xs font-semibold",
                        index < 2
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : index === 2
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-border bg-white text-muted-foreground",
                      )}
                    >
                      {index < 2 ? <CheckCircle2 className="size-3.5" /> : index + 1}
                    </span>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
                  <GraduationCap className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Faculty picks</p>
                  <p className="text-xs text-muted-foreground">High-signal review aids</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {["Research methodology", "Benchmarking", "Viva preparation"].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-medium text-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <TrendingUp className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Recently completed</p>
                  <p className="text-xs text-muted-foreground">3 closed this week</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {["How to select a project", "Abstract creation", "README writing"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-medium text-foreground"
                    >
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      {item}
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-7">
        {stages.map((stage) => (
          <section key={stage.title} className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                  <Sparkles className="size-3.5" />
                  Execution stage
                </div>
                <h2 className="text-2xl font-semibold tracking-normal text-foreground">
                  {stage.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {stage.description}
                </p>
              </div>
              <Badge variant="outline" className="bg-white">
                {stage.domains.length} domain{stage.domains.length > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="grid gap-5">
              {stage.domains.map((domain) => (
                <DomainPanel key={domain.name} domain={domain} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
