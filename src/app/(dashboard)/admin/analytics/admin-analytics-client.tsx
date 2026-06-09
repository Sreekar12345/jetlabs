"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, BarChart3, Database, Download, FileSpreadsheet, FileText, ShieldAlert, Users 
} from "lucide-react";
import Link from "next/link";

interface AdminAnalyticsClientProps {
  data: any;
  adminId: string;
}

export function AdminAnalyticsClient({ data, adminId }: AdminAnalyticsClientProps) {
  const [logs, setLogs] = useState<any[]>(data.auditLogs || []);

  const actionBadge = (action: string) => {
    switch (action) {
      case "REPORT_GENERATION":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "EXPORT_ACTIVITY":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tracking-tight text-2xl font-black text-slate-900">Admin Operations Analytics</h1>
          <p className="text-slate-500 text-sm">System activity indicators, cohort statistics, and analytics audit trails.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="h-10 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href="/reports/print?type=system" target="_blank">
              <FileText className="size-4 mr-1.5 text-rose-500" /> Print Report
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-10 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl shadow-sm">
            <Link href="/api/analytics/export?type=faculty" download>
              <FileSpreadsheet className="size-4 mr-1.5 text-emerald-500" /> Export Faculty CSV
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{data.platform.totalStudents}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">{data.platform.totalFaculty} Faculty Advisors</div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Teams</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{data.platform.totalTeams}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">{data.platform.totalProjects} Projects total</div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Users (WAU)</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{data.systemActivity.wau}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">{data.systemActivity.dau} active today</div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Completion</div>
          <div className="text-3xl font-black text-indigo-700 mt-2">{data.projectMetrics.completionRate}%</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">{data.projectMetrics.totalCompleted} completed projects</div>
        </Card>

        <Card className="border-slate-100 shadow-sm p-5 bg-white flex flex-col justify-between min-h-[120px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Uploaded Files</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{data.systemActivity.totalUploads}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">{data.systemActivity.totalNotifications} Alerts Generated</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Lifecycle panel */}
        <Card className="lg:col-span-1 border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
            <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Database className="size-4 text-indigo-600" /> Project Duration Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">Projects Started</span>
              <span className="font-black text-slate-800">{data.projectMetrics.totalStarted}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">Projects Completed</span>
              <span className="font-black text-emerald-600">{data.projectMetrics.totalCompleted}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">Completion Rate</span>
              <span className="font-black text-indigo-600">{data.projectMetrics.completionRate}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-bold">Average Project Age</span>
              <span className="font-black text-slate-800">{data.projectMetrics.avgProjectDuration} days</span>
            </div>
          </CardContent>
        </Card>

        {/* System activity indicators */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
            <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Activity className="size-4 text-indigo-600" /> Active Users Analysis (DAU / WAU / MAU)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Daily Active Users (DAU)</span>
                <span>{data.systemActivity.dau} users</span>
              </div>
              <Progress value={(data.systemActivity.dau / Math.max(1, data.platform.totalStudents)) * 100} className="h-2 bg-slate-100" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Weekly Active Users (WAU)</span>
                <span>{data.systemActivity.wau} users</span>
              </div>
              <Progress value={(data.systemActivity.wau / Math.max(1, data.platform.totalStudents + data.platform.totalFaculty)) * 100} className="h-2 bg-indigo-500" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Monthly Active Users (MAU)</span>
                <span>{data.systemActivity.mau} users</span>
              </div>
              <Progress value={(data.systemActivity.mau / Math.max(1, data.platform.totalStudents + data.platform.totalFaculty)) * 100} className="h-2 bg-slate-900" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access and export logs audit trail table */}
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
          <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="size-4 text-indigo-600" /> System Analytics Audit Trail
          </CardTitle>
          <p className="text-[10px] text-slate-400">Chronological history of report generation, file exports, and analytics access logs.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-100">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action Type</th>
                  <th className="px-4 py-3">Report Scope</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No audit records logged yet.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-slate-600">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-slate-800">{log.userName}</div>
                        <div className="text-[10px] text-slate-450">{log.userEmail}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge className={`rounded-full px-2 py-0.5 text-[8px] font-bold border ${actionBadge(log.actionType)}`}>
                          {log.actionType.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-600">{log.reportType || "N/A"}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="font-extrabold text-[8px]">{log.exportFormat || "N/A"}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 leading-normal">{log.details || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
