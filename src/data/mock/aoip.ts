import type {
  FacultyDashboardData,
  ProblemMarketData,
  ProjectHealthData,
  ProjectHealthTeam,
  ReviewQueueData,
  StudentDashboardData,
} from "@/types/aoip";

export const studentDashboardData: StudentDashboardData = {
  welcome: {
    title: "Good evening, Aarav.",
    subtitle:
      "Your academic operating system is holding momentum across research, execution, and evaluation.",
    project: "Adaptive Research Copilot for IEEE-aligned Student Teams",
    cohort: "CSE Innovation Cell · Spring 2026",
    userId: "stu-mock-1",
  },
  stats: [
    {
      label: "Execution score",
      value: "84/100",
      detail: "Driven by strong weekly submission quality and fast review closure.",
      tone: "positive",
    },
    {
      label: "Weekly cadence",
      value: "9 weeks",
      detail: "Continuous delivery streak with one revision cycle absorbed cleanly.",
    },
    {
      label: "Open mentor loops",
      value: "3",
      detail: "Feedback items still waiting on research evidence or paper updates.",
      tone: "warning",
    },
    {
      label: "Viva readiness",
      value: "76%",
      detail: "Strong product story, with methodology defense still improving.",
    },
  ],
  progressTrackers: [
    {
      id: "phase-1",
      phase: "Problem framing and literature synthesis",
      owner: "Research pod",
      progress: 88,
      note: "Novelty narrative is stable and aligned with mentor expectations.",
      status: "Completed",
    },
    {
      id: "phase-2",
      phase: "Benchmark experimentation",
      owner: "Modeling pod",
      progress: 73,
      note: "Comparative runs are landing, but error analysis still needs depth.",
      status: "Active",
    },
    {
      id: "phase-3",
      phase: "Workflow product surface",
      owner: "Frontend pod",
      progress: 81,
      note: "Faculty review pathways are production-ready for internal pilot use.",
      status: "Active",
    },
    {
      id: "phase-4",
      phase: "Publication packaging",
      owner: "Paper pod",
      progress: 61,
      note: "Results discussion and appendix formatting remain in queue.",
      status: "Queued",
    },
  ],
  submissions: [
    {
      id: "submission-1",
      title: "Week 9 research synthesis",
      status: "Awaiting review",
      dueLabel: "Submitted 3 hours ago · Awaiting faculty review",
      progress: 100,
      note: "Included updated gap matrix, benchmark summary, and revised experiment notes.",
    },
    {
      id: "submission-2",
      title: "Week 10 evidence package",
      status: "Ready to submit",
      dueLabel: "Due Friday · 2 days remaining",
      progress: 74,
      note: "Need final screenshots, ablation summary, and review-ready README cleanup.",
    },
    {
      id: "submission-3",
      title: "Final rehearsal checkpoint",
      status: "Needs revision",
      dueLabel: "Faculty asked for a tighter viva narrative",
      progress: 58,
      note: "Mock-viva notes recommend stronger articulation of research tradeoffs and evaluation limits.",
    },
  ],
  deadlines: [
    {
      id: "deadline-1",
      title: "Benchmark appendix lock",
      dueLabel: "Tomorrow · 6:00 PM",
      owner: "Paper pod",
      priority: "High",
    },
    {
      id: "deadline-2",
      title: "Faculty review sync",
      dueLabel: "Thursday · 11:30 AM",
      owner: "Mentor lane",
      priority: "Medium",
    },
    {
      id: "deadline-3",
      title: "Viva drill #4",
      dueLabel: "Friday · 4:00 PM",
      owner: "Team lead",
      priority: "High",
    },
    {
      id: "deadline-4",
      title: "IEEE section freeze",
      dueLabel: "Monday · 8:00 PM",
      owner: "Publication track",
      priority: "Medium",
    },
  ],
  scorecards: [
    {
      title: "Performance score",
      value: "84",
      progress: 84,
      detail: "Submission quality and review closure are driving the current uplift.",
    },
    {
      title: "Research progress",
      value: "68%",
      progress: 68,
      detail: "Literature synthesis is healthy; experiment narrative still needs more rigor.",
    },
    {
      title: "Viva readiness",
      value: "76%",
      progress: 76,
      detail: "Product clarity is strong, but methodological defense needs more concise phrasing.",
    },
  ],
  achievements: [
    {
      id: "achievement-1",
      title: "Internal paper gate passed",
      detail: "Abstract, novelty framing, and reference hygiene cleared the first faculty review.",
      impact: "Publication track unlocked",
    },
    {
      id: "achievement-2",
      title: "Demo lane stabilized",
      detail: "Faculty reviewer flow now supports quick grading and structured feedback threads.",
      impact: "Execution maturity signal",
    },
    {
      id: "achievement-3",
      title: "Innovation showcase shortlist",
      detail: "The team was shortlisted for the department’s annual research systems showcase.",
      impact: "External visibility boost",
    },
  ],
  feedback: [
    {
      id: "feedback-1",
      faculty: "Dr. Meera Raman",
      note: "The dashboard story is strong. Tighten the benchmark interpretation so the paper and viva narrative stay aligned.",
      area: "Research quality",
      timestamp: "2 hours ago",
    },
    {
      id: "feedback-2",
      faculty: "Prof. Arjun Sen",
      note: "Your review workflow is operationally clean. Show one stronger example of how risk scoring changes faculty behavior.",
      area: "Product framing",
      timestamp: "Yesterday",
    },
    {
      id: "feedback-3",
      faculty: "Dr. Meera Raman",
      note: "Appendix formatting is improving, but the error-analysis section still reads too narrowly.",
      area: "Paper packaging",
      timestamp: "This week",
    },
  ],
  activity: [
    {
      id: "activity-1",
      title: "Week 9 packet pushed into review queue",
      detail: "Submission now includes updated literature grid, runbook notes, and demo clips.",
      timestamp: "Today · 5:15 PM",
      tag: "Submission",
      tone: "positive",
    },
    {
      id: "activity-2",
      title: "Team standup closed with one blocker",
      detail: "Benchmark reproducibility issue escalated to faculty before the next experiment window.",
      timestamp: "Today · 9:00 AM",
      tag: "Execution",
      tone: "warning",
    },
    {
      id: "activity-3",
      title: "Paper section comments resolved",
      detail: "Reference hygiene and structure notes were closed for the abstract and intro blocks.",
      timestamp: "Yesterday",
      tag: "Paper",
    },
    {
      id: "activity-4",
      title: "Mock viva recorded",
      detail: "The session flagged weak responses around baseline tradeoffs and deployment assumptions.",
      timestamp: "Yesterday",
      tag: "Evaluation",
    },
    {
      id: "activity-5",
      title: "Faculty comment acknowledged",
      detail: "Mentor requested stronger evidence on intervention outcomes in the AOIP workflow.",
      timestamp: "This week",
      tag: "Review",
    },
  ],
  researchSeries: [
    { week: "W5", literature: 48, experimentation: 32, writing: 26 },
    { week: "W6", literature: 57, experimentation: 40, writing: 34 },
    { week: "W7", literature: 64, experimentation: 52, writing: 41 },
    { week: "W8", literature: 71, experimentation: 61, writing: 55 },
    { week: "W9", literature: 79, experimentation: 68, writing: 62 },
  ],
  team: null,
  teamMembers: [],
};

export const facultyDashboardData: FacultyDashboardData = {
  header: {
    title: "Faculty command center",
    subtitle:
      "Operational visibility across execution velocity, review throughput, and cohort risk in one dense control surface.",
  },
  stats: [
    {
      label: "Active teams",
      value: "18",
      detail: "Current capstone and research teams shipping inside Syntra.",
      tone: "positive",
    },
    {
      label: "Pending reviews",
      value: "14",
      detail: "Submission packets waiting for manual faculty attention.",
      tone: "warning",
    },
    {
      label: "At-risk projects",
      value: "5",
      detail: "Execution drift, missed submissions, or academic pressure signals detected.",
      tone: "critical",
    },
    {
      label: "Mean performance",
      value: "78/100",
      detail: "Composite academic execution score across the active cohort.",
    },
  ],
  submissionSeries: [
    { week: "W4", submitted: 21, reviewed: 16, escalated: 3 },
    { week: "W5", submitted: 24, reviewed: 18, escalated: 4 },
    { week: "W6", submitted: 22, reviewed: 17, escalated: 2 },
    { week: "W7", submitted: 27, reviewed: 22, escalated: 5 },
    { week: "W8", submitted: 25, reviewed: 20, escalated: 3 },
    { week: "W9", submitted: 28, reviewed: 24, escalated: 4 },
  ],
  performanceSeries: [
    { month: "Jan", performance: 68, target: 72 },
    { month: "Feb", performance: 71, target: 74 },
    { month: "Mar", performance: 73, target: 76 },
    { month: "Apr", performance: 75, target: 78 },
    { month: "May", performance: 78, target: 80 },
    { month: "Jun", performance: 81, target: 82 },
  ],
  backlogSeries: [
    { week: "W4", open: 17, cleared: 6 },
    { week: "W5", open: 18, cleared: 4 },
    { week: "W6", open: 16, cleared: 7 },
    { week: "W7", open: 15, cleared: 8 },
    { week: "W8", open: 14, cleared: 9 },
    { week: "W9", open: 12, cleared: 10 },
  ],
  quickReview: [
    {
      id: "quick-1",
      title: "Close low-risk literature reviews",
      detail: "Seven teams are waiting on short evidence checks rather than full commentary.",
      actionLabel: "Open queue",
    },
    {
      id: "quick-2",
      title: "Escalate benchmark ambiguity",
      detail: "Two teams need manual review on experiment validity before they proceed.",
      actionLabel: "Review now",
    },
    {
      id: "quick-3",
      title: "Sync final-eval risk board",
      detail: "Refresh viva readiness and backlog pressure before the next faculty meeting.",
      actionLabel: "Refresh board",
    },
  ],
  healthIndicators: [
    {
      title: "Project health coverage",
      value: "82%",
      progress: 82,
      detail: "Most teams are visible through weekly submissions, contribution data, and mentor notes.",
    },
    {
      title: "Review turnaround",
      value: "1.8 days",
      progress: 74,
      detail: "Healthy overall, but the tail of the queue is aging faster than desired.",
    },
    {
      title: "At-risk recovery",
      value: "64%",
      progress: 64,
      detail: "Interventions are working, but backlog-heavy teams still need tighter follow-up.",
    },
  ],
  topTeams: [
    { id: "team-1", team: "Team Falcon", domain: "AI/ML", progress: 88, risk: "Low", score: "91/100" },
    { id: "team-2", team: "Team Lyra", domain: "EdTech", progress: 84, risk: "Low", score: "87/100" },
    { id: "team-3", team: "Team Atlas", domain: "Fintech", progress: 81, risk: "Medium", score: "85/100" },
    { id: "team-4", team: "Team Vega", domain: "Healthcare", progress: 79, risk: "Medium", score: "82/100" },
    { id: "team-5", team: "Team Pulse", domain: "Cybersecurity", progress: 56, risk: "High", score: "68/100" },
  ],
  activity: [
    {
      id: "faculty-activity-1",
      title: "SLA risk queue trimmed",
      detail: "Four pending reviews were cleared before the next escalation threshold.",
      timestamp: "Today · 6:10 PM",
      tag: "Review",
      tone: "positive",
    },
    {
      id: "faculty-activity-2",
      title: "High-risk team flagged",
      detail: "Missed submission + low contribution density pushed Team Pulse into the alert band.",
      timestamp: "Today · 1:40 PM",
      tag: "Risk",
      tone: "critical",
    },
    {
      id: "faculty-activity-3",
      title: "Backlog pressure eased",
      detail: "Two students cleared pending subjects, reducing one cohort’s overload score.",
      timestamp: "Yesterday",
      tag: "Academic",
      tone: "positive",
    },
    {
      id: "faculty-activity-4",
      title: "Faculty checkpoint completed",
      detail: "Mentors aligned on final-evaluation scoring expectations for the next sprint window.",
      timestamp: "Yesterday",
      tag: "Ops",
    },
    {
      id: "faculty-activity-5",
      title: "New industry problem approved",
      detail: "A manufacturing automation brief entered the problem library with mentor sponsorship.",
      timestamp: "This week",
      tag: "Library",
    },
  ],
  studentRiskHeatmap: [
    { name: "Aarav Sharma", batch: "CSE", rollNumber: "21CSE001", attendance: 86, risk: "Low" },
    { name: "Diya Patel", batch: "CSE", rollNumber: "21CSE014", attendance: 92, risk: "Low" },
    { name: "Rahul Verma", batch: "CSE", rollNumber: "21CSE022", attendance: 61, risk: "Critical" },
    { name: "Sneha Iyer", batch: "AIML", rollNumber: "21AIML031", attendance: 88, risk: "Low" },
    { name: "Karan Singh", batch: "ECE", rollNumber: "21ECE044", attendance: 70, risk: "High" },
    { name: "Meera Nair", batch: "IT", rollNumber: "21IT017", attendance: 81, risk: "Low" },
    { name: "Aditya Rao", batch: "IT", rollNumber: "21IT028", attendance: 58, risk: "Critical" },
    { name: "Riya Kapoor", batch: "DS", rollNumber: "21DS009", attendance: 95, risk: "Low" },
    { name: "Vivek Joshi", batch: "CSE", rollNumber: "21CSE035", attendance: 76, risk: "Low" },
    { name: "Tanvi Desai", batch: "AIML", rollNumber: "21AIML042", attendance: 64, risk: "Critical" },
  ],
  batchesSnapshot: [
    { batch: "CSE-A 2026", activeStudents: 11, totalStudents: 12, progress: 78, pendingReviews: 3 },
    { batch: "CSE-B 2026", activeStudents: 8, totalStudents: 10, progress: 64, pendingReviews: 5 },
    { batch: "AIML 2026", activeStudents: 14, totalStudents: 14, progress: 81, pendingReviews: 2 },
    { batch: "ECE 2026", activeStudents: 6, totalStudents: 9, progress: 48, pendingReviews: 0 },
    { batch: "IT-A 2026", activeStudents: 10, totalStudents: 11, progress: 70, pendingReviews: 1 },
    { batch: "IT-B 2026", activeStudents: 7, totalStudents: 10, progress: 59, pendingReviews: 4 },
    { batch: "DS 2026", activeStudents: 8, totalStudents: 8, progress: 88, pendingReviews: 0 },
  ],
  needsAttention: [
    { team: "Team Orion", batch: "ECE", status: "Inactive", detail: "Last submission 12 days ago" },
    { team: "Team Pulse", batch: "IT-B", status: "At risk", detail: "Last submission 8 days ago" },
  ],
  submissionsByBatch: [
    { batch: "CSE-A 2026", submitted: 11, pending: 3 },
    { batch: "CSE-B 2026", submitted: 8, pending: 5 },
    { batch: "AIML 2026", submitted: 14, pending: 2 },
    { batch: "ECE 2026", submitted: 6, pending: 7 },
    { batch: "IT-A 2026", submitted: 10, pending: 1 },
    { batch: "IT-B 2026", submitted: 7, pending: 4 },
    { batch: "DS 2026", submitted: 8, pending: 0 },
  ],
};

export const problemMarketData: ProblemMarketData = {
  stats: [
    { label: "Open problems", value: "54", detail: "Validated opportunities across active research and product domains." },
    { label: "Faculty-backed", value: "21", detail: "Problems with direct mentor sponsorship or departmental demand.", tone: "positive" },
    { label: "Industry briefs", value: "13", detail: "External-context problems carrying stronger real-world constraints." },
    { label: "Saved by cohort", value: "32", detail: "Problems shortlisted by currently active student teams." },
  ],
  categories: ["All", "AI/ML", "CSE", "IoT", "Healthcare", "Cybersecurity", "Fintech", "Education"],
  trending: [
    { id: "trend-1", title: "Agentic workflow intelligence", momentum: "High save rate across AI/ML teams" },
    { id: "trend-2", title: "Low-cost healthcare diagnostics", momentum: "Faculty recommendation growth +2 this week" },
    { id: "trend-3", title: "Academic risk scoring", momentum: "Top adoption among system-design heavy teams" },
    { id: "trend-4", title: "Industrial IoT monitoring", momentum: "Strong industry pull from lab-sponsored briefs" },
  ],
  problems: [
    {
      id: "problem-1",
      title: "Adaptive Academic Risk Scoring for Project Teams",
      domain: "AI/ML",
      category: "Education",
      difficulty: "Advanced",
      source: "Faculty",
      fitScore: 94,
      trend: "Most saved this month",
      summary:
        "Design a risk engine that fuses academic backlogs, submission cadence, and contribution variance into an intervention score for faculty mentors.",
      tags: ["Analytics", "Workflow", "Mentor tooling"],
      recommendedBy: "Dr. Meera Raman",
      saved: true,
    },
    {
      id: "problem-2",
      title: "Explainable Skin Lesion Screening Assistant",
      domain: "Healthcare",
      category: "AI/ML",
      difficulty: "Advanced",
      source: "Research Lab",
      fitScore: 89,
      trend: "High faculty interest",
      summary:
        "Build an explainable image-classification workflow with paper-ready evidence, audit trails, and clinician-facing reporting.",
      tags: ["Vision", "XAI", "Paper-first"],
      recommendedBy: "BioAI Lab",
      saved: false,
    },
    {
      id: "problem-3",
      title: "Smart Submission Triage for Capstone Reviews",
      domain: "CSE",
      category: "Workflow Systems",
      difficulty: "Intermediate",
      source: "Faculty",
      fitScore: 91,
      trend: "Operational favorite",
      summary:
        "Create a fast review queue that classifies weekly submission risk, evidence quality, and grading urgency for faculty.",
      tags: ["Ops", "Review flow", "SaaS UX"],
      recommendedBy: "Prof. Arjun Sen",
      saved: true,
    },
    {
      id: "problem-4",
      title: "IoT Air Quality Sentinel for Campus Microzones",
      domain: "IoT",
      category: "Smart Infrastructure",
      difficulty: "Intermediate",
      source: "Industry",
      fitScore: 83,
      trend: "Pilot-ready",
      summary:
        "Build a campus-scale low-power monitoring system with anomaly detection, alerting, and reliability constraints for academic deployment.",
      tags: ["Sensors", "Telemetry", "Edge"],
      recommendedBy: "Urban Systems Partner",
      saved: false,
    },
    {
      id: "problem-5",
      title: "Financial News Sentiment Copilot for Student Investors",
      domain: "Fintech",
      category: "NLP",
      difficulty: "Beginner",
      source: "Industry",
      fitScore: 75,
      trend: "Beginner friendly",
      summary:
        "Create an opinionated research workflow that translates financial news into explainable sentiment clusters and risk commentary.",
      tags: ["NLP", "Dashboards", "Signals"],
      recommendedBy: "Fintech Studio",
      saved: false,
    },
    {
      id: "problem-6",
      title: "Mentor-Aware Problem Discovery Engine",
      domain: "AI/ML",
      category: "Education",
      difficulty: "Advanced",
      source: "Faculty",
      fitScore: 87,
      trend: "Rising in research cohorts",
      summary:
        "Recommend project ideas by combining mentor expertise, cohort strengths, industry briefs, and publication whitespace.",
      tags: ["Recommendation", "Graph signals", "Discovery"],
      recommendedBy: "Innovation Cell",
      saved: true,
    },
  ],
};

export const reviewQueueData: ReviewQueueData = {
  stats: [
    { label: "Pending", value: "14", detail: "Submissions waiting for faculty action this cycle.", tone: "warning" },
    { label: "SLA risk", value: "4", detail: "Items nearing review delay thresholds.", tone: "critical" },
    { label: "Reviewed today", value: "9", detail: "Queue items cleared by faculty in the last 24 hours.", tone: "positive" },
    { label: "Median turnaround", value: "1.8 days", detail: "Current median review-to-response speed." },
  ],
  analytics: [
    { week: "W5", pending: 12, completed: 16, overdue: 2 },
    { week: "W6", pending: 15, completed: 18, overdue: 3 },
    { week: "W7", pending: 13, completed: 20, overdue: 2 },
    { week: "W8", pending: 17, completed: 19, overdue: 4 },
    { week: "W9", pending: 14, completed: 22, overdue: 4 },
  ],
  queue: [
    {
      id: "queue-1",
      team: "Team Falcon",
      batch: "CSE-A",
      project: "Adaptive Academic Risk Scoring",
      submissionTitle: "Week 9 benchmark narrative",
      submittedAt: "Today · 3:10 PM",
      status: "Pending",
      urgency: "High",
      preview: "Includes ablation results and a revised intervention rubric, but still lacks failure-case commentary.",
      rubric: ["Research clarity", "Evidence quality", "Mentor response"],
      scoreHint: "Likely 8.5/10 after reviewer notes",
    },
    {
      id: "queue-2",
      team: "Team Pulse",
      batch: "IT-B",
      project: "Phishing Classifier Ops Console",
      submissionTitle: "Week 8 revision pack",
      submittedAt: "Yesterday · 6:20 PM",
      status: "Re-review",
      urgency: "Critical",
      preview: "Team addressed the UI defects, but security evaluation evidence remains thin and time-sensitive.",
      rubric: ["Risk response", "Product readiness", "Security"],
      scoreHint: "Manual grading recommended",
    },
    {
      id: "queue-3",
      team: "Team Lyra",
      batch: "IT-A",
      project: "AI Tutor Workflow",
      submissionTitle: "Faculty pilot analytics update",
      submittedAt: "Yesterday · 1:00 PM",
      status: "Pending",
      urgency: "Medium",
      preview: "Strong product progress and classroom framing, with one open ask around usage instrumentation.",
      rubric: ["Adoption evidence", "Usability", "Iteration quality"],
      scoreHint: "Fast-path approval candidate",
    },
    {
      id: "queue-4",
      team: "Team Orion",
      batch: "ECE",
      project: "Campus Air Sentinel",
      submissionTitle: "Week 9 hardware health report",
      submittedAt: "2 days ago",
      status: "SLA risk",
      urgency: "High",
      preview: "Hardware integration slipped and the team needs explicit mentor correction on validation scope.",
      rubric: ["Reliability", "Execution", "Mentor escalation"],
      scoreHint: "Needs actionable review comments",
    },
    {
      id: "queue-5",
      team: "Team Vega",
      batch: "AIML",
      project: "Explainable Screening Assistant",
      submissionTitle: "Literature + method sync",
      submittedAt: "2 days ago",
      status: "Pending",
      urgency: "Low",
      preview: "Research packet is organized and publication-minded, but requires one more citation-freshness pass.",
      rubric: ["Novelty", "Methodology", "Publication quality"],
      scoreHint: "High scoring if references are tightened",
    },
    {
      id: "queue-6",
      team: "Team Atlas",
      batch: "DS",
      project: "Market Signal Copilot",
      submissionTitle: "Week 9 experiment log",
      submittedAt: "3 days ago",
      status: "SLA risk",
      urgency: "Medium",
      preview: "Strong analysis, but reviewer notes on model assumptions are still unresolved.",
      rubric: ["Experiment rigor", "Narrative", "Revision closure"],
      scoreHint: "Needs comment-driven re-review",
    },
  ],
  templates: [
    "Approve with benchmark clarification",
    "Request stronger evidence before final grade",
    "Escalate to mentor sync",
    "Fast-pass for low-risk progress update",
  ],
};

type MockHealthTeamInput = {
  id: string;
  team: string;
  project: string;
  mentor: string;
  completion: number;
  riskScore: number;
  backlogItems: number;
  inactiveDays: number;
  missedSubmissions: number;
  velocity: string;
  alerts: string[];
  contributionHeatmap: number[];
  problemStatement?: string;
  batch?: string;
  riskLayer?: ProjectHealthTeam["riskLayer"];
  trend?: ProjectHealthTeam["trend"];
};

function mockRiskLayer(input: MockHealthTeamInput): ProjectHealthTeam["riskLayer"] {
  if (input.inactiveDays >= 14) {
    return "Ghost Team";
  }

  if (input.riskScore >= 75) {
    return "Critical";
  }

  if (input.riskScore >= 65) {
    return "At Risk";
  }

  if (input.riskScore >= 45) {
    return "Slipping";
  }

  if (input.completion >= 82) {
    return "Healthy";
  }

  return "Stable";
}

function createMockHealthTeam(input: MockHealthTeamInput): ProjectHealthTeam {
  const riskLayer = input.riskLayer ?? mockRiskLayer(input);
  const healthScore = Math.max(0, 100 - input.riskScore);
  const priorityScore = Math.min(
    100,
    input.riskScore + input.inactiveDays * 2 + input.missedSubmissions * 8 + input.backlogItems * 2,
  );
  const paperCompletionConfidence = Math.max(0, input.completion - input.missedSubmissions * 8);
  const technicalExecutionConfidence = Math.max(0, input.completion - input.backlogItems * 5);
  const completionConfidence = Math.max(0, 100 - input.riskScore + input.completion * 0.12);
  const trend =
    input.trend ??
    (input.riskScore >= 70
      ? "Declining slowly"
      : input.velocity === "Improving"
        ? "Improving rapidly"
        : input.velocity === "Stable" || input.velocity === "Strong"
          ? "Consistent execution"
          : "Stagnating");
  const toneSignals = {
    Healthy: "Healthy velocity",
    Stable: "Stable execution",
    Slipping: "Delayed but recoverable",
    "At Risk": "Intervention window is closing",
    Critical: "Critical intervention required",
    "Ghost Team": "Silent failure pattern detected",
    "Fake Progress": "Execution mismatch detected",
    "Research Blocked": "Research stagnation detected",
    "Mentor Dependent": "Approval bottleneck detected",
  } satisfies Record<ProjectHealthTeam["riskLayer"], string>;

  return {
    ...input,
    problemStatement:
      input.problemStatement ??
      "Faculty-reviewed engineering problem with weekly evidence, paper progress, and demo readiness signals.",
    batch: input.batch ?? "2026 CSE",
    healthScore,
    priorityScore,
    riskLayer,
    trend,
    momentum: input.riskScore >= 65 ? "-12% delivery velocity" : "+8% delivery velocity",
    aiLabel: toneSignals[riskLayer],
    sprintStatus: "S9 current sprint",
    deliveryRiskState:
      riskLayer === "Healthy" || riskLayer === "Stable"
        ? "Controlled delivery"
        : riskLayer === "Slipping"
          ? "Delayed but recoverable"
          : "Intervention required",
    completionConfidence,
    paperCompletionConfidence,
    vivaReadinessConfidence: Math.round(
      (completionConfidence + paperCompletionConfidence + technicalExecutionConfidence) / 3,
    ),
    technicalExecutionConfidence,
    mentorLoad: input.riskScore >= 70 ? "High" : input.riskScore >= 45 ? "Medium" : "Low",
    interventionUrgency:
      input.riskScore >= 70 ? "Immediate" : input.riskScore >= 45 ? "High" : "Monitor",
    currentMilestone: input.riskScore >= 65 ? "Recovery checkpoint" : "Final validation",
    deadlineLabel: input.riskScore >= 65 ? "Due in 2 days" : "Due in 9 days",
    detectedSignals:
      input.alerts.length > 0
        ? input.alerts
        : ["Consistent submissions across the current sprint window."],
    qualitySignals: [
      { label: "GitHub commit consistency", value: input.completion, detail: "Technical cadence inferred from evidence density." },
      { label: "Deployment uptime", value: technicalExecutionConfidence, detail: `${input.backlogItems} backlog items affect stability.` },
      { label: "Documentation maturity", value: paperCompletionConfidence, detail: "Paper and execution documentation coverage." },
      { label: "Research depth", value: paperCompletionConfidence, detail: "Literature and novelty progression." },
      { label: "Participation equality", value: Math.max(0, 100 - input.riskScore / 2), detail: "Contribution distribution across team members." },
      { label: "Sprint discipline", value: Math.max(0, 100 - input.missedSubmissions * 20), detail: "Weekly evidence reliability." },
      { label: "Testing evidence", value: technicalExecutionConfidence, detail: "Experiment and validation trace quality." },
      { label: "Demo readiness", value: input.completion, detail: "Final demo proof and readiness confidence." },
      { label: "Technical complexity", value: 78, detail: "Engineering depth and integration complexity." },
    ],
    executionTimeline: ["S5", "S6", "S7", "S8", "S9"].map((label, index) => {
      const base = (input.contributionHeatmap[index] ?? 3) * 18;

      return {
        label,
        sprintReliability: Math.min(100, base + 6),
        submissionReliability: Math.min(100, base + 12),
        reviewTurnaround: Math.min(100, base + 2),
        paperVelocity: Math.min(100, paperCompletionConfidence - 12 + index * 4),
        deploymentStability: Math.min(100, technicalExecutionConfidence - 10 + index * 3),
      };
    }),
  };
}

export const projectHealthData: ProjectHealthData = {
  stats: [
    { label: "Healthy teams", value: "11", detail: "Teams currently maintaining strong velocity and review hygiene.", tone: "positive" },
    { label: "Watchlist", value: "4", detail: "Teams with meaningful drift but still recoverable inside the current cycle.", tone: "warning" },
    { label: "Critical risk", value: "3", detail: "Intervention required due to inactivity, backlog pressure, or missed work.", tone: "critical" },
    { label: "Mean completion", value: "74%", detail: "Average project completion across active monitored teams." },
  ],
  executionPulse: {
    score: 68,
    state: "3 teams need intervention",
    summary: "Team Pulse is the highest operational risk because repeated delivery misses and imbalance are compounding.",
  },
  riskDistribution: [
    { label: "Healthy", count: 2 },
    { label: "Stable", count: 1 },
    { label: "Slipping", count: 0 },
    { label: "At Risk", count: 1 },
    { label: "Critical", count: 1 },
    { label: "Ghost Team", count: 0 },
    { label: "Fake Progress", count: 0 },
    { label: "Research Blocked", count: 0 },
    { label: "Mentor Dependent", count: 0 },
  ],
  aiSummary:
    "Team Pulse should be reviewed first. Critical queue items, contribution imbalance, and academic pressure indicate immediate mentor intervention.",
  velocitySeries: [
    { sprint: "S5", planned: 24, delivered: 20 },
    { sprint: "S6", planned: 26, delivered: 21 },
    { sprint: "S7", planned: 25, delivered: 22 },
    { sprint: "S8", planned: 27, delivered: 23 },
    { sprint: "S9", planned: 28, delivered: 24 },
  ],
  backlogSeries: [
    { sprint: "S5", open: 14, critical: 4 },
    { sprint: "S6", open: 13, critical: 4 },
    { sprint: "S7", open: 12, critical: 3 },
    { sprint: "S8", open: 11, critical: 3 },
    { sprint: "S9", open: 9, critical: 2 },
  ],
  alerts: [
    {
      id: "health-alert-1",
      title: "Team Pulse crossed critical risk band",
      detail: "Two missed submissions, contribution imbalance, and unresolved mentor notes triggered a high-priority intervention.",
      timestamp: "Today · 2:30 PM",
      tag: "Critical",
      tone: "critical",
    },
    {
      id: "health-alert-2",
      title: "Team Orion showing inactivity drift",
      detail: "Hardware blockers reduced weekly evidence and increased backlog pressure for the team.",
      timestamp: "Today · 10:15 AM",
      tag: "Watchlist",
      tone: "warning",
    },
    {
      id: "health-alert-3",
      title: "Team Falcon recovered after mentor intervention",
      detail: "Faster review closure and stronger benchmarking pulled the team back into the healthy band.",
      timestamp: "Yesterday",
      tag: "Recovery",
      tone: "positive",
    },
    {
      id: "health-alert-4",
      title: "Backlog pressure easing in DS cohort",
      detail: "Academic remediation improved bandwidth for two previously at-risk contributors.",
      timestamp: "This week",
      tag: "Academic",
      tone: "positive",
    },
  ],
  teams: [
    createMockHealthTeam({
      id: "health-team-1",
      team: "Team Falcon",
      project: "Adaptive Academic Risk Scoring",
      mentor: "Dr. Meera Raman",
      completion: 88,
      riskScore: 22,
      backlogItems: 1,
      inactiveDays: 1,
      missedSubmissions: 0,
      velocity: "Stable",
      alerts: ["Benchmark appendix still open"],
      contributionHeatmap: [3, 4, 4, 5, 4, 4, 5, 4, 4, 5],
    }),
    createMockHealthTeam({
      id: "health-team-2",
      team: "Team Pulse",
      project: "Phishing Classifier Ops Console",
      mentor: "Prof. Arjun Sen",
      completion: 56,
      riskScore: 81,
      backlogItems: 5,
      inactiveDays: 6,
      missedSubmissions: 2,
      velocity: "Declining",
      alerts: ["Critical queue item", "Contribution imbalance", "Academic pressure"],
      contributionHeatmap: [1, 2, 2, 1, 3, 1, 2, 1, 2, 1],
    }),
    createMockHealthTeam({
      id: "health-team-3",
      team: "Team Lyra",
      project: "AI Tutor Workflow",
      mentor: "Dr. Kavya Nandan",
      completion: 84,
      riskScore: 31,
      backlogItems: 0,
      inactiveDays: 1,
      missedSubmissions: 0,
      velocity: "Strong",
      alerts: ["Instrumentation refinement needed"],
      contributionHeatmap: [3, 4, 5, 4, 4, 5, 4, 4, 5, 4],
    }),
    createMockHealthTeam({
      id: "health-team-4",
      team: "Team Orion",
      project: "Campus Air Sentinel",
      mentor: "Dr. Anoop George",
      completion: 49,
      riskScore: 73,
      backlogItems: 3,
      inactiveDays: 5,
      missedSubmissions: 1,
      velocity: "Unstable",
      alerts: ["Hardware blocker unresolved", "Validation lag"],
      contributionHeatmap: [2, 2, 3, 2, 3, 2, 2, 3, 2, 2],
    }),
    createMockHealthTeam({
      id: "health-team-5",
      team: "Team Atlas",
      project: "Market Signal Copilot",
      mentor: "Dr. Meera Raman",
      completion: 81,
      riskScore: 38,
      backlogItems: 1,
      inactiveDays: 2,
      missedSubmissions: 0,
      velocity: "Improving",
      alerts: ["Review assumptions need cleanup"],
      contributionHeatmap: [4, 3, 4, 4, 5, 4, 4, 5, 4, 4],
    }),
  ],
};
