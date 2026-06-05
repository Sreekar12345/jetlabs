"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Clock3,
  Compass,
  Github,
  Link2,
  Paperclip,
  ShieldCheck,
  UploadCloud,
  X,
  Plus,
  ExternalLink,
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
import { createStudentSubmissionAction } from "@/lib/actions/review-actions";
import { toast } from "sonner";

type Submission = {
  id: string;
  type: string;
  title: string;
  content: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string | null;
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
    domain: string;
    difficulty: string;
    problem?: {
      id: string;
      title: string;
      summary: string;
      description: string;
      category: string;
      domain: string;
      difficulty: string;
    } | null;
  };
};

type User = {
  id: string;
  name: string;
};

function formatDate(dateStr: string | Date) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return {
        label: "Approved",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "REVISION_REQUIRED":
      return {
        label: "Revision Required",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        className: "border-red-200 bg-red-50 text-red-700",
      };
    case "UNDER_REVIEW":
      return {
        label: "Under Review",
        className: "border-indigo-200 bg-indigo-50 text-indigo-700",
      };
    case "PENDING_REVIEW":
    default:
      return {
        label: "Pending Review",
        className: "border-blue-200 bg-blue-50 text-blue-700",
      };
  }
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
      {helper ? <p className="text-xs text-muted-foreground leading-relaxed">{helper}</p> : null}
      {children}
    </div>
  );
}

export interface WeeklyGuide {
  week: number;
  title: string;
  focus: string;
  tasks: string[];
  guidance: string;
  boilerplate: {
    title: string;
    objectives: string;
    implementation: string;
    nextGoals: string;
  };
}

export function getWeeklyGuide(weekNum: number, project: any): WeeklyGuide {
  const title = project?.title || "your Capstone project";
  const domain = project?.domain || "the selected field";
  const category = project?.problem?.category || project?.category || "engineering";
  const difficulty = project?.difficulty || "Core";
  const summary = project?.problem?.summary || project?.description || "the project objectives";
  
  switch (weekNum) {
    case 1:
      return {
        week: 1,
        title: "Week 1: Scope & Problem Validation",
        focus: `Frame the core problem statement for "${title}" and identify baseline constraints.`,
        tasks: [
          `Audit existing solutions and systems in the "${domain}" domain.`,
          `Draft a validation memo detailing how your project tackles "${summary}".`,
          `Define the key parameters and project goals matching "${difficulty}" difficulty expectations.`,
          `Agree on team roles and Git repository setup.`
        ],
        guidance: `Start by defining a narrow, measurable scope for this ${difficulty}-level ${category} project. Focus on understanding the operational constraints of the ${domain} field.`,
        boilerplate: {
          title: "Scope boundary & problem validation memo locked",
          objectives: `- Created initial repository layout for "${title}".\n- Conducted domain research on "${domain}" systems.\n- Formulated problem statement based on: "${summary}".`,
          implementation: `Drafted technical requirements list for the proposed ${category} system. Evaluated difficulty barriers for ${difficulty} level execution and mapped out baseline protocols.`,
          nextGoals: `Search literature and compile academic citations specifically addressing ${domain} bottlenecks.`
        }
      };
    case 2:
      return {
        week: 2,
        title: "Week 2: Literature Survey & Baselines",
        focus: `Investigate prior work and establish performance benchmarks for "${title}".`,
        tasks: [
          `Collect and review 5+ academic papers related to "${category}" techniques.`,
          `Analyze competing models or algorithms in the "${domain}" space.`,
          `Isolate specific baseline performance metrics (e.g. latency, accuracy, cost) to benchmark against.`,
          `Publish the initial literature summary draft.`
        ],
        guidance: `For an academic ${category} project, it is essential to trace prior art. Look for IEEE or ACM publications and document their exact algorithms or frameworks.`,
        boilerplate: {
          title: "Literature mapping and competing baselines audit",
          objectives: `- Reviewed academic literature on "${category}" implementations in "${domain}".\n- Isolated three baseline metrics to evaluate against.\n- Published the initial literature synthesis draft.`,
          implementation: `Analyzed comparative performance of prior algorithms. Documented structural weaknesses in existing approaches when applied to "${summary}".`,
          nextGoals: `Design system architecture diagrams and model schemas.`
        }
      };
    case 3:
      return {
        week: 3,
        title: "Week 3: System Design & Schema Layout",
        focus: `Draft the technical system architecture and data storage layouts for "${title}".`,
        tasks: [
          `Create visual block diagrams representing components and data flow.`,
          `Define database schemas, collection structures, or model hyper-parameters.`,
          `Specify api interfaces, function signatures, and input-output boundaries.`,
          `Establish system communication and telemetry protocols.`
        ],
        guidance: `Since this project operates in the "${domain}" domain, design your database schema and data flows to handle typical traffic patterns. Ensure strict integrity checks in your ${category} workflow.`,
        boilerplate: {
          title: "System architecture schema and API routing definitions",
          objectives: `- Created system block diagrams representing data flow for "${title}".\n- Defined SQL/NoSQL schemas and indexing strategies.\n- Specified interface specs and route mappings for the ${category} components.`,
          implementation: `Designed database schema and data models. Set up mock controllers to verify input-output behavior. Integrated error-handling patterns for ${difficulty}-level robustness.`,
          nextGoals: `Initialize repository scaffold and begin core code construction.`
        }
      };
    case 4:
      return {
        week: 4,
        title: "Week 4: Core MVP Prototype Setup",
        focus: `Initialize the codebase and build a functional skeleton of "${title}".`,
        tasks: [
          `Scaffold the main repository and configure dev environment dependencies.`,
          `Set up connection to databases or import base datasets.`,
          `Implement a thin, vertical prototype demonstrating the core mechanism of "${summary}".`,
          `Run initial end-to-end integration and verify data ingestion.`
        ],
        guidance: `Keep it simple. Do not waste time on complex UI features. Focus entirely on proving the core backend or algorithmic logic of your ${category} application.`,
        boilerplate: {
          title: "Core MVP prototype scaffold and database integration",
          objectives: `- Initialized main codebase and connected the core database.\n- Developed the first end-to-end flow for "${title}".\n- Verified telemetry/data ingestion for "${domain}" inputs.`,
          implementation: `Wrote basic database operations and set up the model ingestion pipeline. Verified that data flows from simulated ${domain} sources through the core ${category} processor.`,
          nextGoals: `Refine application features, implement optimization routines, and deploy preview build.`
        }
      };
    case 5:
      return {
        week: 5,
        title: "Week 5: Feature Expansion & Deployment",
        focus: `Expand application capabilities and deploy a live preview build of "${title}".`,
        tasks: [
          `Build secondary features, API controllers, or model optimizations.`,
          `Deploy a live web interface or API preview on Vercel or other cloud services.`,
          `Perform integration tests to ensure system modules operate coherently.`,
          `Create automated check scripts or error logging.`
        ],
        guidance: `A deployed, live URL is the ultimate evidence of progress. Make sure environment variables are securely handled and verify that your staging environment matches the production scope.`,
        boilerplate: {
          title: "Feature enhancements and live cloud staging deployment",
          objectives: `- Completed core API endpoints and visual/model interfaces for "${title}".\n- Deployed live preview staging on cloud hosting.\n- Conducted full integration tests of the ${category} components.`,
          implementation: `Optimized execution bottlenecks to improve throughput for the "${domain}" workloads. Setup secure CORS and secret keys. Verified staging runs without runtime errors.`,
          nextGoals: `Execute rigorous benchmarking tests and compile telemetry results.`
        }
      };
    case 6:
      return {
        week: 6,
        title: "Week 6: Evaluation & Benchmarking",
        focus: `Conduct rigorous performance tests and benchmark "${title}" against baselines.`,
        tasks: [
          `Run performance, accuracy, or throughput tests on your ${category} prototype.`,
          `Compare results directly against the Week 2 baseline statistics.`,
          `Document failure conditions, trade-offs, and edge cases.`,
          `Plot comparative charts and tables for the research report.`
        ],
        guidance: `Numbers speak louder than words. As an ${difficulty} project, you need detailed data. Log latency under different volumes of ${domain} data to demonstrate real effectiveness.`,
        boilerplate: {
          title: "Performance testing and benchmark evaluation charts",
          objectives: `- Logged telemetry and performance metrics for "${title}" under load.\n- Generated benchmark charts comparing the prototype against prior methods.\n- Documented system performance limits and failure modes.`,
          implementation: `Ran comprehensive tests evaluating response speed, accuracy, and memory usage. Compiled evaluation telemetry proving a significant improvement over standard "${domain}" baselines.`,
          nextGoals: `Begin drafting the IEEE research paper using the compiled data.`
        }
      };
    case 7:
      return {
        week: 7,
        title: "Week 7: IEEE Paper Drafting",
        focus: `Draft the formal IEEE research manuscript documenting your findings for "${title}".`,
        tasks: [
          `Write the Abstract, Introduction, and Literature Survey sections.`,
          `Detail your Methodology, System Architecture, and Implementation details.`,
          `Present the compiled Evaluation results, tables, and comparative charts.`,
          `Format all references according to IEEE guidelines.`
        ],
        guidance: `Academic rigor is essential. Ensure your paper title is descriptive (e.g. referencing "${title}"). Clearly explain the technical design decisions you made for the ${category} system.`,
        boilerplate: {
          title: "IEEE research paper manuscript draft completed",
          objectives: `- Drafted Abstract, Methodology, and Results sections for "${title}".\n- Structured the system architecture write-up for "${domain}" evaluation.\n- Compiled 10+ reference citations in BibTeX format.`,
          implementation: `Translated design schemas and benchmarking results into formal academic terminology. Outlined how the ${category} approach solves core issues outlined in "${summary}".`,
          nextGoals: `Prepare final package deliverables and practice for the Viva defense.`
        }
      };
    case 8:
      return {
        week: 8,
        title: "Week 8: Final Packaging & Rehearsal",
        focus: `Package the codebase, prepare project docs, and rehearse for the Viva defense.`,
        tasks: [
          `Audit and clean repository codebase, adding clear install instructions in README.md.`,
          `Record a crisp, 3-minute video demonstrating "${title}" functionality.`,
          `Create final presentation slides highlighting project novelty and findings.`,
          `Rehearse technical and architectural defense questions.`
        ],
        guidance: `Your final presentation is what stays in the reviewers' minds. Make sure the installation instructions are foolproof so that evaluators can run your ${category} application in under 3 minutes.`,
        boilerplate: {
          title: "Project packaging and Viva defense simulator rehearsal",
          objectives: `- Packaged clean source code of "${title}" with detailed README installation guide.\n- Recorded 3-minute demonstration video.\n- Rehearsed oral defense questions focusing on ${domain} trade-offs.`,
          implementation: `Conducted final sanity checks on production links and code configurations. Verified that the final package addresses all original goals for "${summary}".`,
          nextGoals: `Submit the final deliverables pack and complete the live panel defense.`
        }
      };
    default:
      return {
        week: weekNum,
        title: `Week ${weekNum}: Capstone Engineering`,
        focus: `Execute task sprint for "${title}".`,
        tasks: [
          `Work on core deliverables for your "${category}" project.`,
          `Document progress and log technical performance in the "${domain}" space.`
        ],
        guidance: `Continue building and documenting. Track weekly changes carefully.`,
        boilerplate: {
          title: `Capstone engineering sprint for Week ${weekNum}`,
          objectives: `- Worked on key features for "${title}".\n- Addressed milestones in the "${domain}" workspace.`,
          implementation: `Developed and tested modules under the "${category}" design system.`,
          nextGoals: `Advance project milestones for next week.`
        }
      };
  }
}

export function WeeklySubmissionsClient({
  initialSubmissions,
  team,
  user,
}: {
  initialSubmissions: Submission[];
  team: Team | null;
  user: User;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [weekNumber, setWeekNumber] = useState((initialSubmissions.length + 1).toString());
  const [guideWeek, setGuideWeek] = useState(Math.min(8, Math.max(1, initialSubmissions.length + 1)));

  const handleApplyBoilerplate = (weekNum: number) => {
    const guide = getWeeklyGuide(weekNum, team?.project);
    setWeekNumber(weekNum.toString());
    setTitle(guide.boilerplate.title);
    setObjectives(guide.boilerplate.objectives);
    setImplementation(guide.boilerplate.implementation);
    setNextGoals(guide.boilerplate.nextGoals);
    toast.success(`Applied Week ${weekNum} boilerplate templates!`);
  };
  const [title, setTitle] = useState("");
  const [objectives, setObjectives] = useState("");
  const [implementation, setImplementation] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextGoals, setNextGoals] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [deploymentLink, setDeploymentLink] = useState("");

  const [newFileName, setNewFileName] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!team) {
    return (
      <PageContainer
        title="Weekly submissions"
        description="Submit consistent weekly proof of work. Faculty reviews each within 48 hours."
      >
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <AlertTriangle className="size-12 text-amber-500" />
            <h2 className="mt-4 text-xl font-semibold">Team Assignment Required</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              You are currently not mapped to any project team. Please request your administrator or coordinator to assign you to a capstone team.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Calculate submission readiness score
  const hasObjectives = objectives.trim().length > 5;
  const hasImplementation = implementation.trim().length > 5;
  const hasNextGoals = nextGoals.trim().length > 5;
  const hasGithub = githubLink.trim().startsWith("http");
  const hasFiles = uploadedFiles.length > 0;

  let readiness = 20;
  if (hasObjectives) readiness += 20;
  if (hasImplementation) readiness += 25;
  if (hasNextGoals) readiness += 15;
  if (hasGithub) readiness += 10;
  if (hasFiles) readiness += 10;

  const handleAddFile = () => {
    if (newFileName.trim()) {
      setUploadedFiles((prev) => [...prev, newFileName.trim()]);
      setNewFileName("");
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter a submission title.");
      return;
    }

    if (!objectives.trim() || !implementation.trim()) {
      setErrorMsg("Please complete objectives and technical implementation details.");
      return;
    }

    startTransition(async () => {
      const contentMarkdown = `### Objectives Completed
${objectives}

### Technical Implementation
${implementation}

### Blockers Faced
${blockers || "None reported."}

### Next Week Goals
${nextGoals}

### Links
- **GitHub Link**: ${githubLink || "Not provided"}
- **Deployment Link**: ${deploymentLink || "Not provided"}

### Attached Evidence Artifacts
${uploadedFiles.map((file) => `- ${file}`).join("\n") || "No files attached."}`;

      const formattedTitle = `Week ${weekNumber}: ${title}`;

      const res = await createStudentSubmissionAction({
        type: "WEEKLY",
        title: formattedTitle,
        content: contentMarkdown,
      });

      if (!res.success) {
        setErrorMsg(res.message || "An error occurred.");
      } else {
        setSuccessMsg("Weekly evidence pack successfully submitted to your faculty review queue.");
        setTitle("");
        setObjectives("");
        setImplementation("");
        setBlockers("");
        setNextGoals("");
        setUploadedFiles([]);
        setWeekNumber((initialSubmissions.length + 2).toString());
        router.refresh();
      }
    });
  };

  return (
    <PageContainer
      title="Weekly submissions"
      description={`Submit consistent weekly proof of work for ${team.project.title}.`}
    >
      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList className="rounded-xl bg-muted/70 p-1">
          <TabsTrigger value="submit" className="rounded-lg px-4 py-2">
            Submit week {weekNumber}
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-4 py-2">
            History ({initialSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card>
              <CardHeader className="border-b border-border pb-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="text-2xl">Weekly Proof of Work</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Capture what moved this week: implementation, evidence, blockers, and next-step commitments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-indigo-200/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-300">
                    <Clock3 className="size-3.5" />
                    Team: {team.name}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                    Due Friday, 6:00 PM
                  </span>
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                    Review SLA: 48 hours
                  </span>
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                    Prisma / PostgreSQL Linked
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-8 pt-7">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {errorMsg && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-red-500 flex items-center gap-2">
                      <AlertTriangle className="size-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400 flex items-center gap-2">
                      <Check className="size-4 shrink-0" />
                      {successMsg}
                    </div>
                  )}

                  <div className="grid gap-5 md:grid-cols-[120px_minmax(0,1fr)]">
                    <FieldGroup label="Week No.">
                      <Input
                        type="number"
                        className="rounded-xl bg-muted/30"
                        value={weekNumber}
                        onChange={(e) => setWeekNumber(e.target.value)}
                        disabled={isPending}
                        required
                      />
                    </FieldGroup>
                    <FieldGroup
                      label="Submission Title"
                      helper="Specific summary of this week's progress (e.g. Model fine-tuning, UI integration)"
                    >
                      <Input
                        className="rounded-xl bg-muted/30"
                        placeholder="Explain briefly what you achieved"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isPending}
                        required
                      />
                    </FieldGroup>
                  </div>

                  <div className="border-t border-border pt-7">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <FieldGroup
                        label="Objectives Completed"
                        helper="Summarize the planned items that were closed."
                      >
                        <Textarea
                          className="min-h-44 rounded-xl bg-muted/30 leading-relaxed text-sm"
                          placeholder="List key items completed this week..."
                          value={objectives}
                          onChange={(e) => setObjectives(e.target.value)}
                          disabled={isPending}
                          required
                        />
                      </FieldGroup>
                      <FieldGroup
                        label="Technical Implementation"
                        helper="Details of code changes, models trained, or datasets compiled."
                      >
                        <Textarea
                          className="min-h-44 rounded-xl bg-muted/30 leading-relaxed text-sm"
                          placeholder="What tools did you write/use? Provide specific technical indicators..."
                          value={implementation}
                          onChange={(e) => setImplementation(e.target.value)}
                          disabled={isPending}
                          required
                        />
                      </FieldGroup>
                    </div>
                  </div>

                  <div className="border-t border-border pt-7">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <FieldGroup
                        label="Blockers Faced (Optional)"
                        helper="Describe bugs, hardware bottlenecks, or design deadlocks."
                      >
                        <Textarea
                          className="min-h-40 rounded-xl bg-muted/30 leading-relaxed text-sm"
                          placeholder="Surfaces blockers that faculty reviews can target..."
                          value={blockers}
                          onChange={(e) => setBlockers(e.target.value)}
                          disabled={isPending}
                        />
                      </FieldGroup>
                      <FieldGroup
                        label="Next Week Commitments"
                        helper="Clear deliverables to evaluate next week."
                      >
                        <Textarea
                          className="min-h-40 rounded-xl bg-muted/30 leading-relaxed text-sm"
                          placeholder="What will you focus on during the next sprint?"
                          value={nextGoals}
                          onChange={(e) => setNextGoals(e.target.value)}
                          disabled={isPending}
                          required
                        />
                      </FieldGroup>
                    </div>
                  </div>

                  <div className="border-t border-border pt-7">
                    <div className="grid gap-5 lg:grid-cols-2">
                      <FieldGroup label="GitHub Repo Link">
                        <div className="relative">
                          <Github className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="url"
                            className="rounded-xl bg-muted/30 pl-11 text-sm"
                            placeholder="https://github.com/..."
                            value={githubLink}
                            onChange={(e) => setGithubLink(e.target.value)}
                            disabled={isPending}
                          />
                        </div>
                      </FieldGroup>
                      <FieldGroup label="Deployment Preview Link">
                        <div className="relative">
                          <Link2 className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="url"
                            className="rounded-xl bg-muted/30 pl-11 text-sm"
                            placeholder="https://your-preview.vercel.app"
                            value={deploymentLink}
                            onChange={(e) => setDeploymentLink(e.target.value)}
                            disabled={isPending}
                          />
                        </div>
                      </FieldGroup>
                    </div>
                  </div>

                  <div className="border-t border-border pt-7">
                    <FieldGroup
                      label="Evidence Files & Logs"
                      helper="Add names of logs, screenshots, models, or report drafts included in this batch."
                    >
                      <div className="flex gap-2 mb-4">
                        <Input
                          className="rounded-xl bg-muted/30 text-sm"
                          placeholder="e.g. confusion-matrix.png, evaluation-results.csv"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          disabled={isPending}
                        />
                        <Button
                          type="button"
                          onClick={handleAddFile}
                          disabled={isPending || !newFileName.trim()}
                          className="rounded-xl"
                        >
                          <Plus className="size-4 mr-1" /> Add
                        </Button>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="grid gap-3 md:grid-cols-2">
                          {uploadedFiles.map((file, idx) => (
                            <div
                              key={`${file}-${idx}`}
                              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
                            >
                              <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                              <span className="truncate text-xs font-medium text-foreground flex-1">
                                {file}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(idx)}
                                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                disabled={isPending}
                              >
                                <X className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </FieldGroup>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border pt-7 sm:flex-row sm:justify-end">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="h-11 px-5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isPending ? "Submitting..." : "Submit for Review"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
              {/* Dynamic Weekly Capstone Guidance Card */}
              <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 text-white shadow-xl backdrop-blur-md">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Weekly Capstone Focus</p>
                      <h3 className="text-base font-bold text-white mt-1 leading-snug">
                        {getWeeklyGuide(guideWeek, team.project).title}
                      </h3>
                    </div>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Compass className="size-4" />
                    </span>
                  </div>

                  {/* Week Selector tabs/buttons */}
                  <div className="flex items-center justify-between border-y border-white/5 py-2.5">
                    <span className="text-xs text-slate-300 font-medium">Select Week:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setGuideWeek(w)}
                          className={cn(
                            "flex size-6 items-center justify-center rounded-md text-xs font-semibold transition-all duration-200",
                            guideWeek === w
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                          )}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-1">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
                      &ldquo;{getWeeklyGuide(guideWeek, team.project).focus}&rdquo;
                    </p>
                    
                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Tasks checklist</p>
                      <div className="space-y-2">
                        {getWeeklyGuide(guideWeek, team.project).tasks.map((task, idx) => (
                          <div key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-200">
                            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 font-bold text-[9px]">
                              {idx + 1}
                            </span>
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-3 space-y-1.5">
                      <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">Mentor Tip</p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {getWeeklyGuide(guideWeek, team.project).guidance}
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleApplyBoilerplate(guideWeek)}
                      className="w-full h-9 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 border-0"
                    >
                      <Plus className="size-3.5" /> Apply Week {guideWeek} Template
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                      <ShieldCheck className="size-5" />
                    </span>
                    <div>
                      <CardTitle className="text-lg">Pre-Review Checklist</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        These ensure your work clears evaluation standards:
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Commit History", detail: "Has new codebase delta since last week", ok: hasImplementation },
                    { label: "Execution Evidence", detail: "At least one screenshot, file, or log listed", ok: hasFiles },
                    { label: "Objectives Match", detail: "Completed objectives clearly described", ok: hasObjectives },
                    { label: "Traceable URLs", detail: "Valid GitHub repo or preview URL shared", ok: hasGithub },
                  ].map((check) => (
                    <div key={check.label} className="flex gap-3 text-xs leading-relaxed">
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                          check.ok
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        )}
                      >
                        <Check className="size-3" />
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{check.label}</p>
                        <p className="text-muted-foreground">{check.detail}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Submission Readiness
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground leading-normal">
                        Calculated score based on evidence checklist.
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-foreground">{readiness}%</span>
                  </div>
                  <Progress value={readiness} className="h-2 bg-muted" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Ensure technical logs and GitHub URLs are shared to accelerate mentor approvals.
                  </p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Submission History</CardTitle>
              <p className="text-sm text-muted-foreground">
                All records submitted by your capstone team and their corresponding mentor decisions.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {initialSubmissions.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No submissions have been registered for this team yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {initialSubmissions.map((item) => {
                    const badge = getStatusBadge(item.status);
                    return (
                      <div key={item.id} className="rounded-2xl border border-border p-5 bg-card flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-semibold leading-relaxed">{item.title}</h3>
                            <Badge className={badge.className}>{badge.label}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Submitted on {formatDate(item.submittedAt)} by {item.submittedBy?.name ?? "Team member"}
                          </p>

                          <div className="mt-4 rounded-xl bg-muted/30 p-4 border border-border/50">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Evidence & Narrative</h4>
                            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                              {item.content}
                            </p>
                          </div>
                        </div>

                        {(item.feedback || item.score !== null) && (
                          <div className="mt-4 pt-4 border-t border-border/80">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Mentor Feedback</h4>
                            {item.score !== null && (
                              <p className="text-sm font-semibold text-emerald-400 mb-1">
                                Score: {item.score} / 100
                              </p>
                            )}
                            {item.feedback && (
                              <p className="text-xs text-muted-foreground italic leading-relaxed">
                                &ldquo;{item.feedback}&rdquo;
                              </p>
                            )}
                            {item.reviewedBy && (
                              <p className="text-[10px] text-muted-foreground mt-2">
                                Reviewed by {item.reviewedBy.name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
