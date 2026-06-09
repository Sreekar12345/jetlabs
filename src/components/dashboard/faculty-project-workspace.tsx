"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  History,
  Info,
  Rocket,
  ShieldCheck,
  Target,
  Users2,
  Plus,
  Trash2,
  Edit3,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileManager } from "@/components/dashboard/file-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const STAGES = [
  { key: "CREATED", label: "Created", desc: "Project setup and kickoff" },
  { key: "PROPOSAL_SUBMITTED", label: "Proposal Submitted", desc: "Proposal waiting for faculty guide approval" },
  { key: "PROPOSAL_APPROVED", label: "Proposal Approved", desc: "Proposal approved, development ready" },
  { key: "DEVELOPMENT_IN_PROGRESS", label: "Development", desc: "Active engineering and coding phase" },
  { key: "MID_REVIEW", label: "Mid Review", desc: "Mid-semester evaluation milestone" },
  { key: "FINAL_SUBMISSION", label: "Final Submission", desc: "Completed deliverables uploaded" },
  { key: "COMPLETED", label: "Completed", desc: "Final evaluation complete and graded" },
];

function getStageIndex(key: string) {
  return STAGES.findIndex((s) => s.key === key);
}

type FacultyProjectWorkspaceProps = {
  project: any;
  team: any;
  facultyGuide: any;
  problem: any;
  initialTasks: any[];
  initialActivity: any[];
  submissions: any[];
  initialMilestones?: any[];
};

export function FacultyProjectWorkspace({
  project,
  team,
  facultyGuide,
  problem,
  initialTasks,
  initialActivity,
  submissions,
  initialMilestones,
}: FacultyProjectWorkspaceProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [activity, setActivity] = useState<any[]>(initialActivity);
  const [projectStatus, setProjectStatus] = useState<string>(project?.status ?? "CREATED");
  const [projectProgress, setProjectProgress] = useState<number>(project?.progressPercentage ?? project?.progress ?? 0);
  
  // Status edit state
  const [isUpdatingStatus, startStatusUpdate] = useTransition();

  const [milestones, setMilestones] = useState<any[]>(initialMilestones ?? []);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [reviewContribution, setReviewContribution] = useState<any>(null); // selected contribution to review
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewSuggestions, setReviewSuggestions] = useState("");
  const [reviewMarks, setReviewMarks] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const handleReviewClick = async (contribution: any) => {
    setReviewContribution(contribution);
    setReviewFeedback(contribution.feedback || "");
    setReviewSuggestions(contribution.feedbackSuggestions || "");
    setReviewMarks(contribution.facultyMarks ? contribution.facultyMarks.toString() : "");

    // Automatically transition to UNDER_REVIEW on the backend if status is SUBMITTED
    if (contribution.status === "SUBMITTED") {
      try {
        const res = await fetch(`/api/contributions/${contribution.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "UNDER_REVIEW" }),
        });
        if (res.ok) {
          await fetchMilestones();
        }
      } catch (err) {
        console.error("Error setting UNDER_REVIEW status:", err);
      }
    }
  };

  useMemo(() => {
    setMilestones(initialMilestones ?? []);
  }, [initialMilestones]);

  const fetchMilestones = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/milestones`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMilestones(data.milestones);
          if (selectedMilestone) {
            const updated = data.milestones.find((m: any) => m.id === selectedMilestone.id);
            setSelectedMilestone(updated || null);
          }
          // Also fetch project progress update
          const pRes = await fetch(`/api/projects/${project.id}`);
          if (pRes.ok) {
            const pData = await pRes.json();
            if (pData.success && pData.project) {
              setProjectProgress(pData.project.progress);
              setProjectStatus(pData.project.status);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (decision: "APPROVED" | "REJECTED") => {
    if (!reviewContribution) return;
    setIsReviewing(true);
    try {
      const res = await fetch(`/api/contributions/${reviewContribution.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          feedback: reviewFeedback.trim() || null,
          suggestions: reviewSuggestions.trim() || null,
          marks: reviewMarks.trim() !== "" ? parseInt(reviewMarks, 10) : null,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success(`Contribution decision "${decision}" successfully recorded!`);
          setReviewContribution(null);
          setReviewFeedback("");
          setReviewSuggestions("");
          setReviewMarks("");
          await fetchMilestones();
          fetchActivity();
        } else {
          toast.error(result.message || "Failed to submit review.");
        }
      } else {
        toast.error("Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setIsReviewing(false);
    }
  };

  // Task form state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const currentStageIndex = getStageIndex(projectStatus);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/activity`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setActivity(data.activity);
        }
      }
    } catch (err) {
      console.error("Error fetching activity:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/tasks`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTasks(data.tasks);
        }
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleUpdateStatus = (status: string, progress: number) => {
    startStatusUpdate(async () => {
      try {
        const res = await fetch(`/api/projects/${project.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, progressPercentage: progress }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProjectStatus(status);
            setProjectProgress(progress);
            toast.success(`Project stage successfully updated to "${status.replace("_", " ")}"`);
            fetchActivity();
          }
        } else {
          toast.error("Failed to update project status.");
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred while updating status.");
      }
    });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsAddingTask(true);
    try {
      const payload = {
        title: taskTitle.trim(),
        description: taskDesc.trim() || null,
        dueDate: taskDueDate || null,
        taskId: editingTaskId,
      };

      const res = await fetch(`/api/projects/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success(editingTaskId ? "Task updated successfully!" : "Task created successfully!");
          setIsTaskModalOpen(false);
          setTaskTitle("");
          setTaskDesc("");
          setTaskDueDate("");
          setEditingTaskId(null);
          fetchTasks();
          fetchActivity();
        }
      } else {
        toast.error("Failed to manage project task.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/projects/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, action: "DELETE" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success("Task deleted successfully.");
          fetchTasks();
          fetchActivity();
        }
      } else {
        toast.error("Failed to delete task.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error occurred while deleting task.");
    }
  };

  const handleEditTaskClick = (task: any) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDesc(task.description || "");
    setTaskDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
    setIsTaskModalOpen(true);
  };

  const handleTaskStatusToggle = async (taskId: string, currentStatus: string) => {
    const nextStatusMap: Record<string, string> = {
      PENDING: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
      COMPLETED: "PENDING",
    };
    const nextStatus = nextStatusMap[currentStatus] || "PENDING";

    try {
      const res = await fetch(`/api/projects/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: nextStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success(`Task status updated to ${nextStatus.replace("_", " ")}`);
          fetchTasks();
          fetchActivity();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-slate-950">
      {/* Visual Timeline Section */}
      <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
        <CardHeader className="p-0 pb-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Project Stage Timeline</CardTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium">Click on any stage below to update the team's project milestone status</p>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-2 overflow-x-auto scrollbar-thin">
          <div className="min-w-[700px] flex items-center justify-between relative py-6 px-4">
            {/* Background Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 -z-10" />

            {STAGES.map((stage, idx) => {
              const isActive = stage.key === projectStatus;
              const isCompleted = getStageIndex(stage.key) < currentStageIndex;
              const progressMap: Record<string, number> = {
                CREATED: 0,
                PROPOSAL_SUBMITTED: 15,
                PROPOSAL_APPROVED: 30,
                DEVELOPMENT_IN_PROGRESS: 50,
                MID_REVIEW: 65,
                FINAL_SUBMISSION: 85,
                COMPLETED: 100,
              };

              return (
                <button
                  key={stage.key}
                  onClick={() => handleUpdateStatus(stage.key, progressMap[stage.key])}
                  disabled={isUpdatingStatus}
                  className="flex flex-col items-center text-center space-y-2 relative max-w-[120px] focus:outline-none group"
                >
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center border transition-all shadow-sm font-semibold text-xs",
                      isActive
                        ? "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-50"
                        : isCompleted
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600 group-hover:bg-emerald-100"
                          : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-350"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="size-4 text-emerald-600" /> : idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        "text-[10px] font-bold tracking-tight",
                        isActive ? "text-indigo-600 font-extrabold" : isCompleted ? "text-slate-800" : "text-slate-450"
                      )}
                    >
                      {stage.label}
                    </p>
                    <p className="text-[8px] text-slate-400 leading-normal max-w-[100px] mx-auto font-medium">
                      {stage.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Project Overview Card */}
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CardContent className="p-0 space-y-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <Badge variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-700 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 animate-pulse">
                    Stage: {projectStatus.replace("_", " ")}
                  </Badge>
                  <h2 className="text-xl font-bold text-slate-900 mt-1.5">{project.title}</h2>
                  <p className="text-xs text-indigo-600 font-semibold">{problem?.domain} · {problem?.category}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0 md:text-right">
                  <div className="text-xs text-slate-500 font-medium">Project Progress</div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-bold text-slate-850">{projectProgress}%</span>
                    <Progress value={projectProgress} className="w-24 h-2 bg-slate-100" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Problem Statement & Scope</h3>
                <h4 className="text-sm font-bold text-slate-850">{problem?.title}</h4>
                <p className="text-xs text-slate-650 leading-relaxed font-medium">{project.description}</p>
              </div>

              {problem?.facultyGuide && (
                <div className="rounded-xl border border-amber-250 bg-amber-50/40 p-4">
                  <div className="flex items-center gap-1.5">
                    <Info className="size-4 text-amber-600" />
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Faculty Guide Notes</p>
                  </div>
                  <p className="text-xs text-amber-900 mt-1.5 leading-relaxed font-medium">{problem.facultyGuide}</p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Weekly Milestones Roadmap */}
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <CardHeader className="p-0 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="size-5 text-indigo-500" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-855">
                  Weekly Milestones Roadmap
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border-indigo-200 uppercase tracking-wider">
                Faculty Guide Mode
              </Badge>
            </CardHeader>
            <CardContent className="p-0 space-y-6 pt-2">
              {milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone, index) => {
                    const isLocked = index > 0 && milestones[index - 1].status !== "COMPLETED";

                    return (
                      <div
                        key={milestone.id}
                        className={cn(
                          "p-4 rounded-2xl border transition-all text-slate-900",
                          isLocked
                            ? "bg-slate-50/50 border-slate-200 opacity-60"
                            : milestone.status === "COMPLETED"
                              ? "bg-emerald-50/10 border-emerald-100"
                              : "bg-white border-slate-200 shadow-sm"
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] font-extrabold uppercase px-1.5 py-0">
                                Week {milestone.weekNumber}
                              </Badge>
                              <h4 className="text-sm font-bold text-slate-800">{milestone.title}</h4>
                            </div>
                            {milestone.description && (
                              <p className="text-xs text-slate-500 font-medium mt-1 leading-normal">{milestone.description}</p>
                            )}
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-450 font-bold uppercase pt-1.5">
                              <CalendarDays className="size-3.5 text-slate-450" />
                              <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold px-2 py-0.5 border uppercase tracking-wider",
                                isLocked
                                  ? "bg-slate-100 border-slate-200 text-slate-400"
                                  : milestone.status === "COMPLETED"
                                    ? "bg-emerald-100 border-emerald-250 text-emerald-800"
                                    : milestone.status === "REVIEW_PENDING"
                                      ? "bg-indigo-100 border-indigo-250 text-indigo-800"
                                      : milestone.status === "IN_PROGRESS"
                                        ? "bg-sky-100 border-sky-250 text-sky-850"
                                        : "bg-slate-100 border-slate-250 text-slate-655"
                              )}
                            >
                              {isLocked ? "LOCKED" : milestone.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>

                        <div className="pt-3 space-y-2.5">
                          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Student Weekly Submissions</p>
                          <div className="grid gap-2">
                            {team.members.map((member: any) => {
                              const contribution = milestone.contributions?.find((c: any) => c.assignedTo === member.id);
                              
                              return (
                                <div
                                  key={member.id}
                                  className="flex flex-col p-3 rounded-xl border border-slate-100 bg-slate-50/20 text-xs space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0 pr-3">
                                      <div className="font-bold text-slate-800 truncate">
                                        {member.name} {member.role === "TEAM_LEAD" && <span className="text-[9px] text-indigo-600 font-extrabold">(Lead)</span>}
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                        {contribution ? contribution.title : "No contribution assigned yet"}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 shrink-0">
                                      {contribution ? (() => {
                                         const map: Record<string, { label: string; class: string }> = {
                                           ASSIGNED: { label: "Not Started", class: "bg-slate-50 border-slate-200 text-slate-800" },
                                           IN_PROGRESS: { label: "In Progress", class: "bg-amber-50 border-amber-250 text-amber-800" },
                                           SUBMITTED: { label: "Submitted", class: "bg-indigo-50 border-indigo-200 text-indigo-800" },
                                           UNDER_REVIEW: { label: "Under Review", class: "bg-blue-50 border-blue-200 text-blue-800" },
                                           REVIEWED: { label: "Approved", class: "bg-emerald-50 border-emerald-250 text-emerald-800" },
                                           REJECTED: { label: "Rejected", class: "bg-rose-50 border-rose-250 text-rose-800" },
                                         };
                                         const statusMeta = map[contribution.status] || { label: contribution.status, class: "bg-amber-50 border-amber-250 text-amber-850" };
                                         return (
                                           <Badge
                                             variant="outline"
                                             className={cn(
                                               "text-[8px] font-bold px-1.5 py-0 border uppercase tracking-tight",
                                               statusMeta.class
                                             )}
                                           >
                                             {statusMeta.label}
                                           </Badge>
                                         );
                                       })() : (
                                        <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 bg-slate-50 border-slate-200 text-slate-400 uppercase tracking-tight">
                                          UNASSIGNED
                                        </Badge>
                                      )}

                                      {contribution && (contribution.status === "SUBMITTED" || contribution.status === "UNDER_REVIEW") && (
                                        <Button
                                          onClick={() => handleReviewClick(contribution)}
                                          size="sm"
                                          className="h-6 px-2 text-[9px] font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-none shrink-0"
                                        >
                                          {contribution.status === "UNDER_REVIEW" ? "Continue Review" : "Review Work"}
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {contribution && (contribution.status === "SUBMITTED" || contribution.status === "UNDER_REVIEW" || contribution.status === "REVIEWED" || contribution.status === "REJECTED") && (
                                    <div className="bg-white/50 border border-slate-100 rounded-lg p-2 text-[10px] space-y-1">
                                      <div className="flex items-center justify-between">
                                        <div className="text-slate-450 font-bold uppercase tracking-tight text-[8px]">Submission Materials</div>
                                        {contribution.isLate && (
                                          <span className="text-[8px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0 rounded">LATE SUBMISSION</span>
                                        )}
                                      </div>
                                      {contribution.githubUrl && (
                                        <p className="truncate text-indigo-650 font-semibold mt-0.5">
                                          GitHub: <a href={contribution.githubUrl} target="_blank" rel="noopener noreferrer" className="underline">{contribution.githubUrl}</a>
                                        </p>
                                      )}
                                      {contribution.demoUrl && (
                                        <p className="truncate text-indigo-650 font-semibold">
                                          Demo: <a href={contribution.demoUrl} target="_blank" rel="noopener noreferrer" className="underline">{contribution.demoUrl}</a>
                                        </p>
                                      )}
                                      {contribution && (
                                        <div className="mt-2 pt-2 border-t border-slate-100/30">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Attached Files</p>
                                          <FileManager
                                            teamId={project.team?.id || ""}
                                            submissionId={contribution.id}
                                            isReadOnly={true}
                                          />
                                        </div>
                                      )}
                                      {contribution.submissionUrl && (
                                        <p className="truncate text-indigo-655 font-semibold">
                                          Link: <a href={contribution.submissionUrl} target="_blank" rel="noopener noreferrer" className="underline">{contribution.submissionUrl}</a>
                                        </p>
                                      )}
                                      {contribution.notes && (
                                        <p className="text-slate-600 font-medium">Notes: {contribution.notes}</p>
                                      )}
                                      {contribution.isLate && contribution.delayDuration !== null && (
                                        <p className="text-[9px] text-rose-600 font-medium italic">Submitted {contribution.delayDuration} mins after deadline.</p>
                                      )}
                                      {(contribution.feedback || contribution.feedbackSuggestions || contribution.facultyMarks !== null) && (
                                        <div className="border-t border-slate-100 pt-1 mt-1 space-y-0.5 bg-slate-50/50 p-1.5 rounded-lg">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Faculty Evaluation</span>
                                            {contribution.facultyMarks !== null && (
                                              <span className="text-[9px] text-emerald-800 font-extrabold">Marks: {contribution.facultyMarks}</span>
                                            )}
                                          </div>
                                          {contribution.feedback && (
                                            <p className="text-slate-650 font-medium italic">Comments: "{contribution.feedback}"</p>
                                          )}
                                          {contribution.feedbackSuggestions && (
                                            <p className="text-slate-500 font-medium text-[9px]">Suggestions: "{contribution.feedbackSuggestions}"</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No weekly milestones loaded.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submissions Section */}
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <CardHeader className="p-0 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-indigo-500" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-850">Team Deliverables & Submissions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {submissions.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/20">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-850">{sub.title}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{sub.type} · Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="h-8 rounded-xl font-semibold border-slate-200 text-xs shadow-none">
                        <Link href="/faculty/review/review-queue">
                          Open Review
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No deliverables submitted by this team yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          {/* Team Roster details */}
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CardHeader className="p-0 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users2 className="size-5 text-indigo-500" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-850">Team & Workspace</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-4">
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team Name</div>
                <div className="text-sm font-bold text-slate-850">{team.name} ({team.batch})</div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team Roster</div>
                <div className="space-y-2">
                  {team.members.map((member: any) => {
                    const isLead = member.role === "TEAM_LEAD";
                    return (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/40">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="size-7 border border-slate-200">
                            <AvatarFallback className="bg-slate-100 text-[10px] font-bold text-slate-700">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                            <p className="text-[9px] text-slate-450 truncate">{member.email}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] font-bold px-1.5 py-0 border shrink-0",
                            isLead
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                              : "bg-white border-slate-200 text-slate-500"
                          )}
                        >
                          {isLead ? "Lead" : "Member"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed Feed */}
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CardHeader className="p-0 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="size-5 text-indigo-500" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-850">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              {activity.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {activity.map((event) => (
                    <div key={event.id} className="flex gap-2.5 text-left items-start">
                      <div className="size-2 rounded-full bg-indigo-500 shrink-0 mt-1.5 shadow-sm" />
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-bold text-slate-850">{event.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium leading-normal">{event.detail}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(event.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-xs text-slate-400 font-medium">No activity events recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Modal (Create & Edit) */}
      <Modal open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <ModalContent className="max-w-md bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 shadow-xl">
          <ModalHeader>
            <ModalTitle className="text-base font-bold text-slate-900">
              {editingTaskId ? "Edit Weekly Task" : "Assign Weekly Task"}
            </ModalTitle>
          </ModalHeader>
          <form onSubmit={handleAddTask} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task Title</label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Draft literature review section"
                className="h-10 text-xs rounded-xl border-slate-200 bg-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task Description (Optional)</label>
              <textarea
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="e.g. Include 5 peer-reviewed sources from GRCh38 citations."
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-3 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
              <Input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="h-10 text-xs rounded-xl border-slate-200 bg-white"
              />
            </div>
            <div className="pt-4 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTaskModalOpen(false)}
                className="h-10 rounded-xl border-slate-250 font-semibold text-xs text-slate-650 shadow-none px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAddingTask || !taskTitle.trim()}
                className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 shadow-sm"
              >
                {isAddingTask ? "Saving..." : "Save Task"}
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {/* Review Contribution Modal */}
      <Modal open={!!reviewContribution} onOpenChange={(open) => !open && setReviewContribution(null)}>
        <ModalContent className="max-w-md bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 shadow-xl">
          <ModalHeader>
            <ModalTitle className="text-base font-bold text-slate-900">
              Review Member Contribution
            </ModalTitle>
          </ModalHeader>
          {reviewContribution && (
            <div className="space-y-4 mt-4 max-h-[75vh] overflow-y-auto pr-1 scrollbar-thin">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contribution Title</p>
                <p className="text-sm font-semibold text-slate-800">{reviewContribution.title}</p>
                {reviewContribution.description && (
                  <p className="text-xs text-slate-500 mt-1">{reviewContribution.description}</p>
                )}
              </div>

              {/* Display Late Submission badge if applicable */}
              {reviewContribution.isLate && (
                <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-800 uppercase tracking-wider text-[10px]">LATE SUBMISSION ALERT</span>
                  {reviewContribution.delayDuration && (
                    <span className="font-semibold text-rose-700">Delayed by {reviewContribution.delayDuration} minutes</span>
                  )}
                </div>
              )}

              {reviewContribution.githubUrl && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GitHub Repository Link</p>
                  <a
                    href={reviewContribution.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-650 hover:underline font-semibold block truncate"
                  >
                    {reviewContribution.githubUrl}
                  </a>
                </div>
              )}

              {reviewContribution.demoUrl && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demo Video Link</p>
                  <a
                    href={reviewContribution.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-650 hover:underline font-semibold block truncate"
                  >
                    {reviewContribution.demoUrl}
                  </a>
                </div>
              )}

              {reviewContribution && (
                <div className="space-y-2 pt-1 border-t border-slate-100/30">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attached Files</p>
                  <FileManager
                    teamId={project.team?.id || ""}
                    submissionId={reviewContribution.id}
                    isReadOnly={true}
                  />
                </div>
              )}

              {reviewContribution.submissionUrl && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Link (URL)</p>
                  <a
                    href={reviewContribution.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-650 hover:underline font-semibold block truncate"
                  >
                    {reviewContribution.submissionUrl}
                  </a>
                </div>
              )}

              {reviewContribution.notes && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Notes</p>
                  <p className="text-xs text-slate-650 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium whitespace-pre-wrap">
                    {reviewContribution.notes}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty Marks (Optional)</label>
                <Input
                  type="number"
                  value={reviewMarks}
                  onChange={(e) => setReviewMarks(e.target.value)}
                  placeholder="e.g. 10"
                  className="h-10 text-xs rounded-xl border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Improvement Suggestions (Optional)</label>
                <textarea
                  value={reviewSuggestions}
                  onChange={(e) => setReviewSuggestions(e.target.value)}
                  placeholder="Provide recommendations for improvements, changes, or adjustments..."
                  rows={2}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-white p-3 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feedback & Comments (Optional)</label>
                <textarea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Provide guidance, adjustments required, or approval notes..."
                  rows={2}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-white p-3 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setReviewContribution(null);
                    setReviewFeedback("");
                    setReviewSuggestions("");
                    setReviewMarks("");
                  }}
                  className="h-10 rounded-xl border-slate-250 font-semibold text-xs text-slate-650 shadow-none px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleReviewSubmit("REJECTED")}
                  className="h-10 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs px-4"
                >
                  Reject Work
                </Button>
                <Button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleReviewSubmit("APPROVED")}
                  className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 shadow-sm"
                >
                  {isReviewing ? "Reviewing..." : "Approve Work"}
                </Button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
