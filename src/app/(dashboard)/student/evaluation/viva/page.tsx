import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Database,
  Gauge,
  Layers3,
  MessageSquareText,
  Mic,
  Network,
  Play,
  RadioTower,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type PracticeState = "not-practiced" | "practicing" | "reviewed" | "ready";

type VivaQuestion = {
  category: string;
  difficulty: string;
  duration: string;
  question: string;
  hint: string[];
  structure: string[];
  concepts: string[];
  mistakes: string[];
  state: PracticeState;
  confidence: number;
  coverage: number;
  scores?: {
    clarity: number;
    depth: number;
    confidence: number;
    conciseness: number;
  };
  strengths?: string[];
  weaknesses?: string[];
  followUp?: string;
  icon: LucideIcon;
};

const defenseGroups = [
  {
    title: "Project Foundation",
    description: "Defend why the project matters and who it helps.",
    questions: [
      {
        category: "Research",
        difficulty: "Basic",
        duration: "Expected: 45-60 sec",
        question: "What exact problem are you solving, and why is it worth solving?",
        hint: ["Problem clarity", "Target users", "Practical impact"],
        structure: ["State the problem", "Name affected users", "Explain measurable value"],
        concepts: ["User pain", "Scope boundary", "Outcome metric"],
        mistakes: ["Giving a vague domain summary", "Skipping who benefits"],
        state: "ready" as const,
        confidence: 88,
        coverage: 92,
        scores: { clarity: 9, depth: 8, confidence: 9, conciseness: 8 },
        strengths: ["Clear user framing", "Strong impact statement"],
        weaknesses: ["Add one quantitative adoption signal"],
        followUp: "Which stakeholder would reject your solution first, and why?",
        icon: BrainCircuit,
      },
      {
        category: "Dataset",
        difficulty: "Intermediate",
        duration: "Expected: 60-90 sec",
        question: "How did you validate that your dataset represents real field conditions?",
        hint: ["Data source quality", "Bias awareness", "Cleaning process"],
        structure: ["Describe source", "Explain cleaning", "Call out limitations"],
        concepts: ["Sampling bias", "Label quality", "Train-test split"],
        mistakes: ["Claiming the dataset is perfect", "Ignoring low-light failure cases"],
        state: "reviewed" as const,
        confidence: 72,
        coverage: 78,
        scores: { clarity: 8, depth: 7, confidence: 7, conciseness: 8 },
        strengths: ["Good cleaning explanation", "Honest limitation note"],
        weaknesses: ["Weak benchmark comparison", "Need stronger bias discussion"],
        followUp: "What happens when the leaf image is blurred or underexposed?",
        icon: Database,
      },
    ],
  },
  {
    title: "Technical Architecture",
    description: "Explain the system, pipeline, and engineering decisions under pressure.",
    questions: [
      {
        category: "Architecture",
        difficulty: "Panel-level",
        duration: "Expected: 75-120 sec",
        question: "Walk the panel through your end-to-end system architecture.",
        hint: ["Pipeline order", "Service responsibilities", "Failure paths"],
        structure: ["Input", "Processing pipeline", "Model/API layer", "Output and monitoring"],
        concepts: ["Frontend boundary", "Inference service", "Storage", "Error handling"],
        mistakes: ["Listing tools without flow", "Skipping what fails safely"],
        state: "practicing" as const,
        confidence: 64,
        coverage: 70,
        icon: Layers3,
      },
      {
        category: "ML Model",
        difficulty: "Panel-level",
        duration: "Expected: 45-90 sec",
        question: "Why did you choose EfficientNet-B0 over ResNet?",
        hint: ["Technical tradeoff understanding", "Model selection reasoning", "Research awareness"],
        structure: ["Compare constraints", "Explain accuracy/latency tradeoff", "Link to deployment"],
        concepts: ["Parameter efficiency", "Baseline comparison", "Edge feasibility"],
        mistakes: ["Saying it is simply more accurate", "No benchmark evidence"],
        state: "reviewed" as const,
        confidence: 69,
        coverage: 74,
        scores: { clarity: 8, depth: 7.5, confidence: 6.5, conciseness: 8 },
        strengths: ["Good architecture explanation", "Clear model reasoning"],
        weaknesses: ["Weak benchmark comparison", "No scalability discussion"],
        followUp: "How does this scale on edge devices?",
        icon: Network,
      },
    ],
  },
  {
    title: "Research & Validation",
    description: "Show that your results are defendable, not just presentable.",
    questions: [
      {
        category: "Validation",
        difficulty: "Intermediate",
        duration: "Expected: 60-90 sec",
        question: "Which metric best proves your system is reliable, and what does it miss?",
        hint: ["Metric selection", "Failure interpretation", "Evidence honesty"],
        structure: ["Name primary metric", "Explain why", "State blind spots"],
        concepts: ["F1 score", "Confusion matrix", "False positives", "False negatives"],
        mistakes: ["Only quoting accuracy", "Ignoring class imbalance"],
        state: "practicing" as const,
        confidence: 58,
        coverage: 63,
        icon: Gauge,
      },
      {
        category: "Research",
        difficulty: "Panel-level",
        duration: "Expected: 75-100 sec",
        question: "What is your novelty compared with the prior work you reviewed?",
        hint: ["Literature awareness", "Contribution clarity", "Academic positioning"],
        structure: ["State prior pattern", "Identify gap", "Name your contribution"],
        concepts: ["Prior art", "Research gap", "Contribution", "Reproducibility"],
        mistakes: ["Calling implementation novelty research novelty", "No cited comparison"],
        state: "not-practiced" as const,
        confidence: 34,
        coverage: 41,
        icon: ScanLine,
      },
    ],
  },
  {
    title: "Deployment & Scalability",
    description: "Defend how the product behaves outside a demo environment.",
    questions: [
      {
        category: "Deployment",
        difficulty: "Intermediate",
        duration: "Expected: 45-75 sec",
        question: "What changes are needed before this system can run in production?",
        hint: ["Operational readiness", "Security", "Performance limits"],
        structure: ["Current deployment", "Known risks", "Production hardening plan"],
        concepts: ["Monitoring", "Secrets", "Latency", "Rollback"],
        mistakes: ["Saying deployment is finished", "Ignoring usage spikes"],
        state: "reviewed" as const,
        confidence: 76,
        coverage: 80,
        scores: { clarity: 8, depth: 8, confidence: 7, conciseness: 7 },
        strengths: ["Clear hardening plan", "Good monitoring awareness"],
        weaknesses: ["Mention rollback strategy earlier"],
        followUp: "How would you debug a failed inference request during viva?",
        icon: RadioTower,
      },
    ],
  },
  {
    title: "Limitations & Future Scope",
    description: "Answer weaknesses with maturity instead of defensiveness.",
    questions: [
      {
        category: "Scalability",
        difficulty: "Basic",
        duration: "Expected: 45-60 sec",
        question: "What is the biggest limitation of your current solution?",
        hint: ["Self-awareness", "Risk ownership", "Next-step planning"],
        structure: ["Name limitation", "Explain impact", "Describe mitigation"],
        concepts: ["Failure cases", "Dataset gap", "Model drift", "Future scope"],
        mistakes: ["Pretending there are no limitations", "Giving a generic future scope"],
        state: "ready" as const,
        confidence: 86,
        coverage: 89,
        scores: { clarity: 9, depth: 8, confidence: 9, conciseness: 8 },
        strengths: ["Mature limitation framing", "Actionable improvement plan"],
        weaknesses: ["Tie mitigation to timeline"],
        followUp: "What would you improve if you had four more weeks?",
        icon: ShieldCheck,
      },
    ],
  },
];

const readinessBars = [
  { label: "Architecture", value: 78, tone: "bg-blue-500" },
  { label: "Model reasoning", value: 69, tone: "bg-purple-500" },
  { label: "Research depth", value: 56, tone: "bg-orange-500" },
  { label: "Deployment", value: 76, tone: "bg-cyan-500" },
  { label: "Limitations", value: 86, tone: "bg-emerald-500" },
];

const heatmap = [
  ["Architecture", "Strong"],
  ["Dataset", "Medium"],
  ["Prior work", "Risk"],
  ["Benchmarking", "Risk"],
  ["Deployment", "Strong"],
  ["Scalability", "Medium"],
];

function stateMeta(state: PracticeState) {
  if (state === "ready") {
    return {
      label: "Faculty-ready",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }

  if (state === "reviewed") {
    return {
      label: "Reviewed",
      className: "border-blue-200 bg-blue-50 text-blue-700",
      icon: Sparkles,
    };
  }

  if (state === "practicing") {
    return {
      label: "Practicing",
      className: "border-orange-200 bg-orange-50 text-orange-700",
      icon: Activity,
    };
  }

  return {
    label: "Not practiced",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: CircleDot,
  };
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
        {value}/10
      </p>
      <Progress value={value * 10} className="mt-3 h-1.5 bg-muted" />
    </div>
  );
}

function QuestionCard({
  question,
  defaultOpen,
}: {
  question: VivaQuestion;
  defaultOpen?: boolean;
}) {
  const meta = stateMeta(question.state);
  const MetaIcon = meta.icon;
  const Icon = question.icon;
  const practicing = question.state === "practicing";
  const reviewed = question.state === "reviewed" || question.state === "ready";

  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-3xl border border-border bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)] transition duration-200 open:shadow-[0_20px_55px_rgba(15,23,42,0.07)]"
    >
      <summary className="cursor-pointer list-none p-5 transition duration-200 hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                  {question.category}
                </Badge>
                <Badge
                  className={cn(
                    question.difficulty === "Panel-level"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : question.difficulty === "Intermediate"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700",
                  )}
                >
                  {question.difficulty}
                </Badge>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <Clock3 className="size-3" />
                  {question.duration}
                </span>
              </div>
              <h3 className="mt-4 max-w-4xl text-xl font-semibold leading-snug tracking-normal text-foreground">
                {question.question}
              </h3>
              <div className="mt-4 rounded-2xl border border-border bg-muted/25 p-4">
                <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                  What evaluators are checking
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {question.hint.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Badge className={meta.className}>
              <MetaIcon className="size-3" />
              {meta.label}
            </Badge>
            <ChevronDown className="size-5 text-muted-foreground transition duration-200 group-open:rotate-180" />
          </div>
        </div>
      </summary>

      <div className="border-t border-border bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfc_100%)] p-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Suggested structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {question.structure.map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Key concepts expected</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {question.concepts.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                  >
                    {item}
                  </span>
                ))}
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Common mistakes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {question.mistakes.map((item) => (
                  <div key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                    <AlertTriangle className="mt-1 size-4 shrink-0 text-orange-600" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className={cn("border-slate-200", practicing && "border-orange-200")}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Practice console</p>
                    <p className="text-xs text-muted-foreground">
                      Validate delivery, not checkbox completion.
                    </p>
                  </div>
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-full border",
                      practicing
                        ? "border-orange-200 bg-orange-50 text-orange-700 shadow-[0_0_0_8px_rgba(249,115,22,0.08)]"
                        : "border-slate-200 bg-slate-50 text-slate-700",
                    )}
                  >
                    <Mic className="size-5" />
                  </span>
                </div>

                {practicing ? (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-normal text-orange-700">
                        Recording answer
                      </span>
                      <span className="font-mono text-2xl font-semibold text-slate-950">
                        01:18
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Confidence meter</p>
                        <Progress value={question.confidence} className="mt-2 h-2 bg-orange-100" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Keyword coverage</p>
                        <Progress value={question.coverage} className="mt-2 h-2 bg-orange-100" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button className="rounded-xl">
                      <Play className="size-4" />
                      {question.state === "not-practiced" ? "Start practice" : "Retry practice"}
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                      <TimerReset className="size-4" />
                      90-sec drill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {reviewed && question.scores ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Answer Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <ScoreTile label="Technical depth" value={question.scores.depth} />
                    <ScoreTile label="Clarity" value={question.scores.clarity} />
                    <ScoreTile label="Confidence" value={question.scores.confidence} />
                    <ScoreTile label="Conciseness" value={question.scores.conciseness} />
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
                        Strengths
                      </p>
                      <ul className="mt-2 space-y-1 text-sm leading-6 text-emerald-800">
                        {question.strengths?.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-normal text-orange-700">
                        Weaknesses
                      </p>
                      <ul className="mt-2 space-y-1 text-sm leading-6 text-orange-800">
                        {question.weaknesses?.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                        Faculty follow-up likely
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                        {question.followUp}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </details>
  );
}

function RadarPanel() {
  return (
    <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_52%,#eef2ff_100%)]">
      <CardContent className="grid gap-6 p-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-center">
        <div className="relative mx-auto grid size-64 place-items-center">
          <div className="absolute size-60 rounded-full border border-slate-200" />
          <div className="absolute size-44 rounded-full border border-slate-200" />
          <div className="absolute size-28 rounded-full border border-slate-200" />
          <div className="absolute h-px w-60 bg-slate-200" />
          <div className="absolute h-60 w-px bg-slate-200" />
          <div
            className="absolute size-52 bg-slate-950/85"
            style={{
              clipPath:
                "polygon(50% 6%, 86% 31%, 77% 78%, 32% 84%, 13% 39%)",
            }}
          />
          <div
            className="absolute size-52 border border-slate-950/40 bg-cyan-400/20"
            style={{
              clipPath:
                "polygon(50% 15%, 80% 36%, 69% 72%, 36% 75%, 22% 43%)",
            }}
          />
          <span className="relative grid size-20 place-items-center rounded-full bg-white text-center shadow-[0_15px_40px_rgba(15,23,42,0.14)]">
            <span>
              <span className="block text-2xl font-semibold tracking-normal text-foreground">
                74%
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
                Ready
              </span>
            </span>
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <Badge className="border-slate-200 bg-white text-slate-700">
              Defense Readiness Tracker
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">
              Viva defense intelligence
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Track confidence, weak domains, and faculty risk areas before the
              final panel.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-5">
            {[
              ["Questions practiced", "7/9"],
              ["Avg confidence", "74%"],
              ["Weakest domain", "Research"],
              ["Strongest domain", "Limitations"],
              ["Risk areas", "2"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border bg-white p-3">
                <p className="text-xs leading-5 text-muted-foreground">{label}</p>
                <p className="mt-2 text-lg font-semibold tracking-normal text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-3">
              {readinessBars.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className={cn("h-full rounded-full", item.tone)} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {heatmap.map(([label, state]) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-xl border p-3 text-xs",
                    state === "Strong" && "border-emerald-200 bg-emerald-50 text-emerald-800",
                    state === "Medium" && "border-blue-200 bg-blue-50 text-blue-800",
                    state === "Risk" && "border-orange-200 bg-orange-50 text-orange-800",
                  )}
                >
                  <p className="font-semibold">{label}</p>
                  <p className="mt-1 opacity-75">{state}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentVivaPage() {
  return (
    <PageContainer
      title="Viva Defense Simulator"
      description="Practice defending your project under real faculty-style questioning."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-blue-200 bg-blue-50 text-blue-700">
            AI rehearsal mode
          </Badge>
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            7 questions practiced
          </Badge>
        </div>
      }
    >
      <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white shadow-[0_25px_80px_rgba(15,23,42,0.18)]">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
              <Mic className="size-3.5" />
              Panel Simulation
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-normal text-white">
              Train for rapid-fire faculty cross-questioning.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
              Simulate time pressure, follow-up questions, technical defense, and
              research review in one focused rehearsal environment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="rounded-xl bg-white text-slate-950 hover:bg-white/90">
                <Play className="size-4" />
                Start panel simulation
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="size-4" />
                Retry weak domains
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Live pressure drill</p>
              <span className="flex items-center gap-1.5 rounded-full bg-orange-400/10 px-2.5 py-1 text-xs font-semibold text-orange-200">
                <span className="size-2 rounded-full bg-orange-300 shadow-[0_0_0_6px_rgba(251,146,60,0.12)]" />
                Speaking pulse
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Timer", "04:00"],
                ["Follow-ups", "3"],
                ["Intensity", "Panel"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs text-white/50">{label}</p>
                  <p className="mt-2 text-xl font-semibold tracking-normal text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-normal text-white/45">
                Next likely faculty probe
              </p>
              <p className="mt-2 text-sm leading-6 text-white/78">
                Defend your benchmark choice and explain what your model fails to
                classify reliably.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <RadarPanel />

      <div className="space-y-7">
        {defenseGroups.map((group) => (
          <section key={group.title} className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                  <MessageSquareText className="size-3.5" />
                  Defense category
                </div>
                <h2 className="text-2xl font-semibold tracking-normal text-foreground">
                  {group.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {group.description}
                </p>
              </div>
              <Badge variant="outline" className="bg-white">
                {group.questions.length} question{group.questions.length > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="space-y-4">
              {group.questions.map((question, index) => (
                <QuestionCard
                  key={question.question}
                  question={question}
                  defaultOpen={group.title === "Technical Architecture" && index === 1}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
