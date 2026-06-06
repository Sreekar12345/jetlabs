"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Compass,
  FileText,
  Orbit,
  Presentation,
  Sparkles,
  ChevronDown,
  Check,
  ChevronRight,
  Code,
  GraduationCap,
  Search,
  X,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingClientProps {
  isLoggedIn: boolean;
  dashboardPath: string | null;
}

// Team datasets for live analytics charting
const TEAM_DATASETS = {
  Apollo: {
    name: "Team Apollo",
    category: "AI/ML Capstone",
    commitsWeekly: [12, 18, 25, 30, 42, 54],
    activeMilestone: "Milestone 2: Database Layer",
    healthScore: 9.2,
    backlogs: 0,
    files: [
      { name: "prisma/schema.prisma", changes: "+45 lines", status: "Modified" },
      { name: "src/lib/database/connection.ts", changes: "+12 lines", status: "Modified" },
      { name: "docs/weekly_report_week4.pdf", changes: "140 KB", status: "Uploaded" }
    ]
  },
  Orion: {
    name: "Team Orion",
    category: "IoT Systems Capstone",
    commitsWeekly: [22, 14, 18, 28, 20, 32],
    activeMilestone: "Milestone 1: Sensor Drivers",
    healthScore: 7.8,
    backlogs: 1,
    files: [
      { name: "firmware/sensor_driver.cpp", changes: "+110 lines", status: "Modified" },
      { name: "docs/weekly_report_week2.pdf", changes: "95 KB", status: "Uploaded" },
      { name: "firmware/include/driver.h", changes: "+15 lines", status: "Modified" }
    ]
  },
  Phoenix: {
    name: "Team Phoenix",
    category: "Ledger Capstone",
    commitsWeekly: [15, 30, 22, 45, 38, 68],
    activeMilestone: "Milestone 3: Audit Ledger",
    healthScore: 9.8,
    backlogs: 0,
    files: [
      { name: "api/ledger/audit.go", changes: "+180 lines", status: "Modified" },
      { name: "api/ledger/ledger_test.go", changes: "+85 lines", status: "Modified" },
      { name: "docs/security_audit.pdf", changes: "340 KB", status: "Uploaded" }
    ]
  }
};

// Testimonials
const TESTIMONIALS = [
  {
    name: "Dr. Nisha Varma",
    role: "Dean of Engineering, RIT College",
    quote: "JetLabs restructured our capstone evaluations. Advisors can view real git-sync velocity instead of waiting for copy-pasted slides.",
    avatar: "NV"
  },
  {
    name: "Tarak Ram",
    role: "AI/ML Student, CSE Department",
    quote: "The Viva readiness rehearsals saved us. The AI evaluator flagged database index scaling issues before the actual committee did.",
    avatar: "TR"
  },
  {
    name: "Sanjay Gupta",
    role: "CTO, CloudScale & Industry Mentor",
    quote: "I submit projects to the marketplace and track progress directly. It bridges the gap between college labs and real engineering.",
    avatar: "SG"
  }
];

// FAQ list
const FAQS = [
  {
    question: "How does JetLabs synchronize GitHub and GitLab commits with Neon Postgres database logs?",
    answer: "When students push code, our GitHub/GitLab webhook integration captures commit history, parses file changes (like schema.prisma or driver.cpp), and registers activity records into our Neon PostgreSQL database via connection pooling pipelines. This updates cohort dashboards instantly."
  },
  {
    question: "How does the AI Viva Rehearsal simulator evaluate student presentation readiness?",
    answer: "The simulator reads code modifications, milestone descriptions, and IEEE report drafts. It then prompts students with real-world engineering challenges (e.g. database index limits, edge middleware routing, or REST api auth mechanisms) and grades responses based on compliance logic models."
  },
  {
    question: "Can instructors configure custom grading metrics and evaluation Rubrics?",
    answer: "Absolutely. Cohort administrators can define custom point weights for literature citations, git commit velocity scores, unit test run pass rates, and viva defense grades to match specific university guidelines."
  },
  {
    question: "How does the Vetted Problem Marketplace bridge academia and industry needs?",
    answer: "We compile pre-approved capstone briefs directly from active open-source repositories, industry CTOs, and research labs. Each statement defines concrete outcomes (e.g., zero-trust data APIs or visual odometry nodes) so teams work on production-relevant engineering challenges."
  },
  {
    question: "How does the built-in IEEE document workspace enforce paper writing compliance?",
    answer: "The workspace includes a structured section editor (Abstract, Introduction, System Design, Results, and References) linked to real-time validators. It alerts students if citation standards are missing, reference formats are incorrect, or section counts deviate from IEEE guidelines before submission."
  },
  {
    question: "Can industry mentors track student progress directly through JetLabs?",
    answer: "Yes. Instructors can invite external industry mentors to view specific project workspace pipelines. Mentors can leave collaborative review annotations, check git commit velocity graphs, and assign milestone approvals directly from their guest reviewer queues."
  },
  {
    question: "Is it possible to deploy sandbox preview builds of Next.js or edge projects directly?",
    answer: "Yes. Through our Vercel integration, JetLabs automatically deploys unique preview environment URLs when students merge git branches. Advisors and deans can test live working student web apps inside the evaluation workspace directly."
  }
];

// Integrations list for Mint Block
const INTEGRATIONS = [
  {
    id: "neon",
    name: "Neon DB",
    icon: "⚡",
    x: 340,
    y: 200,
    color: "#00e676",
    title: "Serverless Postgres",
    desc: "Synchronizes milestone database logs with connection pooling & autoscaling. Runs queries at <15ms latency.",
    details: "Connection: Pool Mode\nMax Concurrency: Auto\nRegion: AWS US-East-1"
  },
  {
    id: "prisma",
    name: "Prisma ORM",
    icon: "◭",
    x: 270,
    y: 321,
    color: "#5a67d8",
    title: "Schema Management",
    desc: "Validates database schema migrations dynamically when students push code commits.",
    details: "Client Version: 5.12.0\nProvider: postgresql\nSync status: Verified"
  },
  {
    id: "gitlab",
    name: "GitLab CI",
    icon: "🦊",
    x: 130,
    y: 321,
    color: "#f56565",
    title: "Academic Runners",
    desc: "Triggers university test suites and verifies compilation logs before code reviews.",
    details: "Runner type: Shared-Docker\nConcurrency: 5\nTimeout: 600s"
  },
  {
    id: "latex",
    name: "LaTeX Engine",
    icon: "L",
    x: 60,
    y: 200,
    color: "#4a5568",
    title: "IEEE Document Compiler",
    desc: "Compiles weekly reports directly into IEEE-compliant PDF formats.",
    details: "Compiler: pdfLaTeX\nStyle: IEEEtran\nVersion: TeXLive 2026"
  },
  {
    id: "github",
    name: "GitHub Actions",
    icon: "🐙",
    x: 130,
    y: 79,
    color: "#1a202c",
    title: "Commit Synchronization",
    desc: "Syncs repository actions and branching charts directly to the faculty dashboard feed.",
    details: "Sync Key: jetlabs-sha256\nWebhook: Connected\nSSL Verification: Active"
  },
  {
    id: "vercel",
    name: "Vercel Previews",
    icon: "▲",
    x: 270,
    y: 79,
    color: "#000000",
    title: "Hosted Environments",
    desc: "Creates unique hosted review URLs for student UI submissions automatically.",
    details: "Framework: Next.js\nRoute Prefixes: preview-*\nEdge Middleware: Active"
  }
];

// Student Milestones dataset
const STUDENT_MILESTONES = [
  {
    id: 1,
    title: "Milestone 1: Project Scope",
    fileName: "docs/thesis.tex",
    logs: [
      { id: "a1b2c3d", msg: "docs: outline thesis proposal layout", time: "3 days ago" },
      { id: "e5f6g7h", msg: "docs: review literature bibliography citations", time: "4 days ago" }
    ]
  },
  {
    id: 2,
    title: "Milestone 2: Database Schema",
    fileName: "src/schema.prisma",
    logs: [
      { id: "e6f4a8b", msg: "feat: setup neon database client", time: "2 hours ago" },
      { id: "3f9c2d1", msg: "docs: add initial IEEE paper draft outline", time: "5 hours ago" }
    ]
  },
  {
    id: 3,
    title: "Milestone 3: Core API Services",
    fileName: "src/server.ts",
    logs: []
  }
];

const renderCodeContent = (idx: number) => {
  if (idx === 0) {
    return (
      <div className="font-mono text-[12px] leading-relaxed">
        <span className="text-[#ff79c6] font-semibold">\documentclass</span>
        <span className="text-white">&#123;</span>
        <span className="text-[#8be9fd]">IEEEtran</span>
        <span className="text-white">&#125;</span>
        {"\n"}
        <span className="text-[#ff79c6] font-semibold">\begin</span>
        <span className="text-white">&#123;</span>
        <span className="text-[#8be9fd]">document</span>
        <span className="text-white">&#125;</span>
        {"\n"}
        <span className="text-[#ff79c6] font-semibold">\title</span>
        <span className="text-white">&#123;</span>
        <span className="text-[#f1fa8c]">"Distributed AI Fraud Prevention"</span>
        <span className="text-white">&#125;</span>
        {"\n"}
        <span className="text-[#ff79c6] font-semibold">\author</span>
        <span className="text-white">&#123;</span>
        <span className="text-[#50fa7b]">Team Apollo</span>
        <span className="text-white">&#125;</span>
        {"\n"}
        <span className="text-[#ff79c6] font-semibold">\maketitle</span>
        {"\n"}
        <span className="text-[#ff79c6] font-semibold">\begin</span>
        <span className="text-white">&#123;</span>
        <span className="text-[#8be9fd]">abstract</span>
        <span className="text-white">&#125;</span>
        {"\n"}
        <span className="text-[#6272a4] italic">
          {"  "}This paper outlines distributed real-time machine learning{"\n"}
          {"  "}inference grids leveraging connection pooling pipelines.
        </span>
        {"\n"}
        <span className="text-[#ff79c6] font-semibold">\end</span>
        <span className="text-white">&#123;</span>
        <span className="text-[#8be9fd]">abstract</span>
        <span className="text-white">&#125;</span>
        {"\n"}
        <span className="text-[#ff79c6] font-semibold">\end</span>
        <span className="text-white">&#123;</span>
        <span className="text-[#8be9fd]">document</span>
        <span className="text-white">&#125;</span>
      </div>
    );
  }
  if (idx === 1) {
    return (
      <div className="font-mono text-[12px] leading-relaxed">
        <span className="text-[#ff79c6] font-semibold">datasource</span>{" "}
        <span className="text-[#50fa7b]">db</span>{" "}
        <span className="text-white">&#123;</span>
        {"\n"}
        <span className="text-[#8be9fd]">  provider</span> <span className="text-[#ff79c6]">=</span>{" "}
        <span className="text-[#f1fa8c]">"postgresql"</span>
        {"\n"}
        <span className="text-[#8be9fd]">  url</span> <span className="text-[#ff79c6]">=</span>{" "}
        <span className="text-[#ff79c6]">env</span>
        <span className="text-white">(</span>
        <span className="text-[#f1fa8c]">"DATABASE_URL"</span>
        <span className="text-white">)</span>
        {"\n"}
        <span className="text-white">&#125;</span>
        {"\n\n"}
        <span className="text-[#ff79c6] font-semibold">model</span>{" "}
        <span className="text-[#50fa7b]">Milestone</span>{" "}
        <span className="text-white">&#123;</span>
        {"\n"}
        <span className="text-[#8be9fd]">  id</span> <span className="text-[#bd93f9]">String</span>{" "}
        <span className="text-[#ff79c6]">@id</span>{" "}
        <span className="text-[#ff79c6]">@default</span>
        <span className="text-white">(</span>
        <span className="text-[#8be9fd]">uuid</span>
        <span className="text-white">())</span>
        {"\n"}
        <span className="text-[#8be9fd]">  title</span> <span className="text-[#bd93f9]">String</span>
        {"\n"}
        <span className="text-[#8be9fd]">  progress</span> <span className="text-[#bd93f9]">Int</span>{" "}
        <span className="text-[#ff79c6]">@default</span>
        <span className="text-white">(</span>
        <span className="text-[#f1fa8c]">0</span>
        <span className="text-white">)</span>
        {"\n"}
        <span className="text-[#8be9fd]">  isSync</span> <span className="text-[#bd93f9]">Boolean</span>{" "}
        <span className="text-[#ff79c6]">@default</span>
        <span className="text-white">(</span>
        <span className="text-[#50fa7b]">true</span>
        <span className="text-white">)</span>
        {"\n"}
        <span className="text-white">&#125;</span>
      </div>
    );
  }
  return (
    <div className="font-mono text-[12px] leading-relaxed">
      <span className="text-[#ff79c6] font-semibold">import</span>{" "}
      <span className="text-white">express</span>{" "}
      <span className="text-[#ff79c6] font-semibold">from</span>{" "}
      <span className="text-[#f1fa8c]">"express"</span>
      <span className="text-white">;</span>
      {"\n"}
      <span className="text-[#ff79c6] font-semibold">import</span>{" "}
      <span className="text-white">&#123;</span> <span className="text-[#8be9fd]">PrismaClient</span>{" "}
      <span className="text-white">&#125;</span>{" "}
      <span className="text-[#ff79c6] font-semibold">from</span>{" "}
      <span className="text-[#f1fa8c]">"@prisma/client"</span>
      <span className="text-white">;</span>
      {"\n\n"}
      <span className="text-[#ff79c6] font-semibold">const</span>{" "}
      <span className="text-[#50fa7b]">prisma</span> <span className="text-[#ff79c6]">=</span>{" "}
      <span className="text-[#ff79c6] font-semibold">new</span>{" "}
      <span className="text-[#8be9fd]">PrismaClient</span>
      <span className="text-white">();</span>
      {"\n"}
      <span className="text-[#ff79c6] font-semibold">const</span>{" "}
      <span className="text-[#50fa7b]">app</span> <span className="text-[#ff79c6]">=</span>{" "}
      <span className="text-[#ff79c6]">express</span>
      <span className="text-white">();</span>
      {"\n\n"}
      <span className="text-[#50fa7b]">app</span>
      <span className="text-white">.</span>
      <span className="text-[#bd93f9]">get</span>
      <span className="text-white">(</span>
      <span className="text-[#f1fa8c]">"/api/health"</span>
      <span className="text-white">,</span>{" "}
      <span className="text-[#ff79c6] font-semibold">async</span>{" "}
      <span className="text-white">(</span>
      <span className="text-[#50fa7b]">req</span>
      <span className="text-white">,</span>{" "}
      <span className="text-[#50fa7b]">res</span>
      <span className="text-white">)</span>{" "}
      <span className="text-[#ff79c6] font-semibold">=&gt;</span>{" "}
      <span className="text-white">&#123;</span>
      {"\n"}
      <span className="text-[#ff79c6] font-semibold">  const</span>{" "}
      <span className="text-[#8be9fd]">ok</span> <span className="text-[#ff79c6]">=</span>{" "}
      <span className="text-[#ff79c6] font-semibold">await</span>{" "}
      <span className="text-[#50fa7b]">prisma</span>
      <span className="text-white">.</span>
      <span className="text-[#50fa7b]">$queryRaw</span>
      <span className="text-[#f1fa8c]">`SELECT 1`</span>
      <span className="text-white">;</span>
      {"\n"}
      <span className="text-[#50fa7b]">  res</span>
      <span className="text-white">.</span>
      <span className="text-[#bd93f9]">json</span>
      <span className="text-white">(&#123;</span> <span className="text-[#8be9fd]">status</span>
      <span className="text-white">:</span> <span className="text-[#f1fa8c]">"healthy"</span>
      <span className="text-white">,</span> <span className="text-[#8be9fd]">db</span>
      <span className="text-white">:</span> <span className="text-[#8be9fd]">ok</span>{" "}
      <span className="text-white">&#125;);</span>
      {"\n"}
      <span className="text-white">&#125;);</span>
    </div>
  );
};

// Stats Count-Up Component
function CountUpMetric({ value, label, prefix = "", suffix = "" }: { value: string; label: string; prefix?: string; suffix?: string }) {
  const numericVal = parseFloat(value.replace(/[^0-9.]/g, ""));
  const isFloat = value.includes(".");
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const increment = numericVal / (duration / 16); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericVal) {
        setCount(numericVal);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [numericVal]);

  const displayCount = isFloat ? count.toFixed(1) : Math.floor(count);

  return (
    <div className="space-y-1 text-center">
      <p className="text-3xl md:text-5xl font-display font-semibold tracking-[-0.96px] text-black">
        {prefix}{displayCount}{suffix}
      </p>
      <p className="text-[12px] font-mono tracking-[0.60px] text-black/60 uppercase">{label}</p>
    </div>
  );
}

function MultiplayerCursor({ x, y, name, color }: { x: string | number; y: string | number; name: string; color: string }) {
  const colorMap: Record<string, { fill: string; bg: string; text: string }> = {
    pink: { fill: "#ff3d8b", bg: "bg-[#ff3d8b]", text: "text-white" },
    blue: { fill: "#00b2ff", bg: "bg-[#00b2ff]", text: "text-black" },
    violet: { fill: "#c5b0f4", bg: "bg-[#c5b0f4]", text: "text-black" },
    green: { fill: "#1ea64a", bg: "bg-[#1ea64a]", text: "text-white" },
    orange: { fill: "#f3c9b6", bg: "bg-[#f3c9b6]", text: "text-black" }
  };
  const colors = colorMap[color] || colorMap.pink;

  return (
    <div
      className="absolute pointer-events-none z-30 transition-all duration-700 ease-out hidden md:flex flex-col items-start"
      style={{ left: x, top: y }}
    >
      <svg
        width="14"
        height="18"
        viewBox="0 0 14 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.15))" }}
      >
        <path
          d="M0 0V17L4.5 12.5H12L0 0Z"
          fill={colors.fill}
          stroke="black"
          strokeWidth="1.5"
        />
      </svg>
      <span className={cn(
        "mt-1.5 px-2 py-0.5 rounded-[4px] border border-black font-mono text-[10px] font-semibold tracking-[0.5px] shadow-[2px_2px_0px_#000] select-none",
        colors.bg,
        colors.text
      )}>
        {name}
      </span>
    </div>
  );
}

function FigmaComment({ x, y, user, role, comment, avatar }: { x: string | number; y: string | number; user: string; role: string; comment: string; avatar: string }) {
  return (
    <div
      className="absolute z-40 group select-none hidden md:block"
      style={{ left: x, top: y }}
    >
      <div className="relative cursor-pointer flex items-center justify-center w-7.5 h-7.5 rounded-full rounded-tl-none bg-[#ffffff] border-2 border-black hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0px_#000] group-hover:shadow-[3px_3px_0px_#000]">
        <span className="font-mono text-[10px] font-black text-black">💬</span>
        
        <div className="absolute top-9 left-0 w-[260px] bg-white border-2 border-black rounded-[12px] p-4 shadow-[6px_6px_0px_#000] scale-0 origin-top-left group-hover:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-50 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#e6e6e6]">
            <div className="size-7 rounded-full bg-black text-white flex items-center justify-center font-mono text-[10px] font-bold">
              {avatar}
            </div>
            <div>
              <p className="text-[12px] font-bold text-black leading-none">{user}</p>
              <p className="text-[9px] font-mono tracking-[0.5px] uppercase text-black/55 mt-0.5">{role}</p>
            </div>
          </div>
          <p className="text-[13px] font-sans font-light leading-relaxed text-black/85">
            {comment}
          </p>
          <div className="flex gap-1.5 items-center pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1ea64a] animate-pulse" />
            <span className="font-mono text-[9px] text-black/40 uppercase">Faculty Pin</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingClient({ isLoggedIn, dashboardPath }: LandingClientProps) {
  // Testimonials state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Interactive mockup checklist state
  const [checklist, setChecklist] = useState([true, true, false]);

  // Scroll animation state for page header
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleChecklistItem = (idx: number) => {
    setChecklist(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  // Interactive Showcase Workspace State
  const [activeTab, setActiveTab] = useState<"student" | "faculty" | "viva">("student");
  const [terminalInput, setTerminalInput] = useState("");
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState(1);
  const [milestoneProgresses, setMilestoneProgresses] = useState<Record<number, number>>({
    0: 100,
    1: 35,
    2: 0
  });
  const [milestoneLogs, setMilestoneLogs] = useState<Record<number, Array<{ id: string; msg: string; time: string }>>>({
    0: [
      { id: "a1b2c3d", msg: "docs: outline thesis proposal layout", time: "3 days ago" },
      { id: "e5f6g7h", msg: "docs: review literature bibliography citations", time: "4 days ago" }
    ],
    1: [
      { id: "e6f4a8b", msg: "feat: setup neon database client", time: "2 hours ago" },
      { id: "3f9c2d1", msg: "docs: add initial IEEE paper draft outline", time: "5 hours ago" }
    ],
    2: []
  });
  
  // Faculty grading state
  const [facultyGrade, setFacultyGrade] = useState(7.5);
  const [isApproved, setIsApproved] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<"Apollo" | "Orion" | "Phoenix">("Apollo");

  // AI Viva simulator state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [vivaScore, setVivaScore] = useState(8.5);

  // Marketplace states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [activeProblemDetail, setActiveProblemDetail] = useState<any>(null);

  // Integrations states
  const [hoveredIntegration, setHoveredIntegration] = useState<any>(null);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const hash = Math.random().toString(16).substring(2, 9);
    const newCommit = { id: hash, msg: terminalInput.trim(), time: "Just now" };
    
    setMilestoneLogs(prev => ({
      ...prev,
      [selectedMilestoneIdx]: [newCommit, ...prev[selectedMilestoneIdx]]
    }));
    setMilestoneProgresses(prev => ({
      ...prev,
      [selectedMilestoneIdx]: Math.min(prev[selectedMilestoneIdx] + 15, 100)
    }));
    setTerminalInput("");
  };

  const handleVivaAnswer = (idx: number) => {
    setSelectedAnswer(idx);
    if (idx === 0) {
      setVivaScore(9.8);
    } else {
      setVivaScore(4.2);
    }
  };

  const marqueeText = "• ACADEMIC OPERATIONS • AUTOMATED VIVA SIMULATIONS • METRIC SYNCHRONIZATION • IEEE COMPLIANT WRITER • PROBLEM STATEMENT MARKETPLACE ";

  const features = [
    {
      title: "Problem Marketplace",
      description: "Browse vetted engineering, AI/ML, and IoT problem statements compiled by industry leaders and research mentors.",
      icon: Compass,
      eyebrow: "01 / EXPLORE"
    },
    {
      title: "Guided IEEE Workspace",
      description: "Draft sections with built-in reference engines, section guides, and checklist validation to match IEEE formatting rules.",
      icon: FileText,
      eyebrow: "02 / BUILD"
    },
    {
      title: "Viva Defense Simulator",
      description: "Rehearse presentation defense rounds. Answer committee prompts on architecture, database indexes, and scaling tradeoffs.",
      icon: Presentation,
      eyebrow: "03 / REHEARSE"
    },
    {
      title: "Dynamic Submissions",
      description: "Manage weekly updates, code repositories, and hosted preview deployments under review channels.",
      icon: Boxes,
      eyebrow: "04 / PRESENT"
    },
  ];

  const PROBLEM_LISTINGS = [
    {
      id: "ps-1",
      title: "AI-Powered Distributed Fraud Detection Pipeline",
      category: "AI/ML",
      difficulty: "Advanced",
      domain: "FinTech Security",
      source: "Industry",
      desc: "Deploy a distributed machine learning pipeline for real-time inference on high-frequency transactions with drift monitoring.",
      outcome: "Validated PyTorch pipeline with Kafka streaming integration, Evidently AI drift logs, and less than 15ms latency.",
      relevance: "Used by real credit issuers to detect credential stuffings and card testing runs dynamically."
    },
    {
      id: "ps-2",
      title: "IoT Smart Energy Grid Load Balancer",
      category: "IoT",
      difficulty: "Intermediate",
      domain: "Energy Systems",
      source: "Research Lab",
      desc: "Build a microcontroller-firmware driver to adjust grid load balancing protocols based on thermal limits.",
      outcome: "Firmware client listening to Modbus signals with WebAssembly analytics visualization dashboards.",
      relevance: "Bridges the gap between physical sensors and automated telemetry in urban renewable energy microgrids."
    },
    {
      id: "ps-3",
      title: "HIPAA-Compliant Encrypted Health Records API",
      category: "Cybersecurity",
      difficulty: "Advanced",
      domain: "Healthcare IT",
      source: "Industry",
      desc: "Design double-entry cryptographic audit logs to verify patient record access under zero-trust parameters.",
      outcome: "Go REST API utilizing AES-GCM encryption, JWT authorization controls, and auditable history ledgers.",
      relevance: "Meets hospital compliance baselines for preventing internal nurse credential leaks."
    },
    {
      id: "ps-4",
      title: "Serverless Edge Database Routing Proxy",
      category: "Cloud & DevOps",
      difficulty: "Intermediate",
      domain: "Infrastructure Systems",
      source: "Academic",
      desc: "Create an edge router that forwards connections to regional read-replicas depending on geographic location.",
      outcome: "Rust-based proxy that handles database connection pools on Cloudflare Workers with minimal latency.",
      relevance: "Improves global database access speeds and decreases concurrency locks during heavy reviews."
    },
    {
      id: "ps-5",
      title: "Autonomous Drone Navigation Under GPS Denial",
      category: "IoT",
      difficulty: "Advanced",
      domain: "Robotics & CV",
      source: "Research Lab",
      desc: "Train a computer vision model on visual inertial odometry to safely land drones when GPS coordinates drop.",
      outcome: "ROS2 node evaluating stereo video feed inputs with obstacle detection accuracy exceeding 95%.",
      relevance: "Essential for search and rescue operations inside dense forest or GPS-denied caverns."
    },
    {
      id: "ps-6",
      title: "Ad-Block Detection and Analytics Engine",
      category: "Cloud & DevOps",
      difficulty: "Beginner",
      domain: "Web Operations",
      source: "Academic",
      desc: "Deploy a lightweight client checker to monitor how browser ad-blockers affect analytics tracker execution rates.",
      outcome: "JavaScript telemetry snippet sending zero-cookie logs to a Next.js serverless database collector.",
      relevance: "Helps publishers understand real session traffic volume offsets without invading user privacy."
    }
  ];

  const filteredProblems = PROBLEM_LISTINGS.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const destinationPath = isLoggedIn && dashboardPath ? dashboardPath : "/auth/login";

  return (
    <div className="relative min-h-screen bg-[#ffffff] text-[#000000] font-sans antialiased overflow-x-hidden selection:bg-black/10 selection:text-[#000000]">
      
      {/* 1. Header Navigation (56px) */}
      <motion.header
        className={cn(
          "sticky z-50 flex items-center transition-all duration-300 left-0 right-0",
          scrolled 
            ? "top-3 mx-auto w-[92%] max-w-[800px] h-[50px] bg-white/90 rounded-full border-2 border-black shadow-[4px_4px_0px_#000] backdrop-blur-md px-4"
            : "top-0 w-full h-[56px] bg-[#ffffff]/80 border-b border-[#e6e6e6] backdrop-blur-md px-6"
        )}
        layout
      >
        <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Orbit className="size-4.5 text-[#000000]" />
            <span className="font-display font-semibold text-[18px] tracking-tight text-[#000000]">
              JetLabs
            </span>
            {!scrolled && (
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono tracking-[0.5px] uppercase border border-black/10 px-2 py-0.5 rounded-[4px] ml-2 select-none bg-[#f7f7f5]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1ea64a] animate-pulse" />
                <span>AOIP ACTIVE</span>
              </div>
            )}
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href={destinationPath}
              className="text-[14.5px] font-medium tracking-tight py-1.5 px-3 rounded-full hover:bg-[#f7f7f5] transition-colors"
            >
              Career
            </Link>
            
            <div className="flex items-center gap-2">
              {!scrolled && (
                <Link
                  href="/auth/login"
                  className="hidden md:inline-block rounded-[50px] bg-[#ffffff] text-[#000000] text-[14px] font-medium pt-1.5 pb-2 px-4 border border-black hover:scale-[0.98] transition-transform active:scale-[0.95]"
                >
                  Explore Problems
                </Link>
              )}
              <Link
                href="/auth/login"
                className={cn(
                  "rounded-[50px] text-[14px] font-medium hover:scale-[0.98] transition-transform active:scale-[0.95]",
                  scrolled 
                    ? "bg-black text-white py-1.5 px-4"
                    : "bg-black text-white py-2 px-5"
                )}
              >
                login/Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* 2. Scrolling Marquee Ribbon (36px) */}
      <div className="bg-[#000000] text-[#ffffff] h-[36px] overflow-hidden flex items-center relative select-none z-10">
        <div className="w-full flex whitespace-nowrap">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            className="flex gap-4 font-mono text-[12px] uppercase tracking-[0.60px] whitespace-nowrap"
          >
            <span>{marqueeText.repeat(8)}</span>
          </motion.div>
        </div>
      </div>

      {/* 3. Hero Section (White Canvas) */}
      <section className="relative py-24 px-6 max-w-[1280px] mx-auto text-center overflow-hidden">
        <MultiplayerCursor x="22%" y="55%" name="Tarak (Student)" color="pink" />
        <MultiplayerCursor x="78%" y="45%" name="Dr. Nisha (Advisor)" color="violet" />
        <div className="max-w-[950px] mx-auto flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f7f7f5] px-4 py-1.5 text-[12px] font-mono tracking-[0.60px] text-black uppercase mb-8 select-none">
            <Sparkles className="size-3.5 text-black" />
            Academic Operations & Research Intelligence
          </div>

          <h1 className="font-display text-5xl md:text-[86px] font-normal leading-[1.0] tracking-[-1.72px] text-black max-w-[850px] mx-auto select-none">
            Deploy Excellence. <br className="hidden md:inline" />
            Streamline Innovation.
          </h1>

          <p className="font-sans text-[18px] md:text-[20px] font-light leading-[1.45] tracking-[-0.26px] max-w-[680px] mx-auto mt-8 text-black/90">
            JetLabs bridges the gap between codebase activity and academic evaluations. Orchestrate engineering cohorts, automate milestone grading, and simulate board defenses inside a unified platform.
          </p>

          <div className="flex flex-wrap gap-4 pt-10 justify-center">
            <Link
              href={destinationPath}
              className="rounded-[50px] bg-[#000000] text-[#ffffff] text-[20px] font-medium leading-[1.40] tracking-[-0.10px] py-[12px] px-[24px] flex items-center gap-2 hover:scale-[0.98] transition-transform active:scale-[0.95]"
            >
              {isLoggedIn ? "Enter Workspace" : "Claim Workspace"}
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/auth/login"
              className="rounded-[50px] bg-[#ffffff] text-[#000000] text-[20px] font-medium leading-[1.40] tracking-[-0.10px] pt-[10px] pb-[12px] px-[22px] border border-black hover:scale-[0.98] transition-transform active:scale-[0.95]"
            >
              Explore Vetted Problems
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-6 md:gap-16 border-t border-[#e6e6e6] pt-12 mt-20 w-full max-w-[700px]">
            <CountUpMetric value="42" label="Innovation Teams" suffix="+" />
            <CountUpMetric value="128" label="Research Papers" suffix="+" />
            <CountUpMetric value="9.4" label="Viva Defense Avg" suffix="/10" />
          </div>

        </div>
      </section>

      {/* 3.5 Interactive Dashboard Showcase */}
      <section className="py-24 border-t border-[#e6e6e6] bg-[#f7f7f5] relative px-6 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
        
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="text-center max-w-[750px] mx-auto mb-12">
            <p className="font-mono text-[14px] tracking-[0.54px] uppercase text-black mb-2 select-none">
              LIVE PLATFORM DEMO
            </p>
            <h2 className="font-display text-[36px] md:text-[64px] font-normal leading-[1.1] tracking-[-0.96px] text-black">
              Interact with the Workspace.
            </h2>
            <p className="font-sans text-[18px] font-light leading-[1.45] text-black/80 mt-4">
              Toggle between views to see how JetLabs synchronizes development commits, facilitates faculty grading, and prepares students for defense panels.
            </p>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 bg-[#ffffff] border-2 border-black rounded-[50px] shadow-[4px_4px_0px_#000]">
              <button
                onClick={() => setActiveTab("student")}
                className={cn(
                  "rounded-[50px] text-[15px] font-semibold py-2.5 px-6 transition-all",
                  activeTab === "student" ? "bg-black text-white" : "text-black hover:bg-[#f7f7f5]"
                )}
              >
                Student Workspace
              </button>
              <button
                onClick={() => setActiveTab("faculty")}
                className={cn(
                  "rounded-[50px] text-[15px] font-semibold py-2.5 px-6 transition-all",
                  activeTab === "faculty" ? "bg-black text-white" : "text-black hover:bg-[#f7f7f5]"
                )}
              >
                Faculty Review Queue
              </button>
              <button
                onClick={() => setActiveTab("viva")}
                className={cn(
                  "rounded-[50px] text-[15px] font-semibold py-2.5 px-6 transition-all",
                  activeTab === "viva" ? "bg-black text-white" : "text-black hover:bg-[#f7f7f5]"
                )}
              >
                AI Viva Board
              </button>
            </div>
          </div>

          {/* Desktop Showcase Window */}
          <div className="w-full max-w-[1050px] mx-auto border-2 border-black rounded-[16px] bg-[#ffffff] overflow-hidden shadow-[8px_8px_0px_#000] relative">
            {/* Collaborative Figma Overlays */}
            {activeTab === "student" && (
              <>
                <MultiplayerCursor x="82%" y="30%" name="Sanjay (Mentor)" color="green" />
                <FigmaComment
                  x="44%"
                  y="48%"
                  user="Dr. Nisha Varma"
                  role="Adviser / Dean"
                  avatar="NV"
                  comment="Check your connection pool limits in schema.prisma before finalizing Milestone 2!"
                />
              </>
            )}
            {activeTab === "faculty" && (
              <>
                <MultiplayerCursor x="46%" y="78%" name="Tarak (Student)" color="pink" />
                <FigmaComment
                  x="56%"
                  y="26%"
                  user="Sanjay Gupta"
                  role="CTO & Industry Mentor"
                  avatar="SG"
                  comment="This zero-trust connection pooler is clean. Fits industrial database security standards perfectly."
                />
              </>
            )}
            {activeTab === "viva" && (
              <>
                <MultiplayerCursor x="78%" y="28%" name="Dr. Nisha (Advisor)" color="violet" />
                <FigmaComment
                  x="48%"
                  y="55%"
                  user="Dr. Nisha Varma"
                  role="Adviser / Dean"
                  avatar="NV"
                  comment="This answer choice connects well to core database constraints. Nice job!"
                />
              </>
            )}
            {/* Browser Header Chrome */}
            <div className="bg-[#f7f7f5] border-b-2 border-black px-6 py-4 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400 border border-black/10" />
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-black/10" />
                <span className="w-3.5 h-3.5 rounded-full bg-green-400 border border-black/10" />
              </div>
              <div className="w-[300px] sm:w-[500px] py-1 px-4 bg-[#ffffff] border border-black/20 rounded-[6px] text-[12px] font-mono text-center text-black/50 select-none truncate">
                {activeTab === "student" && "app.jetlabs.io/student/dashboard"}
                {activeTab === "faculty" && "app.jetlabs.io/faculty/review-queue"}
                {activeTab === "viva" && "app.jetlabs.io/student/viva-simulator"}
              </div>
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center font-mono text-[10px] font-bold uppercase">
                {activeTab === "faculty" ? "FC" : "ST"}
              </div>
            </div>

            {/* Showcase Workspace Content */}
            <div className="p-6 md:p-8 min-h-[460px] flex flex-col lg:flex-row gap-8">
              <AnimatePresence mode="wait">
                {activeTab === "student" && (
                  <motion.div
                    key="student-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex flex-col lg:flex-row gap-8"
                  >
                    {/* Left Panel: Web IDE Code Editor */}
                    <div className="w-full lg:w-1/2 flex flex-col">
                      <div className="bg-[#18181c] rounded-[12px] border-2 border-black flex flex-col overflow-hidden text-white font-mono text-[13px] relative h-[420px] shadow-[4px_4px_0px_#000]">
                        
                        {/* Editor Tab Bar */}
                        <div className="h-[38px] bg-[#0f0f12] border-b border-black flex items-center justify-between px-3 text-[11px]">
                          <div className="flex gap-1">
                            {STUDENT_MILESTONES.map((ms, idx) => {
                              const isActive = selectedMilestoneIdx === idx;
                              return (
                                <button
                                  key={ms.id}
                                  onClick={() => setSelectedMilestoneIdx(idx)}
                                  className={cn(
                                    "px-3 py-2 flex items-center gap-1.5 rounded-t-[6px] border-x border-t border-transparent transition-all",
                                    isActive
                                      ? "bg-[#18181c] border-black text-[#50fa7b] font-bold"
                                      : "text-white/40 hover:text-white/80 hover:bg-[#1f1f25]"
                                  )}
                                >
                                  <span className="text-[10px]">
                                    {idx === 0 ? "📄" : idx === 1 ? "◭" : "⚡"}
                                  </span>
                                  <span>{ms.fileName.split("/")[1]}</span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-white/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1ea64a] animate-pulse" />
                            <span className="font-mono text-[10px] tracking-[0.5px] uppercase">LIVE RUNNER</span>
                          </div>
                        </div>

                        {/* File Explorer + Editor Body */}
                        <div className="flex-1 flex overflow-hidden">
                          {/* Sidebar Folder Structure */}
                          <div className="w-[125px] bg-[#121215] border-r border-black p-3 space-y-3.5 hidden sm:block select-none text-[11px] text-white/45">
                            <div>
                              <p className="font-mono text-[9px] font-black uppercase text-white/25 tracking-[0.5px]">
                                Apollo Project
                              </p>
                              <div className="mt-2 space-y-1.5">
                                <div className="text-white/60 font-semibold flex items-center gap-1">
                                  <span>📁</span> <span>docs/</span>
                                </div>
                                <button
                                  onClick={() => setSelectedMilestoneIdx(0)}
                                  className={cn(
                                    "pl-4 flex items-center gap-1 w-full text-left transition-colors",
                                    selectedMilestoneIdx === 0 ? "text-[#50fa7b] font-bold" : "hover:text-white/80"
                                  )}
                                >
                                  <span>📄</span> <span>thesis.tex</span>
                                </button>
                                
                                <div className="text-white/60 font-semibold flex items-center gap-1 pt-1">
                                  <span>📁</span> <span>src/</span>
                                </div>
                                <button
                                  onClick={() => setSelectedMilestoneIdx(1)}
                                  className={cn(
                                    "pl-4 flex items-center gap-1 w-full text-left transition-colors",
                                    selectedMilestoneIdx === 1 ? "text-[#50fa7b] font-bold" : "hover:text-white/80"
                                  )}
                                >
                                  <span>◭</span> <span>schema.prisma</span>
                                </button>
                                <button
                                  onClick={() => setSelectedMilestoneIdx(2)}
                                  className={cn(
                                    "pl-4 flex items-center gap-1 w-full text-left transition-colors",
                                    selectedMilestoneIdx === 2 ? "text-[#50fa7b] font-bold" : "hover:text-white/80"
                                  )}
                                >
                                  <span>⚡</span> <span>server.ts</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Code View Editor */}
                          <div className="flex-1 bg-[#18181c] p-4 overflow-y-auto select-text scrollbar-subtle relative">
                            {renderCodeContent(selectedMilestoneIdx)}
                          </div>
                        </div>

                        {/* Interactive Terminal Simulator panel */}
                        <div className="bg-[#0b0b0d] border-t-2 border-black p-3.5 flex flex-col justify-between min-h-[135px]">
                          <div className="font-mono text-[11px] space-y-1 overflow-y-auto select-none">
                            <div className="flex justify-between items-center text-white/30 text-[9px] uppercase tracking-[0.5px]">
                              <span>Console log terminal</span>
                              <span>student@jetlabs-dev:~</span>
                            </div>
                            <p className="text-white/50">
                              $ git status -s
                            </p>
                            <p className="text-[#50fa7b]">
                              M  {STUDENT_MILESTONES[selectedMilestoneIdx].fileName} (Synchronizing milestone metrics...)
                            </p>
                          </div>

                          {/* Action input */}
                          <form onSubmit={handleTerminalSubmit} className="mt-2 border-t border-white/10 pt-2">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-[6px]">
                              <span className="text-white/40 font-semibold select-none text-[12px]">$</span>
                              <input
                                type="text"
                                value={terminalInput}
                                onChange={(e) => setTerminalInput(e.target.value)}
                                placeholder={`git commit -m "update ${STUDENT_MILESTONES[selectedMilestoneIdx].fileName.split("/")[1]}"`}
                                className="bg-transparent text-[#ffffff] outline-none border-none ring-0 w-full text-[12px] font-mono placeholder-white/25"
                              />
                              <button
                                type="submit"
                                className="bg-[#50fa7b] text-black text-[11px] font-bold px-3 py-1 rounded-[4px] hover:scale-[0.98] transition-transform select-none"
                              >
                                Push
                              </button>
                            </div>
                          </form>
                        </div>

                      </div>
                    </div>

                    {/* Right Panel: Student Dashboard Preview */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-between gap-6 min-h-[420px]">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[12px] font-mono tracking-[0.6px] text-black/60 uppercase">
                            STUDENT WORKSPACE
                          </span>
                          <h3 className="text-[26px] font-bold tracking-tight text-black mt-1">
                            Weekly Milestone Feed
                          </h3>
                        </div>

                        {/* Milestone Selector List */}
                        <div className="space-y-2">
                          <p className="font-mono text-[10px] tracking-[0.5px] text-black/55 uppercase font-bold">
                            Active Milestones:
                          </p>
                          <div className="space-y-2">
                            {STUDENT_MILESTONES.map((ms, idx) => {
                              const isSelected = selectedMilestoneIdx === idx;
                              const progress = milestoneProgresses[idx];
                              return (
                                <button
                                  key={ms.id}
                                  onClick={() => setSelectedMilestoneIdx(idx)}
                                  className={cn(
                                    "w-full text-left p-3 border-2 rounded-[12px] transition-all flex flex-col justify-between gap-2 active:scale-[0.99]",
                                    isSelected 
                                      ? "bg-black border-black text-white shadow-[4px_4px_0px_#000]"
                                      : "bg-white border-[#e6e6e6] text-black hover:border-black"
                                  )}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span className="font-display font-semibold text-[14.5px]">
                                      {ms.title}
                                    </span>
                                    <span className={cn(
                                      "font-mono text-[11.5px] font-bold",
                                      isSelected ? "text-[#50fa7b]" : "text-black/60"
                                    )}>
                                      {progress}%
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-black/5">
                                    <div
                                      style={{ width: `${progress}%` }}
                                      className={cn(
                                        "h-full transition-all duration-300",
                                        isSelected ? "bg-[#50fa7b]" : "bg-black"
                                      )}
                                    />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Commits logs for current milestone */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-[10px] tracking-[0.5px] text-black/50 uppercase font-bold">
                            SYNCHRONIZED COMMITS ({milestoneLogs[selectedMilestoneIdx].length})
                          </p>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {milestoneLogs[selectedMilestoneIdx].length > 0 ? (
                            milestoneLogs[selectedMilestoneIdx].map((c) => (
                              <div
                                key={c.id}
                                className="flex items-center justify-between p-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[13px] hover:border-black transition-colors"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="font-mono text-[10px] bg-[#f7f7f5] border border-black/10 px-1.5 py-0.5 rounded text-black font-semibold">
                                    {c.id}
                                  </span>
                                  <span className="font-medium text-black truncate">{c.msg}</span>
                                </div>
                                <span className="text-[11px] text-black/55 shrink-0 ml-2">{c.time}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 bg-[#f7f7f5] border border-dashed border-[#e6e6e6] rounded-[8px] text-[12px] text-black/45">
                              No commits pushed yet for this milestone
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "faculty" && (
                  <motion.div
                    key="faculty-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex flex-col lg:flex-row gap-8"
                  >
                    {/* Left Panel: Review Diff File list & Team Selector */}
                    <div className="w-full lg:w-1/2 space-y-4">
                      <div>
                        <span className="text-[12px] font-mono tracking-[0.6px] text-black/60 uppercase">
                          FACULTY EVALUATION QUEUE
                        </span>
                        <h3 className="text-[26px] font-bold tracking-tight text-black mt-1">
                          Submission review
                        </h3>
                      </div>

                      {/* Team Selector Switcher */}
                      <div className="space-y-2">
                        <p className="font-mono text-[11px] text-black/55 uppercase tracking-[0.5px]">
                          SELECT ENGINEERING TEAM TO EVALUATE:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(["Apollo", "Orion", "Phoenix"] as const).map((teamKey) => (
                            <button
                              key={teamKey}
                              onClick={() => {
                                setSelectedTeam(teamKey);
                                setIsApproved(false);
                              }}
                              className={cn(
                                "text-[12.5px] font-mono font-semibold px-4 py-2 rounded-[50px] border transition-all active:scale-95",
                                selectedTeam === teamKey
                                  ? "bg-black border-black text-white"
                                  : "bg-white border-[#e6e6e6] text-black hover:border-black"
                              )}
                            >
                              {TEAM_DATASETS[teamKey].name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display Selected Team Details */}
                      <div className="border border-black rounded-[8px] bg-[#f7f7f5] overflow-hidden">
                        <div className="bg-white border-b border-black p-3.5 flex justify-between items-center text-[13px] font-mono text-black/60">
                          <span className="uppercase tracking-[0.5px] font-bold">
                            {TEAM_DATASETS[selectedTeam].category}
                          </span>
                          <span className="text-black font-semibold">
                            {TEAM_DATASETS[selectedTeam].activeMilestone}
                          </span>
                        </div>
                        <div className="divide-y divide-[#e6e6e6] bg-white">
                          {TEAM_DATASETS[selectedTeam].files.map((file, i) => (
                            <div key={i} className="p-3.5 flex items-center justify-between text-[14px]">
                              <div className="flex items-center gap-2.5">
                                <FileText className="size-4 text-black/60" />
                                <span className="font-medium text-black">{file.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-[12px] text-black/65">{file.changes}</span>
                                <span className="text-[11px] font-mono uppercase bg-black text-white px-2 py-0.5 rounded">
                                  {file.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Morphing SVG chart & Approval */}
                    {(() => {
                      const commits = TEAM_DATASETS[selectedTeam].commitsWeekly;
                      const y0 = 100 - commits[0] * 1.2;
                      const y1 = 100 - commits[1] * 1.2;
                      const y2 = 100 - commits[2] * 1.2;
                      const y3 = 100 - commits[3] * 1.2;
                      const y4 = 100 - commits[4] * 1.2;
                      const y5 = 100 - commits[5] * 1.2;

                      return (
                        <div className="w-full lg:w-1/2 space-y-6 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center bg-[#f7f7f5] border border-black/10 p-4 rounded-[8px]">
                              <div>
                                <p className="font-mono text-[11px] tracking-[0.5px] text-black/60 uppercase">
                                  TEAM HEALTH INDEX
                                </p>
                                <p className="text-[32px] font-display font-semibold mt-1">
                                  {TEAM_DATASETS[selectedTeam].healthScore.toFixed(1)} <span className="text-[18px] text-black/50">/ 10</span>
                                </p>
                              </div>
                              <span className="text-[12px] font-mono font-semibold bg-black text-white px-3 py-1 rounded-[50px]">
                                {TEAM_DATASETS[selectedTeam].backlogs > 0 ? "BACKLOG RISKS" : "COMMIT STATUS: ACTIVE"}
                              </span>
                            </div>

                            {/* Live SVG Charting */}
                            <div className="border border-black/15 p-4 rounded-[8px] bg-white space-y-3">
                              <div className="flex justify-between items-center border-b border-[#e6e6e6] pb-2">
                                <span className="font-mono text-[11px] uppercase text-black/55 tracking-[0.5px]">
                                  6-WEEK GIT COMMIT VELOCITY
                                </span>
                                <span className="text-[13px] font-mono font-semibold text-black">
                                  TOTAL COMMITS: {commits.reduce((a, b) => a + b, 0)}
                                </span>
                              </div>
                              
                              <div className="relative pt-2">
                                <svg className="w-full overflow-visible" height="110" viewBox="0 0 300 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  {/* Grid lines */}
                                  <line x1="20" y1="20" x2="280" y2="20" stroke="#f1f1f1" strokeWidth="1" />
                                  <line x1="20" y1="60" x2="280" y2="60" stroke="#f1f1f1" strokeWidth="1" />
                                  <line x1="20" y1="100" x2="280" y2="100" stroke="#e6e6e6" strokeWidth="1.5" />
                                  
                                  {/* Shaded Area */}
                                  <path
                                    d={`M 20,100 L 20,${y0} L 72,${y1} L 124,${y2} L 176,${y3} L 228,${y4} L 280,${y5} L 280,100 Z`}
                                    fill="rgba(0,0,0,0.04)"
                                  />
                                  
                                  {/* Line Path */}
                                  <motion.path
                                    animate={{ d: `M 20,${y0} L 72,${y1} L 124,${y2} L 176,${y3} L 228,${y4} L 280,${y5}` }}
                                    transition={{ duration: 0.35, ease: "easeInOut" }}
                                    stroke="black"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  
                                  {/* Dots */}
                                  {[y0, y1, y2, y3, y4, y5].map((y, idx) => (
                                    <motion.circle
                                      key={idx}
                                      cx={20 + idx * 52}
                                      animate={{ cy: y }}
                                      transition={{ duration: 0.35, ease: "easeInOut" }}
                                      r="4.5"
                                      fill="white"
                                      stroke="black"
                                      strokeWidth="2"
                                    />
                                  ))}
                                </svg>
                                <div className="flex justify-between px-3 text-[11px] font-mono text-black/45 mt-2">
                                  <span>Wk 1</span>
                                  <span>Wk 2</span>
                                  <span>Wk 3</span>
                                  <span>Wk 4</span>
                                  <span>Wk 5</span>
                                  <span>Wk 6</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Approval Trigger */}
                          <button
                            onClick={() => setIsApproved(!isApproved)}
                            className={cn(
                              "w-full rounded-[50px] font-semibold text-[16px] py-4 transition-all flex items-center justify-center gap-2 border-2 border-black active:scale-[0.98]",
                              isApproved
                                ? "bg-[#1ea64a] text-white border-[#1ea64a] shadow-[4px_4px_0px_#000]"
                                : "bg-black text-white shadow-[4px_4px_0px_#000]"
                            )}
                          >
                            {isApproved ? (
                              <>
                                <Check className="size-5" />
                                {TEAM_DATASETS[selectedTeam].name} Milestone Sync Saved to Neon
                              </>
                            ) : (
                              `Approve ${TEAM_DATASETS[selectedTeam].name} Submission`
                            )}
                          </button>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {activeTab === "viva" && (
                  <motion.div
                    key="viva-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex flex-col lg:flex-row gap-8"
                  >
                    {/* Left Panel: Dialogue choices */}
                    <div className="w-full lg:w-1/2 space-y-4">
                      <div>
                        <span className="text-[12px] font-mono tracking-[0.6px] text-black/60 uppercase">
                          AI VIVA REHEARSAL COMMITTEE
                        </span>
                        <h3 className="text-[26px] font-bold tracking-tight text-black mt-1">
                          Technical Rehearsal
                        </h3>
                      </div>

                      <div className="bg-black/5 border border-black/10 rounded-[12px] p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="size-9 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                            <Orbit className="size-4 animate-spin-slow" />
                          </div>
                          <div className="bg-white border border-black rounded-[8px] p-4 text-[14px] leading-relaxed text-black shadow-sm">
                            "Explain how your Next.js and Prisma config prevents connection pool saturation during peak evaluation hours."
                          </div>
                        </div>

                        {/* Interactive responses */}
                        <div className="space-y-2 pt-2">
                          {[
                            "Deploy a serverless connection pooler (e.g. pgBouncer or Neon connection pool) with tight transaction locks.",
                            "Avoid scaling database targets and listen to prisma logs via local command line setups.",
                            "Share public database connection strings directly in the front-end client packages for fast execution."
                          ].map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleVivaAnswer(idx)}
                              className={cn(
                                "w-full text-left p-3.5 border rounded-[8px] text-[13.5px] transition-all hover:bg-white",
                                selectedAnswer === idx
                                  ? idx === 0
                                    ? "bg-emerald-50 border-[#1ea64a] text-black font-semibold ring-1 ring-[#1ea64a]"
                                    : "bg-red-50 border-red-400 text-black font-semibold ring-1 ring-red-400"
                                  : "bg-white border-[#e6e6e6] text-black/80 hover:border-black"
                              )}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="font-mono font-bold text-[13px] bg-[#f7f7f5] border border-black/10 px-1.5 py-0.5 rounded text-black shrink-0">
                                  Option {String.fromCharCode(65 + idx)}
                                </span>
                                <span>{option}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Grading evaluation feedback */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="bg-black text-white rounded-[12px] p-6 text-center space-y-2 border-2 border-black shadow-[4px_4px_0px_#000]">
                          <p className="font-mono text-[11px] tracking-[0.5px] text-white/50 uppercase">
                            AI READINESS EVALUATION
                          </p>
                          <motion.p
                            key={vivaScore}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-[48px] font-display font-bold"
                          >
                            {vivaScore.toFixed(1)} <span className="text-[20px] text-white/40">/ 10</span>
                          </motion.p>
                          <p className="text-[12px] text-white/70">
                            {selectedAnswer === null
                              ? "Awaiting answer choice..."
                              : selectedAnswer === 0
                              ? "Excellent validation response. Rehearsal rating high."
                              : "Critical failure. Insecure configuration choice."}
                          </p>
                        </div>

                        {/* Text explanation */}
                        <div className="border border-black/10 bg-[#f7f7f5] p-5 rounded-[8px] text-[14px] leading-relaxed text-black/75 space-y-2">
                          <p className="font-mono text-[11px] text-black/50 uppercase font-semibold">
                            AI INTERPRETATION NOTE
                          </p>
                          {selectedAnswer === null && (
                            <p>Select an option on the left to activate database compliance validator analysis.</p>
                          )}
                          {selectedAnswer === 0 && (
                            <p className="text-[#1ea64a] font-medium">
                              ✓ Correct. Connecting through specialized serverless pools ensures that fast-scaling edge functions release DB connections immediately.
                            </p>
                          )}
                          {selectedAnswer !== null && selectedAnswer !== 0 && (
                            <p className="text-red-600 font-medium">
                              ✗ Insecure. Exposing keys or letting connection limits load without pool rules causes instant database lockups during concurrent reviews.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Reset state */}
                      {selectedAnswer !== null && (
                        <button
                          onClick={() => {
                            setSelectedAnswer(null);
                            setVivaScore(8.5);
                          }}
                          className="w-full rounded-[50px] font-semibold text-[15px] py-3.5 bg-white text-black border border-black hover:bg-[#f7f7f5] transition-colors active:scale-[0.98]"
                        >
                          Retry AI Panel Challenge
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 4. White Feature Cards Grid Section */}
      <section className="py-24 border-t border-[#e6e6e6] bg-[#ffffff] px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-[18px] tracking-[0.54px] uppercase text-black mb-2 select-none">
              CORE CAPABILITIES
            </p>
            <h2 className="font-display text-[32px] md:text-[64px] font-normal leading-[1.1] tracking-[-0.96px] text-black">
              Engineered for Serious Work.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-[#f7f7f5] border border-[#e6e6e6] rounded-[8px] p-6 hover:-translate-y-1 hover:border-black transition-all duration-300 flex flex-col justify-between min-h-[240px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-[12px] tracking-[0.6px] text-black/60 uppercase">
                        {feature.eyebrow}
                      </span>
                      <Icon className="size-5 text-black" />
                    </div>
                    <h3 className="text-[24px] font-bold leading-[1.45] tracking-[0px] text-black mb-2">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-[16px] font-light leading-[1.45] text-black/85">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4.5 Student vs. Faculty Platform Capabilities (Color-Block: Cream) */}
      <section className="max-w-[1280px] mx-auto my-24 md:px-6 px-0 select-none">
        <div className="bg-[#f4ecd6] text-black md:rounded-[24px] rounded-none p-8 md:p-12">
          <div className="text-center mb-12">
            <p className="font-mono text-[14px] tracking-[0.54px] uppercase text-black/70 mb-2">
              DESIGNED FOR BOTH SIDES
            </p>
            <h2 className="font-display text-[36px] md:text-[54px] font-normal leading-[1.1] tracking-[-0.96px] text-black">
              One platform. Two unique experiences.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Student Column */}
            <div className="bg-[#ffffff] border border-black rounded-[12px] p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h3 className="text-[22px] font-bold tracking-tight">For Students</h3>
                  <p className="text-[12px] font-mono tracking-[0.6px] text-black/60 uppercase">EXECUTION & DEFENSE</p>
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  { title: "Git-Sync Progress Logs", desc: "Push commits to automatically update milestones on your dashboard. No copy-pasting code fragments or screenshots." },
                  { title: "IEEE Writing Workspace", desc: "Built-in reference validator and step-by-step drafting rules to ensure formatting compliance from day one." },
                  { title: "AI-Powered Rehearsals", desc: "Interactive Viva simulator challenges you on database index choices, server latency, and deployment setups." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-[16px] font-bold text-black/40 mt-0.5">0{i+1}</span>
                    <div>
                      <h4 className="text-[16px] font-semibold text-black">{item.title}</h4>
                      <p className="text-[14px] font-light text-black/85">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Faculty Column */}
            <div className="bg-[#ffffff] border border-black rounded-[12px] p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                  <Orbit className="size-5" />
                </div>
                <div>
                  <h3 className="text-[22px] font-bold tracking-tight">For Faculty & Mentors</h3>
                  <p className="text-[12px] font-mono tracking-[0.6px] text-black/60 uppercase">MONITORING & GRADING</p>
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  { title: "Commit Analytics Dashboard", desc: "Visualize repo velocities, branching, and individual contributions instantly without checking git manually." },
                  { title: "Centralized Review Queue", desc: "Review documents, leave annotations, and approve milestones in one batch view. No messy email threads." },
                  { title: "Backlog & Risk Alerts", desc: "AI logs analyze commits to warn advisors when a team is falling behind or showing low velocity." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-[16px] font-bold text-black/40 mt-0.5">0{i+1}</span>
                    <div>
                      <h4 className="text-[16px] font-semibold text-black">{item.title}</h4>
                      <p className="text-[14px] font-light text-black/85">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4.7 Capstone Execution Workflow (Color-Block: Pink) */}
      <section className="max-w-[1280px] mx-auto my-24 md:px-6 px-0 select-none">
        <div className="bg-[#efd4d4] text-black md:rounded-[24px] rounded-none p-8 md:p-12 relative overflow-hidden">
          {/* Curved connection vector path connecting workflow step nodes */}
          <div className="hidden xl:block absolute top-[220px] left-[15%] right-[15%] h-[20px] pointer-events-none z-0">
            <svg className="w-full overflow-visible" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 10,20 Q 200,60 400,20 T 800,20"
                stroke="black"
                strokeWidth="2"
                strokeDasharray="6 6"
                className="opacity-25"
              />
            </svg>
          </div>
          
          <div className="text-center mb-12 relative z-10">
            <p className="font-mono text-[14px] tracking-[0.54px] uppercase text-black/70 mb-2">
              HOW IT WORKS
            </p>
            <h2 className="font-display text-[36px] md:text-[54px] font-normal leading-[1.1] tracking-[-0.96px] text-black">
              The 4-Step Capstone Lifecycle.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-4 relative z-10">
            {[
              {
                step: "01",
                title: "Vetted Matching",
                desc: "Choose a pre-approved problem statement or pitch a custom design to academic mentors.",
                icon: Compass
              },
              {
                step: "02",
                title: "Git Integration",
                desc: "Connect your repo. Our engine synchronizes commits to track milestone progress automatically.",
                icon: Code
              },
              {
                step: "03",
                title: "Review Checks",
                desc: "Faculty evaluates weekly submissions, registers score metrics, and signs off on steps.",
                icon: FileText
              },
              {
                step: "04",
                title: "Viva Defense",
                desc: "Run interactive simulator trials to prepare team members for oral examinations.",
                icon: Presentation
              }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-[#ffffff] border border-black rounded-[12px] p-6 relative flex flex-col justify-between min-h-[200px]">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-mono text-[24px] font-bold text-black/20">{item.step}</span>
                      <Icon className="size-5 text-black" />
                    </div>
                    <h3 className="text-[18px] font-bold mb-2">{item.title}</h3>
                    <p className="text-[14px] font-light leading-relaxed text-black/85">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Coral Simulator Block Section (Color-Block) */}
      <section className="max-w-[1280px] mx-auto my-24 md:px-6 px-0 select-none">
        <div className="bg-[#f3c9b6] text-black md:rounded-[24px] rounded-none p-8 md:p-12 flex flex-col lg:flex-row gap-12 items-center">
          
          <div className="w-full lg:w-1/2 space-y-6">
            <p className="font-mono text-[14px] tracking-[0.54px] uppercase text-black/70">
              VIVA DEFENSE SIMULATOR
            </p>
            <h2 className="font-display text-[36px] md:text-[54px] font-normal leading-[1.1] tracking-[-0.96px]">
              Rehearse before it counts.
            </h2>
            <p className="font-sans text-[18px] font-light leading-[1.45] text-black/90 max-w-[500px]">
              Prepare student groups for evaluation panels. The AI defense simulator evaluates repository changes and challenges team assumptions about code structure, security, and scaling trade-offs.
            </p>
            <div className="pt-2">
              <Link
                href={destinationPath}
                className="inline-flex rounded-[50px] bg-[#000000] text-[#ffffff] text-[18px] font-medium leading-[1.40] tracking-[-0.10px] py-[10px] px-[20px] hover:scale-[0.98] transition-transform active:scale-[0.95]"
              >
                Start Rehearsal
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center">
            {/* Interactive Mockup Card */}
            <div className="bg-[#ffffff] border border-black rounded-[8px] p-6 w-full max-w-[480px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-5">
              <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1ea64a] animate-pulse" />
                  <span className="font-mono text-[12px] tracking-[0.6px] uppercase text-black/60">
                    Defense Simulator
                  </span>
                </div>
                <span className="font-mono text-[12px] bg-black text-white px-2 py-0.5 rounded">
                  SCORE: 8.5/10
                </span>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[12px] text-black/55 uppercase tracking-[0.54px]">
                  PANEL INQUIRY
                </p>
                <p className="font-sans text-[16px] font-normal leading-[1.45] text-black">
                  "Explain how your neon postgres instance pools database connections during high volume evaluations."
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <p className="font-mono text-[12px] text-black/55 uppercase tracking-[0.54px] mb-3">
                  SUGGESTED CHECKS (TAP TO COMPLETE)
                </p>
                <div className="space-y-2">
                  {[
                    "Configure Neon Connection Pool Size",
                    "Introduce Serverless Edge Caching",
                    "Simulate 500 Concurrent Hits"
                  ].map((checkText, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleChecklistItem(idx)}
                      className="w-full flex items-center justify-between p-3 border border-[#e6e6e6] rounded-[6px] hover:border-black hover:bg-[#f7f7f5] transition-all text-left"
                    >
                      <span className="text-[14px] font-sans text-black">{checkText}</span>
                      <div className={cn(
                        "w-5 h-5 rounded-full border border-black flex items-center justify-center transition-colors",
                        checklist[idx] ? "bg-[#000000] border-black" : "bg-white"
                      )}>
                        {checklist[idx] && <Check className="size-3 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5.5 Integrations Hub Section (Color-Block: Mint) */}
      <section className="max-w-[1280px] mx-auto my-24 md:px-6 px-0 select-none">
        <div className="bg-[#c8e6cd] text-black md:rounded-[24px] rounded-none p-8 md:p-12 flex flex-col lg:flex-row gap-12 items-center justify-between">
          
          <div className="w-full lg:w-1/2 space-y-6">
            <p className="font-mono text-[14px] tracking-[0.54px] uppercase text-black/70">
              CONNECTIVITY FRAMEWORK
            </p>
            <h2 className="font-display text-[36px] md:text-[54px] font-normal leading-[1.1] tracking-[-0.96px]">
              Vetted Integrations. <br />
              Synchronized Codebases.
            </h2>
            <p className="font-sans text-[18px] font-light leading-[1.45] text-black/90 max-w-[500px]">
              JetLabs hooks directly into your student git repos, hosting platforms, database instances, and compilers to automate tracking and evaluations.
            </p>

            {/* Handshake Status Console */}
            <div className="bg-white border-2 border-black rounded-[12px] p-5 shadow-[4px_4px_0px_#000] min-h-[220px] flex flex-col justify-between">
              {hoveredIntegration ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                      <span className="font-mono text-[12px] tracking-[0.6px] uppercase font-bold text-black">
                        {hoveredIntegration.name} HANDSHAKE ACTIVE
                      </span>
                    </div>
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded text-white bg-black">
                      CONNECTED
                    </span>
                  </div>
                  <h4 className="text-[18px] font-bold text-black">{hoveredIntegration.title}</h4>
                  <p className="text-[14px] font-light text-black/85 leading-relaxed">
                    {hoveredIntegration.desc}
                  </p>
                  <pre className="font-mono text-[11px] text-black/60 bg-[#f7f7f5] border border-black/10 p-3 rounded-[6px] whitespace-pre-wrap">
                    {hoveredIntegration.details}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full py-8 space-y-3">
                  <Orbit className="size-8 text-black/35 animate-spin-slow" />
                  <p className="font-mono text-[11.5px] uppercase tracking-[0.5px] text-black/55 font-bold">
                    Pipeline Console Standby
                  </p>
                  <p className="text-[13.5px] font-light text-black/75 max-w-[340px]">
                    Hover over any integration node in the orbit diagram to inspect pipeline parameters and synchronization protocols.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center relative">
            <div className="w-full max-w-[420px] aspect-square bg-white border-2 border-black rounded-[16px] shadow-[6px_6px_0px_#000] p-6 flex items-center justify-center relative overflow-hidden">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />
              
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer decorative orbit ring */}
                <circle cx="200" cy="200" r="140" stroke="black" strokeWidth="1" strokeDasharray="4 8" className="opacity-15" />
                
                {/* Connection lines from orbiting nodes to center */}
                {INTEGRATIONS.map((item) => {
                  const isHovered = hoveredIntegration?.id === item.id;
                  return (
                    <motion.line
                      key={`line-${item.id}`}
                      x1={item.x}
                      y1={item.y}
                      x2="200"
                      y2="200"
                      animate={{
                        stroke: isHovered ? "black" : "#000000",
                        strokeWidth: isHovered ? 2.5 : 1.5,
                        strokeDasharray: isHovered ? "0" : "4 4"
                      }}
                      transition={{ duration: 0.2 }}
                      className={cn(isHovered ? "opacity-100" : "opacity-30")}
                    />
                  );
                })}
                
                {/* Central JetLabs Core Node */}
                <circle cx="200" cy="200" r="36" fill="white" stroke="black" strokeWidth="2" />
                <foreignObject x="176" y="176" width="48" height="48">
                  <div className="w-full h-full flex items-center justify-center bg-black rounded-full text-white">
                    <Orbit className="size-5 animate-spin-slow" />
                  </div>
                </foreignObject>
                <text x="200" y="252" textAnchor="middle" className="font-mono text-[10px] font-black uppercase fill-black tracking-[0.5px] select-none pointer-events-none">
                  JETLABS CORE
                </text>

                {/* Orbiting nodes */}
                {INTEGRATIONS.map((item) => {
                  const isHovered = hoveredIntegration?.id === item.id;
                  return (
                    <g key={item.id}>
                      {/* Hover ring */}
                      <motion.circle
                        cx={item.x}
                        cy={item.y}
                        animate={{
                          r: isHovered ? 28 : 0,
                          opacity: isHovered ? 0.15 : 0
                        }}
                        fill="black"
                        transition={{ duration: 0.2 }}
                      />
                      
                      {/* Connection node container */}
                      <circle
                        cx={item.x}
                        cy={item.y}
                        r="22"
                        fill="white"
                        stroke={isHovered ? "black" : "#000000"}
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        className="transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIntegration(item)}
                        onMouseLeave={() => setHoveredIntegration(null)}
                      />

                      {/* Icon inside node */}
                      <foreignObject
                        x={item.x - 14}
                        y={item.y - 14}
                        width="28"
                        height="28"
                        className="pointer-events-none"
                      >
                        <div className="w-full h-full flex items-center justify-center font-mono text-[15px] font-black select-none">
                          {item.icon}
                        </div>
                      </foreignObject>

                      {/* Label below/above node */}
                      <text
                        x={item.x}
                        y={item.y + 36}
                        textAnchor="middle"
                        className={cn(
                          "font-mono text-[9px] uppercase tracking-[0.5px] select-none pointer-events-none",
                          isHovered ? "font-bold fill-black" : "font-semibold fill-black/60"
                        )}
                      >
                        {item.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Lime FAQ Accordion Section (Color-Block) */}
      <section className="max-w-[1280px] mx-auto my-24 md:px-6 px-0">
        <div className="bg-[#dceeb1] text-black md:rounded-[24px] rounded-none p-8 md:p-12">
          
          <div className="text-center mb-12">
            <p className="font-mono text-[14px] tracking-[0.54px] uppercase text-black/70 mb-2">
              FREQUENTLY ASKED QUESTIONS
            </p>
            <h2 className="font-display text-[36px] md:text-[54px] font-normal leading-[1.1] tracking-[-0.96px]">
              Answers to your questions.
            </h2>
          </div>

          <div className="space-y-4 max-w-[800px] mx-auto">
            {FAQS.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-[#ffffff] border border-black rounded-[8px] overflow-hidden transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.02)]"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left text-[18px] md:text-[20px] font-semibold text-black transition hover:bg-[#f7f7f5]"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown className={cn("size-5 text-black transition-transform duration-300 shrink-0", isExpanded && "rotate-180")} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-6 pt-1 text-[16px] text-black/80 font-light leading-[1.45] border-t border-[#e6e6e6]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. Navy Testimonials Section (Color-Block) */}
      <section className="max-w-[1280px] mx-auto my-24 md:px-6 px-0">
        <div className="bg-[#1f1d3d] text-[#ffffff] md:rounded-[24px] rounded-none p-8 md:p-12 flex flex-col lg:flex-row gap-12 items-center justify-between">
          
          <div className="w-full lg:w-1/2 space-y-4">
            <p className="font-mono text-[14px] tracking-[0.54px] uppercase text-white/60">
              COMMUNITY VOICES
            </p>
            <h2 className="font-display text-[36px] md:text-[54px] font-normal leading-[1.1] tracking-[-0.96px] text-white">
              Trusted by leading universities.
            </h2>
            <p className="font-sans text-[18px] font-light leading-[1.45] text-white/80 max-w-[460px]">
              See how academic deans, advisors, and engineering teams leverage JetLabs to transform milestone tracking and presentation defenses.
            </p>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="bg-white/[0.04] border border-white/10 rounded-[16px] p-8 max-w-[500px] w-full relative min-h-[260px] flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="text-[64px] font-serif font-black select-none leading-[0] text-white/10 absolute top-8 right-8">
                  &ldquo;
                </div>
                <p className="font-sans text-[16px] md:text-[18px] font-light leading-[1.45] italic text-white/95">
                  &ldquo;{TESTIMONIALS[activeTestimonial].quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-[14px] text-white">
                    {TESTIMONIALS[activeTestimonial].avatar}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white font-display">
                      {TESTIMONIALS[activeTestimonial].name}
                    </p>
                    <p className="text-[12px] text-white/60 font-semibold">
                      {TESTIMONIALS[activeTestimonial].role}
                    </p>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTestimonial((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))}
                    className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label="Previous Testimonial"
                  >
                    <ChevronRight className="size-5 rotate-180" />
                  </button>
                  <button
                    onClick={() => setActiveTestimonial((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))}
                    className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label="Next Testimonial"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 8. Interactive Problem Marketplace Section */}
      <section className="py-24 border-t border-[#e6e6e6] bg-[#ffffff] px-6">
        <div className="max-w-[1280px] mx-auto">
          
          <div className="text-center mb-12">
            <p className="font-mono text-[18px] tracking-[0.54px] uppercase text-black mb-2 select-none">
              VETTED PROBLEM STATEMENTS
            </p>
            <h2 className="font-display text-[32px] md:text-[64px] font-normal leading-[1.1] tracking-[-0.96px] text-black">
              Explore Capstone Briefs.
            </h2>
            <p className="font-sans text-[18px] font-light leading-[1.45] text-black/85 mt-4 max-w-[650px] mx-auto">
              Search and filter pre-approved problem statements compiled by industry mentors and academic research advisors.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col xl:flex-row gap-6 mb-12 items-stretch xl:items-center justify-between bg-[#f7f7f5] border border-black/15 p-5 rounded-[12px] max-w-[1100px] mx-auto">
            {/* Search Input */}
            <div className="relative flex-1 max-w-full xl:max-w-[340px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-black/50" />
              <input
                type="text"
                placeholder="Search database, pipeline, fraud..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/20 rounded-[8px] text-[14px] font-sans focus:outline-none focus:border-black"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/45 hover:text-black"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-[11px] tracking-[0.5px] uppercase text-black/60 mr-2">Category:</span>
              {["All", "AI/ML", "IoT", "Cybersecurity", "Cloud & DevOps"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "text-[13px] font-semibold py-1.5 px-3.5 rounded-[50px] border transition-all",
                    selectedCategory === cat
                      ? "bg-black border-black text-white"
                      : "bg-white border-[#e6e6e6] text-black hover:border-black"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Difficulty Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-[11px] tracking-[0.5px] uppercase text-black/60 mr-2">Difficulty:</span>
              {["All", "Beginner", "Intermediate", "Advanced"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={cn(
                    "text-[13px] font-semibold py-1.5 px-3.5 rounded-[50px] border transition-all",
                    selectedDifficulty === diff
                      ? "bg-black border-black text-white"
                      : "bg-white border-[#e6e6e6] text-black hover:border-black"
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredProblems.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProblems.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setActiveProblemDetail(p)}
                  className="bg-[#f7f7f5] border border-[#e6e6e6] rounded-[8px] p-6 hover:-translate-y-1 hover:border-black hover:bg-white transition-all duration-300 flex flex-col justify-between min-h-[240px] cursor-pointer shadow-sm group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[11px] tracking-[0.6px] text-black/60 uppercase">
                        {p.category} • {p.source}
                      </span>
                      <span className={cn(
                        "text-[11px] font-mono uppercase px-2 py-0.5 rounded border",
                        p.difficulty === "Advanced" ? "border-orange-200 bg-orange-50 text-orange-700" :
                        p.difficulty === "Intermediate" ? "border-teal-200 bg-teal-50 text-teal-700" :
                        "border-emerald-200 bg-emerald-50 text-emerald-700"
                      )}>
                        {p.difficulty}
                      </span>
                    </div>
                    
                    <h3 className="text-[20px] font-bold leading-[1.35] tracking-tight text-black group-hover:text-black/85 transition-colors mb-2">
                      {p.title}
                    </h3>
                    
                    <p className="text-[14px] font-light leading-relaxed text-black/80 line-clamp-3">
                      {p.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/5 mt-4 flex items-center justify-between text-[13px]">
                    <span className="font-mono text-[12px] text-black/60">{p.domain}</span>
                    <span className="inline-flex items-center gap-0.5 font-semibold text-black group-hover:gap-1.5 transition-all">
                      Inspect Brief
                      <ChevronRight className="size-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#f7f7f5] border border-[#e6e6e6] rounded-[8px] max-w-[800px] mx-auto">
              <Compass className="size-10 text-black/30 mx-auto mb-3" />
              <p className="font-semibold text-black">No matching problem briefs found</p>
              <p className="text-[14px] text-black/60 mt-1">Try resetting your search query or tag selectors.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                }}
                className="mt-4 text-[14px] font-semibold text-black underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Details Modal / Drawer Overlay */}
          <AnimatePresence>
            {activeProblemDetail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop Scrim */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveProblemDetail(null)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border-2 border-black rounded-[16px] max-w-[600px] w-full p-6 md:p-8 relative shadow-[8px_8px_0px_#000] space-y-6 z-10 overflow-y-auto max-h-[90vh] scrollbar-subtle"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setActiveProblemDetail(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#f7f7f5] hover:bg-[#e6e6e6] text-black flex items-center justify-center border border-black/10 transition-colors"
                    aria-label="Close details"
                  >
                    <X className="size-5" />
                  </button>

                  <div>
                    <span className="font-mono text-[11px] tracking-[0.6px] text-black/60 uppercase">
                      {activeProblemDetail.category} • {activeProblemDetail.source}
                    </span>
                    <h3 className="text-[26px] font-bold tracking-tight mt-1 text-black pr-8">
                      {activeProblemDetail.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-y border-[#e6e6e6] py-3 text-[14px]">
                    <div>
                      <p className="font-mono text-[11px] text-black/50 uppercase">Difficulty</p>
                      <p className="font-semibold text-black mt-0.5">{activeProblemDetail.difficulty}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[11px] text-black/50 uppercase">Domain Scope</p>
                      <p className="font-semibold text-black mt-0.5">{activeProblemDetail.domain}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-mono text-[11px] text-black/50 uppercase">Project Brief</p>
                    <p className="text-[15px] font-light leading-relaxed text-black">
                      {activeProblemDetail.desc}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-mono text-[11px] text-black/50 uppercase">Expected Outcome</p>
                    <p className="text-[14px] bg-[#f7f7f5] border border-black/15 p-3 rounded-[6px] text-black leading-relaxed">
                      {activeProblemDetail.outcome}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-mono text-[11px] text-black/50 uppercase">Industry Relevance</p>
                    <p className="text-[14px] leading-relaxed text-black/80">
                      {activeProblemDetail.relevance}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={destinationPath}
                      onClick={() => setActiveProblemDetail(null)}
                      className="w-full rounded-[50px] bg-black text-white text-[16px] font-semibold py-3.5 flex items-center justify-center gap-2 hover:scale-[0.98] transition-transform active:scale-[0.95] shadow-[4px_4px_0px_#000] border-2 border-black"
                    >
                      Claim Brief & Start Workspace
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* 9. Editorial Footer */}
      <footer className="bg-[#ffffff] border-t border-[#e6e6e6] py-16 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between gap-12">
          
          <div className="space-y-4 md:max-w-[360px]">
            <h2 className="font-display font-semibold text-[36px] tracking-tighter text-black select-none">
              JetLabs
            </h2>
            <p className="font-mono text-[12px] tracking-[0.60px] text-black/60 uppercase leading-relaxed">
              &copy; 2026 JetLabs Capstone Operations Platform. All rights reserved. Registered under AOIP standards.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-16">
            <div className="space-y-3">
              <p className="font-mono text-[12px] tracking-[0.60px] text-black uppercase font-bold">
                Platform
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/login" className="font-sans text-[15px] text-black/70 hover:text-black transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="font-sans text-[15px] text-black/70 hover:text-black transition-colors">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="font-sans text-[15px] text-black/70 hover:text-black transition-colors">
                    Viva Rehearsals
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-[12px] tracking-[0.60px] text-black uppercase font-bold">
                Resources
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/login" className="font-sans text-[15px] text-black/70 hover:text-black transition-colors">
                    IEEE Guide
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="font-sans text-[15px] text-black/70 hover:text-black transition-colors">
                    Blueprints
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="font-sans text-[15px] text-black/70 hover:text-black transition-colors">
                    Sandboxing
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <p className="font-mono text-[12px] tracking-[0.60px] text-black uppercase font-bold">
                Legal
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/login" className="font-sans text-[15px] text-black/70 hover:text-black transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="font-sans text-[15px] text-black/70 hover:text-black transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="font-sans text-[15px] text-black/70 hover:text-black transition-colors">
                    System status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
