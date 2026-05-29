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
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const milestones = [
  { label: "Repository", done: true },
  { label: "Deployment", done: true },
  { label: "IEEE Paper", done: true },
  { label: "PPT", done: false },
  { label: "Demo Video", done: false },
];

const deliverables = [
  {
    title: "GitHub Repository",
    description: "Final source code, README, setup guide, and commit history.",
    current: "github.com/team/grid-sense-final",
    status: "Ready",
    action: "View",
    icon: Github,
    kind: "link",
  },
  {
    title: "Deployment Link",
    description: "Stable production preview for faculty and viva evaluators.",
    current: "grid-sense.vercel.app",
    status: "Ready",
    action: "View",
    icon: Link2,
    kind: "link",
  },
  {
    title: "IEEE Paper PDF",
    description: "Camera-ready paper with figures, citations, and appendices.",
    current: "grid-sense-ieee-paper-v3.pdf",
    status: "Needs Review",
    action: "Replace",
    icon: FileText,
    kind: "file",
  },
  {
    title: "Project PPT",
    description: "Final evaluation deck covering problem, build, results, and demo.",
    current: "",
    status: "Missing",
    action: "Upload",
    icon: Presentation,
    kind: "upload",
  },
  {
    title: "Demo Video",
    description: "Three-minute product walkthrough with deployment evidence.",
    current: "",
    status: "Missing",
    action: "Upload",
    icon: Video,
    kind: "upload",
  },
];

const missingItems = ["Project PPT", "Demo Video"];

function statusClass(status: string) {
  if (status === "Ready") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Needs Review") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function statusIcon(status: string) {
  if (status === "Ready") {
    return CheckCircle2;
  }

  if (status === "Needs Review") {
    return AlertTriangle;
  }

  return CloudUpload;
}

function ReadinessRing() {
  return (
    <div
      className="relative grid size-36 shrink-0 place-items-center rounded-full"
      style={{
        background:
          "conic-gradient(#111827 0deg 216deg, #e5e7eb 216deg 360deg)",
      }}
      aria-label="Final submission readiness is 60 percent"
    >
      <div className="grid size-28 place-items-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)]">
        <div className="text-center">
          <p className="text-3xl font-semibold tracking-normal text-foreground">60%</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-normal text-muted-foreground">
            Ready
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FinalSubmissionPage() {
  return (
    <PageContainer
      title="Final Submission"
      description="Submit all required deliverables before viva evaluation."
      actions={
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <Badge className="border-orange-200 bg-orange-50 text-orange-700">
            In Progress
          </Badge>
          <div className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-muted-foreground">
            <Clock3 className="size-3.5" />
            Last updated today, 10:24 AM
          </div>
        </div>
      }
    >
      <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcff_48%,#eef3ff_100%)] shadow-[0_22px_70px_rgba(15,23,42,0.06)]">
        <CardContent className="p-6 sm:p-8">
          <div className="grid gap-7 xl:grid-cols-[auto_minmax(0,1fr)_280px] xl:items-center">
            <ReadinessRing />

            <div className="space-y-5">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <Rocket className="size-3.5" />
                  Final launch gate
                </div>
                <h2 className="text-3xl font-semibold tracking-normal text-foreground">
                  3 of 5 deliverables completed
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  2 more items required to unlock final approval. Keep the pack
                  concise, verifiable, and ready for faculty evaluation.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-5">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.label}
                    className={cn(
                      "flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition duration-200",
                      milestone.done
                        ? "border-emerald-200 bg-white text-emerald-700"
                        : "border-dashed border-orange-200 bg-white/70 text-orange-700",
                    )}
                  >
                    {milestone.done ? (
                      <Check className="size-3.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="size-3.5 shrink-0" />
                    )}
                    <span className="min-w-0 truncate">{milestone.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold text-foreground">Review window</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
                48 hrs
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Faculty review opens after all mandatory deliverables are verified.
              </p>
              <Progress value={60} className="mt-4 h-1.5 bg-slate-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {deliverables.map((deliverable) => {
          const Icon = deliverable.icon;
          const StatusIcon = statusIcon(deliverable.status);
          const missing = deliverable.status === "Missing";

          return (
            <Card
              key={deliverable.title}
              className={cn(
                "group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]",
                missing && "border-orange-200/80",
              )}
            >
              <CardContent className="flex h-full flex-col gap-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-xl border bg-muted/50 text-foreground transition duration-200 group-hover:bg-white",
                        missing && "border-orange-200 bg-orange-50 text-orange-700",
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-foreground">
                        {deliverable.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {deliverable.description}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusClass(deliverable.status)}>
                    <StatusIcon className="size-3" />
                    {deliverable.status}
                  </Badge>
                </div>

                {missing ? (
                  <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-5 text-center transition duration-200 group-hover:bg-orange-50/70">
                    <CloudUpload className="mx-auto size-7 text-orange-700" />
                    <p className="mt-3 text-sm font-semibold text-foreground">
                      Drop file here to complete this deliverable
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Accepted formats follow the final evaluation checklist.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/25 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                        Current {deliverable.kind}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-foreground">
                        {deliverable.current}
                      </p>
                    </div>
                    {deliverable.status === "Ready" ? (
                      <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="size-5 shrink-0 text-orange-600" />
                    )}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5">
                  <p className="text-xs leading-5 text-muted-foreground">
                    {missing
                      ? "Required before approval can unlock."
                      : deliverable.status === "Needs Review"
                        ? "Faculty will verify formatting and evidence."
                        : "Verified and included in the final pack."}
                  </p>
                  <Button
                    variant={missing ? "default" : "outline"}
                    className="rounded-xl"
                  >
                    {deliverable.action}
                    {deliverable.action === "View" ? (
                      <ArrowUpRight className="size-4" />
                    ) : (
                      <CloudUpload className="size-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200 bg-slate-950 text-white">
        <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
              <LockKeyhole className="size-3.5" />
              Review gate
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-white">
                Final Approval Locked
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                Complete all mandatory deliverables to unlock faculty review and
                viva scheduling.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">Faculty review note</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Your repository, deployment, and IEEE PDF are visible. Upload the
                final presentation and demo recording to open the approval queue.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">Missing checklist</p>
            <div className="mt-4 space-y-3">
              {missingItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/75"
                >
                  <AlertTriangle className="size-4 text-orange-300" />
                  {item}
                </div>
              ))}
            </div>
            <Button
              disabled
              className="mt-5 w-full rounded-xl bg-white text-slate-950 opacity-60"
            >
              <FileCheck2 className="size-4" />
              Unlock faculty review
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
        <Button disabled className="h-11 w-full rounded-xl">
          <LockKeyhole className="size-4" />
          Final approval locked
        </Button>
      </div>
    </PageContainer>
  );
}
