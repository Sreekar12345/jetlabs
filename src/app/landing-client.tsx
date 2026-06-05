// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Boxes,
  Compass,
  FileText,
  Lock,
  Mic2,
  Orbit,
  Presentation,
  ShieldCheck,
  Sparkles,
  Trophy,
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
  const rotateX = useTransform(y, [-300, 300], [12, -12]);
  const rotateY = useTransform(x, [-300, 300], [-12, 12]);

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
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    },
    {
      title: "Guided IEEE Workspace",
      description: "Draft sections with built-in reference engines, section guides, and checklist validation to match IEEE formatting rules.",
      icon: FileText,
      color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
    },
    {
      title: "Viva Defense Simulator",
      description: "Rehearse presentation defense rounds. Answer committee prompts on architecture, database indexes, and scaling tradeoffs.",
      icon: Presentation,
      color: "text-orange-400 border-orange-500/20 bg-orange-500/5",
    },
    {
      title: "Dynamic Submissions",
      description: "Manage weekly updates, code repositories, and hosted preview deployments under dynamic review channels.",
      icon: Boxes,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Dynamic Grid Background with Color Blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#020617_0%,#0B1026_42%,#12163E_72%,#19144C_100%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(199,210,254,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(199,210,254,0.06)_1px,transparent_1px)] [background-size:40px_40px]" />
      
      {/* Decorative Floating 3D Blobs */}
      <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-indigo-500/[0.12] blur-3xl" />
      <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-purple-500/[0.12] blur-3xl" />
      <div className="absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-emerald-500/[0.05] blur-3xl" />

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-white/5 bg-[#020617]/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-md">
              <Orbit className="size-5 text-indigo-400 animate-spin-slow" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">Syntra</span>
              <span className="ml-1.5 text-xs text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">AOIP</span>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href={isLoggedIn && dashboardPath ? dashboardPath : "/auth/login"}
              className="text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              System Dashboard
            </Link>
            <Button
              asChild
              className="rounded-xl bg-indigo-600 font-semibold hover:bg-indigo-500 text-white border border-indigo-500/30"
            >
              <Link href={isLoggedIn && dashboardPath ? dashboardPath : "/auth/login"}>
                {isLoggedIn ? "Go to Dashboard" : "Sign In / Register"}
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Hero Panel */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          
          {/* Left Text Block */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="size-3.5 animate-pulse" />
              Academic Operations & Intelligence Portal
            </div>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white xl:text-6xl">
              Engineering Project <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Execution Simplified
              </span>
            </h1>

            <p className="text-lg leading-relaxed text-slate-300 max-w-xl">
              Syntra is a real-time capstone management platform that tracks student execution from project discovery through literature review, core engineering, IEEE documentation, and final oral defense.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                asChild
                className="h-12 rounded-xl bg-white font-bold text-slate-950 hover:bg-slate-100 shadow-[0_4px_24px_rgba(255,255,255,0.15)]"
              >
                <Link href={isLoggedIn && dashboardPath ? dashboardPath : "/auth/login"}>
                  {isLoggedIn ? "Enter Workspace" : "Get Started Now"}
                  <ArrowRight className="size-4 ml-2 text-slate-950" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-xl border-white/10 hover:bg-white/5 font-semibold text-slate-200"
              >
                <Link href="/auth/login">Explore Marketplace</Link>
              </Button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-6 border-t border-white/5 pt-8 max-w-md">
              <div>
                <p className="text-3xl font-extrabold text-white">24+</p>
                <p className="text-xs text-slate-400 mt-1">Operational Playbooks</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">0%</p>
                <p className="text-xs text-slate-400 mt-1">TypeScript Build Lints</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">Live</p>
                <p className="text-xs text-slate-400 mt-1">Database Signal Sync</p>
              </div>
            </div>
          </div>

          {/* Right 3D Visual Block */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative flex aspect-square w-full max-w-[480px] lg:max-w-none items-center justify-center rounded-3xl border border-white/5 bg-white/[0.01] p-8 shadow-inner"
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
              {/* Back Card (Literature review) */}
              <div 
                className="absolute w-[80%] h-[55%] rounded-2xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-md p-5 shadow-[0_15px_45px_rgba(168,85,247,0.15)] flex flex-col justify-between"
                style={{
                  transform: "translateZ(-80px) translateY(-30px) rotate(-4deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex items-center justify-between border-b border-purple-500/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-purple-400" />
                    <span className="text-[11px] font-bold text-purple-300 tracking-wider uppercase">LitMap Summary</span>
                  </div>
                  <Badge className="bg-purple-500/10 border-purple-400/20 text-purple-300 text-[9px] py-0">APPROVED</Badge>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="h-2.5 rounded-full bg-purple-500/20 w-full" />
                  <div className="h-2.5 rounded-full bg-purple-500/20 w-5/6" />
                  <div className="h-2.5 rounded-full bg-purple-500/20 w-4/5" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-purple-300/60 mt-4">
                  <span>34 papers mapped</span>
                  <span>Week 2</span>
                </div>
              </div>

              {/* Middle Card (System progress) */}
              <div 
                className="absolute w-[85%] h-[55%] rounded-2xl border border-indigo-500/20 bg-indigo-950/20 backdrop-blur-md p-5 shadow-[0_20px_50px_rgba(99,102,241,0.2)] flex flex-col justify-between"
                style={{
                  transform: "translateZ(0px) translateY(10px) rotate(2deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-indigo-400" />
                    <span className="text-[11px] font-bold text-indigo-300 tracking-wider uppercase">Project metrics</span>
                  </div>
                  <Badge className="bg-indigo-500/10 border-indigo-400/20 text-indigo-300 text-[9px] py-0">ACTIVE</Badge>
                </div>
                <div className="space-y-3.5 my-3">
                  <div className="flex items-center justify-between text-xs text-indigo-200">
                    <span>Overall Progress</span>
                    <span className="font-bold">72%</span>
                  </div>
                  <Progress value={72} className="h-2 bg-indigo-950 border border-indigo-500/10" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-indigo-300/60">
                  <span>Risk Score: Low</span>
                  <span>Health: High</span>
                </div>
              </div>

              {/* Top Card (Viva Readiness Analyzer) */}
              <div 
                className="absolute w-[78%] h-[52%] rounded-2xl border border-emerald-500/30 bg-slate-900/80 backdrop-blur-lg p-4 shadow-[0_30px_60px_rgba(16,185,129,0.25)] flex flex-col justify-between"
                style={{
                  transform: "translateZ(80px) translateY(40px) rotate(-2deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Mic2 className="size-4 text-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-emerald-300 tracking-wider uppercase">Viva Readiness</span>
                  </div>
                  <Badge className="bg-emerald-500/20 border-emerald-400/30 text-emerald-400 text-[9px] py-0 font-bold">92% READY</Badge>
                </div>
                <div className="my-2 space-y-2">
                  <p className="text-[10px] text-slate-400 leading-normal">Examiner Prompt:</p>
                  <p className="text-[11px] font-medium text-slate-200 italic leading-relaxed">
                    &ldquo;Explain your model selection trade-off and database design rationale.&rdquo;
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-slate-100/5 pt-2">
                  <div className="h-6 rounded-md bg-emerald-500/15 border border-emerald-500/20 px-2 flex items-center justify-center text-[10px] font-semibold text-emerald-400">
                    Rehearsed 5 times
                  </div>
                  <ShieldCheck className="size-4 text-emerald-400" />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Grid of features */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:py-16 border-t border-white/5 bg-[#020617]/20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group/card relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.04] shadow-sm hover:shadow-lg"
              >
                <div className={cn("mb-4 flex size-11 items-center justify-center rounded-xl border", feature.color)}>
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#020617]/60 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Orbit className="size-4 text-indigo-500/50" />
            <span>&copy; 2026 Syntra Capstone Portal. All rights reserved.</span>
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
