"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDown, ArrowUp, BarChart3, BookOpen, ChevronRight, Clock3, FileText, Flame, Lightbulb, ShieldAlert, Sparkles, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const filterClasses =
  "rounded-2xl border border-slate-800 bg-slate-950/90 px-3.5 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/10";

const severityStyles: Record<string, string> = {
  Critical: "text-rose-400 bg-rose-500/10 border-rose-500/15",
  High: "text-amber-300 bg-amber-500/10 border-amber-500/15",
  Moderate: "text-sky-300 bg-sky-500/10 border-sky-500/15",
  Stable: "text-emerald-300 bg-emerald-500/10 border-emerald-500/15",
};

const insightCards = [
  {
    label: "Critical backlog surge",
    value: "4 students",
    detail: "entered the critical backlog zone this semester",
    tone: "critical",
    icon: Flame,
    trend: "+36%",
    action: "View Students",
  },
  {
    label: "Year 3 backlog pressure",
    value: "+23%",
    detail: "increase vs last semester",
    tone: "warning",
    icon: TrendingDown,
    trend: "+23%",
    action: "Inspect Pattern",
  },
  {
    label: "Database Systems bottleneck",
    value: "Highest repeat failure rate",
    detail: "department escalation required",
    tone: "risk",
    icon: BookOpen,
    trend: "+12 pts",
    action: "Review Subject",
  },
  {
    label: "Recovery momentum",
    value: "Y4 improvement",
    detail: "semester recovery velocity is stronger",
    tone: "success",
    icon: ShieldAlert,
    trend: "+14%",
    action: "Open Recovery",
  },
];

const kpis = [
  {
    label: "Active Backlogs",
    value: "62",
    delta: "+9",
    trend: "vs last semester",
    tone: "critical",
    spark: [32, 35, 37, 42, 49, 54, 62],
  },
  {
    label: "Cleared Backlogs",
    value: "27",
    delta: "+6",
    trend: "semester gain",
    tone: "success",
    spark: [18, 21, 22, 24, 26, 25, 27],
  },
  {
    label: "At-Risk Students",
    value: "13",
    delta: "+2",
    trend: "emerging cases",
    tone: "warning",
    spark: [9, 10, 10, 11, 12, 12, 13],
  },
  {
    label: "Repeat Attempts",
    value: "18",
    delta: "+4",
    trend: "failure recency",
    tone: "risk",
    spark: [11, 12, 14, 15, 16, 17, 18],
  },
  {
    label: "Critical Cases",
    value: "5",
    delta: "+3",
    trend: "urgent review",
    tone: "critical",
    spark: [2, 3, 3, 4, 4, 5, 5],
  },
];

const failureDensity = [
  { period: "Y1", Critical: 6, High: 14, Moderate: 24, Stable: 56 },
  { period: "Y2", Critical: 11, High: 18, Moderate: 20, Stable: 51 },
  { period: "Y3", Critical: 16, High: 22, Moderate: 18, Stable: 44 },
  { period: "Y4", Critical: 9, High: 15, Moderate: 26, Stable: 50 },
];

const riskSegments = [
  {
    label: "Stable",
    count: 23,
    description: "Students with no active backlogs and strong recovery signal.",
    tone: "Stable",
    color: "emerald",
    suggested: "Monitor cadence, no immediate action.",
  },
  {
    label: "Moderate",
    count: 18,
    description: "Backlog pressure is rising; early mentor outreach advised.",
    tone: "Moderate",
    color: "sky",
    suggested: "Assign review checkpoints and attendance support.",
  },
  {
    label: "High",
    count: 11,
    description: "Students with repeated backlog flags and grade risk.",
    tone: "High",
    color: "amber",
    suggested: "Schedule remediation and subject-level coaching.",
  },
  {
    label: "Critical",
    count: 5,
    description: "Cases requiring intervention before examination windows.",
    tone: "Critical",
    color: "rose",
    suggested: "Trigger department escalation and mentor pairing.",
  },
];

const failedSubjects = [
  {
    subject: "DBS 402",
    faculty: "Prof. N. Bhat",
    failure: "29%",
    attempts: "34",
    semester: "Spr 26",
    trend: "+8",
    tone: "Critical",
    department: "CS",
  },
  {
    subject: "SWE 304",
    faculty: "Dr. J. Mehta",
    failure: "21%",
    attempts: "27",
    semester: "Spr 26",
    trend: "+5",
    tone: "High",
    department: "CS",
  },
  {
    subject: "MATH 410",
    faculty: "Dr. S. Roy",
    failure: "18%",
    attempts: "19",
    semester: "Spr 26",
    trend: "+3",
    tone: "Moderate",
    department: "Math",
  },
  {
    subject: "AI 251",
    faculty: "Prof. A. Sen",
    failure: "14%",
    attempts: "16",
    semester: "Spr 26",
    trend: "-1",
    tone: "Stable",
    department: "CS",
  },
];

const recoveryVelocity = [
  { month: "Jan", recovered: 3, threshold: 10 },
  { month: "Feb", recovered: 5, threshold: 12 },
  { month: "Mar", recovered: 7, threshold: 14 },
  { month: "Apr", recovered: 10, threshold: 16 },
  { month: "May", recovered: 12, threshold: 18 },
];

const heatmapStudents = [
  { name: "Aanya R.", score: [2, 3, 4, 4, 3, 4, 5], attendance: 82, recovery: 68 },
  { name: "Dev S.", score: [3, 4, 4, 5, 4, 4, 5], attendance: 89, recovery: 75 },
  { name: "Mira T.", score: [4, 4, 5, 5, 4, 5, 5], attendance: 78, recovery: 54 },
  { name: "Karan P.", score: [1, 2, 3, 3, 2, 3, 4], attendance: 93, recovery: 84 },
  { name: "Tara N.", score: [3, 3, 4, 4, 5, 4, 5], attendance: 87, recovery: 72 },
];

const backlogRecords = [
  {
    student: "Aanya R.",
    subject: "DBS 402",
    year: "Y3",
    attempts: 3,
    severity: "Critical",
    probability: "28%",
  },
  {
    student: "Dev S.",
    subject: "SWE 304",
    year: "Y3",
    attempts: 2,
    severity: "High",
    probability: "41%",
  },
  {
    student: "Mira T.",
    subject: "MATH 410",
    year: "Y4",
    attempts: 2,
    severity: "Moderate",
    probability: "63%",
  },
  {
    student: "Karan P.",
    subject: "AI 251",
    year: "Y3",
    attempts: 1,
    severity: "Stable",
    probability: "83%",
  },
  {
    student: "Tara N.",
    subject: "DBS 402",
    year: "Y4",
    attempts: 4,
    severity: "Critical",
    probability: "22%",
  },
];

const aiInsights = [
  {
    title: "Backlog escalation predicted",
    detail: "8 students are likely to cross the critical threshold within 14 days.",
    tone: "critical",
  },
  {
    title: "Recovery potential",
    detail: "7 students in Y4 are trending toward clearance after targeted mentoring.",
    tone: "success",
  },
  {
    title: "Systemic subject risk",
    detail: "Database Systems and SWE are responsible for 42% of current interventions.",
    tone: "warning",
  },
  {
    title: "Faculty workload alert",
    detail: "4 mentors are at capacity with active critical cases this cycle.",
    tone: "risk",
  },
];

function toneClass(tone: string) {
  if (tone === "critical") return "text-rose-400";
  if (tone === "warning" || tone === "risk") return "text-amber-300";
  if (tone === "success" || tone === "Stable") return "text-emerald-300";
  return "text-sky-300";
}

function sparklineData(data: number[]) {
  return data.map((value, index) => ({ index, value }));
}

function getSeverityDot(value: number) {
  if (value >= 5) return "bg-rose-400";
  if (value >= 4) return "bg-amber-400";
  if (value >= 3) return "bg-sky-400";
  return "bg-emerald-400";
}

export function BacklogAnalyticsBoard() {
  const [year, setYear] = useState("2025-26");
  const [department, setDepartment] = useState("Computer Science");
  const [semester, setSemester] = useState("Semester 2");
  const [activeSegment, setActiveSegment] = useState("Critical");

  const activeRisk = useMemo(
    () => riskSegments.find((segment) => segment.label === activeSegment) || riskSegments[3],
    [activeSegment],
  );

  return (
    <section className="space-y-8 px-4 pb-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/95 p-8 shadow-[0_34px_108px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Faculty monitoring</p>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Academic Risk Intelligence
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Track backlog patterns, identify at-risk students, and monitor academic recovery trends across departments.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))] xl:items-end">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Academic year</label>
              <select
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className={filterClasses}
              >
                <option>2026-27</option>
                <option>2025-26</option>
                <option>2024-25</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Department</label>
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className={filterClasses}
              >
                <option>Computer Science</option>
                <option>Data Science</option>
                <option>Mathematics</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Semester</label>
              <select
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                className={filterClasses}
              >
                <option>Semester 2</option>
                <option>Semester 1</option>
                <option>Winter Term</option>
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Button variant="secondary" className="w-full">
                <FileText className="size-4" /> Export report
              </Button>
              <Button className="w-full">
                <Sparkles className="size-4" /> AI Insights
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]" />
            Last synced 2 mins ago
          </div>
          <div className="flex-1 min-w-[240px] text-sm text-slate-400">
            Current filter: <span className="font-semibold text-slate-200">{department}</span> · {semester} · {year}
          </div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Mission control for faculty risk</div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex min-h-[118px] w-full flex-col gap-4 overflow-x-auto pb-1 sm:flex-row sm:flex-wrap sm:items-end">
          {insightCards.map((item) => {
            const ToneIcon = item.icon;
            const toneClassName =
              item.tone === "critical"
                ? "border-rose-500/15 bg-rose-500/10 text-rose-200"
                : item.tone === "warning"
                ? "border-amber-500/15 bg-amber-500/10 text-amber-200"
                : item.tone === "success"
                ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-200"
                : "border-sky-500/15 bg-sky-500/10 text-sky-200";

            return (
              <Card
                key={item.label}
                className="min-w-[280px] flex-1 border-slate-800/90 bg-slate-950/90 shadow-[0_18px_58px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:border-slate-700"
              >
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{item.value}</p>
                    </div>
                    <div className={cn("rounded-2xl border px-3 py-2 text-sm", toneClassName)}>
                      <ToneIcon className="size-4" />
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-400">{item.detail}</p>
                  <Button variant="outline" size="sm" className="w-full justify-between text-slate-100 hover:bg-slate-800/80">
                    {item.action}
                    <ChevronRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
          {kpis.map((item) => (
            <Card
              key={item.label}
              className="border-slate-800/90 bg-slate-950/90 transition hover:-translate-y-0.5"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                  </div>
                  <div className={cn("rounded-full border px-3 py-1 text-sm font-medium uppercase tracking-[0.2em]", item.tone === "critical" || item.tone === "risk" ? "border-rose-500/20 text-rose-300" : item.tone === "warning" ? "border-amber-500/20 text-amber-300" : "border-emerald-500/20 text-emerald-300")}> 
                    {item.delta}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
                  <span>{item.trend}</span>
                  <span>{item.spark[item.spark.length - 1]}% trend</span>
                </div>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData(item.spark)}>
                      <Line type="monotone" dataKey="value" stroke={item.tone === "critical" || item.tone === "risk" ? "#fb7185" : item.tone === "warning" ? "#f59e0b" : item.tone === "success" ? "#34d399" : "#38bdf8"} strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <Card className="border-slate-800/90 bg-slate-950/90">
            <CardHeader className="space-y-3">
              <div>
                <CardTitle className="text-white">Failure density by year</CardTitle>
                <CardDescription>
                  Stacked severity across cohort years to reveal where backlog pressure is most concentrated.
                </CardDescription>
              </div>
              <ChartLegend
                items={[
                  { label: "Stable", color: "#34d399" },
                  { label: "Moderate", color: "#38bdf8" },
                  { label: "High", color: "#f59e0b" },
                  { label: "Critical", color: "#fb7185" },
                ]}
              />
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer>
                <BarChart data={failureDensity} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="period" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent />} cursor={{ fill: "rgba(15,23,42,0.08)" }} />
                  <Bar dataKey="Stable" stackId="a" fill="#34d399" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="Moderate" stackId="a" fill="#38bdf8" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="High" stackId="a" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="Critical" stackId="a" fill="#fb7185" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="border-slate-800/90 bg-slate-950/90">
              <CardHeader className="space-y-3">
                <CardTitle className="text-white">Recovery velocity</CardTitle>
                <CardDescription>Monthly throughput for backlog clearance and recovery milestones.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer className="h-[220px]">
                  <AreaChart data={recoveryVelocity} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="recovered" fill="#38bdf8" stroke="#38bdf8" fillOpacity={0.2} strokeWidth={2.5} />
                    <Line type="monotone" dataKey="threshold" stroke="#64748b" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-slate-800/90 bg-slate-950/90">
              <CardHeader className="space-y-3">
                <CardTitle className="text-white">Backlog heat trend</CardTitle>
                <CardDescription>Early warning for weekly backlog intensity and recovery pressure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="grid gap-3">
                  <div className="rounded-3xl bg-slate-900/80 px-4 py-4 text-slate-100 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]">
                    <p className="text-sm text-slate-400">Critical surge points</p>
                    <p className="mt-2 text-2xl font-semibold text-white">5 hotspots identified</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 px-4 py-4 text-slate-100 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]">
                    <p className="text-sm text-slate-400">Recent alert cadence</p>
                    <p className="mt-2 text-2xl font-semibold text-white">3 elevated weeks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-800/90 bg-slate-950/90">
            <CardHeader className="space-y-3">
              <div>
                <CardTitle className="text-white">Academic risk distribution</CardTitle>
                <CardDescription>Severity funnel for faculty triage and escalation planning.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid gap-3">
                {riskSegments.map((segment) => {
                  const active = segment.label === activeSegment;
                  return (
                    <button
                      key={segment.label}
                      type="button"
                      onClick={() => setActiveSegment(segment.label)}
                      className={cn(
                        "group flex items-center justify-between gap-4 rounded-3xl border px-4 py-4 text-left transition",
                        active
                          ? "border-slate-600 bg-slate-900/95 shadow-[0_16px_58px_rgba(15,23,42,0.25)]"
                          : "border-slate-800/80 bg-slate-950/90 hover:border-slate-600 hover:bg-slate-900/80",
                      )}
                    >
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{segment.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{segment.count}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className={cn("h-3 w-3 rounded-full border", {
                          "border-emerald-400 bg-emerald-400/15": segment.color === "emerald",
                          "border-sky-400 bg-sky-400/15": segment.color === "sky",
                          "border-amber-400 bg-amber-400/15": segment.color === "amber",
                          "border-rose-400 bg-rose-400/15": segment.color === "rose",
                        })}
                        />
                        <span>{active ? "Selected" : "Tap to inspect"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Segment detail</p>
                <p className="mt-3 text-xl font-semibold text-white">{activeRisk.label} cases</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{activeRisk.description}</p>
                <p className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                  Suggested action: {activeRisk.suggested}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800/90 bg-slate-950/90">
            <CardHeader className="space-y-3">
              <CardTitle className="text-white">Most failed subjects</CardTitle>
              <CardDescription>Ranked teaching risks and repeat-attempt pressure by subject.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-3">
                {failedSubjects.map((subject, index) => (
                  <div
                    key={subject.subject}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 transition hover:-translate-y-0.5"
                  >
                    <div className="min-w-[88px] text-sm text-slate-400">{index + 1}</div>
                    <div className="min-w-[110px] space-y-1">
                      <p className="font-semibold text-white">{subject.subject}</p>
                      <p className="text-xs text-slate-500">{subject.department}</p>
                    </div>
                    <div className="min-w-[130px] text-sm">
                      <p className="font-semibold text-white">{subject.failure}</p>
                      <p className="text-xs text-slate-500">failure rate</p>
                    </div>
                    <div className="min-w-[88px] text-sm text-slate-300">{subject.attempts} attempts</div>
                    <div className="flex min-w-[100px] flex-col text-sm text-slate-300">
                      <span>{subject.semester}</span>
                      <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        {subject.trend.startsWith("+") ? <ArrowUp className="size-3 text-emerald-300" /> : <ArrowDown className="size-3 text-rose-300" />}
                        Trend
                      </span>
                    </div>
                    <Badge variant="outline" className={cn("uppercase", severityStyles[subject.tone] ?? "border-slate-700 text-slate-200")}>{subject.tone}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <Card className="border-slate-800/90 bg-slate-950/90">
            <CardHeader className="space-y-3">
              <CardTitle className="text-white">Backlog clearance intelligence</CardTitle>
              <CardDescription>
                Monthly recovery milestones, anomaly signals, and clearance momentum for faculty decision-making.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="rounded-3xl bg-slate-900/80 p-4 text-slate-200 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">AI observation</p>
                    <p className="mt-2 text-lg font-semibold text-white">Recovery velocity has accelerated, but repeat backlog clusters remain in Y3.</p>
                  </div>
                  <Badge variant="outline" className="border-sky-500/20 text-sky-300">Signal</Badge>
                </div>
              </div>
              <div className="h-[320px]">
                <ChartContainer>
                  <LineChart data={recoveryVelocity} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="recovered" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                    <Area type="monotone" dataKey="threshold" fill="#0f172a" stroke="#64748b" fillOpacity={0.2} strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Milestone</p>
                  <p className="mt-2 text-xl font-semibold text-white">May recovery peak</p>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Anomaly</p>
                  <p className="mt-2 text-xl font-semibold text-white">Week 14 backlog spike</p>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Prediction</p>
                  <p className="mt-2 text-xl font-semibold text-white">Clearance confidence +18%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800/90 bg-slate-950/90">
            <CardHeader className="space-y-3">
              <CardTitle className="text-white">AI Academic Intelligence</CardTitle>
              <CardDescription>Trustworthy guidance generated for urgent faculty interventions and workload planning.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {aiInsights.map((insight) => (
                <div key={insight.title} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 transition hover:border-slate-600/80 hover:bg-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{insight.title}</p>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.26em]", toneClass(insight.tone))}>
                      {insight.tone === "critical" ? "Critical" : insight.tone === "warning" ? "Flag" : insight.tone === "success" ? "Positive" : "Alert"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{insight.detail}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-400">Suggested next step: assign mentors to critical cluster.</span>
              <Button size="sm" variant="secondary">
                Sync to mentoring plan
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <Card className="border-slate-800/90 bg-slate-950/90">
            <CardHeader className="space-y-3">
              <CardTitle className="text-white">Student severity heatmap</CardTitle>
              <CardDescription>Hover for student risk cadence and click any row to open the academic timeline drawer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="overflow-x-auto rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-4">
                <div className="grid min-w-[860px] gap-2">
                  <div className="grid grid-cols-[220px_repeat(7,1fr)_120px] items-center gap-2 rounded-3xl bg-slate-950/95 px-4 py-3 text-xs uppercase tracking-[0.24em] text-slate-500">
                    <span>Student</span>
                    {Array.from({ length: 7 }, (_, index) => (
                      <span key={index} className="text-center">W{index + 1}</span>
                    ))}
                    <span className="text-right">Recovery score</span>
                  </div>
                  {heatmapStudents.map((student) => (
                    <button
                      key={student.name}
                      type="button"
                      className="group grid min-w-[860px] grid-cols-[220px_repeat(7,1fr)_120px] items-center gap-2 rounded-3xl border border-slate-800/80 bg-slate-950/90 px-4 py-3 text-left transition hover:border-slate-600 hover:bg-slate-900/80"
                      title={`${student.name} · attendance ${student.attendance}% · recovery ${student.recovery}%`}
                    >
                      <div>
                        <p className="font-medium text-white">{student.name}</p>
                        <p className="text-xs text-slate-500">Attendance {student.attendance}%</p>
                      </div>
                      {student.score.map((value, index) => (
                        <div key={`${student.name}-${index}`} className="flex items-center justify-center">
                          <span className={cn("h-8 w-8 rounded-2xl border border-slate-800/80", getSeverityDot(value))} />
                        </div>
                      ))}
                      <div className="text-right">
                        <p className="font-semibold text-white">{student.recovery}%</p>
                        <p className="text-xs text-slate-500">prediction</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800/90 bg-slate-950/90">
            <CardHeader className="space-y-3">
              <CardTitle className="text-white">Backlog records</CardTitle>
              <CardDescription>Operational table for urgent faculty follow-up and notes.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Search student, subject, severity"
                  className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/10"
                />
                <select className={filterClasses}>
                  <option>Sort by severity</option>
                  <option>Attempts</option>
                  <option>Clearance probability</option>
                </select>
              </div>
              <div className="overflow-hidden rounded-[1.75rem] border border-slate-800/90">
                <div className="grid min-w-full grid-cols-[2fr_1fr_1fr_1fr_1fr] bg-slate-950/95 px-4 py-3 text-xs uppercase tracking-[0.24em] text-slate-500">
                  <span>Student</span>
                  <span>Subject</span>
                  <span>Attempts</span>
                  <span>Severity</span>
                  <span>Clearance</span>
                </div>
                <div className="divide-y divide-slate-800/80 bg-slate-900/80">
                  {backlogRecords.map((record) => (
                    <div key={`${record.student}-${record.subject}`} className="grid min-w-full grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 px-4 py-4 transition hover:bg-slate-800/80">
                      <div>
                        <p className="font-medium text-white">{record.student}</p>
                        <p className="text-xs text-slate-500">{record.year}</p>
                      </div>
                      <div className="text-slate-200">{record.subject}</div>
                      <div className="text-slate-200">{record.attempts}</div>
                      <div>
                        <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-xs", severityStyles[record.severity] ?? "border-slate-700 text-slate-200")}>{record.severity}</Badge>
                      </div>
                      <div className="space-y-2 text-right">
                        <p className="font-semibold text-white">{record.probability}</p>
                        <Button size="sm" variant="outline" className="w-full">
                          Flag
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
