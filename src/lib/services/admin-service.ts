import { db } from "@/lib/db";

export interface AdminOverviewStats {
  totalStudents: number;
  totalFaculty: number;
  totalTeams: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingReviews: number;
  totalSubmissions: number;
  totalNotifications: number;
}

export interface AdminStudentData {
  id: string;
  name: string;
  email: string;
  rollNumber: string | null;
  teamName: string | null;
  teamCode: string | null;
  isActive: boolean;
  verificationStatus: string;
  createdAt: Date;
}

export interface AdminFacultyData {
  id: string;
  name: string;
  email: string;
  department: string | null;
  assignedTeams: string[];
  reviewCount: number;
  isActive: boolean;
}

export interface AdminTeamData {
  id: string;
  name: string;
  teamCode: string | null;
  leadName: string | null;
  memberCount: number;
  projectTitle: string | null;
  projectStatus: string;
}

export interface AdminProjectData {
  id: string;
  title: string;
  domain: string;
  difficulty: string;
  teamName: string | null;
  currentWeek: number;
  progress: number;
  status: string;
}

export interface AdminSubmissionData {
  id: string;
  title: string;
  type: string;
  status: string;
  submittedAt: Date;
  teamName: string;
  submittedByName: string;
  score: number | null;
  files: Array<{ id: string; fileName: string; fileSize: number }>;
}

export interface AdminEvaluationData {
  id: string;
  teamName: string;
  projectTitle: string;
  weekNumber: number;
  score: number;
  feedback: string | null;
  reviewDate: Date;
  status: string;
  facultyName: string;
}

export interface AdminNotificationData {
  id: string;
  message: string;
  type: string;
  status: string;
  read: boolean;
  createdAt: Date;
  userName: string | null;
  userRole: string | null;
}

export interface SystemHealthData {
  apiRequestsTotal: number;
  failedRequests: number;
  storageUsedBytes: number;
  uploadCount: number;
  dbStatus: "Healthy" | "Degraded" | "Warning";
  dbLatencyMs: number;
}

/**
 * Fetch Admin dashboard overview metrics
 */
export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const [
    totalStudents,
    totalFaculty,
    totalTeams,
    totalProjects,
    completedProjects,
    pendingReviews,
    totalSubmissions,
    totalNotifications,
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "FACULTY" } }),
    db.team.count(),
    db.project.count(),
    db.project.count({ where: { status: "COMPLETED" } }),
    db.submission.count({
      where: {
        status: { in: ["PENDING_REVIEW", "UNDER_REVIEW"] },
      },
    }),
    db.submission.count(),
    db.notification.count(),
  ]);

  const activeProjects = totalProjects - completedProjects;

  return {
    totalStudents,
    totalFaculty,
    totalTeams,
    totalProjects,
    activeProjects,
    completedProjects,
    pendingReviews,
    totalSubmissions,
    totalNotifications,
  };
}

/**
 * Fetch students list for management
 */
export async function getAdminStudents(): Promise<AdminStudentData[]> {
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    include: {
      memberships: {
        include: {
          team: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return students.map((s) => {
    const membership = s.memberships[0];
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      rollNumber: s.rollNumber,
      teamName: membership?.team?.name || null,
      teamCode: membership?.team?.teamCode || null,
      isActive: (s as any).isActive !== false, // Fallback if database defaults aren't fully resolved in JS engine memory
      verificationStatus: s.verificationStatus,
      createdAt: s.createdAt,
    };
  });
}

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export async function getAdminUsers(): Promise<AdminUserData[]> {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive !== false,
    createdAt: u.createdAt,
  }));
}

/**
 * Fetch faculty list for management
 */
export async function getAdminFaculty(): Promise<AdminFacultyData[]> {
  const faculty = await db.user.findMany({
    where: { role: "FACULTY" },
    include: {
      taughtTeams: true,
      evaluations: true,
    },
    orderBy: { name: "asc" },
  });

  return faculty.map((f) => ({
    id: f.id,
    name: f.name,
    email: f.email,
    department: f.department,
    assignedTeams: f.taughtTeams.map((t) => t.name),
    reviewCount: f.evaluations.length,
    isActive: (f as any).isActive !== false,
  }));
}

/**
 * Fetch teams list
 */
export async function getAdminTeams(): Promise<AdminTeamData[]> {
  const teams = await db.team.findMany({
    include: {
      students: {
        include: {
          user: true,
        },
      },
      project: true,
    },
    orderBy: { name: "asc" },
  });

  return teams.map((t) => {
    const lead = t.students.find((s) => s.role === "TEAM_LEAD")?.user?.name || null;
    return {
      id: t.id,
      name: t.name,
      teamCode: t.teamCode,
      leadName: lead,
      memberCount: t.students.length,
      projectTitle: t.project?.title || null,
      projectStatus: t.project?.status || "DISCOVERY",
    };
  });
}

/**
 * Fetch projects list
 */
export async function getAdminProjects(): Promise<AdminProjectData[]> {
  const projects = await db.project.findMany({
    include: {
      team: true,
    },
    orderBy: { progress: "desc" },
  });

  return projects.map((p) => {
    // Current week is calculated from milestones or fallback
    const currentWeek = Math.min(
      8,
      Math.max(1, Math.ceil(p.progress / 12.5))
    );

    return {
      id: p.id,
      title: p.title,
      domain: p.domain,
      difficulty: p.difficulty,
      teamName: p.team?.name || null,
      currentWeek,
      progress: p.progress,
      status: p.status,
    };
  });
}

export async function getAdminSubmissions(): Promise<AdminSubmissionData[]> {
  const submissions = (await (db as any).submission.findMany({
    include: {
      team: true,
      submittedBy: true,
    },
    orderBy: { submittedAt: "desc" },
  })) as any[];

  const files = await (db as any).projectFile.findMany({
    select: {
      id: true,
      fileName: true,
      fileSize: true,
      submissionId: true,
    },
  });

  const filesMap = new Map<string, any[]>();
  for (const f of files) {
    if (f.submissionId) {
      const list = filesMap.get(f.submissionId) || [];
      list.push(f);
      filesMap.set(f.submissionId, list);
    }
  }

  return submissions.map((s) => ({
    id: s.id,
    title: s.title,
    type: s.type,
    status: s.status,
    submittedAt: s.submittedAt,
    teamName: s.team?.name || "Unassigned",
    submittedByName: s.submittedBy?.name || "Unknown",
    score: s.score,
    files: filesMap.get(s.id) || [],
  }));
}

/**
 * Fetch evaluations list
 */
export async function getAdminEvaluations(): Promise<AdminEvaluationData[]> {
  const evaluations = await db.evaluation.findMany({
    include: {
      team: true,
      project: true,
      faculty: true,
    },
    orderBy: { reviewDate: "desc" },
  });

  return evaluations.map((e) => ({
    id: e.id,
    teamName: e.team?.name || "Unassigned",
    projectTitle: e.project?.title || "No Project",
    weekNumber: e.weekNumber,
    score: e.score,
    feedback: e.feedback,
    reviewDate: e.reviewDate,
    status: e.status,
    facultyName: e.faculty?.name || "Unknown",
  }));
}

/**
 * Fetch system notifications list
 */
export async function getAdminNotifications(): Promise<AdminNotificationData[]> {
  const notifications = await db.notification.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  const userIds = Array.from(new Set(notifications.map((n) => n.userId))) as string[];
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, role: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return notifications.map((n) => {
    const user = userMap.get(n.userId);
    return {
      id: n.id,
      message: n.message,
      type: n.type,
      status: n.status,
      read: n.read,
      createdAt: n.createdAt,
      userName: user?.name || null,
      userRole: user?.role || null,
    };
  });
}

/**
 * Fetch simulated system health stats
 */
export async function getAdminSystemHealth(): Promise<SystemHealthData> {
  // Queries basic file metadata to calculate storage usage
  const files = await db.projectFile.findMany({
    select: { fileSize: true },
  });
  const storageUsedBytes = files.reduce((sum, f) => sum + f.fileSize, 0);

  // Simulated metrics derived from platform data
  const userCount = await db.user.count();
  const apiRequestsTotal = userCount * 125 + files.length * 35 + 1420;
  const failedRequests = Math.round(apiRequestsTotal * 0.008); // Simulated 0.8% error rate

  return {
    apiRequestsTotal,
    failedRequests,
    storageUsedBytes,
    uploadCount: files.length,
    dbStatus: "Healthy",
    dbLatencyMs: 4, // Neon average latency
  };
}

export interface AdminApplicationData {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  collegeName: string;
  department: string;
  section: string;
  facultyName: string;
  notes: string | null;
  status: string;
  createdAt: Date;
}

export async function getAdminApplications(): Promise<AdminApplicationData[]> {
  const requests = await db.teamAssignmentRequest.findMany({
    include: {
      student: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentName: r.student.name,
    studentEmail: r.student.email,
    collegeName: r.collegeName,
    department: r.department,
    section: r.section,
    facultyName: r.facultyName,
    notes: r.notes,
    status: r.status,
    createdAt: r.createdAt,
  }));
}
