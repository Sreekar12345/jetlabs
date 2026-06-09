"use client";

import React, { useState, useTransition, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalCloseButton
} from "@/components/ui/modal";
import { toast } from "sonner";
import {
  Activity,
  Calendar,
  CheckCircle2,
  FileText,
  FolderCheck,
  History,
  Inbox,
  LayoutGrid,
  Loader2,
  Lock,
  RotateCcw,
  Search,
  ShieldAlert,
  Users,
  XCircle,
  FileDown,
  UserCheck,
  UserX,
  HeartPulse,
  Database,
  BarChart3,
  Server
} from "lucide-react";
import {
  activateUserAction,
  deactivateUserAction,
  resetStudentStatusAction
} from "@/lib/actions/admin-actions";

// Types
import {
  AdminOverviewStats,
  AdminStudentData,
  AdminFacultyData,
  AdminTeamData,
  AdminProjectData,
  AdminSubmissionData,
  AdminEvaluationData,
  AdminNotificationData,
  SystemHealthData
} from "@/lib/services/admin-service";
import { AuditLogData } from "@/lib/services/audit-service";

interface AdminControlCenterProps {
  stats: AdminOverviewStats;
  students: AdminStudentData[];
  faculty: AdminFacultyData[];
  teams: AdminTeamData[];
  projects: AdminProjectData[];
  submissions: AdminSubmissionData[];
  evaluations: AdminEvaluationData[];
  notifications: AdminNotificationData[];
  health: SystemHealthData;
  auditLogs: AuditLogData[];
}

export function AdminControlCenter({
  stats,
  students: initialStudents,
  faculty: initialFaculty,
  teams,
  projects,
  submissions,
  evaluations,
  notifications,
  health,
  auditLogs
}: AdminControlCenterProps) {
  // State variables
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "teams-projects" | "submissions-evals" | "notifications" | "audits"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Structured Audits pagination & filtering states
  const [dbLogs, setDbLogs] = useState<AuditLogData[]>(auditLogs);
  const [paginatedTotalCount, setPaginatedTotalCount] = useState(auditLogs.length);
  const [paginatedTotalPages, setPaginatedTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingAudits, setIsLoadingAudits] = useState(false);
  const [eventCategoryFilter, setEventCategoryFilter] = useState("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [auditStats, setAuditStats] = useState({
    totalEvents: auditLogs.length,
    eventsToday: 0,
    failedLogins: 0,
    submissionActivity: 0,
    evaluationActivity: 0,
    administrativeActions: 0,
  });

  const [auditViewerType, setAuditViewerType] = useState<"timeline" | "user" | "entity" | "security">("timeline");
  const [selectedUserFilter, setSelectedUserFilter] = useState("");
  const [selectedEntityFilter, setSelectedEntityFilter] = useState("");

  React.useEffect(() => {
    if (activeTab !== "audits") return;

    const fetchAudits = async () => {
      setIsLoadingAudits(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "15",
          search: searchQuery,
          role: roleFilter,
          eventType: typeFilter,
          eventCategory: eventCategoryFilter,
          entityType: entityTypeFilter,
          startDate,
          endDate,
        });

        if (auditViewerType === "user" && selectedUserFilter) {
          params.set("search", selectedUserFilter);
        } else if (auditViewerType === "entity" && selectedEntityFilter) {
          params.set("entityId", selectedEntityFilter);
        } else if (auditViewerType === "security") {
          params.set("eventCategory", "AUTHENTICATION");
          params.set("eventType", "LOGIN_FAILED");
        }

        const res = await fetch(`/api/admin/audits?${params.toString()}`);
        if (res.ok) {
          const payload = await res.json();
          if (payload.success) {
            setDbLogs(payload.data.logs);
            setPaginatedTotalCount(payload.data.pagination.totalCount);
            setPaginatedTotalPages(payload.data.pagination.totalPages);
            setAuditStats(payload.data.stats);
          }
        }
      } catch (err) {
        console.error("Failed to fetch audits:", err);
      } finally {
        setIsLoadingAudits(false);
      }
    };

    const timer = setTimeout(fetchAudits, 300);
    return () => clearTimeout(timer);
  }, [
    activeTab,
    currentPage,
    searchQuery,
    roleFilter,
    typeFilter,
    eventCategoryFilter,
    entityTypeFilter,
    startDate,
    endDate,
    auditViewerType,
    selectedUserFilter,
    selectedEntityFilter,
  ]);

  const [studentsList, setStudentsList] = useState<AdminStudentData[]>(initialStudents);
  const [facultyList, setFacultyList] = useState<AdminFacultyData[]>(initialFaculty);

  // Modal detail states
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentData | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<AdminFacultyData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<AdminTeamData | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmissionData | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogData | null>(null);

  const [isPending, startTransition] = useTransition();

  // Helper date formatter
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Helper format file sizes
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Handlers for admin actions
  const handleActivateUser = (userId: string, role: string) => {
    startTransition(async () => {
      const res = await activateUserAction(userId);
      if (res.success) {
        toast.success(res.message);
        if (role === "STUDENT") {
          setStudentsList((prev) =>
            prev.map((s) => (s.id === userId ? { ...s, isActive: true } : s))
          );
        } else {
          setFacultyList((prev) =>
            prev.map((f) => (f.id === userId ? { ...f, isActive: true } : f))
          );
        }
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleDeactivateUser = (userId: string, role: string) => {
    startTransition(async () => {
      const res = await deactivateUserAction(userId);
      if (res.success) {
        toast.success(res.message);
        if (role === "STUDENT") {
          setStudentsList((prev) =>
            prev.map((s) => (s.id === userId ? { ...s, isActive: false } : s))
          );
        } else {
          setFacultyList((prev) =>
            prev.map((f) => (f.id === userId ? { ...f, isActive: false } : f))
          );
        }
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleResetStudentStatus = (userId: string) => {
    startTransition(async () => {
      const res = await resetStudentStatusAction(userId);
      if (res.success) {
        toast.success(res.message);
        setStudentsList((prev) =>
          prev.map((s) =>
            s.id === userId
              ? { ...s, verificationStatus: "PENDING", isActive: true }
              : s
          )
        );
        if (selectedStudent && selectedStudent.id === userId) {
          setSelectedStudent((prev) =>
            prev ? { ...prev, verificationStatus: "PENDING", isActive: true } : null
          );
        }
      } else {
        toast.error(res.message);
      }
    });
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setStartDate("");
    setEndDate("");
    setEventCategoryFilter("all");
    setEntityTypeFilter("all");
    setCurrentPage(1);
    setSelectedUserFilter("");
    setSelectedEntityFilter("");
  };

  // Date boundary check
  const isWithinDateRange = (dateInput: Date | string) => {
    if (!startDate && !endDate) return true;
    const date = new Date(dateInput);
    if (startDate && date < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (date > end) return false;
    }
    return true;
  };

  // Memoized client-filtered lists
  const filteredStudents = useMemo(() => {
    return studentsList.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.isActive) ||
        (statusFilter === "inactive" && !s.isActive) ||
        (statusFilter === "verified" && s.verificationStatus === "VERIFIED") ||
        (statusFilter === "pending" && s.verificationStatus === "PENDING") ||
        (statusFilter === "rejected" && s.verificationStatus === "REJECTED");

      const matchesDate = isWithinDateRange(s.createdAt);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [studentsList, searchQuery, statusFilter, startDate, endDate]);

  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && f.isActive) ||
        (statusFilter === "inactive" && !f.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [facultyList, searchQuery, statusFilter]);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.teamCode && t.teamCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.leadName && t.leadName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        t.projectStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [teams, searchQuery, statusFilter]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.teamName && p.teamName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || p.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.submittedByName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || s.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesType =
        typeFilter === "all" || s.type.toLowerCase() === typeFilter.toLowerCase();

      const matchesDate = isWithinDateRange(s.submittedAt);

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [submissions, searchQuery, statusFilter, typeFilter, startDate, endDate]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((e) => {
      const matchesSearch =
        e.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.facultyName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || e.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesDate = isWithinDateRange(e.reviewDate);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [evaluations, searchQuery, statusFilter, startDate, endDate]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.userName && n.userName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        typeFilter === "all" || n.type.toLowerCase() === typeFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "read" && n.read) ||
        (statusFilter === "unread" && !n.read);

      const matchesDate = isWithinDateRange(n.createdAt);

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [notifications, searchQuery, typeFilter, statusFilter, startDate, endDate]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((l) => {
      const matchesSearch =
        l.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.details && l.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.user && l.user.name && l.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.user && l.user.email && l.user.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole =
        roleFilter === "all" || l.userRole.toLowerCase() === roleFilter.toLowerCase();

      const matchesType =
        typeFilter === "all" || l.actionType.toLowerCase() === typeFilter.toLowerCase();

      const matchesDate = isWithinDateRange(l.timestamp);

      return matchesSearch && matchesRole && matchesType && matchesDate;
    });
  }, [auditLogs, searchQuery, roleFilter, typeFilter, startDate, endDate]);

  // Derived detail states
  const selectedTeamMembers = useMemo(() => {
    if (!selectedTeam) return [];
    const teamRecord = teams.find((t) => t.id === selectedTeam.id);
    return teamRecord ? (teamRecord as any).students : [];
  }, [selectedTeam, teams]);

  const selectedTeamSubmissions = useMemo(() => {
    if (!selectedTeam) return [];
    return submissions.filter((s) => s.teamName === selectedTeam.name);
  }, [selectedTeam, submissions]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 border border-slate-100 bg-[#FAF9F5] p-5 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* General Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search students, faculty, teams, projects, logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 border-slate-200 focus-visible:ring-black rounded-xl bg-white"
            />
          </div>

          {/* Dynamic Action-specific filters depending on active tab */}
          {activeTab === "audits" && (
            <>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="h-10 border border-slate-200 rounded-xl px-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
              </select>
              <select
                value={eventCategoryFilter}
                onChange={(e) => { setEventCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="h-10 border border-slate-200 rounded-xl px-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All Categories</option>
                <option value="AUTHENTICATION">Authentication</option>
                <option value="TEAM_MANAGEMENT">Team Management</option>
                <option value="PROJECT">Project</option>
                <option value="FILE_UPLOAD">File Upload</option>
                <option value="SUBMISSION">Submission</option>
                <option value="EVALUATION">Evaluation</option>
                <option value="NOTIFICATION">Notification</option>
                <option value="ADMIN">Admin Actions</option>
              </select>
              <select
                value={entityTypeFilter}
                onChange={(e) => { setEntityTypeFilter(e.target.value); setCurrentPage(1); }}
                className="h-10 border border-slate-200 rounded-xl px-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All Entities</option>
                <option value="User">User</option>
                <option value="Team">Team</option>
                <option value="Project">Project</option>
                <option value="ProjectFile">File</option>
                <option value="Submission">Submission</option>
                <option value="Evaluation">Evaluation</option>
                <option value="Notification">Notification</option>
              </select>
            </>
          )}

          {activeTab !== "overview" && activeTab !== "audits" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 border border-slate-200 rounded-xl px-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="all">All Statuses</option>
              {activeTab === "users" ? (
                <>
                  <option value="active">Active Account</option>
                  <option value="inactive">Inactive Account</option>
                  <option value="verified">Verified Student</option>
                  <option value="pending">Pending Student</option>
                  <option value="rejected">Rejected Student</option>
                </>
              ) : activeTab === "teams-projects" ? (
                <>
                  <option value="discovery">Discovery</option>
                  <option value="ideation">Ideation</option>
                  <option value="execution">Execution</option>
                  <option value="viva">Viva Readiness</option>
                  <option value="completed">Completed</option>
                </>
              ) : activeTab === "submissions-evals" ? (
                <>
                  <option value="pending_review">Pending Review</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="revision_required">Revision Required</option>
                  <option value="rejected">Rejected</option>
                </>
              ) : activeTab === "notifications" ? (
                <>
                  <option value="read">Read</option>
                  <option value="unread">Unread</option>
                </>
              ) : null}
            </select>
          )}

          {(activeTab === "submissions-evals" || activeTab === "notifications" || activeTab === "audits") && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 border border-slate-200 rounded-xl px-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="all">All Types</option>
              {activeTab === "submissions-evals" ? (
                <>
                  <option value="weekly">Weekly</option>
                  <option value="final">Final</option>
                  <option value="ieee">IEEE</option>
                  <option value="literature">Literature</option>
                </>
              ) : activeTab === "notifications" ? (
                <>
                  <option value="alert">Alerts</option>
                  <option value="submission">Submissions</option>
                  <option value="review">Reviews</option>
                  <option value="info">Info</option>
                </>
              ) : activeTab === "audits" ? (
                <>
                  <option value="user_activate">User Activate</option>
                  <option value="user_deactivate">User Deactivate</option>
                  <option value="user_status_reset">User Status Reset</option>
                  <option value="login">Login</option>
                  <option value="submission_create">Submission Create</option>
                  <option value="evaluation_submit">Evaluation Submit</option>
                  <option value="notification_create">Notification Create</option>
                  <option value="unauthorized_access">Unauthorized Access</option>
                </>
              ) : null}
            </select>
          )}

          {/* Date range filters */}
          {(activeTab === "users" ||
            activeTab === "submissions-evals" ||
            activeTab === "notifications" ||
            activeTab === "audits") && (
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-slate-400" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 border-slate-200 focus-visible:ring-black w-[130px] p-2 bg-white rounded-xl text-xs"
              />
              <span className="text-slate-400 text-xs">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 border-slate-200 focus-visible:ring-black w-[130px] p-2 bg-white rounded-xl text-xs"
              />
            </div>
          )}

          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-10 text-slate-500 hover:text-black font-semibold"
          >
            <RotateCcw className="size-4 mr-1.5" /> Clear Filters
          </Button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-100 overflow-x-auto gap-2">
        <button
          onClick={() => {
            setActiveTab("overview");
            handleResetFilters();
          }}
          className={`flex items-center gap-2 px-4 py-3 font-extrabold text-sm border-b-2 transition-all ${
            activeTab === "overview"
              ? "border-black text-black"
              : "border-transparent text-slate-450 hover:text-slate-700"
          }`}
        >
          <LayoutGrid className="size-4" /> Overview & System Health
        </button>

        <button
          onClick={() => {
            setActiveTab("users");
            handleResetFilters();
          }}
          className={`flex items-center gap-2 px-4 py-3 font-extrabold text-sm border-b-2 transition-all ${
            activeTab === "users"
              ? "border-black text-black"
              : "border-transparent text-slate-450 hover:text-slate-700"
          }`}
        >
          <Users className="size-4" /> User Directory
        </button>

        <button
          onClick={() => {
            setActiveTab("teams-projects");
            handleResetFilters();
          }}
          className={`flex items-center gap-2 px-4 py-3 font-extrabold text-sm border-b-2 transition-all ${
            activeTab === "teams-projects"
              ? "border-black text-black"
              : "border-transparent text-slate-450 hover:text-slate-700"
          }`}
        >
          <FolderCheck className="size-4" /> Teams & Projects
        </button>

        <button
          onClick={() => {
            setActiveTab("submissions-evals");
            handleResetFilters();
          }}
          className={`flex items-center gap-2 px-4 py-3 font-extrabold text-sm border-b-2 transition-all ${
            activeTab === "submissions-evals"
              ? "border-black text-black"
              : "border-transparent text-slate-450 hover:text-slate-700"
          }`}
        >
          <FileText className="size-4" /> Submissions & Reviews
        </button>

        <button
          onClick={() => {
            setActiveTab("notifications");
            handleResetFilters();
          }}
          className={`flex items-center gap-2 px-4 py-3 font-extrabold text-sm border-b-2 transition-all ${
            activeTab === "notifications"
              ? "border-black text-black"
              : "border-transparent text-slate-450 hover:text-slate-700"
          }`}
        >
          <Inbox className="size-4" /> Notifications Log
        </button>

        <button
          onClick={() => {
            setActiveTab("audits");
            handleResetFilters();
          }}
          className={`flex items-center gap-2 px-4 py-3 font-extrabold text-sm border-b-2 transition-all ${
            activeTab === "audits"
              ? "border-black text-black"
              : "border-transparent text-slate-450 hover:text-slate-700"
          }`}
        >
          <History className="size-4" /> System Auditing
        </button>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[400px]">
        {isPending && (
          <div className="absolute inset-0 bg-white/40 z-30 flex items-center justify-center backdrop-blur-[1px] rounded-2xl">
            <Loader2 className="size-8 animate-spin text-black" />
          </div>
        )}

        {/* 1. OVERVIEW & HEALTH */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <Card className="border-slate-100 shadow-sm p-4 bg-white flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students</div>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalStudents}</div>
                <div className="text-[10px] text-emerald-600 mt-1 font-semibold">Active Profiles</div>
              </Card>

              <Card className="border-slate-100 shadow-sm p-4 bg-white flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty</div>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalFaculty}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-semibold">Academic Mentors</div>
              </Card>

              <Card className="border-slate-100 shadow-sm p-4 bg-white flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teams</div>
                <div className="text-3xl font-black text-indigo-600 mt-1">{stats.totalTeams}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-semibold">{stats.totalProjects} Projects total</div>
              </Card>

              <Card className="border-slate-100 shadow-sm p-4 bg-white flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</div>
                <div className="text-3xl font-black text-rose-500 mt-1">{stats.pendingReviews}</div>
                <div className="text-[10px] text-slate-450 mt-1 font-semibold">Awaiting Action</div>
              </Card>

              <Card className="border-slate-100 shadow-sm p-4 bg-white flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Deliveries</div>
                <div className="text-3xl font-black text-emerald-600 mt-1">{stats.totalSubmissions}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-semibold">{stats.totalNotifications} Alerts Sent</div>
              </Card>
            </div>

            {/* Health & Analytics Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Telemetry Indicator */}
              <Card className="border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
                <CardHeader className="pb-3 border-b border-slate-50 bg-[#FAF9F5]">
                  <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Server className="size-4 text-indigo-600" /> System Diagnostics
                  </CardTitle>
                  <CardDescription className="text-xs">Live platform and service health stats</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500 font-bold">API Requests (Telemetry)</span>
                    <span className="font-black text-slate-800">{health.apiRequestsTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500 font-bold">Failed Requests</span>
                    <span className={`font-black ${health.failedRequests > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      {health.failedRequests} ({((health.failedRequests / health.apiRequestsTotal) * 100).toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500 font-bold">Storage Capacity Used</span>
                    <span className="font-black text-slate-800">{formatBytes(health.storageUsedBytes)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500 font-bold">Total File Attachments</span>
                    <span className="font-black text-slate-800">{health.uploadCount} files</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500 font-bold">Database Status</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold rounded-lg px-2 py-0.5">
                      <HeartPulse className="size-3 mr-1 text-emerald-600" /> {health.dbStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 font-bold">Neon Gateway Latency</span>
                    <span className="font-black text-slate-850">{health.dbLatencyMs} ms</span>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Insights */}
              <Card className="lg:col-span-2 border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
                <CardHeader className="pb-3 border-b border-slate-50 bg-[#FAF9F5]">
                  <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <BarChart3 className="size-4 text-indigo-600" /> Platform Growth & Activity Metrics
                  </CardTitle>
                  <CardDescription className="text-xs">Sourced from Analytics & Reporting System</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Progress bars showing completion ratios */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Project Completion Ratio</span>
                      <span>{stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%</span>
                    </div>
                    <Progress
                      value={stats.totalProjects > 0 ? (stats.completedProjects / stats.totalProjects) * 100 : 0}
                      className="h-2 bg-slate-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Evaluation Completion Rate</span>
                      <span>{stats.totalSubmissions > 0 ? Math.round(((stats.totalSubmissions - stats.pendingReviews) / stats.totalSubmissions) * 100) : 0}%</span>
                    </div>
                    <Progress
                      value={stats.totalSubmissions > 0 ? ((stats.totalSubmissions - stats.pendingReviews) / stats.totalSubmissions) * 100 : 0}
                      className="h-2 bg-indigo-500"
                    />
                  </div>

                  {/* Growth Metrics Table Summary */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="font-bold">Metric Dimension</TableHead>
                          <TableHead className="font-bold text-right">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-slate-500">Student-to-Faculty Ratio</TableCell>
                          <TableCell className="text-right font-bold">
                            {stats.totalFaculty > 0 ? (stats.totalStudents / stats.totalFaculty).toFixed(1) : stats.totalStudents} : 1
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-slate-500">Average Team Size</TableCell>
                          <TableCell className="text-right font-bold">
                            {stats.totalTeams > 0 ? (stats.totalStudents / stats.totalTeams).toFixed(1) : 0} members
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-slate-500">Average Submissions Per Team</TableCell>
                          <TableCell className="text-right font-bold">
                            {stats.totalTeams > 0 ? (stats.totalSubmissions / stats.totalTeams).toFixed(1) : 0} submissions
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 2. USER DIRECTORY */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Student Management */}
            <Card className="border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  Student Management
                </CardTitle>
                <CardDescription className="text-xs">
                  Showing {filteredStudents.length} of {studentsList.length} students
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Student Name</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="font-bold">Team Assignment</TableHead>
                      <TableHead className="font-bold">Account Status</TableHead>
                      <TableHead className="font-bold">Registration Date</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-bold">{s.name}</TableCell>
                          <TableCell className="text-slate-500">{s.email}</TableCell>
                          <TableCell>
                            {s.teamName ? (
                              <div className="text-xs">
                                <span className="font-semibold">{s.teamName}</span>
                                <span className="text-slate-400 ml-1.5">({s.teamCode})</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1.5">
                              <Badge variant={s.isActive ? "secondary" : "destructive"} className="font-bold">
                                {s.isActive ? "Active" : "Deactivated"}
                              </Badge>
                              <Badge
                                variant={
                                  s.verificationStatus === "VERIFIED"
                                    ? "outline"
                                    : s.verificationStatus === "PENDING"
                                    ? "default"
                                    : "destructive"
                                }
                                className="font-bold text-[10px]"
                              >
                                {s.verificationStatus}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs">
                            {formatDate(s.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStudent(s)}
                                className="text-slate-600 font-bold border-slate-200"
                              >
                                Profile
                              </Button>
                              {s.isActive ? (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeactivateUser(s.id, "STUDENT")}
                                  className="font-bold shadow-none"
                                >
                                  <UserX className="size-3 mr-1" /> Deactivate
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActivateUser(s.id, "STUDENT")}
                                  className="text-emerald-600 border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold"
                                >
                                  <UserCheck className="size-3 mr-1" /> Activate
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetStudentStatus(s.id)}
                                className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 font-semibold"
                                title="Reset Verification Status"
                              >
                                <RotateCcw className="size-3" /> Reset
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 py-6 italic">
                          No students found matching filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Faculty Management */}
            <Card className="border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  Faculty Management
                </CardTitle>
                <CardDescription className="text-xs">
                  Showing {filteredFaculty.length} of {facultyList.length} faculty advisors
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Faculty Name</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="font-bold">Assigned Teams</TableHead>
                      <TableHead className="font-bold">Review Activity</TableHead>
                      <TableHead className="font-bold">Account Status</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFaculty.length > 0 ? (
                      filteredFaculty.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-bold">{f.name}</TableCell>
                          <TableCell className="text-slate-500">{f.email}</TableCell>
                          <TableCell>
                            {f.assignedTeams.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {f.assignedTeams.map((team) => (
                                  <Badge key={team} variant="outline" className="bg-slate-50 text-slate-650 text-[10px]">
                                    {team}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </TableCell>
                          <TableCell className="font-bold text-xs">{f.reviewCount} Reviews</TableCell>
                          <TableCell>
                            <Badge variant={f.isActive ? "secondary" : "destructive"} className="font-bold">
                              {f.isActive ? "Active" : "Deactivated"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedFaculty(f)}
                                className="text-slate-600 font-bold border-slate-200"
                              >
                                Profile
                              </Button>
                              {f.isActive ? (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeactivateUser(f.id, "FACULTY")}
                                  className="font-bold shadow-none"
                                >
                                  <UserX className="size-3 mr-1" /> Deactivate
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActivateUser(f.id, "FACULTY")}
                                  className="text-emerald-600 border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold"
                                >
                                  <UserCheck className="size-3 mr-1" /> Activate
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 py-6 italic">
                          No faculty found matching filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3. TEAMS & PROJECTS */}
        {activeTab === "teams-projects" && (
          <div className="space-y-6">
            {/* Teams Management */}
            <Card className="border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-sm font-extrabold text-slate-800">Team Management</CardTitle>
                <CardDescription className="text-xs">
                  Rosters, codes, and execution states
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Team Name</TableHead>
                      <TableHead className="font-bold">Team Code</TableHead>
                      <TableHead className="font-bold">Team Lead</TableHead>
                      <TableHead className="font-bold">Members Count</TableHead>
                      <TableHead className="font-bold">Project Status</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams.length > 0 ? (
                      filteredTeams.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-bold text-slate-800">{t.name}</TableCell>
                          <TableCell>
                            <code className="bg-slate-50 border border-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono">
                              {t.teamCode || "NO_CODE"}
                            </code>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-650">{t.leadName || "None"}</TableCell>
                          <TableCell className="text-slate-500 font-bold text-xs">{t.memberCount} Members</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-bold capitalize border-slate-200">
                              {t.projectStatus.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTeam(t)}
                              className="text-indigo-600 border-indigo-100 hover:bg-indigo-50 font-bold"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 py-6 italic">
                          No teams found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Projects Oversight */}
            <Card className="border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-sm font-extrabold text-slate-800">Project Management Oversight (View-Only)</CardTitle>
                <CardDescription className="text-xs">
                  Milestone execution tracking and progress index
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Project Title</TableHead>
                      <TableHead className="font-bold">Domain</TableHead>
                      <TableHead className="font-bold">Assigned Team</TableHead>
                      <TableHead className="font-bold">Current Sprint</TableHead>
                      <TableHead className="font-bold">Progress (%)</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.length > 0 ? (
                      filteredProjects.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-bold max-w-[240px] truncate" title={p.title}>
                            {p.title}
                          </TableCell>
                          <TableCell className="text-slate-500">{p.domain}</TableCell>
                          <TableCell className="font-semibold text-slate-750">
                            {p.teamName || <span className="text-slate-400 italic">Unassigned</span>}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-500">Week {p.currentWeek}</TableCell>
                          <TableCell className="min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">{p.progress}%</span>
                              <Progress value={p.progress} className="h-1.5 flex-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={p.status === "COMPLETED" ? "secondary" : "default"} className="font-bold">
                              {p.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 py-6 italic">
                          No projects found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 4. SUBMISSIONS & EVALUATIONS */}
        {activeTab === "submissions-evals" && (
          <div className="space-y-6">
            {/* Submission Monitoring */}
            <Card className="border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-sm font-extrabold text-slate-800">Student Deliveries & Evidence Files</CardTitle>
                <CardDescription className="text-xs">
                  Review queue, status checklist, and file attachments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Submission Title</TableHead>
                      <TableHead className="font-bold">Team</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Submitted At</TableHead>
                      <TableHead className="font-bold">Files</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-bold max-w-[200px] truncate" title={s.title}>
                            {s.title}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">{s.teamName}</TableCell>
                          <TableCell className="text-slate-500 font-semibold text-xs">{s.type}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                s.status === "APPROVED"
                                  ? "secondary"
                                  : s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW"
                                  ? "outline"
                                  : "destructive"
                              }
                              className="font-bold rounded-lg"
                            >
                              {s.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-450 text-xs">
                            {formatDate(s.submittedAt)}
                          </TableCell>
                          <TableCell>
                            {s.files.length > 0 ? (
                              <div className="flex flex-col gap-1 text-[10px]">
                                {s.files.map((file) => (
                                  <a
                                    key={file.id}
                                    href={`/api/files/${file.id}/download`}
                                    download
                                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-850 hover:underline font-bold"
                                  >
                                    <FileDown className="size-3" /> {file.fileName}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">No attachments</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubmission(s)}
                              className="text-slate-600 border-slate-200 font-bold"
                            >
                              View Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-slate-400 py-6 italic">
                          No submissions matched your search filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Evaluation Monitoring */}
            <Card className="border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-sm font-extrabold text-slate-800">Faculty Evaluations Audit (View-Only)</CardTitle>
                <CardDescription className="text-xs">
                  Grades, rubrics, and feedback comments logged by advisors
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Team Name</TableHead>
                      <TableHead className="font-bold">Project</TableHead>
                      <TableHead className="font-bold">Sprint Week</TableHead>
                      <TableHead className="font-bold text-center">Score</TableHead>
                      <TableHead className="font-bold">Feedback Comments</TableHead>
                      <TableHead className="font-bold">Evaluated By</TableHead>
                      <TableHead className="font-bold">Review Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvaluations.length > 0 ? (
                      filteredEvaluations.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-bold text-slate-800">{e.teamName}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={e.projectTitle}>
                            {e.projectTitle}
                          </TableCell>
                          <TableCell className="text-slate-500 font-bold text-xs">Week {e.weekNumber}</TableCell>
                          <TableCell className="text-center">
                            <span className="font-black text-sm text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                              {e.score}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[280px] truncate text-slate-500 text-xs" title={e.feedback || ""}>
                            {e.feedback || <span className="text-slate-400 italic">No feedback provided</span>}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-650">{e.facultyName}</TableCell>
                          <TableCell className="text-slate-450 text-xs">
                            {formatDate(e.reviewDate)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-slate-400 py-6 italic">
                          No evaluations found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 5. NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <Card className="border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-sm font-extrabold text-slate-800">System Notification Logs</CardTitle>
              <CardDescription className="text-xs">
                Auditing alerts and message delivery states
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Alert Message</TableHead>
                    <TableHead className="font-bold">Recipient</TableHead>
                    <TableHead className="font-bold">Recipient Role</TableHead>
                    <TableHead className="font-bold">Type</TableHead>
                    <TableHead className="font-bold">Read Status</TableHead>
                    <TableHead className="font-bold">Delivered At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="max-w-[320px] truncate text-slate-700 font-medium" title={n.message}>
                          {n.message}
                        </TableCell>
                        <TableCell className="font-bold text-slate-800">{n.userName || "Unknown"}</TableCell>
                        <TableCell className="text-slate-500 font-semibold text-xs">{n.userRole || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-semibold text-[10px] capitalize border-slate-200">
                            {n.type.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={n.read ? "secondary" : "default"} className="font-bold text-[10px]">
                            {n.read ? "Read" : "Unread"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-450 text-xs">
                          {formatDate(n.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-400 py-6 italic">
                        No notifications logged.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 6. AUDIT TRAIL */}
        {activeTab === "audits" && (
          <div className="space-y-6">
            {/* Audit Logs Dashboard Overview Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="border-slate-100 shadow-sm p-4 bg-white flex flex-col justify-between">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Events</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{auditStats.totalEvents}</div>
              </Card>
              <Card className="border-slate-100 shadow-sm p-4 bg-white flex flex-col justify-between">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Events Today</div>
                <div className="text-2xl font-black text-indigo-600 mt-1">{auditStats.eventsToday}</div>
              </Card>
              <Card className="border-slate-100 shadow-sm p-4 bg-white flex flex-col justify-between">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Failed Logins</div>
                <div className="text-2xl font-black text-rose-600 mt-1">{auditStats.failedLogins}</div>
              </Card>
              <Card className="border-slate-100 shadow-sm p-4 bg-white flex flex-col justify-between">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Submissions</div>
                <div className="text-2xl font-black text-indigo-700 mt-1">{auditStats.submissionActivity}</div>
              </Card>
              <Card className="border-slate-100 shadow-sm p-4 bg-white flex flex-col justify-between">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Evaluations</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{auditStats.evaluationActivity}</div>
              </Card>
              <Card className="border-slate-100 shadow-sm p-4 bg-white flex flex-col justify-between">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Admin Actions</div>
                <div className="text-2xl font-black text-slate-700 mt-1">{auditStats.administrativeActions}</div>
              </Card>
            </div>

            {/* Audit Logs Viewer Container */}
            <Card className="border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-extrabold text-slate-800">Platform Activity & Operations Audit Trail</CardTitle>
                    <CardDescription className="text-xs">
                      Centralized, immutable, and cryptographically aligned operational logging
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Sub Navigation for Audits Viewer */}
              <div className="flex gap-2 p-4 border-b border-slate-50 bg-slate-50/20">
                <button
                  onClick={() => { setAuditViewerType("timeline"); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    auditViewerType === "timeline"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Event Timeline
                </button>
                <button
                  onClick={() => { setAuditViewerType("user"); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    auditViewerType === "user"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  User Activity
                </button>
                <button
                  onClick={() => { setAuditViewerType("entity"); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    auditViewerType === "entity"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Entity Activity
                </button>
                <button
                  onClick={() => { setAuditViewerType("security"); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    auditViewerType === "security"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Security Alerts
                </button>
              </div>

              {/* Tab specific filter overlay inputs */}
              {auditViewerType === "user" && (
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Filter by User Name, Email, or ID:</span>
                  <Input
                    type="text"
                    placeholder="Enter name or email..."
                    value={selectedUserFilter}
                    onChange={(e) => { setSelectedUserFilter(e.target.value); setCurrentPage(1); }}
                    className="max-w-[280px] h-8 text-xs rounded-lg bg-white border-slate-200"
                  />
                  {selectedUserFilter && (
                    <Button onClick={() => setSelectedUserFilter("")} variant="ghost" className="h-8 text-xs hover:bg-slate-200 px-2 rounded-lg text-slate-400">Clear</Button>
                  )}
                </div>
              )}
              {auditViewerType === "entity" && (
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Filter by Entity ID:</span>
                  <Input
                    type="text"
                    placeholder="Enter exact entity UUID..."
                    value={selectedEntityFilter}
                    onChange={(e) => { setSelectedEntityFilter(e.target.value); setCurrentPage(1); }}
                    className="max-w-[280px] h-8 text-xs rounded-lg bg-white border-slate-200"
                  />
                  {selectedEntityFilter && (
                    <Button onClick={() => setSelectedEntityFilter("")} variant="ghost" className="h-8 text-xs hover:bg-slate-200 px-2 rounded-lg text-slate-400">Clear</Button>
                  )}
                </div>
              )}

              {/* Records List Container */}
              <CardContent className="p-0">
                {isLoadingAudits ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-450 gap-2 bg-white">
                    <Loader2 className="size-8 animate-spin text-slate-400" />
                    <span className="text-xs font-bold">Querying live audit logs...</span>
                  </div>
                ) : dbLogs.length === 0 ? (
                  <div className="text-center text-slate-400 py-16 bg-white italic text-xs">
                    No audit events logged matching the active criteria.
                  </div>
                ) : (
                  <div className="p-6 bg-white">
                    <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6">
                      {dbLogs.map((log) => {
                        const CategoryIcon = (() => {
                          switch (log.eventCategory) {
                            case "AUTHENTICATION": return Lock;
                            case "TEAM_MANAGEMENT": return Users;
                            case "PROJECT": return FolderCheck;
                            case "FILE_UPLOAD": return FileDown;
                            case "SUBMISSION": return FileText;
                            case "EVALUATION": return CheckCircle2;
                            case "NOTIFICATION": return Inbox;
                            case "ADMIN": return ShieldAlert;
                            default: return Activity;
                          }
                        })();
                        return (
                          <div key={log.id} className="relative group">
                            {/* Timeline Dot & Icon */}
                            <div className="absolute -left-[37px] top-1 size-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-500 group-hover:text-black transition-colors">
                              <CategoryIcon className="size-3.5" />
                            </div>

                            {/* Event Content Box */}
                            <div className="space-y-1 bg-slate-50/20 group-hover:bg-slate-50/50 p-4 border border-slate-100/30 rounded-xl transition-all animate-fade-in-down">
                              <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-slate-900 text-xs">{log.actionType.replace(/_/g, " ")}</span>
                                  <Badge variant="outline" className="text-[8px] font-extrabold tracking-wider bg-slate-50 text-slate-500 rounded px-1.5 py-0.5 border-slate-150 uppercase">
                                    {log.eventCategory || "SYSTEM"}
                                  </Badge>
                                  {log.ipAddress && (
                                    <span className="text-[9px] font-mono text-slate-400 font-semibold bg-slate-100 rounded px-1">{log.ipAddress}</span>
                                  )}
                                </div>
                                <span className="text-slate-400 font-semibold text-[10px]">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 leading-normal font-medium mt-1">
                                {log.actionPerformed || log.details}
                              </p>

                              <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100/50 mt-2 flex-wrap">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-bold">
                                  {log.user ? (
                                    <span>By: <span className="text-slate-700">{log.user.name}</span> ({log.userRole})</span>
                                  ) : (
                                    <span>By: <span className="text-slate-700 italic">System ({log.userId})</span></span>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  {log.entityType && log.entityId && (
                                    <Badge variant="secondary" className="text-[8px] rounded px-1.5 py-0.5 font-bold bg-indigo-50 text-indigo-700 border-none">
                                      {log.entityType}: {log.entityId.slice(0, 8)}
                                    </Badge>
                                  )}

                                  {(log.previousState || log.metadata) && (
                                    <button
                                      onClick={() => setSelectedAuditLog(log)}
                                      className="text-[9px] font-bold text-slate-900 hover:text-black underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <History className="size-3 text-indigo-600" /> View Transition Details
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Paginated Footer controls */}
              {paginatedTotalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/20">
                  <span className="text-xs text-slate-455 font-bold">
                    Showing Page <span className="text-slate-800">{currentPage}</span> of <span className="text-slate-800">{paginatedTotalPages}</span> ({paginatedTotalCount} total events)
                  </span>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || isLoadingAudits}
                      variant="outline"
                      className="h-8 text-xs font-bold rounded-lg border-slate-200 px-3 cursor-pointer"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(paginatedTotalPages, prev + 1))}
                      disabled={currentPage === paginatedTotalPages || isLoadingAudits}
                      variant="outline"
                      className="h-8 text-xs font-bold rounded-lg border-slate-200 px-3 cursor-pointer"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DETAILS MODALS */}
      {/* ======================================================== */}

      {/* 1. Student Profile Modal */}
      {selectedStudent && (
        <Modal open={true} onOpenChange={(open) => !open && setSelectedStudent(null)}>
          <ModalContent className="max-w-md">
            <ModalHeader>
              <ModalTitle>Student Profile Details</ModalTitle>
              <ModalCloseButton onClick={() => setSelectedStudent(null)} />
            </ModalHeader>
            <ModalBody className="space-y-4 text-sm">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <div className="size-10 bg-indigo-50 border border-indigo-150 rounded-full flex items-center justify-center font-bold text-indigo-700">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="font-extrabold text-slate-850 text-base">{selectedStudent.name}</div>
                  <div className="text-xs text-slate-500">{selectedStudent.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-450 font-bold block">Roll Number</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.rollNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-450 font-bold block">Registration Date</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedStudent.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-450 font-bold block">Team Name</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.teamName || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-slate-450 font-bold block">Team Code</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.teamCode || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-450 font-bold block">Verification Status</span>
                  <Badge variant="outline" className="font-bold text-[10px] mt-0.5 border-slate-200">
                    {selectedStudent.verificationStatus}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-450 font-bold block">Account status</span>
                  <Badge variant={selectedStudent.isActive ? "secondary" : "destructive"} className="font-bold text-[10px] mt-0.5">
                    {selectedStudent.isActive ? "Active" : "Deactivated"}
                  </Badge>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {selectedStudent.verificationStatus !== "PENDING" && (
                <Button
                  variant="outline"
                  onClick={() => handleResetStudentStatus(selectedStudent.id)}
                  className="mr-auto text-amber-600 border-amber-100 hover:bg-amber-50 font-bold"
                >
                  Reset Verification
                </Button>
              )}
              {selectedStudent.isActive ? (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeactivateUser(selectedStudent.id, "STUDENT");
                    setSelectedStudent((prev) => prev ? { ...prev, isActive: false } : null);
                  }}
                  className="font-bold"
                >
                  Deactivate Account
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleActivateUser(selectedStudent.id, "STUDENT");
                    setSelectedStudent((prev) => prev ? { ...prev, isActive: true } : null);
                  }}
                  className="text-emerald-600 border-emerald-100 hover:bg-emerald-50 font-bold"
                >
                  Activate Account
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* 2. Faculty Profile Modal */}
      {selectedFaculty && (
        <Modal open={true} onOpenChange={(open) => !open && setSelectedFaculty(null)}>
          <ModalContent className="max-w-md">
            <ModalHeader>
              <ModalTitle>Faculty Advisor Profile</ModalTitle>
              <ModalCloseButton onClick={() => setSelectedFaculty(null)} />
            </ModalHeader>
            <ModalBody className="space-y-4 text-sm">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <div className="size-10 bg-indigo-50 border border-indigo-150 rounded-full flex items-center justify-center font-bold text-indigo-700">
                  {selectedFaculty.name.charAt(0)}
                </div>
                <div>
                  <div className="font-extrabold text-slate-850 text-base">{selectedFaculty.name}</div>
                  <div className="text-xs text-slate-500">{selectedFaculty.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-450 font-bold block">Department</span>
                  <span className="font-semibold text-slate-800">{selectedFaculty.department || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-450 font-bold block">Evaluations Logged</span>
                  <span className="font-bold text-slate-850">{selectedFaculty.reviewCount} Reviews</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-450 font-bold block mb-1">Assigned Teams</span>
                  {selectedFaculty.assignedTeams.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedFaculty.assignedTeams.map((team) => (
                        <Badge key={team} variant="outline" className="bg-slate-50 text-slate-650 text-[10px]">
                          {team}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No teams assigned</span>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {selectedFaculty.isActive ? (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeactivateUser(selectedFaculty.id, "FACULTY");
                    setSelectedFaculty((prev) => prev ? { ...prev, isActive: false } : null);
                  }}
                  className="font-bold"
                >
                  Deactivate Account
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleActivateUser(selectedFaculty.id, "FACULTY");
                    setSelectedFaculty((prev) => prev ? { ...prev, isActive: true } : null);
                  }}
                  className="text-emerald-600 border-emerald-100 hover:bg-emerald-50 font-bold"
                >
                  Activate Account
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* 3. Team Details Modal */}
      {selectedTeam && (
        <Modal open={true} onOpenChange={(open) => !open && setSelectedTeam(null)}>
          <ModalContent className="max-w-lg">
            <ModalHeader>
              <ModalTitle>Team Details & History</ModalTitle>
              <ModalCloseButton onClick={() => setSelectedTeam(null)} />
            </ModalHeader>
            <ModalBody className="space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div>
                  <div className="text-base font-extrabold text-slate-850">{selectedTeam.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Code: {selectedTeam.teamCode}</div>
                </div>
                <Badge variant="outline" className="font-bold capitalize border-slate-200">
                  {selectedTeam.projectStatus.toLowerCase()}
                </Badge>
              </div>

              {/* Members List */}
              <div>
                <h4 className="font-bold text-slate-750 mb-2">Team Members</h4>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-bold">Name</TableHead>
                        <TableHead className="font-bold">Roll</TableHead>
                        <TableHead className="font-bold">Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTeamMembers.length > 0 ? (
                        selectedTeamMembers.map((member: any) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-bold">{member.user.name}</TableCell>
                            <TableCell className="text-slate-500">{member.user.rollNumber || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant={member.role === "TEAM_LEAD" ? "secondary" : "outline"} className="text-[10px] font-bold">
                                {member.role}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-slate-400 py-3 italic">
                            No members assigned
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Submissions History */}
              <div>
                <h4 className="font-bold text-slate-750 mb-2">Submission History</h4>
                <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-bold">Sprint Title</TableHead>
                        <TableHead className="font-bold">Type</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="font-bold">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTeamSubmissions.length > 0 ? (
                        selectedTeamSubmissions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-bold truncate max-w-[120px]" title={sub.title}>
                              {sub.title}
                            </TableCell>
                            <TableCell className="text-slate-500">{sub.type}</TableCell>
                            <TableCell>
                              <Badge variant={sub.status === "APPROVED" ? "secondary" : "outline"} className="text-[10px] font-bold">
                                {sub.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-400 text-[10px]">
                              {new Date(sub.submittedAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-400 py-3 italic">
                            No submissions yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setSelectedTeam(null)} className="font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-850 px-4 h-9">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* 4. Submission Details Modal */}
      {selectedSubmission && (
        <Modal open={true} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
          <ModalContent className="max-w-md">
            <ModalHeader>
              <ModalTitle>Submission Audit Details</ModalTitle>
              <ModalCloseButton onClick={() => setSelectedSubmission(null)} />
            </ModalHeader>
            <ModalBody className="space-y-4 text-xs">
              <div className="border-b border-slate-50 pb-3">
                <div className="text-base font-extrabold text-slate-850">{selectedSubmission.title}</div>
                <div className="text-[10px] text-slate-550 mt-1 flex gap-2">
                  <span>Team: <strong className="text-slate-700">{selectedSubmission.teamName}</strong></span>
                  <span>·</span>
                  <span>Submitted by: <strong className="text-slate-700">{selectedSubmission.submittedByName}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-450 font-bold block">Submission Type</span>
                  <span className="font-semibold text-slate-800">{selectedSubmission.type}</span>
                </div>
                <div>
                  <span className="text-slate-450 font-bold block">Submission Status</span>
                  <Badge variant={selectedSubmission.status === "APPROVED" ? "secondary" : "outline"} className="font-bold mt-0.5">
                    {selectedSubmission.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-450 font-bold block">Submitted At</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedSubmission.submittedAt)}</span>
                </div>
                <div>
                  <span className="text-slate-450 font-bold block">Score Assigned</span>
                  <span className="font-extrabold text-sm text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                    {selectedSubmission.score !== null ? `${selectedSubmission.score} / 100` : "Not evaluated yet"}
                  </span>
                </div>
              </div>

              {/* Attachment list */}
              {selectedSubmission.files.length > 0 && (
                <div className="mt-3">
                  <span className="text-slate-450 font-bold block mb-1.5">Evidence Files</span>
                  <div className="border border-slate-100 rounded-xl p-3 space-y-2 bg-slate-50/50">
                    {selectedSubmission.files.map((file) => (
                      <div key={file.id} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-750">{file.fileName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px]">{formatBytes(file.fileSize)}</span>
                          <a
                            href={`/api/files/${file.id}/download`}
                            download
                            className="bg-white border border-slate-200 text-indigo-650 hover:bg-slate-50 px-2 py-0.5 rounded font-bold transition flex items-center gap-0.5"
                          >
                            <FileDown className="size-3" /> Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setSelectedSubmission(null)} className="font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-850 px-4 h-9">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* 5. Audit Log Details Modal */}
      {selectedAuditLog && (
        <Modal open={true} onOpenChange={(open) => !open && setSelectedAuditLog(null)}>
          <ModalContent className="max-w-2xl">
            <ModalHeader>
              <ModalTitle>Audit Trail Detail View</ModalTitle>
              <ModalCloseButton onClick={() => setSelectedAuditLog(null)} />
            </ModalHeader>
            <ModalBody className="space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-b border-slate-50 pb-4">
                <div>
                  <span className="text-slate-455 font-bold block">Actor Name</span>
                  <span className="font-extrabold text-slate-800">{selectedAuditLog.user?.name || "System/Unknown"}</span>
                </div>
                <div>
                  <span className="text-slate-455 font-bold block">Actor Role</span>
                  <Badge variant="outline" className="font-bold text-[10px] mt-0.5 border-slate-200">
                    {selectedAuditLog.userRole}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-455 font-bold block font-mono">User ID</span>
                  <code className="bg-slate-50 border border-slate-100 text-slate-650 px-2 py-0.5 rounded font-mono text-[10px] block mt-0.5">
                    {selectedAuditLog.userId}
                  </code>
                </div>
                <div>
                  <span className="text-slate-455 font-bold block">Action Type / Category</span>
                  <div className="flex gap-1.5 mt-0.5 items-center">
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-150 font-bold text-[10px]">
                      {selectedAuditLog.actionType}
                    </Badge>
                    <Badge variant="outline" className="bg-slate-50 text-slate-650 border-slate-200 font-extrabold text-[8px] uppercase">
                      {selectedAuditLog.eventCategory || "SYSTEM"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-slate-455 font-bold block">Timestamp</span>
                  <span className="font-semibold text-slate-800">{new Date(selectedAuditLog.timestamp).toLocaleString()}</span>
                </div>
                {selectedAuditLog.ipAddress && (
                  <div>
                    <span className="text-slate-455 font-bold block">IP Address</span>
                    <span className="font-semibold text-slate-800 font-mono">{selectedAuditLog.ipAddress}</span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-slate-455 font-bold block">Entity Affected</span>
                  <span className="font-semibold text-slate-800 text-[11px] font-mono">{selectedAuditLog.entityAffected || "N/A"}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-455 font-bold block mb-1">Action Description</span>
                <div className="bg-[#FAF9F5] border border-slate-100 rounded-xl p-4 text-[11px] leading-relaxed text-slate-700">
                  {selectedAuditLog.actionPerformed || selectedAuditLog.details || "No description details attached"}
                </div>
              </div>

              {/* Side-by-side JSON State Transition Diff */}
              {selectedAuditLog.previousState && selectedAuditLog.newState && (
                <div className="space-y-2 mt-4">
                  <span className="text-slate-455 font-bold block uppercase tracking-wider text-[9px]">State Transition (JSON Diff)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="text-[9px] font-bold text-slate-450 uppercase mb-1">Previous State</div>
                      <pre className="text-[10px] font-mono text-rose-650 overflow-x-auto max-h-[150px]">
                        {(() => {
                          try {
                            return JSON.stringify(JSON.parse(selectedAuditLog.previousState), null, 2);
                          } catch {
                            return selectedAuditLog.previousState;
                          }
                        })()}
                      </pre>
                    </div>
                    <div className="p-3 bg-indigo-50/20 border border-indigo-50 rounded-xl">
                      <div className="text-[9px] font-bold text-indigo-450 uppercase mb-1">New State</div>
                      <pre className="text-[10px] font-mono text-emerald-650 overflow-x-auto max-h-[150px]">
                        {(() => {
                          try {
                            return JSON.stringify(JSON.parse(selectedAuditLog.newState), null, 2);
                          } catch {
                            return selectedAuditLog.newState;
                          }
                        })()}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata Viewer */}
              {selectedAuditLog.metadata && (
                <div className="space-y-1 mt-4">
                  <span className="text-slate-455 font-bold block uppercase tracking-wider text-[9px]">Event Metadata</span>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <pre className="text-[10px] font-mono text-slate-650 overflow-x-auto max-h-[150px]">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedAuditLog.metadata), null, 2);
                        } catch {
                          return selectedAuditLog.metadata;
                        }
                      })()}
                    </pre>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setSelectedAuditLog(null)} className="font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-850 px-4 h-9">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
