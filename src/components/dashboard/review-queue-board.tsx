"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ReviewDecision } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Code2,
  Command,
  FileSearch,
  FileText,
  Filter,
  Gauge,
  GitBranch,
  Layers3,
  LineChart,
  MessageSquareText,
  MonitorCheck,
  RadioTower,
  Rocket,
  Search,
  ShieldAlert,
  Sparkles,
  TimerReset,
  Users2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { submitReviewAction } from "@/lib/actions/review-actions";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ReviewQueueData, ReviewQueueItem } from "@/types/aoip";

type QueueTab = "all" | "pending" | "re-review" | "sla";
type Tone = "critical" | "attention" | "healthy" | "insight" | "blocked";

type ReviewMode =
  | "Technical review"
  | "Research review"
  | "UI/UX review"
  | "Viva readiness"
  | "Deployment validation"
  | "IEEE review"
  | "Rapid approval";

type ReviewInsight = {
  item: ReviewQueueItem;
  priority: "High priority" | "Medium priority" | "Low priority";
  tone: Tone;
  riskScore: number;
  urgencyScore: number;
  velocity: number;
  ieee: number;
  github: number;
  deployment: number;
  docs: number;
  collaboration: number;
  activity: number[];
  qualityPrediction: string;
  approvalConfidence:
    | "Safe to approve"
    | "Minor revision recommended"
    | "Needs mentor sync"
    | "High-risk approval"
    | "Escalation recommended";
  suggestedAction: string;
  reason: string[];
  strengths: string[];
  concerns: string[];
};

const urgencyRank: Record<ReviewQueueItem["urgency"], number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const statusRank: Record<ReviewQueueItem["status"], number> = {
  "SLA risk": 3,
  "Re-review": 2,
  Pending: 1,
};

const reviewModes: Array<{ label: ReviewMode; icon: LucideIcon }> = [
  { label: "Technical review", icon: Code2 },
  { label: "Research review", icon: FileSearch },
  { label: "UI/UX review", icon: MonitorCheck },
  { label: "Viva readiness", icon: MessageSquareText },
  { label: "Deployment validation", icon: Rocket },
  { label: "IEEE review", icon: FileText },
  { label: "Rapid approval", icon: Zap },
];

const topActions: Array<{ label: string; icon: LucideIcon }> = [
  { label: "AI priority sorting", icon: Sparkles },
  { label: "Review bottlenecks", icon: TimerReset },
  { label: "High-risk submissions", icon: ShieldAlert },
  { label: "Bulk approvals", icon: ClipboardCheck },
  { label: "Mentor escalation queue", icon: BellRing },
  { label: "Export review analytics", icon: ArrowUpRight },
];

const bulkOperations: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Approve healthy submissions", icon: CheckCircle2 },
  { label: "Send revision templates", icon: FileText },
  { label: "Bulk mentor notes", icon: MessageSquareText },
  { label: "Escalate risky teams", icon: ShieldAlert },
  { label: "Auto-tag delayed teams", icon: Filter },
];

const reviewDimensions = [
  {
    label: "Execution reliability",
    score: 84,
    baseline: "AI baseline 81",
    trend: "+6 vs prior review",
    benchmark: "Top 18% of similar teams",
  },
  {
    label: "Technical depth",
    score: 76,
    baseline: "AI baseline 78",
    trend: "+3 this sprint",
    benchmark: "Near department median",
  },
  {
    label: "System thinking",
    score: 71,
    baseline: "AI baseline 74",
    trend: "Stable",
    benchmark: "Architecture gap detected",
  },
  {
    label: "Production readiness",
    score: 69,
    baseline: "AI baseline 72",
    trend: "+9 after deployment",
    benchmark: "Below top-team benchmark",
  },
  {
    label: "Documentation maturity",
    score: 58,
    baseline: "AI baseline 63",
    trend: "-4 vs last review",
    benchmark: "Weakest review signal",
  },
  {
    label: "Research quality",
    score: 66,
    baseline: "AI baseline 68",
    trend: "+2 this week",
    benchmark: "Needs citation depth",
  },
  {
    label: "Deployment quality",
    score: 73,
    baseline: "AI baseline 70",
    trend: "+11 after uptime fix",
    benchmark: "Healthy rollout signal",
  },
  {
    label: "Scalability awareness",
    score: 61,
    baseline: "AI baseline 65",
    trend: "No new evidence",
    benchmark: "Likely viva follow-up",
  },
  {
    label: "UI/UX clarity",
    score: 79,
    baseline: "AI baseline 77",
    trend: "+5 this week",
    benchmark: "Strong usability signal",
  },
  {
    label: "Team collaboration",
    score: 82,
    baseline: "AI baseline 79",
    trend: "+4 in commit balance",
    benchmark: "Healthy contributor spread",
  },
];

const riskFindings = [
  {
    title: "README setup gap",
    description: "Setup instructions are incomplete for a cold reviewer environment.",
    tone: "attention" as Tone,
  },
  {
    title: "Validation evidence thin",
    description: "Evaluation screenshots and test traces are missing from two submissions.",
    tone: "critical" as Tone,
  },
  {
    title: "Last-minute activity spike",
    description: "Commit volume increased sharply within 12 hours of submission.",
    tone: "blocked" as Tone,
  },
  {
    title: "Deployment proof healthy",
    description: "Latest deployment URL is reachable with stable response timings.",
    tone: "healthy" as Tone,
  },
];

const reviewAnalyticsSeries = [
  { key: "pending", label: "Pending", color: "#2563eb" },
  { key: "completed", label: "Completed", color: "#10b981" },
  { key: "overdue", label: "Overdue", color: "#f97316" },
];

function toneStyles(tone: Tone) {
  switch (tone) {
    case "critical":
      return {
        border: "border-rose-200",
        bg: "bg-rose-50",
        text: "text-rose-700",
        fill: "bg-rose-600",
        soft: "bg-rose-100 text-rose-700",
        ring: "shadow-[0_18px_60px_rgba(225,29,72,0.12)]",
      };
    case "attention":
      return {
        border: "border-amber-200",
        bg: "bg-amber-50",
        text: "text-amber-700",
        fill: "bg-amber-500",
        soft: "bg-amber-100 text-amber-700",
        ring: "shadow-[0_18px_60px_rgba(245,158,11,0.12)]",
      };
    case "healthy":
      return {
        border: "border-emerald-200",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        fill: "bg-emerald-600",
        soft: "bg-emerald-100 text-emerald-700",
        ring: "shadow-[0_18px_60px_rgba(16,185,129,0.12)]",
      };
    case "blocked":
      return {
        border: "border-orange-200",
        bg: "bg-orange-50",
        text: "text-orange-700",
        fill: "bg-orange-600",
        soft: "bg-orange-100 text-orange-700",
        ring: "shadow-[0_18px_60px_rgba(234,88,12,0.12)]",
      };
    default:
      return {
        border: "border-indigo-200",
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        fill: "bg-indigo-600",
        soft: "bg-indigo-100 text-indigo-700",
        ring: "shadow-[0_18px_60px_rgba(79,70,229,0.12)]",
      };
  }
}

function toneForItem(item: ReviewQueueItem): Tone {
  if (item.urgency === "Critical") {
    return "critical";
  }
  if (item.status === "SLA risk") {
    return "blocked";
  }
  if (item.urgency === "High") {
    return "attention";
  }
  if (item.urgency === "Low") {
    return "healthy";
  }
  return "insight";
}

function clampScore(score: number) {
  return Math.max(22, Math.min(98, score));
}

function buildInsight(item: ReviewQueueItem, index: number): ReviewInsight {
  const tone = toneForItem(item);
  const baseRisk =
    item.urgency === "Critical"
      ? 91
      : item.urgency === "High"
        ? 76
        : item.urgency === "Medium"
          ? 57
          : 29;
  const statusPenalty = item.status === "SLA risk" ? 8 : item.status === "Re-review" ? 5 : 0;
  const riskScore = clampScore(baseRisk + statusPenalty - index * 2);
  const healthy = tone === "healthy";
  const priority =
    riskScore >= 74 || item.status === "SLA risk"
      ? "High priority"
      : riskScore >= 50
        ? "Medium priority"
        : "Low priority";
  const velocity = clampScore(93 - riskScore + 24 + index * 3);
  const ieee = clampScore(88 - riskScore / 2 + index * 4);
  const github = clampScore(92 - riskScore / 3 + index * 5);
  const deployment = clampScore(healthy ? 88 : 74 - riskScore / 4 + index * 4);
  const docs = clampScore(healthy ? 84 : 71 - riskScore / 5 + index * 3);
  const collaboration = clampScore(healthy ? 86 : 77 - riskScore / 6 + index * 3);
  const activity = [
    clampScore(velocity - 8),
    clampScore(velocity + 3),
    clampScore(github - 12),
    clampScore(github + 5),
    clampScore(docs - 6),
    clampScore(deployment + 2),
    clampScore(collaboration - 3),
  ];

  return {
    item,
    priority,
    tone,
    riskScore,
    urgencyScore: clampScore(riskScore + 4),
    velocity,
    ieee,
    github,
    deployment,
    docs,
    collaboration,
    activity,
    qualityPrediction:
      riskScore >= 82
        ? "Revision likely before approval"
        : riskScore >= 60
          ? "Approval possible after targeted fixes"
          : "Likely safe after quick mentor scan",
    approvalConfidence:
      riskScore >= 88
        ? "Escalation recommended"
        : riskScore >= 76
          ? "High-risk approval"
          : riskScore >= 60
            ? "Needs mentor sync"
            : riskScore >= 42
              ? "Minor revision recommended"
              : "Safe to approve",
    suggestedAction:
      riskScore >= 80
        ? "Review within 24h and request missing evidence."
        : riskScore >= 62
          ? "Open technical review and add mentor checkpoint."
          : "Run rapid approval with documentation spot-check.",
    reason: [
      riskScore >= 75 ? "Review delay is affecting execution confidence." : "Execution signal is stable enough for quick review.",
      item.status === "Re-review"
        ? "Previous revision cycle is still unresolved."
        : item.status === "SLA risk"
          ? "SLA threshold is close to breach."
          : "Submission is awaiting faculty decision.",
      ieee < 65 ? "IEEE dependency may block final evaluation." : "Paper dependency is not the main blocker.",
    ],
    strengths: [
      github >= 70 ? "Consistent GitHub activity across the review window." : "Recent commits show implementation movement.",
      deployment >= 70 ? "Deployment proof appears reachable and reviewable." : "Prototype evidence exists but needs stronger validation.",
      collaboration >= 72 ? "Team contribution spread is acceptable." : "Some collaboration imbalance requires mentor attention.",
    ],
    concerns: [
      docs < 70 ? "Documentation quality may slow approval." : "Documentation needs only a brief consistency check.",
      ieee < 70 ? "Research/IEEE progress is a dependency risk." : "Research dependency is moving steadily.",
      riskScore >= 75 ? "Repeated delay pattern could affect final submission confidence." : "No severe execution anomaly detected.",
    ],
  };
}

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "insight",
}: {
  title: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  const styles = toneStyles(tone);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 transition duration-200 hover:-translate-y-0.5",
        styles.border,
        styles.ring,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={cn("rounded-xl p-2", styles.soft)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-5 text-slate-500">{helper}</p>
    </div>
  );
}

function Meter({
  label,
  value,
  icon: Icon,
  tone = "insight",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: Tone;
}) {
  const styles = toneStyles(tone);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <Icon className={cn("h-4 w-4", styles.text)} />
          {label}
        </span>
        <span className="font-semibold text-slate-950">{Math.round(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all duration-500", styles.fill)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ActivityPulse({ values, tone }: { values: number[]; tone: Tone }) {
  const styles = toneStyles(tone);

  return (
    <div className="flex h-10 items-end gap-1.5">
      {values.map((value, index) => (
        <div
          className={cn("w-full rounded-t-md transition-all duration-300", styles.fill)}
          key={`${value}-${index}`}
          style={{ height: `${Math.max(18, value)}%`, opacity: 0.4 + index * 0.07 }}
        />
      ))}
    </div>
  );
}

function ReviewCheckpointCard({
  insight,
  onOpenReview,
}: {
  insight: ReviewInsight;
  onOpenReview: (item: ReviewQueueItem, decision?: ReviewDecision, feedback?: string) => void;
}) {
  const { item, tone } = insight;
  const styles = toneStyles(tone);
  const deliverySignals: Array<{ label: string; value: number; icon: LucideIcon }> = [
    { label: "Commit consistency", value: insight.github, icon: GitBranch },
    { label: "Deployment uptime", value: insight.deployment, icon: RadioTower },
    { label: "Documentation completeness", value: insight.docs, icon: FileText },
    { label: "Team activity pulse", value: insight.collaboration, icon: Users2 },
  ];

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-3xl border bg-white shadow-none transition duration-300 hover:-translate-y-1",
        styles.border,
        styles.ring,
      )}
    >
      <CardContent className="space-y-6 p-5 lg:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.05fr_1.45fr_0.95fr]">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn("rounded-full border-0 px-3 py-1", styles.soft)}>
                    {insight.priority}
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600">
                    {item.status}
                  </Badge>
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                  {item.team}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{item.project}</p>
              </div>
              <div className={cn("rounded-2xl p-3", styles.bg)}>
                <Layers3 className={cn("h-5 w-5", styles.text)} />
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Department</span>
                <span className="font-medium text-slate-900">{item.batch}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Checkpoint</span>
                <span className="font-medium text-slate-900">{item.submissionTitle}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Submitted</span>
                <span className="font-medium text-slate-900">{item.submittedAt}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Mentor assigned</span>
                <span className="font-medium text-slate-900">Faculty review desk</span>
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-3xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Execution snapshot</p>
                <p className="text-xs text-slate-500">Delivery signals before faculty decision</p>
              </div>
              <Badge className={cn("rounded-full border-0 px-3 py-1", styles.soft)}>
                {item.urgency} urgency
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Meter label="Submission velocity" value={insight.velocity} icon={LineChart} tone={tone} />
              <Meter label="IEEE progress" value={insight.ieee} icon={FileSearch} tone="insight" />
              <Meter label="GitHub activity" value={insight.github} icon={GitBranch} tone="healthy" />
              <Meter label="Deployment health" value={insight.deployment} icon={Rocket} tone="blocked" />
            </div>
            <div className="rounded-2xl border border-white bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">Weekly activity pulse</span>
                <span className="text-xs text-slate-500">last 7 signals</span>
              </div>
              <ActivityPulse values={insight.activity} tone={tone} />
            </div>
          </div>

          <div className="space-y-4">
            <div className={cn("rounded-3xl border p-4", styles.border, styles.bg)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">AI risk score</p>
                  <p className="mt-1 text-xs text-slate-500">Priority model confidence</p>
                </div>
                <Gauge className={cn("h-5 w-5", styles.text)} />
              </div>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight text-slate-950">
                  {insight.riskScore}
                </span>
                <span className="pb-2 text-sm text-slate-500">/100</span>
              </div>
              <Progress className="mt-4 h-2 bg-white/80" value={insight.riskScore} />
              <p className="mt-4 text-sm font-medium text-slate-800">{insight.qualityPrediction}</p>
              <p className="mt-2 text-sm leading-5 text-slate-600">{insight.suggestedAction}</p>
            </div>

            <div className="grid gap-2">
              <Button
                className="h-10 rounded-xl bg-slate-950 text-white hover:bg-slate-800"
                onClick={() => onOpenReview(item)}
              >
                Open review
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="rounded-xl border-slate-200"
                  onClick={() =>
                    onOpenReview(
                      item,
                      ReviewDecision.APPROVED,
                      "Approved after rapid review. Evidence and delivery signals are sufficient for this checkpoint.",
                    )
                  }
                  variant="outline"
                >
                  Approve
                </Button>
                <Button
                  className="rounded-xl border-slate-200"
                  onClick={() =>
                    onOpenReview(
                      item,
                      ReviewDecision.REVISION_REQUIRED,
                      "Requesting fixes before approval. Please attach missing evidence and strengthen documentation clarity.",
                    )
                  }
                  variant="outline"
                >
                  Request fixes
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button className="rounded-xl border-slate-200 px-2" variant="outline">
                  Sync
                </Button>
                <Button
                  className="rounded-xl border-slate-200 px-2"
                  onClick={() =>
                    onOpenReview(
                      item,
                      ReviewDecision.ESCALATED,
                      "Escalating this checkpoint due to review risk and unresolved execution blockers.",
                    )
                  }
                  variant="outline"
                >
                  Escalate
                </Button>
                <Button className="rounded-xl border-slate-200 px-2" variant="outline">
                  Note
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-600" />
              <p className="text-sm font-semibold text-slate-950">AI-generated execution summary</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.preview}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Detected strengths
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {insight.strengths.map((strength) => (
                    <li className="flex gap-2" key={strength}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                  Detected concerns
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {insight.concerns.map((concern) => (
                    <li className="flex gap-2" key={concern}>
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-sm font-semibold text-slate-950">Delivery signals</p>
            <div className="mt-4 space-y-4">
              {deliverySignals.map((signal) => (
                <Meter
                  icon={signal.icon}
                  key={signal.label}
                  label={signal.label}
                  tone={tone}
                  value={signal.value}
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">Review timeline</p>
            <div className="mt-4 space-y-4">
              <TimelineStep
                description="Submission received with artifacts queued for technical scan."
                icon={Clock3}
                title="Checkpoint submitted"
              />
              <TimelineStep
                description={insight.reason[0]}
                icon={BrainCircuit}
                title="AI priority analysis"
              />
              <TimelineStep
                description={insight.approvalConfidence}
                icon={BadgeCheck}
                title="Approval confidence"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineStep({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
        <Icon className="h-4 w-4 text-slate-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-950">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function ReviewQueueBoard({ initialData }: { initialData: ReviewQueueData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<QueueTab>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [batchFilter, setBatchFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [reviewMode, setReviewMode] = useState<ReviewMode>("Technical review");
  const [selectedReview, setSelectedReview] = useState<ReviewQueueItem | null>(null);
  const [draftVerdict, setDraftVerdict] = useState<ReviewDecision>(ReviewDecision.APPROVED);
  const [draftScore, setDraftScore] = useState("82");
  const [draftFeedback, setDraftFeedback] = useState(
    "Strong progress. Keep evidence precise and connect the implementation to measurable evaluation outcomes.",
  );
  const [isPending, startTransition] = useTransition();

  const batchOptions = useMemo(
    () => ["All", ...Array.from(new Set(initialData.queue.map((item) => item.batch)))],
    [initialData.queue],
  );
  const urgencyOptions = useMemo(
    () => ["All", ...Array.from(new Set(initialData.queue.map((item) => item.urgency)))],
    [initialData.queue],
  );

  const filteredQueue = useMemo(() => {
    const normalizedQuery = deferredQuery.toLowerCase();

    return initialData.queue.filter((item) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "pending" && item.status === "Pending") ||
        (activeTab === "re-review" && item.status === "Re-review") ||
        (activeTab === "sla" && item.status === "SLA risk");
      const matchesSearch = [item.team, item.project, item.submissionTitle, item.batch]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesBatch = batchFilter === "All" || item.batch === batchFilter;
      const matchesUrgency = urgencyFilter === "All" || item.urgency === urgencyFilter;

      return matchesTab && matchesSearch && matchesBatch && matchesUrgency;
    });
  }, [activeTab, batchFilter, deferredQuery, initialData.queue, urgencyFilter]);

  const prioritizedInsights = useMemo(
    () =>
      [...filteredQueue]
        .sort(
          (a, b) =>
            urgencyRank[b.urgency] - urgencyRank[a.urgency] ||
            statusRank[b.status] - statusRank[a.status],
        )
        .map((item, index) => buildInsight(item, index)),
    [filteredQueue],
  );

  const pendingReviews = initialData.queue.filter((item) => item.status === "Pending").length;
  const overdueReviews = initialData.queue.filter((item) => item.status === "SLA risk").length;
  const criticalSubmissions = initialData.queue.filter((item) => item.urgency === "Critical").length;
  const blockedTeams = initialData.queue.filter(
    (item) => item.status === "SLA risk" || item.urgency === "Critical",
  ).length;
  const completionRate = Math.max(68, 96 - pendingReviews * 4);
  const averageTurnaround = overdueReviews > 0 ? "31h" : "18h";
  const facultyWorkload = `${initialData.queue.length} active`;
  const escalatedSubmissions = initialData.queue.filter(
    (item) => item.urgency === "Critical" || item.status === "Re-review",
  ).length;

  function openReview(
    item: ReviewQueueItem,
    decision: ReviewDecision = ReviewDecision.APPROVED,
    feedback = "Strong progress. Keep evidence precise and connect the implementation to measurable evaluation outcomes.",
  ) {
    const insight = buildInsight(item, 0);
    setSelectedReview(item);
    setDraftVerdict(decision);
    setDraftScore(
      decision === ReviewDecision.APPROVED
        ? String(Math.max(78, 100 - Math.round(insight.riskScore / 4)))
        : decision === ReviewDecision.REVISION_REQUIRED
          ? "62"
          : "48",
    );
    setDraftFeedback(feedback);
  }

  function handleReviewSubmit() {
    if (!selectedReview) {
      return;
    }

    const score = Number.parseInt(draftScore, 10);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      toast.error("Score must be between 0 and 100.");
      return;
    }
    if (draftFeedback.trim().length < 12) {
      toast.error("Please add actionable feedback before submitting.");
      return;
    }

    startTransition(async () => {
      const result = await submitReviewAction({
        comments: draftFeedback,
        decision: draftVerdict,
        score,
        submissionId: selectedReview.id,
      });

      if (result.success) {
        toast.success("Review submitted and queue refreshed.");
        setSelectedReview(null);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  const selectedInsight = selectedReview ? buildInsight(selectedReview, 0) : null;

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_1fr] lg:p-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Badge className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-white hover:bg-white/15">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                AI review operations
              </Badge>
              <div>
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Engineering Review Operations
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Monitor technical submissions, review delivery quality, detect execution risk, and
                  accelerate project approvals.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Pending reviews</p>
                  <p className="mt-2 text-2xl font-semibold">{pendingReviews}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Overdue reviews</p>
                  <p className="mt-2 text-2xl font-semibold">{overdueReviews}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Blocked teams</p>
                  <p className="mt-2 text-2xl font-semibold">{blockedTeams}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Turnaround</p>
                  <p className="mt-2 text-2xl font-semibold">{averageTurnaround}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Faculty operations panel</p>
                  <p className="mt-1 text-sm text-slate-400">Fast actions for review load control</p>
                </div>
                <Command className="h-5 w-5 text-slate-300" />
              </div>
              <div className="mt-5 grid gap-2">
                {topActions.map((action) => (
                  <button
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
                    key={action.label}
                    type="button"
                  >
                    <span className="flex items-center gap-3">
                      <action.icon className="h-4 w-4 text-slate-400" />
                      {action.label}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            helper="Technical checkpoints awaiting faculty action."
            icon={ClipboardCheck}
            title="Critical submissions"
            tone={criticalSubmissions > 0 ? "critical" : "healthy"}
            value={criticalSubmissions}
          />
          <MetricCard
            helper="Teams whose execution is waiting on mentor review."
            icon={Users2}
            title="Teams blocked"
            tone={blockedTeams > 0 ? "blocked" : "healthy"}
            value={blockedTeams}
          />
          <MetricCard
            helper="Reviews completed without repeated revision loops."
            icon={BadgeCheck}
            title="Completion rate"
            tone="healthy"
            value={`${completionRate}%`}
          />
          <MetricCard
            helper="Active submissions across all review modes."
            icon={Gauge}
            title="Faculty workload"
            tone="insight"
            value={facultyWorkload}
          />
          <MetricCard
            helper="Items currently marked for intervention or re-review."
            icon={ShieldAlert}
            title="Escalated reviews"
            tone={escalatedSubmissions > 0 ? "attention" : "healthy"}
            value={escalatedSubmissions}
          />
          <MetricCard
            helper="Average time from submission to mentor decision."
            icon={Clock3}
            title="Avg turnaround"
            tone="insight"
            value={averageTurnaround}
          />
          <MetricCard
            helper="Submissions that need action before SLA breach."
            icon={TimerReset}
            title="Overdue reviews"
            tone={overdueReviews > 0 ? "critical" : "healthy"}
            value={overdueReviews}
          />
          <MetricCard
            helper="Queue items currently visible after smart filtering."
            icon={Filter}
            title="Filtered queue"
            tone="insight"
            value={prioritizedInsights.length}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="rounded-3xl border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight">
                    Review health analytics
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Submission throughput, overdue load, and completion movement.
                  </p>
                </div>
                <Badge className="rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
                  Execution flow intelligence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <AnalyticsChart
                data={initialData.analytics}
                description="Pending work, completed reviews, and overdue pressure by week."
                series={reviewAnalyticsSeries}
                title="Execution flow intelligence"
                type="bar"
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-slate-200 bg-slate-950 text-white shadow-none">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">AI Review Assistant</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Mentor-grade inspection before you open a review.
                  </p>
                </div>
                <Bot className="h-5 w-5 text-indigo-300" />
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-sm font-medium text-white">Execution intelligence</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Highest urgency is concentrated around teams with review SLA risk, weak evidence
                  maturity, and stalled IEEE dependencies. Prioritize technical validation before
                  approving final-week checkpoints.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3">
                  <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-200" />
                  <div>
                    <p className="text-sm font-medium text-white">Potential issues detected</p>
                    <p className="mt-1 text-xs leading-5 text-rose-100">
                      Missing validation evidence and README gaps appear in high-risk submissions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-200" />
                  <div>
                    <p className="text-sm font-medium text-white">Suggested workflow</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-100">
                      Run rapid approvals for low-risk teams, then assign mentor syncs to repeated
                      revision loops.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-3xl border-slate-200 shadow-none">
          <CardContent className="space-y-5 p-5 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  AI-prioritized review queue
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ordered by execution risk, delay probability, paper dependency, and team health.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-11 rounded-2xl border-slate-200 bg-white pl-10 shadow-none"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search teams, projects, batches..."
                    value={query}
                  />
                </div>
                <Select
                  className="h-11 rounded-2xl border-slate-200"
                  onChange={(event) => setBatchFilter(event.target.value)}
                  value={batchFilter}
                >
                  {batchOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>
                <Select
                  className="h-11 rounded-2xl border-slate-200"
                  onChange={(event) => setUrgencyFilter(event.target.value)}
                  value={urgencyFilter}
                >
                  {urgencyOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <Tabs
                className="w-full xl:w-auto"
                defaultValue="all"
                onValueChange={(value) => setActiveTab(value as QueueTab)}
                value={activeTab}
              >
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-slate-100 p-1 xl:w-auto">
                  <TabsTrigger className="rounded-xl px-4 py-2" value="all">
                    All
                  </TabsTrigger>
                  <TabsTrigger className="rounded-xl px-4 py-2" value="pending">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger className="rounded-xl px-4 py-2" value="re-review">
                    Re-review
                  </TabsTrigger>
                  <TabsTrigger className="rounded-xl px-4 py-2" value="sla">
                    SLA risk
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-wrap gap-2">
                {reviewModes.map((mode) => (
                  <button
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition",
                      reviewMode === mode.label
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                    )}
                    key={mode.label}
                    onClick={() => setReviewMode(mode.label)}
                    type="button"
                  >
                    <mode.icon className="h-3.5 w-3.5" />
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-semibold text-slate-950">Bulk review operations</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {bulkOperations.map((operation) => (
                  <Button
                    className="rounded-xl border-slate-200 bg-white"
                    key={operation.label}
                    variant="outline"
                  >
                    <operation.icon className="mr-2 h-4 w-4" />
                    {operation.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-5">
          {prioritizedInsights.map((insight) => (
            <ReviewCheckpointCard
              insight={insight}
              key={insight.item.id}
              onOpenReview={openReview}
            />
          ))}
          {prioritizedInsights.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-slate-200 shadow-none">
              <CardContent className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
                <Search className="h-8 w-8 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-950">No submissions found</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Adjust filters or search terms to reveal review checkpoints.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-3xl border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight">
                Engineering review dimensions
              </CardTitle>
              <p className="text-sm text-slate-500">
                AI baseline suggestions, historical movement, and similar-team benchmarks.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {reviewDimensions.map((dimension) => (
                <div
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  key={dimension.label}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{dimension.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{dimension.baseline}</p>
                    </div>
                    <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">
                      {dimension.score}
                    </Badge>
                  </div>
                  <Progress className="mt-4 h-2" value={dimension.score} />
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-600">
                      {dimension.trend}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-600">
                      {dimension.benchmark}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-3xl border-slate-200 shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-slate-950">
                      Approval confidence system
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Decisions are guided by review risk and delivery proof.
                    </p>
                  </div>
                  <BadgeCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="space-y-3">
                  {[
                    "Safe to approve",
                    "Minor revision recommended",
                    "Needs mentor sync",
                    "High-risk approval",
                    "Escalation recommended",
                  ].map((confidence, index) => (
                    <div
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                      key={confidence}
                    >
                      <span className="text-sm font-medium text-slate-700">{confidence}</span>
                      <span className="text-xs text-slate-500">{index + 1} signal band</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 shadow-none">
              <CardContent className="space-y-4 p-5">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    Execution risk detection
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Fake progress, weak evidence, and delivery anomalies.
                  </p>
                </div>
                <div className="space-y-3">
                  {riskFindings.map((finding) => {
                    const styles = toneStyles(finding.tone);

                    return (
                      <div
                        className={cn("rounded-2xl border p-4", styles.border, styles.bg)}
                        key={finding.title}
                      >
                        <p className={cn("text-sm font-semibold", styles.text)}>{finding.title}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-600">{finding.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Modal onOpenChange={(open) => !open && setSelectedReview(null)} open={Boolean(selectedReview)}>
        <ModalContent className="max-h-[92vh] max-w-4xl overflow-y-auto rounded-3xl">
          <ModalHeader>
            <ModalTitle className="text-2xl tracking-tight">
              {selectedReview ? `Review ${selectedReview.submissionTitle}` : "Review submission"}
            </ModalTitle>
            <ModalDescription>
              {selectedReview
                ? `${selectedReview.team} · ${selectedReview.project} · ${reviewMode}`
                : "Submit a faculty decision for this checkpoint."}
            </ModalDescription>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody className="space-y-5">
            {selectedReview && selectedInsight ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">AI risk</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {selectedInsight.riskScore}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{selectedInsight.approvalConfidence}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Quality prediction
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                      {selectedInsight.qualityPrediction}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Suggested action
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                      {selectedInsight.suggestedAction}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">Submission summary</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selectedReview.preview}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedReview.rubric.map((item) => (
                      <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100" key={item}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-800">Detected strengths</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      {selectedInsight.strengths.map((strength) => (
                        <li className="flex gap-2" key={strength}>
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-800">Potential issues detected</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      {selectedInsight.concerns.map((concern) => (
                        <li className="flex gap-2" key={concern}>
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : null}

            <div className="grid gap-4 md:grid-cols-[0.8fr_0.4fr]">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Decision</span>
                <Select
                  className="h-11 rounded-xl border-slate-200"
                  onChange={(event) => setDraftVerdict(event.target.value as ReviewDecision)}
                  value={draftVerdict}
                >
                  <option value={ReviewDecision.APPROVED}>Approve</option>
                  <option value={ReviewDecision.REVISION_REQUIRED}>Request revision</option>
                  <option value={ReviewDecision.REJECTED}>Reject</option>
                  <option value={ReviewDecision.ESCALATED}>Escalate</option>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Score</span>
                <Input
                  className="h-11 rounded-xl border-slate-200"
                  max={100}
                  min={0}
                  onChange={(event) => setDraftScore(event.target.value)}
                  type="number"
                  value={draftScore}
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Actionable faculty feedback</span>
              <Textarea
                className="min-h-[160px] rounded-2xl border-slate-200 bg-slate-50/70 p-4 leading-6 shadow-none"
                onChange={(event) => setDraftFeedback(event.target.value)}
                value={draftFeedback}
              />
            </label>
          </ModalBody>
          <ModalFooter>
            <Button
              className="rounded-xl border-slate-200"
              disabled={isPending}
              onClick={() => setSelectedReview(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-slate-950 text-white hover:bg-slate-800"
              disabled={isPending}
              onClick={handleReviewSubmit}
            >
              {isPending ? "Submitting..." : "Submit faculty review"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
}
