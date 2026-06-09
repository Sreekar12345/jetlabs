"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  ClipboardList,
  GitBranch,
  Video,
  FileDown,
  FileText,
  Search,
  RefreshCw,
  Sliders,
  History,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FileManager } from "@/components/dashboard/file-manager";

interface SubmissionItem {
  id: string;
  title: string;
  studentName: string;
  weekNumber: number;
  submittedAt: string | null;
  status: string;
  githubUrl: string | null;
  demoUrl: string | null;
  uploadedFiles: string | null;
  notes: string | null;
  teamId: string;
  teamName: string;
  projectId: string;
}

interface TeamMetric {
  teamId: string;
  teamName: string;
  batch: string;
  projectTitle: string;
  progressPercentage: number;
  performanceScore: number;
}

interface FacultyEvaluationData {
  metrics: {
    pending: number;
    approved: number;
    rejected: number;
    revisionRequests: number;
  };
  teamMetrics: TeamMetric[];
  submissions: SubmissionItem[];
}

export default function FacultyEvaluationDashboard() {
  const [data, setData] = useState<FacultyEvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<SubmissionItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Evaluation Form State
  const [completeness, setCompleteness] = useState(8);
  const [quality, setQuality] = useState(8);
  const [documentation, setDocumentation] = useState(8);
  const [timeliness, setTimeliness] = useState(8);
  const [feedback, setFeedback] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const finalScore = useMemo(() => {
    return Number(((completeness + quality + documentation + timeliness) / 4).toFixed(1));
  }, [completeness, quality, documentation, timeliness]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/evaluations");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } else {
        toast.error("Failed to load evaluation metrics.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while loading evaluations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (subId: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/evaluations/${subId}/history`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setHistory(json.history);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSub) {
      fetchHistory(selectedSub.id);
      // Reset form values or set to defaults
      setCompleteness(8);
      setQuality(8);
      setDocumentation(8);
      setTimeliness(selectedSub.status === "SUBMITTED" ? 9 : 8);
      setFeedback("");
      setRevisionNotes("");
    }
  }, [selectedSub]);

  const handleEvaluationSubmit = async (status: "APPROVED" | "REJECTED" | "REVISION_REQUIRED") => {
    if (!selectedSub) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedSub.teamId,
          projectId: selectedSub.projectId,
          weekNumber: selectedSub.weekNumber,
          submissionId: selectedSub.id,
          status,
          feedback,
          score: finalScore,
          completeness,
          quality,
          documentation,
          timeliness,
          revisionNotes: status === "REVISION_REQUIRED" ? revisionNotes : "",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          toast.success("Evaluation recorded successfully!");
          setSelectedSub(null);
          fetchData();
        } else {
          toast.error(json.message || "Failed to record evaluation.");
        }
      } else {
        toast.error("Failed to record evaluation.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    if (!data?.submissions) return [];
    return data.submissions.filter((sub) => {
      const query = searchQuery.toLowerCase();
      return (
        sub.studentName.toLowerCase().includes(query) ||
        sub.teamName.toLowerCase().includes(query) ||
        sub.title.toLowerCase().includes(query)
      );
    });
  }, [data?.submissions, searchQuery]);

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
        return <Badge className="bg-amber-100 text-amber-850 border-amber-200">Not Started</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="size-8 text-slate-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading Evaluation Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-900 bg-[#f8fafc] -mx-4 -my-6 p-4 sm:p-6 lg:p-8 xl:p-10 min-h-[calc(100vh-4.5rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/faculty/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Weekly Evaluation System</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Review student contributions, assign scores, and manage project progress.</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700">
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-indigo-100 bg-white shadow-sm p-4 flex flex-col justify-between h-[110px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Reviews</span>
            <span className="p-1.5 rounded-lg bg-indigo-50/50 text-indigo-600">
              <Clock className="size-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 leading-none">{data?.metrics.pending ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">Requires advisor intervention</p>
          </div>
        </Card>

        <Card className="border-emerald-100 bg-white shadow-sm p-4 flex flex-col justify-between h-[110px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Tasks</span>
            <span className="p-1.5 rounded-lg bg-emerald-50/50 text-emerald-600">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 leading-none">{data?.metrics.approved ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">Milestones fully completed</p>
          </div>
        </Card>

        <Card className="border-rose-100 bg-white shadow-sm p-4 flex flex-col justify-between h-[110px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected Tasks</span>
            <span className="p-1.5 rounded-lg bg-rose-50/50 text-rose-600">
              <XCircle className="size-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 leading-none">{data?.metrics.rejected ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">Require revisions</p>
          </div>
        </Card>

        <Card className="border-amber-100 bg-white shadow-sm p-4 flex flex-col justify-between h-[110px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revision Requests</span>
            <span className="p-1.5 rounded-lg bg-amber-50/50 text-amber-600">
              <AlertCircle className="size-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 leading-none">{data?.metrics.revisionRequests ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">Awaiting student resubmissions</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px] items-start">
        {/* Submissions List */}
        <div className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-100">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Weekly Submissions</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Select a submission to grade and record logs</p>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <Input
                  placeholder="Search students or teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-xl border-slate-200 bg-slate-50/50"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto pr-1">
                {filteredSubmissions.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={cn(
                        "flex items-center justify-between p-4 cursor-pointer transition-all",
                        isSelected ? "bg-slate-50" : "hover:bg-slate-50/50"
                      )}
                    >
                      <div className="space-y-1 min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 truncate">{sub.studentName}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-semibold text-slate-500">{sub.teamName}</span>
                          <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0">Week {sub.weekNumber}</Badge>
                        </div>
                        <p className="text-xs text-slate-655 font-medium truncate mt-0.5">{sub.title}</p>
                        {sub.submittedAt && (
                          <p className="text-[10px] text-slate-400">
                            Submitted: {new Date(sub.submittedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {getStatusBadge(sub.status)}
                        <ChevronRight className="size-4 text-slate-450" />
                      </div>
                    </div>
                  );
                })}

                {filteredSubmissions.length === 0 && (
                  <div className="py-12 text-center text-slate-500 font-medium">
                    <ClipboardList className="size-10 mx-auto text-slate-300 mb-2" />
                    No submissions matching your filter.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Performance metrics card */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">Team Performance & Progress</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Overall indicators across all assigned teams</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {data?.teamMetrics.map((team) => (
                  <div key={team.teamId} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{team.teamName}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{team.batch}</p>
                      </div>
                      <Badge className="bg-slate-900 text-white font-bold text-[10px]">
                        Perf: {team.performanceScore}%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                        <span>Project Progress</span>
                        <span>{team.progressPercentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${team.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {data?.teamMetrics.length === 0 && (
                  <div className="col-span-2 py-6 text-center text-xs text-slate-400 font-medium">
                    No teams assigned.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evaluation Panel */}
        <div>
          {selectedSub ? (
            <div className="space-y-4">
              {/* Submission details */}
              <Card className="border-slate-200 bg-white shadow-sm p-5 space-y-4">
                <div className="pb-3 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{selectedSub.studentName}</h3>
                    <p className="text-xs text-slate-450 mt-0.5">{selectedSub.teamName} · Week {selectedSub.weekNumber}</p>
                  </div>
                  <Badge variant="outline" className="bg-slate-50 text-[10px] font-bold text-slate-600">
                    Week {selectedSub.weekNumber}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task Description</p>
                  <p className="text-slate-800 font-semibold">{selectedSub.title}</p>
                </div>

                {selectedSub.notes && (
                  <div className="space-y-1.5 text-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Notes</p>
                    <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-650 font-medium whitespace-pre-wrap leading-relaxed">
                      {selectedSub.notes}
                    </p>
                  </div>
                )}

                {/* Submited deliverables */}
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deliverables</p>
                  <div className="space-y-1.5 text-xs font-semibold">
                    {selectedSub.githubUrl && (
                      <a
                        href={selectedSub.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-650 hover:underline bg-slate-50 p-2 rounded-xl border border-slate-100"
                      >
                        <GitBranch className="size-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{selectedSub.githubUrl}</span>
                      </a>
                    )}
                    {selectedSub.demoUrl && (
                      <a
                        href={selectedSub.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-650 hover:underline bg-slate-50 p-2 rounded-xl border border-slate-100"
                      >
                        <Video className="size-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{selectedSub.demoUrl}</span>
                      </a>
                    )}
                    {selectedSub && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <FileManager
                          teamId={selectedSub.teamId}
                          submissionId={selectedSub.id}
                          isReadOnly={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Form card */}
              <Card className="border-slate-200 bg-white shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="size-4 text-slate-500" />
                    Evaluate & Score
                  </h3>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final Score</p>
                    <p className="text-lg font-extrabold text-slate-900">{finalScore} / 10</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Completeness Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Completeness</span>
                      <span>{completeness} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={completeness}
                      onChange={(e) => setCompleteness(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                    />
                  </div>

                  {/* Quality Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Quality</span>
                      <span>{quality} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                    />
                  </div>

                  {/* Documentation Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Documentation</span>
                      <span>{documentation} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={documentation}
                      onChange={(e) => setDocumentation(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                    />
                  </div>

                  {/* Timeliness Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Timeliness</span>
                      <span>{timeliness} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={timeliness}
                      onChange={(e) => setTimeliness(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                    />
                  </div>

                  {/* Written comments */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comments & Comments (Optional)</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Add comments on this week's progress..."
                      rows={2}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Revision Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revision Instructions (Required for Revisions)</label>
                    <textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      placeholder="Detail requested changes if selecting 'Revision Required'..."
                      rows={2}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => handleEvaluationSubmit("APPROVED")}
                        disabled={isSubmitting}
                        className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Approve Submission
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!revisionNotes.trim()) {
                            toast.error("Please add revision instructions before requesting revisions.");
                            return;
                          }
                          handleEvaluationSubmit("REVISION_REQUIRED");
                        }}
                        disabled={isSubmitting}
                        variant="outline"
                        className="flex-1 h-9 rounded-xl border-amber-250 text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold text-xs"
                      >
                        Request Revision
                      </Button>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleEvaluationSubmit("REJECTED")}
                      disabled={isSubmitting}
                      className="w-full h-9 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs"
                    >
                      Reject Submission
                    </Button>
                  </div>
                </div>
              </Card>

              {/* History card */}
              <Card className="border-slate-200 bg-white shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <History className="size-4 text-slate-450" />
                  Review & Audit Log History
                </h3>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {loadingHistory ? (
                    <div className="py-4 text-center text-xs text-slate-400">Loading audit history...</div>
                  ) : history.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 font-medium">No prior evaluations for this task.</div>
                  ) : (
                    <div className="space-y-3 border-l border-slate-200 ml-2 pl-4">
                      {history.map((h, i) => (
                        <div key={h.id} className="relative space-y-1.5 text-xs text-slate-655 font-medium">
                          <div className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-slate-400 border border-white" />
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                            <span>{new Date(h.reviewDate).toLocaleDateString()}</span>
                            <span>{h.status}</span>
                          </div>
                          <p className="text-slate-800 font-semibold">
                            Score: <span className="font-extrabold text-slate-900">{h.score}/10</span> by {h.facultyName}
                          </p>
                          {h.feedback && <p className="italic">"{h.feedback}"</p>}
                          {h.revisionNotes && (
                            <p className="text-amber-700">
                              <span className="font-bold">Revision notes: </span>{h.revisionNotes}
                            </p>
                          )}
                          <div className="text-[9px] text-slate-400 flex flex-wrap gap-x-2 border-t border-slate-50 pt-1">
                            <span>Comp: {h.completeness}</span>
                            <span>Qual: {h.quality}</span>
                            <span>Doc: {h.documentation}</span>
                            <span>Time: {h.timeliness}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="border-2 border-dashed border-slate-200 bg-white shadow-sm p-8 text-center text-slate-450 min-h-[300px] flex flex-col items-center justify-center">
              <BadgeCheck className="size-10 text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Select a submission</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Choose a student's submission from the roster on the left to grade performance metrics.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
