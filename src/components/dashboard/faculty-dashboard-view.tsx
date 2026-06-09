"use client";

import Link from "next/link";
import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTeamAction } from "@/lib/actions/team-actions";
import { submitReviewAction } from "@/lib/actions/review-actions";
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
  Check,
  Copy,
  BadgeCheck,
  LayoutDashboard,
  LineChart,
  Bell,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Link2,
  Calendar,
  Settings,
  Sparkles,
  GitBranch,
  Video,
  FileDown,
  History,
  Archive,
  RefreshCw,
  X,
  ArrowRight,
  Activity,
  CheckCircle2,
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
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { FileManager } from "@/components/dashboard/file-manager";

type FacultyDashboardViewProps = {
  data: FacultyDashboardData;
};

type ActiveTab = "overview" | "teams" | "reviews" | "evaluations" | "insights" | "notifications";

function getMetricStyles(tone?: string) {
  switch (tone) {
    case "critical":
      return {
        border: "border-red-100 bg-white shadow-sm",
        text: "text-red-600",
        bgLight: "bg-red-50/50 text-red-600",
        valueColor: "text-red-600",
        iconColor: "text-red-500",
      };
    case "warning":
      return {
        border: "border-amber-100 bg-white shadow-sm",
        text: "text-amber-600",
        bgLight: "bg-amber-50/50 text-amber-600",
        valueColor: "text-amber-600",
        iconColor: "text-amber-500",
      };
    case "positive":
      return {
        border: "border-emerald-100 bg-white shadow-sm",
        text: "text-emerald-600",
        bgLight: "bg-emerald-50/50 text-emerald-600",
        valueColor: "text-emerald-600",
        iconColor: "text-emerald-500",
      };
    default:
      return {
        border: "border-slate-100 bg-white shadow-sm",
        text: "text-slate-500",
        bgLight: "bg-slate-50 text-slate-500",
        valueColor: "text-slate-900",
        iconColor: "text-slate-400",
      };
  }
}

export function FacultyDashboardView({ data }: FacultyDashboardViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  
  // Create Team Modal State (Preserved)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({ name: "" });
  const [createdTeamCode, setCreatedTeamCode] = useState<string | null>(null);
  const [studentNames, setStudentNames] = useState<string[]>(["", "", "", "", "", ""]);
  const [showStudents, setShowStudents] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [weekFilter, setWeekFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detailed Modal State
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [selectedReview, setSelectedReview] = useState<any | null>(null); // Milestone review or weekly evaluation
  const [isReviewModalWeekly, setIsReviewModalWeekly] = useState(false); // contribution vs milestone submission

  // Evaluation Form State
  const [completeness, setCompleteness] = useState(8);
  const [quality, setQuality] = useState(8);
  const [documentation, setDocumentation] = useState(8);
  const [timeliness, setTimeliness] = useState(8);
  const [feedbackText, setFeedbackText] = useState("");
  const [revisionNotesText, setRevisionNotesText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Notifications live state
  const [localNotifications, setLocalNotifications] = useState<any[]>(data.notifications || []);
  const [notificationFilter, setNotificationFilter] = useState("all");

  useEffect(() => {
    if (data.notifications) {
      setLocalNotifications(data.notifications);
    }
  }, [data.notifications]);

  // Derived metrics
  const assignedTeamsList = data.assignedTeams || [];
  const allSubmissions = data.assignedTeams?.flatMap((t) => t.submissions) || [];
  const allContributions = data.assignedTeams?.flatMap((t) => t.contributions) || [];
  
  const totalAssignedTeams = assignedTeamsList.length;
  const activeProjectsCount = assignedTeamsList.filter((t) => t.project).length;
  
  const pendingMilestoneCount = allSubmissions.filter((s) => s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW").length;
  const pendingWeeklyCount = allContributions.filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW").length;
  const totalPendingReviews = pendingMilestoneCount + pendingWeeklyCount;

  const approvedSubmissionsCount = allSubmissions.filter((s) => s.status === "APPROVED").length + 
                                  allContributions.filter((c) => c.status === "REVIEWED").length;

  const revisionRequestsCount = allSubmissions.filter((s) => s.status === "REVISION_REQUIRED").length + 
                                allContributions.filter((c) => c.evaluations?.some((e: any) => e.status === "REVISION_REQUIRED")).length;

  const averageTeamProgress = useMemo(() => {
    if (totalAssignedTeams === 0) return 0;
    const total = assignedTeamsList.reduce((sum, t) => sum + (t.project?.progress || 0), 0);
    return Math.round(total / totalAssignedTeams);
  }, [assignedTeamsList, totalAssignedTeams]);

  // Teams Filtered List
  const filteredTeams = useMemo(() => {
    return assignedTeamsList.filter((team) => {
      const query = searchQuery.toLowerCase();
      const matchQuery = team.name.toLowerCase().includes(query) || 
                         team.teamCode.toLowerCase().includes(query) ||
                         team.project?.title?.toLowerCase().includes(query) ||
                         team.selectedProblemStatement?.title?.toLowerCase().includes(query);

      const matchBatch = batchFilter === "all" || team.batch === batchFilter;
      const matchWeek = weekFilter === "all" || team.currentWeek.toString() === weekFilter;
      
      let matchProgress = true;
      if (progressFilter === "low") matchProgress = (team.project?.progress || 0) < 40;
      else if (progressFilter === "medium") matchProgress = (team.project?.progress || 0) >= 40 && (team.project?.progress || 0) < 70;
      else if (progressFilter === "high") matchProgress = (team.project?.progress || 0) >= 70;

      let matchStatus = true;
      if (statusFilter !== "all") matchStatus = team.state === statusFilter;

      return matchQuery && matchBatch && matchWeek && matchProgress && matchStatus;
    });
  }, [assignedTeamsList, searchQuery, batchFilter, weekFilter, progressFilter, statusFilter]);

  const uniqueBatches = useMemo(() => {
    return Array.from(new Set(assignedTeamsList.map((t) => t.batch)));
  }, [assignedTeamsList]);

  // Review Queue Categories
  const pendingReviewsList = useMemo(() => {
    const milestones = allSubmissions.filter((s) => s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW")
      .map(s => ({ ...s, isWeekly: false, teamName: assignedTeamsList.find(t => t.id === s.teamId)?.name || "Team" }));
    const weekly = allContributions.filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW")
      .map(c => ({ 
        ...c, 
        isWeekly: true, 
        teamName: c.milestone?.project?.team?.name || "Team",
        teamId: c.milestone?.project?.team?.id,
        projectId: c.milestone?.projectId,
        weekNumber: c.milestone?.weekNumber
      }));
    return [...milestones, ...weekly].sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime());
  }, [allSubmissions, allContributions, assignedTeamsList]);

  const resubmissionsList = useMemo(() => {
    // Check weekly contributions where there are previous evaluations but it is back to SUBMITTED
    return allContributions.filter((c) => c.status === "SUBMITTED" && c.evaluations && c.evaluations.length > 1)
      .map(c => ({ 
        ...c, 
        isWeekly: true, 
        teamName: c.milestone?.project?.team?.name || "Team",
        teamId: c.milestone?.project?.team?.id,
        projectId: c.milestone?.projectId,
        weekNumber: c.milestone?.weekNumber
      }));
  }, [allContributions]);

  const recentlyReviewedList = useMemo(() => {
    const milestones = allSubmissions.filter((s) => s.status === "APPROVED" || s.status === "REJECTED" || s.status === "REVISION_REQUIRED")
      .map(s => ({ ...s, isWeekly: false, teamName: assignedTeamsList.find(t => t.id === s.teamId)?.name || "Team" }));
    const weekly = allContributions.filter((c) => c.status === "REVIEWED" || c.status === "REJECTED")
      .map(c => ({ 
        ...c, 
        isWeekly: true, 
        teamName: c.milestone?.project?.team?.name || "Team",
        teamId: c.milestone?.project?.team?.id,
        projectId: c.milestone?.projectId,
        weekNumber: c.milestone?.weekNumber
      }));
    return [...milestones, ...weekly].sort((a, b) => new Date(b.reviewedAt || b.updatedAt).getTime() - new Date(a.reviewedAt || a.updatedAt).getTime());
  }, [allSubmissions, allContributions, assignedTeamsList]);

  // Performance Insights calculations
  const teamsOnTrackCount = useMemo(() => {
    return assignedTeamsList.filter((t) => (t.project?.progress || 0) >= (t.currentWeek * 12.5)).length;
  }, [assignedTeamsList]);

  const teamsBehindCount = totalAssignedTeams - teamsOnTrackCount;

  const averageEvaluationScore = useMemo(() => {
    const approvedContributions = allContributions.filter(c => c.status === "REVIEWED");
    if (approvedContributions.length === 0) return "N/A";
    const sum = approvedContributions.reduce((acc, c) => {
      const score = c.evaluations?.find((e: any) => e.status === "APPROVED")?.score ?? c.facultyMarks ?? 0;
      return acc + score;
    }, 0);
    return (sum / approvedContributions.length).toFixed(1);
  }, [allContributions]);

  const submissionCompletionRate = useMemo(() => {
    const totalExpected = assignedTeamsList.reduce((acc, t) => acc + (t.studentsList?.length || 0) * 8, 0);
    if (totalExpected === 0) return 0;
    const totalApproved = allContributions.filter((c) => c.status === "REVIEWED").length;
    return Math.round((totalApproved / totalExpected) * 100);
  }, [assignedTeamsList, allContributions]);

  // Handle Team Creation Submit (Preserved exactly)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const response = await createTeamAction({
        ...formData,
        studentNames: studentNames.filter((name) => name.trim().length > 0),
      });
      if (response.success) {
        setCreatedTeamCode(response.teamCode || null);
        toast.success("Team created successfully!");
        router.refresh();
      } else {
        toast.error(response.error);
      }
    });
  };

  // Handle Review Modal Triggers
  const openReviewModal = (item: any) => {
    setSelectedReview(item);
    setIsReviewModalWeekly(item.isWeekly);
    
    // Set rubrics defaults or reset
    if (item.isWeekly) {
      const latestApproved = item.evaluations?.find((e: any) => e.status === "APPROVED");
      setCompleteness(latestApproved?.completeness ?? 8);
      setQuality(latestApproved?.quality ?? 8);
      setDocumentation(latestApproved?.documentation ?? 8);
      setTimeliness(latestApproved?.timeliness ?? 8);
      setFeedbackText(latestApproved?.feedback ?? "");
      setRevisionNotesText(latestApproved?.revisionNotes ?? "");
    } else {
      const latestRev = item.reviews?.[0];
      setCompleteness(8);
      setQuality(8);
      setDocumentation(8);
      setTimeliness(8);
      setFeedbackText(latestRev?.comments ?? "");
      setRevisionNotesText("");
    }
  };

  // Submit Weekly Task Evaluation
  const submitWeeklyEvaluation = async (status: "APPROVED" | "REJECTED" | "REVISION_REQUIRED") => {
    if (!selectedReview) return;
    setIsSubmittingReview(true);
    
    const finalCalculatedScore = Number(((completeness + quality + documentation + timeliness) / 4).toFixed(1));

    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedReview.teamId,
          projectId: selectedReview.projectId,
          weekNumber: selectedReview.weekNumber,
          submissionId: selectedReview.id,
          status,
          feedback: feedbackText,
          score: finalCalculatedScore,
          completeness,
          quality,
          documentation,
          timeliness,
          revisionNotes: status === "REVISION_REQUIRED" ? revisionNotesText : "",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          toast.success("Evaluation recorded successfully!");
          setSelectedReview(null);
          router.refresh();
        } else {
          toast.error(json.message || "Failed to record evaluation.");
        }
      } else {
        toast.error("Failed to record evaluation.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Submit Milestone Review
  const submitMilestoneReview = (decision: "APPROVED" | "REJECTED" | "REVISION_REQUIRED") => {
    if (!selectedReview) return;
    setIsSubmittingReview(true);

    const calculatedScore = Math.round(((completeness + quality + documentation + timeliness) / 4) * 10);
    const comments = feedbackText.trim() || "Review submitted.";

    startTransition(async () => {
      const result = await submitReviewAction({
        comments,
        decision,
        score: calculatedScore,
        submissionId: selectedReview.id,
      });

      if (result.success) {
        toast.success("Milestone review submitted successfully.");
        setSelectedReview(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
      setIsSubmittingReview(false);
    });
  };

  // Notifications Actions
  const markNotificationAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      if (res.ok) {
        setLocalNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: "READ", readAt: new Date().toISOString() } : n))
        );
        toast.success("Notification marked as read.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const archiveNotificationItem = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/archive`, { method: "POST" });
      if (res.ok) {
        setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success("Notification archived.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "POST" });
      if (res.ok) {
        setLocalNotifications((prev) =>
          prev.map((n) => ({ ...n, status: "READ", readAt: new Date().toISOString() }))
        );
        toast.success("All notifications marked as read.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filters notifications
  const filteredNotifications = useMemo(() => {
    return localNotifications.filter((n) => {
      if (notificationFilter === "unread") return n.status === "UNREAD";
      if (notificationFilter === "archived") return n.status === "ARCHIVED";
      return n.status !== "ARCHIVED";
    });
  }, [localNotifications, notificationFilter]);

  // Safe helper to match custom stats
  const getCard = (index: number, defaultLabel: string, defaultValue: string, defaultDetail: string, defaultTone: string) => {
    const stat = data.stats[index];
    return {
      label: stat?.label ?? defaultLabel,
      value: stat?.value ?? defaultValue,
      detail: stat?.detail ?? defaultDetail,
      tone: stat?.tone ?? defaultTone,
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Workspace Header Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
            Centralized Faculty Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            {data.header.subtitle || `${totalAssignedTeams} assigned teams · ${activeProjectsCount} active projects`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-800 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm h-10 px-4"
          >
            <Plus className="size-4 mr-2" />
            Create a team
          </Button>
          <Button variant="outline" size="sm" asChild className="border-slate-200 text-slate-800 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm h-10 px-4">
            <Link href="/faculty/management/teams-batches">
              <Users2 className="size-4 mr-2" />
              Manage Teams
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="border-slate-200 text-slate-800 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm h-10 px-4">
            <Link href="/faculty/management/students">
              <Users className="size-4 mr-2" />
              Manage Students
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="border-slate-200 text-slate-800 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm h-10 px-4">
            <Link href="/faculty/analytics">
              <LineChart className="size-4 mr-2 text-indigo-650" />
              Analytics & Reports
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="border-indigo-100 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 font-bold rounded-xl shadow-sm h-10 px-4">
            <Link href="/faculty/evaluation">
              <BadgeCheck className="size-4 mr-2" />
              Evaluation Center
            </Link>
          </Button>
          <Button size="sm" asChild className="bg-slate-900 text-white hover:bg-slate-850 font-bold rounded-xl shadow-sm h-10 px-4">
            <Link href="/faculty/review/review-queue">
              <ClipboardCheck className="size-4 mr-2" />
              Review Queue ({totalPendingReviews})
            </Link>
          </Button>
        </div>
      </div>

      {/* Glassmorphic Workspace Menu Tabs */}
      <div className="flex border border-slate-200/60 bg-white/70 backdrop-blur-md rounded-2xl p-1.5 shadow-sm overflow-x-auto space-x-1">
        {(
          [
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "teams", label: "Assigned Teams", icon: Users },
            { id: "reviews", label: "Review Queue", icon: ClipboardCheck, badge: totalPendingReviews },
            { id: "evaluations", label: "Evaluations & History", icon: BadgeCheck },
            { id: "insights", label: "Performance Insights", icon: LineChart },
            { id: "notifications", label: "Notifications Panel", icon: Bell, badge: localNotifications.filter(n => n.status === "UNREAD").length },
          ] as Array<{ id: ActiveTab; label: string; icon: any; badge?: number }>
        ).map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap",
                isSelected
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={cn(
                  "ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold border",
                  isSelected
                    ? "bg-white/20 border-white/10 text-white"
                    : "bg-indigo-50 border-indigo-100 text-indigo-700"
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* -------------------- 1. OVERVIEW TAB -------------------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Workspace Stats Overview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="p-4 flex flex-col justify-between h-[108px] border-slate-100 shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Teams</span>
                <Users2 className="size-4 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-950 leading-none">{totalAssignedTeams}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Active Roster</p>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between h-[108px] border-slate-100 shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Projects</span>
                <Sparkles className="size-4 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-950 leading-none">{activeProjectsCount}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Weekly Tracked</p>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between h-[108px] border-red-100 shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Pending Reviews</span>
                <Clock3 className="size-4 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-red-600 leading-none">{totalPendingReviews}</p>
                <p className="text-[10px] text-red-400 mt-1 font-semibold">Requires Action</p>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between h-[108px] border-emerald-100 shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Approved Work</span>
                <BadgeCheck className="size-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-emerald-600 leading-none">{approvedSubmissionsCount}</p>
                <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Milestones Cleared</p>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between h-[108px] border-amber-100 shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Revisions</span>
                <AlertTriangle className="size-4 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-amber-600 leading-none">{revisionRequestsCount}</p>
                <p className="text-[10px] text-amber-400 mt-1 font-semibold">Revision Actions</p>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between h-[108px] border-indigo-100 shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Avg Progress</span>
                <LineChart className="size-4 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-indigo-600 leading-none">{averageTeamProgress}%</p>
                <p className="text-[10px] text-indigo-400 mt-1 font-semibold">Completion Average</p>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-800">Weekly submission throughput</CardTitle>
                <p className="text-xs text-slate-400">Submissions vs approvals across all batches</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={data.submissionSeries}
                      margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 60]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          fontSize: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                      />
                      <Line type="monotone" dataKey="submitted" name="submissions" stroke="#f97316" strokeWidth={2.5} dot={{ fill: "#f97316", r: 4 }} />
                      <Line type="monotone" dataKey="reviewed" name="approved" stroke="#0d9488" strokeWidth={2.5} dot={{ fill: "#0d9488", r: 4 }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#64748b", paddingTop: "15px" }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-800">Recent Notifications</CardTitle>
                <p className="text-xs text-slate-400">Submissions & system alerts</p>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                {localNotifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No notifications received.</p>
                ) : (
                  localNotifications.slice(0, 5).map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl border border-slate-50 bg-slate-50/20 text-xs flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-500 leading-normal">{n.message}</p>
                    </div>
                  ))
                )}
                {localNotifications.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold text-indigo-600 hover:text-indigo-700" onClick={() => setActiveTab("notifications")}>
                    View All Notifications <ArrowRight className="size-3 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Needs Attention & Batches Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-800">Needs attention</CardTitle>
                <p className="text-xs text-slate-400">Inactive teams & overdue milestones</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {data.needsAttention.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-xs text-slate-400">All teams are executing smoothly.</div>
                ) : (
                  data.needsAttention.map((item) => {
                    const isInactive = item.status === "Inactive";
                    return (
                      <div key={item.team} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-white">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{item.team} - {item.batch}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.detail}</p>
                        </div>
                        <Badge className={cn(
                          "rounded-full px-2 py-0.5 text-[9px] font-extrabold border shadow-none",
                          isInactive ? "border-red-100 bg-red-50 text-red-700" : "border-amber-100 bg-amber-50 text-amber-700"
                        )}>
                          {item.status}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-800">Batches snapshot</CardTitle>
                <p className="text-xs text-slate-400">Live progress snapshot</p>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
                {data.batchesSnapshot.map((item) => (
                  <div key={item.batch} className="space-y-1 py-1 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.batch}</span>
                      <span className="text-slate-400 font-semibold">
                        <span className="text-slate-700">{item.activeStudents}/{item.totalStudents} active</span>
                        <span className="ml-2.5 font-bold text-slate-900">{item.progress}%</span>
                      </span>
                    </div>
                    <Progress value={item.progress} className="h-1.5 bg-slate-100" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* -------------------- 2. ASSIGNED TEAMS TAB -------------------- */}
      {activeTab === "teams" && (
        <div className="space-y-4">
          {/* Search and Filters panel */}
          <div className="border border-slate-200/60 bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3.5 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
              <Input
                placeholder="Search team name, code, problem statement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl border-slate-200 text-xs font-semibold bg-slate-50/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch</span>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Batches</option>
                  {uniqueBatches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Week</span>
                <select
                  value={weekFilter}
                  onChange={(e) => setWeekFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Weeks</option>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
                    <option key={w} value={w}>Week {w}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                <select
                  value={progressFilter}
                  onChange={(e) => setProgressFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Progress</option>
                  <option value="low">Low Progress (&lt;40%)</option>
                  <option value="medium">Medium (40%-70%)</option>
                  <option value="high">High Progress (&ge;70%)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Healthy execution">Healthy</option>
                  <option value="Needs review">Needs Review</option>
                  <option value="Slowing down">Slowing Down</option>
                  <option value="Blocked">Blocked</option>
                  <option value="High risk">High Risk</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Teams Grid list */}
          {filteredTeams.length === 0 ? (
            <div className="border border-dashed border-slate-200 bg-white rounded-2xl p-10 text-center flex flex-col items-center justify-center">
              <Users className="size-8 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">No teams found matching search/filter filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => {
                const leadName = team.studentsList?.find((s: any) => s.role === "TEAM_LEAD")?.name ?? "No Lead Assigned";
                const isNeedReview = team.state === "Needs review";
                return (
                  <Card key={team.id} className="border-slate-100 hover:border-slate-300/80 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden flex flex-col justify-between">
                    <div className="p-5 space-y-4">
                      {/* Top Metadata */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{team.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                              Batch: {team.batch}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50/40 border border-indigo-100/55 rounded px-1.5 py-0.5">
                              {team.teamCode}
                            </span>
                          </div>
                        </div>
                        <Badge className={cn(
                          "rounded-full px-2.5 py-0.5 text-[9px] font-extrabold border shadow-none shrink-0",
                          team.state === "Healthy execution" ? "border-emerald-100 bg-emerald-50 text-emerald-700" :
                          team.state === "Blocked" ? "border-slate-200 bg-slate-50 text-slate-700" :
                          team.state === "High risk" || team.state === "Critical" ? "border-red-100 bg-red-50 text-red-700" :
                          "border-amber-100 bg-amber-50 text-amber-700"
                        )}>
                          {team.state}
                        </Badge>
                      </div>

                      {/* Problem Statement details */}
                      <div className="rounded-2xl bg-slate-50/50 border border-slate-100 p-3 text-xs leading-normal">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Selected Problem</span>
                        <p className="font-extrabold text-slate-800 truncate" title={team.selectedProblemStatement?.title ?? "No Problem statement Selected"}>
                          {team.selectedProblemStatement?.title ?? "No problem selected yet"}
                        </p>
                      </div>

                      {/* Progress Metrics */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">Progress</span>
                          <span className="font-extrabold text-slate-800">{team.project?.progress ?? 0}%</span>
                        </div>
                        <Progress value={team.project?.progress ?? 0} className="h-1.5 bg-slate-100" />
                      </div>

                      {/* Info Summary lists */}
                      <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3.5">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Team Lead</span>
                          <span className="font-bold text-slate-700 truncate block mt-0.5">{leadName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Week Status</span>
                          <span className="font-bold text-slate-700 block mt-0.5">Week {team.currentWeek}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/30 px-5 py-3.5 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                        {team.members} Members
                      </span>
                      <Button
                        onClick={() => setSelectedTeam(team)}
                        className="bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-xl px-4 py-2 text-xs font-bold shadow-sm flex items-center gap-1.5"
                      >
                        Open Detail View <ArrowUpRight className="size-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* -------------------- 3. REVIEW QUEUE TAB -------------------- */}
      {activeTab === "reviews" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Columns: Review items lists */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Reviews list */}
            <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/20">
                <div>
                  <CardTitle className="text-base font-extrabold text-slate-900">Pending Reviews & Resubmissions</CardTitle>
                  <p className="text-xs text-slate-400">Items requiring verification and grading</p>
                </div>
                <Badge className="bg-orange-50 border border-orange-100 text-orange-700 font-extrabold rounded-full px-2.5 py-0.5">
                  {pendingReviewsList.length} Action Item{pendingReviewsList.length !== 1 && "s"}
                </Badge>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {pendingReviewsList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">No pending submissions in queue.</p>
                ) : (
                  pendingReviewsList.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-slate-50/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-slate-900">{item.teamName}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5">
                            {item.isWeekly ? `Week ${item.weekNumber}` : "Milestone"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-700 mt-1">{item.title || item.submissionTitle}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Submitted: {new Date(item.submittedAt || item.createdAt).toLocaleString()}</p>
                      </div>

                      <Button
                        onClick={() => openReviewModal(item)}
                        className="bg-slate-900 hover:bg-slate-850 text-white rounded-xl font-bold text-xs h-9 px-4 shadow-sm shrink-0 flex items-center gap-1"
                      >
                        Evaluate Submission <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recently Reviewed List */}
            <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20">
                <CardTitle className="text-base font-extrabold text-slate-900">Recently Evaluated Work</CardTitle>
                <p className="text-xs text-slate-400">Historical reviews verified in this workspace</p>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {recentlyReviewedList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">No reviewed items yet.</p>
                ) : (
                  recentlyReviewedList.map((item) => {
                    const latestApproved = item.isWeekly 
                      ? item.evaluations?.find((e: any) => e.status === "APPROVED")
                      : null;
                    const displayScore = latestApproved ? latestApproved.score : item.score;
                    return (
                      <div key={item.id} className="p-4 hover:bg-slate-50/10 transition-colors flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800">{item.teamName}</span>
                            <span className="text-[9px] font-bold uppercase text-slate-400">{item.isWeekly ? `Week ${item.weekNumber}` : "Milestone"}</span>
                          </div>
                          <h4 className="font-bold text-slate-600 mt-1 truncate max-w-[280px]">{item.title || item.submissionTitle}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          {displayScore && (
                            <Badge className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold">
                              Score: {displayScore}/10
                            </Badge>
                          )}
                          <Badge className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-extrabold border shadow-none",
                            item.status === "APPROVED" || item.status === "REVIEWED" ? "border-emerald-100 bg-emerald-50 text-emerald-700" :
                            item.status === "REVISION_REQUIRED" ? "border-amber-100 bg-amber-50 text-amber-700" : "border-red-100 bg-red-50 text-red-700"
                          )}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Templates & Guidelines */}
          <div className="space-y-6">
            <Card className="border-slate-100 shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="text-sm font-extrabold text-slate-900">Academic Review Rubrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-slate-500 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <span className="size-2 rounded-full bg-slate-900" /> Completeness (25%)
                  </h4>
                  <p>Has the team accomplished all criteria and tasks generated for the current week?</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <span className="size-2 rounded-full bg-slate-900" /> Implementation Quality (25%)
                  </h4>
                  <p>Quality of work, clean repository commits, hosting deployment status, and functionality.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <span className="size-2 rounded-full bg-slate-900" /> Documentation (25%)
                  </h4>
                  <p>Accurate comments, readable README explanation, and clear workflow diagrams.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <span className="size-2 rounded-full bg-slate-900" /> Timeliness (25%)
                  </h4>
                  <p>Weekly submission speed. Penalty should be applied automatically for late uploads.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* -------------------- 4. EVALUATIONS TAB -------------------- */}
      {activeTab === "evaluations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roster of weekly evaluations */}
            <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20">
                <CardTitle className="text-base font-extrabold text-slate-900">Historical Weekly Evaluations</CardTitle>
                <p className="text-xs text-slate-400">Detailed list of recorded evaluations and grades</p>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {allContributions.filter(c => c.evaluations?.length > 0).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">No weekly evaluations logged yet.</p>
                ) : (
                  allContributions.filter(c => c.evaluations?.length > 0).map((c) => {
                    const evals = c.evaluations || [];
                    const activeEval = evals[0];
                    return (
                      <div key={c.id} className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">
                              Week {c.milestone?.weekNumber}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 mt-1">{c.title}</h4>
                            <p className="text-[10px] text-slate-400">Assignee: {c.assignee?.name} · Team: {c.milestone?.project?.team?.name}</p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold">
                              Score: {activeEval.score}/10
                            </Badge>
                            <span className="text-[9px] text-slate-400 block mt-1">Reviewed by {activeEval.faculty?.name}</span>
                          </div>
                        </div>

                        {activeEval.feedback && (
                          <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100 leading-normal">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Feedback</span>
                            "{activeEval.feedback}"
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Audit trail panel */}
            <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20">
                <CardTitle className="text-base font-extrabold text-slate-900">Audit Logs</CardTitle>
                <p className="text-xs text-slate-400">Reviews & state status transitions</p>
              </CardHeader>
              <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                {(data.auditLogs || []).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">No status logs recorded.</p>
                ) : (
                  <div className="relative border-l border-slate-200 ml-4 pl-4 space-y-4 py-4 pr-3">
                    {(data.auditLogs || []).map((audit: any) => (
                      <div key={audit.id} className="text-xs space-y-1">
                        <div className="absolute -left-[5px] top-4 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-slate-400 border border-white" />
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                          <span>{audit.previousStatus} → {audit.newStatus}</span>
                          <span>{new Date(audit.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 font-semibold leading-relaxed">
                          Status updated for contribution "{audit.evaluation?.contribution?.title}" ({audit.evaluation?.team?.name})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* -------------------- 5. INSIGHTS TAB -------------------- */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-5 flex flex-col justify-between h-[180px] border-slate-100 bg-white shadow-sm rounded-3xl">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teams On Track</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="size-4" />
                </span>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-emerald-600 tracking-tight">{teamsOnTrackCount}</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Meeting roadmap velocity targets</p>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between h-[180px] border-slate-100 bg-white shadow-sm rounded-3xl">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teams Behind</span>
                <span className="p-1.5 rounded-lg bg-red-50 text-red-600">
                  <AlertTriangle className="size-4" />
                </span>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-red-600 tracking-tight">{teamsBehindCount}</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Failing milestone criteria</p>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between h-[180px] border-slate-100 bg-white shadow-sm rounded-3xl">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Evaluation Score</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <BadgeCheck className="size-4" />
                </span>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-indigo-600 tracking-tight">{averageEvaluationScore}/10</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Weekly contribution grading average</p>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between h-[180px] border-slate-100 bg-white shadow-sm rounded-3xl">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Rate</span>
                <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                  <LineChart className="size-4" />
                </span>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-teal-600 tracking-tight">{submissionCompletionRate}%</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Total approved tasks vs expected load</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* -------------------- 6. NOTIFICATIONS TAB -------------------- */}
      {activeTab === "notifications" && (
        <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/20">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900">Notifications Panel</CardTitle>
              <p className="text-xs text-slate-400">All submissions alerts, resubmissions, and overdue teams</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={markAllNotificationsAsRead} variant="outline" size="sm" className="h-8 text-xs font-bold border-slate-200 bg-white rounded-xl">
                Mark All Read
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Filter buttons */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/10 flex gap-2">
              <Button
                variant={notificationFilter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setNotificationFilter("all")}
                className="h-8 text-[11px] font-bold rounded-xl"
              >
                All Notifications
              </Button>
              <Button
                variant={notificationFilter === "unread" ? "default" : "ghost"}
                size="sm"
                onClick={() => setNotificationFilter("unread")}
                className="h-8 text-[11px] font-bold rounded-xl"
              >
                Unread
              </Button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-12">No notifications found.</p>
              ) : (
                filteredNotifications.map((n) => (
                  <div key={n.id} className={cn(
                    "p-4 flex items-start justify-between gap-4 transition-colors",
                    n.status === "UNREAD" ? "bg-indigo-500/[0.01]" : ""
                  )}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-slate-800">{n.title}</span>
                        {n.status === "UNREAD" && (
                          <span className="size-2 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-normal max-w-2xl">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-bold block mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {n.status === "UNREAD" && (
                        <button
                          onClick={() => markNotificationAsRead(n.id)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
                          title="Mark as Read"
                        >
                          <Check className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => archiveNotificationItem(n.id)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
                        title="Archive"
                      >
                        <Archive className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* -------------------- TEAM DETAIL VIEW MODAL -------------------- */}
      {selectedTeam && (
        <Modal open={true} onOpenChange={() => setSelectedTeam(null)}>
          <ModalContent className="max-w-4xl text-slate-900">
            <ModalHeader className="border-b border-slate-100">
              <div className="flex justify-between items-start w-full pr-8">
                <div>
                  <ModalTitle className="text-xl font-extrabold text-slate-900">{selectedTeam.name}</ModalTitle>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase">Code: {selectedTeam.teamCode} · Batch: {selectedTeam.batch}</p>
                </div>
                <Badge className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border shadow-none shrink-0",
                  selectedTeam.state === "Healthy execution" ? "border-emerald-100 bg-emerald-50 text-emerald-700" :
                  selectedTeam.state === "Blocked" ? "border-slate-200 bg-slate-50 text-slate-700" :
                  selectedTeam.state === "High risk" || selectedTeam.state === "Critical" ? "border-red-100 bg-red-50 text-red-700" :
                  "border-amber-100 bg-amber-50 text-amber-700"
                )}>
                  {selectedTeam.state}
                </Badge>
              </div>
              <ModalCloseButton onClick={() => setSelectedTeam(null)} />
            </ModalHeader>
            
            <ModalBody className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Problem statement information */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Problem Statement Description</span>
                <h4 className="text-sm font-bold text-slate-800">{selectedTeam.selectedProblemStatement?.title || "No problem statement selected"}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{selectedTeam.selectedProblemStatement?.description || "No description provided."}</p>
              </div>

              {/* Grid: Members & Progress timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team Members card */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="size-4" /> Team Members ({selectedTeam.studentsList?.length || 0})
                  </h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                    {(selectedTeam.studentsList || []).map((student: any) => (
                      <div key={student.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-[10px] text-slate-400">{student.email}</p>
                        </div>
                        <Badge className={cn(
                          "rounded-full px-2 py-0.5 text-[8px] font-bold border shadow-none",
                          student.role === "TEAM_LEAD" ? "bg-indigo-50 border-indigo-100 text-indigo-700" : "bg-slate-50 border-slate-100 text-slate-600"
                        )}>
                          {student.role === "TEAM_LEAD" ? "Lead" : "Member"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Roadmap timelines */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="size-4" /> Weekly Milestones (8 Weeks Roadmap)
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => {
                      const weekNum = i + 1;
                      const milestone = selectedTeam.project?.weeklyMilestones?.find((m: any) => m.weekNumber === weekNum);
                      const isCompleted = milestone?.status === "COMPLETED";
                      const isPending = milestone?.status === "REVIEW_PENDING";
                      return (
                        <div
                          key={weekNum}
                          className={cn(
                            "border rounded-xl p-2 flex flex-col justify-between items-center text-center h-[70px]",
                            isCompleted ? "border-emerald-100 bg-emerald-50/20 text-emerald-700" :
                            isPending ? "border-amber-100 bg-amber-50/20 text-amber-700 animate-pulse" :
                            "border-slate-100 bg-slate-50/30 text-slate-400"
                          )}
                          title={milestone?.title || `Week ${weekNum}`}
                        >
                          <span className="text-[10px] font-bold block">W{weekNum}</span>
                          <span className="text-[8px] font-extrabold uppercase">
                            {milestone ? milestone.status.replace("_", " ") : "LOCKED"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submissions & Evaluations list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="size-4" /> Submission & Evaluation History
                </h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white divide-y divide-slate-100">
                  {selectedTeam.contributions?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No submissions recorded.</p>
                  ) : (
                    selectedTeam.contributions.map((c: any) => {
                      const activeEval = c.evaluations?.[0];
                      return (
                        <div key={c.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{c.title}</span>
                              <Badge className="bg-slate-50 border border-slate-100 text-slate-500 font-extrabold text-[8px]">
                                Week {c.milestone?.weekNumber}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Submitted: {new Date(c.submittedAt).toLocaleDateString()} by {c.assignee?.name}</p>
                            {activeEval && activeEval.feedback && (
                              <p className="text-[10px] text-slate-500 italic mt-1.5">Guide Feedback: "{activeEval.feedback}"</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {activeEval && (
                              <Badge className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold">
                                Score: {activeEval.score}/10
                              </Badge>
                            )}
                            <Badge className={cn(
                              "rounded-full px-2 py-0.5 text-[8px] font-extrabold border shadow-none",
                              c.status === "REVIEWED" ? "border-emerald-100 bg-emerald-50 text-emerald-700" :
                              c.status === "SUBMITTED" || c.status === "UNDER_REVIEW" ? "border-amber-100 bg-amber-50 text-amber-700" :
                              "border-red-100 bg-red-50 text-red-700"
                            )}>
                              {c.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter className="border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setSelectedTeam(null)}
                className="rounded-xl border-slate-200 text-slate-700 font-bold"
              >
                Close details
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* -------------------- REVIEW / EVALUATION MODAL -------------------- */}
      {selectedReview && (
        <Modal open={true} onOpenChange={() => setSelectedReview(null)}>
          <ModalContent className="max-w-2xl text-slate-900">
            <ModalHeader className="border-b border-slate-100 bg-slate-50/30">
              <div>
                <ModalTitle className="text-lg font-extrabold text-slate-900">
                  {isReviewModalWeekly ? "Evaluate Weekly Task Contribution" : "Review Milestone Submission"}
                </ModalTitle>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase">
                  {selectedReview.teamName} · {isReviewModalWeekly ? `Week ${selectedReview.weekNumber}` : "Project milestone"}
                </p>
              </div>
              <ModalCloseButton onClick={() => setSelectedReview(null)} />
            </ModalHeader>

            <ModalBody className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Submission Information */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submission Details</span>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">{selectedReview.title || selectedReview.submissionTitle}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{selectedReview.description || selectedReview.preview || "No description provided."}</p>
                  
                  {/* File Upload Attachment Manager (ReadOnly View) */}
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Attached Files</span>
                    <FileManager teamId={selectedReview.teamId || ""} submissionId={selectedReview.id} isReadOnly={true} />
                  </div>

                  {/* Submission Links */}
                  {(selectedReview.githubUrl || selectedReview.demoUrl) && (
                    <div className="flex gap-4 pt-2 mt-2 border-t border-slate-100 text-xs font-bold">
                      {selectedReview.githubUrl && (
                        <a href={selectedReview.githubUrl} target="_blank" className="flex items-center gap-1 text-slate-600 hover:text-slate-900">
                          <Link2 className="size-4" /> Github Link
                        </a>
                      )}
                      {selectedReview.demoUrl && (
                        <a href={selectedReview.demoUrl} target="_blank" className="flex items-center gap-1 text-slate-600 hover:text-slate-900">
                          <Video className="size-4" /> Demo Link
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Rubric metrics inputs (For Weekly Task evaluations only) */}
              {isReviewModalWeekly && (
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Rubric Scores (0 - 10)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Completeness</label>
                      <select
                        value={completeness}
                        onChange={(e) => setCompleteness(parseInt(e.target.value))}
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold bg-white focus:outline-none"
                      >
                        {Array.from({ length: 11 }, (_, i) => (
                          <option key={i} value={i}>{i} / 10</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Implementation Quality</label>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold bg-white focus:outline-none"
                      >
                        {Array.from({ length: 11 }, (_, i) => (
                          <option key={i} value={i}>{i} / 10</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Documentation</label>
                      <select
                        value={documentation}
                        onChange={(e) => setDocumentation(parseInt(e.target.value))}
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold bg-white focus:outline-none"
                      >
                        {Array.from({ length: 11 }, (_, i) => (
                          <option key={i} value={i}>{i} / 10</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Timeliness</label>
                      <select
                        value={timeliness}
                        onChange={(e) => setTimeliness(parseInt(e.target.value))}
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold bg-white focus:outline-none"
                      >
                        {Array.from({ length: 11 }, (_, i) => (
                          <option key={i} value={i}>{i} / 10</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100/30 mt-2">
                    <span className="text-xs font-bold text-indigo-700">Auto-Calculated Average Score</span>
                    <Badge className="bg-indigo-600 text-white font-extrabold text-xs px-2.5 py-1">
                      {((completeness + quality + documentation + timeliness) / 4).toFixed(1)} / 10
                    </Badge>
                  </div>
                </div>
              )}

              {/* Feedback inputs */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Comments & Feedback</label>
                <Textarea
                  placeholder="Provide feedback suggestions or milestones remarks..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[90px] rounded-2xl border-slate-200 text-xs focus:ring-0"
                  required
                />
              </div>

              {/* Revision Notes field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Revision Notes (Required if requesting revision)</label>
                <Textarea
                  placeholder="Clearly explain what modifications the student needs to implement..."
                  value={revisionNotesText}
                  onChange={(e) => setRevisionNotesText(e.target.value)}
                  className="min-h-[70px] rounded-2xl border-slate-200 text-xs focus:ring-0"
                />
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedReview(null)}
                className="rounded-xl border-slate-200 text-slate-700 font-bold"
                disabled={isSubmittingReview}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (isReviewModalWeekly) {
                      submitWeeklyEvaluation("REVISION_REQUIRED");
                    } else {
                      submitMilestoneReview("REVISION_REQUIRED");
                    }
                  }}
                  className="rounded-xl border border-amber-250 bg-amber-50 text-amber-700 hover:bg-amber-100/50 font-bold text-xs"
                  disabled={isSubmittingReview}
                >
                  Request Revision
                </Button>
                <Button
                  onClick={() => {
                    if (isReviewModalWeekly) {
                      submitWeeklyEvaluation("APPROVED");
                    } else {
                      submitMilestoneReview("APPROVED");
                    }
                  }}
                  className="rounded-xl bg-slate-900 text-white hover:bg-slate-850 font-bold text-xs"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? "Recording..." : "Approve Submission"}
                </Button>
              </div>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* CREATE TEAM MODAL (Preserved exactly) */}
      <Modal open={isCreateModalOpen} onOpenChange={(open) => {
        setIsCreateModalOpen(open);
        if (!open) setCreatedTeamCode(null);
      }}>
        <ModalContent className="max-w-xl text-slate-900">
          {createdTeamCode ? (
            <div className="flex flex-col items-center justify-center text-center py-6 px-4 space-y-5">
              <div className="size-16 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center text-emerald-600">
                <Check className="size-8 stroke-[3]" />
              </div>
              <div className="space-y-1.5">
                <ModalTitle className="text-xl font-bold text-slate-900">Team Created Successfully</ModalTitle>
                <ModalDescription className="text-xs text-slate-500 max-w-sm mx-auto">
                  Share this unique code with students so they can join the team workspace.
                </ModalDescription>
              </div>
              <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">
                  Team Code
                </span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-slate-200 px-3 py-2.5 rounded-lg font-mono text-lg font-bold text-indigo-600 select-all tracking-wider text-center">
                    {createdTeamCode}
                  </code>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(createdTeamCode);
                      toast.success("Team code copied to clipboard!");
                    }}
                    variant="outline"
                    className="h-11 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shrink-0 font-semibold px-4 rounded-lg flex items-center gap-2"
                  >
                    <Copy className="size-4 text-slate-500" />
                    Copy
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreatedTeamCode(null);
                  setStudentNames(["", "", "", "", "", ""]);
                  setShowStudents(false);
                  setFormData({ name: "" });
                }}
                className="w-full max-w-sm bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-semibold text-sm transition-colors"
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreateTeamSubmit}>
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
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
