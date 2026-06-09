"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis 
} from "recharts";
import { 
  BarChart3, Calendar, ClipboardCheck, Download, FileCheck, FileSpreadsheet, FileText, Info, Loader2, Play, Users 
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface FacultyAnalyticsClientProps {
  initialData: any;
  teamsList: Array<{ id: string; name: string; batch: string }>;
  facultyId: string;
}

export function FacultyAnalyticsClient({ initialData, teamsList, facultyId }: FacultyAnalyticsClientProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Report schedules state
  const [schedules, setSchedules] = useState<any[]>([]);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  // Extract unique batches from teams list
  const batches = Array.from(new Set(teamsList.map(t => t.batch)));

  // Fetch filtered data
  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTeamId) params.append("teamId", selectedTeamId);
      if (selectedBatch) params.append("batch", selectedBatch);
      if (selectedWeek) params.append("week", selectedWeek);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/analytics/faculty?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        toast.success("Filters applied successfully.");
      } else {
        toast.error("Failed to load filtered analytics.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error applying filters.");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedTeamId("");
    setSelectedBatch("");
    setSelectedWeek("");
    setStartDate("");
    setEndDate("");
  };

  // Trigger filters load automatically when selections change
  useEffect(() => {
    handleApplyFilters();
  }, [selectedTeamId, selectedBatch, selectedWeek]);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/analytics/schedule");
      if (res.ok) {
        const json = await res.json();
        setSchedules(json.schedule || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Trigger report generation simulation
  const handleTriggerScheduleReport = async (frequency: string) => {
    setGeneratingReport(frequency);
    try {
      const res = await fetch("/api/analytics/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency })
      });
      if (res.ok) {
        toast.success(`Automated ${frequency} report snapshot compiled successfully.`);
        fetchSchedules();
      } else {
        toast.error("Failed to compile scheduled report.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error generating report.");
    } finally {
      setGeneratingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tracking-tight text-2xl font-black text-slate-900">Faculty Analytics & Reports</h1>
          <p className="text-slate-500 text-sm">Actionable operational insights and exports for capstone projects.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Quick PDF Export links */}
          <Button asChild variant="outline" className="h-10 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href={`/reports/print?type=team${selectedTeamId ? `&teamId=${selectedTeamId}` : ""}${selectedBatch ? `&batch=${selectedBatch}` : ""}`} target="_blank">
              <FileText className="size-4 mr-1.5 text-rose-500" /> Export PDF
            </Link>
          </Button>

          {/* Quick CSV Export links */}
          <Button asChild variant="outline" className="h-10 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href={`/api/analytics/export?type=team${selectedTeamId ? `&teamId=${selectedTeamId}` : ""}${selectedBatch ? `&batch=${selectedBatch}` : ""}`} download>
              <FileSpreadsheet className="size-4 mr-1.5 text-emerald-500" /> Export CSV
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Control Dashboard Card */}
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white">
        <CardHeader className="pb-3 border-b border-slate-50">
          <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Info className="size-4 text-indigo-500" /> Filters & Analytics Scope
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Team</label>
              <select 
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="">All Teams</option>
                {teamsList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Batch</label>
              <select 
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="">All Batches</option>
                {batches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Week</label>
              <select 
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="">All Weeks</option>
                {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleResetFilters} variant="ghost" className="h-9 text-xs rounded-xl text-slate-500 hover:text-slate-700">
              Reset Filters
            </Button>
            <Button onClick={handleApplyFilters} className="h-9 px-5 bg-slate-900 text-white text-xs hover:bg-slate-800 font-bold rounded-xl shadow-sm">
              {loading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null} Apply Filter Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Teams</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.totalTeams}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">{data.summary.activeTeams} Active running</div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Projects</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{data.summary.completedTeams}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">Ready for final assessment</div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Behind Schedule</div>
          <div className="text-3xl font-black text-rose-500 mt-2">{data.summary.teamsBehind}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">Requires immediate review</div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revisions Pending</div>
          <div className="text-3xl font-black text-amber-500 mt-2">{data.summary.teamsRevision}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">Work marked revision_required</div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Progress</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{data.summary.avgProgress}%</div>
          <div className="mt-2">
            <Progress value={data.summary.avgProgress} className="h-1 bg-slate-100" />
          </div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Grade Score</div>
          <div className="text-3xl font-black text-indigo-700 mt-2">{data.evaluations.avgTeamScore}/10</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">Across all evaluations</div>
        </Card>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Grade Score Trends (AreaChart) */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
            <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <BarChart3 className="size-4 text-indigo-600" /> Weekly Performance Score Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.evaluations.weeklyScoreTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(15,23,42,0.05)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: 12, fontSize: 11 }} />
                  <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" name="Avg Marks" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team Progress Distribution (BarChart) */}
        <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
            <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Users className="size-4 text-indigo-600" /> Teams Progress Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.progress.progressDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(15,23,42,0.05)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="range" stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip cursor={{ fill: "rgba(15,23,42,0.02)" }} contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: 12, fontSize: 11 }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={30} name="Teams Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Completion Rate (LineChart) */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
            <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <ClipboardCheck className="size-4 text-indigo-600" /> Weekly Milestone Deliverable Completion Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.progress.weekWiseCompletion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(15,23,42,0.05)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: 12, fontSize: 11 }} />
                  <Line type="monotone" dataKey="rate" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Completion Rate (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Metrics Panel */}
        <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
            <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <FileCheck className="size-4 text-indigo-600" /> Submission Flow Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-bold">Total Submissions Received</span>
              <span className="text-sm font-black text-slate-800">{data.submissions.totalSubmissions}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-bold">Awaiting Reviews (SLA Lane)</span>
              <span className="text-sm font-black text-amber-600">{data.submissions.pendingReviews}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-bold">Approved Delivery Rate</span>
              <span className="text-sm font-black text-emerald-600">{data.submissions.approvedSubmissions}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-bold">Revision Cycle Requests</span>
              <span className="text-sm font-black text-amber-500">{data.submissions.revisionRequests}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-bold">Rejected Submissions</span>
              <span className="text-sm font-black text-rose-500">{data.submissions.rejectedSubmissions}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-bold">Average Review Turnaround</span>
              <span className="text-sm font-black text-slate-800">{data.submissions.avgReviewTime} hours</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automated / Scheduled Reports Panel */}
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
          <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <Calendar className="size-4 text-indigo-600" /> Automated Scheduled Reports
          </CardTitle>
          <p className="text-[10px] text-slate-400">Review scheduled execution intervals or compile updates instantly.</p>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {schedules.map((sched) => (
            <div key={sched.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-800">{sched.title}</h4>
                  <Badge className="bg-indigo-50 border-indigo-100 text-indigo-700 font-extrabold text-[8px] tracking-wide rounded px-1.5">{sched.frequency}</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{sched.scope} · {sched.metricsCount}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Last run: {new Date(sched.lastRun).toLocaleString()}</p>
              </div>
              <div>
                <Button 
                  onClick={() => handleTriggerScheduleReport(sched.frequency.toUpperCase())}
                  disabled={generatingReport !== null}
                  className="h-8 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold rounded-xl shadow-sm flex items-center gap-1"
                >
                  {generatingReport === sched.frequency.toUpperCase() ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Play className="size-3" />
                  )}
                  Run Snapshot
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reports Export Console */}
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
          <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <Download className="size-4 text-indigo-600" /> Download Academic CSV Reports
          </CardTitle>
          <p className="text-[10px] text-slate-400">Generate raw spreadsheet CSV outputs aligned with selected date and filter ranges.</p>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button asChild variant="outline" className="h-11 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href={`/api/analytics/export?type=team${selectedTeamId ? `&teamId=${selectedTeamId}` : ""}${selectedBatch ? `&batch=${selectedBatch}` : ""}`} download>
              <FileSpreadsheet className="size-4 mr-2 text-indigo-600" /> Teams Progress Report
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-11 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href={`/api/analytics/export?type=student${selectedTeamId ? `&teamId=${selectedTeamId}` : ""}${selectedBatch ? `&batch=${selectedBatch}` : ""}`} download>
              <FileSpreadsheet className="size-4 mr-2 text-indigo-600" /> Students Performance Report
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-11 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href={`/api/analytics/export?type=submission${selectedTeamId ? `&teamId=${selectedTeamId}` : ""}${selectedBatch ? `&batch=${selectedBatch}` : ""}`} download>
              <FileSpreadsheet className="size-4 mr-2 text-indigo-600" /> Submissions Activity Report
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-11 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href={`/api/analytics/export?type=evaluation${selectedTeamId ? `&teamId=${selectedTeamId}` : ""}${selectedBatch ? `&batch=${selectedBatch}` : ""}`} download>
              <FileSpreadsheet className="size-4 mr-2 text-indigo-600" /> Marks & Feedback Report
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
