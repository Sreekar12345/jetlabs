"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowUpRight, BrainCircuit, FileText, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const bandCards = [
  { band: "Excellent", count: 19, pct: "24%", delta: "+8%", insight: "Top performers continue to widen their lead.", tone: "emerald" },
  { band: "Good", count: 27, pct: "34%", delta: "+5%", insight: "Strong cohort momentum across project and research signals.", tone: "blue" },
  { band: "Average", count: 21, pct: "26%", delta: "-2%", insight: "Consistency needs more support in attendance and backlog recovery.", tone: "amber" },
  { band: "At Risk", count: 9, pct: "11%", delta: "-12%", insight: "Critical band reduced after targeted mentor review.", tone: "orange" },
  { band: "Critical", count: 4, pct: "5%", delta: "-18%", insight: "Intervention load remains concentrated in ECE and Math.", tone: "red" },
];

const insights = [
  { label: "Highest performing batch", value: "AIML Y3", trend: "+14", tone: "emerald" },
  { label: "Attendance predicts rank", value: "Strong correlation", trend: "+18", tone: "blue" },
  { label: "Research-active students", value: "Avg +18 score lift", trend: "+18", tone: "purple" },
  { label: "Critical students in ECE", value: "4 cases flagged", trend: "-2", tone: "red" },
];

const cohortSeries = [
  { dimension: "Attendance", dept: 82, cohort: 76 },
  { dimension: "Backlogs", dept: 68, cohort: 59 },
  { dimension: "Projects", dept: 81, cohort: 72 },
  { dimension: "IEEE Papers", dept: 74, cohort: 63 },
  { dimension: "Achievements", dept: 79, cohort: 70 },
  { dimension: "Consistency", dept: 77, cohort: 68 },
];

const percentileData = [
  { band: "Top 10%", value: 94 },
  { band: "Top 25%", value: 88 },
  { band: "Median", value: 72 },
  { band: "Bottom 25%", value: 57 },
  { band: "Critical", value: 39 },
];

const leaderboard: { name: string; dept: string; score: number; momentum: string; research: number; attendance: number; backlog: string; consistency: number; action: string }[] = [];

const momentumData = [
  { month: "Jan", score: 68 },
  { month: "Feb", score: 71 },
  { month: "Mar", score: 74 },
  { month: "Apr", score: 76 },
  { month: "May", score: 81 },
];

const aiNotes = [
  "Students with project contribution >80% consistently maintain Good/Excellent band.",
  "Attendance decline predicts risk escalation within 2 months.",
  "Research-active cohorts outperform on composite score by 18 points.",
];

export function PerformanceScoreBoard() {
  const [year, setYear] = useState("2025-26");
  const [department, setDepartment] = useState("All departments");
  const [batch, setBatch] = useState("All batches");
  const [dimension, setDimension] = useState("Composite score");

  return (
    <section className="space-y-8 px-4 pb-10 sm:px-6 lg:px-8 bg-slate-50/20 min-h-screen">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 font-semibold">Faculty Intelligence</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Student Performance Intelligence</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">Composite academic ranking across attendance, backlog risk, projects, research activity, achievements, and consistency.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))] xl:items-end">{[
            { label: "Academic year", value: year, onChange: setYear, options: ["2025-26", "2024-25", "2026-27"] },
            { label: "Department", value: department, onChange: setDepartment, options: ["All departments", "CSE", "ECE", "AI", "Math"] },
            { label: "Batch", value: batch, onChange: setBatch, options: ["All batches", "Y1", "Y2", "Y3", "Y4"] },
            { label: "Score dimension", value: dimension, onChange: setDimension, options: ["Composite score", "Attendance", "Research", "Projects"] },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <label className="text-xs uppercase tracking-[0.26em] text-slate-550">{item.label}</label>
              <select 
                value={item.value} 
                onChange={(e) => item.onChange(e.target.value)} 
                className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/10"
              >
                {item.options.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>
          ))}</div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-3xl border border-slate-100 bg-slate-50/50 p-4">
          <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"><FileText className="size-4" /> Export report</Button>
          <Button className="bg-slate-900 text-white hover:bg-slate-800"><Sparkles className="size-4" /> AI Insights</Button>
          <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <span className="size-2 rounded-full bg-emerald-500" /> Live sync · 2 mins ago
          </div>
        </div>
        <div className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-200 bg-slate-50/40">
            <CardContent className="space-y-3 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-550">Executive intelligence summary</p>
              <div className="space-y-3">{[
                "2 students entered critical zone this month.",
                "Project performance improved 18%.",
                "Research participation strongly correlates with top scorers.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-2xs">
                  {item}
                </div>
              ))}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-gradient-to-br from-violet-50/30 via-white to-sky-50/30">
            <CardContent className="space-y-4 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-550">Faculty intervention control</p>
              <p className="text-3xl font-semibold text-slate-900">Real-time academic ranking engine</p>
              <p className="text-sm text-slate-600">Use the score bands and momentum signals to identify where mentorship, attendance recovery, or backlog intervention will produce the strongest uplift.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">{bandCards.map((item) => (
        <Card key={item.band} className="border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-350 hover:shadow-xs rounded-2xl">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-550">{item.band}</p>
              <span className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em]", 
                item.tone === "emerald" ? "border-emerald-200 bg-emerald-50/80 text-emerald-700" : 
                item.tone === "blue" ? "border-sky-200 bg-sky-50/80 text-sky-700" : 
                item.tone === "amber" ? "border-amber-200 bg-amber-50/80 text-amber-700" : 
                item.tone === "orange" ? "border-orange-200 bg-orange-50/80 text-orange-700" : 
                "border-rose-200 bg-rose-50/80 text-rose-700"
              )}>
                {item.delta}
              </span>
            </div>
            <p className="text-3xl font-semibold text-slate-900">{item.count}</p>
            <p className="text-sm text-slate-400">{item.pct} of cohort</p>
            <p className="text-sm text-slate-600">{item.insight}</p>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[12, 14, 16, 18, 20]}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={
                      item.tone === "emerald" ? "#10b981" : 
                      item.tone === "blue" ? "#0ea5e9" : 
                      item.tone === "amber" ? "#f59e0b" : 
                      item.tone === "orange" ? "#ea580c" : 
                      "#f43f5e"
                    } 
                    strokeWidth={3} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}</div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Performance dimension intelligence</CardTitle>
            <CardDescription>Multi-axis benchmark comparison across the current cohort and department average.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer>
              <AreaChart data={cohortSeries}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="dimension" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="dept" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.08} />
                <Area type="monotone" dataKey="cohort" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.06} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Cohort performance spectrum</CardTitle>
            <CardDescription>Distribution density, clustering, and percentile intelligence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">{percentileData.map((item) => (
            <div key={item.band} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{item.band}</span>
                <span className="text-slate-900 font-semibold">{item.value}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Performance insights strip</CardTitle>
            <CardDescription>Operational alerts for faculty intervention planning.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">{insights.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50/80 hover:border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">{item.label}</p>
                <span className={cn(
                  "rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]", 
                  item.tone === "emerald" ? "border border-emerald-250 bg-emerald-50 text-emerald-700" : 
                  item.tone === "blue" ? "border border-sky-250 bg-sky-50 text-sky-700" : 
                  item.tone === "purple" ? "border border-violet-250 bg-violet-50 text-violet-700" : 
                  "border border-rose-250 bg-rose-50 text-rose-700"
                )}>
                  {item.trend}
                </span>
              </div>
              <p className="mt-3 text-xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}</CardContent>
        </Card>
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">AI academic intelligence</CardTitle>
            <CardDescription>Predicted toppers, drop-risk students, and intervention logic.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">{aiNotes.map((note) => (
            <div key={note} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-600">
              {note}
            </div>
          ))}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Dynamic student leaderboard</CardTitle>
            <CardDescription>Rank movement, consistency, attendance, and intervention status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">{leaderboard.map((student, index) => (
            <div 
              key={student.name} 
              className={cn(
                "rounded-2xl border p-4 transition hover:-translate-y-0.5", 
                index === 0 ? "border-amber-200 bg-amber-50/20" : 
                index === 1 ? "border-slate-200 bg-slate-50/40" : 
                index === 2 ? "border-orange-200 bg-orange-50/20" : 
                "border-slate-100 bg-slate-50/10"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                    {student.name.split(" ").map((x) => x[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.dept} · Momentum {student.momentum}</p>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-full border-slate-200 text-slate-800 bg-white">Score {student.score}</Badge>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3"> 
                <span>Research {student.research}</span> 
                <span>Attendance {student.attendance}%</span> 
                <span>Consistency {student.consistency}</span> 
              </div>
              <div className="mt-4 flex flex-wrap gap-2">{[student.backlog, student.action].map((chip) => (
                <span key={chip} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                  {chip}
                </span>
              ))}</div>
            </div>
          ))}</CardContent>
        </Card>
        <div className="grid gap-4">
          <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Student performance DNA</CardTitle>
              <CardDescription>Segmented intelligence for performance drivers and risk regions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">{[
              ["Attendance", 82], ["Projects", 78], ["Backlog", 61], ["Research", 74], ["Leadership", 69], ["Consistency", 81],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                  <span>{label}</span>
                  <span className="text-slate-900 font-semibold">{value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}</CardContent>
          </Card>
          <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Student momentum</CardTitle>
              <CardDescription>Rank trajectory and recovery signals over recent months.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer>
                <LineChart data={momentumData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
