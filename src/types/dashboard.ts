/**
 * Dashboard domain types — students, faculty, academic entities.
 * Extracted from the original monolithic types/index.ts.
 */

export type Domain =
  | "AI/ML"
  | "Healthcare"
  | "Education"
  | "Retail"
  | "Fintech"
  | "Agriculture"
  | "Automation"
  | "Cybersecurity"
  | "IoT";

export type SubmissionStatus = "pending" | "approved" | "rejected" | "revision";

export type Submission = {
  id: string;
  week: number;
  title: string;
  summary: string;
  github?: string;
  deploy?: string;
  status: SubmissionStatus;
  submittedAt: string;
  facultyComment?: string;
  attachments: string[];
};

export type PaperSection = {
  key: string;
  name: string;
  progress: number;
  comments: number;
  status: "draft" | "review" | "approved";
};

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type PerformanceBand =
  | "Excellent"
  | "Good"
  | "Average"
  | "At Risk"
  | "Critical";

export type Backlog = {
  subject: string;
  code: string;
  semester: number;
  attempts: number;
  status: "Pending" | "Cleared";
  marks?: number;
  internal?: number;
  external?: number;
  total?: number;
  academicYear?: string;
  dateCleared?: string;
};

export type AcademicEvent = {
  date: string;
  type:
    | "attendance"
    | "submission"
    | "comment"
    | "paper"
    | "backlog"
    | "meeting";
  label: string;
  detail?: string;
};

export type Student = {
  id: string;
  name: string;
  roll: string;
  dept: string;
  section: string;
  batch: string;
  year: string;
  email: string;
  phone: string;
  parentPhone: string;
  address: string;
  dob: string;
  cgpa: number;
  semester: number;
  skills: string[];
  interests: string[];
  certifications: string[];
  internship: "Ongoing" | "Completed" | "None";
  mentor: string;
  team: string;
  project: string;
  projectStatus: "On track" | "Delayed" | "Inactive" | "At risk";
  paperStatus:
    | "Not started"
    | "Drafting"
    | "Under review"
    | "Approved"
    | "Published";
  attendance: { month: string; pct: number }[];
  attendanceOverall: number;
  backlogs: Backlog[];
  timeline: AcademicEvent[];
  missedSubmissions: number;
  inactiveDays: number;
  paperProgress: number;
};

export type Batch = {
  id: string;
  name: string;
  students: number;
  active: number;
  avgProgress: number;
  pendingReviews: number;
};

export type TeamRow = {
  id: string;
  team: string;
  batch: string;
  problem: string;
  week: number;
  progress: number;
  paper: number;
  lastSubmission: string;
  status: "On track" | "Delayed" | "Inactive" | "At risk";
};

export type AchievementLevel =
  | "College"
  | "State"
  | "National"
  | "International";
export type AchievementKind = "academic" | "non-academic";

export type Achievement = {
  id: string;
  studentId: string;
  kind: AchievementKind;
  title: string;
  category: string;
  description: string;
  date: string;
  level: AchievementLevel;
  role?: string;
  event?: string;
  verified: boolean;
  certificate?: string;
};
