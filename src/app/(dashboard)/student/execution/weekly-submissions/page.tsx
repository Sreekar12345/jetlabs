import {
  AlertTriangle,
  Check,
  Clock3,
  Github,
  Link2,
  Paperclip,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const validationChecks = [
  {
    label: "GitHub commits this week",
    detail: "12 commits detected after last review",
    status: "success",
  },
  {
    label: "Code diff vs last week",
    detail: "Meaningful implementation delta found",
    status: "success",
  },
  {
    label: "Deployment reachable",
    detail: "Preview URL last checked 18 min ago",
    status: "success",
  },
  {
    label: "Attached evidence",
    detail: "Add one demo screenshot or run log",
    status: "warning",
  },
  {
    label: "Same text as previous week",
    detail: "No repeated progress narrative detected",
    status: "success",
  },
  {
    label: "Plagiarism scan",
    detail: "Queued before faculty review",
    status: "warning",
  },
];

const uploadedFiles = [
  { name: "week-4-demo-screenshot.png", size: "1.8 MB" },
  { name: "benchmark-log.csv", size: "420 KB" },
];

const historyItems = [
  {
    week: "Week 3",
    title: "Dataset pipeline and model baseline",
    status: "Approved",
    date: "Reviewed 2 days ago",
  },
  {
    week: "Week 2",
    title: "Literature matrix and problem framing",
    status: "Approved",
    date: "Reviewed last week",
  },
  {
    week: "Week 1",
    title: "Problem selection evidence",
    status: "Revision closed",
    date: "Reviewed 12 days ago",
  },
  {
    week: "Week 0",
    title: "Team setup and repository initialization",
    status: "Approved",
    date: "Reviewed 3 weeks ago",
  },
];

function checkTone(status: string) {
  if (status === "success") {
    return {
      icon: Check,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    icon: AlertTriangle,
    className: "border-orange-200 bg-orange-50 text-orange-700",
  };
}

function FieldGroup({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      {helper ? <p className="text-sm leading-6 text-muted-foreground">{helper}</p> : null}
      {children}
    </div>
  );
}

export default function WeeklySubmissionsPage() {
  return (
    <PageContainer
      title="Weekly submissions"
      description="Submit consistent weekly proof of work. Faculty reviews each within 48 hours."
    >
      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList className="rounded-xl bg-muted/70 p-1">
          <TabsTrigger value="submit" className="rounded-lg px-4 py-2">
            Submit week 4
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-4 py-2">
            History (4)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card>
              <CardHeader className="border-b border-border pb-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="text-2xl">Week 4 proof of work</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Capture what moved this week: implementation, evidence, blockers,
                      and next-step commitments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    <Clock3 className="size-3.5" />
                    Auto-saved 2 min ago
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="rounded-full border border-border bg-white px-3 py-1.5">
                    Due Friday, 6:00 PM
                  </span>
                  <span className="rounded-full border border-border bg-white px-3 py-1.5">
                    Faculty review SLA: 48 hours
                  </span>
                  <span className="rounded-full border border-border bg-white px-3 py-1.5">
                    Draft mode
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-8 pt-7">
                <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
                  <FieldGroup label="Week number">
                    <Input className="rounded-xl bg-muted/30" defaultValue="4" />
                  </FieldGroup>
                  <FieldGroup
                    label="Submission title"
                    helper="Use a specific title that faculty can scan quickly."
                  >
                    <Input
                      className="rounded-xl bg-muted/30"
                      defaultValue="Model baseline, deployment preview, and paper evidence"
                    />
                  </FieldGroup>
                </div>

                <div className="border-t border-border pt-7">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <FieldGroup
                      label="Objectives completed"
                      helper="Summarize the planned work that was finished this week."
                    >
                      <Textarea
                        className="min-h-44 rounded-xl bg-muted/30 leading-7"
                        defaultValue="Completed data preprocessing, baseline CNN training, and first deployment preview for faculty review."
                      />
                    </FieldGroup>
                    <FieldGroup
                      label="Technical implementation"
                      helper="Describe implementation evidence, commits, and measurable changes."
                    >
                      <Textarea
                        className="min-h-44 rounded-xl bg-muted/30 leading-7"
                        defaultValue="Added augmentation pipeline, evaluation notebook, model checkpoint export, and deployment health checks."
                      />
                    </FieldGroup>
                  </div>
                </div>

                <div className="border-t border-border pt-7">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <FieldGroup
                      label="Blockers faced"
                      helper="Call out anything that slowed progress or needs faculty help."
                    >
                      <Textarea
                        className="min-h-40 rounded-xl bg-muted/30 leading-7"
                        defaultValue="Validation accuracy varies across low-light samples. Need mentor confirmation on evaluation framing."
                      />
                    </FieldGroup>
                    <FieldGroup
                      label="Next week goals"
                      helper="Make next week's work specific enough to evaluate."
                    >
                      <Textarea
                        className="min-h-40 rounded-xl bg-muted/30 leading-7"
                        defaultValue="Run ablation study, add confusion-matrix analysis, and prepare paper results section draft."
                      />
                    </FieldGroup>
                  </div>
                </div>

                <div className="border-t border-border pt-7">
                  <div className="grid gap-5 lg:grid-cols-2">
                    <FieldGroup label="GitHub link">
                      <div className="relative">
                        <Github className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="rounded-xl bg-muted/30 pl-11"
                          defaultValue="https://github.com/team/grid-sense"
                        />
                      </div>
                    </FieldGroup>
                    <FieldGroup label="Deployment link">
                      <div className="relative">
                        <Link2 className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="rounded-xl bg-muted/30 pl-11"
                          defaultValue="https://grid-sense-preview.vercel.app"
                        />
                      </div>
                    </FieldGroup>
                  </div>
                </div>

                <div className="border-t border-border pt-7">
                  <FieldGroup
                    label="Evidence attachments"
                    helper="Upload screenshots, demo clips, experiment logs, or other proof of work."
                  >
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center transition-colors hover:bg-muted/35">
                      <UploadCloud className="mx-auto size-9 text-muted-foreground" />
                      <p className="mt-4 text-sm font-semibold text-foreground">
                        Drop evidence files here
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        PNG, PDF, CSV, ZIP, or short demo clips up to institutional limits.
                      </p>
                      <Button type="button" variant="outline" className="mt-5">
                        Browse files
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.name}
                          className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                            <Paperclip className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                          <button
                            type="button"
                            className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </FieldGroup>
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-7 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" className="h-11 px-5">
                    Save draft
                  </Button>
                  <Button type="button" className="h-11 px-5">
                    Submit for review
                  </Button>
                </div>
              </CardContent>
            </Card>

            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                      <ShieldCheck className="size-5" />
                    </span>
                    <div>
                      <CardTitle className="text-lg">Anti-fake-progress checks</CardTitle>
                      <p className="mt-2 text-sm text-muted-foreground">
                        These run before faculty review
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {validationChecks.map((item) => {
                    const tone = checkTone(item.status);
                    const Icon = tone.icon;

                    return (
                      <div key={item.label} className="flex gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border",
                            tone.className,
                          )}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {item.label}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Submission readiness
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Strong evidence pack with one attachment warning.
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-foreground">82%</span>
                  </div>
                  <Progress value={82} className="h-2 bg-muted" />
                  <p className="text-sm leading-6 text-muted-foreground">
                    Add one visual demo artifact before submitting to improve faculty review
                    confidence.
                  </p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Submission history</CardTitle>
              <p className="text-sm text-muted-foreground">
                Previous weekly packets and faculty review outcomes.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {historyItems.map((item) => (
                <div key={item.week} className="rounded-2xl border border-border p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        {item.week}
                      </p>
                      <h3 className="mt-2 text-base">{item.title}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-emerald-700"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{item.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
