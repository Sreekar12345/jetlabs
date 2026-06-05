// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlignLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Bookmark,
  Boxes,
  Check,
  CheckCircle2,
  Clock3,
  Cloud,
  Command,
  Compass,
  Database,
  FileText,
  Folder,
  GraduationCap,
  Layers3,
  ListChecks,
  Lock,
  Mic2,
  Microscope,
  MonitorPlay,
  PenLine,
  Presentation,
  Quote,
  Rocket,
  Route,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquareTerminal,
  Target,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Playbook = {
  title: string;
  value: string;
  duration: string;
  steps: number;
  difficulty: string;
  progress: number;
  icon: LucideIcon;
  saved?: boolean;
};

type Domain = {
  name: string;
  theme: string;
  chip: string;
  accent: string;
  panelClass: string;
  chipClass: string;
  iconClass: string;
  visualClass: string;
  hoverClass: string;
  icon: LucideIcon;
  playbooks: Playbook[];
};

type Stage = {
  title: string;
  description: string;
  domains: Domain[];
};

const filters = [
  "Beginner Friendly",
  "Most Used",
  "Trending",
  "Faculty Recommended",
  "Deployment",
  "IEEE",
  "MVP",
  "Viva",
];

const analytics = [
  { label: "Total playbooks", value: "24", detail: "Across 8 operating domains" },
  { label: "Completion", value: "62%", detail: "7 completed this semester" },
  { label: "Faculty picks", value: "6", detail: "Prioritized for final review" },
];

const staticPlaybookStages: Stage[] = [
  {
    title: "Start Your Project",
    description: "Turn a broad idea into a scoped mission with evidence.",
    domains: [
      {
        name: "Selection",
        theme: "Choosing the right mission",
        chip: "Project discovery",
        accent: "Indigo",
        panelClass: "border-indigo-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7f8ff_54%,#eef2ff_100%)]",
        chipClass: "border-indigo-200 bg-indigo-50 text-indigo-700",
        iconClass: "border-indigo-200 bg-indigo-50 text-indigo-700",
        visualClass: "bg-[linear-gradient(to_right,rgba(79,70,229,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.10)_1px,transparent_1px)] bg-[size:18px_18px]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(79,70,229,0.14)]",
        icon: Compass,
        playbooks: [
          {
            title: "How to select a project",
            value: "Score ideas by feasibility, novelty, and review value.",
            duration: "35 min",
            steps: 7,
            difficulty: "Beginner",
            progress: 84,
            icon: Compass,
            saved: true,
          },
          {
            title: "Problem validation",
            value: "Convert assumptions into mentor-ready validation notes.",
            duration: "45 min",
            steps: 9,
            difficulty: "Core",
            progress: 58,
            icon: Target,
          },
          {
            title: "Scope analysis",
            value: "Set boundaries before engineering work expands.",
            duration: "30 min",
            steps: 6,
            difficulty: "Core",
            progress: 40,
            icon: Route,
          },
        ],
      },
    ],
  },
  {
    title: "Research & Validation",
    description: "Build the academic intelligence layer and prove the work.",
    domains: [
      {
        name: "Research",
        theme: "Academic intelligence layer",
        chip: "Investigation",
        accent: "Purple",
        panelClass: "border-purple-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbf7ff_52%,#f3e8ff_100%)]",
        chipClass: "border-purple-200 bg-purple-50 text-purple-700",
        iconClass: "border-purple-200 bg-purple-50 text-purple-700",
        visualClass: "bg-[linear-gradient(115deg,transparent_0%,transparent_42%,rgba(126,34,206,0.08)_42%,rgba(126,34,206,0.08)_58%,transparent_58%)]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(126,34,206,0.13)]",
        icon: Microscope,
        playbooks: [
          {
            title: "Research methodology",
            value: "Frame claims, variables, baselines, and evaluation logic.",
            duration: "55 min",
            steps: 10,
            difficulty: "Advanced",
            progress: 64,
            icon: Microscope,
          },
          {
            title: "Paper analysis",
            value: "Extract methods, datasets, gaps, and reusable evidence.",
            duration: "40 min",
            steps: 8,
            difficulty: "Core",
            progress: 72,
            icon: FileText,
          },
          {
            title: "Dataset collection",
            value: "Build a defensible data source and cleaning protocol.",
            duration: "50 min",
            steps: 9,
            difficulty: "Core",
            progress: 38,
            icon: Database,
          },
          {
            title: "Prior work evaluation",
            value: "Compare related systems without shallow summaries.",
            duration: "45 min",
            steps: 8,
            difficulty: "IEEE",
            progress: 51,
            icon: Quote,
          },
        ],
      },
      {
        name: "Validation",
        theme: "Evidence and proof",
        chip: "Testing",
        accent: "Emerald",
        panelClass: "border-emerald-200 bg-[linear-gradient(135deg,#ffffff_0%,#f3fff9_56%,#ecfdf5_100%)]",
        chipClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        iconClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        visualClass: "bg-[repeating-linear-gradient(90deg,rgba(16,185,129,0.12)_0px,rgba(16,185,129,0.12)_2px,transparent_2px,transparent_18px)]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(16,185,129,0.14)]",
        icon: ShieldCheck,
        playbooks: [
          {
            title: "Model evaluation",
            value: "Connect metrics to honest model behavior.",
            duration: "45 min",
            steps: 8,
            difficulty: "Core",
            progress: 76,
            icon: Activity,
          },
          {
            title: "Accuracy testing",
            value: "Run repeatable tests and capture failure cases.",
            duration: "30 min",
            steps: 6,
            difficulty: "Beginner",
            progress: 68,
            icon: ShieldCheck,
          },
          {
            title: "Benchmarking",
            value: "Compare performance against a baseline students can defend.",
            duration: "50 min",
            steps: 9,
            difficulty: "Advanced",
            progress: 44,
            icon: BarChart3,
          },
        ],
      },
    ],
  },
  {
    title: "Build & Engineer",
    description: "Move from prototype energy into production-grade execution.",
    domains: [
      {
        name: "Build",
        theme: "Engineering execution",
        chip: "Product engineering",
        accent: "Deep blue",
        panelClass: "border-blue-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_50%,#eaf3ff_100%)]",
        chipClass: "border-blue-200 bg-blue-50 text-blue-700",
        iconClass: "border-blue-200 bg-blue-50 text-blue-700",
        visualClass: "bg-[linear-gradient(to_right,rgba(37,99,235,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.08)_1px,transparent_1px)] bg-[size:28px_22px]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(37,99,235,0.14)]",
        icon: Layers3,
        playbooks: [
          {
            title: "MVP building",
            value: "Ship a thin but coherent version before adding scope.",
            duration: "60 min",
            steps: 12,
            difficulty: "Core",
            progress: 82,
            icon: Boxes,
            saved: true,
          },
          {
            title: "Architecture diagrams",
            value: "Make system design reviewable before implementation.",
            duration: "35 min",
            steps: 7,
            difficulty: "Core",
            progress: 46,
            icon: Layers3,
          },
          {
            title: "Backend systems",
            value: "Plan APIs, services, auth boundaries, and failure paths.",
            duration: "55 min",
            steps: 10,
            difficulty: "Advanced",
            progress: 33,
            icon: SquareTerminal,
          },
          {
            title: "Database setup",
            value: "Model storage around evidence, access, and future queries.",
            duration: "40 min",
            steps: 8,
            difficulty: "Core",
            progress: 52,
            icon: Database,
          },
        ],
      },
      {
        name: "Deploy",
        theme: "Launch to production",
        chip: "Shipping",
        accent: "Black + neon",
        panelClass: "border-slate-800 bg-[linear-gradient(135deg,#0b1020_0%,#111827_54%,#061019_100%)] text-white",
        chipClass: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        iconClass: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        visualClass: "bg-[linear-gradient(to_right,rgba(34,211,238,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.10)_1px,transparent_1px)] bg-[size:24px_24px]",
        hoverClass: "hover:shadow-[0_18px_55px_rgba(8,47,73,0.22)]",
        icon: Rocket,
        playbooks: [
          {
            title: "Vercel deployment",
            value: "Deploy, verify, and keep preview links evaluator-safe.",
            duration: "35 min",
            steps: 7,
            difficulty: "Beginner",
            progress: 88,
            icon: Rocket,
          },
          {
            title: "CI/CD basics",
            value: "Turn manual checks into a repeatable release path.",
            duration: "45 min",
            steps: 8,
            difficulty: "Core",
            progress: 28,
            icon: Cloud,
          },
          {
            title: "Production setup",
            value: "Prepare environment, secrets, domains, and monitoring.",
            duration: "50 min",
            steps: 10,
            difficulty: "Advanced",
            progress: 35,
            icon: Server,
          },
        ],
      },
    ],
  },
  {
    title: "Publish & Present",
    description: "Turn engineering progress into a credible academic story.",
    domains: [
      {
        name: "Writing",
        theme: "Professional technical publishing",
        chip: "Technical communication",
        accent: "Graphite",
        panelClass: "border-neutral-200 bg-[linear-gradient(135deg,#ffffff_0%,#fafafa_52%,#f4f4f5_100%)]",
        chipClass: "border-neutral-300 bg-neutral-100 text-neutral-700",
        iconClass: "border-neutral-300 bg-neutral-100 text-neutral-700",
        visualClass: "bg-[repeating-linear-gradient(0deg,rgba(23,23,23,0.07)_0px,rgba(23,23,23,0.07)_1px,transparent_1px,transparent_18px)]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(23,23,23,0.10)]",
        icon: PenLine,
        playbooks: [
          {
            title: "IEEE writing",
            value: "Draft sections with reviewer expectations in mind.",
            duration: "50 min",
            steps: 9,
            difficulty: "IEEE",
            progress: 69,
            icon: FileText,
          },
          {
            title: "Abstract creation",
            value: "Compress problem, method, result, and contribution.",
            duration: "25 min",
            steps: 5,
            difficulty: "Beginner",
            progress: 91,
            icon: AlignLeft,
          },
          {
            title: "Report formatting",
            value: "Make the final document clean, consistent, and exportable.",
            duration: "35 min",
            steps: 7,
            difficulty: "Core",
            progress: 57,
            icon: PenLine,
          },
        ],
      },
      {
        name: "Presentation",
        theme: "Defending your work",
        chip: "Viva and demo",
        accent: "Orange",
        panelClass: "border-orange-200 bg-[linear-gradient(135deg,#ffffff_0%,#fff8f2_54%,#ffedd5_100%)]",
        chipClass: "border-orange-200 bg-orange-50 text-orange-700",
        iconClass: "border-orange-200 bg-orange-50 text-orange-700",
        visualClass: "bg-[linear-gradient(90deg,transparent_0%,transparent_20%,rgba(249,115,22,0.10)_20%,rgba(249,115,22,0.10)_80%,transparent_80%)]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(249,115,22,0.14)]",
        icon: Presentation,
        playbooks: [
          {
            title: "Viva preparation",
            value: "Prepare for methodology, tradeoff, and evidence questions.",
            duration: "45 min",
            steps: 9,
            difficulty: "Core",
            progress: 61,
            icon: Mic2,
          },
          {
            title: "Presentation storytelling",
            value: "Structure slides around problem, proof, and impact.",
            duration: "40 min",
            steps: 8,
            difficulty: "Core",
            progress: 54,
            icon: Presentation,
          },
          {
            title: "Demo walkthrough",
            value: "Make the product demo crisp, repeatable, and resilient.",
            duration: "30 min",
            steps: 6,
            difficulty: "Beginner",
            progress: 43,
            icon: MonitorPlay,
          },
        ],
      },
    ],
  },
  {
    title: "Ship & Document",
    description: "Preserve the knowledge system that makes the project credible.",
    domains: [
      {
        name: "Documentation",
        theme: "Project memory system",
        chip: "Knowledge base",
        accent: "Slate",
        panelClass: "border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_58%,#eef2f7_100%)]",
        chipClass: "border-slate-200 bg-slate-100 text-slate-700",
        iconClass: "border-slate-200 bg-slate-100 text-slate-700",
        visualClass: "bg-[repeating-linear-gradient(90deg,rgba(51,65,85,0.09)_0px,rgba(51,65,85,0.09)_1px,transparent_1px,transparent_28px)]",
        hoverClass: "hover:shadow-[0_18px_50px_rgba(51,65,85,0.12)]",
        icon: BookOpen,
        playbooks: [
          {
            title: "Technical documentation",
            value: "Capture setup, system behavior, decisions, and operations.",
            duration: "45 min",
            steps: 8,
            difficulty: "Core",
            progress: 66,
            icon: BookOpen,
          },
          {
            title: "README writing",
            value: "Make the repository understandable in three minutes.",
            duration: "25 min",
            steps: 5,
            difficulty: "Beginner",
            progress: 79,
            icon: FileText,
          },
          {
            title: "API documentation",
            value: "Describe endpoints, payloads, auth rules, and examples.",
            duration: "40 min",
            steps: 7,
            difficulty: "Advanced",
            progress: 32,
            icon: Folder,
          },
        ],
      },
    ],
  },
];

interface PlaybookClientProps {
  team: any;
  project: any;
  submissions: any[];
  milestones: any[];
}

export function PlaybookClient({ team, project, submissions, milestones }: PlaybookClientProps) {
  const [activeTab, setActiveTab] = useState<"roadmap" | "playbooks">("roadmap");

  // Determine stage progress dynamically based on DB state
  const isStage1Completed = !!team && !!project;

  const hasLitReviewApproved = submissions.some(
    (s) =>
      s.type === "LITERATURE" &&
      (s.status === "APPROVED" || s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW"),
  );
  const isStage2Completed = isStage1Completed && hasLitReviewApproved;

  const hasWeeklyApproved = submissions.some(
    (s) =>
      s.type === "WEEKLY" &&
      (s.status === "APPROVED" || s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW"),
  );
  const isStage3Completed = isStage2Completed && (hasWeeklyApproved || (project && project.progress >= 20));

  const isStage4Completed = isStage3Completed && (project && project.progress >= 50);

  const hasIeeeDrafted = submissions.some(
    (s) =>
      s.type === "IEEE" &&
      (s.status === "APPROVED" || s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW"),
  );
  const isStage5Completed = isStage4Completed && hasIeeeDrafted;

  const hasFinalSubmitted = submissions.some(
    (s) =>
      s.type === "FINAL" &&
      (s.status === "APPROVED" || s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW"),
  );
  const isStage6Completed = isStage5Completed && hasFinalSubmitted;

  const isStage7Completed = isStage6Completed && submissions.some((s) => s.type === "FINAL" && s.status === "APPROVED");

  // Build systematic checklist metadata
  const roadmapStages = [
    {
      title: "Project Selection",
      shortTitle: "Selection",
      stageNum: 1,
      description: project 
        ? `Successfully selected and allocated capstone project: "${project.title}" (${project.domain}).`
        : "Initialize your capstone journey by selecting a curated industry/academic problem statement from the marketplace.",
      isCompleted: isStage1Completed,
      isActive: !isStage1Completed,
      isLocked: false,
      href: "/student/problems",
      btnText: "Explore Problem Marketplace",
      checklist: [
        { label: "Browse vetted problem statements", done: isStage1Completed },
        { label: "Evaluate advisor-recommended topics", done: isStage1Completed },
        { label: project ? `Selected project: "${project.title}"` : "Select project to auto-generate team & milestones", done: isStage1Completed },
      ],
      playbooks: ["How to select a project", "Problem validation", "Scope analysis"],
      icon: Compass,
      colorClass: "from-indigo-500 to-blue-600 bg-indigo-500/10 text-indigo-500",
    },
    {
      title: "Literature & Scope Verification",
      shortTitle: "Literature",
      stageNum: 2,
      description: project
        ? `Perform literature reviews specifically for "${project.title}". Audit historical solutions in the ${project.domain} domain.`
        : "Perform state-of-the-art reviews. Audit historical solutions and outline your methodology's novelty.",
      isCompleted: isStage2Completed,
      isActive: isStage1Completed && !isStage2Completed,
      isLocked: !isStage1Completed,
      href: "/student/submissions",
      btnText: "Submit Literature Review",
      checklist: [
        { label: `Review literature relevant to ${project.domain}`, done: hasLitReviewApproved },
        { label: "Isolate competing baseline metrics and algorithms", done: hasLitReviewApproved },
        { label: "Submit verified literature review summary", done: isStage2Completed },
      ],
      playbooks: ["Research methodology", "Paper analysis", "Prior work evaluation"],
      icon: Microscope,
      colorClass: "from-purple-500 to-pink-500 bg-purple-500/10 text-purple-500",
    },
    {
      title: "Architecture & Design",
      shortTitle: "Architecture",
      stageNum: 3,
      description: project
        ? `Model databases, components, and workflows designed for your "${project.title}" solution.`
        : "Model databases, draft component interaction workflows, and specify API routing guidelines.",
      isCompleted: isStage3Completed,
      isActive: isStage2Completed && !isStage3Completed,
      isLocked: !isStage2Completed,
      href: "/student/submissions",
      btnText: "Manage Weekly Submissions",
      checklist: [
        { label: `Draft architecture blocks for the ${project.domain} system`, done: isStage3Completed },
        { label: "Define PostgreSQL schemas and index structures", done: isStage3Completed },
        { label: "Establish secure token auth & API routing layout", done: isStage3Completed },
      ],
      playbooks: ["Architecture diagrams", "Database setup", "Backend systems"],
      icon: Layers3,
      colorClass: "from-blue-500 to-cyan-500 bg-blue-500/10 text-blue-500",
    },
    {
      title: "MVP Development & Engineering",
      shortTitle: "Core MVP",
      stageNum: 4,
      description: project
        ? `Construct a functional prototype for "${project.title}". Connect storage, set up API controllers, and host the build.`
        : "Construct a functional slice of your project. Connect storage, set up API controllers, and host the build.",
      isCompleted: isStage4Completed,
      isActive: isStage3Completed && !isStage4Completed,
      isLocked: !isStage3Completed,
      href: "/student/submissions",
      btnText: "Submit MVP Code / Updates",
      checklist: [
        { label: `Implement core backend logic for "${project.title}"`, done: isStage4Completed },
        { label: "Deploy preview build via Vercel or cloud provider", done: isStage4Completed },
        { label: `Demonstrate integrated data pipeline for ${project.domain}`, done: isStage4Completed },
      ],
      playbooks: ["MVP building", "Vercel deployment", "CI/CD basics"],
      icon: Boxes,
      colorClass: "from-emerald-500 to-teal-500 bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "IEEE Paper Drafting",
      shortTitle: "IEEE Draft",
      stageNum: 5,
      description: project
        ? `Translate your methodology, metrics, and novelty claims for "${project.title}" into a formal IEEE template document.`
        : "Translate your methodology, metrics, and novelty claims into a formal IEEE template document.",
      isCompleted: isStage5Completed,
      isActive: isStage4Completed && !isStage5Completed,
      isLocked: !isStage4Completed,
      href: "/student/paper",
      btnText: "Open IEEE Paper Workspace",
      checklist: [
        { label: `Complete Abstract and Intro sections for "${project.title}"`, done: hasIeeeDrafted },
        { label: "Compile results tables and benchmark comparison charts", done: hasIeeeDrafted },
        { label: "Refine bibliography references using BibTeX syntax", done: isStage5Completed },
      ],
      playbooks: ["IEEE writing", "Abstract creation", "Report formatting"],
      icon: FileText,
      colorClass: "from-yellow-500 to-amber-500 bg-yellow-500/10 text-yellow-500",
    },
    {
      title: "Final Packaging & Audit",
      shortTitle: "Final Pack",
      stageNum: 6,
      description: project
        ? `Gather codebases, live deployment configurations, slide decks, and recordings for your "${project.title}" grading check.`
        : "Gather codebases, live deployment configurations, slide decks, and recordings for final grading check.",
      isCompleted: isStage6Completed,
      isActive: isStage5Completed && !isStage6Completed,
      isLocked: !isStage5Completed,
      href: "/student/final",
      btnText: "Upload Final Deliverables",
      checklist: [
        { label: `Push clean "${project.title}" codebase to Git server`, done: hasFinalSubmitted },
        { label: "Verify production URL and SSL access security", done: hasFinalSubmitted },
        { label: "Upload demonstration walkthrough video & deck", done: isStage6Completed },
      ],
      playbooks: ["Technical documentation", "README writing", "API documentation"],
      icon: Trophy,
      colorClass: "from-teal-500 to-cyan-600 bg-teal-500/10 text-teal-500",
    },
    {
      title: "Viva Defense & Evaluation",
      shortTitle: "Viva",
      stageNum: 7,
      description: project
        ? `Simulate committee reviews. Rehearse architecture, trade-off, and implementation defenses for your ${project.domain} project.`
        : "Simulate committee reviews. Rehearse architecture, trade-off, and implementation defenses.",
      isCompleted: isStage7Completed,
      isActive: isStage6Completed && !isStage7Completed,
      isLocked: !isStage6Completed,
      href: "/student/viva",
      btnText: "Rehearse Viva Simulator",
      checklist: [
        { label: `Complete simulator questions for "${project.title}"`, done: isStage7Completed },
        { label: "Resolve advisor feedback on deliverables", done: isStage7Completed },
        { label: `Defend capstone project "${project.title}" live before panel`, done: isStage7Completed },
      ],
      playbooks: ["Viva preparation", "Presentation storytelling", "Demo walkthrough"],
      icon: Presentation,
      colorClass: "from-orange-500 to-red-500 bg-orange-500/10 text-orange-500",
    },
  ];

  // Auto-select active or first stage
  const activeStageIndex = roadmapStages.findIndex((s) => s.isActive);
  const initialSelectedStage = activeStageIndex !== -1 ? activeStageIndex : 0;
  const [selectedStage, setSelectedStage] = useState<number>(initialSelectedStage);

  const currentStageDetails = roadmapStages[selectedStage];
  const activeStageName = roadmapStages[activeStageIndex !== -1 ? activeStageIndex : 0]?.title;

  const completedStagesCount = roadmapStages.filter((s) => s.isCompleted).length;
  const roadmapProgressPercentage = Math.round((completedStagesCount / roadmapStages.length) * 100);

  // Jump to tab and select playbook or find it
  const handleViewPlaybook = (title: string) => {
    setActiveTab("playbooks");
    // Optionally filter or flash card if required
  };

  return (
    <PageContainer
      title="Project Lifecycle Playbooks"
      description="Systematic step-by-step roadmap and operational playbooks to navigate from selection to final defense."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-white">
            {roadmapStages.length} Roadmap Stages
          </Badge>
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 font-medium">
            {roadmapProgressPercentage}% Lifecycle Completed
          </Badge>
        </div>
      }
      className="pb-6"
    >
      {/* Top Banner Tab Navigator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex space-x-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("roadmap")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
              activeTab === "roadmap"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <Route className="size-4" />
            Systematic Roadmap
          </button>
          <button
            onClick={() => setActiveTab("playbooks")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
              activeTab === "playbooks"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <BookOpenCheck className="size-4" />
            Playbook Guides ({staticPlaybookStages.flatMap((s) => s.domains.flatMap((d) => d.playbooks)).length})
          </button>
        </div>

        {team && (
          <div className="hidden text-sm text-slate-500 md:block">
            Project: <span className="font-semibold text-slate-800">{project?.title || team.projectTitle}</span>
          </div>
        )}
      </div>

      {activeTab === "roadmap" ? (
        <div className="space-y-6">
          {/* Active Stage Status Bar */}
          <Card className="border-indigo-100 bg-[linear-gradient(135deg,#fcfdff_0%,#f5f8ff_100%)] shadow-sm">
            <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Current Operating Phase</span>
                <h3 className="text-xl font-bold text-slate-900">
                  {isStage1Completed ? (
                    <>
                      Stage {activeStageIndex !== -1 ? activeStageIndex + 1 : 7}:{" "}
                      <span className="text-indigo-700">{activeStageName || "Completed!"}</span>
                    </>
                  ) : (
                    "Stage 1: Project Selection Required"
                  )}
                </h3>
                <p className="text-sm text-slate-600">
                  {isStage1Completed
                    ? `Close Stage ${activeStageIndex !== -1 ? activeStageIndex + 1 : 7} tasks to advance your capstone rating.`
                    : "Browse open problem statements to form a team and lock in advisor guidance."}
                </p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500 font-medium">Roadmap Progress</p>
                  <p className="text-lg font-bold text-slate-800">{completedStagesCount} / 7 Completed</p>
                </div>
                <div className="flex-1 md:flex-initial w-32">
                  <Progress value={roadmapProgressPercentage} className="h-2.5 bg-slate-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Split Grid */}
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            {/* Left Column: Vertical Timeline Steps */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-500 px-1 uppercase tracking-wider">Project Lifecycle Path</p>
              <div className="relative space-y-2 pl-2">
                <div className="absolute left-[24px] top-6 bottom-6 w-0.5 bg-slate-200" />

                {roadmapStages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isSelected = selectedStage === idx;

                  return (
                    <button
                      key={stage.title}
                      onClick={() => setSelectedStage(idx)}
                      className={cn(
                        "relative flex w-full items-start gap-4 rounded-2xl border p-3.5 text-left transition-all duration-200",
                        isSelected
                          ? "border-slate-900 bg-white shadow-md scale-[1.01]"
                          : "border-slate-100 bg-white/60 hover:bg-white hover:border-slate-200",
                        stage.isLocked && "opacity-60 cursor-not-allowed",
                      )}
                    >
                      {/* Step Circle Pin */}
                      <span
                        className={cn(
                          "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold shadow-sm transition-colors duration-200",
                          stage.isCompleted
                            ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                            : stage.isActive
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700 animate-pulse"
                              : "border-slate-200 bg-slate-50 text-slate-400",
                        )}
                      >
                        {stage.isCompleted ? <Check className="size-4" /> : stage.isLocked ? <Lock className="size-3.5" /> : stage.stageNum}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-sm font-bold truncate text-slate-800", isSelected && "text-slate-950 font-extrabold")}>
                            {stage.title}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Stage {stage.stageNum}</p>

                        <div className="flex gap-1.5 mt-2">
                          {stage.isCompleted ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 px-2 font-semibold">Completed</Badge>
                          ) : stage.isActive ? (
                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] py-0 px-2 font-semibold animate-pulse">Active Now</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] py-0 px-2 text-slate-400 border-slate-200 bg-slate-50">Locked</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Stage Details Console */}
            <div className="space-y-4">
              <Card className="border-slate-200 overflow-hidden shadow-sm">
                {/* Visual Header */}
                <div className={cn("h-3 bg-gradient-to-r", currentStageDetails.isCompleted ? "from-emerald-500 to-teal-500" : currentStageDetails.isActive ? "from-indigo-500 to-blue-500" : "from-slate-300 to-slate-400")} />

                <CardContent className="p-6 space-y-6">
                  {/* Title Block */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className={cn("flex size-10 items-center justify-center rounded-xl", currentStageDetails.colorClass)}>
                          <currentStageDetails.icon className="size-5" />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Stage {currentStageDetails.stageNum} of 7</p>
                          <h2 className="text-xl font-bold text-slate-900">{currentStageDetails.title}</h2>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed">{currentStageDetails.description}</p>
                    </div>

                    <div className="shrink-0">
                      {currentStageDetails.isCompleted ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold px-3 py-1 text-xs">Stage Completed</Badge>
                      ) : currentStageDetails.isActive ? (
                        <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold px-3 py-1 text-xs">Active Step</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200 font-medium px-3 py-1 text-xs">Phase Locked</Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions Checklists */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800">Required Tasks Checklist</h3>
                    <div className="grid gap-2.5">
                      {currentStageDetails.checklist.map((task, idx) => (
                        <div
                          key={task.label}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-3.5 transition-colors",
                            task.done
                              ? "border-emerald-100 bg-emerald-50/20 text-slate-800"
                              : "border-slate-100 bg-slate-50/50 text-slate-700",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-full border",
                              task.done
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-slate-300 bg-white text-transparent",
                            )}
                          >
                            <Check className="size-3.5 stroke-[3px]" />
                          </span>
                          <span className={cn("text-sm", task.done && "line-through text-slate-400 font-medium")}>{task.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Playbooks shortcuts */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800">Linked Execution Playbooks</h3>
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {currentStageDetails.playbooks.map((pName) => (
                        <button
                          key={pName}
                          onClick={() => handleViewPlaybook(pName)}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-left text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                        >
                          <span className="truncate">{pName}</span>
                          <ArrowRight className="size-3 shrink-0 ml-1.5 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary CTA redirect */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500 leading-normal max-w-[280px]">
                      {currentStageDetails.isLocked
                        ? "Complete previous stages first to unlock this action."
                        : "Click to navigate directly to the workspace for this stage."}
                    </div>

                    <Button
                      asChild={!currentStageDetails.isLocked}
                      disabled={currentStageDetails.isLocked}
                      className={cn(
                        "rounded-xl h-11 px-5 font-semibold",
                        currentStageDetails.isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white",
                      )}
                    >
                      {currentStageDetails.isLocked ? (
                        <span className="flex items-center gap-1.5">
                          <Lock className="size-4" /> Locked Action
                        </span>
                      ) : (
                        <Link href={currentStageDetails.href}>
                          {currentStageDetails.btnText}
                          <ArrowRight className="size-4 ml-1.5" />
                        </Link>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Guides tab view: exactly matches the original premium library visual grid */
        <div className="space-y-6">
          <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcff_52%,#f3f6fb_100%)] shadow-sm">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-12 rounded-2xl border-slate-200 bg-white pl-11 pr-28 shadow-sm focus-visible:ring-slate-900/10"
                    placeholder="Search playbooks, deployment, viva, MVP..."
                  />
                  <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-xl border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground sm:flex">
                    <Command className="size-3" />
                    Playbooks
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {analytics.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-border bg-white p-3">
                      <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-xl font-semibold tracking-normal text-slate-800">
                        {item.value}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className="shrink-0 rounded-full border border-border bg-white px-3.5 py-2 text-xs font-medium text-muted-foreground transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-foreground hover:shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
                  >
                    {filter}
                  </button>
                ))}
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-border bg-slate-950 px-3.5 py-2 text-xs font-medium text-white transition duration-200 hover:-translate-y-0.5"
                >
                  <SlidersHorizontal className="mr-1.5 inline size-3.5" />
                  More filters
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              {staticPlaybookStages.map((stage) => (
                <section key={stage.title} className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                        <Sparkles className="size-3.5" />
                        Execution stage
                      </div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {stage.title}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {stage.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      {stage.domains.length} domain{stage.domains.length > 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="grid gap-5">
                    {stage.domains.map((domain) => {
                      const Icon = domain.icon;
                      const wide = domain.playbooks.length > 3;

                      return (
                        <section
                          key={domain.name}
                          className={cn(
                            "overflow-hidden rounded-3xl border p-4 transition duration-200 sm:p-5 shadow-sm bg-white",
                            domain.panelClass,
                          )}
                        >
                          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] xl:items-stretch">
                            <div className="relative min-h-52 overflow-hidden rounded-2xl border border-black/5 bg-white/[0.62] p-5">
                              <div className={cn("absolute inset-0 opacity-90", domain.visualClass)} />
                              <div className="relative flex h-full flex-col justify-between gap-8">
                                <div>
                                  <div
                                    className={cn(
                                      "mb-4 grid size-11 place-items-center rounded-xl border",
                                      domain.iconClass,
                                    )}
                                  >
                                    <Icon className="size-5" />
                                  </div>
                                  <Badge className={domain.chipClass}>{domain.chip}</Badge>
                                  <h3 className="mt-4 text-2xl font-semibold tracking-normal text-slate-800">
                                    {domain.name}
                                  </h3>
                                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{domain.theme}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  {[0, 1, 2].map((item) => (
                                    <div
                                      key={item}
                                      className="h-10 rounded-xl border border-black/5 bg-white/[0.65]"
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div
                              className={cn(
                                "grid gap-3",
                                wide ? "md:grid-cols-2" : "md:grid-cols-3 xl:grid-cols-1",
                              )}
                            >
                              {domain.playbooks.map((playbook) => {
                                const CardIcon = playbook.icon;
                                return (
                                  <article
                                    key={playbook.title}
                                    className={cn(
                                      "group/playbook relative overflow-hidden rounded-2xl border border-black/5 bg-white/[0.82] p-4 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5",
                                      domain.name === "Deploy" && "border-white/10 bg-white/[0.06] text-white",
                                      domain.hoverClass,
                                    )}
                                  >
                                    <div className={cn("absolute inset-x-0 top-0 h-20 opacity-70", domain.visualClass)} />
                                    <div className="relative space-y-4">
                                      <div className="flex items-start justify-between gap-3">
                                        <div
                                          className={cn(
                                            "grid size-10 place-items-center rounded-xl border bg-white",
                                            domain.iconClass,
                                          )}
                                        >
                                          <CardIcon className="size-5" />
                                        </div>
                                        <button
                                          type="button"
                                          aria-label={`Save ${playbook.title}`}
                                          className={cn(
                                            "grid size-8 place-items-center rounded-full border border-black/10 bg-white/75 text-muted-foreground transition duration-200 hover:scale-105 hover:text-foreground",
                                            playbook.saved && "text-foreground",
                                            domain.name === "Deploy" &&
                                              "border-white/10 bg-white/10 text-white/60 hover:text-white",
                                          )}
                                        >
                                          <Bookmark className="size-4" />
                                        </button>
                                      </div>

                                      <div>
                                        <Badge className={domain.chipClass}>{domain.name}</Badge>
                                        <h3
                                          className={cn(
                                            "mt-3 text-lg font-semibold tracking-normal text-slate-800",
                                            domain.name === "Deploy" && "text-white",
                                          )}
                                        >
                                          {playbook.title}
                                        </h3>
                                        <p
                                          className={cn(
                                            "mt-2 text-sm leading-6 text-muted-foreground",
                                            domain.name === "Deploy" && "text-white/[0.65]",
                                          )}
                                        >
                                          {playbook.value}
                                        </p>
                                      </div>

                                      <div
                                        className={cn(
                                          "grid grid-cols-3 gap-2 text-xs text-muted-foreground",
                                          domain.name === "Deploy" && "text-white/60",
                                        )}
                                      >
                                        <span className="flex items-center gap-1.5">
                                          <Clock3 className="size-3.5" />
                                          {playbook.duration}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                          <ListChecks className="size-3.5" />
                                          {playbook.steps} steps
                                        </span>
                                        <span className="truncate rounded-full border border-black/10 bg-white/70 px-2 py-1 text-center font-medium text-slate-800">
                                          {playbook.difficulty}
                                        </span>
                                      </div>

                                      <div className="space-y-2">
                                        <div
                                          className={cn(
                                            "flex items-center justify-between text-xs font-medium text-muted-foreground",
                                            domain.name === "Deploy" && "text-white/60",
                                          )}
                                        >
                                          <span>Progress</span>
                                          <span>{playbook.progress}%</span>
                                        </div>
                                        <Progress
                                          value={playbook.progress}
                                          className={cn(
                                            "h-1.5 bg-slate-200/80 transition duration-300 group-hover/playbook:bg-slate-200",
                                            domain.name === "Deploy" && "bg-white/12",
                                          )}
                                        />
                                      </div>
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Sidebar analytics panel */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
                      <GraduationCap className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Faculty picks</p>
                      <p className="text-xs text-muted-foreground">High-signal review aids</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {["Research methodology", "Benchmarking", "Viva preparation"].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                      <TrendingUp className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Recently completed</p>
                      <p className="text-xs text-muted-foreground">3 closed this week</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {["How to select a project", "Abstract creation", "README writing"].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
