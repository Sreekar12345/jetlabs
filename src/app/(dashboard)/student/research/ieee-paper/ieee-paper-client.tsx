"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  AlertTriangle,
  Plus,
  X,
  FileText,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  reviewedAt?: string | Date | null;
  feedback?: string | null;
  score?: number | null;
  submittedBy?: { name: string } | null;
  reviewedBy?: { name: string } | null;
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
    progress: number;
  };
};

const initialSections = [
  { title: "Abstract", progress: 92, status: "approved", active: true },
  { title: "Introduction", progress: 84, status: "approved" },
  { title: "Problem Statement", progress: 78, status: "review" },
  { title: "Literature Review", progress: 71, status: "review" },
  { title: "Methodology", progress: 82, status: "approved" },
  { title: "System Architecture", progress: 64, status: "draft" },
  { title: "Implementation", progress: 58, status: "draft" },
  { title: "Results", progress: 46, status: "review" },
  { title: "Conclusion", progress: 34, status: "draft" },
  { title: "Future Scope", progress: 28, status: "draft" },
  { title: "References", progress: 88, status: "approved" },
];

const defaultAbstract = `Crop disease detection remains a critical challenge for small-scale farmers because visual symptoms vary under uncontrolled field conditions. This paper presents a convolutional neural network workflow for detecting common leaf diseases from mobile-captured crop images, with emphasis on reproducible preprocessing, lightweight deployment, and faculty-verifiable evaluation evidence.

The proposed system combines curated image augmentation, baseline CNN training, confusion-matrix based analysis, and a deployment preview that supports rapid advisory feedback. Preliminary experiments indicate stable classification performance across the primary disease classes while revealing sensitivity to low-light samples. The work contributes a structured, student-friendly research pipeline that connects weekly implementation evidence with IEEE-aligned documentation and review readiness.`;

const sectionTemplates: Record<string, { placeholder: string; guidance: string }> = {
  Abstract: {
    placeholder: "Provide a concise summary of the project, methodology, and key results (typically 150-250 words).",
    guidance: "An abstract should be a single paragraph that outlines: (1) Background context / objective, (2) The specific problem addressed, (3) The proposed system or methodology, (4) Primary experimental results, and (5) Key conclusion / significance."
  },
  Introduction: {
    placeholder: "Introduce the background, relevance, and layout of the paper.",
    guidance: "State the motivation of your project. Provide context on the domain (e.g. Smart Cities, AgriTech). Explain why existing solutions are insufficient, and briefly outline your proposed contributions and the paper structure."
  },
  "Problem Statement": {
    placeholder: "Formally define the problem, system constraints, and objectives.",
    guidance: "Describe the specific technical challenges or inefficiencies. Include system inputs, outputs, mathematical formulation if applicable, operating constraints (e.g., latency, power, costs), and the scope of the project."
  },
  "Literature Review": {
    placeholder: "Critically review existing work and establish your novelty.",
    guidance: "Discuss 3-5 key papers. Construct a literature mapping matrix highlighting their methodologies, accuracy, datasets, and limitations. Point out the research gap that your project aims to fill."
  },
  Methodology: {
    placeholder: "Explain your technical approach, algorithms, and processes.",
    guidance: "Detail your proposed pipeline. Include step-by-step algorithms, data preprocessing details, model configuration parameters, and the reasoning behind choosing these components."
  },
  "System Architecture": {
    placeholder: "Describe the hardware/software architecture and data flows.",
    guidance: "Explain your high-level system diagram. Describe the interaction between hardware nodes, backend APIs, databases, and client dashboards. Detail data schema boundaries and networking protocols used."
  },
  Implementation: {
    placeholder: "Detail the actual development environment, tools, and code modules.",
    guidance: "Specify your tech stack (languages, frameworks, SDKs). Detail database migrations, API routes, edge configurations, and key library components. Mention optimization techniques like caching or quantization."
  },
  Results: {
    placeholder: "Present charts, metrics tables, and evaluation metrics.",
    guidance: "Provide quantitative proof of success. Present tables comparing baseline models against your system. Include precision/recall/F1-scores, latency metrics under load, or resource utilization charts."
  },
  Conclusion: {
    placeholder: "Summarize the findings and the outcome of the research.",
    guidance: "Summarize how the objectives were achieved. Highlight the key engineering takeaways, limitations of the current prototype, and the overall impact of the solution."
  },
  "Future Scope": {
    placeholder: "Outline potential extensions, scale-up options, and upgrades.",
    guidance: "Propose next steps, such as integrating federated learning, optimizing edge hardware, scaling cloud server actions, or deploying in live testbeds."
  },
  References: {
    placeholder: "IEEE formatted references list.",
    guidance: "Reference peer-reviewed journals, conferences, and books. Use standard IEEE formatting: [Index] Authors, 'Title', Venue, vol., no., pp., Year."
  }
};

const defaultContents: Record<string, string> = {
  Abstract: defaultAbstract,
  Introduction: `The introduction provides context on the background of the project and outlines its main contributions. In this capstone project, we address the challenge of building a robust and production-grade monitoring pipeline. 

The structure of this paper is organized as follows: Section II discusses the formal problem statement. Section III reviews relevant literature and highlights the novelty. Section IV details our methodology and implementation workflow. Section V discusses experimental results, and Section VI outlines our conclusion and future extensions.`,
  "Problem Statement": `The core technical problem revolves around real-time telemetry processing, stability verification, and user intervention feedback loops. 

Formally, the system must process streaming telemetry signals of dimension D within latency constraints L < 50ms, while maintaining an error tolerance threshold E < 2%. The target performance is evaluated across execution speed, data consistency, and panel review alignment metrics.`,
  "Literature Review": `We review several standard approaches to monitoring pipelines and predictive dashboards:

1. Traditional centralized polling models (e.g. [1]) suffer from bandwidth bottlenecks in large scale microgrid topologies.
2. Edge-first classification architectures (e.g. [2]) reduce network load but are sensitive to noisy field environments.
3. Hybrid federated configurations (e.g. [3]) guarantee privacy but introduce higher model coordination latency.

Our proposed system resolves these bottlenecks by combining edge-based feature extraction with dynamic cloud review workflows.`,
  Methodology: `Our proposed methodology employs a lightweight data preprocessing pipeline, followed by feature extraction and classification:

- Step 1: Preprocess incoming streaming parameters to filter high-frequency noise.
- Step 2: Extract normalized performance indicators and contribution vectors.
- Step 3: Run class-probability scoring models to evaluate risk.
- Step 4: Dispatch event triggers to the active advisor queue.`,
  "System Architecture": `The system architecture comprises three distinct layers:

1. Physical Sensor / User Event Layer: Captured mobile images or user inputs are processed on the local node.
2. Academic Operations API Layer: A secure Next.js server handles routing, database transactions, and scoring services.
3. Verification and UI Dashboard: Standard charts, telemetry feeds, and practice rehearse panels display data in real time.`,
  Implementation: `The implementation is built on top of Next.js 16 (Turbopack) using React 19 and TailwindCSS. The database is hosted on a Neon serverless PostgreSQL instance, mapped using Prisma ORM. For user security, NextAuth manages local credential hashing. Telemetry metrics are tracked via sequential weekly snapshots, feeding into interactive Recharts graphics.`,
  Results: `Experimental results indicate stable throughput across various deployment scenarios. Our baseline latency under simulated heavy load of 1000 concurrent updates remained within the target envelope:

- Average Response Speed: 42ms (Target: < 50ms)
- Precision Score: 94.2% (Target: > 90%)
- Alignment Metric: 88.6% (Target: > 85%)

No data losses or database deadlock conditions were encountered during multi-client write testing.`,
  Conclusion: `This paper presented a dynamic, database-connected research paper workspace designed for tracking student capstones. The work demonstrates how integrating real-time telemetry feeds with interactive peer review components improves evaluation transparency and accelerates the research writing workflow.`,
  "Future Scope": `Future enhancements include adding federated learning nodes for collaborative telemetry analysis, introducing automated LaTeX compilers to export camera-ready IEEE formats directly, and implementing generative feedback prompts to guide student rehearsal responses.`,
  References: `[1] S. Kumar, R. Mehta, and P. Rao, "Deep convolutional pipelines for crop disease diagnosis under field conditions," IEEE Access, vol. 12, pp. 19422-19436, 2025.
[2] A. Singh and M. Patel, "Explainable visual classification for precision agriculture," Proc. IEEE ICMLA, pp. 318-325, 2024.
[3] L. Chen, K. Varma, and D. Iyer, "Benchmarking plant pathology datasets for robust edge inference," IEEE Transactions on AgriFood Electronics, vol. 3, no. 2, pp. 88-101, 2024.`
};

function statusStyles(tone: string) {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50/70 text-emerald-700";
  }
  if (tone === "warning") {
    return "border-orange-200 bg-orange-50/70 text-orange-700";
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

export function IEEEPaperClient({
  team,
  submissions,
}: {
  team: Team;
  submissions: Submission[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state for references
  const [references, setReferences] = useState([
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
  ]);

  // Dialog/Form states for new reference
  const [isAddRefOpen, setIsAddRefOpen] = useState(false);
  const [refAuthors, setRefAuthors] = useState("");
  const [refTitle, setRefTitle] = useState("");
  const [refVenue, setRefVenue] = useState("");

  const [activeSection, setActiveSection] = useState("Abstract");

  // Find submission for active section dynamically
  const activeSubmission = submissions.find(
    (sub) => sub.title === `IEEE Paper Section Draft - ${activeSection}`
  );
  const latestSubmission = activeSubmission ?? null;

  // Editor states
  const [abstractText, setAbstractText] = useState(
    latestSubmission?.content ?? defaultContents[activeSection] ?? ""
  );

  // Sync editor content when active section changes
  useEffect(() => {
    setAbstractText(latestSubmission?.content ?? defaultContents[activeSection] ?? "");
  }, [activeSection, latestSubmission]);

  // Dynamic calculated metrics
  const isApproved = latestSubmission?.status === "APPROVED";
  const isPendingReview =
    latestSubmission?.status === "PENDING_REVIEW" ||
    latestSubmission?.status === "UNDER_REVIEW";

  const completionPct = isApproved ? 82 : isPendingReview ? 68 : 34;
  const sectionsApproved = isApproved ? "6/11" : isPendingReview ? "4/11" : "2/11";
  const sectionsProgress = isApproved ? 54 : isPendingReview ? 36 : 18;

  const metrics = [
    {
      label: "Overall completion",
      value: `${completionPct}%`,
      detail: "Weighted across draft, evidence, figures, and review closure.",
      progress: completionPct,
      tone: "default",
    },
    {
      label: "Sections approved",
      value: sectionsApproved,
      detail: "Internal review gates cleared by faculty.",
      progress: sectionsProgress,
      tone: "success",
    },
    {
      label: "References",
      value: `${references.length}`,
      detail: `${references.length} IEEE sources with DOI metadata verified.`,
      progress: Math.min(100, references.length * 15),
      tone: "success",
    },
    {
      label: "Research completeness",
      value: `${team.project.progress}%`,
      detail: "Results and discussion need final evidence polish.",
      progress: team.project.progress,
      tone: "warning",
    },
  ];

  const handleSaveDraft = () => {
    startTransition(async () => {
      const res = await createStudentSubmissionAction({
        type: "IEEE",
        title: `IEEE Paper Section Draft - ${activeSection}`,
        content: abstractText,
      });

      if (res.success) {
        toast.success("Draft saved and submitted for review!");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to save draft.");
      }
    });
  };

  const handleAddReferenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refAuthors || !refTitle || !refVenue) {
      toast.error("Please fill in all reference fields.");
      return;
    }

    setReferences((prev) => [
      ...prev,
      { authors: refAuthors, title: refTitle, venue: refVenue },
    ]);
    toast.success("Reference added successfully!");
    setIsAddRefOpen(false);
    setRefAuthors("");
    setRefTitle("");
    setRefVenue("");
  };

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
      {/* Metrics Row */}
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
                  metric.tone === "default" && "border-slate-300 bg-slate-900"
                )}
              />
            </div>
            <Progress value={metric.progress} className="h-1.5 bg-muted/80" />
            <p className="text-sm leading-6 text-muted-foreground">{metric.detail}</p>
          </Card>
        ))}
      </div>

      {/* Editor Layout */}
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Sections Sidebar */}
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border pb-5">
              <CardTitle className="text-xl">Sections</CardTitle>
              <p className="text-sm text-muted-foreground">Click to draft</p>
            </CardHeader>
            <CardContent className="px-3 py-3">
              <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
                {initialSections.map((section) => {
                  const isActive = activeSection === section.title;
                  return (
                    <button
                      key={section.title}
                      type="button"
                      onClick={() => setActiveSection(section.title)}
                      className={cn(
                        "rounded-xl border border-transparent p-3 text-left transition duration-200 hover:border-border hover:bg-muted/45",
                        isActive && "border-border bg-muted/60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-2">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {section.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{isActive ? "Editing" : `${section.progress}%`}</span>
                          </div>
                        </div>
                        <SectionStatus
                          status={
                            isActive
                              ? latestSubmission
                                ? latestSubmission.status === "APPROVED"
                                  ? "approved"
                                  : "review"
                                : "draft"
                              : section.status
                          }
                        />
                      </div>
                      <Progress
                        value={isActive ? 100 : section.progress}
                        className="mt-3 h-1 bg-muted"
                      />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Workspace Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border pb-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="bg-muted/45">
                      Active section: {activeSection}
                    </Badge>
                    <Badge
                      className={statusStyles(
                        latestSubmission
                          ? latestSubmission.status === "APPROVED"
                            ? "success"
                            : "warning"
                          : "default"
                      )}
                    >
                      {latestSubmission
                        ? latestSubmission.status.replaceAll("_", " ")
                        : "Draft"}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{activeSection}</CardTitle>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      IEEE template compliant content. Fill in details and click submit to send to your advisor.
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:w-[360px]">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <BookOpenCheck className="size-4" />
                      Status
                    </div>
                    <p className="mt-1 text-xs text-emerald-700/80">
                      {latestSubmission
                        ? `Last action: ${new Date(
                            latestSubmission.submittedAt
                          ).toLocaleDateString()}`
                        : "No versions saved yet"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-orange-700">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <ScanLine className="size-4" />
                      Assigned Mentor
                    </div>
                    <p className="mt-1 text-xs text-orange-700/80">
                      Auto-routed
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <Tabs defaultValue="edit" className="space-y-5">
                <TabsList className="rounded-xl bg-muted/70 p-1">
                  <TabsTrigger value="edit" className="rounded-lg px-4 py-2">
                    Edit Content
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="rounded-lg px-4 py-2">
                    IEEE Preview
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="rounded-lg px-4 py-2">
                    Faculty Comments ({latestSubmission?.feedback ? 1 : 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit">
                  <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                    <div className="rounded-2xl border border-border bg-muted/20 p-3 sm:p-5">
                      <Textarea
                        className="min-h-[380px] resize-y rounded-xl border-border bg-white px-5 py-5 text-[15px] leading-8 shadow-none"
                        value={abstractText}
                        onChange={(e) => setAbstractText(e.target.value)}
                        placeholder={sectionTemplates[activeSection]?.placeholder ?? "Type your section draft details..."}
                        disabled={isPending}
                      />
                    </div>
                    
                    <div className="rounded-2xl border border-border bg-muted/25 p-5 space-y-4">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        IEEE Writing Guide
                      </h4>
                      <p className="text-xs leading-6 text-muted-foreground">
                        {sectionTemplates[activeSection]?.guidance ?? "Follow standard IEEE guidelines to draft this section."}
                      </p>
                      
                      <div className="rounded-xl border border-border/80 bg-white p-3 space-y-2">
                        <span className="font-semibold block uppercase text-[9px] text-muted-foreground">Suggested Outline:</span>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
                          {activeSection === "Abstract" && (
                            <>
                              <li>Context & Objective</li>
                              <li>The Specific Technical Problem</li>
                              <li>Methodology & Key Algorithms</li>
                              <li>Experimental Quantitative Results</li>
                            </>
                          )}
                          {activeSection === "Introduction" && (
                            <>
                              <li>Domain Background & Context</li>
                              <li>Motivation & Significance</li>
                              <li>Current Inefficiencies</li>
                              <li>Summary of Contributions</li>
                            </>
                          )}
                          {activeSection === "Problem Statement" && (
                            <>
                              <li>General Challenge Context</li>
                              <li>Formal System Constraints</li>
                              <li>Mathematical Formulation</li>
                              <li>Performance Metrics Goals</li>
                            </>
                          )}
                          {activeSection === "Literature Review" && (
                            <>
                              <li>Discussion of Key Reference Papers</li>
                              <li>Comparison Matrix</li>
                              <li>Research Gap Analysis</li>
                              <li>Novelty Justification</li>
                            </>
                          )}
                          {activeSection === "Methodology" && (
                            <>
                              <li>Proposed System Flowchart</li>
                              <li>Mathematical/Algorithmic Details</li>
                              <li>Model Hyperparameters</li>
                              <li>Data Preprocessing Pipeline</li>
                            </>
                          )}
                          {activeSection === "System Architecture" && (
                            <>
                              <li>High-Level Schematic</li>
                              <li>Hardware/Software Boundary</li>
                              <li>API Data Contracts</li>
                              <li>Failure Recovery Protocols</li>
                            </>
                          )}
                          {activeSection === "Implementation" && (
                            <>
                              <li>Technology Stack Details</li>
                              <li>Database Migrations Sync</li>
                              <li>Key Code Files Structure</li>
                              <li>Memory/Throughput Tweaks</li>
                            </>
                          )}
                          {activeSection === "Results" && (
                            <>
                              <li>Baseline Comparison Table</li>
                              <li>Precision-Recall & F1 Metrics</li>
                              <li>Latency vs Load Tests</li>
                              <li>Failure Cases Discussion</li>
                            </>
                          )}
                          {activeSection === "Conclusion" && (
                            <>
                              <li>Objectives Met Summary</li>
                              <li>Engineering Key Lessons</li>
                              <li>System Limitations</li>
                            </>
                          )}
                          {activeSection === "Future Scope" && (
                            <>
                              <li>Scale-Up Deployment Plans</li>
                              <li>AI Quantization/Optimizations</li>
                              <li>Security Layer Extensions</li>
                            </>
                          )}
                          {activeSection === "References" && (
                            <>
                              <li>Standard IEEE Formatting</li>
                              <li>Author names standard initials</li>
                              <li>Verified Venue & DOI tags</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <article className="rounded-2xl border border-border bg-muted/20 p-6 leading-8 text-foreground">
                    <p className="text-center text-sm font-semibold uppercase tracking-normal">
                      {activeSection}
                    </p>
                    <p className="mt-5 text-[15px] whitespace-pre-line">
                      {abstractText || "Type in the Edit tab to preview this section..."}
                    </p>
                  </article>
                </TabsContent>

                <TabsContent value="comments">
                  <div className="grid gap-3">
                    {latestSubmission?.feedback ? (
                      <div className="rounded-2xl border border-border bg-muted/20 p-4">
                        <div className="flex items-start gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            FR
                          </span>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">
                              Advisor feedback
                            </p>
                            <p className="text-sm leading-6 text-muted-foreground">
                              {latestSubmission.feedback}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No faculty reviews or comments are logged on this draft yet.
                      </div>
                    )}
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
                <Button
                  className="rounded-xl bg-primary px-5"
                  disabled={isPending}
                  onClick={handleSaveDraft}
                >
                  <PenLine className="size-4" />
                  Save & Request Review
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* References Card */}
          <Card>
            <CardHeader className="border-b border-border pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-2xl">References</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Managed BibTeX - exported with paper
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsAddRefOpen(true)}
                >
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

      {/* Add Reference Dialog Modal */}
      {isAddRefOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAddRefOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-bold text-foreground">Add New BibTeX Reference</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddRefOpen(false)}
                className="rounded-xl"
              >
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleAddReferenceSubmit} className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Authors</label>
                <Input
                  placeholder="e.g. A. Smith, B. Jones"
                  value={refAuthors}
                  onChange={(e) => setRefAuthors(e.target.value)}
                  className="rounded-xl bg-muted/40 border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Title</label>
                <Input
                  placeholder="e.g. Deep learning models for agricultural detection"
                  value={refTitle}
                  onChange={(e) => setRefTitle(e.target.value)}
                  className="rounded-xl bg-muted/40 border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Venue & Year</label>
                <Input
                  placeholder="e.g. IEEE Access, vol. 14, pp. 100-112, 2026."
                  value={refVenue}
                  onChange={(e) => setRefVenue(e.target.value)}
                  className="rounded-xl bg-muted/40 border-border"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-border mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsAddRefOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Add Citation
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
