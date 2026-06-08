"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createTeamAction } from "@/lib/actions/team-actions";
import {
  Users2,
  ClipboardCheck,
  ArrowUpRight,
  UserX,
  FileText,
  Clock3,
  AlertTriangle,
  Users,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { FacultyDashboardData } from "@/types/aoip";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

type FacultyDashboardViewProps = {
  data: FacultyDashboardData;
};

function getMetricStyles(tone?: string) {
  switch (tone) {
    case "critical":
      return {
        border: "border-red-100 bg-white",
        text: "text-red-600",
        bgLight: "bg-red-50/50 text-red-600",
        valueColor: "text-red-600",
        iconColor: "text-red-500",
      };
    case "warning":
      return {
        border: "border-amber-100 bg-white",
        text: "text-amber-600",
        bgLight: "bg-amber-50/50 text-amber-600",
        valueColor: "text-amber-600",
        iconColor: "text-amber-500",
      };
    case "positive":
      return {
        border: "border-emerald-100 bg-white",
        text: "text-emerald-600",
        bgLight: "bg-emerald-50/50 text-emerald-600",
        valueColor: "text-emerald-600",
        iconColor: "text-emerald-500",
      };
    default:
      return {
        border: "border-slate-100 bg-white",
        text: "text-slate-500",
        bgLight: "bg-slate-50 text-slate-500",
        valueColor: "text-slate-900",
        iconColor: "text-slate-400",
      };
  }
}

function getHeatmapCardStyles(risk: "Low" | "High" | "Critical") {
  switch (risk) {
    case "Critical":
      return {
        border: "border-red-200 bg-red-50/10 hover:bg-red-50/20",
        riskColor: "text-red-600 font-bold",
        bgBadge: "bg-red-50 text-red-700 border-red-100",
      };
    case "High":
      return {
        border: "border-amber-200 bg-amber-50/10 hover:bg-amber-50/20",
        riskColor: "text-amber-600 font-bold",
        bgBadge: "bg-amber-50 text-amber-700 border-amber-100",
      };
    default:
      return {
        border: "border-emerald-200 bg-emerald-50/10 hover:bg-emerald-50/20",
        riskColor: "text-emerald-600 font-bold",
        bgBadge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      };
  }
}

export function FacultyDashboardView({ data }: FacultyDashboardViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
  });

  const [studentNames, setStudentNames] = useState<string[]>(["", "", "", "", "", ""]);
  const [showStudents, setShowStudents] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const response = await createTeamAction({
        ...formData,
        studentNames: studentNames.filter((name) => name.trim().length > 0),
      });
      if (response.success) {
        toast.success(
          <div>
            <p className="font-bold text-slate-900">Team Created Successfully</p>
            <p className="mt-1 text-sm text-slate-700">
              Team Code: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-indigo-600">{response.teamCode}</code>
            </p>
            <p className="mt-1 text-xs text-slate-500">Share this code with students to join the team.</p>
          </div>,
          { duration: 8000 }
        );
        setIsCreateModalOpen(false);
        setStudentNames(["", "", "", "", "", ""]);
        setShowStudents(false);
        setFormData({
          name: "",
        });
      } else {
        toast.error(response.error);
      }
    });
  };

  // Safe extraction helper for metric cards
  const getCard = (
    index: number,
    defaultLabel: string,
    defaultValue: string,
    defaultDetail: string,
    defaultTone: string
  ) => {
    const stat = data.stats[index];
    return {
      label: stat?.label ?? defaultLabel,
      value: stat?.value ?? defaultValue,
      detail: stat?.detail ?? defaultDetail,
      tone: stat?.tone ?? defaultTone,
    };
  };

  const c1 = getCard(0, "Total students", "10", "across 7 batches", "neutral");
  const c2 = getCard(1, "Below 75% attendance", "4", "needs follow-up", "warning");
  const c3 = getCard(2, "Critical attendance", "3", "< 65% + detention risk", "critical");
  const c4 = getCard(3, "Students with backlogs", "4", "active backlogs", "warning");
  const c5 = getCard(4, "Critical backlog students", "0", "6+ pending · academic risk", "neutral");
  const c6 = getCard(5, "Pending reviews", "22", "Oldest: 3 days", "critical");
  const c7 = getCard(6, "Delayed teams", "3", "Project status off-track", "critical");
  const c8 = getCard(7, "IEEE paper delays", "4", "< 20% paper progress", "warning");
  const c9 = getCard(8, "High-risk students", "4", "High or Critical risk", "critical");

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header Control Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">{data.header.subtitle}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="outline"
            size="sm"
            className="border-border text-foreground bg-white hover:bg-accent"
          >
            <Plus className="size-4 mr-2" />
            Create a team
          </Button>
          <Button variant="outline" size="sm" asChild className="border-border text-foreground bg-white hover:bg-accent">
            <Link href="/faculty/management/teams-batches">
              <Users2 className="size-4 mr-2" />
              View teams
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="border-border text-foreground bg-white hover:bg-accent">
            <Link href="/faculty/management/students">
              <Users className="size-4 mr-2" />
              Students
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/faculty/review/review-queue">
              <ClipboardCheck className="size-4 mr-2" />
              Review queue (22)
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. 9-Metric Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Column 1: Vertical Stack of Total Students (C1) and Critical Backlogs (C5) */}
        <div className="flex flex-col gap-4">
          {/* Card 1: Total Students */}
          <Card className="flex-1 flex flex-col justify-between p-4 h-[100px]">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c1.label}</span>
              <Users className="size-4 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{c1.value}</p>
              <p className="text-xs text-slate-400 mt-1">{c1.detail}</p>
            </div>
          </Card>
          
          {/* Card 5: Critical Backlogs */}
          <Card className="flex-1 flex flex-col justify-between p-4 h-[100px]">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c5.label}</span>
              <AlertTriangle className="size-4 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{c5.value}</p>
              <p className="text-xs text-slate-400 mt-1">{c5.detail}</p>
            </div>
          </Card>
        </div>

        {/* Column 2: Below 75% Attendance (C2) */}
        <Card className={cn("p-5 flex flex-col justify-between h-[216px]", getMetricStyles(c2.tone).border)}>
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-relaxed max-w-[80%]">{c2.label}</span>
            <span className={cn("p-1.5 rounded-lg", getMetricStyles(c2.tone).bgLight)}>
              <AlertTriangle className="size-4" />
            </span>
          </div>
          <div className="mt-4">
            <p className={cn("text-5xl font-bold tracking-tight", getMetricStyles(c2.tone).valueColor)}>{c2.value}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">{c2.detail}</p>
          </div>
        </Card>

        {/* Column 3: Critical Attendance (C3) */}
        <Card className={cn("p-5 flex flex-col justify-between h-[216px]", getMetricStyles(c3.tone).border)}>
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-relaxed max-w-[80%]">{c3.label}</span>
            <span className={cn("p-1.5 rounded-lg", getMetricStyles(c3.tone).bgLight)}>
              <UserX className="size-4" />
            </span>
          </div>
          <div className="mt-4">
            <p className={cn("text-5xl font-bold tracking-tight", getMetricStyles(c3.tone).valueColor)}>{c3.value}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">{c3.detail}</p>
          </div>
        </Card>

        {/* Column 4: Students with Backlogs (C4) */}
        <Card className={cn("p-5 flex flex-col justify-between h-[216px]", getMetricStyles(c4.tone).border)}>
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-relaxed max-w-[80%]">{c4.label}</span>
            <span className={cn("p-1.5 rounded-lg", getMetricStyles(c4.tone).bgLight)}>
              <FileText className="size-4" />
            </span>
          </div>
          <div className="mt-4">
            <p className={cn("text-5xl font-bold tracking-tight", getMetricStyles(c4.tone).valueColor)}>{c4.value}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">{c4.detail}</p>
          </div>
        </Card>
      </div>

      {/* Row 2: Bottom row of 4 metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 6: Pending Reviews */}
        <Card className={cn("p-5 flex flex-col justify-between h-[180px]", getMetricStyles(c6.tone).border)}>
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-relaxed max-w-[85%]">{c6.label}</span>
            <span className={cn("p-1.5 rounded-lg", getMetricStyles(c6.tone).bgLight)}>
              <ClipboardCheck className="size-4" />
            </span>
          </div>
          <div>
            <p className={cn("text-4xl font-bold tracking-tight", getMetricStyles(c6.tone).valueColor)}>{c6.value}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">{c6.detail}</p>
          </div>
        </Card>

        {/* Card 7: Delayed Teams */}
        <Card className={cn("p-5 flex flex-col justify-between h-[180px]", getMetricStyles(c7.tone).border)}>
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-relaxed max-w-[85%]">{c7.label}</span>
            <span className={cn("p-1.5 rounded-lg", getMetricStyles(c7.tone).bgLight)}>
              <Clock3 className="size-4" />
            </span>
          </div>
          <div>
            <p className={cn("text-4xl font-bold tracking-tight", getMetricStyles(c7.tone).valueColor)}>{c7.value}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">{c7.detail}</p>
          </div>
        </Card>

        {/* Card 8: IEEE Paper Delays */}
        <Card className={cn("p-5 flex flex-col justify-between h-[180px]", getMetricStyles(c8.tone).border)}>
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-relaxed max-w-[85%]">{c8.label}</span>
            <span className={cn("p-1.5 rounded-lg", getMetricStyles(c8.tone).bgLight)}>
              <FileText className="size-4" />
            </span>
          </div>
          <div>
            <p className={cn("text-4xl font-bold tracking-tight", getMetricStyles(c8.tone).valueColor)}>{c8.value}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">{c8.detail}</p>
          </div>
        </Card>

        {/* Card 9: High-Risk Students */}
        <Card className={cn("p-5 flex flex-col justify-between h-[180px]", getMetricStyles(c9.tone).border)}>
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-relaxed max-w-[85%]">{c9.label}</span>
            <span className={cn("p-1.5 rounded-lg", getMetricStyles(c9.tone).bgLight)}>
              <AlertTriangle className="size-4" />
            </span>
          </div>
          <div>
            <p className={cn("text-4xl font-bold tracking-tight", getMetricStyles(c9.tone).valueColor)}>{c9.value}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">{c9.detail}</p>
          </div>
        </Card>
      </div>

      {/* 4. Split Layout - Weekly Throughput + Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Weekly Submission Throughput (Recharts Line Chart) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Weekly submission throughput</CardTitle>
            <p className="text-xs text-slate-400 mt-1">Submissions vs approvals across all batches</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.submissionSeries}
                  margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="week"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    domain={[0, 60]}
                    ticks={[0, 15, 30, 45, 60]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="submitted"
                    name="submissions"
                    stroke="var(--warning, #ea580c)"
                    strokeWidth={2}
                    dot={{ fill: "var(--warning, #ea580c)", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reviewed"
                    name="approved"
                    stroke="var(--chart-1, #0d9488)"
                    strokeWidth={2}
                    dot={{ fill: "var(--chart-1, #0d9488)", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", color: "#64748b", paddingTop: "15px" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Batches Live Progress List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Batches</CardTitle>
            <p className="text-xs text-slate-400 mt-1">Live progress snapshot</p>
          </CardHeader>
          <CardContent className="h-[300px] overflow-y-auto pr-1">
            <div className="space-y-4">
              {data.batchesSnapshot.map((item) => (
                <div key={item.batch} className="space-y-1 py-1 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.batch}</span>
                    <span className="text-slate-400">
                      <span className="font-medium text-slate-700">{item.activeStudents}/{item.totalStudents} active</span>
                      <span className="ml-2 font-bold text-slate-800">{item.progress}%</span>
                    </span>
                  </div>
                  <Progress value={item.progress} className="h-1.5 bg-slate-100" />
                  {item.pendingReviews > 0 ? (
                    <p className="text-[10px] font-semibold text-orange-600 flex items-center gap-1 mt-1">
                      <span className="inline-block size-1.5 rounded-full bg-orange-500" />
                      {item.pendingReviews} pending review{item.pendingReviews > 1 ? "s" : ""}
                    </p>
                  ) : (
                    <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-1">
                      <span className="inline-block size-1.5 rounded-full bg-slate-300" />
                      No pending reviews
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Needs Attention Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-slate-800">Needs attention</CardTitle>
          <p className="text-xs text-slate-400 mt-1">Inactive teams & overdue work</p>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.needsAttention.map((item) => {
              const isInactive = item.status === "Inactive";
              const letter = item.team.replace("Team ", "").charAt(0);
              return (
                <div
                  key={item.team}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-full bg-slate-50 text-xs font-bold text-slate-400 border border-slate-100">
                      {letter}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        {item.team} - {item.batch}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold border shadow-none",
                      isInactive
                        ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
                        : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
                    )}
                  >
                    {item.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <ModalContent className="max-w-xl">
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              <div>
                <ModalTitle>Create a team</ModalTitle>
                <ModalDescription>
                  Initialize a new student project team and assign milestones.
                </ModalDescription>
              </div>
              <ModalCloseButton onClick={() => setIsCreateModalOpen(false)} />
            </ModalHeader>
            <ModalBody className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="team-name" className="text-xs font-semibold text-slate-600">
                  Team Name
                </label>
                <Input
                  id="team-name"
                  name="name"
                  placeholder="e.g. Team Quantum"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 tracking-wide block uppercase">
                  Assign Team Members
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStudents(!showStudents)}
                    className={cn(
                      "rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-2 px-4 py-2 transition-all duration-200",
                      showStudents && "border-slate-800 bg-slate-50"
                    )}
                  >
                    <Users className="size-4 text-slate-500" />
                    <span className="font-medium text-sm">Student Names</span>
                    <span className="inline-flex items-center justify-center bg-slate-100 text-slate-800 text-xs font-bold px-2 py-0.5 rounded-full min-w-5 h-5">
                      {studentNames.filter((name) => name.trim().length > 0).length}
                    </span>
                  </Button>
                </div>

                {showStudents && (
                  <div className="mt-2 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-inner space-y-3">
                    <p className="text-[11px] font-medium text-slate-500">
                      Enter up to 6 student names to assign to this team.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {studentNames.map((name, index) => (
                        <div key={index} className="space-y-1">
                          <label htmlFor={`student-name-${index}`} className="text-[10px] font-semibold text-slate-500 block">
                            Student {index + 1}
                          </label>
                          <Input
                            id={`student-name-${index}`}
                            placeholder="e.g. Aarav Sharma"
                            value={name}
                            onChange={(e) => {
                              const newNames = [...studentNames];
                              newNames[index] = e.target.value;
                              setStudentNames(newNames);
                            }}
                            className="bg-white text-xs h-9 rounded-xl border-slate-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 min-w-[100px]"
              >
                {isPending ? "Creating..." : "Create Team"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
