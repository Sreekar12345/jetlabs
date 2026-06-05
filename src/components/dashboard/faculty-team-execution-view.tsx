"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BookOpenCheck,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Cloud,
  Eye,
  FileText,
  GitBranch,
  Gauge,
  MessageSquare,
  Rocket,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TimerReset,
  TrendingDown,
  Users2,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { ModulePageData } from "@/types/aoip";

type TeamState =
  | "Healthy execution"
  | "Needs review"
  | "Slowing down"
  | "Blocked"
  | "High risk"
  | "Critical";

type Tone = "healthy" | "attention" | "critical" | "blocked" | "insight";

type TeamSignal = {
  id: string;
  name: string;
  department: string;
  members: number;
  mentor: string;
  sprint: string;
  state: TeamState;
  confidence: number;
  priority: string;
  project: string;
  milestone: string;
  submissions: number;
  velocity: number;
  ieee: number;
  viva: number;
  deployment: number;
  collaboration: number;
  pendingReviews: number;
  lastMentor: string;
  streak: string;
  bottleneck: string;
  prediction: string;
  recommendation: string;
  signals: string[];
  contribution: Array<{ member: string; value: number; status: string }>;
  heatmap: number[];
  timeline: Array<{ label: string; type: "submission" | "review" | "ieee" | "viva" | "risk" | "recovery"; week: string }>;
};

type FacultyTeamExecutionViewProps = {
  module: ModulePageData;
};

const teams: TeamSignal[] = [
  {
    id: "team-falcon",
    name: "Team Falcon",
    department: "CSE-A",
    members: 4,
    mentor: "Dr. Mehta",
    sprint: "Week 4",
    state: "Healthy execution",
    confidence: 85,
    priority: "P3",
    project: "Crop Disease Detection",
    milestone: "Model validation complete",
    submissions: 80,
    velocity: 82,
    ieee: 65,
    viva: 75,
    deployment: 70,
    collaboration: 85,
    pendingReviews: 0,
    lastMentor: "2 days ago",
    streak: "14-day delivery streak",
    bottleneck: "None",
    prediction: "Likely final-evaluation leader.",
    recommendation: "Shortlist for showcase.",
    signals: ["Strong consistency", "Regular logs"],
    contribution: [
      { member: "Riya", value: 30, status: "Balanced" },
      { member: "Kabir", value: 25, status: "Balanced" },
      { member: "Neel", value: 25, status: "Balanced" },
      { member: "Anu", value: 20, status: "Balanced" },
    ],
    heatmap: [8, 9, 8, 9, 9, 8, 9, 8, 9, 10, 9, 10],
    timeline: [
      { label: "Baseline submitted", type: "submission", week: "W1" },
      { label: "Mentor revision approved", type: "review", week: "W2" },
      { label: "IEEE draft approved", type: "ieee", week: "W3" },
      { label: "Viva simulation passed", type: "viva", week: "W4" },
    ],
  },
  {
    id: "team-nova",
    name: "Team Nova",
    department: "CSE-A",
    members: 4,
    mentor: "Prof. Arjun",
    sprint: "Week 3",
    state: "Slowing down",
    confidence: 58,
    priority: "P1",
    project: "Fraud Detection Engine",
    milestone: "Data parsing overdue",
    submissions: 40,
    velocity: 45,
    ieee: 15,
    viva: 35,
    deployment: 20,
    collaboration: 48,
    pendingReviews: 2,
    lastMentor: "5 days ago",
    streak: "0 submissions in 5 days",
    bottleneck: "IEEE progress unchanged and low team activity",
    prediction: "High probability of delayed final submission.",
    recommendation: "Mentor intervention within 3 days.",
    signals: ["No submissions in 5 days", "IEEE unchanged"],
    contribution: [
      { member: "Riya", value: 42, status: "Overloaded" },
      { member: "Kabir", value: 24, status: "Quiet" },
      { member: "Neel", value: 21, status: "Silent" },
      { member: "Anu", value: 13, status: "Inactive" },
    ],
    heatmap: [7, 6, 5, 4, 3, 2, 2, 1, 1, 0, 1, 0],
    timeline: [
      { label: "Baseline submitted", type: "submission", week: "W1" },
      { label: "Mentor revision", type: "review", week: "W2" },
      { label: "IEEE stalled", type: "risk", week: "W3" },
    ],
  },
  {
    id: "team-vega",
    name: "Team Vega",
    department: "AIML",
    members: 5,
    mentor: "Dr. Nisha",
    sprint: "Week 4",
    state: "Healthy execution",
    confidence: 76,
    priority: "P2",
    project: "Skin Cancer Classifier",
    milestone: "Clinical dataset integration",
    submissions: 70,
    velocity: 74,
    ieee: 20,
    viva: 68,
    deployment: 58,
    collaboration: 82,
    pendingReviews: 1,
    lastMentor: "1 day ago",
    streak: "9-day delivery streak",
    bottleneck: "None",
    prediction: "Steady weekly submissions.",
    recommendation: "Monitor IEEE draft velocity.",
    signals: ["Consistent output"],
    contribution: [
      { member: "Nisha", value: 30, status: "Active" },
      { member: "Karan", value: 27, status: "Active" },
      { member: "Ira", value: 23, status: "Active" },
      { member: "Manav", value: 20, status: "Quiet" },
    ],
    heatmap: [6, 7, 7, 8, 7, 6, 8, 7, 7, 6, 6, 5],
    timeline: [
      { label: "Dataset approved", type: "review", week: "W1" },
      { label: "IEEE methods updated", type: "ieee", week: "W3" },
      { label: "In review", type: "review", week: "W4" },
    ],
  },
  {
    id: "team-orion",
    name: "Team Orion",
    department: "ECE",
    members: 3,
    mentor: "Prof. Raman",
    sprint: "Week 2",
    state: "Blocked",
    confidence: 44,
    priority: "P0",
    project: "IoT Air Quality",
    milestone: "Hardware sensors calibrated",
    submissions: 20,
    velocity: 28,
    ieee: 80,
    viva: 12,
    deployment: 10,
    collaboration: 36,
    pendingReviews: 3,
    lastMentor: "12 days ago",
    streak: "Inactive profile",
    bottleneck: "No recent hardware testing logs",
    prediction: "High failure probability if demo evidence is not restored.",
    recommendation: "Immediate intervention required.",
    signals: ["Pending reviews", "Hardware proof missing"],
    contribution: [
      { member: "Imran", value: 52, status: "Overloaded" },
      { member: "Sana", value: 31, status: "Active" },
      { member: "Dev", value: 17, status: "Silent" },
    ],
    heatmap: [6, 5, 4, 4, 2, 2, 1, 1, 0, 0, 1, 0],
    timeline: [
      { label: "Prototype submitted", type: "submission", week: "W1" },
      { label: "Hardware proof missing", type: "risk", week: "W2" },
    ],
  },
  {
    id: "team-lyra",
    name: "Team Lyra",
    department: "IT-A",
    members: 4,
    mentor: "Dr. Iyer",
    sprint: "Week 4",
    state: "Healthy execution",
    confidence: 80,
    priority: "P2",
    project: "AI Tutor",
    milestone: "System testing",
    submissions: 60,
    velocity: 65,
    ieee: 35,
    viva: 70,
    deployment: 68,
    collaboration: 78,
    pendingReviews: 0,
    lastMentor: "3 days ago",
    streak: "5-day delivery streak",
    bottleneck: "None",
    prediction: "Likely timely completion candidate.",
    recommendation: "Check model verification.",
    signals: ["Steady recovery"],
    contribution: [
      { member: "Nisha", value: 30, status: "Active" },
      { member: "Ayaan", value: 27, status: "Active" },
      { member: "Tara", value: 23, status: "Active" },
      { member: "Om", value: 20, status: "Quiet" },
    ],
    heatmap: [5, 6, 6, 7, 7, 8, 8, 8, 9, 8, 9, 9],
    timeline: [
      { label: "Baseline submitted", type: "submission", week: "W1" },
      { label: "Milestone cleared", type: "review", week: "W3" },
    ],
  },
  {
    id: "team-atlas",
    name: "Team Atlas",
    department: "DS",
    members: 4,
    mentor: "Prof. Arjun",
    sprint: "Week 4",
    state: "Healthy execution",
    confidence: 92,
    priority: "P3",
    project: "Stock Sentiment",
    milestone: "Final validation",
    submissions: 90,
    velocity: 92,
    ieee: 80,
    viva: 94,
    deployment: 95,
    collaboration: 90,
    pendingReviews: 0,
    lastMentor: "today",
    streak: "18-day delivery streak",
    bottleneck: "None",
    prediction: "Exceptional showcase quality.",
    recommendation: "Nominate for departmental honors.",
    signals: ["Exceptional consistency", "Strong research"],
    contribution: [
      { member: "Priya", value: 28, status: "Balanced" },
      { member: "Aarav", value: 26, status: "Balanced" },
      { member: "Meera", value: 24, status: "Balanced" },
      { member: "Rohan", value: 22, status: "Balanced" },
    ],
    heatmap: [9, 10, 10, 10, 9, 10, 10, 10, 10, 9, 10, 10],
    timeline: [
      { label: "Architecture approved", type: "review", week: "W1" },
      { label: "IEEE draft approved", type: "ieee", week: "W2" },
      { label: "Deployment live", type: "submission", week: "W3" },
      { label: "Viva simulation passed", type: "viva", week: "W4" },
    ],
  },
  {
    id: "team-pulse",
    name: "Team Pulse",
    department: "IT-B",
    members: 3,
    mentor: "Dr. Nisha",
    sprint: "Week 3",
    state: "High risk",
    confidence: 54,
    priority: "P1",
    project: "Phishing Classifier",
    milestone: "Feature extraction blocked",
    submissions: 30,
    velocity: 35,
    ieee: 25,
    viva: 42,
    deployment: 18,
    collaboration: 52,
    pendingReviews: 1,
    lastMentor: "8 days ago",
    streak: "Warning state active",
    bottleneck: "IEEE writing lags",
    prediction: "Potential delay in research submission.",
    recommendation: "Schedule mentor check-in.",
    signals: ["Research lag", "Inactivity drop"],
    contribution: [
      { member: "Imran", value: 52, status: "Overloaded" },
      { member: "Sana", value: 31, status: "Active" },
      { member: "Dev", value: 17, status: "Silent" },
    ],
    heatmap: [4, 3, 3, 2, 2, 1, 2, 1, 0, 1, 1, 0],
    timeline: [
      { label: "Dataset parsing approved", type: "review", week: "W1" },
      { label: "Consistency drop warning", type: "risk", week: "W3" },
    ],
  },
];

const healthOverview = [
  { label: "Active teams", value: "7", trend: "7 monitored", tone: "insight" as const, icon: Users2 },
  { label: "Healthy execution", value: "4", trend: "On track", tone: "healthy" as const, icon: CheckCircle2 },
  { label: "Slowing teams", value: "1", trend: "Delayed", tone: "attention" as const, icon: TrendingDown },
  { label: "At-risk teams", value: "2", trend: "Critical / High", tone: "critical" as const, icon: ShieldAlert },
];

const pipelineColumns = [
  { state: "Healthy execution" as TeamState, detail: "Strong delivery momentum" },
  { state: "Needs review" as TeamState, detail: "Faculty decision pending" },
  { state: "Slowing down" as TeamState, detail: "Reduced progress consistency" },
  { state: "Blocked" as TeamState, detail: "Submission or review dependency" },
  { state: "High risk" as TeamState, detail: "Delay probability increasing" },
];

const milestoneTracker = [
  { name: "Problem Finalization", confidence: 91, risk: "Low", owner: "Team Atlas", status: "Approved" },
  { name: "Dataset Baseline", confidence: 76, risk: "Medium", owner: "Team Lyra", status: "In review" },
  { name: "Improved Model", confidence: 62, risk: "High", owner: "Team Nova", status: "Needs checkpoint" },
  { name: "Frontend Prototype", confidence: 83, risk: "Low", owner: "Team Pulse", status: "Stable" },
  { name: "Integration", confidence: 57, risk: "Critical", owner: "Team Vega", status: "Blocked" },
];

const riskQuadrants = [
  { label: "High progress / low risk", teams: "Falcon, Atlas, Lyra, Vega", tone: "healthy" },
  { label: "High progress / high risk", teams: "Nova", tone: "attention" },
  { label: "Low progress / high risk", teams: "Pulse", tone: "critical" },
  { label: "Low progress / recovering", teams: "Orion", tone: "insight" },
];

const leaderboard = [
  { rank: 1, team: "Team Atlas", score: 92, note: "Best delivery consistency" },
  { rank: 2, team: "Team Falcon", score: 85, note: "Strong review responsiveness" },
  { rank: 3, team: "Team Lyra", score: 80, note: "On track execution" },
  { rank: 4, team: "Team Pulse", score: 54, note: "Needs mentor escalation" },
];

const executionBlockers = [
  {
    title: "Pending reviews",
    detail: "3 packets waiting for faculty decision",
    icon: ClipboardCheck,
    tone: "attention" as const,
  },
  {
    title: "Student inactivity",
    detail: "Team Orion silent for 12 days",
    icon: TimerReset,
    tone: "critical" as const,
  },
  {
    title: "Review loops",
    detail: "Team Pulse stuck in evidence correction",
    icon: GitBranch,
    tone: "blocked" as const,
  },
];

function toneForState(state: TeamState): Tone {
  if (state === "Healthy execution") {
    return "healthy";
  }

  if (state === "Blocked") {
    return "blocked";
  }

  if (state === "High risk" || state === "Critical") {
    return "critical";
  }

  return "attention";
}

function toneStyles(tone: Tone) {
  if (tone === "healthy") {
    return {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      fill: "bg-emerald-500",
      soft: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (tone === "critical") {
    return {
      border: "border-red-200",
      bg: "bg-red-50",
      text: "text-red-700",
      fill: "bg-red-500",
      soft: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (tone === "blocked") {
    return {
      border: "border-purple-200",
      bg: "bg-purple-50",
      text: "text-purple-700",
      fill: "bg-purple-500",
      soft: "border-purple-200 bg-purple-50 text-purple-700",
    };
  }

  if (tone === "attention") {
    return {
      border: "border-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-700",
      fill: "bg-amber-500",
      soft: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-700",
    fill: "bg-blue-500",
    soft: "border-blue-200 bg-blue-50 text-blue-700",
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Meter({
  value,
  tone,
  className,
}: {
  value: number;
  tone: Tone;
  className?: string;
}) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-200", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", toneStyles(tone).fill)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ActivityHeatmap({ values, tone }: { values: number[]; tone: Tone }) {
  const fillClass = toneStyles(tone).fill;

  return (
    <div className="grid grid-cols-12 gap-1.5">
      {values.map((value, index) => (
        <span
          key={`${value}-${index + 1}`}
          className={cn(
            "h-8 rounded-md border border-white/80 shadow-sm transition hover:scale-105 duration-100",
            value >= 8 ? fillClass : value >= 5 ? "bg-slate-300" : value >= 2 ? "bg-slate-200" : "bg-slate-100",
          )}
        />
      ))}
    </div>
  );
}

function PipelineCard({ team }: { team: TeamSignal }) {
  const tone = toneForState(team.state);
  const styles = toneStyles(tone);

  return (
    <div className={cn("rounded-2xl border bg-white p-3 shadow-sm", styles.border)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{team.name}</p>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{team.project}</p>
        </div>
        <Badge className={styles.soft}>{team.confidence}%</Badge>
      </div>
      <div className="mt-3 grid gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Velocity</span>
          <span className="font-semibold text-foreground">{team.velocity}%</span>
        </div>
        <Meter value={team.velocity} tone={tone} className="h-1.5" />
      </div>
      <p className="mt-3 text-[10px] leading-5 text-muted-foreground line-clamp-2">{team.recommendation}</p>
    </div>
  );
}

function TimelineEvent({ team }: { team: TeamSignal }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-slate-800 text-sm">{team.name}</p>
        <Badge variant="outline" className="bg-slate-50 text-slate-650 px-2 py-0.5 text-xs">{team.sprint}</Badge>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {team.timeline.map((event) => (
          <div key={`${team.id}-${event.label}`} className="relative rounded-xl border border-slate-150 bg-slate-50/50 p-3 pl-4">
            <span className="absolute left-1.5 top-3.5 size-1.5 rounded-full bg-slate-900" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{event.week}</p>
            <p className="mt-1.5 text-xs font-semibold text-slate-800 line-clamp-2">{event.label}</p>
            <Badge variant="outline" className="mt-2.5 bg-white text-[10px] font-bold uppercase tracking-wide px-1.5 py-0">
              {event.type}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FacultyTeamExecutionView({ module }: FacultyTeamExecutionViewProps) {
  const [activeTab, setActiveTab] = useState("Table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("team-falcon");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const q = searchQuery.toLowerCase();
      return (
        team.name.toLowerCase().includes(q) ||
        team.department.toLowerCase().includes(q) ||
        team.project.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const activeTeam = useMemo(() => {
    return teams.find((t) => t.id === selectedTeamId) || null;
  }, [selectedTeamId]);

  const activeTeamTone = activeTeam ? toneForState(activeTeam.state) : "healthy";
  const activeTeamStyles = toneStyles(activeTeamTone);

  const activeTeamMetrics = useMemo(() => {
    if (!activeTeam) return [];
    return [
      { label: "Submission consistency", value: activeTeam.submissions, icon: ClipboardCheck },
      { label: "Project velocity", value: activeTeam.velocity, icon: Rocket },
      { label: "IEEE progress", value: activeTeam.ieee, icon: BookOpenCheck },
      { label: "Viva readiness", value: activeTeam.viva, icon: Video },
      { label: "Deployment", value: activeTeam.deployment, icon: Cloud },
      { label: "Collaboration", value: activeTeam.collaboration, icon: Users2 },
    ];
  }, [activeTeam]);

  return (
    <div className="space-y-6 bg-white -mx-4 -my-6 p-4 sm:p-6 lg:p-8 xl:p-10 min-h-[calc(100vh-4.5rem)] text-slate-950">
      {/* Title Header */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Teams & batches</h1>
        <p className="text-sm text-slate-500 font-medium">
          Monitor all student teams across views
        </p>
      </div>

      {/* Toolbar controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        {/* Tabs switcher buttons */}
        <div className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-100/80 p-1 text-slate-550 border border-slate-200/50">
          {["Table", "Kanban", "Progress matrix", "Timeline"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4.5 py-1.5 text-xs font-bold transition-all duration-100",
                  isActive
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/55"
                    : "hover:text-slate-900 hover:bg-slate-50/50"
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-0 sm:w-[320px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-slate-950"
            placeholder="Search teams..."
          />
        </div>
      </div>

      {/* Conditional rendering based on activeTab */}
      {activeTab === "Table" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Problem</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Week</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paper</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last submission</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 bg-white">
                {filteredTeams.map((team) => {
                  const statusStyles = 
                    team.state === "Healthy execution"
                      ? "text-emerald-600 font-semibold"
                      : team.state === "Slowing down"
                      ? "text-amber-600 font-semibold"
                      : team.state === "Blocked"
                      ? "text-purple-600 font-semibold"
                      : "text-red-600 font-semibold";
                  
                  const statusLabel = 
                    team.state === "Healthy execution" ? "On track" :
                    team.state === "Slowing down" ? "Delayed" :
                    team.state === "Blocked" ? "Inactive" :
                    "At risk";

                  return (
                    <tr key={team.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Team Identity */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border border-slate-200 shadow-sm">
                            <AvatarFallback className="bg-slate-100 text-xs font-bold text-slate-700">
                              {initials(team.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-bold text-slate-900 leading-snug">{team.name}</span>
                        </div>
                      </td>

                      {/* Batch */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-550">{team.department}</span>
                      </td>

                      {/* Problem Statement */}
                      <td className="px-6 py-4 whitespace-nowrap max-w-[200px] truncate">
                        <span className="text-xs font-semibold text-slate-800" title={team.project}>
                          {team.project}
                        </span>
                      </td>

                      {/* Week */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-800">{team.sprint.replace("Week ", "")}</span>
                      </td>

                      {/* Project Velocity progress bar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 shadow-inner">
                          <div className="h-full bg-slate-900 rounded-full" style={{ width: `${team.velocity}%` }} />
                        </div>
                      </td>

                      {/* Paper Progress bar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 shadow-inner">
                          <div className="h-full bg-slate-900 rounded-full" style={{ width: `${team.ieee}%` }} />
                        </div>
                      </td>

                      {/* Last Submission */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-650">{team.lastMentor}</span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn("text-xs font-bold", statusStyles)}>{statusLabel}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            title="Add mentor comment"
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <MessageSquare className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTeamId(team.id);
                              setIsModalOpen(true);
                            }}
                            title="View details"
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <Eye className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredTeams.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      <Users2 className="size-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold mt-4 text-slate-700">No teams match search</p>
                      <p className="text-xs text-slate-400 mt-1">Try broadening your search term.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Kanban" && (
        <div className="grid gap-4 xl:grid-cols-5">
          {pipelineColumns.map((column) => {
            const laneTeams = filteredTeams.filter((team) => team.state === column.state);
            return (
              <div key={column.state} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-4 shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none">{column.state}</p>
                  <p className="mt-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{column.detail}</p>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-0.5">
                  {laneTeams.length > 0 ? (
                    laneTeams.map((team) => <PipelineCard key={team.id} team={team} />)
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs font-semibold text-slate-400 text-center">
                      No teams in lane
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "Progress matrix" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* Milestone Execution list */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Milestone Execution Tracker</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {milestoneTracker.map((item) => (
                <div key={item.name} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                    <Badge className={cn(
                      "text-[10px] font-bold px-2 py-0.5",
                      item.risk === 'Critical' ? 'border-red-200 bg-red-50 text-red-700' : item.risk === 'High' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    )}>
                      {item.risk}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">Owner: {item.owner}</p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-xl font-bold text-slate-800">{item.confidence}%</span>
                    <span className="pb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">confidence</span>
                  </div>
                  <Meter value={item.confidence} tone={item.confidence >= 80 ? 'healthy' : item.confidence >= 65 ? 'attention' : 'critical'} className="mt-3 h-2" />
                  <p className="text-xs text-slate-400 font-semibold mt-2">Status: {item.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Intensity Heatmaps list */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase font-semibold">Weekly Delivery Matrix</h3>
            <div className="space-y-4">
              {filteredTeams.map((team) => {
                const tone = toneForState(team.state);
                return (
                  <div key={`matrix-${team.id}`} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/30 p-4 lg:grid-cols-[180px_minmax(0,1fr)_120px] lg:items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{team.name}</p>
                      <p className="mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{team.department}</p>
                    </div>
                    <ActivityHeatmap values={team.heatmap} tone={tone} />
                    <Badge className={cn("text-[10px] font-bold self-start lg:self-center", toneStyles(tone).soft)}>
                      {team.confidence}% confidence
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Timeline" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Team Evolution Timelines</h3>
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-1">
            {filteredTeams.map((team) => (
              <TimelineEvent key={`timeline-${team.id}`} team={team} />
            ))}
          </div>
        </div>
      )}

      {/* Side-over team details popup */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6 bg-[#f8fafc]">
          <ModalHeader className="flex justify-between items-center border-b border-slate-250 pb-3.5 mb-5 bg-white -mx-6 -mt-6 p-6 rounded-t-2xl shadow-sm">
            <ModalTitle className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <Users2 className="size-5 text-indigo-600" />
              <span>Team Execution Details</span>
            </ModalTitle>
            <ModalCloseButton onClick={() => setIsModalOpen(false)} />
          </ModalHeader>
          {activeTeam && (
            <div className="space-y-6 text-slate-950">
              {/* Profile Card Header */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4.5">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white text-lg font-bold shadow-md">
                    {initials(activeTeam.name)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{activeTeam.name}</h2>
                      <Badge className={cn("text-xs px-2.5 py-0.5 font-bold border", activeTeamStyles.soft)}>
                        {activeTeam.state}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 font-semibold px-2 py-0.5 text-xs">
                        {activeTeam.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      {activeTeam.department} — {activeTeam.members} members — {activeTeam.sprint}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:self-center">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold px-3 py-1 text-xs">
                    Interaction: {activeTeam.lastMentor}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold px-3 py-1 text-xs">
                    Streak: {activeTeam.streak}
                  </Badge>
                </div>
              </div>

              {/* Student Metadata Card Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-2xl border border-slate-200/80 shadow-none bg-white">
                  <CardHeader className="p-4 pb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Name</span>
                  </CardHeader>
                  <CardContent className="p-4 pt-1">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2">{activeTeam.project}</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{activeTeam.milestone}</p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-slate-200/80 shadow-none bg-white">
                  <CardHeader className="p-4 pb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mentor & Reviews</span>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Mentor:</span>
                      <span className="font-semibold text-slate-800">{activeTeam.mentor}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Pending Reviews:</span>
                      <span className="font-semibold text-slate-800">{activeTeam.pendingReviews}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className={cn("rounded-2xl border shadow-none bg-white", activeTeamStyles.bg, activeTeamStyles.border)}>
                  <CardHeader className="p-4 pb-1">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", activeTeamStyles.text)}>Delivery Confidence</span>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 bg-transparent">
                    <p className="text-sm font-bold text-slate-800">{activeTeam.recommendation}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Model verification index: {activeTeam.confidence}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Execution Metrics progress widgets */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Execution Metrics</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeTeamMetrics.map((metric) => {
                    const MetricIcon = metric.icon;
                    return (
                      <div key={metric.label} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <MetricIcon className="size-4 text-slate-400" />
                            {metric.label}
                          </span>
                          <span className="text-sm font-bold text-slate-800">{metric.value}%</span>
                        </div>
                        <Meter value={metric.value} tone={activeTeamTone} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Intensity Heatmap */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-850 tracking-wide uppercase">Weekly Execution Intensity</h3>
                  <span className="text-xs text-slate-500 font-semibold">{activeTeam.bottleneck}</span>
                </div>
                <div className="py-2">
                  <ActivityHeatmap values={activeTeam.heatmap} tone={activeTeamTone} />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase mt-3 px-1">
                    <span>Week 1 (Old)</span>
                    <span>Week 12 (Recent)</span>
                  </div>
                </div>
              </div>

              {/* Contribution Breakdown */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-850 tracking-wide uppercase font-semibold">Team Contribution Breakdown</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {activeTeam.contribution.map((member) => (
                    <div key={member.member} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">{member.member}</span>
                        <Badge variant="outline" className="bg-white text-slate-600 font-semibold text-[10px] px-2 py-0.5">{member.status}</Badge>
                      </div>
                      <Meter value={member.value} tone={member.value < 20 ? "critical" : member.value > 45 ? "attention" : "healthy"} className="h-2" />
                      <p className="text-[10px] text-slate-400 font-semibold">Contribution: {member.value}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Faculty Action Controls */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase font-semibold">Faculty Mentor Actions</h3>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 py-5 font-semibold text-xs shadow-sm">
                    <ArrowUpRight className="size-4 text-slate-400" />
                    Open Workspace
                  </Button>
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 py-5 font-semibold text-xs shadow-sm">
                    <ClipboardCheck className="size-4 text-slate-400" />
                    Send Review Request
                  </Button>
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 py-5 font-semibold text-xs shadow-sm">
                    <CalendarClock className="size-4 text-slate-400" />
                    Schedule Sync
                  </Button>
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-rose-250 bg-rose-50 hover:bg-rose-100 text-rose-800 py-5 font-bold text-xs shadow-sm">
                    <ShieldAlert className="size-4 text-rose-500" />
                    Escalate Issue
                  </Button>
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 py-5 font-semibold text-xs shadow-sm">
                    <MessageSquare className="size-4 text-slate-400" />
                    Add Mentor Note
                  </Button>
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-rose-200 bg-white hover:bg-rose-50 text-rose-750 py-5 font-semibold text-xs shadow-sm">
                    <AlertTriangle className="size-4 text-rose-450" />
                    Flag Inactive Member
                  </Button>
                </div>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
