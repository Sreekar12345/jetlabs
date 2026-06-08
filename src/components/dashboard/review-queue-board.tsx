"use client";

import { useDeferredValue, useMemo, useState, useTransition, useEffect } from "react";
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

function getSubmissionDetails(teamName: string, item: ReviewQueueItem) {
  const slug = teamName.trim().toLowerCase().replace(/\s+/g, "-");
  return {
    github: `github.com/${slug}/project`,
    commits: 0,
    deploy: `${slug}.vercel.app`,
    status: "N/A",
    summary: item.preview || "No summary provided by the team.",
    attachments: [] as string[],
  };
}

export function ReviewQueueBoard({ initialData }: { initialData: ReviewQueueData }) {
  const router = useRouter();
  const [selectedReview, setSelectedReview] = useState<ReviewQueueItem | null>(null);

  const [isPending, startTransition] = useTransition();

  const [execution, setExecution] = useState(8);
  const [research, setResearch] = useState(7);
  const [uiux, setUiux] = useState(8);
  const [feasibility, setFeasibility] = useState(9);
  const [documentation, setDocumentation] = useState(6);
  const [commentsText, setCommentsText] = useState("");

  const pendingQueue = useMemo(() => {
    return initialData.queue.filter((item) => item.status === "Pending");
  }, [initialData.queue]);

  const activeReview = selectedReview || pendingQueue[0] || null;

  useEffect(() => {
    if (!activeReview) return;
    if (activeReview.team.includes("Falcon")) {
      setExecution(8);
      setResearch(7);
      setUiux(8);
      setFeasibility(9);
      setDocumentation(6);
      setCommentsText("Good integration. Add a confusion matrix on the results page. Improve loading states. Document API in README.");
    } else if (activeReview.team.includes("Vega")) {
      setExecution(7);
      setResearch(9);
      setUiux(6);
      setFeasibility(8);
      setDocumentation(7);
      setCommentsText("Research depth is excellent. Please focus on polishing the UI/UX rendering for MRI slices. The segmentations look accurate.");
    } else if (activeReview.team.includes("Atlas")) {
      setExecution(9);
      setResearch(8);
      setUiux(9);
      setFeasibility(9);
      setDocumentation(8);
      setCommentsText("Great MLOps pipeline. Prometheus alerts are well configured. Verify AWS ECS cost budgets.");
    } else if (activeReview.team.includes("Nova")) {
      setExecution(6);
      setResearch(7);
      setUiux(5);
      setFeasibility(7);
      setDocumentation(6);
      setCommentsText("Need to address the 502 Bad Gateway deploy error. XGBoost validation details look okay.");
    } else {
      setExecution(8);
      setResearch(8);
      setUiux(8);
      setFeasibility(8);
      setDocumentation(8);
      setCommentsText("Good progress. Ensure testing coverage is documented.");
    }
  }, [activeReview?.id]);

  function handleReviewSubmit(decision: ReviewDecision) {
    if (!activeReview) {
      return;
    }

    const calculatedScore = Math.round(((execution + research + uiux + feasibility + documentation) / 5) * 10);
    const comments = commentsText.trim() || "Review submitted.";

    startTransition(async () => {

      const result = await submitReviewAction({
        comments,
        decision,
        score: calculatedScore,
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

  const pendingCount = pendingQueue.length;

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
                      {item.batch}
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
                        {activeReview.team}
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
                {/* Structured Feedback Section */}
                <div className="pt-6 border-t border-slate-100 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-900">Structured feedback</h3>
                    <p className="text-xs text-slate-400 font-medium">Rate each dimension and add specific comments</p>
                  </div>

                  <div className="space-y-4">
                    {/* Execution Quality Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Execution quality</span>
                        <span className="font-bold text-slate-900">{execution} / 10</span>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={execution}
                          onChange={(e) => setExecution(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950 focus:outline-none"
                          style={{
                            backgroundImage: `linear-gradient(to right, #0f172a 0%, #0f172a ${(execution - 1) * 11.11}%, #f1f5f9 ${(execution - 1) * 11.11}%, #f1f5f9 100%)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Research Quality Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Research quality</span>
                        <span className="font-bold text-slate-900">{research} / 10</span>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={research}
                          onChange={(e) => setResearch(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950 focus:outline-none"
                          style={{
                            backgroundImage: `linear-gradient(to right, #0f172a 0%, #0f172a ${(research - 1) * 11.11}%, #f1f5f9 ${(research - 1) * 11.11}%, #f1f5f9 100%)`
                          }}
                        />
                      </div>
                    </div>

                    {/* UI/UX Quality Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>UI/UX quality</span>
                        <span className="font-bold text-slate-900">{uiux} / 10</span>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={uiux}
                          onChange={(e) => setUiux(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950 focus:outline-none"
                          style={{
                            backgroundImage: `linear-gradient(to right, #0f172a 0%, #0f172a ${(uiux - 1) * 11.11}%, #f1f5f9 ${(uiux - 1) * 11.11}%, #f1f5f9 100%)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Technical Feasibility Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Technical feasibility</span>
                        <span className="font-bold text-slate-900">{feasibility} / 10</span>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feasibility}
                          onChange={(e) => setFeasibility(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950 focus:outline-none"
                          style={{
                            backgroundImage: `linear-gradient(to right, #0f172a 0%, #0f172a ${(feasibility - 1) * 11.11}%, #f1f5f9 ${(feasibility - 1) * 11.11}%, #f1f5f9 100%)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Documentation Quality Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Documentation quality</span>
                        <span className="font-bold text-slate-900">{documentation} / 10</span>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={documentation}
                          onChange={(e) => setDocumentation(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950 focus:outline-none"
                          style={{
                            backgroundImage: `linear-gradient(to right, #0f172a 0%, #0f172a ${(documentation - 1) * 11.11}%, #f1f5f9 ${(documentation - 1) * 11.11}%, #f1f5f9 100%)`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comments & Suggestions Input */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Comments & suggestions
                    </h4>
                    <textarea
                      value={commentsText}
                      onChange={(e) => setCommentsText(e.target.value)}
                      rows={3}
                      className="w-full p-4 text-xs bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-slate-300 text-slate-700 leading-relaxed resize-none shadow-inner"
                      placeholder="Write review comments or suggestions here..."
                    />
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
