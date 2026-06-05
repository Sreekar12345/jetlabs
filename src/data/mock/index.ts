// Mock data for prototype — will be replaced by API calls
// TODO: Replace with API service calls when backend is ready

import type {
  Submission,
  PaperSection,
  Batch,
  TeamRow,
  Student,
  Backlog,
  AcademicEvent,
} from "@/types";

// ── Paper sections ──
export const PAPER_SECTIONS: PaperSection[] = [
  { key: "abstract", name: "Abstract", progress: 80, comments: 2, status: "review" },
  { key: "intro", name: "Introduction", progress: 100, comments: 0, status: "approved" },
  { key: "problem", name: "Problem Statement", progress: 100, comments: 1, status: "approved" },
  { key: "lit", name: "Literature Review", progress: 70, comments: 4, status: "review" },
  { key: "method", name: "Methodology", progress: 55, comments: 3, status: "draft" },
  { key: "arch", name: "System Architecture", progress: 60, comments: 1, status: "draft" },
  { key: "impl", name: "Implementation", progress: 30, comments: 0, status: "draft" },
  { key: "results", name: "Results", progress: 15, comments: 0, status: "draft" },
  { key: "conclusion", name: "Conclusion", progress: 0, comments: 0, status: "draft" },
  { key: "future", name: "Future Scope", progress: 0, comments: 0, status: "draft" },
  { key: "refs", name: "References", progress: 45, comments: 1, status: "draft" },
];

// ── Submissions ──
export const SUBMISSIONS: Submission[] = [
  { id: "S1", week: 1, title: "Problem finalization & literature review", summary: "Selected problem, surveyed 8 IEEE papers.", github: "github.com/team/proj", status: "approved", submittedAt: "2026-02-04", facultyComment: "Good shortlisting. Add 2 more recent papers.", attachments: ["literature.pdf"] },
  { id: "S2", week: 2, title: "Dataset & baseline model", summary: "Loaded Kaggle dataset, trained baseline CNN.", github: "github.com/team/proj", status: "approved", submittedAt: "2026-02-11", facultyComment: "Baseline acceptable. Document hyperparameters.", attachments: ["notebook.ipynb", "metrics.png"] },
  { id: "S3", week: 3, title: "Improved architecture", summary: "Switched to EfficientNet-B0, +6% accuracy.", github: "github.com/team/proj", status: "revision", submittedAt: "2026-02-18", facultyComment: "Add confusion matrix and per-class F1.", attachments: ["confusion.png"] },
  { id: "S4", week: 4, title: "Frontend prototype", summary: "Built upload + result UI in React.", deploy: "vercel.app/team-proj", status: "pending", submittedAt: "2026-02-25", attachments: ["ui-shot.png", "demo.mp4"] },
];

// ── Batches ──
export const BATCHES: Batch[] = [
  { id: "B1", name: "CSE-A 2026", students: 12, active: 11, avgProgress: 72, pendingReviews: 3 },
  { id: "B2", name: "CSE-B 2026", students: 10, active: 8, avgProgress: 64, pendingReviews: 5 },
  { id: "B3", name: "AIML 2026", students: 14, active: 14, avgProgress: 81, pendingReviews: 2 },
  { id: "B4", name: "ECE 2026", students: 9, active: 6, avgProgress: 48, pendingReviews: 7 },
  { id: "B5", name: "IT-A 2026", students: 11, active: 10, avgProgress: 70, pendingReviews: 1 },
  { id: "B6", name: "IT-B 2026", students: 10, active: 7, avgProgress: 55, pendingReviews: 4 },
  { id: "B7", name: "DS 2026", students: 8, active: 8, avgProgress: 88, pendingReviews: 0 },
];

// ── Teams ──
export const TEAMS: TeamRow[] = [
  { id: "T1", team: "Team Falcon", batch: "CSE-A", problem: "Crop Disease Detection", week: 4, progress: 78, paper: 55, lastSubmission: "2 days ago", status: "On track" },
  { id: "T2", team: "Team Nova", batch: "CSE-A", problem: "Fraud Detection Engine", week: 3, progress: 62, paper: 40, lastSubmission: "5 days ago", status: "Delayed" },
  { id: "T3", team: "Team Vega", batch: "AIML", problem: "Skin Cancer Classifier", week: 4, progress: 84, paper: 70, lastSubmission: "1 day ago", status: "On track" },
  { id: "T4", team: "Team Orion", batch: "ECE", problem: "IoT Air Quality", week: 2, progress: 30, paper: 12, lastSubmission: "12 days ago", status: "Inactive" },
  { id: "T5", team: "Team Lyra", batch: "IT-A", problem: "AI Tutor", week: 4, progress: 70, paper: 60, lastSubmission: "3 days ago", status: "On track" },
  { id: "T6", team: "Team Atlas", batch: "DS", problem: "Stock Sentiment", week: 4, progress: 90, paper: 80, lastSubmission: "today", status: "On track" },
  { id: "T7", team: "Team Pulse", batch: "IT-B", problem: "Phishing Classifier", week: 3, progress: 45, paper: 25, lastSubmission: "8 days ago", status: "At risk" },
];

// ── Weekly chart data ──
export const WEEKLY_CHART = [
  { week: "W1", submissions: 42, approved: 38 },
  { week: "W2", submissions: 40, approved: 33 },
  { week: "W3", submissions: 38, approved: 30 },
  { week: "W4", submissions: 36, approved: 27 },
  { week: "W5", submissions: 31, approved: 22 },
  { week: "W6", submissions: 28, approved: 21 },
];

// ── Students ──
function academicYearFor(sem: number): string {
  const startYear = 2021 + Math.floor((sem - 1) / 2);
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
function genAttendance(base: number, drift: number) {
  return months
    .map((m, i) => ({
      m,
      pct: Math.max(35, Math.min(100, Math.round(base + Math.sin(i) * drift + (i - 4) * 1.2))),
    }))
    .map((x) => ({ month: x.m, pct: x.pct }));
}

const STUDENT_SEED: Partial<Student>[] = [
  { name: "Aarav Sharma", roll: "21CSE001", dept: "CSE", section: "A", batch: "2026", cgpa: 8.6, attendanceOverall: 86, missedSubmissions: 0, inactiveDays: 1, project: "Crop Disease Detection", projectStatus: "On track", paperStatus: "Drafting", paperProgress: 58, skills: ["Python", "React", "TensorFlow"], interests: ["AI/ML", "Agritech"], certifications: ["AWS Cloud Practitioner"], internship: "Ongoing" },
  { name: "Diya Patel", roll: "21CSE014", dept: "CSE", section: "A", batch: "2026", cgpa: 9.1, attendanceOverall: 92, missedSubmissions: 0, inactiveDays: 0, project: "Crop Disease Detection", projectStatus: "On track", paperStatus: "Under review", paperProgress: 72, skills: ["Python", "PyTorch", "Figma"], interests: ["AI/ML", "HCI"], certifications: ["DeepLearning.AI Specialization"], internship: "Completed" },
  { name: "Rahul Verma", roll: "21CSE022", dept: "CSE", section: "B", batch: "2026", cgpa: 6.2, attendanceOverall: 61, missedSubmissions: 3, inactiveDays: 14, project: "Fraud Detection Engine", projectStatus: "Inactive", paperStatus: "Not started", paperProgress: 8, skills: ["Java"], interests: ["Fintech"], certifications: [], internship: "None" },
  { name: "Sneha Iyer", roll: "21AIML031", dept: "AIML", section: "A", batch: "2026", cgpa: 8.9, attendanceOverall: 88, missedSubmissions: 1, inactiveDays: 2, project: "Skin Cancer Classifier", projectStatus: "On track", paperStatus: "Drafting", paperProgress: 65, skills: ["Python", "Keras", "OpenCV"], interests: ["Healthcare AI"], certifications: ["Google ML Crash Course"], internship: "Ongoing" },
  { name: "Karan Singh", roll: "21ECE044", dept: "ECE", section: "A", batch: "2026", cgpa: 7.0, attendanceOverall: 70, missedSubmissions: 2, inactiveDays: 8, project: "IoT Air Quality", projectStatus: "Delayed", paperStatus: "Drafting", paperProgress: 28, skills: ["Arduino", "C++"], interests: ["IoT"], certifications: [], internship: "None" },
  { name: "Meera Nair", roll: "21IT017", dept: "IT", section: "A", batch: "2026", cgpa: 8.2, attendanceOverall: 81, missedSubmissions: 0, inactiveDays: 3, project: "AI Tutor", projectStatus: "On track", paperStatus: "Drafting", paperProgress: 52, skills: ["JavaScript", "Node", "LangChain"], interests: ["EdTech", "AI/ML"], certifications: ["MongoDB Developer"], internship: "Completed" },
  { name: "Aditya Rao", roll: "21IT028", dept: "IT", section: "B", batch: "2026", cgpa: 5.4, attendanceOverall: 58, missedSubmissions: 4, inactiveDays: 18, project: "Phishing Classifier", projectStatus: "At risk", paperStatus: "Not started", paperProgress: 4, skills: ["Python"], interests: ["Cybersecurity"], certifications: [], internship: "None" },
  { name: "Riya Kapoor", roll: "21DS009", dept: "DS", section: "A", batch: "2026", cgpa: 9.4, attendanceOverall: 95, missedSubmissions: 0, inactiveDays: 0, project: "Stock Sentiment", projectStatus: "On track", paperStatus: "Under review", paperProgress: 81, skills: ["Python", "Pandas", "NLP"], interests: ["Fintech", "NLP"], certifications: ["Kaggle Expert"], internship: "Ongoing" },
  { name: "Vivek Joshi", roll: "21CSE036", dept: "CSE", section: "A", batch: "2026", cgpa: 7.6, attendanceOverall: 76, missedSubmissions: 1, inactiveDays: 4, project: "Crop Disease Detection", projectStatus: "On track", paperStatus: "Drafting", paperProgress: 45, skills: ["Python", "FastAPI"], interests: ["AI/ML"], certifications: ["Postman API"], internship: "Completed" },
  { name: "Tanvi Desai", roll: "21AIML042", dept: "AIML", section: "A", batch: "2026", cgpa: 6.8, attendanceOverall: 64, missedSubmissions: 2, inactiveDays: 11, project: "Skin Cancer Classifier", projectStatus: "Delayed", paperStatus: "Drafting", paperProgress: 22, skills: ["Python"], interests: ["Healthcare"], certifications: [], internship: "None" },
];

const BACKLOG_BANK_RAW: Backlog[][] = [
  [],
  [],
  [
    { subject: "Discrete Mathematics", code: "MA204", semester: 3, attempts: 2, status: "Pending", internal: 14, external: 18 },
    { subject: "Operating Systems", code: "CS305", semester: 5, attempts: 1, status: "Pending", internal: 12, external: 22 },
    { subject: "Database Systems", code: "CS306", semester: 5, attempts: 2, status: "Cleared", internal: 18, external: 23, dateCleared: "2025-08-12" },
  ],
  [{ subject: "Probability & Statistics", code: "MA305", semester: 5, attempts: 1, status: "Cleared", internal: 22, external: 30, dateCleared: "2025-07-04" }],
  [
    { subject: "Signals & Systems", code: "EC301", semester: 5, attempts: 1, status: "Pending", internal: 15, external: 20 },
    { subject: "Engineering Math III", code: "MA301", semester: 5, attempts: 2, status: "Pending", internal: 11, external: 17 },
  ],
  [],
  [
    { subject: "Computer Networks", code: "CS404", semester: 6, attempts: 2, status: "Pending", internal: 13, external: 19 },
    { subject: "Theory of Computation", code: "CS403", semester: 6, attempts: 1, status: "Pending", internal: 10, external: 16 },
    { subject: "Software Engineering", code: "CS402", semester: 6, attempts: 3, status: "Pending", internal: 9, external: 14 },
    { subject: "Operating Systems", code: "CS305", semester: 5, attempts: 2, status: "Pending", internal: 12, external: 18 },
  ],
  [],
  [{ subject: "Compiler Design", code: "CS502", semester: 7, attempts: 1, status: "Cleared", internal: 19, external: 29, dateCleared: "2026-01-18" }],
  [
    { subject: "Machine Learning", code: "AI301", semester: 5, attempts: 1, status: "Pending", internal: 14, external: 21 },
    { subject: "Linear Algebra", code: "MA201", semester: 3, attempts: 2, status: "Pending", internal: 10, external: 19 },
  ],
];

const BACKLOG_BANK: Backlog[][] = BACKLOG_BANK_RAW.map((arr) =>
  arr.map((b) => {
    const total = (b.internal ?? 0) + (b.external ?? 0);
    return { ...b, total, marks: b.marks ?? total, academicYear: academicYearFor(b.semester) };
  }),
);

const TIMELINE_BANK: AcademicEvent[][] = STUDENT_SEED.map((s, i) => [
  { date: "2026-05-12", type: "submission", label: `Week 4 ${s.project} update submitted`, detail: "Awaiting faculty review" },
  { date: "2026-05-10", type: "attendance", label: `Attendance updated: ${s.attendanceOverall}%`, detail: "Auto-synced from ERP" },
  { date: "2026-05-08", type: "comment", label: "Faculty: clarify dataset size in intro", detail: "Dr. Mehta" },
  { date: "2026-05-05", type: "paper", label: `IEEE paper at ${s.paperProgress}%`, detail: "Methodology section drafted" },
  { date: "2026-04-28", type: "meeting", label: "Mentor meeting attended", detail: "30-min sync with mentor" },
  { date: "2026-04-20", type: i % 3 === 0 ? "backlog" : "submission", label: i % 3 === 0 ? "Backlog flagged" : "Week 2 approved", detail: i % 3 === 0 ? "Pending re-exam" : "Good baseline" },
]);

export const STUDENTS: Student[] = STUDENT_SEED.map((s, i) => {
  const overall = s.attendanceOverall as number;
  return {
    id: `ST-${i + 1}`,
    name: s.name as string,
    roll: s.roll as string,
    dept: s.dept as string,
    section: s.section as string,
    batch: s.batch as string,
    year: "IV",
    email: `${(s.name as string).split(" ")[0].toLowerCase()}@college.edu`,
    phone: `+91 9${(i + 1).toString().padStart(2, "0")}5432100`,
    parentPhone: `+91 9${(i + 1).toString().padStart(2, "0")}1234567`,
    address: ["Bengaluru, KA", "Pune, MH", "Hyderabad, TS", "Chennai, TN", "Delhi"][i % 5],
    dob: ["2003-04-12", "2003-08-22", "2003-01-17", "2003-11-03", "2003-06-09"][i % 5],
    cgpa: s.cgpa as number,
    semester: 7,
    skills: (s.skills as string[]) || [],
    interests: (s.interests as string[]) || [],
    certifications: (s.certifications as string[]) || [],
    internship: (s.internship as Student["internship"]) || "None",
    mentor: "Dr. Mehta",
    team: ["Team Falcon", "Team Falcon", "Team Nova", "Team Vega", "Team Orion", "Team Lyra", "Team Pulse", "Team Atlas", "Team Falcon", "Team Vega"][i],
    project: s.project as string,
    projectStatus: s.projectStatus as Student["projectStatus"],
    paperStatus: s.paperStatus as Student["paperStatus"],
    attendance: genAttendance(overall, 6),
    attendanceOverall: overall,
    backlogs: BACKLOG_BANK[i] || [],
    timeline: TIMELINE_BANK[i],
    missedSubmissions: s.missedSubmissions as number,
    inactiveDays: s.inactiveDays as number,
    paperProgress: s.paperProgress as number,
  };
});
