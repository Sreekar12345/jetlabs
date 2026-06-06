// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Compass,
  FileText,
  Orbit,
  Presentation,
  Sparkles,
  ChevronDown,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LandingClientProps {
  isLoggedIn: boolean;
  dashboardPath: string | null;
}

// Testimonials
const TESTIMONIALS = [
  {
    name: "Dr. Nisha Varma",
    role: "Dean of Engineering, RIT College",
    quote: "JetLabs restructured our capstone evaluations. Advisors can view real git-sync velocity instead of waiting for copy-pasted slides.",
    rating: 5,
    avatar: "NV"
  },
  {
    name: "Tarak Ram",
    role: "AI/ML Student, CSE Department",
    quote: "The Viva readiness rehearsals saved us. The AI evaluator flagged database index scaling issues before the actual committee did.",
    rating: 5,
    avatar: "TR"
  },
  {
    name: "Sanjay Gupta",
    role: "CTO, CloudScale & Industry Mentor",
    quote: "I submit projects to the marketplace and track progress directly. It bridges the gap between college labs and real engineering.",
    rating: 5,
    avatar: "SG"
  }
];

// FAQ list
const FAQS = [
  {
    question: "How does the platform link milestones to actual student progress?",
    answer: "JetLabs integrates directly with git code commits and weekly reports. When code is pushed, the synchronization engine records activity events in the Neon PostgreSQL database, updating milestone progress logs automatically."
  },
  {
    question: "What makes the Viva Rehearsal simulator effective?",
    answer: "The simulator generates contextual questions based on the team's chosen project stack (e.g. database selections, scaling options, API design). It uses score validation models to grade responses, preparing students for final panel evaluations."
  },
  {
    question: "Can universities customize their evaluation criteria?",
    answer: "Yes. Cohort administrators can configure grading templates, timeline goals, literature citation minimums, and viva panel members to suit department specific guidelines."
  }
];

// Stats Count-Up Component
function CountUpMetric({ value, label, prefix = "", suffix = "" }: { value: string; label: string; prefix?: string; suffix?: string }) {
  const numericVal = parseFloat(value.replace(/[^0-9.]/g, ""));
  const isFloat = value.includes(".");
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const increment = numericVal / (duration / 16); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericVal) {
        setCount(numericVal);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [numericVal]);

  const displayCount = isFloat ? count.toFixed(1) : Math.floor(count);

  return (
    <div className="space-y-1 text-center">
      <p className="text-4xl font-black text-transparent bg-gradient-to-r from-rose-400 via-fuchsia-400 to-violet-400 bg-clip-text font-display">
        {prefix}{displayCount}{suffix}
      </p>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}

export function LandingClient({ isLoggedIn, dashboardPath }: LandingClientProps) {
  // Interactive global mouse coordinates for space glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [spotlightCoords, setSpotlightCoords] = useState<Record<number, { x: number; y: number }>>({});
  
  // Testimonials state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleCardMouseMove = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlightCoords((prev) => ({
      ...prev,
      [index]: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }));
  };

  const features = [
    {
      title: "Problem Marketplace",
      description: "Browse vetted engineering, AI/ML, and IoT problem statements compiled by industry leaders and research mentors.",
      icon: Compass,
      color: "text-rose-400 border-rose-500/20 bg-rose-500/5",
      glowColor: "rgba(244,63,94,0.12)"
    },
    {
      title: "Guided IEEE Workspace",
      description: "Draft sections with built-in reference engines, section guides, and checklist validation to match IEEE formatting rules.",
      icon: FileText,
      color: "text-violet-400 border-violet-500/20 bg-violet-500/5",
      glowColor: "rgba(139,92,246,0.12)"
    },
    {
      title: "Viva Defense Simulator",
      description: "Rehearse presentation defense rounds. Answer committee prompts on architecture, database indexes, and scaling tradeoffs.",
      icon: Presentation,
      color: "text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5",
      glowColor: "rgba(217,70,239,0.12)"
    },
    {
      title: "Dynamic Submissions",
      description: "Manage weekly updates, code repositories, and hosted preview deployments under dynamic review channels.",
      icon: Boxes,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      glowColor: "rgba(16,185,129,0.12)"
    },
  ];

  return (
    <div 
      onMouseMove={handleGlobalMouseMove}
      className="relative min-h-screen overflow-x-hidden bg-[#020205] text-slate-200 font-sans"
    >
      {/* 1. Dynamic Cursor Glow Blob */}
      <div
        className="pointer-events-none absolute -left-48 -top-48 h-[400px] w-[400px] rounded-full bg-rose-500/[0.06] blur-[100px] transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
        }}
      />

      {/* Cyber Grid with perspective and linear gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#020205_0%,#04030d_45%,#0b071e_75%,#0d0426_100%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.12),transparent_50%)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #8b5cf6 1px, transparent 1px),
            linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)
          `,
          backgroundSize: "45px 45px",
          transform: "perspective(800px) rotateX(30deg) translateY(-80px) translateZ(0)",
          transformOrigin: "top center"
        }}
      />

      {/* Glow Orbs */}
      <div className="absolute left-[-10%] top-[-5%] h-[500px] w-[500px] rounded-full bg-rose-500/[0.04] blur-[150px] pointer-events-none" />
      <div className="absolute right-[-5%] top-[15%] h-[600px] w-[600px] rounded-full bg-violet-500/[0.04] blur-[180px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="relative z-30 border-b border-rose-950/20 bg-[#020205]/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-violet-500/10 shadow-[0_0_20px_rgba(244,63,94,0.25)]">
              <Orbit className="size-5 text-rose-400 animate-spin-slow" />
              <div className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-500 border border-slate-950" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white font-display bg-gradient-to-r from-white to-slate-300 bg-clip-text">JetLabs</span>
              <span className="ml-2 text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/25 uppercase tracking-wider">AOIP</span>
            </div>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href={isLoggedIn && dashboardPath ? dashboardPath : "/auth/login"}
              className="text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              System Dashboard
            </Link>
            <Button
              asChild
              className="rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 font-bold hover:from-rose-500 hover:to-violet-500 text-white border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.25)] transition-all duration-300"
            >
              <Link href={isLoggedIn && dashboardPath ? dashboardPath : "/auth/login"}>
                {isLoggedIn ? "Go to Dashboard" : "Sign In / Register"}
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-4.5 py-1.5 text-xs font-bold text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <Sparkles className="size-3.5 text-rose-400 animate-pulse" />
            Academic Operations & Research Intelligence
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight text-white xl:text-7xl font-display max-w-3xl">
            Deploy Excellence.<br />
            <span className="bg-gradient-to-r from-rose-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(244,63,94,0.15)]">
              Streamline Innovation.
            </span>
          </h1>

          <p className="text-lg leading-relaxed text-slate-355 max-w-2xl mx-auto">
            JetLabs bridges the gap between codebase activity and academic evaluations. Orchestrate engineering cohorts, automate milestone grading, and simulate board defenses inside a unified platform.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 justify-center">
            <Button
              asChild
              className="h-13 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-400 hover:to-violet-400 font-extrabold text-slate-950 shadow-[0_8px_30px_rgba(244,63,94,0.25)] border-0 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <Link href={isLoggedIn && dashboardPath ? dashboardPath : "/auth/login"}>
                {isLoggedIn ? "Enter Workspace" : "Claim Workspace"}
                <ArrowRight className="size-4.5 ml-2 text-slate-950 stroke-[3px]" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-13 px-6 rounded-xl border-rose-950/40 bg-slate-950/40 hover:bg-slate-900/60 hover:border-rose-900 font-bold text-slate-200"
            >
              <Link href="/auth/login">Explore Vetted Problems</Link>
            </Button>
          </div>

          {/* Quick Metrics Bar with animated count up */}
          <div className="grid grid-cols-3 gap-8 md:gap-16 border-t border-rose-950/30 pt-10 mt-6 w-full max-w-2xl justify-center">
            <CountUpMetric value="42" label="Innovation Teams" suffix="+" />
            <CountUpMetric value="128" label="Research Papers" suffix="+" />
            <CountUpMetric value="9.4" label="Viva Defense Avg" suffix="/10" />
          </div>

        </div>
      </main>

      {/* Feature Grid with Spotlight Flashlight Hover effect */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16 border-t border-rose-950/20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const coords = spotlightCoords[idx] || { x: 0, y: 0 };
            
            return (
              <div
                key={feature.title}
                onMouseMove={(e) => handleCardMouseMove(idx, e)}
                onMouseEnter={() => setHoveredCardIndex(idx)}
                onMouseLeave={() => setHoveredCardIndex(null)}
                className="group relative rounded-2xl border border-rose-950/30 bg-[#060410]/35 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-rose-900/40 shadow-sm overflow-hidden"
                style={{
                  background: hoveredCardIndex === idx 
                    ? `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, ${feature.glowColor}, transparent 50%)`
                    : 'transparent'
                }}
              >
                {/* Spotlight Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(150px circle at ${coords.x}px ${coords.y}px, ${feature.glowColor.replace('0.12', '0.08')}, transparent 80%)`
                  }}
                />
                
                <div className={cn("mb-4 flex size-11 items-center justify-center rounded-xl border transition-all duration-300", feature.color)}>
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials section */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-16 border-t border-rose-950/20">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl font-display">
            Trusted by Innovators
          </h2>
          <p className="text-slate-455 text-sm">
            Read what academic deans, advisors, and student engineering teams say about JetLabs.
          </p>
        </div>

        {/* Carousel slide card */}
        <div className="relative rounded-2xl border border-rose-950 bg-slate-900/10 p-8 sm:p-10 backdrop-blur-xl shadow-xl overflow-hidden min-h-60 max-w-3xl mx-auto flex flex-col justify-between">
          <div className="absolute top-4 right-6 text-rose-950/40 text-8xl font-serif font-black select-none pointer-events-none opacity-40">
            &ldquo;
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex gap-1">
              {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
                <Sparkles key={i} className="size-4.5 text-amber-455 fill-amber-400" />
              ))}
            </div>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed italic">
              &ldquo;{TESTIMONIALS[activeTestimonial].quote}&rdquo;
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-rose-950/30 z-10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-xs text-rose-300">
                {TESTIMONIALS[activeTestimonial].avatar}
              </div>
              <div>
                <p className="text-xs font-bold text-white font-display">{TESTIMONIALS[activeTestimonial].name}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{TESTIMONIALS[activeTestimonial].role}</p>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={cn(
                    "size-2 rounded-full transition-all duration-300",
                    activeTestimonial === idx ? "bg-rose-400 w-5" : "bg-slate-900"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-16 border-t border-rose-950/20">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-455 text-sm">
            Everything you need to know about the JetLabs Academic Operations platform.
          </p>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-rose-950/30 bg-slate-900/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left text-sm font-bold text-white transition hover:bg-slate-900/25"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown className={cn("size-4.5 text-rose-455 transition-transform duration-300 shrink-0", isExpanded && "rotate-180")} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-rose-950/20">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive CTA Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-12 lg:py-20">
        <div className="relative rounded-3xl overflow-hidden border border-rose-950/30 bg-gradient-to-b from-rose-950/10 to-violet-950/15 p-8 sm:p-14 text-center shadow-2xl backdrop-blur-md">
          <div className="absolute inset-0 bg-rose-500/[0.02] rounded-3xl filter blur-2xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-display">
              Ready to Accelerate Your Projects?
            </h2>
            <p className="text-slate-350 text-sm sm:text-base leading-relaxed">
              Join the academic portal built for modern engineering innovation. Create cohorts, submit weekly logs, evaluate files, and prepare oral defenses seamlessly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Button
                asChild
                className="h-12 px-6 rounded-xl bg-white font-extrabold text-slate-950 hover:bg-slate-100 shadow-[0_4px_20px_rgba(255,255,255,0.15)] border-0 transition-transform hover:-translate-y-0.5"
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
      <footer className="relative z-10 border-t border-rose-950/20 bg-[#020205]/85 py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Orbit className="size-4 text-rose-500/40" />
            <span>&copy; 2026 JetLabs Capstone Portal. All rights reserved.</span>
          </div>
          <div className="flex gap-5">
            <Link href="/auth/login" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/auth/login" className="hover:text-slate-300">Terms of Use</Link>
            <Link href="/auth/login" className="hover:text-slate-300">Feedback Hub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
