"use client";

import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Database,
  Gauge,
  Layers3,
  MessageSquareText,
  Mic,
  Network,
  Play,
  RadioTower,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TimerReset,
  X,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type MockQuestion = {
  id: string;
  category: string;
  pressure: string;
  question: string;
  expectedEvidence: string;
  weakSignal: string;
};

type DefenseReadinessTeam = {
  id: string;
  team: string;
  project: string;
  batch: string;
  mentor: string;
  readinessScore: number;
  confidenceScore: number;
  technicalDepthScore: number;
  researchMaturityScore: number;
  communicationReadiness: number;
  architectureUnderstanding: number;
  externalVivaConfidence: number;
  failureProbability: number;
  technicalRejectionProbability: number;
  communicationBreakdownRisk: number;
  researchQuestioningSurvival: number;
  readinessState: string;
  aiDiagnosis: string;
  riskDetections: string[];
  highRiskQuestioningAreas: string[];
  competencies: Array<{ label: string; value: number; detail: string }>;
  artifacts: Array<{
    id: string;
    label: string;
    type: string;
    uploadCompleteness: number;
    reviewStatus: string;
    missingSections: string[];
  }>;
  members: Array<{
    id: string;
    name: string;
    role: string;
    readinessLabel: string;
    riskState: string;
  }>;
  mockQuestions: MockQuestion[];
};

type PracticeState = "not-practiced" | "practicing" | "reviewed" | "ready";

type PracticeLog = {
  questionId: string;
  answer: string;
  scores: {
    depth: number;
    clarity: number;
    confidence: number;
    conciseness: number;
  };
  strengths: string[];
  weaknesses: string[];
  followUp: string;
};

const categoryIcons: Record<string, LucideIcon> = {
  Technical: BrainCircuit,
  Research: ScanLine,
  Architecture: Layers3,
  Deployment: RadioTower,
  Dataset: Database,
  Scalability: Network,
  "Failure handling": ShieldCheck,
};

function stateMeta(state: PracticeState) {
  if (state === "ready") {
    return {
      label: "Rehearsed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }
  if (state === "reviewed") {
    return {
      label: "Reviewed",
      className: "border-blue-200 bg-blue-50 text-blue-700",
      icon: Sparkles,
    };
  }
  if (state === "practicing") {
    return {
      label: "Practicing",
      className: "border-orange-200 bg-orange-50 text-orange-700",
      icon: Activity,
    };
  }
  return {
    label: "Not practiced",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: CircleDot,
  };
}

export function VivaClient({
  data,
  userName,
}: {
  data: DefenseReadinessTeam;
  userName: string;
}) {
  // Practice logs loaded from localStorage or initialized empty
  const [practiceLogs, setPracticeLogs] = useState<Record<string, PracticeLog>>({});
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isPracticing, setIsPracticing] = useState(false);

  // Load practice logs on mount
  useEffect(() => {
    const saved = localStorage.getItem(`viva-practice-logs-${data.id}`);
    if (saved) {
      try {
        setPracticeLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse logs", e);
      }
    }
  }, [data.id]);

  const saveLogs = (newLogs: Record<string, PracticeLog>) => {
    setPracticeLogs(newLogs);
    localStorage.setItem(`viva-practice-logs-${data.id}`, JSON.stringify(newLogs));
  };

  const practicedCount = Object.keys(practiceLogs).length;

  const handleStartPractice = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setCurrentAnswer(practiceLogs[questionId]?.answer ?? "");
    setIsPracticing(true);
  };

  const handleEvaluate = (questionId: string) => {
    if (!currentAnswer.trim() || currentAnswer.trim().length < 15) {
      toast.error("Please draft a meaningful response (at least 15 characters).");
      return;
    }

    setIsPracticing(false);
    toast.success("Simulation check completed!");

    // Simple heuristic-based evaluation simulation
    const wordCount = currentAnswer.split(/\s+/).length;
    const hasTechnicalKeywords = /algorithm|architecture|database|model|eval|complexity|performance/i.test(currentAnswer);

    const scoreDepth = Math.min(10, Math.max(5, Math.round(wordCount / 12) + (hasTechnicalKeywords ? 2 : 0)));
    const scoreClarity = Math.min(10, Math.max(6, Math.round(currentAnswer.length / 55)));
    const scoreConfidence = Math.min(10, Math.max(7, Math.round(wordCount / 18) + 3));
    const scoreConciseness = Math.min(10, Math.max(5, 11 - Math.max(1, Math.round(wordCount / 22))));

    const newLogs = {
      ...practiceLogs,
      [questionId]: {
        questionId,
        answer: currentAnswer,
        scores: {
          depth: scoreDepth,
          clarity: scoreClarity,
          confidence: scoreConfidence,
          conciseness: scoreConciseness,
        },
        strengths: [
          "Good vocabulary coverage.",
          "Clear linkage to the project goals."
        ],
        weaknesses: [
          currentAnswer.length < 120
            ? "Expand with more evidence and specific metrics."
            : "Tighten word choice to improve conciseness."
        ],
        followUp: "Defend your choice of validation baseline.",
      },
    };

    saveLogs(newLogs);
  };

  const handleResetLogs = () => {
    if (confirm("Reset all rehearsals?")) {
      saveLogs({});
      setSelectedQuestionId(null);
      setCurrentAnswer("");
      setIsPracticing(false);
      toast.success("All rehearsals cleared.");
    }
  };

  return (
    <PageContainer
      title="Viva Defense Simulator"
      description="Practice defending your project under real faculty-style questioning."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-blue-200 bg-blue-50 text-blue-700">
            Interactive simulator
          </Badge>
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            {practicedCount} questions practiced
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetLogs}
            className="h-8 rounded-lg px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
          >
            Clear stats
          </Button>
        </div>
      }
    >
      {/* Simulation Banner */}
      <Card className="overflow-hidden border-border bg-card text-foreground shadow-sm">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-block-lilac/30 bg-block-lilac/10 px-3 py-1.5 text-xs font-semibold text-indigo-950">
              <Mic className="size-3.5 text-indigo-700" />
              Panel Rehearsal
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-normal text-foreground">
              Train for rapid-fire faculty cross-questioning.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Simulate time pressure, follow-up questions, technical defense, and
              research review in one focused rehearsal environment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="default"
                className="rounded-xl font-semibold h-10 px-5 text-xs"
                onClick={() => handleStartPractice(data.mockQuestions[0]?.id)}
              >
                <Play className="size-4 mr-2" />
                Start panel rehearsal
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-muted/30 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Project context</p>
              <Badge className="border-block-mint/25 bg-block-mint/10 text-emerald-950 font-semibold">
                <span className="size-1.5 rounded-full bg-emerald-600 mr-1.5" />
                Live
              </Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground font-semibold">Team</p>
                <p className="mt-2 text-base font-semibold tracking-normal text-foreground truncate">
                  {data.team}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground font-semibold">Mentor</p>
                <p className="mt-2 text-base font-semibold tracking-normal text-foreground truncate">
                  {data.mentor}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                AI Diagnostic Summary
              </p>
              <p className="mt-2 text-xs leading-5 text-foreground/80">
                {data.aiDiagnosis}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intelligence Dashboard */}
      <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_52%,#eef2ff_100%)]">
        <CardContent className="grid gap-6 p-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-center">
          <div className="relative mx-auto grid size-64 place-items-center">
            {/* Custom readiness score */}
            <div
              className="absolute size-60 rounded-full border border-dashed border-indigo-200 flex items-center justify-center animate-spin"
              style={{ animationDuration: "12s" }}
            />
            <span className="relative grid size-32 place-items-center rounded-full bg-white text-center shadow-[0_15px_40px_rgba(15,23,42,0.14)]">
              <span>
                <span className="block text-4xl font-semibold tracking-normal text-indigo-600">
                  {data.readinessScore}%
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-normal text-muted-foreground mt-1">
                  Ready State
                </span>
              </span>
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <Badge className="border-slate-200 bg-white text-slate-700">
                Defense Readiness metrics
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">
                Viva defense intelligence
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Derived directly from your project milestones, submission quality, and citation coverage.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ["Team Readiness", `${data.readinessScore}%`],
                ["Technical Depth", `${data.technicalDepthScore}%`],
                ["Research Maturity", `${data.researchMaturityScore}%`],
                ["Viva Rehearsed", `${practicedCount}/${data.mockQuestions.length}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-border bg-white p-3">
                  <p className="text-xs leading-5 text-muted-foreground">{label}</p>
                  <p className="mt-2 text-lg font-bold tracking-normal text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {data.competencies.slice(0, 4).map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rehearsal console & questions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-normal text-foreground">
          Viva Question Bank
        </h2>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Questions list */}
          <div className="space-y-4">
            {data.mockQuestions.map((q) => {
              const Icon = categoryIcons[q.category] ?? BrainCircuit;
              const isSelected = selectedQuestionId === q.id;
              const log = practiceLogs[q.id];
              const pState: PracticeState = isSelected && isPracticing
                ? "practicing"
                : log
                  ? "ready"
                  : "not-practiced";
              const meta = stateMeta(pState);
              const MetaIcon = meta.icon;

              return (
                <Card
                  key={q.id}
                  className={cn(
                    "overflow-hidden transition duration-200 hover:-translate-y-0.5",
                    isSelected && "border-indigo-600 shadow-md bg-indigo-50/10"
                  )}
                >
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-lg border bg-white text-slate-700 shadow-sm">
                          <Icon className="size-4" />
                        </span>
                        <Badge variant="outline">{q.category}</Badge>
                        <Badge
                          className={cn(
                            q.pressure === "Stress test"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          )}
                        >
                          {q.pressure}
                        </Badge>
                      </div>
                      <Badge className={meta.className}>
                        <MetaIcon className="size-3.5" />
                        {meta.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <h3 className="text-lg font-bold text-foreground">
                      {q.question}
                    </h3>
                    <div className="text-sm text-muted-foreground leading-relaxed bg-muted/20 rounded-xl p-3 border border-border">
                      <span className="font-semibold text-foreground block mb-1">
                        What evaluators are checking:
                      </span>
                      {q.expectedEvidence}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      {log ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedQuestionId(q.id);
                            setCurrentAnswer(log.answer);
                            setIsPracticing(false);
                          }}
                          className="rounded-xl h-9 text-xs"
                        >
                          View rehearsal evaluation
                        </Button>
                      ) : null}
                      <Button
                        onClick={() => handleStartPractice(q.id)}
                        className="rounded-xl h-9 text-xs"
                      >
                        {log ? "Retry rehearsal" : "Start practicing"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Interactive practice log pane */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {selectedQuestionId ? (
              (() => {
                const question = data.mockQuestions.find((q) => q.id === selectedQuestionId)!;
                const log = practiceLogs[selectedQuestionId];

                return (
                  <Card className="border-indigo-200 shadow-xl bg-card">
                    <CardHeader className="border-b border-border pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">
                          {isPracticing ? "Practice Console" : "Rehearsal Feedback"}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedQuestionId(null)}
                          className="rounded-xl"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {question.question}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {isPracticing ? (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-foreground">
                              Draft Rehearsal Response
                            </label>
                            <Textarea
                              className="min-h-[160px] resize-y rounded-xl border-border bg-white text-sm"
                              placeholder="Type your explanation here. Connect it to parameters, datasets, and trade-offs..."
                              value={currentAnswer}
                              onChange={(e) => setCurrentAnswer(e.target.value)}
                            />
                          </div>
                          <Button
                            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => handleEvaluate(selectedQuestionId)}
                          >
                            Submit Rehearsal
                          </Button>
                        </div>
                      ) : log ? (
                        <div className="space-y-4">
                          {/* Scores metrics */}
                          <div className="grid grid-cols-2 gap-2 text-center">
                            {[
                              ["Technical depth", log.scores.depth],
                              ["Clarity", log.scores.clarity],
                              ["Confidence", log.scores.confidence],
                              ["Conciseness", log.scores.conciseness],
                            ].map(([label, score]) => (
                              <div key={label} className="border border-border bg-muted/20 rounded-xl p-2">
                                <span className="text-[10px] text-muted-foreground block">
                                  {label}
                                </span>
                                <span className="text-lg font-bold text-foreground">
                                  {score}/10
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Detail notes */}
                          <div className="space-y-3">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                              <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">
                                Strengths
                              </span>
                              <ul className="text-xs text-emerald-800 space-y-1 list-disc pl-4">
                                {log.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                              </ul>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                              <span className="text-[10px] uppercase font-bold text-orange-700 block mb-1">
                                Weaknesses
                              </span>
                              <ul className="text-xs text-orange-800 space-y-1 list-disc pl-4">
                                {log.weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}
                              </ul>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                                Likely Faculty follow-up
                              </span>
                              <p className="text-xs font-semibold text-foreground">
                                {log.followUp}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full rounded-xl"
                            onClick={() => setIsPracticing(true)}
                          >
                            Retry Rehearsal
                          </Button>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })()
            ) : (
              <Card className="border-dashed border-border bg-muted/10">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Activity className="size-8 mx-auto text-muted-foreground mb-3 opacity-60" />
                  <p className="text-sm font-semibold">Select a question to practice</p>
                  <p className="text-xs mt-1">Rehearse to get evaluation feedback scores.</p>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
