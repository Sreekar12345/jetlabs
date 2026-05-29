"use client";

import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, BadgeCheck, BookOpen, BrainCircuit, ChevronRight, Compass, FileText, Globe2, Medal, Sparkles, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const kpis = [
  { label: "Total Achievements", value: "137", delta: "+18%", insight: "from previous semester", spark: [18, 22, 27, 30, 35, 38, 42], tone: "gold" },
  { label: "Participating Students", value: "84", delta: "+11%", insight: "broader engagement footprint", spark: [28, 32, 35, 38, 41, 47, 52], tone: "blue" },
  { label: "National/International", value: "29", delta: "+7", insight: "elite-level entries", spark: [6, 7, 9, 10, 12, 13, 15], tone: "purple" },
  { label: "Verified Achievements", value: "91%", delta: "+5 pts", insight: "proof and faculty validation", spark: [58, 63, 68, 71, 78, 84, 91], tone: "green" },
];

const distribution = [
  { level: "College", count: 54, departments: "CSE / ECE", trend: "+8%" },
  { level: "State", count: 41, departments: "Math / AI", trend: "+12%" },
  { level: "National", count: 28, departments: "Research / Innovation", trend: "+19%" },
  { level: "International", count: 14, departments: "IEEE / Hackathons", trend: "+26%" },
];

const categoryData = [
  { category: "IEEE Publications", value: 84, trend: "+12%", top: "A. Rao / CSE" },
  { category: "Hackathons", value: 72, trend: "+9%", top: "R. Kaur / AI" },
  { category: "Research", value: 68, trend: "+15%", top: "M. Iyer / ECE" },
  { category: "Innovation", value: 59, trend: "+8%", top: "S. Das / CSE" },
  { category: "Competitive Coding", value: 54, trend: "+6%", top: "N. Shah / Math" },
  { category: "Volunteering", value: 42, trend: "+4%", top: "T. Rao / NSS" },
  { category: "Cultural", value: 36, trend: "+3%", top: "L. Menon / Arts" },
];

const trendSeries = [
  { month: "Jan", academic: 18, nonAcademic: 12 },
  { month: "Feb", academic: 22, nonAcademic: 14 },
  { month: "Mar", academic: 29, nonAcademic: 17 },
  { month: "Apr", academic: 34, nonAcademic: 18 },
  { month: "May", academic: 41, nonAcademic: 21 },
];

const leaders = [
  { name: "Aarav Nair", dept: "CSE", score: 97, research: 18, streak: 7, badge: "Elite", rank: 1, tone: "gold" },
  { name: "Meera Iyer", dept: "Research", score: 94, research: 15, streak: 6, badge: "National", rank: 2, tone: "silver" },
  { name: "Rohan Shah", dept: "AI", score: 91, research: 13, streak: 5, badge: "Innovation", rank: 3, tone: "bronze" },
  { name: "Sara Khan", dept: "ECE", score: 88, research: 11, streak: 5, badge: "Trending", rank: 4, tone: "blue" },
];

const departments = [
  { name: "Computer Science", achievements: 37, national: 11, research: 84, innovation: 91, engagement: 88 },
  { name: "Data Science", achievements: 29, national: 8, research: 76, innovation: 82, engagement: 79 },
  { name: "Electronics", achievements: 24, national: 6, research: 69, innovation: 74, engagement: 71 },
  { name: "Mathematics", achievements: 18, national: 4, research: 61, innovation: 65, engagement: 63 },
];

const insights = [
  "Research participation increased 32% this semester.",
  "CSE department leads national achievement entries.",
  "4 students entered elite performer category.",
  "Innovation and hackathon activity remain strongest in AI cohorts.",
];

const aiHighlights = [
  { title: "Likely to achieve nationally", detail: "3 students show strong publication and hackathon momentum.", tone: "gold" },
  { title: "Departments losing momentum", detail: "Mathematics participation dipped 6% over the last cycle.", tone: "orange" },
  { title: "Research forecasting", detail: "Publication targets are on track, with June likely to peak.", tone: "blue" },
  { title: "Hidden top performers", detail: "Three interdisciplinary students are under-indexed in current faculty views.", tone: "purple" },
];

function toneClass(tone: string) {
  if (tone === "gold") return "text-amber-300";
  if (tone === "blue") return "text-sky-300";
  if (tone === "purple") return "text-violet-300";
  if (tone === "orange") return "text-orange-300";
  return "text-emerald-300";
}

export function AchievementAnalyticsBoard() {
  const [year, setYear] = useState("2025-26");
  const [department, setDepartment] = useState("All departments");
  const [type, setType] = useState("All achievements");
  const [range, setRange] = useState("Semester");

  return (
    <section className="space-y-8 px-4 pb-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/95 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.36)] backdrop-blur-xl">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Faculty intelligence</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Student Excellence Intelligence</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Track academic achievements, research participation, competitive performance, and institutional excellence across departments.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))] xl:items-end">
            <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-2xl border border-slate-800 bg-slate-950/90 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/10">...
            </select>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-2xl border border-slate-800 bg-slate-950/90 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/10">...
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-2xl border border-slate-800 bg-slate-950/90 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/10">...
            </select>
            <select value={range} onChange={(e) => setRange(e.target.value)} className="rounded-2xl border border-slate-800 bg-slate-950/90 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/10">...
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4">
          <Button variant="secondary"><FileText className="size-4" /> Export analytics</Button>
          <Button><Sparkles className="size-4" /> AI Insights</Button>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300"><span className="size-2 rounded-full bg-emerald-400" /> Live sync · 2 mins ago</div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.07)]">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Executive insight</p>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              {insights.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4">{item}</div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-slate-800/80 bg-gradient-to-br from-amber-400/8 via-slate-900/90 to-violet-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Faculty intelligence panel</p>
            <p className="mt-4 text-3xl font-semibold text-white">Prestige signal is accelerating</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Research participation and national wins are concentrated in top-performing departments, with innovation clusters now visibly rising.</p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-amber-400/10 bg-amber-400/8 p-4 text-amber-100">National entries up 18% this semester</div>
              <div className="rounded-2xl border border-sky-400/10 bg-sky-400/8 p-4 text-sky-100">Top 10 students now hold research momentum above baseline</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {kpis.map((item) => (
          <Card key={item.label} className="border-slate-800/90 bg-slate-950/90 transition hover:-translate-y-0.5 hover:border-slate-700">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                </div>
                <span className={cn("rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em]", item.tone === "gold" ? "border-amber-500/20 text-amber-300" : item.tone === "blue" ? "border-sky-500/20 text-sky-300" : item.tone === "purple" ? "border-violet-500/20 text-violet-300" : "border-emerald-500/20 text-emerald-300")}>{item.delta}</span>
              </div>
              <p className="text-sm text-slate-400">{item.insight}</p>
              <div className="h-14">
                <ResponsiveContainer width="100%" height="100%"><LineChart data={item.spark.map((value, index) => ({ index, value }))}><Line type="monotone" dataKey="value" stroke={item.tone === "gold" ? "#fbbf24" : item.tone === "blue" ? "#38bdf8" : item.tone === "purple" ? "#a78bfa" : "#34d399"} strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-slate-800/90 bg-slate-950/90">
          <CardHeader>
            <CardTitle className="text-white">Prestige distribution</CardTitle>
            <CardDescription>Achievement intensity by academic prestige tier.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {distribution.map((item) => (
              <div key={item.level} className="rounded-[1.6rem] border border-slate-800/80 bg-slate-900/90 p-5 transition hover:border-slate-700 hover:bg-slate-900">
                <div className="flex items-center justify-between text-sm text-slate-400"><span>{item.level}</span><span className="text-emerald-300">{item.trend}</span></div>
                <p className="mt-3 text-3xl font-semibold text-white">{item.count}</p>
                <p className="mt-2 text-sm text-slate-300">Leading departments: {item.departments}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-slate-800/90 bg-slate-950/90">
          <CardHeader>
            <CardTitle className="text-white">Achievement ecosystem analytics</CardTitle>
            <CardDescription>Category dominance, momentum, and department ownership.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">{categoryData.map((item) => (
            <div key={item.category} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 transition hover:border-slate-700 hover:bg-slate-900">
              <div className="flex items-center justify-between gap-3 text-sm text-slate-300"><span>{item.category}</span><span className="text-emerald-300">{item.trend}</span></div>
              <div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-violet-500" style={{ width: `${item.value}%` }} /></div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400"><span>Top contributor: {item.top}</span><span>{item.value}% density</span></div>
            </div>
          ))}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-800/90 bg-slate-950/90">
          <CardHeader>
            <CardTitle className="text-white">Student engagement momentum</CardTitle>
            <CardDescription>Academic vs non-academic participation, seasonal spikes, and research deadlines.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer>
              <AreaChart data={trendSeries}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="academic" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.18} />
                <Area type="monotone" dataKey="nonAcademic" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.14} />
              </AreaChart>
            </ChartContainer>
            <p className="mt-3 text-sm text-slate-400">January recorded the highest publication activity. Hackathon participation dipped during exam windows.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800/90 bg-slate-950/90">
          <CardHeader>
            <CardTitle className="text-white">AI excellence insights</CardTitle>
            <CardDescription>Futuristic guidance for hidden talent, interventions, and forecasted growth.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">{aiHighlights.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 transition hover:border-slate-700 hover:bg-slate-900">
              <p className={cn("text-xs uppercase tracking-[0.28em]", toneClass(item.tone))}>{item.tone}</p>
              <p className="mt-2 text-base font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
            </div>
          ))}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-800/90 bg-slate-950/90">
          <CardHeader>
            <CardTitle className="text-white">Elite student leaderboard</CardTitle>
            <CardDescription>Prestige ranking, research index, and verified excellence signals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">{leaders.map((student) => (
            <div key={student.name} className={cn("rounded-[1.5rem] border p-4 transition hover:-translate-y-0.5 hover:border-slate-700", student.rank === 1 ? "border-amber-400/20 bg-amber-400/8" : student.rank === 2 ? "border-slate-700 bg-slate-900/90" : student.rank === 3 ? "border-orange-400/20 bg-orange-400/8" : "border-slate-800 bg-slate-900/90") }>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 text-sm font-semibold text-white">{student.name.split(" ").map((x) => x[0]).join("")}</div><div><p className="font-semibold text-white">{student.name}</p><p className="text-xs text-slate-500">{student.dept} · streak {student.streak} weeks</p></div></div>
                <Badge variant="outline" className={cn("rounded-full", student.rank === 1 ? "border-amber-400/20 text-amber-100" : student.rank === 2 ? "border-slate-700 text-slate-200" : student.rank === 3 ? "border-orange-400/20 text-orange-100" : "border-sky-500/20 text-sky-100")}>{student.badge}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300"><span className="rounded-full border border-slate-800 bg-slate-950/90 px-3 py-1">Research {student.research}</span><span className="rounded-full border border-slate-800 bg-slate-950/90 px-3 py-1">Score {student.score}</span><span className="rounded-full border border-slate-800 bg-slate-950/90 px-3 py-1">Rank #{student.rank}</span></div>
            </div>
          ))}</CardContent>
        </Card>
        <Card className="border-slate-800/90 bg-slate-950/90">
          <CardHeader>
            <CardTitle className="text-white">Department excellence ranking</CardTitle>
            <CardDescription>Performance by research, innovation, and engagement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">{departments.map((dept, index) => (
            <div key={dept.name} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 transition hover:border-slate-700 hover:bg-slate-900">
              <div className="flex items-center justify-between gap-3 text-sm"><span className="text-white">#{index + 1} {dept.name}</span><span className="text-slate-400">{dept.achievements} achievements</span></div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300"><span>National wins: {dept.national}</span><span>Research: {dept.research}</span><span>Innovation: {dept.innovation}</span><span>Engagement: {dept.engagement}</span></div>
            </div>
          ))}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="border-slate-800/90 bg-slate-950/90">
          <CardHeader>
            <CardTitle className="text-white">Research intelligence hub</CardTitle>
            <CardDescription>Track publication quality, collaboration, and momentum.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">{leaders.map((student) => (
            <div key={student.name + "research"} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-semibold text-white">{student.name}</p><Badge className="border-sky-500/20 text-sky-200">Research {student.research}</Badge></div>
              <p className="mt-2 text-sm text-slate-400">Publication quality · Collaboration network · Impact score</p>
            </div>
          ))}</CardContent>
        </Card>
        <Card className="border-slate-800/90 bg-slate-950/90">
          <CardHeader>
            <CardTitle className="text-white">Achievement heatmap</CardTitle>
            <CardDescription>Semester bursts, department dominance, and high-performing windows.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-6 gap-2">{Array.from({ length: 24 }, (_, i) => (
              <div key={i} className={cn("h-8 rounded-xl border border-slate-800 bg-slate-900", i % 3 === 0 ? "bg-amber-400/12" : i % 2 === 0 ? "bg-violet-400/10" : "bg-slate-800") } />
            ))}</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
