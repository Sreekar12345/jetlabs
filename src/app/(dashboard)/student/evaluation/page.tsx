"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  History,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WeeklyScore {
  weekNumber: number;
  taskTitle: string;
  status: string;
  score: number | null;
  feedback: string | null;
  completeness: number | null;
  quality: number | null;
  documentation: number | null;
  timeliness: number | null;
  isRevisionRequired: boolean;
}

interface EvaluationHistoryItem {
  id: string;
  weekNumber: number;
  taskTitle: string;
  facultyName: string;
  status: string;
  feedback: string | null;
  score: number;
  completeness: number;
  quality: number;
  documentation: number;
  timeliness: number;
  revisionNotes: string | null;
  reviewDate: string;
}

interface StudentEvaluationData {
  studentName: string;
  teamName: string;
  projectTitle: string;
  progressPercentage: number;
  teamPerformance: number;
  studentAverageScore: number;
  weeklyScores: WeeklyScore[];
  evaluationHistory: EvaluationHistoryItem[];
}

export default function StudentEvaluationPage() {
  const [data, setData] = useState<StudentEvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<WeeklyScore | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/evaluations");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          // Auto-select first week with scores or first week
          const firstScored = json.data.weeklyScores.find((ws: any) => ws.score !== null) || json.data.weeklyScores[0];
          setSelectedWeek(firstScored || null);
        }
      } else {
        toast.error("Failed to load evaluation data.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while loading evaluations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REVIEWED":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Rejected</Badge>;
      case "SUBMITTED":
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Submitted</Badge>;
      case "UNDER_REVIEW":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Under Review</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Not Started</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="size-8 text-slate-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading Evaluation Scorecard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-450 max-w-md mx-auto my-6">
        <BookOpen className="size-10 text-slate-300 mb-2" />
        <h3 className="text-sm font-bold text-slate-800">No Evaluation Data</h3>
        <p className="text-xs text-slate-400 mt-1">
          Once your team selects a problem statement and starts submitting weekly milestones, evaluation details will populate here.
        </p>
        <Button asChild className="mt-4 bg-slate-900 text-white rounded-xl">
          <Link href="/student/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-900 bg-[#f8fafc] -mx-4 -my-6 p-4 sm:p-6 lg:p-8 xl:p-10 min-h-[calc(100vh-4.5rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/student/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Weekly Scorecard & Evaluations</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">{data.projectTitle} · {data.teamName}</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700">
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-indigo-100 bg-white shadow-sm p-4 flex flex-col justify-between h-[110px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Evaluation Score</span>
            <span className="p-1.5 rounded-lg bg-indigo-50/50 text-indigo-600">
              <Award className="size-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 leading-none">{data.studentAverageScore} / 10</p>
            <p className="text-xs text-slate-400 mt-1">Across all approved reviews</p>
          </div>
        </Card>

        <Card className="border-emerald-100 bg-white shadow-sm p-4 flex flex-col justify-between h-[110px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Progress</span>
            <span className="p-1.5 rounded-lg bg-emerald-50/50 text-emerald-600">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 leading-none">{data.progressPercentage}%</p>
            <p className="text-xs text-slate-400 mt-1">Completed / approved contributions</p>
          </div>
        </Card>

        <Card className="border-slate-100 bg-white shadow-sm p-4 flex flex-col justify-between h-[110px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Team Performance Index</span>
            <span className="p-1.5 rounded-lg bg-slate-50 text-slate-550">
              <BadgeCheck className="size-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 leading-none">{data.teamPerformance}%</p>
            <p className="text-xs text-slate-400 mt-1">Sum of earned scores / possible scores</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
        {/* Weekly score list */}
        <div className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">Milestone Roster</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Click any week to inspect scores and feedback logs</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {data.weeklyScores.map((ws) => {
                  const isSelected = selectedWeek?.weekNumber === ws.weekNumber;
                  return (
                    <div
                      key={ws.weekNumber}
                      onClick={() => setSelectedWeek(ws)}
                      className={cn(
                        "flex items-center justify-between p-4 cursor-pointer transition-all",
                        isSelected ? "bg-slate-50" : "hover:bg-slate-50/50"
                      )}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">Week {ws.weekNumber}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-semibold text-slate-500 truncate">{ws.taskTitle}</span>
                        </div>
                        {ws.feedback && (
                          <p className="text-xs text-slate-450 truncate italic">"{ws.feedback}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {ws.isRevisionRequired && (
                          <Badge className="bg-amber-100 border-amber-200 text-amber-800 animate-pulse flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            Revision Required
                          </Badge>
                        )}
                        {ws.score !== null && (
                          <span className="text-sm font-extrabold text-slate-800 mr-2">{ws.score}/10</span>
                        )}
                        {getStatusBadge(ws.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Submission and Feedback History */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">Historical Evaluation Log</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Audit log of all evaluations (cannot be deleted)</p>
            </CardHeader>
            <CardContent className="p-5">
              {data.evaluationHistory.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">No reviews logged yet.</div>
              ) : (
                <div className="space-y-4 border-l border-slate-200 ml-2 pl-4">
                  {data.evaluationHistory.map((log) => (
                    <div key={log.id} className="relative space-y-1 text-xs text-slate-655 font-medium">
                      <div className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-slate-350 border border-white" />
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>{new Date(log.reviewDate).toLocaleDateString()}</span>
                        <span>{log.status}</span>
                      </div>
                      <p className="text-slate-800 font-semibold">
                        Week {log.weekNumber} ("{log.taskTitle}"): <span className="font-extrabold text-slate-900">{log.score}/10</span>
                      </p>
                      {log.feedback && <p className="italic">"{log.feedback}"</p>}
                      {log.revisionNotes && (
                        <p className="text-amber-700 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                          <span className="font-bold">Revision requested: </span>{log.revisionNotes}
                        </p>
                      )}
                      <p className="text-[9px] text-slate-400">Evaluator: {log.facultyName}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Week Scorecard Detail Panel */}
        <div>
          {selectedWeek ? (
            <div className="space-y-4">
              <Card className="border-slate-200 bg-white shadow-sm p-5 space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Currently Selected</span>
                  <h3 className="text-sm font-bold text-slate-800 mt-0.5">Week {selectedWeek.weekNumber} details</h3>
                  <p className="text-xs text-slate-450 mt-1 font-semibold">{selectedWeek.taskTitle}</p>
                </div>

                {selectedWeek.isRevisionRequired && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3.5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider text-[10px]">
                      <AlertCircle className="size-4 animate-pulse shrink-0" />
                      Revision requested by Faculty Guide
                    </div>
                    {selectedWeek.feedback && (
                      <p className="text-xs text-slate-655 font-medium leading-relaxed bg-white border border-amber-100 p-2.5 rounded-lg whitespace-pre-wrap">
                        {selectedWeek.feedback}
                      </p>
                    )}
                    <Button asChild className="w-full h-8 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-none">
                      <Link href="/student/dashboard" className="flex items-center justify-center gap-1.5">
                        Submit Revision on Dashboard
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                )}

                {selectedWeek.score !== null ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Final Weekly Grade</span>
                      <span className="text-lg font-extrabold text-slate-900">{selectedWeek.score} / 10</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Completeness</p>
                        <p className="text-sm font-extrabold text-slate-800">{selectedWeek.completeness} / 10</p>
                      </div>
                      <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quality</p>
                        <p className="text-sm font-extrabold text-slate-800">{selectedWeek.quality} / 10</p>
                      </div>
                      <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Documentation</p>
                        <p className="text-sm font-extrabold text-slate-800">{selectedWeek.documentation} / 10</p>
                      </div>
                      <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Timeliness</p>
                        <p className="text-sm font-extrabold text-slate-800">{selectedWeek.timeliness} / 10</p>
                      </div>
                    </div>

                    {selectedWeek.feedback && (
                      <div className="space-y-1 text-xs">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty feedback</p>
                        <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-655 font-medium italic whitespace-pre-wrap leading-relaxed">
                          "{selectedWeek.feedback}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  !selectedWeek.isRevisionRequired && (
                    <div className="py-6 text-center text-xs text-slate-450 font-medium">
                      <Clock className="size-6 mx-auto mb-2 text-slate-300" />
                      This week's submission is pending evaluation.
                    </div>
                  )
                )}
              </Card>
            </div>
          ) : (
            <Card className="border-2 border-dashed border-slate-200 bg-white shadow-sm p-8 text-center text-slate-450 min-h-[200px] flex flex-col items-center justify-center">
              <BadgeCheck className="size-10 text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Select a Week</h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose a milestone from the table on the left to see criteria scoring breakdown.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
