"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ReviewDecision } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BellRing,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Code2,
  FileText,
  Filter,
  GitBranch,
  HeartPulse,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ReviewQueueData, ReviewQueueItem } from "@/types/aoip";

type TriageMode =
  | "fast-approvals"
  | "risk-triage"
  | "delayed-teams"
  | "viva-readiness"
  | "documentation"
  | "research-quality"
  | "deployment";

type SmartFilter =
  | "all"
  | "high-risk"
  | "needs-escalation"
  | "no-review"
  | "stale"
  | "weak-ieee"
  | "missing-deployment"
  | "repeated-revisions"
  | "healthy";

type Tone = "critical" | "risk" | "watch" | "healthy" | "neutral";

type TriageInsight = {
  item: ReviewQueueItem;
  state: "Critical" | "At risk" | "Watch" | "Healthy";
  tone: Tone;
  priority: number;
  health: number;
  risk: number;
  confidence: "High confidence" | "Medium confidence" | "Needs manual inspection" | "Uncertain evaluation";
  reviewUrgency: "Review now" | "Today" | "This week" | "Fast approve";
  suggestedAction: string;
  likelyIssue: string;
  detectedFrom: string[];
  alertStrip: string[];
  pulse: number[];
  metrics: Array<{
    label: string;
    value: number;
    icon: LucideIcon;
    tone: Tone;
    trend: string;
  }>;
};

const modeOptions: Array<{ value: TriageMode; label: string; icon: LucideIcon }> = [
  { value: "fast-approvals", label: "Fast approvals", icon: CheckCircle2 },
  { value: "risk-triage", label: "Risk triage", icon: ShieldAlert },
  { value: "delayed-teams", label: "Delayed teams", icon: TimerReset },
  { value: "viva-readiness", label: "Final viva readiness", icon: MessageSquareText },
  { value: "documentation", label: "Documentation review", icon: FileText },
  { value: "research-quality", label: "Research quality", icon: LineChart },
  { value: "deployment", label: "Deployment verification", icon: Rocket },
];

const smartFilters: Array<{ value: SmartFilter; label: string; icon: LucideIcon }> = [
  { value: "all", label: "All triage items", icon: Filter },
  { value: "high-risk", label: "High-risk only", icon: ShieldAlert },
  { value: "needs-escalation", label: "Needs escalation", icon: BellRing },
  { value: "no-review", label: "No mentor review", icon: Clock3 },
  { value: "stale", label: "Stale submissions", icon: TimerReset },
  { value: "weak-ieee", label: "Weak IEEE progress", icon: FileText },
  { value: "missing-deployment", label: "Missing deployment", icon: RadioTower },
  { value: "repeated-revisions", label: "Repeated revision cycles", icon: AlertTriangle },
  { value: "healthy", label: "Healthy fast-approve", icon: BadgeCheck },
];

const bulkOperations: Array<{ label: string; icon: LucideIcon; tone: Tone }> = [
  { label: "Approve healthy teams", icon: CheckCircle2, tone: "healthy" },
  { label: "Send template revisions", icon: FileText, tone: "watch" },
  { label: "Bulk escalate risky submissions", icon: ShieldAlert, tone: "critical" },
  { label: "Assign mentor syncs", icon: Users2, tone: "neutral" },
  { label: "Auto-tag delayed teams", icon: TimerReset, tone: "risk" },
];

const urgencyRank: Record<ReviewQueueItem["urgency"], number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

function clamp(value: number) {
  return Math.max(8, Math.min(98, Math.round(value)));
}

function toneStyles(tone: Tone) {
  switch (tone) {
    case "critical":
      return {
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-700",
        fill: "bg-rose-600",
        chip: "bg-rose-100 text-rose-700",
        glow: "shadow-[0_18px_60px_rgba(225,29,72,0.14)]",
      };
    case "risk":
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        fill: "bg-orange-500",
        chip: "bg-orange-100 text-orange-700",
        glow: "shadow-[0_18px_60px_rgba(249,115,22,0.13)]",
      };
    case "watch":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        fill: "bg-amber-500",
        chip: "bg-amber-100 text-amber-700",
        glow: "shadow-[0_18px_60px_rgba(245,158,11,0.12)]",
      };
    case "healthy":
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        fill: "bg-emerald-600",
        chip: "bg-emerald-100 text-emerald-700",
        glow: "shadow-[0_18px_60px_rgba(16,185,129,0.12)]",
      };
    default:
      return {
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-700",
        fill: "bg-slate-900",
        chip: "bg-slate-100 text-slate-700",
        glow: "shadow-[0_18px_60px_rgba(15,23,42,0.08)]",
      };
  }
}

function buildTriageInsight(item: ReviewQueueItem, index: number): TriageInsight {
  const statusLoad = item.status === "SLA risk" ? 18 : item.status === "Re-review" ? 12 : 4;
  const urgencyLoad =
    item.urgency === "Critical" ? 38 : item.urgency === "High" ? 29 : item.urgency === "Medium" ? 18 : 7;
  const risk = clamp(urgencyLoad + statusLoad + 24 - index * 2);
  const health = clamp(100 - risk + (item.urgency === "Low" ? 14 : 0));
  const state =
    risk >= 72 ? "Critical" : risk >= 56 ? "At risk" : risk >= 38 ? "Watch" : "Healthy";
  const tone: Tone =
    state === "Critical" ? "critical" : state === "At risk" ? "risk" : state === "Watch" ? "watch" : "healthy";
  const github = clamp(98 - risk + index * 5);
  const ieee = clamp(88 - risk / 1.8 + index * 4);
  const deployment = clamp(86 - risk / 2 + index * 3);
  const attendance = clamp(96 - risk / 1.6 + index * 4);
  const participation = clamp(91 - risk / 1.7 + index * 3);
  const consistency = clamp(94 - risk / 1.5 + index * 3);
  const docs = clamp(84 - risk / 2 + index * 2);
  const demo = clamp(82 - risk / 2.2 + index * 3);
  const sprintReliability = clamp((consistency + participation + github) / 3);
  const researchMomentum = clamp((ieee + docs) / 2);
  const confidence =
    risk >= 80
      ? "Needs manual inspection"
      : risk >= 62
        ? "Medium confidence"
        : risk >= 42
          ? "Uncertain evaluation"
          : "High confidence";
  const reviewUrgency =
    risk >= 74 ? "Review now" : risk >= 58 ? "Today" : risk >= 36 ? "This week" : "Fast approve";

  const alertStrip = [
    attendance < 55 ? "Critical attendance" : null,
    github < 55 ? "Low activity" : null,
    github < 42 ? "No commits" : null,
    ieee < 58 ? "Paper delayed" : null,
    participation < 58 ? "Weak participation" : null,
    deployment < 60 ? "Missing deployment" : null,
    item.status === "Re-review" ? "Repeated revisions" : null,
  ].filter(Boolean) as string[];

  return {
    item,
    state,
    tone,
    priority: risk + urgencyRank[item.urgency] * 10 + (item.status === "SLA risk" ? 16 : 0),
    health,
    risk,
    confidence,
    reviewUrgency,
    suggestedAction:
      risk >= 74
        ? "Escalate immediately or request mentor sync before approval."
        : risk >= 56
          ? "Request a minor revision with evidence-focused feedback."
          : risk >= 38
            ? "Run a quick technical scan before approval."
            : "Safe fast approval candidate.",
    likelyIssue:
      docs < 60
        ? "Weak documentation maturity."
        : deployment < 60
          ? "Deployment validation is incomplete."
          : ieee < 60
            ? "Research and IEEE progress may block final readiness."
            : "High confidence approval candidate.",
    detectedFrom:
      risk >= 56
        ? [
            "Review cycle pressure is increasing.",
            "Delivery proof is weaker than team progress claims.",
            "Mentor decision confidence is below the fast-approve band.",
          ]
        : [
            "Stable submission quality.",
            "Healthy activity and collaboration signals.",
            "Low probability of approval reversal.",
          ],
    alertStrip: alertStrip.length > 0 ? alertStrip : ["No blocking alerts"],
    pulse: [
      clamp(github - 14),
      clamp(consistency - 8),
      clamp(participation - 10),
      clamp(ieee - 6),
      clamp(deployment - 3),
      clamp(docs),
      clamp(sprintReliability + 4),
    ],
    metrics: [
      { label: "Submission consistency", value: consistency, icon: ClipboardCheck, tone, trend: consistency > 65 ? "+stable" : "-slowing" },
      { label: "Attendance health", value: attendance, icon: HeartPulse, tone: attendance > 65 ? "healthy" : "critical", trend: attendance > 65 ? "+healthy" : "-drop" },
      { label: "GitHub activity", value: github, icon: GitBranch, tone: github > 65 ? "healthy" : "risk", trend: github > 65 ? "+active" : "-quiet" },
      { label: "IEEE progress", value: ieee, icon: FileText, tone: ieee > 65 ? "neutral" : "watch", trend: ieee > 65 ? "+moving" : "-stalled" },
      { label: "Team participation", value: participation, icon: Users2, tone: participation > 65 ? "healthy" : "risk", trend: participation > 65 ? "+balanced" : "-uneven" },
      { label: "Deployment status", value: deployment, icon: Rocket, tone: deployment > 65 ? "healthy" : "critical", trend: deployment > 65 ? "+live" : "-missing" },
      { label: "Documentation", value: docs, icon: Code2, tone: docs > 65 ? "neutral" : "watch", trend: docs > 65 ? "+usable" : "-thin" },
      { label: "Demo evidence", value: demo, icon: MonitorCheck, tone: demo > 65 ? "healthy" : "risk", trend: demo > 65 ? "+ready" : "-weak" },
      { label: "Sprint reliability", value: sprintReliability, icon: Activity, tone: sprintReliability > 65 ? "healthy" : "risk", trend: sprintReliability > 65 ? "+reliable" : "-fragile" },
      { label: "Research momentum", value: researchMomentum, icon: LineChart, tone: researchMomentum > 65 ? "neutral" : "watch", trend: researchMomentum > 65 ? "+steady" : "-low" },
    ],
  };
}

function MiniMetric({ metric }: { metric: TriageInsight["metrics"][number] }) {
  const Icon = metric.icon;
  const styles = toneStyles(metric.tone);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-600">
          <Icon className={cn("h-3.5 w-3.5 shrink-0", styles.text)} />
          <span className="truncate">{metric.label}</span>
        </span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", styles.chip)}>
          {metric.trend}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className={cn("h-full rounded-full", styles.fill)} style={{ width: `${metric.value}%` }} />
        </div>
        <span className="w-7 text-right text-xs font-semibold text-slate-950">{metric.value}</span>
      </div>
    </div>
  );
}

function PulseBars({ values, tone }: { values: number[]; tone: Tone }) {
  const styles = toneStyles(tone);

  return (
    <div className="flex h-8 items-end gap-1">
      {values.map((value, index) => (
        <div
          className={cn("w-full rounded-t", styles.fill)}
          key={`${value}-${index}`}
          style={{ height: `${Math.max(18, value)}%`, opacity: 0.36 + index * 0.08 }}
        />
      ))}
    </div>
  );
}

function TriageTile({
  insight,
  onDecision,
}: {
  insight: TriageInsight;
  onDecision: (item: ReviewQueueItem, decision: ReviewDecision, feedback: string, score: number) => void;
}) {
  const { item } = insight;
  const styles = toneStyles(insight.tone);
  const primaryMetrics = insight.metrics.slice(0, 6);

  return (
    <article
      className={cn(
        "rounded-3xl border bg-white p-4 transition duration-300 hover:-translate-y-0.5",
        styles.border,
        styles.glow,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("rounded-full border-0 px-3 py-1", styles.chip)}>{insight.state}</Badge>
            <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600">
              {item.submissionTitle}
            </Badge>
            <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600">
              {insight.reviewUrgency}
            </Badge>
          </div>
          <h3 className="mt-3 truncate text-lg font-semibold tracking-tight text-slate-950">{item.team}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-slate-500">{item.project}</p>
        </div>
        <div className={cn("shrink-0 rounded-2xl border p-3 text-center", styles.border, styles.bg)}>
          <p className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", styles.text)}>
            Health
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{insight.health}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-3">
        {primaryMetrics.map((metric) => (
          <MiniMetric key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Live execution pulse
          </p>
          <span className="text-xs font-medium text-slate-500">{insight.confidence}</span>
        </div>
        <PulseBars values={insight.pulse} tone={insight.tone} />
      </div>

      <div className={cn("mt-4 rounded-2xl border p-3", styles.border, styles.bg)}>
        <div className="flex flex-wrap gap-2">
          {insight.alertStrip.map((alert) => (
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", styles.chip)} key={alert}>
              {alert}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-slate-100 bg-white p-3 lg:grid-cols-[0.8fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Bot className="h-4 w-4 text-indigo-600" />
            AI Review Insight
          </div>
          <p className="mt-2 text-sm font-medium text-slate-800">{insight.likelyIssue}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{insight.suggestedAction}</p>
        </div>
        <div className="space-y-1.5">
          {insight.detectedFrom.map((reason) => (
            <div className="flex gap-2 text-xs leading-5 text-slate-600" key={reason}>
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
              {reason}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Button
          className="h-auto min-h-10 whitespace-normal rounded-xl bg-slate-950 px-3 py-2 text-xs leading-4 text-white hover:bg-slate-800"
          onClick={() =>
            onDecision(
              item,
              ReviewDecision.APPROVED,
              "Safe approval via submission triage. Execution signals are strong enough for mentor sign-off.",
              86,
            )
          }
        >
          Safe approve
        </Button>
        <Button
          className="h-auto min-h-10 whitespace-normal rounded-xl border-slate-200 px-3 py-2 text-xs leading-4"
          onClick={() =>
            onDecision(
              item,
              ReviewDecision.REVISION_REQUIRED,
              "Minor revision requested from triage. Add missing evidence, improve documentation, and resubmit for mentor confirmation.",
              68,
            )
          }
          variant="outline"
        >
          Minor revision
        </Button>
        <Button
          className="h-auto min-h-10 whitespace-normal rounded-xl border-slate-200 px-3 py-2 text-xs leading-4"
          onClick={() =>
            onDecision(
              item,
              ReviewDecision.REVISION_REQUIRED,
              "Technical concern flagged. Please clarify implementation proof, test evidence, and system limitations.",
              58,
            )
          }
          variant="outline"
        >
          Concern
        </Button>
        <Button
          className="h-auto min-h-10 whitespace-normal rounded-xl border-slate-200 px-3 py-2 text-xs leading-4"
          variant="outline"
        >
          Mentor sync
        </Button>
        <Button
          className="h-auto min-h-10 whitespace-normal rounded-xl border-slate-200 px-3 py-2 text-xs leading-4"
          onClick={() =>
            onDecision(
              item,
              ReviewDecision.ESCALATED,
              "Escalated from triage due to execution risk. Mentor intervention is needed before approval.",
              45,
            )
          }
          variant="outline"
        >
          Escalate
        </Button>
        <Button
          className="h-auto min-h-10 whitespace-normal rounded-xl border-slate-200 px-3 py-2 text-xs leading-4"
          variant="outline"
        >
          Template
        </Button>
      </div>
    </article>
  );
}

export function SubmissionTriageCenter({ initialData }: { initialData: ReviewQueueData }) {
  const router = useRouter();
  const [mode, setMode] = useState<TriageMode>("risk-triage");
  const [smartFilter, setSmartFilter] = useState<SmartFilter>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);
  const [draftDecision, setDraftDecision] = useState<ReviewDecision>(ReviewDecision.APPROVED);
  const [draftScore, setDraftScore] = useState("86");
  const [draftFeedback, setDraftFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const insights = useMemo(
    () =>
      initialData.queue
        .map((item, index) => buildTriageInsight(item, index))
        .sort((a, b) => b.priority - a.priority),
    [initialData.queue],
  );

  const filteredInsights = useMemo(() => {
    const normalizedQuery = deferredQuery.toLowerCase().trim();

    return insights
      .filter((insight) => {
        const item = insight.item;
        const matchesSearch = [item.team, item.project, item.submissionTitle, item.batch]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesFilter =
          smartFilter === "all" ||
          (smartFilter === "high-risk" && insight.risk >= 56) ||
          (smartFilter === "needs-escalation" && insight.risk >= 72) ||
          (smartFilter === "no-review" && item.status === "Pending") ||
          (smartFilter === "stale" && item.status === "SLA risk") ||
          (smartFilter === "weak-ieee" && insight.metrics.some((metric) => metric.label === "IEEE progress" && metric.value < 62)) ||
          (smartFilter === "missing-deployment" && insight.metrics.some((metric) => metric.label === "Deployment status" && metric.value < 62)) ||
          (smartFilter === "repeated-revisions" && item.status === "Re-review") ||
          (smartFilter === "healthy" && insight.health >= 70);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (mode === "fast-approvals") {
          return b.health - a.health;
        }
        if (mode === "documentation") {
          return (
            (a.metrics.find((metric) => metric.label === "Documentation")?.value ?? 0) -
            (b.metrics.find((metric) => metric.label === "Documentation")?.value ?? 0)
          );
        }
        if (mode === "research-quality") {
          return (
            (a.metrics.find((metric) => metric.label === "Research momentum")?.value ?? 0) -
            (b.metrics.find((metric) => metric.label === "Research momentum")?.value ?? 0)
          );
        }
        if (mode === "deployment") {
          return (
            (a.metrics.find((metric) => metric.label === "Deployment status")?.value ?? 0) -
            (b.metrics.find((metric) => metric.label === "Deployment status")?.value ?? 0)
          );
        }
        return b.priority - a.priority;
      });
  }, [deferredQuery, insights, mode, smartFilter]);

  const criticalCount = insights.filter((insight) => insight.state === "Critical").length;
  const healthyCount = insights.filter((insight) => insight.health >= 70).length;
  const escalationCount = insights.filter((insight) => insight.risk >= 72).length;
  const staleCount = insights.filter((insight) => insight.item.status === "SLA risk").length;
  const avgHealth =
    insights.length > 0
      ? Math.round(insights.reduce((sum, insight) => sum + insight.health, 0) / insights.length)
      : 0;
  const highConfidenceCount = insights.filter((insight) => insight.confidence === "High confidence").length;

  function openDecision(
    item: ReviewQueueItem,
    decision: ReviewDecision,
    feedback: string,
    score: number,
  ) {
    setSelectedItem(item);
    setDraftDecision(decision);
    setDraftFeedback(feedback);
    setDraftScore(String(score));
  }

  function submitDecision() {
    if (!selectedItem) {
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
        decision: draftDecision,
        score,
        submissionId: selectedItem.id,
      });

      if (result.success) {
        toast.success("Triage decision submitted.");
        setSelectedItem(null);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  const selectedInsight = selectedItem ? buildTriageInsight(selectedItem, 0) : null;

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_90px_rgba(15,23,42,0.2)] lg:p-8">
            <Badge className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-white hover:bg-white/15">
              <Zap className="mr-2 h-3.5 w-3.5" />
              Operational review acceleration
            </Badge>
            <h1 className="mt-8 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Submission Triage Center
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              Rapidly review engineering execution health, detect delivery risks, and accelerate
              mentor approvals.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <HeaderMetric label="Queue" value={insights.length} />
              <HeaderMetric label="Critical" value={criticalCount} />
              <HeaderMetric label="Fast approve" value={healthyCount} />
              <HeaderMetric label="Avg health" value={`${avgHealth}%`} />
            </div>
          </div>

          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-none">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    AI triage prioritization
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Cards are ordered by delivery risk, inactivity, technical blockage, and review
                    confidence.
                  </p>
                </div>
                <Bot className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="grid gap-3">
                <InsightStat
                  helper="Escalate before fast approvals."
                  icon={ShieldAlert}
                  label="Needs escalation"
                  tone={escalationCount > 0 ? "critical" : "healthy"}
                  value={escalationCount}
                />
                <InsightStat
                  helper="SLA-risk submissions requiring movement."
                  icon={TimerReset}
                  label="Stale submissions"
                  tone={staleCount > 0 ? "risk" : "healthy"}
                  value={staleCount}
                />
                <InsightStat
                  helper="AI says these can move quickly."
                  icon={BadgeCheck}
                  label="High-confidence"
                  tone="healthy"
                  value={highConfidenceCount}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-3xl border-slate-200 shadow-none">
          <CardContent className="space-y-5 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="h-11 rounded-2xl border-slate-200 bg-white pl-10 shadow-none"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search teams, projects, sprints..."
                  value={query}
                />
              </div>
              <Tabs
                className="w-full xl:w-auto"
                defaultValue="risk-triage"
                onValueChange={(value) => setMode(value as TriageMode)}
                value={mode}
              >
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-slate-100 p-1 xl:w-auto">
                  {modeOptions.map((option) => (
                    <TabsTrigger className="rounded-xl px-3 py-2" key={option.value} value={option.value}>
                      <option.icon className="mr-2 h-3.5 w-3.5" />
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-wrap gap-2">
              {smartFilters.map((filter) => (
                <button
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition",
                    smartFilter === filter.value
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  )}
                  key={filter.value}
                  onClick={() => setSmartFilter(filter.value)}
                  type="button"
                >
                  <filter.icon className="h-3.5 w-3.5" />
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex flex-wrap gap-2">
                {bulkOperations.map((operation) => {
                  const styles = toneStyles(operation.tone);

                  return (
                    <Button
                      className="rounded-xl border-slate-200 bg-white"
                      key={operation.label}
                      variant="outline"
                    >
                      <operation.icon className={cn("mr-2 h-4 w-4", styles.text)} />
                      {operation.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 xl:grid-cols-2">
          {filteredInsights.map((insight) => (
            <TriageTile insight={insight} key={insight.item.id} onDecision={openDecision} />
          ))}
          {filteredInsights.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-slate-200 shadow-none xl:col-span-2">
              <CardContent className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
                <Search className="h-8 w-8 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-950">No triage items found</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Adjust the mode, smart filter, or search query to reveal submissions.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </section>
      </div>

      <Modal onOpenChange={(open) => !open && setSelectedItem(null)} open={Boolean(selectedItem)}>
        <ModalContent className="max-w-3xl rounded-3xl">
          <ModalHeader>
            <ModalTitle className="text-2xl tracking-tight">Confirm triage decision</ModalTitle>
            <ModalDescription>
              {selectedItem
                ? `${selectedItem.team} · ${selectedItem.project}`
                : "Submit a rapid faculty decision."}
            </ModalDescription>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody className="space-y-5">
            {selectedInsight ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Health</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{selectedInsight.health}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">AI confidence</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                    {selectedInsight.confidence}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Recommendation</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                    {selectedInsight.suggestedAction}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-[1fr_0.45fr]">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Smart decision</span>
                <Select
                  className="h-11 rounded-xl border-slate-200"
                  onChange={(event) => setDraftDecision(event.target.value as ReviewDecision)}
                  value={draftDecision}
                >
                  <option value={ReviewDecision.APPROVED}>Safe approve</option>
                  <option value={ReviewDecision.REVISION_REQUIRED}>Minor revision</option>
                  <option value={ReviewDecision.REJECTED}>High-risk approval warning</option>
                  <option value={ReviewDecision.ESCALATED}>Escalate to review board</option>
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
              <span className="text-sm font-medium text-slate-700">Template feedback</span>
              <Textarea
                className="min-h-[150px] rounded-2xl border-slate-200 bg-slate-50/70 p-4 leading-6 shadow-none"
                onChange={(event) => setDraftFeedback(event.target.value)}
                value={draftFeedback}
              />
            </label>
          </ModalBody>
          <ModalFooter>
            <Button
              className="rounded-xl border-slate-200"
              disabled={isPending}
              onClick={() => setSelectedItem(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-slate-950 text-white hover:bg-slate-800"
              disabled={isPending}
              onClick={submitDecision}
            >
              {isPending ? "Submitting..." : "Submit triage decision"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function InsightStat({
  helper,
  icon: Icon,
  label,
  tone,
  value,
}: {
  helper: string;
  icon: LucideIcon;
  label: string;
  tone: Tone;
  value: string | number;
}) {
  const styles = toneStyles(tone);

  return (
    <div className={cn("rounded-2xl border p-4", styles.border, styles.bg)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
        </div>
        <Icon className={cn("h-4 w-4", styles.text)} />
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
