"use client";

import { useState } from "react";
import {
  BookOpen,
  Award,
  Sparkles,
  Clock,
  AlertCircle,
  FileText,
  CheckCircle,
  History,
  CornerDownRight,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/page-container";

type Submission = {
  id: string;
  title: string;
  content: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  feedback: string | null;
  score: number | null;
  submittedBy: { name: string } | null;
  reviewedBy: { name: string } | null;
};

type LiteratureClientProps = {
  submissions: Submission[];
  team: {
    name: string;
    projectTitle: string;
    project: {
      title: string;
      domain: string;
    } | null;
  } | null;
  userName: string;
};

const statusStyles: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  APPROVED: {
    bg: "bg-emerald-50/50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle,
  },
  PENDING_REVIEW: {
    bg: "bg-amber-50/50",
    text: "text-amber-700",
    border: "border-amber-250",
    icon: Clock,
  },
  UNDER_REVIEW: {
    bg: "bg-blue-50/50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: Sparkles,
  },
  REVISION_REQUIRED: {
    bg: "bg-rose-50/50",
    text: "text-rose-700",
    border: "border-rose-250",
    icon: AlertCircle,
  },
  REJECTED: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: AlertCircle,
  },
};

export function LiteratureClient({
  submissions,
  team,
  userName,
}: LiteratureClientProps) {
  const [selectedSubId, setSelectedSubId] = useState<string | null>(
    submissions[0]?.id ?? null
  );

  const selectedSubmission = submissions.find((s) => s.id === selectedSubId) ?? null;

  const approvedCount = submissions.filter((s) => s.status === "APPROVED").length;
  const pendingCount = submissions.filter(
    (s) => s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW"
  ).length;
  const revisionCount = submissions.filter((s) => s.status === "REVISION_REQUIRED").length;

  const averageScore =
    submissions.filter((s) => s.score !== null).reduce((sum, s) => sum + (s.score ?? 0), 0) /
      (submissions.filter((s) => s.score !== null).length || 1);

  const completionPct = Math.min(100, Math.round((approvedCount / Math.max(1, submissions.length)) * 100));

  return (
    <PageContainer
      title="Literature Review Workspace"
      description="Track and synthesize academic papers, baseline comparisons, and research gaps."
      actions={
        <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold px-3 py-1">
          {submissions.length} Total Submissions
        </Badge>
      }
    >
      {/* Project Details Banner */}
      <Card className="overflow-hidden border-border bg-card text-foreground shadow-sm">
        <CardContent className="p-6 grid gap-6 md:grid-cols-[1fr_280px] md:items-center">
          <div className="space-y-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
              Active Research Brief
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">
              {team?.projectTitle ?? "No Project Title"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Domain focus: <span className="font-semibold text-foreground">{team?.project?.domain ?? "N/A"}</span> · Team: <span className="font-semibold text-foreground">{team?.name ?? "N/A"}</span>
            </p>
          </div>
          <div className="border border-slate-100 rounded-2xl bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Literature Approval</span>
              <span className="text-foreground">{completionPct}%</span>
            </div>
            <Progress value={completionPct} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground leading-normal">
              Get all literature drafts approved by your mentor to unlock final dissertation submission.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* References Indexed */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>References Indexed</span>
            </div>
            <div className="text-4xl font-bold text-slate-900 tracking-tight leading-none mt-1">
              {submissions.length * 3 + (approvedCount * 2)}
            </div>
          </CardContent>
        </Card>

        {/* Approved Drafts */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Approved Drafts</span>
            </div>
            <div className="text-4xl font-bold text-emerald-600 tracking-tight leading-none mt-1">
              {approvedCount}
            </div>
          </CardContent>
        </Card>

        {/* Awaiting Review */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Awaiting Review</span>
            </div>
            <div className="text-4xl font-bold text-amber-600 tracking-tight leading-none mt-1">
              {pendingCount}
            </div>
          </CardContent>
        </Card>

        {/* Average Research Score */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Award className="w-4 h-4 text-indigo-500" />
              <span>Avg Quality Score</span>
            </div>
            <div className="text-4xl font-bold text-indigo-600 tracking-tight leading-none mt-1">
              {submissions.length > 0 ? Math.round(averageScore) : 0}/100
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Console Workspace */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Side: Submission Records */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            Literature Submissions history
          </h3>

          {submissions.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <FileText className="size-12 text-slate-355/40 mb-3" />
                <p className="text-sm font-semibold">No literature submissions yet</p>
                <p className="text-xs max-w-xs mt-1">
                  Upload your initial bibliography or survey document in the Weekly Submissions channel.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => {
                const isSelected = selectedSubId === sub.id;
                const style = statusStyles[sub.status] ?? statusStyles.PENDING_REVIEW;
                const StatusIcon = style.icon;

                return (
                  <Card
                    key={sub.id}
                    className={cn(
                      "cursor-pointer hover:border-slate-300 transition duration-150",
                      isSelected && "border-indigo-650 bg-indigo-50/5 shadow-xs"
                    )}
                    onClick={() => setSelectedSubId(sub.id)}
                  >
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <h4 className="font-semibold text-sm leading-snug text-slate-800 truncate">
                          {sub.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Submitted on {new Date(sub.submittedAt).toLocaleDateString()} · By {sub.submittedBy?.name ?? "Student"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {sub.score !== null && (
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 rounded-md px-2 py-1">
                            {sub.score} pts
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", style.bg, style.text, style.border)}
                        >
                          <StatusIcon className="size-3 mr-1 shrink-0" />
                          {sub.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Selected Submission Details Panel */}
        <aside>
          {selectedSubmission ? (
            <Card className="border-indigo-100 shadow-md sticky top-24">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-1.5 pb-4 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                    Detailed Review Context
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedSubmission.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    ID: {selectedSubmission.id} · Submitted {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Submission Content / Abstract
                  </span>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 text-xs leading-relaxed text-slate-700 max-h-[160px] overflow-y-auto">
                    {selectedSubmission.content}
                  </div>
                </div>

                {selectedSubmission.feedback ? (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Mentor Feedback
                    </span>
                    <div className="rounded-xl bg-indigo-50/40 border border-indigo-100/60 p-4 text-xs leading-relaxed text-indigo-950 font-medium">
                      <div className="flex items-center gap-1.5 mb-2 text-indigo-800">
                        <MessageSquare className="size-3.5" />
                        <span className="font-semibold">{selectedSubmission.reviewedBy?.name ?? "Faculty Mentor"}</span>
                      </div>
                      {selectedSubmission.feedback}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-amber-50/30 border border-amber-100 p-4 text-xs text-amber-800 leading-normal">
                    This submission is currently in the review queue. Mentor feedback and quality scores will populate once the evaluation is finalized.
                  </div>
                )}

                {selectedSubmission.reviewedAt && (
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <CornerDownRight className="size-3 text-slate-300" />
                    Reviewed on {new Date(selectedSubmission.reviewedAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-muted-foreground h-48 flex flex-col justify-center items-center">
              <p className="text-sm font-semibold">No submission selected</p>
              <p className="text-xs mt-1">Select a submission from the list to view detailed feedback.</p>
            </Card>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}
