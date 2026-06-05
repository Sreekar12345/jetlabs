"use client";

import { useMemo, useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Trophy,
  Sparkles,
  Award,
  Users,
  Medal,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Student Achievement Data Type
type AchievementStudent = {
  name: string;
  roll: string;
  dept: string;
  initials: string;
  items: number;
  points: number;
  research: number;
  national: number;
  batch: string;
};

// Initial Dataset containing students and their accolades
const ACHIEVEMENT_STUDENTS: AchievementStudent[] = [
  {
    name: "Riya Kapoor",
    roll: "21DS009",
    dept: "Data Science",
    initials: "RK",
    items: 8,
    points: 36,
    research: 2,
    national: 5,
    batch: "Batch 2022",
  },
  {
    name: "Diya Patel",
    roll: "21CSE014",
    dept: "Computer Science",
    initials: "DP",
    items: 8,
    points: 28,
    research: 1,
    national: 3,
    batch: "Batch 2022",
  },
  {
    name: "Sneha Iyer",
    roll: "21AIML031",
    dept: "Computer Science",
    initials: "SI",
    items: 6,
    points: 24,
    research: 1,
    national: 3,
    batch: "Batch 2022",
  },
  {
    name: "Meera Nair",
    roll: "21IT017",
    dept: "Information Technology",
    initials: "MN",
    items: 5,
    points: 18,
    research: 0,
    national: 0,
    batch: "Batch 2022",
  },
  {
    name: "Aarav Sharma",
    roll: "21CSE001",
    dept: "Computer Science",
    initials: "AS",
    items: 6,
    points: 15,
    research: 2,
    national: 3,
    batch: "Batch 2022",
  },
  {
    name: "Vivek Joshi",
    roll: "21CSE036",
    dept: "Computer Science",
    initials: "VJ",
    items: 4,
    points: 12,
    research: 1,
    national: 1,
    batch: "Batch 2022",
  },
  {
    name: "Karan Singh",
    roll: "21ECE044",
    dept: "Electronics & Communication",
    initials: "KS",
    items: 3,
    points: 9,
    research: 0,
    national: 1,
    batch: "Batch 2022",
  },
  {
    name: "Rahul Verma",
    roll: "21CSE022",
    dept: "Computer Science",
    initials: "RV",
    items: 2,
    points: 6,
    research: 0,
    national: 0,
    batch: "Batch 2022",
  },
  {
    name: "Tanvi Desai",
    roll: "21AIML042",
    dept: "Computer Science",
    initials: "TD",
    items: 1,
    points: 3,
    research: 0,
    national: 0,
    batch: "Batch 2022",
  },
];

// Donut Chart Data
const byLevelData = [
  { name: "College", value: 18, color: "#f97316" },
  { name: "State", value: 12, color: "#0d9488" },
  { name: "National", value: 9, color: "#0f172a" },
  { name: "International", value: 6, color: "#eab308" },
];

// Horizontal Bar Chart Data
const byCategoryData = [
  { name: "Cultural", value: 5 },
  { name: "IEEE Publication", value: 4 },
  { name: "Volunteering", value: 4 },
  { name: "NCC/NSS", value: 3 },
  { name: "Hackathon", value: 3 },
  { name: "Seminar", value: 2 },
  { name: "Sports", value: 2 },
  { name: "Rank", value: 2 },
];

// Participation Trend Data
const participationTrendData = [
  { name: "Aug", academic: 3, nonAcademic: 2 },
  { name: "Sep", academic: 4, nonAcademic: 2 },
  { name: "Oct", academic: 5, nonAcademic: 2 },
  { name: "Nov", academic: 6, nonAcademic: 2 },
  { name: "Dec", academic: 7, nonAcademic: 2 },
  { name: "Jan", academic: 8, nonAcademic: 2 },
  { name: "Feb", academic: 3, nonAcademic: 2 },
  { name: "Mar", academic: 4, nonAcademic: 2 },
  { name: "Apr", academic: 5, nonAcademic: 2 },
  { name: "May", academic: 6, nonAcademic: 2 },
];

export function AchievementAnalyticsBoard() {
  const [mounted, setMounted] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("All batches");
  const [selectedDept, setSelectedDept] = useState("All departments");
  const [selectedCategory, setSelectedCategory] = useState("All categories");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter handlers
  const filteredStudents = useMemo(() => {
    return ACHIEVEMENT_STUDENTS.filter((student) => {
      const matchesBatch =
        selectedBatch === "All batches" || student.batch === selectedBatch;
      const matchesDept =
        selectedDept === "All departments" || student.dept === selectedDept;
      return matchesBatch && matchesDept;
    });
  }, [selectedBatch, selectedDept]);

  // Top Performers List (Sorted by points descending)
  const topPerformers = useMemo(() => {
    return [...filteredStudents]
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  }, [filteredStudents]);

  // Research Active List (Filter those with research > 0, sorted by research descending, then national descending)
  const researchActive = useMemo(() => {
    return [...filteredStudents]
      .filter((student) => student.research > 0)
      .sort((a, b) => {
        if (b.research !== a.research) {
          return b.research - a.research;
        }
        return b.national - a.national;
      })
      .slice(0, 5);
  }, [filteredStudents]);

  // Dynamic KPI counts based on active filtered dataset
  const kpis = useMemo(() => {
    if (selectedBatch !== "All batches" || selectedDept !== "All departments") {
      const totalAchievements = filteredStudents.reduce((acc, curr) => acc + curr.items, 0);
      const participating = filteredStudents.filter((s) => s.items > 0).length;
      const national = filteredStudents.reduce((acc, curr) => acc + curr.national, 0);
      return { totalAchievements, participating: `${participating} / ${filteredStudents.length}`, national, verified: 29 };
    }
    return {
      totalAchievements: 45,
      participating: "9 / 10",
      national: 21,
      verified: 29,
    };
  }, [filteredStudents, selectedBatch, selectedDept]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-slate-50/30">
      {/* Header Block */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Achievement analytics</h1>
        <p className="text-sm text-slate-500">
          Surface top performers, research-active students, and participation trends across batches & departments.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none transition focus:border-slate-400"
        >
          <option value="All batches">All batches</option>
          <option value="Batch 2022">Batch 2022</option>
          <option value="Batch 2023">Batch 2023</option>
          <option value="Batch 2024">Batch 2024</option>
        </select>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none transition focus:border-slate-400"
        >
          <option value="All departments">All departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Electronics & Communication">Electronics & Communication</option>
          <option value="Data Science">Data Science</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none transition focus:border-slate-400"
        >
          <option value="All categories">All categories</option>
          <option value="Cultural">Cultural</option>
          <option value="IEEE Publication">IEEE Publication</option>
          <option value="Volunteering">Volunteering</option>
          <option value="NCC/NSS">NCC/NSS</option>
          <option value="Rank">Rank</option>
        </select>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Achievements */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Award className="w-4 h-4 text-slate-400" />
              <span>Total achievements</span>
            </div>
            <div className="text-4xl font-bold text-slate-900 tracking-tight leading-none mt-1">
              {kpis.totalAchievements}
            </div>
          </CardContent>
        </Card>

        {/* Participating Students */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Participating students</span>
            </div>
            <div className="text-4xl font-bold text-emerald-600 tracking-tight leading-none mt-1">
              {kpis.participating}
            </div>
          </CardContent>
        </Card>

        {/* National/International */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Medal className="w-4 h-4 text-slate-400" />
              <span>National / International</span>
            </div>
            <div className="text-4xl font-bold text-emerald-600 tracking-tight leading-none mt-1">
              {kpis.national}
            </div>
          </CardContent>
        </Card>

        {/* Verified */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-slate-400" />
              <span>Verified</span>
            </div>
            <div className="text-4xl font-bold text-emerald-600 tracking-tight leading-none mt-1">
              {kpis.verified}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section 1 (By Level & By Category) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By level (Donut) */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl p-6 lg:col-span-1">
          <div className="space-y-1 mb-6">
            <h2 className="text-base font-bold text-slate-900">By level</h2>
            <p className="text-xs text-slate-500">Distribution across levels</p>
          </div>
          <div className="relative flex flex-col items-center justify-center h-48">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byLevelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {byLevelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #f1f5f9",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-xs font-semibold mt-4 text-slate-600">
            {byLevelData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* By category */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl p-6 lg:col-span-2">
          <div className="space-y-1 mb-6">
            <h2 className="text-base font-bold text-slate-900">By category</h2>
            <p className="text-xs text-slate-500">Most-pursued achievement types</p>
          </div>
          <div className="h-48">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={byCategoryData}
                  margin={{ top: 0, right: 10, left: 30, bottom: 0 }}
                >
                  <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 8]}
                    ticks={[0, 2, 4, 6, 8]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #f1f5f9",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} maxBarSize={10} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Participation trend */}
      <Card className="bg-white border-slate-100 shadow-sm rounded-xl p-6">
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Participation trend</h2>
          </div>
          <p className="text-xs text-slate-500">Academic vs non-academic submissions per month</p>
        </div>
        <div className="h-64">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={participationTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                  itemStyle={{ fontSize: "11px" }}
                />
                <Line
                  type="monotone"
                  dataKey="academic"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 1, fill: "#fff" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="nonAcademic"
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
            <span>Academic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-2 bg-teal-600 rounded-sm" />
            <span>Non-academic</span>
          </div>
        </div>
      </Card>

      {/* Main Grid Section (Trophy / Sparkles Lists) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers Card */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Top performers</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">Weighted by achievement level</p>

          <div className="divide-y divide-slate-100">
            {topPerformers.length > 0 ? (
              topPerformers.map((student, idx) => (
                <div
                  key={student.roll}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400 w-5">
                      #{idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {student.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm leading-snug">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                        {student.roll} · {student.dept === "Computer Science" ? "CSE" : student.dept === "Data Science" ? "DS" : student.dept === "Information Technology" ? "IT" : "ECE"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className="rounded-md border-slate-200 bg-white text-slate-700 px-2 py-0.5 text-xs font-medium font-sans shadow-2xs uppercase"
                    >
                      {student.items} items
                    </Badge>
                    <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                      {student.points} pts
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No top performers found matching filters.
              </div>
            )}
          </div>
        </Card>

        {/* Research Active Card */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Research-active</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Most IEEE publications & research entries
          </p>

          <div className="divide-y divide-slate-100">
            {researchActive.length > 0 ? (
              researchActive.map((student) => (
                <div
                  key={student.roll}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {student.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm leading-snug">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-none font-mono">
                        {student.roll}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-md border-slate-200 bg-white text-slate-700 px-2 py-0.5 text-xs font-medium font-sans shadow-2xs uppercase"
                    >
                      {student.research} research
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-md border-slate-200 bg-white text-slate-700 px-2 py-0.5 text-xs font-medium font-sans shadow-2xs uppercase"
                    >
                      {student.national} national+
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No active research profiles found matching filters.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
