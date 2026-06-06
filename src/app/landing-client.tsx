// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Boxes,
  Compass,
  FileText,
  Mic2,
  Orbit,
  Presentation,
  ShieldCheck,
  Sparkles,
  Trophy,
  Cpu,
  Layers,
  ChevronRight,
  Play,
  CheckCircle2,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LandingClientProps {
  isLoggedIn: boolean;
  dashboardPath: string | null;
}

export function LandingClient({ isLoggedIn, dashboardPath }: LandingClientProps) {
  // Motion values for 3D card tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [15, -15]);
  const rotateY = useTransform(x, [-300, 300], [-15, 15]);

  const [activeTab, setActiveTab] = useState<"student" | "faculty">("student");
  const [pulseSignal, setPulseSignal] = useState(true);

  // Toggle live indicator pulses
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseSignal((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const features = [
    {
      title: "Problem Marketplace",
      description: "Browse vetted engineering, AI/ML, and IoT problem statements compiled by industry leaders and research mentors.",
      icon: Compass,
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5 group-hover:bg-cyan-500/10",
      glow: "group-hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
    },
    {
      title: "Guided IEEE Workspace",
      description: "Draft sections with built-in reference engines, section guides, and checklist validation to match IEEE formatting rules.",
      icon: FileText,
      color: "text-purple-400 border-purple-500/20 bg-purple-500/5 group-hover:bg-purple-500/10",
      glow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
    },
    {
      title: "Viva Defense Simulator",
      description: "Rehearse presentation defense rounds. Answer committee prompts on architecture, database indexes, and scaling tradeoffs.",
      icon: Presentation,
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5 group-hover:bg-amber-500/10",
      glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
    },
    {
      title: "Dynamic Submissions",
      description: "Manage weekly updates, code repositories, and hosted preview deployments under dynamic review channels.",
      icon: Boxes,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 group-hover:bg-emerald-500/10",
      glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Dynamic Animated Grid Background with Color Blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#020617_0%,#090d22_35%,#0f1235_70%,#150e3b_100%)]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.08)_1px,transparent_1px)] [background-size:30px_30px]" />
      
      {/* Decorative Floating 3D Blobs */}
      <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.08] blur-[120px]" />
      <div className="absolute right-[-10%] bottom-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/[0.08] blur-[140px]" />
      <div className="absolute top-[30%] left-[40%] h-[400px] w-[400px] rounded-full bg-emerald-500/[0.04] blur-[100px]" />

      {/* Navigation Header */}
      <header className="relative z-30 border-b border-slate-800/60 bg-[#020617]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Orbit className="size-5 text-cyan-400 animate-spin-slow" />
              <div className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-500 border border-slate-900" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text">JetLabs</span>
              <span className="ml-2.5 text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 uppercase tracking-wider">AOIP</span>
            </div>
          </div>

          <nav className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 border border-slate-800/80 rounded-full py-1.5 px-3">
              <span className={cn("size-2 rounded-full transition-all duration-300", pulseSignal ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-emerald-600")} />
              <span className="font-semibold text-slate-300">Database Signal Sync Active</span>
            </div>
            <Link
              href={isLoggedIn && dashboardPath ? dashboardPath : "/auth/login"}
              className="text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              System Dashboard
            </Link>
            <Button
              asChild
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-400/20 shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all duration-300"
            >
              <Link href={isLoggedIn && dashboardPath ? dashboardPath : "/auth/login"}>
                {isLoggedIn ? "Go to Dashboard" : "Sign In / Register"}
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
          
          {/* Left Text Block */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4.5 py-1.5 text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.08)]">
              <Sparkles className="size-3.5 text-cyan-400 animate-pulse" />
              Academic Operations & Intelligence Platform
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight text-white xl:text-6xl">
              Run Real Projects.<br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Publish Real Research.
              </span>
            </h1>

            <p className="text-lg leading-relaxed text-slate-300 max-w-xl">
              JetLabs is the structured execution OS for engineering innovation cells. Seamlessly orchestrate student execution, literature reviews, weekly submissions, faculty evaluations, and oral defense readiness in one unified space.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                asChild
                className="h-13 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 font-extrabold text-slate-950 shadow-[0_8px_30px_rgba(6,182,212,0.25)] border-0"
              >
                <Link href={isLoggedIn && dashboardPath ? dashboardPath : "/auth/login"}>
                  {isLoggedIn ? "Enter Workspace" : "Get Started Now"}
                  <ArrowRight className="size-4.5 ml-2 text-slate-950 stroke-[3px]" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-13 px-6 rounded-xl border-slate-700/80 bg-slate-950/20 hover:bg-slate-950/50 hover:border-slate-600 font-bold text-slate-200"
              >
                <Link href="/auth/login">Explore Marketplace</Link>
              </Button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-6 border-t border-slate-800/80 pt-8 max-w-lg">
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-white">42+</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Innovation Teams</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-white">128+</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Research Papers</p>
              </div>
              <div className="space-y-1 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text">
                <p className="text-3xl font-black text-transparent">9.4/10</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Viva Defense Avg</p>
              </div>
            </div>
          </div>

          {/* Right 3D Visual Sandbox */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative flex aspect-square w-full max-w-[480px] lg:max-w-none items-center justify-center rounded-3xl border border-slate-800/60 bg-gradient-to-b from-slate-950/40 to-slate-950/10 p-8 shadow-2xl"
            style={{ perspective: 1200 }}
          >
            {/* Interactive 3D Stack */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full h-full flex items-center justify-center transition-all duration-100"
            >
              {/* Glow Behind Stack */}
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full filter blur-[60px] opacity-60 pointer-events-none group-hover:bg-cyan-500/10 transition duration-300" />

              {/* Back Card (IEEE Publication Pipeline) */}
              <div 
                className="absolute w-[80%] h-[55%] rounded-2xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-md p-5 shadow-[0_15px_45px_rgba(168,85,247,0.15)] flex flex-col justify-between"
                style={{
                  transform: "translateZ(-80px) translateY(-35px) rotate(-4deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex items-center justify-between border-b border-purple-500/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-300 tracking-wider uppercase">IEEE LitMap</span>
                  </div>
                  <Badge className="bg-purple-500/20 border-purple-400/30 text-purple-300 text-[9px] font-bold py-0.5">VERIFIED</Badge>
                </div>
                
                <div className="space-y-2.5 mt-3">
                  <div className="flex items-center justify-between text-[11px] text-purple-200">
                    <span>Literature Depth</span>
                    <span className="font-bold text-purple-400">85%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-purple-950 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-purple-300/60 mt-4">
                  <span>34 papers cited</span>
                  <span>Week 4</span>
                </div>
              </div>

              {/* Middle Card (Dashboard System Status) */}
              <div 
                className="absolute w-[86%] h-[56%] rounded-2xl border border-cyan-500/25 bg-slate-900/90 backdrop-blur-xl p-5 shadow-[0_20px_50px_rgba(6,182,212,0.15)] flex flex-col justify-between"
                style={{
                  transform: "translateZ(0px) translateY(5px) rotate(2deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-cyan-300 tracking-wider uppercase">Project execution</span>
                  </div>
                  <Badge className="bg-cyan-500/10 border-cyan-400/20 text-cyan-400 text-[9px] font-bold py-0.5">ON TRACK</Badge>
                </div>

                <div className="space-y-3.5 my-3.5">
                  <div className="flex items-center justify-between text-xs text-cyan-100">
                    <span>Overall Progress</span>
                    <span className="font-extrabold text-cyan-400">72%</span>
                  </div>
                  <Progress value={72} className="h-2 bg-slate-950 border border-slate-800/80" />
                </div>

                <div className="flex items-center justify-between text-[10px] text-cyan-300/50">
                  <span>Risk: Low</span>
                  <span>Velocity: 1.8x</span>
                </div>
              </div>

              {/* Top Card (Viva AI Readiness Simulator) */}
              <div 
                className="absolute w-[78%] h-[52%] rounded-2xl border border-emerald-500/30 bg-slate-950/80 backdrop-blur-2xl p-4 shadow-[0_30px_60px_rgba(16,185,129,0.2)] flex flex-col justify-between"
                style={{
                  transform: "translateZ(80px) translateY(45px) rotate(-2deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Mic2 className="size-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-300 tracking-wider uppercase">Viva Readiness</span>
                  </div>
                  <Badge className="bg-emerald-500/20 border-emerald-400/30 text-emerald-400 text-[9px] font-extrabold py-0.5">92% READY</Badge>
                </div>

                <div className="my-2 space-y-1.5">
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Suggested Rehearsal Prompt:</p>
                  <p className="text-[11px] font-medium text-slate-200 italic leading-relaxed">
                    &ldquo;Explain your model selection trade-off and database design rationale.&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5">
                  <div className="h-6 rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 flex items-center justify-center text-[10px] font-semibold text-emerald-400">
                    Rehearsed 5 times
                  </div>
                  <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Role Tabs Preview Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:py-16 border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Built for Role-Aware Collaboration
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Choose your operations workspace. JetLabs dynamically tailors pipelines, reviews, and tracking metrics based on your verified credentials.
          </p>
          
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800/80 mt-4">
            <button
              onClick={() => setActiveTab("student")}
              className={cn(
                "rounded-lg px-4.5 py-2 text-sm font-bold transition-all duration-200",
                activeTab === "student"
                  ? "bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 border border-cyan-500/20 text-cyan-400 shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Student Workspace
            </button>
            <button
              onClick={() => setActiveTab("faculty")}
              className={cn(
                "rounded-lg px-4.5 py-2 text-sm font-bold transition-all duration-200",
                activeTab === "faculty"
                  ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/15 border border-purple-500/20 text-purple-400 shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Faculty Panel
            </button>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 sm:p-10 backdrop-blur-sm max-w-5xl mx-auto shadow-xl">
          {activeTab === "student" ? (
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Trophy className="size-6" />
                </div>
                <h3 className="text-2xl font-black text-white">Drive execution from Day 1</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Track weekly milestone status, coordinate project tasks inside an interactive roadmap, catalog literature citations in the LitMap engine, and prepare for examiner panels with the defense simulator.
                </p>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4.5 text-cyan-400 shrink-0" />
                    <span>Real-time milestone progress graphs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4.5 text-cyan-400 shrink-0" />
                    <span>Direct submission pipeline with feedback alerts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4.5 text-cyan-400 shrink-0" />
                    <span>Self-evaluation scorecards and viva prep simulator</span>
                  </li>
                </ul>
              </div>
              
              {/* Student Mock View */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 space-y-4.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">My Student Dashboard</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                    ACTIVE PORTFOLIO
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="rounded-xl bg-slate-900/60 border border-slate-800/60 p-3 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Project Progress</span>
                    <p className="text-xl font-black text-white">72%</p>
                  </div>
                  <div className="rounded-xl bg-slate-900/60 border border-slate-800/60 p-3 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Performance Index</span>
                    <p className="text-xl font-black text-cyan-400">88</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Submission Pipeline</span>
                  <div className="rounded-xl border border-slate-800/40 bg-slate-900/30 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Weekly Progress Report - W6</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Submitted 1 day ago</p>
                    </div>
                    <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[9px] py-0.5 font-bold">UNDER REVIEW</Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Cpu className="size-6" />
                </div>
                <h3 className="text-2xl font-black text-white">Operational control for advisors</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Oversee all assigned cohorts in one screen. Grade reports, request document revisions, check backlog counts, and monitor the overall execution velocity and attendance patterns of your students.
                </p>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4.5 text-purple-400 shrink-0" />
                    <span>Split-pane review queue dashboard</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4.5 text-purple-400 shrink-0" />
                    <span>Real-time student rosters with risk status tags</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4.5 text-purple-400 shrink-0" />
                    <span>Year- and semester-wise backlog analytics metrics</span>
                  </li>
                </ul>
              </div>

              {/* Faculty Mock View */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 space-y-4.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Faculty Control Panel</span>
                  <Badge className="bg-purple-500/15 text-purple-400 border border-purple-500/20 text-[9px] py-0.5 font-bold">COHORT LEADER</Badge>
                </div>
                <div className="rounded-xl border border-slate-800/40 bg-slate-900/30 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Needs Attention</span>
                    <span className="text-[10px] text-red-400 font-bold uppercase">4 at risk</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-amber-500" style={{ width: "35%" }} />
                  </div>
                  <p className="text-[10px] text-slate-400">3 students have attendance below safe 75% threshold</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Review Queue</span>
                  <div className="rounded-xl border border-slate-800/40 bg-slate-900/30 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Team Falcon: Final Draft</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Submitted today</p>
                    </div>
                    <Button size="sm" className="h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white border-0">
                      Open Review
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Grid of features */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:py-16 border-t border-slate-800/60">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-slate-800/60 bg-slate-900/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80 hover:bg-slate-900/30 shadow-sm"
              >
                <div className={cn("mb-4 flex size-11 items-center justify-center rounded-xl border transition-all duration-300", feature.color, feature.glow)}>
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive CTA Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 bg-gradient-to-b from-indigo-950/20 to-purple-950/20 p-8 sm:p-12 text-center shadow-2xl">
          {/* Inner mesh glow */}
          <div className="absolute inset-0 bg-indigo-500/[0.04] rounded-3xl filter blur-2xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to Accelerate Your Projects?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Join the academic portal built for modern engineering innovation. Create cohorts, submit weekly logs, evaluate files, and prepare oral defenses seamlessly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Button
                asChild
                className="h-12 px-6 rounded-xl bg-white font-extrabold text-slate-950 hover:bg-slate-100 shadow-[0_4px_20px_rgba(255,255,255,0.15)] border-0"
              >
                <Link href={isLoggedIn && dashboardPath ? dashboardPath : "/auth/login"}>
                  {isLoggedIn ? "Go to Workspace" : "Get Started Now"}
                  <ArrowRight className="size-4 ml-2 text-slate-950 stroke-[2.5px]" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 bg-[#020617]/80 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Orbit className="size-4 text-cyan-500/40" />
            <span>&copy; 2026 JetLabs Capstone Portal. All rights reserved.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/auth/login" className="hover:text-slate-300">Terms of Use</Link>
            <Link href="/auth/login" className="hover:text-slate-300">Feedback Hub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
