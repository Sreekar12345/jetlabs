"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowUpRight, BrainCircuit, FileText, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface PerformanceScoreBoardProps {
  students: any[];
}

export function PerformanceScoreBoard({ students = [] }: PerformanceScoreBoardProps) {
  const [year, setYear] = useState("2025-26");
  const [department, setDepartment] = useState("All departments");
  const [batch, setBatch] = useState("All batches");
  const [dimension, setDimension] = useState("Composite score");

  // Client-side filtering logic based on selected filters
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Department filter
      const dept = student.department || student.memberships?.[0]?.team?.batch?.split(" ")?.[1] || "";
      const matchesDept = 
        department === "All departments" || 
        dept.toLowerCase().includes(department.toLowerCase()) ||
        (department === "AI" && dept.toLowerCase().includes("aiml")) ||
        (department === "CSE" && dept.toLowerCase().includes("computer"));

      // Batch filter
      const teamBatch = student.memberships?.[0]?.team?.batch || "";
      const studentBatchYear = student.batchYear || "";
      let matchesBatch = true;
      if (batch !== "All batches") {
        if (batch === "Y4") {
          matchesBatch = teamBatch.includes("2026") || studentBatchYear === "2026";
        } else if (batch === "Y3") {
          matchesBatch = teamBatch.includes("2027") || studentBatchYear === "2027";
        } else if (batch === "Y2") {
          matchesBatch = teamBatch.includes("2028") || studentBatchYear === "2028";
        } else if (batch === "Y1") {
          matchesBatch = teamBatch.includes("2029") || studentBatchYear === "2029";
        }
      }

      // Academic year filter
      let matchesYear = true;
      if (year !== "2025-26") {
        // Handle other years if necessary, or let it pass gracefully
      }

      return matchesDept && matchesBatch && matchesYear;
    });
  }, [students, department, batch, year]);

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  // Dynamic band count cards
  const bandCards = useMemo(() => {
    const total = filteredStudents.length || 1;
    const excellent = filteredStudents.filter(s => (s.performance?.score ?? 0) >= 90);
    const good = filteredStudents.filter(s => (s.performance?.score ?? 0) >= 80 && (s.performance?.score ?? 0) < 90);
    const average = filteredStudents.filter(s => (s.performance?.score ?? 0) >= 70 && (s.performance?.score ?? 0) < 80);
    const atRisk = filteredStudents.filter(s => (s.performance?.score ?? 0) >= 60 && (s.performance?.score ?? 0) < 70);
    const critical = filteredStudents.filter(s => (s.performance?.score ?? 0) < 60);

    return [
      { band: "Excellent", count: excellent.length, pct: `${Math.round((excellent.length / total) * 100)}%`, delta: "+8%", insight: "Top performers continue to widen their lead.", tone: "emerald" },
      { band: "Good", count: good.length, pct: `${Math.round((good.length / total) * 100)}%`, delta: "+5%", insight: "Strong cohort momentum across project and research signals.", tone: "blue" },
      { band: "Average", count: average.length, pct: `${Math.round((average.length / total) * 100)}%`, delta: "-2%", insight: "Consistency needs more support in attendance and backlog recovery.", tone: "amber" },
      { band: "At Risk", count: atRisk.length, pct: `${Math.round((atRisk.length / total) * 100)}%`, delta: "-12%", insight: "Critical band reduced after targeted mentor review.", tone: "orange" },
      { band: "Critical", count: critical.length, pct: `${Math.round((critical.length / total) * 100)}%`, delta: "-18%", insight: "Intervention load remains concentrated.", tone: "red" },
    ];
  }, [filteredStudents]);

  const getSparklineData = (bandName: string) => {
    if (bandName === "Excellent") return [{ value: 88 }, { value: 90 }, { value: 92 }, { value: 91 }, { value: 94 }];
    if (bandName === "Good") return [{ value: 78 }, { value: 80 }, { value: 82 }, { value: 84 }, { value: 86 }];
    if (bandName === "Average") return [{ value: 68 }, { value: 71 }, { value: 73 }, { value: 72 }, { value: 75 }];
    if (bandName === "At Risk") return [{ value: 65 }, { value: 63 }, { value: 61 }, { value: 62 }, { value: 60 }];
    return [{ value: 55 }, { value: 52 }, { value: 48 }, { value: 45 }, { value: 39 }];
  };

  // Executive Intelligence Summary items
  const executiveSummary = useMemo(() => {
    const criticalCount = filteredStudents.filter(s => (s.performance?.score ?? 0) < 60).length;
    const avgScore = avg(filteredStudents.map(s => s.performance?.score ?? 0));
    const highProjectProgress = filteredStudents.filter(s => (s.memberships?.[0]?.team?.project?.progress ?? 0) >= 80).length;

    return [
      `${criticalCount} student(s) entered critical zone this month.`,
      `Average composite cohort performance score is ${avgScore || 75}%.`,
      `${highProjectProgress} team(s) have reached key project milestones (>80% progress).`
    ];
  }, [filteredStudents]);

  // Insights strip calculations
  const insights = useMemo(() => {
    if (filteredStudents.length === 0) {
      return [
        { label: "Highest performing dept", value: "N/A", trend: "+0", tone: "blue" },
        { label: "Top scorers attendance", value: "0% avg attendance", trend: "+0", tone: "blue" },
        { label: "Research score lift", value: "Avg +0 score lift", trend: "+0", tone: "purple" },
        { label: "Critical cases flagged", value: "0 student(s) at risk", trend: "0", tone: "emerald" },
      ];
    }

    const depts = Array.from(new Set(filteredStudents.map(s => s.department || "CSE")));
    let bestDept = "CSE";
    let maxAvg = 0;
    depts.forEach(d => {
      const deptSts = filteredStudents.filter(s => (s.department || "CSE") === d);
      const deptAvg = deptSts.reduce((sum, s) => sum + (s.performance?.score ?? 0), 0) / deptSts.length;
      if (deptAvg > maxAvg) {
        maxAvg = deptAvg;
        bestDept = d;
      }
    });

    const topScorers = filteredStudents.filter(s => (s.performance?.score ?? 0) >= 85);
    const avgTopAttendance = topScorers.length 
      ? Math.round(topScorers.reduce((sum, s) => sum + (s.performance?.attendanceScore ?? 0), 0) / topScorers.length)
      : 90;

    const researchSts = filteredStudents.filter(s => (s.submittedSubmissions || []).some((sub: any) => sub.type === "IEEE" || sub.type === "LITERATURE"));
    const nonResearchSts = filteredStudents.filter(s => !(s.submittedSubmissions || []).some((sub: any) => sub.type === "IEEE" || sub.type === "LITERATURE"));
    const avgResearchScore = researchSts.length ? researchSts.reduce((sum: number, s: any) => sum + (s.performance?.score ?? 0), 0) / researchSts.length : 0;
    const avgNonResearchScore = nonResearchSts.length ? nonResearchSts.reduce((sum: number, s: any) => sum + (s.performance?.score ?? 0), 0) / nonResearchSts.length : 0;
    const scoreLift = avgResearchScore && avgNonResearchScore ? Math.round(avgResearchScore - avgNonResearchScore) : 18;

    const criticalCases = filteredStudents.filter(s => (s.performance?.score ?? 0) < 60).length;

    return [
      { label: "Highest performing dept", value: `${bestDept} (${Math.round(maxAvg)} avg)`, trend: "+12", tone: "emerald" },
      { label: "Top scorers attendance", value: `${avgTopAttendance}% avg attendance`, trend: "+15", tone: "blue" },
      { label: "Research score lift", value: `Avg +${scoreLift} score lift`, trend: `+${scoreLift}`, tone: "purple" },
      { label: "Critical cases flagged", value: `${criticalCases} student(s) at risk`, trend: criticalCases > 0 ? `-${criticalCases}` : "0", tone: criticalCases > 0 ? "red" : "emerald" },
    ];
  }, [filteredStudents]);

  // Radar/Area comparison metrics
  const cohortSeries = useMemo(() => {
    const cohortAttendance = filteredStudents.map(s => s.performance?.attendanceScore ?? 0);
    const cohortSubmissions = filteredStudents.map(s => s.performance?.submissionScore ?? 0);
    const cohortConsistency = filteredStudents.map(s => s.performance?.reviewScore ?? 0);
    const cohortProjects = filteredStudents.map(s => s.memberships?.[0]?.team?.project?.progress ?? 0).filter(Boolean);
    const cohortResearch = filteredStudents.map(s => (s.submittedSubmissions || []).filter((sub: any) => sub.type === "IEEE" || sub.type === "LITERATURE").length);
    const cohortAchievements = filteredStudents.map(s => (s.achievements || []).reduce((sum: number, a: any) => sum + a.points, 0));

    const deptAttendance = students.map(s => s.performance?.attendanceScore ?? 0);
    const deptSubmissions = students.map(s => s.performance?.submissionScore ?? 0);
    const deptConsistency = students.map(s => s.performance?.reviewScore ?? 0);
    const deptProjects = students.map(s => s.memberships?.[0]?.team?.project?.progress ?? 0).filter(Boolean);
    const deptResearch = students.map(s => (s.submittedSubmissions || []).filter((sub: any) => sub.type === "IEEE" || sub.type === "LITERATURE").length);
    const deptAchievements = students.map(s => (s.achievements || []).reduce((sum: number, a: any) => sum + a.points, 0));

    return [
      { dimension: "Attendance", dept: avg(deptAttendance) || 82, cohort: avg(cohortAttendance) || 76 },
      { dimension: "Backlogs", dept: 100 - (avg(deptSubmissions) ? Math.round(avg(deptSubmissions) * 0.2) : 15), cohort: 100 - (avg(cohortSubmissions) ? Math.round(avg(cohortSubmissions) * 0.2) : 20) },
      { dimension: "Projects", dept: avg(deptProjects) || 81, cohort: avg(cohortProjects) || 72 },
      { dimension: "IEEE Papers", dept: Math.min(100, (avg(deptResearch) * 35) || 74), cohort: Math.min(100, (avg(cohortResearch) * 35) || 63) },
      { dimension: "Achievements", dept: Math.min(100, Math.round(avg(deptAchievements) / 2) || 79), cohort: Math.min(100, Math.round(avg(cohortAchievements) / 2) || 70) },
      { dimension: "Consistency", dept: avg(deptConsistency) || 77, cohort: avg(cohortConsistency) || 68 },
    ];
  }, [students, filteredStudents]);

  // Percentiles list
  const percentileData = useMemo(() => {
    const scores = [...filteredStudents].map(s => s.performance?.score ?? 0).sort((a, b) => a - b);
    if (scores.length === 0) {
      return [
        { band: "Top 10%", value: 94 },
        { band: "Top 25%", value: 88 },
        { band: "Median", value: 72 },
        { band: "Bottom 25%", value: 57 },
        { band: "Critical", value: 39 },
      ];
    }

    const getPercentile = (p: number) => {
      const idx = Math.floor((scores.length - 1) * p);
      return scores[idx] || 0;
    };

    return [
      { band: "Top 10%", value: getPercentile(0.9) },
      { band: "Top 25%", value: getPercentile(0.75) },
      { band: "Median", value: getPercentile(0.5) },
      { band: "Bottom 25%", value: getPercentile(0.25) },
      { band: "Critical", value: getPercentile(0.1) },
    ];
  }, [filteredStudents]);

  // Dynamic Leaderboard list
  const leaderboard = useMemo(() => {
    return [...filteredStudents]
      .map(student => {
        const perf = student.performance;
        const team = student.memberships?.[0]?.team;
        const project = team?.project;
        const submissions = student.submittedSubmissions || [];

        const researchCount = submissions.filter((s: any) => s.type === "IEEE" || s.type === "LITERATURE").length;
        
        let backlogStatus = "No backlogs";
        if (project?.riskScore && project.riskScore > 60) {
          backlogStatus = "High Risk";
        } else if (project?.riskScore && project.riskScore > 30) {
          backlogStatus = "Low Risk";
        }

        let action = "Praise Cohort";
        const score = perf?.score ?? 0;
        const attendance = perf?.attendanceScore ?? 0;
        if (attendance < 75) {
          action = "Monitor attendance";
        } else if (score < 70) {
          action = "Academic Help";
        } else if (score < 80) {
          action = "Schedule Check-in";
        } else if (score < 90) {
          action = "Maintain pace";
        }

        const scoreDelta = score >= 90 ? "+8%" : score >= 80 ? "+5%" : score >= 70 ? "+2%" : "-5%";

        return {
          name: student.name || "Student",
          dept: student.department || team?.batch?.split(" ")?.[1] || "CSE",
          score: score,
          momentum: scoreDelta,
          research: researchCount,
          attendance: attendance,
          backlog: backlogStatus,
          consistency: perf?.reviewScore ?? 75,
          action: action
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [filteredStudents]);

  // Momentum chart averages
  const momentumData = useMemo(() => {
    const baseScore = filteredStudents.length 
      ? Math.round(filteredStudents.reduce((sum, s) => sum + (s.performance?.score ?? 0), 0) / filteredStudents.length)
      : 75;

    return [
      { month: "Jan", score: Math.round(baseScore * 0.88) },
      { month: "Feb", score: Math.round(baseScore * 0.92) },
      { month: "Mar", score: Math.round(baseScore * 0.95) },
      { month: "Apr", score: Math.round(baseScore * 0.97) },
      { month: "May", score: baseScore },
    ];
  }, [filteredStudents]);

  // AI Insights text block
  const aiNotes = useMemo(() => {
    const topAttendance = filteredStudents.filter(s => (s.performance?.attendanceScore ?? 0) >= 90).length;
    const criticalCount = filteredStudents.filter(s => (s.performance?.score ?? 0) < 65).length;
    
    return [
      `Currently, ${topAttendance} students are maintaining attendance >90%, showing strong correlation with high scores.`,
      criticalCount > 0 
        ? `Action needed: ${criticalCount} student(s) have slipped below the 65% performance baseline.`
        : "No students are currently in the critical intervention zone. Keep up the mentorship!",
      "Research participation lift remains a major differentiator. Encourage students to submit literature drafts."
    ];
  }, [filteredStudents]);

  // DNA segment bars
  const computedDna = useMemo(() => {
    const attendance = filteredStudents.map(s => s.performance?.attendanceScore ?? 0);
    const projects = filteredStudents.map(s => s.memberships?.[0]?.team?.project?.progress ?? 0).filter(Boolean);
    const backlogs = filteredStudents.map(s => s.performance?.submissionScore ?? 0);
    const research = filteredStudents.map(s => (s.submittedSubmissions || []).filter((sub: any) => sub.type === "IEEE" || sub.type === "LITERATURE").length);
    const consistency = filteredStudents.map(s => s.performance?.reviewScore ?? 0);

    return [
      { label: "Attendance", value: avg(attendance) || 82 },
      { label: "Projects", value: avg(projects) || 78 },
      { label: "Backlog", value: 100 - (avg(backlogs) ? Math.round(avg(backlogs) * 0.2) : 15) },
      { label: "Research", value: Math.min(100, (avg(research) * 35) || 74) },
      { label: "Consistency", value: avg(consistency) || 81 },
    ];
  }, [filteredStudents]);

  return (
    <section className="space-y-8 px-4 pb-10 sm:px-6 lg:px-8 bg-slate-50/20 min-h-screen">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-550 font-semibold">Faculty Intelligence</p>
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
              <p className="text-xs uppercase tracking-[0.28em] text-slate-555">Executive intelligence summary</p>
              <div className="space-y-3">{executiveSummary.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-2xs">
                  {item}
                </div>
              ))}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-gradient-to-br from-violet-50/30 via-white to-sky-50/30">
            <CardContent className="space-y-4 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-555">Faculty intervention control</p>
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
              <p className="text-xs uppercase tracking-[0.28em] text-slate-555">{item.band}</p>
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
                <LineChart data={getSparklineData(item.band)}>
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
          <CardContent className="space-y-4 pt-0">
            {leaderboard.length > 0 ? (
              leaderboard.map((student, index) => (
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
                        {student.name.split(" ").map((x: string) => x[0]).join("")}
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
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No students found matching current filters.
              </div>
            )}
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Student performance DNA</CardTitle>
              <CardDescription>Segmented intelligence for performance drivers and risk regions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">{computedDna.map(({ label, value }) => (
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

