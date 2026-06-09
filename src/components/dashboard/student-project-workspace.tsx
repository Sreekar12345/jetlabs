"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

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

type StudentProjectWorkspaceProps = {
  currentUserId: string;
  isTeamLead: boolean;
  project: any;
  team: any;
  facultyGuide: any;
  problem: any;
  initialTasks: any[];
  initialActivity: any[];
  initialMilestones?: any[];
};

export function StudentProjectWorkspace({
  currentUserId,
  isTeamLead,
  project,
  team,
  facultyGuide,
  problem,
  initialTasks,
  initialActivity,
  initialMilestones,
}: StudentProjectWorkspaceProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [activity, setActivity] = useState<any[]>(initialActivity);
  const [projectStatus, setProjectStatus] = useState<string>(project?.status ?? "CREATED");
  const [projectProgress, setProjectProgress] = useState<number>(project?.progressPercentage ?? project?.progress ?? 0);
  const [isActionPending, startActionTransition] = useTransition();

  const [milestones, setMilestones] = useState<any[]>(initialMilestones ?? []);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

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
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone || !assigneeId || !assignTitle.trim()) return;

    setIsAssigning(true);
    try {
      const res = await fetch(`/api/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: selectedMilestone.id,
          assignedTo: assigneeId,
          title: assignTitle.trim(),
          description: assignDesc.trim() || null,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success("Contribution successfully assigned!");
          setIsAssignModalOpen(false);
          setAssignTitle("");
          setAssignDesc("");
          setAssigneeId("");
          await fetchMilestones();
          fetchActivity();
        } else {
          toast.error(result.message || "Failed to assign contribution.");
        }
      } else {
        toast.error("Failed to assign contribution.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setIsAssigning(false);
    }
  };

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

  const handleTaskStatusToggle = async (taskId: string, currentStatus: string) => {
    if (!isTeamLead) {
      toast.error("Only the Team Lead can toggle task completion.");
      return;
    }

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
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
          );
          toast.success(`Task status updated to ${nextStatus.replace("_", " ")}`);
          
          // Re-fetch activity feed
          fetchActivity();
        }
      } else {
        toast.error("Failed to update task status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the task status.");
    }
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

  const handleSubmitProposal = () => {
    if (!isTeamLead) return;
    startActionTransition(async () => {
      try {
        const res = await fetch(`/api/projects/${project.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "PROPOSAL_SUBMITTED",
            progressPercentage: 15,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProjectStatus("PROPOSAL_SUBMITTED");
            setProjectProgress(15);
            toast.success("Project proposal submitted successfully!");
            fetchActivity();
          }
        } else {
          toast.error("Failed to submit proposal.");
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred while submitting project proposal.");
      }
    });
  };

  const handleSubmitDeliverable = () => {
    if (!isTeamLead) return;
    startActionTransition(async () => {
      try {
        const res = await fetch(`/api/projects/${project.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "FINAL_SUBMISSION",
            progressPercentage: 85,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProjectStatus("FINAL_SUBMISSION");
            setProjectProgress(85);
            toast.success("Final project deliverables submitted successfully!");
            fetchActivity();
          }
        } else {
          toast.error("Failed to submit deliverables.");
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred while submitting deliverables.");
      }
    });
  };

  return (
    <div className="space-y-6 text-slate-950">
      {/* Visual Timeline Section */}
      <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
        <CardHeader className="p-0 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Project Stage Timeline</CardTitle>
              <p className="text-xs text-slate-500 mt-1 font-medium">Tracking stage transitions from creation to final completion</p>
            </div>
            {isTeamLead && projectStatus === "CREATED" && (
              <Button
                onClick={handleSubmitProposal}
                disabled={isActionPending}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-none text-xs"
              >
                Submit Project Proposal
              </Button>
            )}
            {isTeamLead && projectStatus === "PROPOSAL_APPROVED" && (
              <Button
                onClick={handleSubmitDeliverable}
                disabled={isActionPending}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-none text-xs"
              >
                Submit Final Project
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-2 overflow-x-auto scrollbar-thin">
          <div className="min-w-[700px] flex items-center justify-between relative py-6 px-4">
            {/* Background Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 -z-10" />

            {STAGES.map((stage, idx) => {
              const isActive = stage.key === projectStatus;
              const isCompleted = getStageIndex(stage.key) < currentStageIndex;

              return (
                <div key={stage.key} className="flex flex-col items-center text-center space-y-2 relative max-w-[120px]">
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center border transition-all shadow-sm font-semibold text-xs",
                      isActive
                        ? "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-50"
                        : isCompleted
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : "bg-white border-slate-200 text-slate-400"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="size-4 text-emerald-600" /> : idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        "text-[10px] font-bold tracking-tight",
                        isActive ? "text-indigo-600" : isCompleted ? "text-slate-800" : "text-slate-450"
                      )}
                    >
                      {stage.label}
                    </p>
                    <p className="text-[8px] text-slate-400 leading-normal max-w-[100px] mx-auto font-medium">
                      {stage.desc}
                    </p>
                  </div>
                </div>
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
                  <Badge variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-700 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                    {project.status} Workspace
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
                <h4 className="text-sm font-bold text-slate-800">{problem?.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{project.description}</p>
              </div>

              {problem?.facultyGuide && (
                <div className="rounded-xl border border-amber-250 bg-amber-50/40 p-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Info className="size-4 text-amber-600 shrink-0" />
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
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-850">
                  Weekly Milestones Roadmap
                </CardTitle>
              </div>
              {isTeamLead && (
                <Badge variant="outline" className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border-indigo-200 uppercase tracking-wider">
                  Team Lead Mode
                </Badge>
              )}
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
                                        : "bg-slate-100 border-slate-250 text-slate-650"
                              )}
                            >
                              {isLocked ? "LOCKED" : milestone.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>

                        <div className="pt-3 space-y-2.5">
                          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Member Contributions</p>
                          <div className="grid gap-2">
                            {team.members.map((member: any) => {
                              const contribution = milestone.contributions?.find((c: any) => c.assignedTo === member.id);
                              
                              return (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/30 text-xs"
                                >
                                  <div className="min-w-0 pr-3">
                                    <div className="font-bold text-slate-800 truncate">
                                      {member.name} {member.role === "TEAM_LEAD" && <span className="text-[9px] text-indigo-600 font-extrabold">(Lead)</span>}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                      {contribution ? contribution.title : "No contribution assigned yet"}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 shrink-0">
                                    {contribution ? (
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-[8px] font-bold px-1.5 py-0 border uppercase tracking-tight",
                                          contribution.status === "REVIEWED"
                                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                            : contribution.status === "SUBMITTED"
                                              ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                                              : contribution.status === "REJECTED"
                                                ? "bg-rose-50 border-rose-250 text-rose-800"
                                                : "bg-amber-50 border-amber-200 text-amber-800"
                                        )}
                                      >
                                        {contribution.status === "REVIEWED" ? "COMPLETED" : contribution.status}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 bg-slate-50 border-slate-200 text-slate-400 uppercase tracking-tight">
                                        UNASSIGNED
                                      </Badge>
                                    )}
                                  </div>
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
                <div className="py-6 text-center text-xs text-slate-405 font-medium">
                  No weekly milestones loaded.
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

              {facultyGuide && (
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty Guide</div>
                  <div className="text-xs font-bold text-slate-800">{facultyGuide.name}</div>
                  <div className="text-[10px] text-slate-450 font-medium">{facultyGuide.email}</div>
                </div>
              )}
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
                        <p className="text-xs font-bold text-slate-800">{event.title}</p>
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
    </div>
  );
}
