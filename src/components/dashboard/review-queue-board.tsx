"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ReviewDecision } from "@prisma/client";
import {
  Check,
  Clock,
  FileText,
  GitBranch,
  Link2,
  MessageSquare,
  X,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";

import { submitReviewAction } from "@/lib/actions/review-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReviewQueueData, ReviewQueueItem } from "@/types/aoip";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const MOCK_QUEUE_ITEMS: ReviewQueueItem[] = [
  {
    id: "mock-falcon",
    team: "Team Falcon",
    batch: "CSE-A",
    project: "Frontend prototype + model integration",
    submissionTitle: "Frontend prototype + model integration",
    submittedAt: "2h ago",
    status: "Pending",
    urgency: "Medium",
    preview:
      "Built React frontend with image upload + result page. Integrated FastAPI backend for predictions. Added drag-and-drop and caching. Documented API in README.",
    rubric: ["React", "FastAPI", "Web App"],
    scoreHint: "90 / 100",
  },
  {
    id: "mock-vega",
    team: "Team Vega",
    batch: "AIML",
    project: "Tumor segmentation results",
    submissionTitle: "Tumor segmentation results",
    submittedAt: "5h ago",
    status: "Pending",
    urgency: "High",
    preview:
      "Implemented 3D U-Net model for MRI tumor segmentation. Prepared validation reports and dataset normalization scripts. Added visualization tools using three.js.",
    rubric: ["U-Net", "PyTorch", "Medical"],
    scoreHint: "85 / 100",
  },
  {
    id: "mock-atlas",
    team: "Team Atlas",
    batch: "DS",
    project: "Sentiment model v3",
    submissionTitle: "Sentiment model v3",
    submittedAt: "1d ago",
    status: "Pending",
    urgency: "Low",
    preview:
      "Deploys sentiment model v3 using DistilRoBERTa. Configured Docker container and AWS ECS pipelines. Set up Prometheus and Grafana for model drift tracking.",
    rubric: ["Transformers", "AWS", "MLOps"],
    scoreHint: "95 / 100",
  },
  {
    id: "mock-nova",
    team: "Team Nova",
    batch: "CSE-A",
    project: "Fraud detection feature engineering",
    submissionTitle: "Fraud detection feature engineering",
    submittedAt: "2d ago",
    status: "Pending",
    urgency: "Medium",
    preview:
      "Engineered 45 new features from transactional datasets. Built initial XGBoost baseline. Created feature store sync pipelines.",
    rubric: ["XGBoost", "Feature Store", "Finance"],
    scoreHint: "78 / 100",
  },
];

const MOCK_SUBMISSION_DETAILS: Record<
  string,
  {
    github: string;
    commits: number;
    deploy: string;
    status: string;
    summary: string;
    attachments: string[];
  }
> = {
  "Team Falcon": {
    github: "github.com/team/proj",
    commits: 14,
    deploy: "proj.vercel.app",
    status: "200 OK",
    summary:
      "Built React frontend with image upload + result page. Integrated FastAPI backend for predictions. Added drag-and-drop and caching. Documented API in README.",
    attachments: ["screenshot-1.png", "screenshot-2.png", "architecture.png", "demo.mp4"],
  },
  "Team Vega": {
    github: "github.com/vega/tumor-seg",
    commits: 18,
    deploy: "tumor-seg.vercel.app",
    status: "200 OK",
    summary:
      "Implemented 3D U-Net model for MRI tumor segmentation. Prepared validation reports and dataset normalization scripts. Added visualization tools using three.js.",
    attachments: ["validation_report.pdf", "mri_sample.png", "threejs_ui.png"],
  },
  "Team Atlas": {
    github: "github.com/atlas/sentiment",
    commits: 22,
    deploy: "sentiment-v3.vercel.app",
    status: "200 OK",
    summary:
      "Deploys sentiment model v3 using DistilRoBERTa. Configured Docker container and AWS ECS pipelines. Set up Prometheus and Grafana for model drift tracking.",
    attachments: ["architecture.png", "grafana_metrics.png", "docker-compose.yml"],
  },
  "Team Nova": {
    github: "github.com/nova/fraud-det",
    commits: 12,
    deploy: "fraud-nova.vercel.app",
    status: "502 Bad Gateway",
    summary:
      "Engineered 45 new features from transactional datasets. Built initial XGBoost baseline. Created feature store sync pipelines.",
    attachments: ["features_list.xlsx", "xgboost_baseline.ipynb"],
  },
};

function getSubmissionDetails(teamName: string, item: ReviewQueueItem) {
  const normalized = teamName.trim();
  if (MOCK_SUBMISSION_DETAILS[normalized]) {
    return MOCK_SUBMISSION_DETAILS[normalized];
  }

  const slug = normalized.toLowerCase().replace(/\s+/g, "-");
  return {
    github: `github.com/${slug}/project`,
    commits: 15,
    deploy: `${slug}.vercel.app`,
    status: "200 OK",
    summary: item.preview || "No summary provided by the team.",
    attachments: ["screenshot.png", "architecture.png"],
  };
}

function getWeekForTeam(teamName: string) {
  if (teamName.includes("Nova")) return "Week 3";
  return "Week 4";
}

export function ReviewQueueBoard({ initialData }: { initialData: ReviewQueueData }) {
  const router = useRouter();
  const [selectedReview, setSelectedReview] = useState<ReviewQueueItem | null>(null);
  const [mockQueue, setMockQueue] = useState<ReviewQueueItem[]>(MOCK_QUEUE_ITEMS);
  const [isPending, startTransition] = useTransition();

  const pendingQueue = useMemo(() => {
    const dbPending = initialData.queue.filter((item) => item.status === "Pending");
    const uniqueMocks = mockQueue.filter(
      (mock) => !dbPending.some((db) => db.team === mock.team)
    );
    return [...uniqueMocks, ...dbPending];
  }, [initialData.queue, mockQueue]);

  const activeReview = selectedReview || pendingQueue[0] || null;

  function handleReviewSubmit(decision: ReviewDecision) {
    if (!activeReview) {
      return;
    }

    let score = 90;
    let comments =
      "Approved after review. Evidence and delivery signals are sufficient for this checkpoint.";
    if (decision === ReviewDecision.REVISION_REQUIRED) {
      score = 60;
      comments =
        "Requesting fixes before approval. Please attach missing evidence and strengthen documentation clarity.";
    } else if (decision === ReviewDecision.REJECTED) {
      score = 40;
      comments = "Rejected. Submission does not meet the required criteria.";
    } else if (decision === ReviewDecision.ESCALATED) {
      score = 70;
      comments = "Review submitted with comments.";
    }

    startTransition(async () => {
      if (activeReview.id.startsWith("mock-")) {
        toast.success("Review submitted successfully (simulated for mockup).");
        setMockQueue((prev) => prev.filter((item) => item.id !== activeReview.id));
        setSelectedReview(null);
        return;
      }

      const result = await submitReviewAction({
        comments,
        decision,
        score,
        submissionId: activeReview.id,
      });

      if (result.success) {
        toast.success("Review submitted successfully.");
        setSelectedReview(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  const pendingCount = initialData.queue.length === 0 ? 22 : pendingQueue.length;

  return (
    <div className="space-y-6 bg-[#f8fafc] -mx-4 -my-6 p-4 sm:p-6 lg:p-8 xl:p-10 min-h-[calc(100vh-4.5rem)] text-slate-950">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Review queue</h1>
        <p className="text-sm text-slate-500 font-medium">
          {pendingCount} pending submissions - target turnaround 48h
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] items-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Pending</h2>
            <p className="text-xs text-slate-400 font-medium">Sorted by oldest first</p>
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {pendingQueue.map((item) => {
              const isSelected = activeReview?.id === item.id;
              const initials = item.team
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join("");
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedReview(item)}
                  className={cn(
                    "group relative flex gap-3.5 rounded-2xl border p-4 cursor-pointer transition-all duration-200",
                    isSelected
                      ? "border-slate-300 bg-slate-100 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50/80"
                  )}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-950 rounded-l-2xl" />
                  )}

                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {item.team}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400 font-medium">
                        {item.submittedAt}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.batch} · {getWeekForTeam(item.team)}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold truncate">
                      {item.submissionTitle}
                    </p>
                  </div>
                </div>
              );
            })}

            {pendingQueue.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-450">
                <ClipboardCheck className="size-8 text-slate-355" />
                <p className="text-sm font-semibold mt-4 text-slate-800">No pending submissions</p>
                <p className="text-xs text-slate-400 mt-1">Check back later for new reviews.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {activeReview ? (
            <>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-base font-semibold">
                      {activeReview.team
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {activeReview.team} - {getWeekForTeam(activeReview.team)}
                      </h2>
                      <p className="text-sm text-slate-550 font-medium mt-0.5">
                        {activeReview.submissionTitle}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-slate-200 bg-slate-50 text-slate-600 px-3 py-1 font-semibold text-xs shrink-0"
                  >
                    {activeReview.batch}
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5">
                    <div className="text-slate-400 shrink-0">
                      <GithubIcon className="size-5" />
                    </div>
                    <div className="min-w-0 text-sm font-medium">
                      <span className="text-slate-700">
                        {getSubmissionDetails(activeReview.team, activeReview).github}
                      </span>
                      <span className="text-slate-355 mx-1.5">·</span>
                      <span className="text-slate-500">
                        {getSubmissionDetails(activeReview.team, activeReview).commits} commits
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5">
                    <div className="text-slate-400 shrink-0">
                      <Link2 className="size-5" />
                    </div>
                    <div className="min-w-0 text-sm font-medium">
                      <span className="text-slate-700">
                        {getSubmissionDetails(activeReview.team, activeReview).deploy}
                      </span>
                      <span className="text-slate-355 mx-1.5">·</span>
                      <span
                        className={cn(
                          getSubmissionDetails(activeReview.team, activeReview).status === "200 OK"
                            ? "text-emerald-600 font-semibold"
                            : "text-rose-600 font-semibold"
                        )}
                      >
                        {getSubmissionDetails(activeReview.team, activeReview).status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Work summary
                  </h3>
                  <p className="text-sm leading-6 text-slate-600 font-medium">
                    {getSubmissionDetails(activeReview.team, activeReview).summary}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Attachments
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getSubmissionDetails(activeReview.team, activeReview).attachments.map(
                      (file) => (
                        <div
                          key={file}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-750 bg-white hover:bg-slate-50 transition cursor-pointer"
                        >
                          <FileText className="size-3.5 text-slate-400" />
                          {file}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => handleReviewSubmit(ReviewDecision.APPROVED)}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold transition"
                  >
                    <Check className="size-4" />
                    Approve
                  </Button>

                  <Button
                    onClick={() => handleReviewSubmit(ReviewDecision.REVISION_REQUIRED)}
                    disabled={isPending}
                    variant="outline"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-sm font-semibold transition"
                  >
                    <Clock className="size-4" />
                    Request revision
                  </Button>

                  <Button
                    onClick={() => handleReviewSubmit(ReviewDecision.REJECTED)}
                    disabled={isPending}
                    variant="ghost"
                    className="inline-flex items-center gap-2 rounded-xl text-rose-600 hover:bg-rose-50 px-4 py-2.5 text-sm font-semibold transition"
                  >
                    <X className="size-4" />
                    Reject
                  </Button>

                  <Button
                    onClick={() => handleReviewSubmit(ReviewDecision.ESCALATED)}
                    disabled={isPending}
                    variant="outline"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-sm font-semibold transition"
                  >
                    <MessageSquare className="size-4" />
                    Comment only
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-450 bg-white shadow-sm">
              <ClipboardCheck className="size-8 text-slate-355" />
              <h3 className="mt-4 text-base font-semibold text-slate-900">Select a submission</h3>
              <p className="mt-1 text-xs max-w-sm">
                Choose a team from the left sidebar to load their submission details and provide
                feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
