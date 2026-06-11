"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileManager } from "@/components/dashboard/file-manager";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  FileText,
  MessageSquareText,
  NotebookTabs,
  Target,
  LayoutDashboard,
  Calendar,
  ClipboardList,
  BadgeCheck,
  Users,
  Bell,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Link2,
  Video,
  FileDown,
  History,
  Archive,
  RefreshCw,
  AlertTriangle,
  LineChart,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentDashboardData } from "@/types/aoip";

type StudentDashboardViewProps = {
  data: StudentDashboardData;
};

type ActiveTab = "overview" | "execution" | "submissions" | "evaluations" | "team" | "notifications";

function initials(name: string) {
  return (name ?? "").split(" ").filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("");
}

export function StudentDashboardView({ data }: StudentDashboardViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  
  // Voting System State
  const [myVote, setMyVote] = useState<string | null>(null);
  const [votingStats, setVotingStats] = useState<any>(null);
  const [isVotingPending, setIsVotingPending] = useState(false);

  const projectId = data.currentMilestone?.projectId;

  const fetchVotingData = async () => {
    if (!projectId) return;
    try {
      const [myVoteRes, statsRes] = await Promise.all([
        fetch(`/api/v1/projects/${projectId}/my-vote`),
        fetch(`/api/v1/projects/${projectId}/votes`),
      ]);

      if (myVoteRes.ok) {
        const myVoteJson = await myVoteRes.json();
        if (myVoteJson.success) {
          setMyVote(myVoteJson.data?.vote || null);
        }
      }

      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success) {
          setVotingStats(statsJson.data || statsJson);
        }
      }
    } catch (err) {
      console.error("Error fetching project approval voting data:", err);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchVotingData();
    }
  }, [projectId]);

  const handleVote = async (voteValue: "approved" | "rejected") => {
    if (!projectId) return;
    setIsVotingPending(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote: voteValue }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          toast.success("Vote recorded successfully.");
          await fetchVotingData();
        } else {
          toast.error(json.message || "Failed to record vote.");
        }
      } else {
        const errorJson = await res.json();
        toast.error(errorJson.error?.message || "Failed to submit vote.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during voting.");
    } finally {
      setIsVotingPending(false);
    }
  };
  
  // Submission Form State
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  // Current states
  const [currentContribution, setCurrentContribution] = useState<any>(data.currentContribution);
  const [currentMilestone, setCurrentMilestone] = useState<any>(data.currentMilestone);
  const [teamContributions, setTeamContributions] = useState<any[]>(data.teamContributions ?? []);

  // Execution Tab active week state
  const [selectedExecutionWeek, setSelectedExecutionWeek] = useState<number>(data.currentWeekNumber || 1);

  // Search/Filters
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");

  // Notifications live state
  const [localNotifications, setLocalNotifications] = useState<any[]>([]);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch Notifications
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await fetch("/api/student/notifications");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setLocalNotifications(json.notifications || []);
        }
      }
    } catch (err) {
      console.error("Error loading student notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Sync state values on data updates
  useEffect(() => {
    if (data.currentContribution) setCurrentContribution(data.currentContribution);
    if (data.currentMilestone) setCurrentMilestone(data.currentMilestone);
    if (data.teamContributions) setTeamContributions(data.teamContributions);
  }, [data.currentContribution, data.currentMilestone, data.teamContributions]);

  // Submit contribution handler
  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContribution) return;

    if (!submissionUrl.trim() && !githubUrl.trim() && uploadedFileIds.length === 0) {
      toast.error("At least one submission URL, GitHub link, or uploaded file is required.");
      return;
    }

    setIsSubmittingWork(true);
    try {
      const res = await fetch(`/api/contributions/${currentContribution.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionUrl: submissionUrl.trim() || null,
          notes: submissionNotes.trim() || null,
          githubUrl: githubUrl.trim() || null,
          demoUrl: demoUrl.trim() || null,
          fileIds: uploadedFileIds,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success("Weekly contribution submitted successfully!");
          setCurrentContribution(result.contribution);
          setUploadedFileIds([]);
          
          // Re-fetch milestones/contributions to sync team progress
          const mRes = await fetch(`/api/projects/${data.currentMilestone.projectId}/milestones`);
          if (mRes.ok) {
            const mData = await mRes.json();
            if (mData.success) {
              const active = mData.milestones.find((m: any) => m.weekNumber === currentMilestone.weekNumber);
              if (active) {
                setCurrentMilestone(active);
                setTeamContributions(active.contributions || []);
              }
            }
          }
          router.refresh();
        } else {
          toast.error(result.message || "Failed to submit contribution.");
        }
      } else {
        toast.error("Failed to submit contribution.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // Toggle Task Status (Start Working: ASSIGNED -> IN_PROGRESS)
  const toggleTaskWorkingStatus = async (task: any) => {
    const targetStatus = task.status === "ASSIGNED" ? "IN_PROGRESS" : "ASSIGNED";
    try {
      const res = await fetch(`/api/contributions/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success(`Task status updated to ${targetStatus === "IN_PROGRESS" ? "In Progress" : "Not Started"}`);
          if (currentContribution?.id === task.id) {
            setCurrentContribution(result.contribution);
          }
          // Refresh list
          const mRes = await fetch(`/api/projects/${data.currentMilestone.projectId}/milestones`);
          if (mRes.ok) {
            const mData = await mRes.json();
            if (mData.success) {
              const active = mData.milestones.find((m: any) => m.weekNumber === selectedExecutionWeek);
              if (active) {
                setTeamContributions(active.contributions || []);
              }
            }
          }
          router.refresh();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  // Notification actions
  const markNotificationRead = async (id: string) => {
    try {
      const res = await fetch("/api/student/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setLocalNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        toast.success("Notification marked as read.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch("/api/student/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Derived timeline lists
  const allWeeklyMilestones = data.allWeeklyMilestones || [];
  const selectedMilestoneWeek = allWeeklyMilestones.find((m) => m.weekNumber === selectedExecutionWeek) || currentMilestone;
  const executionTasksList = selectedMilestoneWeek?.contributions || [];

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return executionTasksList.filter((t: any) => {
      const matchQuery = t.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
                         (t.assignee?.name || "").toLowerCase().includes(taskSearchQuery.toLowerCase());
      const matchStatus = taskStatusFilter === "all" || t.status === taskStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [executionTasksList, taskSearchQuery, taskStatusFilter]);

  // Overall progress trackers details
  const projectProgress = data.stats[0]?.value ? parseInt(data.stats[0].value.replace("%", ""), 10) : 0;
  const openMilestonesCount = allWeeklyMilestones.filter((m) => m.status !== "COMPLETED").length;
  const completedWeeksCount = 8 - openMilestonesCount;

  // Previous submissions list
  const submissionHistory = useMemo(() => {
    return allWeeklyMilestones.flatMap((m) => 
      (m.contributions || []).filter((c: any) => c.status === "SUBMITTED" || c.status === "REVIEWED" || c.status === "REJECTED" || c.status === "UNDER_REVIEW")
        .map((c: any) => ({
          ...c,
          weekNumber: m.weekNumber,
          milestoneTitle: m.title
        }))
    ).sort((a, b) => b.weekNumber - a.weekNumber);
  }, [allWeeklyMilestones]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return localNotifications.filter((n) => {
      if (notificationFilter === "unread") return !n.read;
      return true;
    });
  }, [localNotifications, notificationFilter]);

  const greeting = data.welcome.title;
  const projectTitle = data.welcome.project && data.welcome.project !== "Project pending" ? data.welcome.project : "No Active Project";
  const unreadNotificationsCount = localNotifications.filter((n) => !n.read).length;

  return (
    <PageContainer
      title={greeting}
      description={`Week ${data.currentWeekNumber || 1} of 8 · ${projectTitle}`}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="h-10 border-slate-200 text-slate-800 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href="/student/analytics">
              <LineChart className="size-4 mr-1.5 text-indigo-650" />
              Analytics
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 border-slate-200 text-slate-800 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href="/student/research/problem-market">Explore Problems</Link>
          </Button>
          <Button asChild variant="outline" className="h-10 border-indigo-150 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 font-bold rounded-xl shadow-sm">
            <Link href="/student/evaluation">Weekly Scorecard</Link>
          </Button>
          <Button asChild className="h-10 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl shadow-sm">
            <Link href="/student/execution/weekly-submissions">
              Execution Workspace <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      }
    >
      {/* Centralized Tabs Workspace Header */}
      <div className="flex border border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm overflow-x-auto space-x-1 mb-6">
        {(
          [
            { id: "overview", label: "Workspace Overview", icon: LayoutDashboard },
            { id: "execution", label: "Tasks & Roadmap", icon: Calendar },
            { id: "submissions", label: "Submission Center", icon: ClipboardList },
            { id: "evaluations", label: "Evaluation & Grades", icon: BadgeCheck },
            { id: "team", label: "Team & Metrics", icon: Users },
            { id: "notifications", label: "Notification Panel", icon: Bell, badge: unreadNotificationsCount },
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

      {/* -------------------- Tab 1: OVERVIEW TAB -------------------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid cards */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="min-h-[140px] border-slate-100 shadow-sm flex flex-col justify-between p-5 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall progress</p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{projectProgress}%</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-500">
                  <CheckCircle2 className="size-4.5 text-indigo-500" />
                </span>
              </div>
              <Progress value={projectProgress} className="h-1.5 bg-slate-100" />
            </Card>

            <Card className="min-h-[140px] border-slate-100 shadow-sm flex flex-col justify-between p-5 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Week</p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Week {data.currentWeekNumber || 1}</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-500">
                  <CalendarDays className="size-4.5 text-emerald-500" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Roadmap Week status</p>
            </Card>

            <Card className="min-h-[140px] border-slate-100 shadow-sm flex flex-col justify-between p-5 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming deadlines</p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{data.deadlines?.length || 0}</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-500">
                  <Clock3 className="size-4.5 text-amber-500" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Due milestones</p>
            </Card>

            <Card className="min-h-[140px] border-slate-100 shadow-sm flex flex-col justify-between p-5 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guide alerts</p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{data.feedback?.length || 0}</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-500">
                  <MessageSquareText className="size-4.5 text-indigo-500" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Review comments</p>
            </Card>
          </div>

          {/* Project Summary card details */}
          {data.selectedProblemStatement && (
            <Card className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/10 to-sky-50/10 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Target className="size-5 text-indigo-500" />
                  <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-indigo-850">Project Roster & Problem Brief</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {projectTitle}
                  </h3>
                  <p className="text-xs text-indigo-600 font-bold mt-1 uppercase">
                    {data.selectedProblemStatement.title} · {data.selectedProblemStatement.domain} · {data.selectedProblemStatement.difficulty}
                  </p>
                </div>
                <div className="text-xs text-slate-550 leading-relaxed space-y-2">
                  <p>{data.selectedProblemStatement.description}</p>
                </div>
                {data.selectedProblemStatement.facultyGuide && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4 mt-3">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Faculty Advisor Instructions</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{data.selectedProblemStatement.facultyGuide}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {data.selectedProblemStatement && votingStats && (
            <Card id="ry3ks9" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-slate-900">
              <CardHeader className="p-0 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="size-5 text-indigo-500" />
                  <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-indigo-850">Team Approval Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 id="9naw6m" className="text-base font-bold text-slate-800">
                      Team Consensus: {votingStats.approvalPercentage}%
                    </h3>
                    <p className="text-xs text-slate-500">
                      Approved: {votingStats.approved} · Not Approved: {votingStats.rejected} · Pending: {votingStats.pending}
                    </p>
                  </div>
                  <div id="pb6b6h" className="font-mono text-xs text-indigo-650 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 font-bold">
                    {"█".repeat(Math.round(votingStats.approvalPercentage / 10)) + "░".repeat(10 - Math.round(votingStats.approvalPercentage / 10))} {votingStats.approvalPercentage}%
                  </div>
                </div>

                {/* Voter Action Block */}
                {data.teamMembers?.find(m => m.id === data.welcome.userId)?.role === "MEMBER" ? (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    {myVote ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-xs text-slate-600">
                          Your Response:{" "}
                          <span id={myVote === "approved" ? "agj7sj" : "0bfbkr"} className={cn(
                            "font-bold uppercase px-2 py-0.5 rounded text-[10px] border",
                            myVote === "approved"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : "bg-rose-50 border-rose-100 text-rose-700"
                          )}>
                            {myVote === "approved" ? "Approved" : "Not Approved"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            id="7rqj0y"
                            onClick={() => handleVote("approved")}
                            disabled={isVotingPending || myVote === "approved"}
                            variant="outline"
                            className="h-8 px-3 rounded-xl border-emerald-250 text-emerald-700 hover:bg-emerald-50/50 text-[10px] font-bold shadow-none"
                          >
                            ✓ Change to Approve
                          </Button>
                          <Button
                            id="w16zgk"
                            onClick={() => handleVote("rejected")}
                            disabled={isVotingPending || myVote === "rejected"}
                            variant="outline"
                            className="h-8 px-3 rounded-xl border-rose-250 text-rose-700 hover:bg-rose-50/50 text-[10px] font-bold shadow-none"
                          >
                            ✕ Change to Not Approve
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-xs text-slate-550">
                          Please express whether you approve or reject this selected Problem Statement:
                        </div>
                        <div className="flex gap-2">
                          <Button
                            id="7rqj0y"
                            onClick={() => handleVote("approved")}
                            disabled={isVotingPending}
                            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                          >
                            ✓ Approve
                          </Button>
                          <Button
                            id="w16zgk"
                            onClick={() => handleVote("rejected")}
                            disabled={isVotingPending}
                            className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                          >
                            ✕ Not Approve
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 italic">
                    {data.teamMembers?.find(m => m.id === data.welcome.userId)?.role === "TEAM_LEAD"
                      ? "You are the Team Leader. You cannot vote as you selected this project brief."
                      : "Read-only access. You are not a voting student member of this team."}
                  </div>
                )}

                {/* Team Leader/Admin/Faculty Detailed Responses Block */}
                {votingStats.responses && votingStats.responses.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Responses Summary</p>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                      {votingStats.responses.map((resp: any) => (
                        <div key={resp.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-2.5 bg-slate-50/30 text-xs">
                          <span className="font-bold text-slate-700">{resp.memberName}</span>
                          <span className={cn(
                            "font-extrabold uppercase text-[9px] px-1.5 py-0.5 rounded border",
                            resp.vote === "approved"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : "bg-rose-50 border-rose-100 text-rose-700"
                          )}>
                            {resp.vote === "approved" ? "Approved" : "Not Approved"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* -------------------- Tab 2: EXECUTION & TASKS TAB -------------------- */}
      {activeTab === "execution" && (
        <div className="space-y-6">
          {/* Visual 8-week Roadmap Timeline */}
          <Card className="border-slate-100 shadow-sm rounded-3xl p-5 bg-white">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Compass className="size-5 text-indigo-500" /> visual project roadmap (8 weeks timeline)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {allWeeklyMilestones.map((milestone) => {
                const isSelected = selectedExecutionWeek === milestone.weekNumber;
                const isCompleted = milestone.status === "COMPLETED";
                const isPending = milestone.status === "REVIEW_PENDING";
                
                return (
                  <div
                    key={milestone.id}
                    onClick={() => setSelectedExecutionWeek(milestone.weekNumber)}
                    className={cn(
                      "border rounded-2xl p-3 flex flex-col justify-between items-center text-center h-[88px] cursor-pointer transition-all duration-300",
                      isSelected ? "border-slate-800 bg-slate-50 ring-2 ring-slate-800/10 scale-[1.03]" :
                      isCompleted ? "border-emerald-100 bg-emerald-50/20 text-emerald-700" :
                      isPending ? "border-amber-100 bg-amber-50/20 text-amber-700" :
                      "border-slate-100 bg-slate-50/30 text-slate-400"
                    )}
                    title={milestone.title}
                  >
                    <span className="text-xs font-bold">Week {milestone.weekNumber}</span>
                    <span className="text-[8px] font-extrabold uppercase mt-1.5 px-1.5 py-0.5 rounded bg-white/60">
                      {milestone.status.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Weekly Tasks list */}
          <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-extrabold text-slate-900">
                  Week {selectedExecutionWeek} Team Tasks
                </CardTitle>
                <p className="text-xs text-slate-400">Milestone: {selectedMilestoneWeek?.title || "No milestone defined"}</p>
              </div>
              
              {/* Task search filters */}
              <div className="flex gap-2">
                <Input
                  placeholder="Filter tasks..."
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  className="h-8 rounded-lg text-xs border-slate-200 bg-white"
                />
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="ASSIGNED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="REVIEWED">Approved</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">No tasks logged for this week.</p>
              ) : (
                filteredTasks.map((task: any) => {
                  const isCurrentUser = task.assignedTo === data.welcome.userId;
                  const canToggle = isCurrentUser && (task.status === "ASSIGNED" || task.status === "IN_PROGRESS");
                  
                  return (
                    <div key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800">{task.title}</h4>
                          {isCurrentUser && (
                            <Badge className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8px] font-bold">
                              Assigned to me
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Owner: {task.assignee?.name || "Unassigned"} · Due Week {selectedExecutionWeek}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={cn(
                          "rounded-full px-2.5 py-0.5 text-[9px] font-extrabold border shadow-none uppercase tracking-wider",
                          task.status === "REVIEWED" ? "border-emerald-100 bg-emerald-50 text-emerald-700" :
                          task.status === "SUBMITTED" || task.status === "UNDER_REVIEW" ? "border-indigo-100 bg-indigo-50 text-indigo-700" :
                          task.status === "IN_PROGRESS" ? "border-amber-100 bg-amber-50 text-amber-700" :
                          "border-slate-200 bg-slate-50 text-slate-700"
                        )}>
                          {task.status === "REVIEWED" ? "Approved" : 
                           task.status === "SUBMITTED" || task.status === "UNDER_REVIEW" ? "Submitted" :
                           task.status === "IN_PROGRESS" ? "In Progress" : "Not Started"}
                        </Badge>

                        {canToggle && (
                          <Button
                            onClick={() => toggleTaskWorkingStatus(task)}
                            className="h-8 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 text-[10px] font-bold shadow-none"
                          >
                            {task.status === "ASSIGNED" ? "Start Working" : "Pause"}
                          </Button>
                        )}

                        {isCurrentUser && task.status === "IN_PROGRESS" && (
                          <Button onClick={() => setActiveTab("submissions")} className="h-8 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-850 text-[10px] font-bold shadow-sm">
                            Go to Submit
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* -------------------- Tab 3: SUBMISSION CENTER TAB -------------------- */}
      {activeTab === "submissions" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Submission draft form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-3xl border border-slate-250/60 bg-white p-6 shadow-sm flex flex-col justify-between text-slate-900">
              <CardHeader className="p-0 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Submit Week {currentMilestone?.weekNumber || 1} Work
                  </CardTitle>
                  <h3 className="text-sm font-bold text-slate-800 mt-1">
                    {currentMilestone?.title || "Weekly Submission"}
                  </h3>
                </div>
                {currentContribution && (() => {
                  const statusMap: Record<string, { label: string; class: string }> = {
                    ASSIGNED: { label: "Not Started", class: "bg-slate-50 border-slate-200 text-slate-800" },
                    IN_PROGRESS: { label: "In Progress", class: "bg-amber-50 border-amber-150 text-amber-800" },
                    SUBMITTED: { label: "Submitted", class: "bg-indigo-50 border-indigo-150 text-indigo-800" },
                    UNDER_REVIEW: { label: "Under Review", class: "bg-blue-50 border-blue-150 text-blue-800" },
                    REVIEWED: { label: "Approved", class: "bg-emerald-50 border-emerald-150 text-emerald-800" },
                    REJECTED: { label: "Rejected", class: "bg-rose-50 border-rose-150 text-rose-800" },
                  };
                  const meta = statusMap[currentContribution.status] || { label: currentContribution.status, class: "bg-amber-50 border-amber-150 text-amber-800" };
                  return (
                    <Badge variant="outline" className={cn("text-[9px] font-bold px-2 py-0.5 border uppercase tracking-wider", meta.class)}>
                      {meta.label}
                    </Badge>
                  );
                })()}
              </CardHeader>
              
              <CardContent className="p-0 pt-4 space-y-4">
                {!currentContribution ? (
                  <div className="py-10 text-center text-xs text-slate-400 font-medium">
                    No task contribution assigned to you for this week.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Status Alert logs */}
                    {currentContribution.status === "REVIEWED" && (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-emerald-800">Approved by Faculty Advisor</span>
                          {currentContribution.facultyMarks !== null && (
                            <Badge className="bg-emerald-600 text-white font-extrabold text-[9px] border-none px-2 py-0.5">
                              Score: {currentContribution.facultyMarks}/10
                            </Badge>
                          )}
                        </div>
                        {currentContribution.feedback && (
                          <p className="text-slate-650 italic mt-1">"{currentContribution.feedback}"</p>
                        )}
                      </div>
                    )}

                    {currentContribution.status === "REJECTED" && (
                      <div className="rounded-2xl border border-rose-100 bg-rose-50/20 p-4 text-xs space-y-2">
                        <div className="font-extrabold text-rose-800">Revision requested by Faculty Advisor</div>
                        {currentContribution.feedback && (
                          <p className="text-slate-650 italic mt-1">"{currentContribution.feedback}"</p>
                        )}
                        {currentContribution.feedbackSuggestions && (
                          <p className="text-xs text-slate-500 font-medium">Suggestions: {currentContribution.feedbackSuggestions}</p>
                        )}
                      </div>
                    )}

                    {/* Submission Center Fields */}
                    {(currentContribution.status === "ASSIGNED" ||
                      currentContribution.status === "IN_PROGRESS" ||
                      currentContribution.status === "REJECTED") ? (
                      <form onSubmit={handleContributionSubmit} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GitHub Repository Link (Optional)</label>
                          <Input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="e.g. https://github.com/team/repo"
                            className="h-10 text-xs rounded-xl border-slate-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demo Video Link (Optional)</label>
                          <Input
                            type="url"
                            value={demoUrl}
                            onChange={(e) => setDemoUrl(e.target.value)}
                            placeholder="e.g. Loom video link"
                            className="h-10 text-xs rounded-xl border-slate-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evidence Deliverable Files</label>
                          <FileManager
                            teamId={data.team?.id || ""}
                            onFilesChange={setUploadedFileIds}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Live Link (Optional)</label>
                          <Input
                            type="url"
                            value={submissionUrl}
                            onChange={(e) => setSubmissionUrl(e.target.value)}
                            placeholder="e.g. https://production-deploy.com"
                            className="h-10 text-xs rounded-xl border-slate-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Summary Notes (Required)</label>
                          <Textarea
                            value={submissionNotes}
                            onChange={(e) => setSubmissionNotes(e.target.value)}
                            placeholder="Describe your weekly task deliverables..."
                            rows={3}
                            className="rounded-2xl border-slate-200 text-xs focus:ring-0"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmittingWork}
                          className="w-full h-11 bg-slate-900 text-white hover:bg-slate-850 font-bold rounded-xl shadow-md transition-colors"
                        >
                          {isSubmittingWork ? "Submitting..." : "Submit Weekly Work"}
                        </Button>
                      </form>
                    ) : (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-xs space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {currentContribution.githubUrl && (
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase block">GitHub link</span>
                              <a href={currentContribution.githubUrl} target="_blank" className="font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-0.5">
                                <Link2 className="size-3.5" /> View Repo
                              </a>
                            </div>
                          )}
                          {currentContribution.demoUrl && (
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase block">Demo link</span>
                              <a href={currentContribution.demoUrl} target="_blank" className="font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-0.5">
                                <Video className="size-3.5" /> Watch Video
                              </a>
                            </div>
                          )}
                        </div>

                        {currentContribution.notes && (
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Summary Notes</span>
                            <p className="text-slate-700 leading-normal mt-1">{currentContribution.notes}</p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Attached Files</span>
                          <FileManager teamId={data.team?.id || ""} submissionId={currentContribution.id} isReadOnly={true} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submission history list column */}
          <div className="space-y-6">
            <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20">
                <CardTitle className="text-sm font-extrabold text-slate-900">Submission History</CardTitle>
                <p className="text-xs text-slate-400">Previous deliverables uploaded</p>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {submissionHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No previous submissions found.</p>
                ) : (
                  submissionHistory.map((hist) => (
                    <div key={hist.id} className="p-3.5 text-xs hover:bg-slate-50/30 transition-colors flex flex-col space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">{hist.title}</span>
                        <Badge className="bg-slate-55 text-slate-500 border border-slate-100 text-[8px] font-bold rounded-full px-1.5 py-0.5 shadow-none uppercase">
                          W{hist.weekNumber}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400">Submitted by: {hist.assignee?.name}</p>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] text-slate-450 font-semibold">{new Date(hist.submittedAt).toLocaleDateString()}</span>
                        <Badge className={cn(
                          "rounded-full px-2 py-0.5 text-[8px] font-extrabold border shadow-none uppercase",
                          hist.status === "REVIEWED" ? "border-emerald-100 bg-emerald-50 text-emerald-700" :
                          hist.status === "SUBMITTED" || hist.status === "UNDER_REVIEW" ? "border-indigo-100 bg-indigo-50 text-indigo-700" :
                          "border-red-100 bg-red-50 text-red-700"
                        )}>
                          {hist.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* -------------------- Tab 4: EVALUATIONS TAB -------------------- */}
      {activeTab === "evaluations" && (
        <div className="space-y-6">
          {/* Renders list of evaluations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20">
                <CardTitle className="text-base font-extrabold text-slate-900">Academic Evaluations history</CardTitle>
                <p className="text-xs text-slate-400">Weekly scores and feed back recorded by the faculty advisor</p>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {allWeeklyMilestones.flatMap((m) => m.contributions || []).filter((c: any) => c.evaluations && c.evaluations.length > 0).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">No evaluation scorecards logged yet.</p>
                ) : (
                  allWeeklyMilestones.flatMap((m) => (m.contributions || []).map((c: any) => ({ ...c, weekNumber: m.weekNumber })))
                    .filter((c: any) => c.evaluations && c.evaluations.length > 0)
                    .map((c: any) => {
                      const latestEval = c.evaluations[0];
                      return (
                        <div key={c.id} className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">
                                Week {c.weekNumber}
                              </span>
                              <h4 className="text-xs font-bold text-slate-800 mt-1">{c.title}</h4>
                              <p className="text-[10px] text-slate-400">Assignee: {c.assignee?.name}</p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold">
                                Score: {latestEval.score}/10
                              </Badge>
                              <span className="text-[9px] text-slate-400 block mt-1">Evaluated by {latestEval.faculty?.name}</span>
                            </div>
                          </div>

                          {latestEval.feedback && (
                            <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100 leading-normal italic">
                              "{latestEval.feedback}"
                            </div>
                          )}

                          {/* Rubrics breakdown */}
                          <div className="grid grid-cols-4 gap-2 pt-1.5 text-center text-[10px]">
                            <div className="bg-slate-50/50 rounded p-1">
                              <span className="text-slate-400 block">Completeness</span>
                              <span className="font-bold text-slate-700">{latestEval.completeness}/10</span>
                            </div>
                            <div className="bg-slate-50/50 rounded p-1">
                              <span className="text-slate-400 block">Quality</span>
                              <span className="font-bold text-slate-700">{latestEval.quality}/10</span>
                            </div>
                            <div className="bg-slate-50/50 rounded p-1">
                              <span className="text-slate-400 block">Documentation</span>
                              <span className="font-bold text-slate-700">{latestEval.documentation}/10</span>
                            </div>
                            <div className="bg-slate-50/50 rounded p-1">
                              <span className="text-slate-400 block">Timeliness</span>
                              <span className="font-bold text-slate-700">{latestEval.timeliness}/10</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </CardContent>
            </Card>

            {/* Revision alerts panel */}
            <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20">
                <CardTitle className="text-base font-extrabold text-slate-900">Revision Requests</CardTitle>
                <p className="text-xs text-slate-400">Milestones requiring changes</p>
              </CardHeader>
              <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {allWeeklyMilestones.flatMap((m) => m.contributions || []).filter((c: any) => c.status === "REJECTED").length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">No pending revision requests.</p>
                ) : (
                  allWeeklyMilestones.flatMap((m) => (m.contributions || []).map((c: any) => ({ ...c, weekNumber: m.weekNumber })))
                    .filter((c: any) => c.status === "REJECTED")
                    .map((c: any) => (
                      <div key={c.id} className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/10 text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-rose-800">Week {c.weekNumber} Revision</span>
                          <Badge className="bg-rose-600 text-white font-bold text-[8px] border-none">REVISION</Badge>
                        </div>
                        <h4 className="font-bold text-slate-800">{c.title}</h4>
                        {c.feedbackSuggestions && (
                          <p className="text-slate-600 leading-normal bg-white p-2.5 rounded-xl border border-rose-100/30">
                            Guide suggestions: "{c.feedbackSuggestions}"
                          </p>
                        )}
                        <Button onClick={() => { setSelectedExecutionWeek(c.weekNumber); setActiveTab("execution"); }} className="w-full h-8 text-[10px] bg-slate-900 text-white rounded-xl">
                          Fix Deliverables
                        </Button>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* -------------------- Tab 5: TEAM & METRICS TAB -------------------- */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team Roster card */}
            <Card className="md:col-span-2 border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20">
                <CardTitle className="text-base font-extrabold text-slate-900">Project Team Members</CardTitle>
                <p className="text-xs text-slate-400">Collaboration roster details</p>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100">
                {(!data.teamMembers || data.teamMembers.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-10">No members listed.</p>
                ) : (
                  data.teamMembers.map((member: any) => (
                    <div key={member.id} className="p-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 border border-slate-100">
                          <AvatarFallback className="bg-slate-50 text-slate-700 font-bold">
                            {initials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-800">{member.name}</p>
                          <p className="text-[10px] text-slate-400">{member.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>

                      <Badge className={cn(
                        "rounded-full px-2.5 py-0.5 text-[8px] font-bold border shadow-none",
                        member.role === "TEAM_LEAD" ? "bg-indigo-50 border-indigo-100 text-indigo-700" : "bg-slate-50 border-slate-100 text-slate-600"
                      )}>
                        {member.role === "TEAM_LEAD" ? "Team Lead" : "Member"}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Performance Roster stats */}
            <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20">
                <CardTitle className="text-base font-extrabold text-slate-900">My Performance Scorecard</CardTitle>
                <p className="text-xs text-slate-400">Individual metrics summary</p>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {data.scorecards.map((card) => (
                  <div key={card.title} className="space-y-1 py-1 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{card.title}</span>
                      <span className="font-extrabold text-slate-900">{card.value}</span>
                    </div>
                    <Progress value={card.progress} className="h-1.5 bg-slate-100" />
                    <p className="text-[10px] text-slate-400 font-semibold">{card.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* -------------------- Tab 6: NOTIFICATIONS TAB -------------------- */}
      {activeTab === "notifications" && (
        <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/20">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900">Notifications Panel</CardTitle>
              <p className="text-xs text-slate-400">Weekly milestones notifications, alerts, and feedback notices</p>
            </div>
            {unreadNotificationsCount > 0 && (
              <Button onClick={markAllNotificationsRead} variant="outline" size="sm" className="h-8 text-xs font-bold border-slate-200 bg-white rounded-xl">
                Mark All Read
              </Button>
            )}
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
                Unread ({unreadNotificationsCount})
              </Button>
            </div>

            {/* List */}
            {loadingNotifications ? (
              <div className="flex h-32 items-center justify-center gap-2">
                <RefreshCw className="size-5 animate-spin text-indigo-500" />
                <span className="text-xs text-slate-450">Loading notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No notifications found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map((n) => (
                  <div key={n.id} className={cn(
                    "p-4 flex items-start justify-between gap-4 transition-colors",
                    !n.read ? "bg-indigo-500/[0.01]" : ""
                  )}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-slate-800">{n.title}</span>
                        {!n.read && (
                          <span className="size-2 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-normal max-w-2xl">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-bold block mt-1 font-mono">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {!n.read && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                        title="Mark as Read"
                      >
                        <Check className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
