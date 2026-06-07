"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  BrainCircuit,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Database,
  Flame,
  GitBranch,
  GraduationCap,
  HeartPulse,
  Layers3,
  LineChart,
  Lock,
  Medal,
  MessageSquareText,
  MonitorCheck,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users2,
  Zap,
  LoaderCircle,
  Eye,
  Edit3
} from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { discontinueCapstoneProjectAction } from "@/lib/actions/problem-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VerificationBadge } from "@/features/student-verification/components/VerificationBadge";

type Achievement = {
  id: string;
  title: string;
  description: string;
  badge: string;
  points: number;
  createdAt: string;
};

type Submission = {
  id: string;
  title: string;
  type: string;
  status: string;
  submittedAt: string;
  feedback?: string | null;
  score?: number | null;
};

type Milestone = {
  id: string;
  title: string;
  description?: string | null;
  stage: string;
  status: string;
  dueAt?: string | null;
};

type ProfileClientProps = {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    phoneNumber?: string | null;
    parentPhoneNumber?: string | null;
    linkedinUrl?: string | null;
    skills?: string | null;
    bio?: string | null;
    verificationStatus: "PENDING" | "VERIFIED" | "CORRECTION_REQUESTED" | "REJECTED";
    verifiedBy?: string | null;
    verifiedAt?: string | null;
    correctionRequestedAt?: string | null;
    rollNumber?: string | null;
    department?: string | null;
    batchYear?: string | null;
  };
  performance: {
    score: number;
    attendanceScore: number;
    submissionScore: number;
    rolePlayScore?: number; // make rolePlayScore optional
    reviewScore: number;
  };
  achievements: Achievement[];
  team: {
    name: string;
    batch: string;
    projectTitle: string;
    project: {
      title: string;
      description: string;
      domain: string;
      status: string;
      progress: number;
      healthStatus: string;
    };
    faculty: {
      name: string;
    };
  } | null;
  milestones: Milestone[];
  submissions: Submission[];
};

export function ProfileClient({
  user,
  performance,
  achievements,
  team,
  milestones,
  submissions,
}: ProfileClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [parentPhoneNumber, setParentPhoneNumber] = useState(user.parentPhoneNumber || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || "");
  const [skills, setSkills] = useState(user.skills || "");
  const [bio, setBio] = useState(user.bio || "");
  const [savingProfile, setSavingProfile] = useState(false);

  async function handleSubmitProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await fetch("/api/student/profile/update-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim() || null,
          parentPhoneNumber: parentPhoneNumber.trim() || null,
          linkedinUrl: linkedinUrl.trim() || null,
          skills: skills.trim() || null,
          bio: bio.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update profile details.");
      }

      toast.success("Profile details updated successfully. Verification request submitted.");
      setIsEditModalOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile details.");
    } finally {
      setSavingProfile(false);
    }
  }

  function handleDiscontinue() {
    startTransition(async () => {
      const result = await discontinueCapstoneProjectAction();
      if (result.success) {
        toast.success(result.message);
        setIsConfirmOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  const projectTitle = team?.project?.title ?? "No Project";
  const projectDescription = team?.project?.description ?? "Please wait for team and project assignment.";
  const domain = team?.project?.domain ?? "General";
  const status = team?.project?.status ?? "DISCOVERY";
  const progress = team?.project?.progress ?? 0;
  const facultyName = team?.faculty?.name ?? "Advisor pending";
  const batch = team?.batch ?? "Unassigned";

  // Derive skills dynamically based on project domain to make it realistic
  const getSkillsByDomain = (dom: string) => {
    const defaultSkills = [
      { label: "Python", value: 85, verified: true },
      { label: "Software Engineering", value: 80, verified: true },
      { label: "Git & Collaboration", value: 90, verified: true },
      { label: "Technical Documentation", value: 75, verified: false },
    ];
    if (dom.includes("Energy") || dom.includes("Grid")) {
      return [
        { label: "Python & Numpy", value: 92, verified: true },
        { label: "Time-Series Forecasting", value: 88, verified: true },
        { label: "TensorFlow / PyTorch", value: 84, verified: true },
        { label: "IoT Data Pipelines", value: 80, verified: false },
        { label: "System Design", value: 78, verified: true },
        { label: "Technical Writing", value: 72, verified: true },
      ];
    }
    if (dom.includes("Agri") || dom.includes("Crop")) {
      return [
        { label: "Embedded C / IoT", value: 86, verified: true },
        { label: "Computer Vision (CNN)", value: 90, verified: true },
        { label: "Python Data Processing", value: 88, verified: true },
        { label: "Edge Deployment", value: 82, verified: false },
        { label: "React Native UI", value: 76, verified: true },
        { label: "Methodology Defense", value: 74, verified: true },
      ];
    }
    if (dom.includes("Research") || dom.includes("Literature")) {
      return [
        { label: "Natural Language Processing", value: 91, verified: true },
        { label: "React / Next.js", value: 88, verified: true },
        { label: "Graph Databases", value: 80, verified: false },
        { label: "Literature Analysis", value: 94, verified: true },
        { label: "API Design (GraphQL)", value: 82, verified: true },
        { label: "IEEE Formatting", value: 90, verified: true },
      ];
    }
    return defaultSkills;
  };

  const skillsList = getSkillsByDomain(domain);

  // Compute profile completeness
  let profileCompleteness = 50;
  if (team) profileCompleteness += 20;
  if (user.avatar) profileCompleteness += 10;
  if (achievements.length > 0) profileCompleteness += 10;
  if (submissions.length > 0) profileCompleteness += 10;

  // Header stats
  const headerStats = [
    { label: "Composite Index", value: `${performance.score}/100`, detail: "execution score", icon: Trophy },
    { label: "Attendance", value: `${performance.attendanceScore}%`, detail: "multiplier effect", icon: Medal },
    { label: "Delivery Score", value: `${performance.submissionScore}%`, detail: "weekly checkins", icon: CheckCircle2 },
    { label: "Review Success", value: `${performance.reviewScore}%`, detail: "approved work", icon: BadgeCheck },
  ];

  // Map timeline events from real DB submissions and milestone logs
  const timelineEvents = [
    ...submissions.map((sub) => ({
      type: "Submission",
      title: sub.title,
      detail: `${sub.type.replaceAll("_", " ")} packet is ${sub.status.replaceAll("_", " ").toLowerCase()}.`,
      time: new Date(sub.submittedAt).toLocaleDateString(),
      icon: ClipboardCheck,
      className: sub.status === "APPROVED"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : sub.status === "REVISION_REQUIRED"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-blue-200 bg-blue-50 text-blue-700",
    })),
    ...milestones.filter(m => m.status === "COMPLETED").map((m) => ({
      type: "Milestone",
      title: m.title,
      detail: m.description ?? `Project milestone successfully completed.`,
      time: m.dueAt ? new Date(m.dueAt).toLocaleDateString() : "Completed",
      icon: Trophy,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

  const teamName = team?.name ?? "Unassigned";

  return (
    <section className="space-y-8 text-slate-900">
      {/* Verification Banners */}
      {user.verificationStatus === "CORRECTION_REQUESTED" && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-850 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Faculty has requested corrections to your profile.</p>
              <p className="text-[11px] text-orange-700 mt-1">Please update your information to proceed with verification.</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="h-9 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs border-0 px-4 shadow-sm"
          >
            Update Details
          </Button>
        </div>
      )}

      {user.verificationStatus === "PENDING" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800 flex items-center gap-3">
          <AlertTriangle className="size-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold">Your profile is awaiting faculty verification.</p>
            <p className="text-[11px] text-amber-700 mt-0.5">Some features may be restricted until verified.</p>
          </div>
        </div>
      )}

      {user.verificationStatus === "VERIFIED" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-855 flex items-center gap-3">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold">Your profile has been verified.</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Core academic fields are locked and can only be modified by faculty.</p>
          </div>
        </div>
      )}

      {/* 1. Header Profile block */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border border-border shadow-lg">
            <AvatarFallback className="bg-slate-900 text-white font-bold text-xl uppercase">
              {user.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900">{user.name}</h1>
              <VerificationBadge status={user.verificationStatus} />
            </div>
            <p className="text-sm text-muted-foreground">{user.email} &middot; Student Profile</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="border-slate-200 bg-white text-slate-700">{batch}</Badge>
              <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">Team: {teamName}</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {headerStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-3 shadow-sm min-w-[120px]">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase">
                  <Icon className="size-3.5" />
                  {stat.label}
                </div>
                <p className="mt-1.5 text-lg font-bold tracking-tight text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Tabs System */}
      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-xl">
          <TabsTrigger value="identity" className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">Identity</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">Performance</TabsTrigger>
          <TabsTrigger value="readiness" className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">Readiness</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">History Log</TabsTrigger>
        </TabsList>

        {/* Identity Tab */}
        <TabsContent value="identity">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <Card>
                <CardHeader className="border-b border-slate-200 pb-5 flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-slate-900">Engineering Profile Details</CardTitle>
                    <p className="text-xs text-muted-foreground leading-normal mt-1">
                      Basic student academic metadata, verification status, and contact records.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                    className="h-9 rounded-lg font-semibold text-xs gap-1.5 flex items-center"
                  >
                    <Edit3 className="size-3.5" /> Edit Profile
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4 p-5 md:grid-cols-2 text-slate-900">
                  {/* Locked Fields */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <Lock className="size-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Locked Academic Info</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="block text-slate-400 font-medium">Roll Number</span>
                        <span className="font-bold text-slate-700">{user.rollNumber || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">Department</span>
                        <span className="font-bold text-slate-700">{user.department || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">Batch</span>
                        <span className="font-bold text-slate-700">{user.batchYear || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">College Email</span>
                        <span className="font-bold text-slate-700 truncate block" title={user.email}>{user.email}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">Team Context</span>
                        <span className="font-bold text-slate-700">{teamName}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">Faculty Advisor</span>
                        <span className="font-bold text-slate-700">{facultyName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="rounded-xl border border-slate-150 bg-white p-4 space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <Edit3 className="size-3.5 text-indigo-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact &amp; Profile Details</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="block text-slate-400 font-medium">Student Mobile</span>
                        <span className="font-bold text-slate-700">{user.phoneNumber || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">Parent Mobile</span>
                        <span className="font-bold text-slate-700">{user.parentPhoneNumber || "Not Provided"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-slate-400 font-medium">LinkedIn URL</span>
                        <span className="font-bold text-slate-700 truncate block">
                          {user.linkedinUrl ? (
                            <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-650 hover:underline">
                              {user.linkedinUrl}
                            </a>
                          ) : "Not Provided"}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-slate-400 font-medium">Bio</span>
                        <span className="font-semibold text-slate-650 block leading-normal mt-0.5">
                          {user.bio || "No biography added yet."}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-5">
                  <CardTitle className="text-xl text-slate-900">Dynamic Skills &amp; Verification</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your key technical expertise and verification status.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 p-5 text-slate-900">
                  {user.skills ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.split(",").map((s) => (
                        <Badge key={s} className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs px-2.5 py-1">
                          {s.trim()}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center">No skills mapped yet. Click Edit Profile to add skills.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="border-slate-900 bg-slate-950 text-white shadow-md">
                <CardContent className="space-y-5 p-5">
                  <Badge className="border-white/10 bg-white/5 text-indigo-300 font-semibold">Active Capstone Project</Badge>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">{projectTitle}</h2>
                    <p className="mt-2 text-xs leading-relaxed text-white/60">{projectDescription}</p>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/80">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      Advisor: {facultyName}
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/80">
                      <Rocket className="size-4 text-indigo-400 shrink-0" />
                      Status: {status.replaceAll("_", " ")}
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/80">
                      <Target className="size-4 text-cyan-400 shrink-0" />
                      Progress: {progress}% Complete
                    </div>
                    {team && (
                      <Button
                        type="button"
                        variant="destructive"
                        className="mt-4 w-full h-10 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 border-0 shadow-md shadow-red-600/10"
                        onClick={() => setIsConfirmOpen(true)}
                      >
                        <AlertTriangle className="size-4" />
                        Discontinue Project
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-5">
                  <CardTitle className="text-lg">Database Verified Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-5">
                  {achievements.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No verified achievements yet.</p>
                  ) : (
                    achievements.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-xs font-semibold">
                        <Trophy className="size-4 text-amber-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-foreground font-semibold">{item.title}</p>
                          <p className="truncate text-[10px] text-muted-foreground font-normal">{item.description}</p>
                        </div>
                        <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">+{item.points} pts</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white shadow-xl">
            <CardContent className="grid gap-6 p-6 lg:grid-cols-[240px_minmax(0,1fr)_340px] lg:items-center">
              <div className="flex justify-center">
                <div className="relative grid size-44 place-items-center rounded-full bg-[conic-gradient(#60a5fa_0deg_328deg,rgba(255,255,255,0.12)_328deg_360deg)]">
                  <div className="absolute inset-3 rounded-full border border-white/10" />
                  <div className="grid size-30 place-items-center rounded-full bg-slate-950 text-center">
                    <div>
                      <p className="text-5xl font-bold tracking-tight text-white">{performance.score}</p>
                      <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-blue-300">
                        Syntra Index
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Badge className="border-white/10 bg-white/5 text-white/80">Composite Reputation Band</Badge>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Dynamic performance score tracked live.
                </h2>
                <p className="text-xs leading-relaxed text-white/60">
                  Calculated from attendance multi-factor, completion of milestones, reviewed weekly submissions, and mentor evaluations.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/70">
                    Attendance: {performance.attendanceScore}%
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/70">
                    Delivery: {performance.submissionScore}%
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/70">
                    Reviews: {performance.reviewScore}%
                  </span>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-xs space-y-2">
                <p className="flex items-center gap-2 font-semibold text-white">
                  <Zap className="size-4 text-yellow-400 shrink-0" />
                  Actionable Insights
                </p>
                <p className="leading-relaxed text-white/60">
                  Review feedback response SLA directly impacts index scaling. Address mentor comments within 48h to secure consistency gains.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Readiness Tab */}
        <TabsContent value="readiness">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Project Readiness", value: progress, desc: "Capstone progress status & milestone completion rate.", icon: Rocket },
              { label: "Review Loop Readiness", value: performance.reviewScore, desc: "Efficiency in closing mentor comments and revisions.", icon: BadgeCheck },
              { label: "Documentation Readiness", value: Math.max(50, performance.submissionScore - 10), desc: "Narrative completeness across weekly evidence packs.", icon: ClipboardCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="transition hover:border-slate-300 hover:shadow-sm">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-muted/40 text-foreground">
                        <Icon className="size-4.5" />
                      </span>
                      <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                        <span>Score</span>
                        <span>{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-1.5 bg-slate-200" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader className="border-b border-border pb-5">
              <CardTitle className="text-xl">Dynamic Activity & Journey Log</CardTitle>
              <p className="text-xs text-muted-foreground">
                Chronological list of submissions and completed milestones sourced directly from Postgres.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {timelineEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No historical records tracked yet.</p>
              ) : (
                <div className="space-y-6">
                  {timelineEvents.map((event, idx) => {
                    const Icon = event.icon;
                    return (
                      <div key={`${event.title}-${idx}`} className="flex gap-4">
                        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl border", event.className)}>
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <Badge className={event.className} variant="outline">
                              {event.type}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{event.time}</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-foreground">{event.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{event.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 4. Edit Profile details Modal */}
      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ModalContent className="max-w-md p-6 bg-white rounded-2xl shadow-xl text-slate-900">
          <ModalHeader className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <ModalTitle className="text-lg font-bold text-slate-900">
              Edit Profile Details
            </ModalTitle>
            <ModalCloseButton onClick={() => setIsEditModalOpen(false)} />
          </ModalHeader>

          <form onSubmit={handleSubmitProfile} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="phoneNumber" className="text-xs font-bold text-slate-705">
                Student Mobile Number
              </label>
              <Input
                id="phoneNumber"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +91 9876543210"
                disabled={savingProfile}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="parentPhoneNumber" className="text-xs font-bold text-slate-705">
                Parent Mobile Number *
              </label>
              <Input
                id="parentPhoneNumber"
                type="text"
                value={parentPhoneNumber}
                onChange={(e) => setParentPhoneNumber(e.target.value)}
                placeholder="e.g. +91 9988776655"
                disabled={savingProfile}
                required
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="linkedinUrl" className="text-xs font-bold text-slate-705">
                LinkedIn Profile URL
              </label>
              <Input
                id="linkedinUrl"
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="e.g. https://linkedin.com/in/username"
                disabled={savingProfile}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="skills" className="text-xs font-bold text-slate-705">
                Technical Skills (comma-separated)
              </label>
              <Input
                id="skills"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, React, TensorFlow, PostgreSQL"
                disabled={savingProfile}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="bio" className="text-xs font-bold text-slate-705">
                Biography / Interests
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your academic or project interests..."
                disabled={savingProfile}
                className="min-h-[80px] rounded-xl text-slate-905"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={savingProfile}
                onClick={() => setIsEditModalOpen(false)}
                className="h-10 rounded-xl font-semibold px-4 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingProfile}
                className="h-10 rounded-xl font-semibold bg-indigo-650 hover:bg-indigo-700 text-white shadow-md px-5 border-0 text-xs"
              >
                {savingProfile ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin mr-1.5" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isPending && setIsConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="size-6 animate-pulse" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-slate-900">Discontinue Capstone Project?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to discontinue your active Capstone project? This action will permanently remove:
                </p>
                <ul className="mt-3 list-disc pl-5 text-xs leading-relaxed text-slate-500 space-y-1">
                  <li>Your team and lead role assignment</li>
                  <li>All 6 milestone phases and target due dates</li>
                  <li>Any weekly progress updates or draft submissions</li>
                  <li>All feedback, comments, and scores given by your advisor</li>
                </ul>
                <p className="mt-3 text-xs font-semibold text-red-600">
                  This action is permanent and cannot be undone.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl sm:w-28 font-semibold"
                  disabled={isPending}
                  onClick={() => setIsConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 border-0 shadow-md shadow-red-600/15 sm:px-6"
                  disabled={isPending}
                  onClick={handleDiscontinue}
                >
                  {isPending ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Discontinuing...
                    </>
                  ) : (
                    "Yes, Discontinue"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

