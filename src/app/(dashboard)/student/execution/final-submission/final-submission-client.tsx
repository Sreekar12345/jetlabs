"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  CloudUpload,
  FileCheck2,
  FileText,
  Github,
  Link2,
  LockKeyhole,
  Presentation,
  Rocket,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createStudentSubmissionAction } from "@/lib/actions/review-actions";
import { toast } from "sonner";

type Submission = {
  id: string;
  type: string;
  title: string;
  content: string;
  status: string;
  submittedAt: string | Date;
  feedback?: string | null;
};

type Team = {
  id: string;
  name: string;
  batch: string;
  projectTitle: string;
  project: {
    id: string;
    title: string;
    description: string;
  };
};

export function FinalSubmissionClient({
  submissions,
  team,
}: {
  submissions: Submission[];
  team: Team;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog/Modal states for uploads
  const [activeUploadKind, setActiveUploadKind] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");

  // Determine status of each deliverable from database submissions
  const findSubmissionByKeyword = (
    type: string,
    keywords: string[]
  ): Submission | null => {
    return (
      submissions.find((s) => {
        if (s.type !== type) return false;
        const text = `${s.title} ${s.content}`.toLowerCase();
        return keywords.some((keyword) => text.includes(keyword));
      }) ?? null
    );
  };

  const getDeliverableStatus = (sub: Submission | null) => {
    if (!sub) return { status: "Missing", current: "", record: null };
    if (sub.status === "APPROVED") {
      return { status: "Ready", current: sub.content, record: sub };
    }
    return { status: "Needs Review", current: sub.content, record: sub };
  };

  // 1. GitHub Repository (any submission with github or type FINAL/WEEKLY containing repo link)
  const repoSub = submissions.find(
    (s) =>
      s.content.toLowerCase().includes("github.com") ||
      s.content.toLowerCase().includes("git")
  ) ?? null;
  const repoData = getDeliverableStatus(repoSub);

  // 2. Deployment Link (any submission with vercel.app, Netlify, or deployment links)
  const deploySub = submissions.find(
    (s) =>
      s.content.toLowerCase().includes("vercel.app") ||
      s.content.toLowerCase().includes("netlify") ||
      s.content.toLowerCase().includes("amplify") ||
      s.content.toLowerCase().includes("http") && s.content.toLowerCase().includes("deploy")
  ) ?? null;
  const deployData = getDeliverableStatus(deploySub);

  // 3. IEEE Paper (type IEEE)
  const ieeeSub = submissions.find((s) => s.type === "IEEE") ?? null;
  const ieeeData = getDeliverableStatus(ieeeSub);

  // 4. Project PPT (type FINAL, keywords ppt, presentation, deck)
  const pptSub = findSubmissionByKeyword("FINAL", ["ppt", "presentation", "deck"]);
  const pptData = getDeliverableStatus(pptSub);

  // 5. Demo Video (type FINAL, keywords video, demo, walkthrough)
  const videoSub = findSubmissionByKeyword("FINAL", ["video", "demo", "walkthrough"]);
  const videoData = getDeliverableStatus(videoSub);

  const deliverables = [
    {
      title: "GitHub Repository",
      description: "Final source code, README, setup guide, and commit history.",
      current: repoData.current || "github.com/team-repo",
      status: repoData.status,
      action: repoData.status === "Missing" ? "Upload" : "View",
      icon: Github,
      kind: "link",
      record: repoData.record,
      uploadType: "WEEKLY",
      defaultTitle: "GitHub Source Repository Link",
    },
    {
      title: "Deployment Link",
      description: "Stable production preview for faculty and viva evaluators.",
      current: deployData.current || "project-preview.vercel.app",
      status: deployData.status,
      action: deployData.status === "Missing" ? "Upload" : "View",
      icon: Link2,
      kind: "link",
      record: deployData.record,
      uploadType: "WEEKLY",
      defaultTitle: "Production Live Deployment URL",
    },
    {
      title: "IEEE Paper PDF",
      description: "Camera-ready paper with figures, citations, and appendices.",
      current: ieeeData.current || "project-ieee-paper-final.pdf",
      status: ieeeData.status,
      action: ieeeData.status === "Missing" ? "Upload" : "Replace",
      icon: FileText,
      kind: "file",
      record: ieeeData.record,
      uploadType: "IEEE",
      defaultTitle: "IEEE Research Paper PDF / Doc Link",
    },
    {
      title: "Project PPT",
      description: "Final evaluation deck covering problem, build, results, and demo.",
      current: pptData.current || "project-presentation-deck.pptx",
      status: pptData.status,
      action: pptData.status === "Missing" ? "Upload" : "Replace",
      icon: Presentation,
      kind: "upload",
      record: pptData.record,
      uploadType: "FINAL",
      defaultTitle: "Capstone Project Presentation PPT Deck",
    },
    {
      title: "Demo Video",
      description: "Three-minute product walkthrough with deployment evidence.",
      current: videoData.current || "project-walkthrough-video.mp4",
      status: videoData.status,
      action: videoData.status === "Missing" ? "Upload" : "Replace",
      icon: Video,
      kind: "upload",
      record: videoData.record,
      uploadType: "FINAL",
      defaultTitle: "Project Demo Walkthrough Video Link",
    },
  ];

  // Calculate dynamic readiness score
  // Each approved (Ready) deliverable = 20%, Under review = 10%
  const calculatePoints = (status: string) => {
    if (status === "Ready") return 20;
    if (status === "Needs Review") return 10;
    return 0;
  };

  const readinessScore = deliverables.reduce(
    (total, d) => total + calculatePoints(d.status),
    0
  );

  const missingItems = deliverables
    .filter((d) => d.status === "Missing")
    .map((d) => d.title);

  const handleOpenUpload = (d: typeof deliverables[0]) => {
    setActiveUploadKind(d.title);
    setUploadTitle(d.defaultTitle);
    setUploadUrl("");
    setUploadDesc(d.description);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) {
      toast.error("Please provide a valid file link or URL.");
      return;
    }

    const d = deliverables.find((item) => item.title === activeUploadKind);
    if (!d) return;

    startTransition(async () => {
      const res = await createStudentSubmissionAction({
        type: d.uploadType,
        title: uploadTitle.trim() || d.defaultTitle,
        content: `${uploadUrl.trim()} - Description: ${uploadDesc}`,
      });

      if (res.success) {
        toast.success(`Successfully uploaded deliverable: ${d.title}!`);
        setActiveUploadKind(null);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to submit deliverable.");
      }
    });
  };

  return (
    <PageContainer
      title="Final Submission"
      description="Submit all required deliverables before viva evaluation."
      actions={
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <Badge
            className={cn(
              readinessScore === 100
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-orange-200 bg-orange-50 text-orange-700"
            )}
          >
            {readinessScore === 100 ? "Ready for Evaluation" : "In Progress"}
          </Badge>
          <div className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-muted-foreground">
            <Clock3 className="size-3.5" />
            Database Synchronized
          </div>
        </div>
      }
    >
      {/* Header Cards Grid */}
      <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcff_48%,#eef3ff_100%)] shadow-[0_22px_70px_rgba(15,23,42,0.06)]">
        <CardContent className="p-6 sm:p-8">
          <div className="grid gap-7 xl:grid-cols-[auto_minmax(0,1fr)_280px] xl:items-center">
            {/* Readiness Ring */}
            <div
              className="relative grid size-36 shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#4f46e5 0deg ${
                  readinessScore * 3.6
                }deg, #e5e7eb ${readinessScore * 3.6}deg 360deg)`,
              }}
              aria-label={`Final submission readiness is ${readinessScore} percent`}
            >
              <div className="grid size-28 place-items-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)]">
                <div className="text-center">
                  <p className="text-3xl font-semibold tracking-normal text-foreground">
                    {readinessScore}%
                  </p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-normal text-muted-foreground">
                    Ready
                  </p>
                </div>
              </div>
            </div>

            {/* Title & Info */}
            <div className="space-y-5">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <Rocket className="size-3.5" />
                  Final launch gate
                </div>
                <h2 className="text-3xl font-semibold tracking-normal text-foreground">
                  {deliverables.filter((d) => d.status !== "Missing").length} of 5 deliverables
                  logged
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {readinessScore === 100
                    ? "Congratulations! All project deliverables have been submitted and approved. Your team is ready for the Viva defense panel."
                    : "Please complete and submit the remaining deliverables to unlock faculty review and finalize your Capstone Project credentials."}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-5">
                {deliverables.map((d) => (
                  <div
                    key={d.title}
                    className={cn(
                      "flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition duration-200",
                      d.status === "Ready"
                        ? "border-emerald-200 bg-white text-emerald-700"
                        : d.status === "Needs Review"
                          ? "border-orange-200 bg-white text-orange-700"
                          : "border-dashed border-slate-200 bg-white/70 text-slate-500"
                    )}
                  >
                    {d.status === "Ready" ? (
                      <Check className="size-3.5 shrink-0" />
                    ) : d.status === "Needs Review" ? (
                      <Clock3 className="size-3.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="size-3.5 shrink-0" />
                    )}
                    <span className="min-w-0 truncate">{d.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review SLA Panel */}
            <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold text-foreground">Review window</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
                48 hrs
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Faculty review SLA applies immediately on deliverable uploads.
              </p>
              <Progress value={readinessScore} className="mt-4 h-1.5 bg-slate-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliverables Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {deliverables.map((d) => {
          const Icon = d.icon;
          const missing = d.status === "Missing";
          const isView = d.action === "View";

          const statusClass = (status: string) => {
            if (status === "Ready") {
              return "border-emerald-200 bg-emerald-50 text-emerald-700";
            }
            if (status === "Needs Review") {
              return "border-orange-200 bg-orange-50 text-orange-700";
            }
            return "border-slate-200 bg-slate-50 text-slate-600";
          };

          return (
            <Card
              key={d.title}
              className={cn(
                "group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]",
                missing && "border-orange-200/80"
              )}
            >
              <CardContent className="flex h-full flex-col gap-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-xl border bg-muted/50 text-foreground transition duration-200 group-hover:bg-white",
                        missing && "border-orange-200 bg-orange-50 text-orange-700"
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-foreground">
                        {d.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {d.description}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusClass(d.status)}>
                    {d.status}
                  </Badge>
                </div>

                {missing ? (
                  <button
                    type="button"
                    onClick={() => handleOpenUpload(d)}
                    className="w-full rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-5 text-center transition duration-200 hover:bg-orange-50/70"
                  >
                    <CloudUpload className="mx-auto size-7 text-orange-700" />
                    <p className="mt-3 text-sm font-semibold text-foreground">
                      Submit {d.title} Link
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Provide a URL to document your evidence.
                    </p>
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/25 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                        Current {d.kind}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-foreground">
                        {d.current}
                      </p>
                    </div>
                    {d.status === "Ready" ? (
                      <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
                    ) : (
                      <Clock3 className="size-5 shrink-0 text-orange-600 animate-pulse" />
                    )}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5">
                  <p className="text-xs leading-5 text-muted-foreground flex-1">
                    {missing
                      ? "Required before final evaluation approve."
                      : d.status === "Needs Review"
                        ? "Waiting for faculty review and evaluation score."
                        : "Verified and locked inside the final pack."}
                  </p>
                  {isView && d.record ? (
                    <a
                      href={
                        d.current.startsWith("http")
                          ? d.current.split(" - Description")[0]
                          : `https://${d.current.split(" - Description")[0]}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition"
                    >
                      Open Link
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  ) : (
                    <Button
                      variant={missing ? "default" : "outline"}
                      className="rounded-xl"
                      onClick={() => handleOpenUpload(d)}
                    >
                      {d.action}
                      <CloudUpload className="size-4 ml-1.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lock Gate summary */}
      <Card className="border-slate-200 bg-slate-950 text-white">
        <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
              <LockKeyhole className="size-3.5" />
              Review gate
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-white">
                {readinessScore === 100
                  ? "Project Evaluation Unlocked"
                  : "Final Evaluation Locked"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                {readinessScore === 100
                  ? "All deliverables have been successfully logged! Faculty evaluators have been notified to score and authorize final viva defense scheduling."
                  : "Complete all 5 deliverables to unlock advisor review, project completion marks, and viva panel scheduling."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">Deliverables status</p>
            <div className="mt-4 space-y-3">
              {missingItems.length > 0 ? (
                missingItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/75"
                  >
                    <AlertTriangle className="size-4 text-orange-300" />
                    Pending: {item}
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  All deliverables complete
                </div>
              )}
            </div>
            <Button
              disabled={missingItems.length > 0}
              className={cn(
                "mt-5 w-full rounded-xl bg-white text-slate-950",
                missingItems.length > 0 ? "opacity-40" : "hover:bg-slate-100"
              )}
            >
              <FileCheck2 className="size-4" />
              {readinessScore === 100 ? "Review Process Active" : "Unlock review"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog Modal */}
      {activeUploadKind ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveUploadKind(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-bold text-foreground">
                Submit Deliverable: {activeUploadKind}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveUploadKind(null)}
                className="rounded-xl"
              >
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Deliverable URL/Link
                </label>
                <Input
                  placeholder="https://example.com/your-file-or-link"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="rounded-xl bg-muted/40 border-border"
                  disabled={isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Submission Title
                </label>
                <Input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="rounded-xl bg-muted/40 border-border"
                  disabled={isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Submission Notes / Details
                </label>
                <Textarea
                  placeholder="Provide setup instructions, comments, or presentation highlights..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="rounded-xl bg-muted/40 border-border min-h-[100px]"
                  disabled={isPending}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-border mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setActiveUploadKind(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl font-medium" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit Deliverable"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
