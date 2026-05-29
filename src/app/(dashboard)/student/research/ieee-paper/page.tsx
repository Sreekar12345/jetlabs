import {
  BookOpenCheck,
  Check,
  Download,
  Eye,
  FilePlus2,
  MessageSquareText,
  PenLine,
  Quote,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const metrics = [
  {
    label: "Overall completion",
    value: "68%",
    detail: "Weighted across draft, evidence, figures, and review closure.",
    progress: 68,
    tone: "default",
  },
  {
    label: "Sections approved",
    value: "4/11",
    detail: "Internal review gates cleared by faculty.",
    progress: 36,
    tone: "success",
  },
  {
    label: "References",
    value: "24",
    detail: "18 IEEE sources with DOI metadata verified.",
    progress: 82,
    tone: "success",
  },
  {
    label: "Research completeness",
    value: "76%",
    detail: "Results and discussion need final evidence polish.",
    progress: 76,
    tone: "warning",
  },
];

const sections = [
  { title: "Abstract", progress: 92, comments: 1, status: "approved", active: true },
  { title: "Introduction", progress: 84, comments: 0, status: "approved" },
  { title: "Problem Statement", progress: 78, comments: 2, status: "review" },
  { title: "Literature Review", progress: 71, comments: 3, status: "review" },
  { title: "Methodology", progress: 82, comments: 1, status: "approved" },
  { title: "System Architecture", progress: 64, comments: 2, status: "draft" },
  { title: "Implementation", progress: 58, comments: 1, status: "draft" },
  { title: "Results", progress: 46, comments: 4, status: "review" },
  { title: "Conclusion", progress: 34, comments: 0, status: "draft" },
  { title: "Future Scope", progress: 28, comments: 0, status: "draft" },
  { title: "References", progress: 88, comments: 1, status: "approved" },
];

const references = [
  {
    authors: "S. Kumar, R. Mehta, and P. Rao",
    title: "Deep convolutional pipelines for crop disease diagnosis under field conditions",
    venue: "IEEE Access, vol. 12, pp. 19422-19436, 2025.",
  },
  {
    authors: "A. Singh and M. Patel",
    title: "Explainable visual classification for precision agriculture",
    venue: "Proc. IEEE ICMLA, pp. 318-325, 2024.",
  },
  {
    authors: "L. Chen, K. Varma, and D. Iyer",
    title: "Benchmarking plant pathology datasets for robust edge inference",
    venue: "IEEE Transactions on AgriFood Electronics, vol. 3, no. 2, pp. 88-101, 2024.",
  },
];

function statusStyles(tone: string) {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tone === "warning") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border-border bg-muted/50 text-muted-foreground";
}

function SectionStatus({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
        <Check className="size-3.5" />
      </span>
    );
  }

  if (status === "review") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-orange-700">
        <MessageSquareText className="size-3.5" />
      </span>
    );
  }

  return <span className="size-2.5 rounded-full bg-muted-foreground/35" />;
}

export default function IEEEPaperPage() {
  return (
    <PageContainer
      title="IEEE research paper"
      description="Section-by-section drafting with faculty review"
      actions={
        <>
          <Button variant="outline" className="rounded-xl">
            <Eye className="size-4" />
            IEEE preview
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Download className="size-4" />
            Export PDF
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="gap-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="text-3xl font-semibold tracking-normal text-foreground">
                  {metric.value}
                </p>
              </div>
              <span
                className={cn(
                  "mt-1 size-2.5 rounded-full border",
                  metric.tone === "success" && "border-emerald-300 bg-emerald-400",
                  metric.tone === "warning" && "border-orange-300 bg-orange-400",
                  metric.tone === "default" && "border-slate-300 bg-slate-900",
                )}
              />
            </div>
            <Progress value={metric.progress} className="h-1.5 bg-muted/80" />
            <p className="text-sm leading-6 text-muted-foreground">{metric.detail}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border pb-5">
              <CardTitle className="text-xl">Sections</CardTitle>
              <p className="text-sm text-muted-foreground">Click to draft</p>
            </CardHeader>
            <CardContent className="px-3 py-3">
              <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
                {sections.map((section) => (
                  <button
                    key={section.title}
                    type="button"
                    className={cn(
                      "rounded-xl border border-transparent p-3 text-left transition duration-200 hover:border-border hover:bg-muted/45",
                      section.active && "border-border bg-muted/60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {section.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{section.progress}%</span>
                          {section.comments > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <MessageSquareText className="size-3" />
                              {section.comments}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <SectionStatus status={section.status} />
                    </div>
                    <Progress value={section.progress} className="mt-3 h-1 bg-muted" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border pb-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="bg-muted/40">
                      Active section
                    </Badge>
                    <Badge className={statusStyles("success")}>Faculty approved</Badge>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Abstract</CardTitle>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      IEEE two-column format. Target 180-220 words with problem,
                      method, results, and contribution in one readable block.
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:w-[360px]">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <BookOpenCheck className="size-4" />
                      Auto-saved
                    </div>
                    <p className="mt-1 text-xs text-emerald-700/80">2 min ago</p>
                  </div>
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-orange-700">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <ScanLine className="size-4" />
                      Scan queued
                    </div>
                    <p className="mt-1 text-xs text-orange-700/80">Before review</p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <Tabs defaultValue="edit" className="space-y-5">
                <TabsList className="rounded-xl bg-muted/70 p-1">
                  <TabsTrigger value="edit" className="rounded-lg px-4 py-2">
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="rounded-lg px-4 py-2">
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="rounded-lg px-4 py-2">
                    Faculty comments
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit">
                  <div className="rounded-2xl border border-border bg-muted/20 p-3 sm:p-5">
                    <Textarea
                      className="min-h-[430px] resize-y rounded-xl border-border bg-white px-5 py-5 text-[15px] leading-8 shadow-none"
                      defaultValue={`Crop disease detection remains a critical challenge for small-scale farmers because visual symptoms vary under uncontrolled field conditions. This paper presents a convolutional neural network workflow for detecting common leaf diseases from mobile-captured crop images, with emphasis on reproducible preprocessing, lightweight deployment, and faculty-verifiable evaluation evidence.

The proposed system combines curated image augmentation, baseline CNN training, confusion-matrix based analysis, and a deployment preview that supports rapid advisory feedback. Preliminary experiments indicate stable classification performance across the primary disease classes while revealing sensitivity to low-light samples. The work contributes a structured, student-friendly research pipeline that connects weekly implementation evidence with IEEE-aligned documentation and review readiness.`}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <article className="rounded-2xl border border-border bg-muted/20 p-6 leading-8 text-foreground">
                    <p className="text-center text-sm font-semibold uppercase tracking-normal">
                      Abstract
                    </p>
                    <p className="mt-5 text-[15px]">
                      Crop disease detection remains a critical challenge for
                      small-scale farmers because visual symptoms vary under uncontrolled
                      field conditions. This paper presents a convolutional neural
                      network workflow for detecting common leaf diseases from
                      mobile-captured crop images, with emphasis on reproducible
                      preprocessing, lightweight deployment, and faculty-verifiable
                      evaluation evidence.
                    </p>
                    <p className="mt-4 text-[15px]">
                      The proposed system combines curated image augmentation, baseline
                      CNN training, confusion-matrix based analysis, and a deployment
                      preview that supports rapid advisory feedback.
                    </p>
                  </article>
                </TabsContent>

                <TabsContent value="comments">
                  <div className="grid gap-3">
                    {[
                      "Compress the first sentence so the research gap appears earlier.",
                      "Add the preliminary accuracy range after the method sentence.",
                      "Keep the final contribution tied to IEEE paper readiness.",
                    ].map((comment, index) => (
                      <div
                        key={comment}
                        className="rounded-2xl border border-border bg-muted/20 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            F{index + 1}
                          </span>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">
                              Faculty note
                            </p>
                            <p className="text-sm leading-6 text-muted-foreground">
                              {comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="rounded-xl">
                    <Quote className="size-4" />
                    Insert citation
                  </Button>
                  <Button variant="outline" className="rounded-xl">
                    <FilePlus2 className="size-4" />
                    Add figure
                  </Button>
                </div>
                <Button className="rounded-xl bg-primary px-5">
                  <PenLine className="size-4" />
                  Save & request review
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-2xl">References</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Managed BibTeX - exported with paper
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl">
                  <Sparkles className="size-4" />
                  Add reference
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ol className="space-y-4">
                {references.map((reference, index) => (
                  <li
                    key={reference.title}
                    className="grid gap-4 rounded-2xl border border-border bg-muted/20 p-4 sm:grid-cols-[44px_minmax(0,1fr)]"
                  >
                    <span className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="space-y-1 text-sm leading-7">
                      <p className="font-semibold text-foreground">{reference.authors}</p>
                      <p className="text-foreground">{reference.title}</p>
                      <p className="text-muted-foreground">{reference.venue}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
