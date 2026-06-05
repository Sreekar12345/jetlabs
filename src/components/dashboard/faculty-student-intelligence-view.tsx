"use client";

import { useState, useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpenCheck,
  Bot,
  CalendarClock,
  ClipboardCheck,
  HeartPulse,
  Rocket,
  Search,
  ShieldAlert,
  TrendingDown,
  Users2,
  Video,
  MessageSquareText,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { ModulePageData } from "@/types/aoip";

type RiskState = "Healthy" | "Slowing Down" | "At Risk" | "Critical";
type Tone = "healthy" | "attention" | "critical" | "insight";

type StudentSignal = {
  id: string;
  name: string;
  roll: string;
  batch: string;
  department: string;
  avatar: string;
  risk: RiskState;
  confidence: number;
  priority: string;
  concern: string;
  streak: string;
  reputation: string;
  attendance: number;
  submissions: number;
  velocity: number;
  ieee: number;
  viva: number;
  backlog: string;
  project: string;
  milestone: string;
  deployment: string;
  bottleneck: string;
  trend: string;
  prediction: string;
  recommendation: string;
  signals: string[];
  activity: number[];
  cgpa: number;
  section: string;
  paper: number;
};

type FacultyStudentIntelligenceViewProps = {
  module: ModulePageData;
};

const students: StudentSignal[] = [
  {
    id: "stu-mock-1",
    name: "Aarav Sharma",
    roll: "21CSE001",
    batch: "Sec A",
    department: "CSE",
    avatar: "AS",
    risk: "Healthy",
    confidence: 85,
    priority: "P3",
    concern: "Consistently strong performance",
    streak: "14 days",
    reputation: "Top builder",
    attendance: 86,
    submissions: 88,
    velocity: 85,
    ieee: 80,
    viva: 82,
    backlog: "Clear",
    project: "Crop Disease Detection",
    milestone: "Paper drafted",
    deployment: "Live",
    bottleneck: "None",
    trend: "Consistent high execution velocity",
    prediction: "Showcase candidate",
    recommendation: "Promote to innovation team",
    signals: ["Strong consistency", "High project velocity"],
    activity: [8, 9, 8, 9, 10, 8, 9, 10, 9, 10, 9, 10],
    cgpa: 8.6,
    section: "Sec A",
    paper: 80,
  },
  {
    id: "stu-mock-2",
    name: "Diya Patel",
    roll: "21CSE014",
    batch: "Sec A",
    department: "CSE",
    avatar: "DP",
    risk: "Healthy",
    confidence: 90,
    priority: "P3",
    concern: "Strong research background",
    streak: "21 days",
    reputation: "Consistent builder",
    attendance: 92,
    submissions: 94,
    velocity: 91,
    ieee: 82,
    viva: 88,
    backlog: "Clear",
    project: "Crop Disease Detection",
    milestone: "IEEE methodology verified",
    deployment: "Live",
    bottleneck: "None",
    trend: "Excellent writing and documentation progress",
    prediction: "High scoring candidate",
    recommendation: "Encourage to present at IEEE conference",
    signals: ["Fast approvals", "High contribution"],
    activity: [9, 10, 9, 10, 9, 9, 10, 10, 9, 10, 10, 10],
    cgpa: 9.1,
    section: "Sec A",
    paper: 80,
  },
  {
    id: "stu-mock-3",
    name: "Rahul Verma",
    roll: "21CSE022",
    batch: "Sec B",
    department: "CSE",
    avatar: "RV",
    risk: "Critical",
    confidence: 92,
    priority: "P0",
    concern: "Faculty concern high - critical attendance drop",
    streak: "0 days",
    reputation: "Execution unstable",
    attendance: 61,
    submissions: 31,
    velocity: 38,
    ieee: 26,
    viva: 18,
    backlog: "2 active",
    project: "Fraud Detection Engine",
    milestone: "Baseline validation blocked",
    deployment: "Not started",
    bottleneck: "No recent submission evidence",
    trend: "Attendance dropped 14% in 3 weeks",
    prediction: "Likely delayed submission risk.",
    recommendation: "Faculty intervention within 5 days.",
    signals: ["Attendance decline", "No viva practice", "IEEE stagnant"],
    activity: [1, 0, 2, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    cgpa: 6.2,
    section: "Sec B",
    paper: 15,
  },
  {
    id: "stu-mock-4",
    name: "Sneha Iyer",
    roll: "21AIML031",
    batch: "Sec A",
    department: "AIML",
    avatar: "SI",
    risk: "Healthy",
    confidence: 88,
    priority: "P3",
    concern: "High quality output",
    streak: "15 days",
    reputation: "Reliable builder",
    attendance: 88,
    submissions: 85,
    velocity: 86,
    ieee: 80,
    viva: 80,
    backlog: "Clear",
    project: "Skin Cancer Classifier",
    milestone: "Model validation complete",
    deployment: "Preview active",
    bottleneck: "None",
    trend: "Steady weekly submissions",
    prediction: "Low risk candidate",
    recommendation: "Maintain current execution pace",
    signals: ["Strong consistency", "Regular logs"],
    activity: [7, 8, 8, 8, 9, 8, 9, 9, 8, 9, 9, 10],
    cgpa: 8.9,
    section: "Sec A",
    paper: 80,
  },
  {
    id: "stu-mock-5",
    name: "Karan Singh",
    roll: "21ECE044",
    batch: "Sec A",
    department: "ECE",
    avatar: "KS",
    risk: "At Risk",
    confidence: 72,
    priority: "P1",
    concern: "Attendance below safe threshold",
    streak: "2 days",
    reputation: "Slow execution progress",
    attendance: 70,
    submissions: 55,
    velocity: 58,
    ieee: 40,
    viva: 45,
    backlog: "2 active",
    project: "IoT Air Quality",
    milestone: "Hardware sensors calibrated",
    deployment: "Preview unstable",
    bottleneck: "Research writing stalled",
    trend: "Velocity flat for 2 weeks",
    prediction: "Delay in final paper draft",
    recommendation: "Assign weekly writing tasks",
    signals: ["Attendance decline", "Delayed team"],
    activity: [4, 5, 5, 4, 3, 4, 3, 3, 2, 2, 3, 1],
    cgpa: 7.0,
    section: "Sec A",
    paper: 40,
  },
  {
    id: "stu-mock-6",
    name: "Meera Nair",
    roll: "21IT017",
    batch: "Sec A",
    department: "IT",
    avatar: "MN",
    risk: "Healthy",
    confidence: 84,
    priority: "P2",
    concern: "Recovered from initial slowdown",
    streak: "8 days",
    reputation: "Steady builder",
    attendance: 81,
    submissions: 80,
    velocity: 78,
    ieee: 75,
    viva: 78,
    backlog: "Clear",
    project: "AI Tutor",
    milestone: "UI integrations",
    deployment: "Live",
    bottleneck: "None",
    trend: "Improving weekly submission rate",
    prediction: "On track for timely completion",
    recommendation: "Verify documentation detail",
    signals: ["Steady recovery"],
    activity: [5, 6, 6, 7, 7, 8, 8, 8, 9, 8, 9, 9],
    cgpa: 8.2,
    section: "Sec A",
    paper: 80,
  },
  {
    id: "stu-mock-7",
    name: "Aditya Rao",
    roll: "21IT028",
    batch: "Sec B",
    department: "IT",
    avatar: "AR",
    risk: "Critical",
    confidence: 94,
    priority: "P0",
    concern: "High detention risk - multiple backlogs",
    streak: "0 days",
    reputation: "Disengaged profile",
    attendance: 58,
    submissions: 25,
    velocity: 28,
    ieee: 10,
    viva: 12,
    backlog: "4 active",
    project: "Phishing Classifier",
    milestone: "Dataset parsing blocked",
    deployment: "Not started",
    bottleneck: "Severe execution backlog",
    trend: "Consistent flat activity",
    prediction: "High failure probability",
    recommendation: "Immediate face-to-face parent-mentor meeting",
    signals: ["Severe backlog", "Critical attendance drop"],
    activity: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    cgpa: 5.4,
    section: "Sec B",
    paper: 10,
  },
  {
    id: "stu-mock-8",
    name: "Riya Kapoor",
    roll: "21DS009",
    batch: "Sec A",
    department: "DS",
    avatar: "RK",
    risk: "Healthy",
    confidence: 92,
    priority: "P3",
    concern: "Exceptional analytics skill",
    streak: "28 days",
    reputation: "Research heavy",
    attendance: 95,
    submissions: 98,
    velocity: 95,
    ieee: 90,
    viva: 94,
    backlog: "Clear",
    project: "Stock Sentiment",
    milestone: "Paper accepted draft",
    deployment: "Live",
    bottleneck: "None",
    trend: "Unmatched execution accuracy",
    prediction: "Showcase candidate",
    recommendation: "Highlight project in department annual report",
    signals: ["Exceptional consistency", "Strong analytics"],
    activity: [9, 10, 10, 10, 9, 10, 10, 10, 10, 9, 10, 10],
    cgpa: 9.4,
    section: "Sec A",
    paper: 90,
  },
  {
    id: "stu-mock-9",
    name: "Vivek Joshi",
    roll: "21CSE036",
    batch: "Sec A",
    department: "CSE",
    avatar: "VJ",
    risk: "Healthy",
    confidence: 82,
    priority: "P2",
    concern: "On track",
    streak: "10 days",
    reputation: "Consistent helper",
    attendance: 76,
    submissions: 78,
    velocity: 75,
    ieee: 70,
    viva: 72,
    backlog: "Clear",
    project: "Crop Disease Detection",
    milestone: "Model trained and evaluated",
    deployment: "Preview active",
    bottleneck: "None",
    trend: "Consistent performance matching targets",
    prediction: "Regular delivery likely",
    recommendation: "Ensure validation tests cover all cases",
    signals: ["Steady output"],
    activity: [6, 7, 7, 7, 8, 8, 8, 7, 8, 8, 9, 9],
    cgpa: 7.6,
    section: "Sec A",
    paper: 80,
  },
  {
    id: "stu-mock-10",
    name: "Tanvi Desai",
    roll: "21AIML042",
    batch: "Sec A",
    department: "AIML",
    avatar: "TD",
    risk: "Critical",
    confidence: 88,
    priority: "P1",
    concern: "Detention risk warning active",
    streak: "1 day",
    reputation: "Stagnant project state",
    attendance: 64,
    submissions: 42,
    velocity: 46,
    ieee: 20,
    viva: 30,
    backlog: "2 active",
    project: "Skin Cancer Classifier",
    milestone: "Baseline comparison overdue",
    deployment: "Not started",
    bottleneck: "Unresponsive to milestone reviews",
    trend: "Gradual drop in submission regularity",
    prediction: "Likely delay in final review submission",
    recommendation: "Issue attendance and milestone warnings",
    signals: ["Attendance drop", "Milestone overdue"],
    activity: [4, 3, 3, 2, 2, 1, 2, 1, 0, 1, 1, 0],
    cgpa: 6.8,
    section: "Sec A",
    paper: 20,
  },
];

function toneForRisk(risk: RiskState): Tone {
  if (risk === "Critical") {
    return "critical";
  }

  if (risk === "At Risk" || risk === "Slowing Down") {
    return "attention";
  }

  return "healthy";
}

function toneStyles(tone: Tone) {
  if (tone === "critical") {
    return {
      border: "border-red-200",
      bg: "bg-red-50",
      text: "text-red-700",
      fill: "bg-red-500",
      soft: "border-red-200 bg-red-50 text-red-700",
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

  if (tone === "healthy") {
    return {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      fill: "bg-emerald-500",
      soft: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    border: "border-indigo-200",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    fill: "bg-indigo-500",
    soft: "border-indigo-200 bg-indigo-50 text-indigo-700",
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

function ActivityHeat({ values, tone }: { values: number[]; tone: Tone }) {
  const fillClass = toneStyles(tone).fill;

  return (
    <div className="grid grid-cols-12 gap-1.5">
      {values.map((value, index) => (
        <span
          key={`${value}-${index + 1}`}
          className={cn(
            "h-7 rounded-md border border-white/70 shadow-sm transition hover:scale-105 duration-100",
            value >= 8 ? fillClass : value >= 5 ? "bg-slate-300" : value >= 2 ? "bg-slate-200" : "bg-slate-100",
          )}
        />
      ))}
    </div>
  );
}

export function FacultyStudentIntelligenceView({
  module,
}: FacultyStudentIntelligenceViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedAttendance, setSelectedAttendance] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");

  const [selectedStudentId, setSelectedStudentId] = useState<string>("stu-mock-1");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        student.name.toLowerCase().includes(q) ||
        student.roll.toLowerCase().includes(q) ||
        student.project.toLowerCase().includes(q);

      // 2. Department
      const matchesDept = selectedDept === "all" || student.department === selectedDept;

      // 3. Attendance filter
      let matchesAttendance = true;
      if (selectedAttendance === "healthy") {
        matchesAttendance = student.attendance >= 75;
      } else if (selectedAttendance === "below") {
        matchesAttendance = student.attendance < 75;
      } else if (selectedAttendance === "critical") {
        matchesAttendance = student.attendance < 65;
      }

      // 4. Risk filter
      let matchesRisk = true;
      if (selectedRisk !== "all") {
        if (selectedRisk === "Low") {
          matchesRisk = student.risk === "Healthy";
        } else if (selectedRisk === "High") {
          matchesRisk = student.risk === "At Risk" || student.risk === "Slowing Down";
        } else if (selectedRisk === "Critical") {
          matchesRisk = student.risk === "Critical";
        }
      }

      return matchesSearch && matchesDept && matchesAttendance && matchesRisk;
    });
  }, [searchQuery, selectedDept, selectedAttendance, selectedRisk]);

  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [selectedStudentId]);

  const activeStudentTone = activeStudent ? toneForRisk(activeStudent.risk) : "healthy";
  const activeStudentStyles = toneStyles(activeStudentTone);

  const activeExecutionMetrics = useMemo(() => {
    if (!activeStudent) return [];
    return [
      { label: "Attendance", value: `${activeStudent.attendance}%`, meter: activeStudent.attendance, icon: TrendingDown },
      { label: "Submissions", value: `${activeStudent.submissions}%`, meter: activeStudent.submissions, icon: ClipboardCheck },
      { label: "Project velocity", value: `${activeStudent.velocity}%`, meter: activeStudent.velocity, icon: Rocket },
      { label: "IEEE Paper", value: `${activeStudent.ieee}%`, meter: activeStudent.ieee, icon: BookOpenCheck },
      { label: "Viva readiness", value: `${activeStudent.viva}%`, meter: activeStudent.viva, icon: Video },
      {
        label: "Active Backlog",
        value: activeStudent.backlog,
        meter: activeStudent.backlog === "Clear" ? 100 : 42,
        icon: AlertTriangle,
      },
    ];
  }, [activeStudent]);

  return (
    <div className="space-y-6 bg-white -mx-4 -my-6 p-4 sm:p-6 lg:p-8 xl:p-10 min-h-[calc(100vh-4.5rem)] text-slate-950">
      {/* Title Header */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Students</h1>
        <p className="text-sm text-slate-500 font-medium">
          Academic profiles, attendance, backlogs, risk and readiness — all in one place.
        </p>
      </div>

      {/* Toolbar filter controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-2">
        <div className="relative flex-1 max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-11 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-slate-950"
            placeholder="Search by name, roll, project..."
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-11 w-[160px] rounded-xl border-slate-200 bg-slate-50/50 text-xs shadow-none"
          >
            <option value="all">All departments</option>
            <option value="CSE">CSE</option>
            <option value="AIML">AIML</option>
            <option value="ECE">ECE</option>
            <option value="IT">IT</option>
            <option value="DS">DS</option>
          </Select>
          <Select
            value={selectedAttendance}
            onChange={(e) => setSelectedAttendance(e.target.value)}
            className="h-11 w-[160px] rounded-xl border-slate-200 bg-slate-50/50 text-xs shadow-none"
          >
            <option value="all">All attendance</option>
            <option value="healthy">Healthy (&gt;= 75%)</option>
            <option value="below">Below Safe Threshold (&lt; 75%)</option>
            <option value="critical">High Detention Risk (&lt; 65%)</option>
          </Select>
          <Select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="h-11 w-[140px] rounded-xl border-slate-200 bg-slate-50/50 text-xs shadow-none"
          >
            <option value="all">All risk</option>
            <option value="Low">Low</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </Select>
        </div>
      </div>

      {/* Main Table view */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dept</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">CGPA</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attendance</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Backlogs</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paper</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 bg-white">
              {filteredStudents.map((student) => {
                // Determine attendance styles
                const isDetention = student.attendance < 65;
                const isBelowSafe = student.attendance < 75 && student.attendance >= 65;
                const attBarColor = isDetention ? "bg-red-500" : isBelowSafe ? "bg-amber-500" : "bg-emerald-500";
                const attTextColor = isDetention ? "text-red-600" : isBelowSafe ? "text-amber-600" : "text-emerald-600";

                // Determine risk badge styles
                const isRiskLow = student.risk === "Healthy";
                const isRiskHigh = student.risk === "At Risk" || student.risk === "Slowing Down";
                const riskStyle = isRiskLow
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  : isRiskHigh
                  ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-50"
                  : "bg-red-50 border-red-200 text-red-700 hover:bg-red-50";

                const riskLabel = isRiskLow ? "Low" : isRiskHigh ? "High" : "Critical";

                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Student Identity */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 border border-slate-200 shadow-sm">
                          <AvatarFallback className="bg-slate-100 text-xs font-bold text-slate-700">
                            {student.avatar || initials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 leading-snug">{student.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {student.roll} • {student.batch}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-650">{student.department}</span>
                    </td>

                    {/* CGPA */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-800">{student.cgpa.toFixed(1)}</span>
                    </td>

                    {/* Attendance progress & Warning Label */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2.5">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <div className={cn("h-full rounded-full", attBarColor)} style={{ width: `${student.attendance}%` }} />
                          </div>
                          <span className={cn("text-xs font-extrabold", attTextColor)}>{student.attendance}%</span>
                        </div>
                        {isDetention ? (
                          <p className="text-[10px] text-red-600 font-bold mt-1.5 leading-none">High Detention Risk</p>
                        ) : isBelowSafe ? (
                          <p className="text-[10px] text-amber-600 font-bold mt-1.5 leading-none">Attendance Below Safe Threshold</p>
                        ) : null}
                      </div>
                    </td>

                    {/* Backlogs badges */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      {student.backlog === "Clear" ? (
                        <span className="inline-block rounded-lg border border-emerald-200 bg-emerald-50/50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                          Clear
                        </span>
                      ) : (
                        <span className="inline-block rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-0.5 text-xs font-bold text-red-600">
                          {student.backlog}
                        </span>
                      )}
                    </td>

                    {/* Project Name */}
                    <td className="px-6 py-4.5 whitespace-nowrap max-w-[200px] truncate">
                      <span className="text-xs font-semibold text-slate-800" title={student.project}>
                        {student.project}
                      </span>
                    </td>

                    {/* Paper Completion bar */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 shadow-inner">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${student.paper}%` }} />
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <Badge variant="outline" className={cn("rounded-lg text-[10px] px-2.5 py-0.5 font-bold tracking-wide uppercase border", riskStyle)}>
                        {riskLabel}
                      </Badge>
                    </td>

                    {/* View Link Trigger */}
                    <td className="px-6 py-4.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setIsModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-indigo-600 font-semibold text-xs tracking-wide transition-colors inline-flex items-center gap-1 hover:underline"
                      >
                        view <span className="text-sm font-light leading-none">→</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    <Users2 className="size-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold mt-4 text-slate-700">No students match current filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try broadening your search query or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Profile Details Modal */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6 bg-[#f8fafc]">
          <ModalHeader className="flex justify-between items-center border-b border-slate-250 pb-3.5 mb-5 bg-white -mx-6 -mt-6 p-6 rounded-t-2xl shadow-sm">
            <ModalTitle className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <Bot className="size-5 text-indigo-600" />
              <span>Student Profile Details</span>
            </ModalTitle>
            <ModalCloseButton onClick={() => setIsModalOpen(false)} />
          </ModalHeader>
          {activeStudent && (
            <div className="space-y-6 text-slate-950">
              {/* Profile Card Header */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4.5">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white text-lg font-bold shadow-md">
                    {activeStudent.avatar || initials(activeStudent.name)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{activeStudent.name}</h2>
                      <Badge className={cn("text-xs px-2.5 py-0.5 font-bold border", activeStudentStyles.soft)}>
                        {activeStudent.risk}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 font-semibold px-2 py-0.5 text-xs">
                        {activeStudent.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      {activeStudent.roll} — {activeStudent.batch} — {activeStudent.department}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:self-center">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold px-3 py-1 text-xs">
                    Streak: {activeStudent.streak}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold px-3 py-1 text-xs">
                    Reputation: {activeStudent.reputation}
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
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2">{activeStudent.project}</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{activeStudent.milestone}</p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-slate-200/80 shadow-none bg-white">
                  <CardHeader className="p-4 pb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deployment & Bottleneck</span>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Deployment:</span>
                      <span className="font-semibold text-slate-800">{activeStudent.deployment}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Bottleneck:</span>
                      <span className="font-semibold text-slate-850 truncate max-w-[140px]">{activeStudent.bottleneck}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className={cn("rounded-2xl border shadow-none bg-white", activeStudentStyles.bg, activeStudentStyles.border)}>
                  <CardHeader className="p-4 pb-1">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", activeStudentStyles.text)}>Faculty Concern</span>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 bg-transparent">
                    <p className="text-sm font-bold text-slate-800">{activeStudent.concern}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Risk Score confidence: {activeStudent.confidence}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Execution Metrics progress widgets */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Execution Metrics</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeExecutionMetrics.map((metric) => {
                    const MetricIcon = metric.icon;
                    return (
                      <div key={metric.label} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <MetricIcon className="size-4 text-slate-400" />
                            {metric.label}
                          </span>
                          <span className="text-sm font-bold text-slate-800">{metric.value}</span>
                        </div>
                        <Meter value={metric.meter} tone={activeStudentTone} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Intensity Heatmap */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-850 tracking-wide uppercase">Weekly Execution Intensity</h3>
                  <span className="text-xs text-slate-500 font-semibold">{activeStudent.trend}</span>
                </div>
                <div className="py-2">
                  <ActivityHeat values={activeStudent.activity} tone={activeStudentTone} />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase mt-3 px-1">
                    <span>Week 1 (Old)</span>
                    <span>Week 12 (Recent)</span>
                  </div>
                </div>
              </div>

              {/* Faculty Action Controls */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Faculty Intervention Actions</h3>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 py-5 font-semibold text-xs shadow-sm">
                    <ArrowUpRight className="size-4 text-slate-400" />
                    Open Profile
                  </Button>
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-rose-200 bg-white hover:bg-rose-50 text-rose-750 py-5 font-semibold text-xs shadow-sm">
                    <AlertTriangle className="size-4 text-rose-400" />
                    Send Warning
                  </Button>
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 py-5 font-semibold text-xs shadow-sm">
                    <CalendarClock className="size-4 text-slate-400" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 py-5 font-bold text-xs shadow-sm">
                    <ShieldAlert className="size-4 text-rose-500" />
                    Trigger Intervention
                  </Button>
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 py-5 font-semibold text-xs shadow-sm">
                    <MessageSquareText className="size-4 text-slate-400" />
                    Add Faculty Note
                  </Button>
                  <Button variant="outline" className="justify-start gap-2.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 py-5 font-semibold text-xs shadow-sm">
                    <ClipboardCheck className="size-4 text-slate-400" />
                    Request Review Update
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
