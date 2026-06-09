"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { 
  ArrowRight, BarChart3, CheckCircle2, Clock, Download, FileSpreadsheet, FileText, Sparkles, TrendingUp, Users 
} from "lucide-react";
import Link from "next/link";

interface StudentAnalyticsClientProps {
  data: any;
  studentId: string;
}

export function StudentAnalyticsClient({ data, studentId }: StudentAnalyticsClientProps) {
  if (!data.hasTeam) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-3xl bg-white max-w-xl mx-auto mt-12 space-y-4">
        <Users className="size-12 text-slate-350" />
        <h2 className="text-base font-extrabold text-slate-800">Team Assignment Pending</h2>
        <p className="text-xs text-slate-450 leading-relaxed max-w-sm">
          Analytics dashboard triggers are synchronized once your student profile is verified and assigned to an active capstone team.
        </p>
        <Button asChild className="bg-slate-900 text-white hover:bg-slate-850 font-bold rounded-xl shadow-sm text-xs h-10 px-5">
          <Link href="/student/dashboard">Go to Workspace Overview</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tracking-tight text-2xl font-black text-slate-900">My Performance Insights</h1>
          <p className="text-slate-500 text-sm">
            Personal contribution indices and evaluation trends for <span className="font-extrabold text-indigo-700">{data.teamName}</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="h-10 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href="/reports/print?type=student" target="_blank">
              <FileText className="size-4 mr-1.5 text-rose-500" /> Print PDF
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-10 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href="/api/analytics/export?type=student" download>
              <FileSpreadsheet className="size-4 mr-1.5 text-emerald-500" /> Export CSV
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Progress</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{data.performance.progress}%</div>
          <Progress value={data.performance.progress} className="h-1 bg-slate-100 mt-1" />
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks Completed</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{data.performance.tasksCompleted}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">{data.performance.tasksPending} tasks pending</div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Contribution</div>
          <div className="text-3xl font-black text-indigo-700 mt-2">{data.contributions.percentage}%</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">Of overall team deliverables</div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Success</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{data.performance.successRate}%</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">Approved vs rejected ratios</div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Score</div>
          <div className="text-3xl font-black text-indigo-700 mt-2">{data.performance.avgScore}/10</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">Across reviewed submissions</div>
        </Card>
      </div>

      {/* Main Charts & Activity Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Performance Score Trends (AreaChart) */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
            <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <BarChart3 className="size-4 text-indigo-600" /> My Evaluation Score Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.feedback.weeklyPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studentScoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(15,23,42,0.05)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: 12, fontSize: 11 }} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#studentScoreColor)" name="Marks Assigned" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Summary Panel */}
        <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
            <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="size-4 text-indigo-600" /> Feedback Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-bold">Total Feedback Logs</span>
              <span className="text-sm font-black text-slate-800">{data.feedback.totalFeedback}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-bold">Revision Requests</span>
              <span className="text-sm font-black text-amber-600">{data.feedback.revisionRequests}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-bold">Approved Milestones</span>
              <span className="text-sm font-black text-emerald-600">{data.performance.tasksCompleted}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-bold">Milestone Approval Rate</span>
              <span className="text-sm font-black text-indigo-600">{data.feedback.approvalRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log Timeline */}
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
          <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <Clock className="size-4 text-indigo-600" /> Recent Submission Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {data.contributions.activityTimeline.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No recent submission uploads recorded.</p>
          ) : (
            data.contributions.activityTimeline.map((log: any) => (
              <div key={log.id} className="p-4 flex items-start gap-3 text-xs">
                <CheckCircle2 className="size-4 text-emerald-500 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-800">{log.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{log.details}</p>
                  <span className="text-[8px] text-slate-400 font-semibold uppercase block mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
