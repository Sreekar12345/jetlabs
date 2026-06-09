"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  CheckCircle2,
  Compass,
  FileText,
  GraduationCap,
  Layers3,
  Search,
  X,
  Rocket,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  toggleProblemBookmarkAction,
  selectProblemAsProjectAction,
} from "@/lib/actions/problem-actions";
import { toast } from "sonner";
import type { ProblemListing, ProblemMarketData } from "@/types/aoip";

type ActiveTab = "all" | "recommended" | "saved" | "industry";

type ProblemMarketBoardProps = {
  initialData: ProblemMarketData;
};

const TAB_OPTIONS: Array<{ value: ActiveTab; label: string }> = [
  { value: "all", label: "All briefs" },
  { value: "recommended", label: "Recommended" },
  { value: "saved", label: "Saved" },
  { value: "industry", label: "Industry" },
];

function difficultyClass(difficulty: ProblemListing["difficulty"]) {
  if (difficulty === "Advanced") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  if (difficulty === "Intermediate") {
    return "border-teal-200 bg-teal-50 text-teal-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function sourceClass(source: ProblemListing["source"]) {
  if (source === "Industry") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }

  if (source === "Research Lab") {
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function problemCode(problemId: string) {
  return `PS-${problemId.slice(-6).toUpperCase()}`;
}

function getExpectedOutcome(problem: ProblemListing) {
  return `A validated ${problem.category.toLowerCase()} prototype with clear evaluation evidence, documentation, and a paper-ready problem narrative.`;
}

function getIndustryRelevance(problem: ProblemListing) {
  if (problem.source === "Industry") {
    return `${problem.domain} teams can use this brief to test a real operating problem with practical constraints and adoption signals.`;
  }

  return `${problem.domain} relevance is anchored by faculty-reviewed scope, measurable outcomes, and a clear academic contribution path.`;
}

function getResearchScope(problem: ProblemListing) {
  return `Explore prior work, define baseline methods, build a scoped implementation, and evaluate the result against ${problem.difficulty.toLowerCase()} project expectations.`;
}

function ProblemDetailDrawer({
  problem,
  isPending,
  hasProject,
  isTeamLead,
  onClose,
  onToggleBookmark,
  onSelectProject,
}: {
  problem: ProblemListing | null;
  isPending: boolean;
  hasProject: boolean;
  isTeamLead: boolean;
  onClose: () => void;
  onToggleBookmark: (problemId: string) => void;
  onSelectProject: (problemId: string) => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (problem) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, problem]);

  if (!problem) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close problem details"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="problem-detail-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-border bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              {problemCode(problem.id)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {problem.source} · {problem.domain}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={onClose}
            aria-label="Close details"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="scrollbar-subtle flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  sourceClass(problem.source),
                )}
              >
                {problem.source}
              </span>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  difficultyClass(problem.difficulty),
                )}
              >
                {problem.difficulty}
              </span>
              {problem.saved ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                  Saved
                </span>
              ) : null}
            </div>

            <div>
              <h2 id="problem-detail-title" className="text-3xl">
                {problem.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {problem.summary}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Fit score</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {problem.fitScore}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Discovery signal</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {problem.trend}
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-foreground" />
                <h3 className="text-base">Expected outcome</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {getExpectedOutcome(problem)}
              </p>
            </section>

            <section className="rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2">
                <Layers3 className="size-4 text-foreground" />
                <h3 className="text-base">Tech stack</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {problem.tags.map((tag) => (
                  <span
                    key={`${problem.id}-detail-${tag}`}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-foreground" />
                <h3 className="text-base">Industry relevance</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {getIndustryRelevance(problem)}
              </p>
            </section>

            <section className="rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-foreground" />
                <h3 className="text-base">Research scope</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {getResearchScope(problem)}
              </p>
            </section>
          </div>
        </div>

        <div className="border-t border-border bg-white px-6 py-5">
          <div className="flex flex-col gap-3">
            {!isTeamLead ? (
              <Button
                type="button"
                className="h-11 w-full bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
                disabled
              >
                Only the Team Lead can select a Problem Statement.
              </Button>
            ) : !hasProject ? (
              <Button
                type="button"
                className="h-11 w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
                disabled={isPending}
                onClick={() => onSelectProject(problem.id)}
              >
                <Rocket className="size-4" />
                Assign as Capstone Project
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
                disabled={isPending}
                onClick={() => onSelectProject(problem.id)}
              >
                <Rocket className="size-4" />
                Update Capstone Project
              </Button>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                className="h-11 flex-1"
                disabled={isPending || problem.saved}
                onClick={() => onToggleBookmark(problem.id)}
              >
                {problem.saved ? (
                  <>
                    <BookmarkCheck className="size-4" />
                    Saved to workspace
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="size-4" />
                    Save brief
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 sm:w-32"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function ProblemMarketBoard({ initialData }: ProblemMarketBoardProps) {
  const router = useRouter();
  const isTeamLead = initialData.isTeamLead ?? false;
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [problemData, setProblemData] = useState(initialData);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [isBookmarkPending, startBookmarkTransition] = useTransition();
  const [hasProject, setHasProject] = useState(initialData.hasProject ?? false);
  const [isSelectPending, startSelectTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  function handleSelectProject(problemId: string) {
    startSelectTransition(async () => {
      const result = await selectProblemAsProjectAction({ problemId });
      if (result.success) {
        toast.success(result.message);
        setHasProject(true);
        setSelectedProblemId(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  const visibleProblems = [...problemData.problems]
    .filter((problem) => {
      if (
        deferredQuery &&
        !`${problem.title} ${problem.summary} ${problem.tags.join(" ")}`
          .toLowerCase()
          .includes(deferredQuery.toLowerCase())
      ) {
        return false;
      }

      if (
        categoryFilter !== "All" &&
        problem.category !== categoryFilter &&
        problem.domain !== categoryFilter
      ) {
        return false;
      }

      if (difficultyFilter !== "All" && problem.difficulty !== difficultyFilter) {
        return false;
      }

      if (activeTab === "recommended" && problem.fitScore < 88) {
        return false;
      }

      if (activeTab === "saved" && !problem.saved) {
        return false;
      }

      if (activeTab === "industry" && problem.source !== "Industry") {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.fitScore - left.fitScore);

  const savedCount = problemData.problems.filter((problem) => problem.saved).length;
  const liveStats = problemData.stats.map((stat, index) =>
    index === 3
      ? {
          ...stat,
          value: `${savedCount}`,
        }
      : stat,
  );
  const selectedProblem =
    problemData.problems.find((problem) => problem.id === selectedProblemId) ?? null;

  function handleToggleBookmark(problemId: string) {
    startBookmarkTransition(async () => {
      const result = await toggleProblemBookmarkAction({
        problemId,
      });

      if (!result.success) {
        return;
      }

      setProblemData((current) => ({
        ...current,
        problems: current.problems.map((problem) =>
          problem.id === problemId
            ? {
                ...problem,
                saved: result.bookmarked ?? !problem.saved,
              }
            : problem,
        ),
      }));
      router.refresh();
    });
  }

  return (
    <PageContainer
      title="Problem statement marketplace"
      description="Browse 50+ industry-aligned problems. Pick one to anchor your project & paper."
      actions={
        <Button
          type="button"
          variant="outline"
          className="h-11 px-5"
          onClick={() => setActiveTab("saved")}
        >
          <Bookmark className="size-4" />
          Saved problems
        </Button>
      }
    >
      <Card className="rounded-2xl">
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Tabs
              defaultValue="all"
              value={activeTab}
              className="space-y-0"
              onValueChange={(value) => setActiveTab(value as ActiveTab)}
            >
              <TabsList className="w-full flex-wrap rounded-xl bg-muted/70 p-1 sm:w-auto">
                {TAB_OPTIONS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-1 rounded-lg px-3 py-2 sm:flex-none"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[520px]">
              <Select
                className="rounded-xl"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filter by category"
              >
                {problemData.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              <Select
                className="rounded-xl"
                value={difficultyFilter}
                onChange={(event) => setDifficultyFilter(event.target.value)}
                aria-label="Filter by difficulty"
              >
                {["All", "Beginner", "Intermediate", "Advanced"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-12 rounded-2xl border-border bg-muted/40 pl-11 shadow-none focus-visible:bg-white"
                placeholder="Search domains, faculty notes, and research-ready briefs"
                value={query}
                onChange={(event) =>
                  startTransition(() => setQuery(event.target.value))
                }
              />
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {liveStats.map((stat) => (
                <span
                  key={stat.label}
                  className="rounded-full border border-border bg-white px-3 py-2"
                >
                  <span className="font-semibold text-foreground">{stat.value}</span>{" "}
                  {stat.label}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {visibleProblems.length} problem{visibleProblems.length === 1 ? "" : "s"} found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click any card to review scope, expected outcomes, and selection details.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Compass className="size-3.5" />
          Marketplace library
        </div>
      </div>

      {visibleProblems.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleProblems.map((problem) => (
            <article
              key={problem.id}
              tabIndex={0}
              role="button"
              onClick={() => setSelectedProblemId(problem.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedProblemId(problem.id);
                }
              }}
              className="group flex min-h-[360px] cursor-pointer flex-col rounded-2xl border border-border bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-muted text-foreground">
                    {problem.category}
                  </Badge>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                      sourceClass(problem.source),
                    )}
                  >
                    {problem.source}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-9 rounded-xl text-muted-foreground hover:text-foreground",
                    problem.saved && "bg-slate-100 text-foreground",
                  )}
                  disabled={isBookmarkPending}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleToggleBookmark(problem.id);
                  }}
                  aria-label={problem.saved ? "Remove saved problem" : "Save problem"}
                >
                  {problem.saved ? (
                    <BookmarkCheck className="size-4" />
                  ) : (
                    <Bookmark className="size-4" />
                  )}
                </Button>
              </div>

              <div className="mt-6 flex-1">
                <h3 className="text-lg leading-6 text-foreground">{problem.title}</h3>
                <p className="mt-4 line-clamp-4 text-sm leading-7 text-muted-foreground">
                  {problem.summary}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {problem.tags.slice(0, 3).map((tag) => (
                  <span
                    key={`${problem.id}-${tag}`}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">{problemCode(problem.id)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fit score{" "}
                    <span className="font-semibold text-foreground">
                      {problem.fitScore}
                    </span>
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    difficultyClass(problem.difficulty),
                  )}
                >
                  {problem.difficulty}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-14 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground" />
            <h3 className="mt-5 text-lg">No matching problems</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              Adjust your search terms or filters to broaden the marketplace results.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => {
                setQuery("");
                setCategoryFilter("All");
                setDifficultyFilter("All");
                setActiveTab("all");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}

      <ProblemDetailDrawer
        problem={selectedProblem}
        isPending={isBookmarkPending || isSelectPending}
        hasProject={hasProject}
        isTeamLead={isTeamLead}
        onClose={() => setSelectedProblemId(null)}
        onToggleBookmark={handleToggleBookmark}
        onSelectProject={handleSelectProject}
      />
    </PageContainer>
  );
}
