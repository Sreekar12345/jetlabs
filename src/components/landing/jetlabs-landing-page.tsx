"use client";

import Link from "next/link";
import {
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Gauge,
  GraduationCap,
  Layers,
  Lightbulb,
  LineChart,
  Menu,
  MessageSquare,
  Network,
  Rocket,
  Search,
  Sparkles,
  Target,
  UserCheck,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IconItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type ShowcaseItem = {
  title: string;
  description: string;
  metric: string;
  label: string;
};

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Contact", href: "#contact" },
];

const proofLogos = [
  "IIT",
  "Startup Cell",
  "Innovation Hub",
  "TechFest",
  "Incubation Center",
];

const problems = [
  "Projects scattered across multiple tools",
  "No centralized collaboration",
  "Difficult mentor tracking",
  "Poor innovation visibility",
  "Unstructured submissions",
  "Teams lose documentation",
];

const solutionCards: IconItem[] = [
  {
    icon: Layers,
    title: "Project Workspace",
    description:
      "Structured spaces for ideas, research notes, milestones, files, and execution plans.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Coordinate student teams with roles, activity streams, tasks, and shared project context.",
  },
  {
    icon: UserCheck,
    title: "Mentor Dashboard",
    description:
      "Give faculty and mentors one place to review progress, unblock teams, and leave feedback.",
  },
  {
    icon: LineChart,
    title: "Innovation Tracking",
    description:
      "Monitor project health, velocity, readiness, review cycles, and measurable innovation outcomes.",
  },
  {
    icon: ClipboardCheck,
    title: "Submission Management",
    description:
      "Run structured weekly, final, viva, pitch, and incubation submissions without tool sprawl.",
  },
  {
    icon: Brain,
    title: "AI Assistance",
    description:
      "Help teams refine problem statements, documentation, literature review, and next-step planning.",
  },
  {
    icon: BookOpen,
    title: "Resource Hub",
    description:
      "Centralize templates, playbooks, mentor notes, evaluation rubrics, and startup resources.",
  },
  {
    icon: Rocket,
    title: "Startup Incubation Workflow",
    description:
      "Move promising projects from idea to prototype, pilot, mentor review, and incubation readiness.",
  },
];

const workflowSteps = [
  "Create Innovation Project",
  "Add Team Members",
  "Collaborate & Track Progress",
  "Submit & Scale Ideas",
];

const showcases: ShowcaseItem[] = [
  {
    title: "Real-time collaboration",
    description:
      "Teams can plan, assign, discuss, and document project work in one focused workspace built for academic innovation cycles.",
    metric: "94%",
    label: "team visibility",
  },
  {
    title: "AI-powered project assistance",
    description:
      "Guide students from rough idea to sharper problem framing, research direction, technical scope, and presentation-ready documentation.",
    metric: "3.2x",
    label: "faster drafts",
  },
  {
    title: "Centralized documentation",
    description:
      "Every idea, file, decision, review, and iteration stays attached to the project record so teams never lose momentum.",
    metric: "1 hub",
    label: "for every artifact",
  },
  {
    title: "Mentor feedback workflows",
    description:
      "Faculty can review checkpoints, compare team progress, leave structured feedback, and spot high-risk projects early.",
    metric: "42%",
    label: "fewer stalled teams",
  },
  {
    title: "Innovation analytics dashboard",
    description:
      "Leadership gets a clear view of active projects, domains, mentor load, submissions, readiness, and incubation potential.",
    metric: "360",
    label: "degree insights",
  },
  {
    title: "Startup incubation tracking",
    description:
      "Track idea maturity, prototype progress, market validation, pitch readiness, and founder support from a single command center.",
    metric: "8",
    label: "incubation stages",
  },
];

const targetUsers: IconItem[] = [
  {
    icon: GraduationCap,
    title: "Students",
    description:
      "Turn ideas into documented, review-ready projects with clear milestones and team accountability.",
  },
  {
    icon: UserCheck,
    title: "Faculty",
    description:
      "Review progress, mentor efficiently, and identify teams that need academic or technical support.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Cells",
    description:
      "Run challenges, track submissions, manage cohorts, and showcase measurable innovation output.",
  },
  {
    icon: Briefcase,
    title: "Incubators",
    description:
      "Move promising teams through validation, mentor review, market readiness, and startup launch paths.",
  },
  {
    icon: Building2,
    title: "College Administrators",
    description:
      "See institution-wide innovation health, participation, mentor utilization, and outcome trends.",
  },
];

const particles = [
  { left: "7%", top: "18%", delay: 0, duration: 8 },
  { left: "18%", top: "72%", delay: 1.2, duration: 10 },
  { left: "34%", top: "14%", delay: 0.4, duration: 9 },
  { left: "62%", top: "24%", delay: 2.1, duration: 11 },
  { left: "78%", top: "68%", delay: 1.6, duration: 9 },
  { left: "90%", top: "38%", delay: 0.8, duration: 10 },
  { left: "48%", top: "82%", delay: 2.8, duration: 12 },
  { left: "12%", top: "43%", delay: 3.2, duration: 11 },
];

export function JetLabsLandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050506] text-white">
      <LandingBackdrop />
      <LandingNavbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <HeroSection />
      <SocialProofSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeatureShowcaseSection />
      <TargetUsersSection />
      <DashboardPreviewSection />
      <CTASection />
      <Footer />
    </main>
  );
}

function LandingBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[#050506]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.16),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.035),transparent_28%)]" />
      <motion.div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 78%)",
        }}
        animate={{ backgroundPosition: ["0px 0px", "56px 56px"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
      {particles.map((particle, index) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className="absolute size-1 rounded-full bg-sky-300/45"
          style={{ left: particle.left, top: particle.top }}
          animate={{ opacity: [0.12, 0.65, 0.12], y: [0, -16, 0] }}
          transition={{
            delay: particle.delay,
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="sr-only">Particle {index + 1}</span>
        </motion.span>
      ))}
    </div>
  );
}

function LandingNavbar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050506]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="#" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg border border-sky-300/35 bg-white/[0.04] shadow-[0_0_28px_rgba(56,189,248,0.16)]">
            <span className="text-sm font-semibold text-white">J</span>
          </span>
          <span className="text-sm font-semibold tracking-normal text-white">
            JetLabs
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/[0.025] px-1.5 py-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            asChild
            variant="ghost"
            className="rounded-lg text-zinc-300 hover:bg-white/[0.06] hover:text-white"
          >
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button
            asChild
            className="rounded-lg bg-white text-black shadow-[0_0_36px_rgba(56,189,248,0.14)] hover:bg-zinc-200"
          >
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <motion.div
        initial={false}
        animate={mobileOpen ? "open" : "closed"}
        variants={{
          open: { height: "auto", opacity: 1 },
          closed: { height: 0, opacity: 0 },
        }}
        className="overflow-hidden border-t border-white/10 bg-[#08080a]/95 md:hidden"
      >
        <div className="space-y-2 px-4 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              asChild
              variant="outline"
              className="rounded-lg border-white/10 bg-white/[0.03]"
            >
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            </Button>
            <Button asChild className="rounded-lg bg-white text-black hover:bg-zinc-200">
              <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative z-10 px-4 pb-20 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-lg border border-sky-300/20 bg-sky-300/[0.06] px-3 py-2 text-sm text-sky-100">
            <Sparkles className="size-4 text-sky-300" />
            Academic Innovation Platform
          </div>

          <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
            Build, Manage & Scale Student Innovation Projects in One Platform
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
            JetLabs helps colleges manage innovation projects, startup ideas,
            mentorship, collaboration, submissions, and incubation workflows
            from one centralized platform.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-lg bg-white px-6 text-black hover:bg-zinc-200"
            >
              <Link href="/auth/signup">
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-lg border-white/12 bg-white/[0.03] px-6 text-white hover:bg-white/[0.08]"
            >
              <Link href="#contact">Book Demo</Link>
            </Button>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["1,240+", "active projects"],
              ["86%", "on-time reviews"],
              ["48", "mentor cohorts"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
              >
                <div className="text-xl font-semibold tracking-normal text-white">
                  {value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-normal text-zinc-500">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <HeroDashboardMockup />
        </Reveal>
      </div>
    </section>
  );
}

function HeroDashboardMockup() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 130, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 130, damping: 24 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <motion.div
        className="absolute -right-4 top-8 hidden rounded-lg border border-sky-300/25 bg-[#0b1116]/90 p-4 shadow-[0_24px_70px_rgba(56,189,248,0.14)] backdrop-blur-xl sm:block"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-sky-300/10 text-sky-300">
            <Gauge className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Innovation Score</p>
            <p className="text-2xl font-semibold tracking-normal text-white">91%</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -left-3 bottom-12 hidden w-56 rounded-lg border border-white/10 bg-[#08080a]/90 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.46)] backdrop-blur-xl md:block"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white">Mentor Review</p>
          <span className="rounded-md bg-sky-300/10 px-2 py-1 text-xs text-sky-200">
            Live
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {["Prototype scope", "Market notes", "Pitch draft"].map((item, index) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="size-4 text-sky-300" />
              <div className="h-2 flex-1 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-sky-300/80"
                  style={{ width: `${88 - index * 18}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
        className="relative overflow-hidden rounded-lg border border-white/12 bg-[#08080a] shadow-[0_40px_120px_rgba(0,0,0,0.62),0_0_80px_rgba(56,189,248,0.1)]"
      >
        <div className="flex h-12 items-center justify-between border-b border-white/10 bg-white/[0.03] px-4">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-white/25" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-sky-300/70" />
          </div>
          <div className="hidden items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-400 sm:flex">
            <Search className="size-3.5" />
            Search project, team, mentor
          </div>
        </div>

        <div className="grid min-h-[520px] lg:grid-cols-[174px_1fr]">
          <aside className="hidden border-r border-white/10 bg-white/[0.025] p-4 lg:block">
            <div className="mb-6 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-white text-black">
                J
              </span>
              <div>
                <p className="text-sm font-semibold text-white">JetLabs</p>
                <p className="text-xs text-zinc-500">Workspace</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                [Activity, "Overview"],
                [Layers, "Projects"],
                [Users, "Teams"],
                [MessageSquare, "Mentors"],
                [BarChart3, "Analytics"],
              ].map(([Icon, label], index) => (
                <div
                  key={label as string}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500",
                    index === 0 && "bg-sky-300/10 text-sky-100",
                  )}
                >
                  <Icon className="size-4" />
                  {label as string}
                </div>
              ))}
            </div>
          </aside>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm text-zinc-500">Innovation Command Center</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                  Incubation Cohort S6
                </h2>
              </div>
              <div className="rounded-lg border border-sky-300/20 bg-sky-300/[0.06] px-3 py-2 text-sm text-sky-100">
                24 ideas in review
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Active Projects", "126", "+18%"],
                ["Mentor Reviews", "342", "92%"],
                ["Incubation Ready", "18", "+7"],
              ].map(([label, value, change]) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
                >
                  <p className="text-xs text-zinc-500">{label}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-2xl font-semibold tracking-normal text-white">
                      {value}
                    </p>
                    <p className="text-xs text-sky-300">{change}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">Innovation Metrics</p>
                  <LineChart className="size-4 text-sky-300" />
                </div>
                <div className="mt-6 flex h-40 items-end gap-3">
                  {[52, 68, 46, 76, 62, 88, 72, 94].map((height, index) => (
                    <div key={`${height}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                      <motion.div
                        className="w-full rounded-t-md bg-gradient-to-t from-sky-300/30 to-sky-200"
                        initial={{ height: 12 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.04 }}
                      />
                      <span className="text-[10px] text-zinc-600">W{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ["AeroCrop AI", "Prototype validation", 84],
                  ["MedQueue", "Mentor review", 72],
                  ["Campus Grid", "Final submission", 93],
                ].map(([name, stage, score]) => (
                  <div
                    key={name as string}
                    className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{name}</p>
                        <p className="mt-1 text-sm text-zinc-500">{stage}</p>
                      </div>
                      <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs text-sky-200">
                        {score as number}
                      </span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-sky-300"
                        style={{ width: `${score as number}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SocialProofSection() {
  return (
    <section className="relative z-10 border-y border-white/10 bg-white/[0.018] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-sm text-zinc-400">
          Built for modern academic innovation ecosystems
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {proofLogos.map((logo) => (
            <motion.div
              key={logo}
              whileHover={{ y: -4 }}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4 text-center text-sm font-medium text-zinc-300"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section id="solutions" className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <SectionEyebrow>Problem</SectionEyebrow>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
            Academic Innovation Is Still Disorganized
          </h2>
          <div className="mt-8 grid gap-3">
            {problems.map((problem) => (
              <div
                key={problem}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-4"
              >
                <span className="mt-1 size-2 rounded-full bg-sky-300" />
                <p className="text-zinc-300">{problem}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <WorkflowComparison />
        </Reveal>
      </div>
    </section>
  );
}

function WorkflowComparison() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] p-4 sm:p-6">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(56,189,248,0.08),transparent)]" />
      <div className="relative grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <div className="mb-5 flex items-center justify-between">
            <p className="font-medium text-white">Chaotic workflow</p>
            <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-500">
              Before
            </span>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-4">
            {[
              ["Sheets", "left-[8%] top-[12%]"],
              ["Chat", "right-[10%] top-[24%]"],
              ["Drive", "left-[30%] top-[45%]"],
              ["Email", "right-[16%] bottom-[22%]"],
              ["Notes", "left-[12%] bottom-[16%]"],
            ].map(([label, position], index) => (
              <motion.div
                key={label}
                className={cn(
                  "absolute rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-400",
                  position,
                )}
                animate={{ y: [0, index % 2 ? -8 : 8, 0] }}
                transition={{
                  duration: 4 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {label}
              </motion.div>
            ))}
            <svg className="absolute inset-0 h-full w-full opacity-35" aria-hidden="true">
              <path d="M80 70 C180 40 220 190 330 110" stroke="white" strokeWidth="1" strokeDasharray="5 8" fill="none" />
              <path d="M90 220 C210 150 230 260 360 210" stroke="white" strokeWidth="1" strokeDasharray="5 8" fill="none" />
              <path d="M210 130 C140 170 260 210 150 245" stroke="white" strokeWidth="1" strokeDasharray="5 8" fill="none" />
            </svg>
          </div>
        </div>

        <div className="rounded-lg border border-sky-300/25 bg-sky-300/[0.04] p-4">
          <div className="mb-5 flex items-center justify-between">
            <p className="font-medium text-white">JetLabs dashboard</p>
            <span className="rounded-md bg-sky-300/10 px-2 py-1 text-xs text-sky-200">
              Organized
            </span>
          </div>
          <div className="min-h-72 rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="grid gap-3">
              {[
                ["Project workspace", 94],
                ["Mentor tracking", 82],
                ["Submission pipeline", 76],
                ["Documentation health", 88],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">{label as string}</span>
                    <span className="text-sky-200">{value as number}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-sky-300"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${value as number}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SolutionSection() {
  return (
    <section id="features" className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Platform"
            title="Everything innovation teams need to move from idea to outcome"
            description="JetLabs brings workspaces, reviews, submissions, mentor feedback, analytics, and incubation workflows into one serious operating layer."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {solutionCards.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.035}>
              <FeatureCard feature={feature} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: IconItem }) {
  const Icon = feature.icon;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group h-full rounded-lg border border-white/10 bg-white/[0.028] p-5 transition hover:border-sky-300/40 hover:bg-white/[0.045] hover:shadow-[0_0_36px_rgba(56,189,248,0.1)]"
    >
      <div className="grid size-11 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-300 transition group-hover:border-sky-300/35 group-hover:bg-sky-300/10">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-normal text-white">
        {feature.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.description}</p>
    </motion.div>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Workflow"
            title="A clear path from student idea to scalable innovation"
            description="Create structure without slowing teams down. JetLabs keeps every stakeholder aligned across the full academic innovation lifecycle."
          />
        </Reveal>

        <div className="relative mt-14 grid gap-4 lg:grid-cols-4">
          <motion.div
            className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-sky-300/45 to-transparent lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
          {workflowSteps.map((step, index) => (
            <Reveal key={step} delay={index * 0.08}>
              <div className="relative rounded-lg border border-white/10 bg-[#08080a]/85 p-5">
                <div className="mb-6 grid size-16 place-items-center rounded-lg border border-sky-300/25 bg-sky-300/[0.06] text-xl font-semibold tracking-normal text-sky-100">
                  0{index + 1}
                </div>
                <h3 className="text-xl font-semibold tracking-normal text-white">
                  {step}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {[
                    "Start with a structured workspace, category, goals, and evaluation path.",
                    "Invite students, mentors, faculty, and coordinators with clear roles.",
                    "Track tasks, documentation, reviews, and milestone progress in real time.",
                    "Package outcomes for evaluation, demo days, pilots, and incubation programs.",
                  ][index]}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureShowcaseSection() {
  return (
    <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Showcase"
            title="Built for the operational reality of academic innovation"
            description="The platform gives students room to build while giving institutions the visibility, structure, and reporting they need."
          />
        </Reveal>

        <div className="mt-16 space-y-20">
          {showcases.map((item, index) => (
            <ShowcaseBlock key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseBlock({ item, index }: { item: ShowcaseItem; index: number }) {
  const reversed = index % 2 === 1;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <Reveal className={cn(reversed && "lg:order-last")}>
        <FeatureMockup index={index} item={item} />
      </Reveal>
      <Reveal delay={0.08}>
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-sky-100">
            <Zap className="size-4 text-sky-300" />
            {item.label}
          </div>
          <h3 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            {item.title}
          </h3>
          <p className="mt-5 text-lg leading-8 text-zinc-400">{item.description}</p>
          <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <p className="text-4xl font-semibold tracking-normal text-white">
              {item.metric}
            </p>
            <p className="mt-2 text-sm text-zinc-500">{item.label}</p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function FeatureMockup({ index, item }: { index: number; item: ShowcaseItem }) {
  const Icon = [Users, Brain, FileText, MessageSquare, BarChart3, Rocket][index] ?? Layers;

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-sky-300/10 text-sky-300">
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{item.title}</p>
            <p className="text-xs text-zinc-500">JetLabs module</p>
          </div>
        </div>
        <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-500">
          Live
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-3">
          {[88, 72, 96].map((value, lineIndex) => (
            <div key={`${value}-${lineIndex}`} className="rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <div className="h-2 w-24 rounded-full bg-white/15" />
                <span className="text-xs text-sky-300">{value}%</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-sky-300"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: lineIndex * 0.08 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-zinc-300">Activity density</p>
            <Activity className="size-4 text-sky-300" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, dotIndex) => (
              <motion.div
                key={dotIndex}
                className={cn(
                  "aspect-square rounded-md",
                  dotIndex % 5 === 0
                    ? "bg-sky-300/70"
                    : dotIndex % 3 === 0
                      ? "bg-sky-300/30"
                      : "bg-white/10",
                )}
                initial={{ opacity: 0.2 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: dotIndex * 0.01 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TargetUsersSection() {
  return (
    <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Teams"
            title="Designed for every stakeholder in the ecosystem"
            description="JetLabs connects students, faculty, innovation cells, incubators, and administrators without forcing them into separate tools."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {targetUsers.map((user, index) => (
            <Reveal key={user.title} delay={index * 0.05}>
              <FeatureCard feature={user} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreviewSection() {
  return (
    <section id="dashboard" className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Dashboard"
            title="A command center for innovation operations"
            description="See projects, mentors, tasks, submissions, reviews, analytics, and startup readiness in a single premium operating view."
          />
        </Reveal>

        <Reveal delay={0.12}>
          <div className="relative mt-14 overflow-hidden rounded-lg border border-white/10 bg-[#08080a] p-3 shadow-[0_38px_120px_rgba(0,0,0,0.52)] sm:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_36%)]" />
            <div className="relative grid min-h-[680px] gap-4 lg:grid-cols-[210px_1fr]">
              <aside className="hidden rounded-lg border border-white/10 bg-white/[0.025] p-4 lg:block">
                <div className="mb-8 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-white text-black">
                    J
                  </span>
                  <div>
                    <p className="font-semibold text-white">JetLabs</p>
                    <p className="text-xs text-zinc-500">Admin console</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    [Gauge, "Overview"],
                    [Layers, "Projects"],
                    [Network, "Teams"],
                    [ClipboardCheck, "Tasks"],
                    [MessageSquare, "Reviews"],
                    [Target, "Incubation"],
                  ].map(([Icon, label], index) => (
                    <div
                      key={label as string}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-500",
                        index === 0 && "bg-sky-300/10 text-sky-100",
                      )}
                    >
                      <Icon className="size-4" />
                      {label as string}
                    </div>
                  ))}
                </div>
              </aside>

              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 sm:p-6">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">Academic Year 2026</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-normal text-white">
                      Innovation Portfolio
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["All colleges", "Mentors", "Incubation"].map((item, index) => (
                      <span
                        key={item}
                        className={cn(
                          "rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400",
                          index === 0 && "border-sky-300/30 bg-sky-300/10 text-sky-100",
                        )}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  {[
                    ["Projects", "312", "+24"],
                    ["Tasks", "1,840", "82%"],
                    ["Reviews", "729", "Live"],
                    ["Score", "88.4", "+6.1"],
                  ].map(([label, value, detail]) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <p className="text-sm text-zinc-500">{label}</p>
                      <p className="mt-3 text-3xl font-semibold tracking-normal text-white">
                        {value}
                      </p>
                      <p className="mt-2 text-xs text-sky-300">{detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">Innovation score tracking</p>
                      <BarChart3 className="size-4 text-sky-300" />
                    </div>
                    <div className="mt-8 flex h-56 items-end gap-3">
                      {[48, 60, 54, 72, 78, 66, 84, 91, 88, 96].map((height, index) => (
                        <div key={`${height}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                          <motion.div
                            className="w-full rounded-t-md bg-gradient-to-t from-sky-300/20 to-sky-200"
                            initial={{ height: 16 }}
                            whileInView={{ height: `${height}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: index * 0.04 }}
                          />
                          <span className="text-[10px] text-zinc-600">{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">Team collaboration</p>
                        <Users className="size-4 text-sky-300" />
                      </div>
                      <div className="mt-4 space-y-3">
                        {["Design review", "Prototype sprint", "Mentor sync"].map((task, index) => (
                          <div key={task} className="flex items-center justify-between rounded-lg bg-white/[0.035] p-3">
                            <div className="flex items-center gap-3">
                              <span className="grid size-8 place-items-center rounded-lg bg-sky-300/10 text-xs text-sky-200">
                                {index + 1}
                              </span>
                              <span className="text-sm text-zinc-300">{task}</span>
                            </div>
                            <CheckCircle2 className="size-4 text-sky-300" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-sky-300/25 bg-sky-300/[0.045] p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">Mentor review system</p>
                        <MessageSquare className="size-4 text-sky-300" />
                      </div>
                      <p className="mt-4 text-sm leading-6 text-zinc-300">
                        18 teams awaiting review, 9 flagged for incubation, and 4 ready
                        for demo-day evaluation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              className="absolute bottom-8 right-6 hidden w-64 rounded-lg border border-white/10 bg-[#050506]/90 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.46)] backdrop-blur-xl lg:block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Startup readiness</p>
                <Rocket className="size-4 text-sky-300" />
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-full w-[78%] rounded-full bg-sky-300" />
              </div>
              <p className="mt-3 text-xs text-zinc-500">78% validated across cohort</p>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="contact" className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] px-6 py-16 text-center sm:px-10">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.14),transparent_42%)]" />
          <div className="relative">
            <SectionEyebrow>Launch JetLabs</SectionEyebrow>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
              Ready to Modernize Academic Innovation?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
              Bring student projects, faculty mentoring, startup workflows, and
              institutional innovation metrics into one premium platform.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-lg bg-white px-6 text-black hover:bg-zinc-200"
              >
                <Link href="/auth/signup">
                  Start Building
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-lg border-white/12 bg-black/20 px-6 text-white hover:bg-white/[0.08]"
              >
                <Link href="mailto:hello@jetlabs.edu">Schedule Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg border border-sky-300/35 bg-white/[0.04]">
            J
          </span>
          <div>
            <p className="font-semibold tracking-normal text-white">JetLabs</p>
            <p className="text-sm text-zinc-500">Academic Innovation Platform</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-zinc-500">
          {[
            ["About", "#"],
            ["Features", "#features"],
            ["Contact", "#contact"],
            ["Privacy Policy", "#"],
            ["Terms", "#"],
            ["LinkedIn", "#"],
            ["GitHub", "#"],
          ].map(([label, href]) => (
            <Link key={label} href={href} className="transition hover:text-white">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-lg leading-8 text-zinc-400">{description}</p>
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-sky-300/20 bg-sky-300/[0.06] px-3 py-2 text-sm text-sky-100">
      <span className="size-1.5 rounded-full bg-sky-300" />
      {children}
    </div>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
