"use client";

import { useMemo, useState, useEffect } from "react";
import {
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
import {
  AlertTriangle,
  GraduationCap,
  Users,
  TrendingDown,
  XCircle,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Types
type Student = {
  name: string;
  roll: string;
  dept: string;
  scores: number[];
  active: number;
  cleared: number;
  severity: "Stable" | "Moderate" | "High" | "Critical";
  clearedSems?: Record<number, boolean>; // semester index (1-indexed) -> isCleared
};

type RecordItem = {
  student: string;
  roll: string;
  dept: string;
  subject: string;
  code: string;
  sem: string;
  year: string;
  acadYear: string;
  internal: number;
  external: number;
  total: number;
  attempts: string;
  status: "Pending" | "Cleared";
  dateCleared: string;
};

// Initial Dataset — starts empty; data will be populated when students are added
const INITIAL_STUDENTS: Student[] = [];


const INITIAL_RECORDS: RecordItem[] = [];

// Chart data — all zeros until real academic backlog data is recorded
const semesterWiseData = [
  { name: "Sem 1", active: 0, cleared: 0 },
  { name: "Sem 2", active: 0, cleared: 0 },
  { name: "Sem 3", active: 0, cleared: 0 },
  { name: "Sem 4", active: 0, cleared: 0 },
  { name: "Sem 5", active: 0, cleared: 0 },
  { name: "Sem 6", active: 0, cleared: 0 },
  { name: "Sem 7", active: 0, cleared: 0 },
  { name: "Sem 8", active: 0, cleared: 0 },
];

const yearWiseData = [
  { name: "Y1", active: 0, cleared: 0 },
  { name: "Y2", active: 0, cleared: 0 },
  { name: "Y3", active: 0, cleared: 0 },
  { name: "Y4", active: 0, cleared: 0 },
];

const failureTrendData = [
  { name: "Y1 S1", active: 0, cleared: 0 },
  { name: "Y1 S2", active: 0, cleared: 0 },
  { name: "Y2 S3", active: 0, cleared: 0 },
  { name: "Y2 S4", active: 0, cleared: 0 },
  { name: "Y3 S5", active: 0, cleared: 0 },
  { name: "Y3 S6", active: 0, cleared: 0 },
  { name: "Y4 S7", active: 0, cleared: 0 },
  { name: "Y4 S8", active: 0, cleared: 0 },
];

const failedSubjectsData: { code: string; name: string; count: number }[] = [];

const clearanceTrendsData: { month: string; cleared: number }[] = [];

// Helper to determine severity styles for badges
const severityStyles: Record<string, string> = {
  Stable: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Moderate: "bg-amber-50 text-amber-700 border-amber-100",
  High: "bg-rose-50 text-rose-700 border-rose-100",
  Critical: "bg-rose-100 text-rose-800 border-rose-200",
};

export function BacklogAnalyticsBoard() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All departments");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter handlers
  const filteredStudents = useMemo(() => {
    return INITIAL_STUDENTS.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.roll.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        selectedDept === "All departments" || student.dept === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, selectedDept]);

  const filteredRecords = useMemo(() => {
    return INITIAL_RECORDS.filter((record) => {
      const matchesSearch =
        record.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.roll.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        selectedDept === "All departments" || record.dept === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, selectedDept]);

  // Dynamic KPI counts based on active filtered dataset
  const kpis = useMemo(() => {
    // If filtered, compute dynamically, else use mockup constants:
    if (searchQuery || selectedDept !== "All departments") {
      const activeBacklogs = filteredRecords.filter((r) => r.status === "Pending").length;
      const clearedBacklogs = filteredRecords.filter((r) => r.status === "Cleared").length;
      const affected = new Set(filteredRecords.map((r) => r.student)).size;
      const repeatAttempts = filteredRecords.filter((r) => parseInt(r.attempts) > 1).length;
      const critical = filteredStudents.filter((s) => s.active >= 5).length;
      return { activeBacklogs, clearedBacklogs, affected, repeatAttempts, critical };
    }
    return {
      activeBacklogs: 0,
      clearedBacklogs: 0,
      affected: 0,
      repeatAttempts: 0,
      critical: 0,
    };
  }, [filteredRecords, filteredStudents, searchQuery, selectedDept]);

  // Academic risk segments count based on active student list
  const riskSegments = useMemo(() => {
    const counts = { Stable: 0, Moderate: 0, High: 0, Critical: 0 };
    filteredStudents.forEach((student) => {
      counts[student.severity]++;
    });
    return counts;
  }, [filteredStudents]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-slate-50/30">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Backlog analytics</h1>
        <p className="text-sm text-slate-500">
          Year- and semester-wise visibility into academic backlogs, repeat attempts, and clearance trends.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Backlogs */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-slate-400" />
              <span>Active backlogs</span>
            </div>
            <div className="text-4xl font-bold text-rose-600 tracking-tight leading-none mt-1">
              {kpis.activeBacklogs}
            </div>
          </CardContent>
        </Card>

        {/* Cleared Backlogs */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span>Cleared backlogs</span>
            </div>
            <div className="text-4xl font-bold text-emerald-600 tracking-tight leading-none mt-1">
              {kpis.clearedBacklogs}
            </div>
          </CardContent>
        </Card>

        {/* Affected Students */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Affected students</span>
            </div>
            <div className="text-4xl font-bold text-slate-900 tracking-tight leading-none mt-1">
              {kpis.affected}
            </div>
          </CardContent>
        </Card>

        {/* Repeat Attempts */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <TrendingDown className="w-4 h-4 text-slate-400" />
              <span>Repeat attempts</span>
            </div>
            <div className="text-4xl font-bold text-amber-600 tracking-tight leading-none mt-1">
              {kpis.repeatAttempts}
            </div>
          </CardContent>
        </Card>

        {/* Critical (5+) */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>Critical (5+)</span>
            </div>
            <div className="text-4xl font-bold text-rose-600 tracking-tight leading-none mt-1">
              {kpis.critical}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm bg-white placeholder:text-slate-400 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-56 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="All departments">All departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>
      </div>

      {/* First Section (Semester-wise & Year-wise backlogs Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Semester-wise backlogs */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl p-6">
          <div className="space-y-1 mb-6">
            <h2 className="text-base font-bold text-slate-900">Semester-wise backlogs</h2>
            <p className="text-xs text-slate-500">Active vs cleared across all 8 semesters</p>
          </div>
          <div className="h-64">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={semesterWiseData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 8]}
                    ticks={[0, 2, 4, 6, 8]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #f1f5f9",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    }}
                    labelClassName="font-medium text-slate-800 text-xs"
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Bar dataKey="active" fill="#f97316" radius={[3, 3, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="cleared" fill="#0d9488" radius={[3, 3, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold mt-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2 bg-orange-500 rounded-sm" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2 bg-teal-600 rounded-sm" />
              <span>Cleared</span>
            </div>
          </div>
        </Card>

        {/* Year-wise backlogs */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl p-6">
          <div className="space-y-1 mb-6">
            <h2 className="text-base font-bold text-slate-900">Year-wise backlogs</h2>
            <p className="text-xs text-slate-500">Aggregated by academic year</p>
          </div>
          <div className="h-64">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={yearWiseData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 12]}
                    ticks={[0, 3, 6, 9, 12]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #f1f5f9",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    }}
                    labelClassName="font-medium text-slate-800 text-xs"
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Bar dataKey="active" stackId="a" fill="#f97316" maxBarSize={20} />
                  <Bar dataKey="cleared" stackId="a" fill="#0d9488" maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold mt-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2 bg-orange-500 rounded-sm" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2 bg-teal-600 rounded-sm" />
              <span>Cleared</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Second Section (Academic Risk Distribution) */}
      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">Academic risk distribution</h2>
          <p className="text-xs text-slate-500">Color-coded severity across filtered students</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stable Card */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 flex flex-col justify-between h-[100px]">
            <span className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase">Stable</span>
            <div>
              <div className="text-3xl font-bold text-emerald-700">{riskSegments.Stable}</div>
              <div className="text-xs text-emerald-600/95 mt-0.5">No backlogs</div>
            </div>
          </div>

          {/* Moderate Card */}
          <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-5 flex flex-col justify-between h-[100px]">
            <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">Moderate</span>
            <div>
              <div className="text-3xl font-bold text-amber-700">{riskSegments.Moderate}</div>
              <div className="text-xs text-amber-600/95 mt-0.5">1-2 backlogs</div>
            </div>
          </div>

          {/* High Card */}
          <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-5 flex flex-col justify-between h-[100px]">
            <span className="text-[10px] font-bold tracking-wider text-rose-800 uppercase">High</span>
            <div>
              <div className="text-3xl font-bold text-rose-700">{riskSegments.High}</div>
              <div className="text-xs text-rose-600/95 mt-0.5">3-5 backlogs</div>
            </div>
          </div>

          {/* Critical Card */}
          <div className="bg-rose-100/30 border border-rose-200 rounded-xl p-5 flex flex-col justify-between h-[100px]">
            <span className="text-[10px] font-bold tracking-wider text-rose-900 uppercase">Critical</span>
            <div>
              <div className="text-3xl font-bold text-rose-800">{riskSegments.Critical}</div>
              <div className="text-xs text-rose-700/95 mt-0.5">6+ backlogs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Section (Failure Trend & Most Failed Subjects) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Semester-wise failure trend */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl p-6 lg:col-span-2">
          <div className="space-y-1 mb-6">
            <h2 className="text-base font-bold text-slate-900">Semester-wise failure trend</h2>
            <p className="text-xs text-slate-500">Active vs cleared backlogs per semester</p>
          </div>
          <div className="h-64">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={failureTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 8]}
                    ticks={[0, 2, 4, 8]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #f1f5f9",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    }}
                    labelClassName="font-medium text-slate-800 text-xs"
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cleared"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold mt-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2 bg-orange-500 rounded-sm" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2 bg-teal-600 rounded-sm" />
              <span>Cleared</span>
            </div>
          </div>
        </Card>

        {/* Most failed subjects */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl p-6">
          <div className="space-y-1 mb-6">
            <h2 className="text-base font-bold text-slate-900">Most failed subjects</h2>
            <p className="text-xs text-slate-500">Top 8 by active backlogs</p>
          </div>
          <div className="space-y-4 text-xs text-slate-700">
            {failedSubjectsData.map((subject) => {
              const fillPct = (subject.count / 2) * 100;
              return (
                <div key={subject.code} className="flex items-center justify-between gap-4">
                  <div className="flex-1 truncate font-medium text-slate-700">
                    {subject.code} · {subject.name}
                  </div>
                  <div className="flex items-center gap-3 w-32 justify-end">
                    <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-1.5 rounded-full"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <div className="w-4 text-right font-semibold text-slate-900">
                      {subject.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Fourth Section (Backlog Clearance Trends) */}
      <Card className="bg-white border-slate-100 shadow-sm rounded-xl p-6">
        <div className="space-y-1 mb-6">
          <h2 className="text-base font-bold text-slate-900">Backlog clearance trends</h2>
          <p className="text-xs text-slate-500">Backlogs cleared per month across the cohort</p>
        </div>
        <div className="h-64">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clearanceTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 4]}
                  ticks={[0, 1, 2, 3, 4]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #f1f5f9",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                  labelClassName="font-medium text-slate-800 text-xs"
                  itemStyle={{ fontSize: "11px" }}
                />
                <Line
                  type="monotone"
                  dataKey="cleared"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 1, fill: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Fifth Section (Per-student Backlog Severity Matrix) */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-1">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">Per-student backlog severity</h2>
          </div>
          <p className="text-xs text-slate-500">Heatmap of backlogs across all 8 semesters · darker = pending</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Roll</th>
                <th className="px-2 py-4 text-center w-12">S1</th>
                <th className="px-2 py-4 text-center w-12">S2</th>
                <th className="px-2 py-4 text-center w-12">S3</th>
                <th className="px-2 py-4 text-center w-12">S4</th>
                <th className="px-2 py-4 text-center w-12">S5</th>
                <th className="px-2 py-4 text-center w-12">S6</th>
                <th className="px-2 py-4 text-center w-12">S7</th>
                <th className="px-2 py-4 text-center w-12">S8</th>
                <th className="px-6 py-4 text-center w-24">Active</th>
                <th className="px-6 py-4 text-center w-24">Cleared</th>
                <th className="px-6 py-4 text-center w-32">Severity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.roll} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td>
                    <td className="px-6 py-4 text-slate-500">{student.roll}</td>
                    {student.scores.map((score, index) => {
                      const semNum = index + 1;
                      const hasCleared = student.clearedSems?.[semNum];

                      let cellStyle = "bg-slate-50/50 border border-slate-100";
                      let content = "";

                      if (score > 0) {
                        content = `${score}`;
                        if (hasCleared) {
                          cellStyle = "bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold";
                        } else if (score >= 3) {
                          cellStyle = "bg-orange-200 text-orange-800 border-orange-300 font-semibold";
                        } else {
                          cellStyle = "bg-orange-100 text-orange-700 border-orange-200 font-semibold";
                        }
                      }

                      return (
                        <td key={index} className="px-2 py-4 text-center">
                          <div className="flex justify-center">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-md flex items-center justify-center text-xs",
                                cellStyle
                              )}
                            >
                              {content}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center font-semibold text-slate-900">{student.active}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-500">{student.cleared}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border",
                            severityStyles[student.severity]
                          )}
                        >
                          {student.severity}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="px-6 py-10 text-center text-slate-400">
                    No students found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sixth Section (Backlog Records Table) */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-1">
          <h2 className="text-base font-bold text-slate-900">Backlog records</h2>
          <p className="text-xs text-slate-500">All subject-level records across filtered students</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-4 py-4">Code</th>
                <th className="px-4 py-4">Sem</th>
                <th className="px-4 py-4">Year</th>
                <th className="px-6 py-4">Acad Year</th>
                <th className="px-4 py-4 text-center">Internal</th>
                <th className="px-4 py-4 text-center">External</th>
                <th className="px-4 py-4 text-center font-bold">Total</th>
                <th className="px-6 py-4 text-center">Attempts</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Date Cleared</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{record.student}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{record.subject}</td>
                    <td className="px-4 py-4 text-slate-500 font-mono text-xs">{record.code}</td>
                    <td className="px-4 py-4 text-slate-500">{record.sem}</td>
                    <td className="px-4 py-4 text-slate-500">{record.year}</td>
                    <td className="px-6 py-4 text-slate-500">{record.acadYear}</td>
                    <td className="px-4 py-4 text-center font-medium">{record.internal}</td>
                    <td className="px-4 py-4 text-center font-medium">{record.external}</td>
                    <td className="px-4 py-4 text-center font-semibold text-slate-900">{record.total}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <Badge
                          variant="outline"
                          className="rounded-md px-2 py-0.5 text-xs font-semibold bg-amber-50/50 text-amber-700 border-amber-200"
                        >
                          {record.attempts}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border",
                            record.status === "Cleared"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          )}
                        >
                          {record.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{record.dateCleared}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-6 py-10 text-center text-slate-400">
                    No backlog records found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
