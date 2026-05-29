import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types/auth";

export type MetricTone = "neutral" | "positive" | "warning" | "critical";

export type AppShellUser = {
  name?: string | null;
  email: string;
  role: UserRole;
};

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  section: string;
  searchPlaceholder?: string;
  badge?: string;
};

export type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  detail: string;
  tone?: MetricTone;
};

export type ProgressSnapshot = {
  title: string;
  value: string;
  progress: number;
  detail: string;
  tone?: MetricTone;
};

export type ActivityFeedItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  tag?: string;
  tone?: MetricTone;
};

export type ChartSeries = {
  key: string;
  label: string;
  color: string;
};

export type StudentSubmissionStatus =
  | "On track"
  | "Awaiting review"
  | "Needs revision"
  | "Ready to submit";

export type StudentDashboardData = {
  welcome: {
    title: string;
    subtitle: string;
    project: string;
    cohort: string;
  };
  stats: DashboardStat[];
  progressTrackers: Array<{
    id: string;
    phase: string;
    owner: string;
    progress: number;
    note: string;
    status: "Completed" | "Active" | "Queued";
  }>;
  submissions: Array<{
    id: string;
    title: string;
    status: StudentSubmissionStatus;
    dueLabel: string;
    progress: number;
    note: string;
  }>;
  deadlines: Array<{
    id: string;
    title: string;
    dueLabel: string;
    owner: string;
    priority: "Low" | "Medium" | "High";
  }>;
  scorecards: ProgressSnapshot[];
  achievements: Array<{
    id: string;
    title: string;
    detail: string;
    impact: string;
  }>;
  feedback: Array<{
    id: string;
    faculty: string;
    note: string;
    area: string;
    timestamp: string;
  }>;
  activity: ActivityFeedItem[];
  researchSeries: Array<{
    week: string;
    literature: number;
    experimentation: number;
    writing: number;
  }>;
};

export type FacultyDashboardData = {
  header: {
    title: string;
    subtitle: string;
  };
  stats: DashboardStat[];
  submissionSeries: Array<{
    week: string;
    submitted: number;
    reviewed: number;
    escalated: number;
  }>;
  performanceSeries: Array<{
    month: string;
    performance: number;
    target: number;
  }>;
  backlogSeries: Array<{
    week: string;
    open: number;
    cleared: number;
  }>;
  quickReview: Array<{
    id: string;
    title: string;
    detail: string;
    actionLabel: string;
  }>;
  healthIndicators: ProgressSnapshot[];
  topTeams: Array<{
    id: string;
    team: string;
    domain: string;
    progress: number;
    risk: string;
    score: string;
  }>;
  activity: ActivityFeedItem[];
};

export type ProblemListing = {
  id: string;
  title: string;
  domain: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  source: "Faculty" | "Industry" | "Research Lab";
  fitScore: number;
  trend: string;
  summary: string;
  tags: string[];
  recommendedBy: string;
  saved: boolean;
};

export type ProblemMarketData = {
  stats: DashboardStat[];
  categories: string[];
  trending: Array<{
    id: string;
    title: string;
    momentum: string;
  }>;
  problems: ProblemListing[];
};

export type ReviewQueueItem = {
  id: string;
  team: string;
  batch: string;
  project: string;
  submissionTitle: string;
  submittedAt: string;
  status: "Pending" | "Re-review" | "SLA risk";
  urgency: "Low" | "Medium" | "High" | "Critical";
  preview: string;
  rubric: string[];
  scoreHint: string;
};

export type ReviewQueueData = {
  stats: DashboardStat[];
  analytics: Array<{
    week: string;
    pending: number;
    completed: number;
    overdue: number;
  }>;
  queue: ReviewQueueItem[];
  templates: string[];
};

export type ProjectHealthTeam = {
  id: string;
  team: string;
  project: string;
  problemStatement: string;
  batch: string;
  mentor: string;
  completion: number;
  healthScore: number;
  riskScore: number;
  priorityScore: number;
  riskLayer:
    | "Healthy"
    | "Stable"
    | "Slipping"
    | "At Risk"
    | "Critical"
    | "Ghost Team"
    | "Fake Progress"
    | "Research Blocked"
    | "Mentor Dependent";
  trend:
    | "Improving rapidly"
    | "Declining slowly"
    | "Stagnating"
    | "Recovering after revision"
    | "High volatility"
    | "Consistent execution";
  momentum: string;
  aiLabel: string;
  sprintStatus: string;
  deliveryRiskState: string;
  completionConfidence: number;
  paperCompletionConfidence: number;
  vivaReadinessConfidence: number;
  technicalExecutionConfidence: number;
  mentorLoad: string;
  interventionUrgency: "Monitor" | "Review" | "High" | "Immediate";
  currentMilestone: string;
  deadlineLabel: string;
  backlogItems: number;
  inactiveDays: number;
  missedSubmissions: number;
  velocity: string;
  alerts: string[];
  contributionHeatmap: number[];
  detectedSignals: string[];
  qualitySignals: Array<{
    label: string;
    value: number;
    detail: string;
  }>;
  executionTimeline: Array<{
    label: string;
    sprintReliability: number;
    submissionReliability: number;
    reviewTurnaround: number;
    paperVelocity: number;
    deploymentStability: number;
  }>;
};

export type ProjectHealthData = {
  stats: DashboardStat[];
  executionPulse: {
    score: number;
    state: string;
    summary: string;
  };
  riskDistribution: Array<{
    label: ProjectHealthTeam["riskLayer"];
    count: number;
  }>;
  aiSummary: string;
  velocitySeries: Array<{
    sprint: string;
    planned: number;
    delivered: number;
  }>;
  backlogSeries: Array<{
    sprint: string;
    open: number;
    critical: number;
  }>;
  alerts: ActivityFeedItem[];
  teams: ProjectHealthTeam[];
};

export type ExecutionOwnershipMember = {
  id: string;
  name: string;
  role: string;
  aiLabel:
    | "Execution Lead"
    | "Stable Contributor"
    | "Research Heavy"
    | "Silent Contributor"
    | "Support Role"
    | "At Risk"
    | "Disconnected"
    | "Free Rider"
    | "Burnout Risk";
  riskState: "Low" | "Watch" | "High" | "Critical";
  ownership: number;
  technicalContribution: number;
  researchContribution: number;
  sprintParticipation: number;
  documentationOwnership: number;
  reliability: number;
  ownershipConsistency: number;
  deadlineDiscipline: number;
  collaborationQuality: number;
  reviewResponsiveness: number;
  lastActiveLabel: string;
  insights: string[];
  anomalies: string[];
  dependencySignals: string[];
  trustSignals: Array<{
    label: string;
    value: number;
  }>;
  weeklyTrend: number[];
  ownershipAreas: Array<{
    label: string;
    value: number;
  }>;
};

export type ExecutionOwnershipTeam = {
  id: string;
  team: string;
  project: string;
  batch: string;
  mentor: string;
  balanceScore: number;
  dependencyScore: number;
  collaborationHealth: string;
  aiDiagnosis: string;
  riskState: "Healthy" | "Watch" | "Imbalanced" | "Critical";
  priorityScore: number;
  dominantMember: string;
  dynamics: string[];
  forecasts: Array<{
    label: string;
    value: number;
    detail: string;
  }>;
  interventions: string[];
  members: ExecutionOwnershipMember[];
};

export type TeamContributionData = {
  stats: DashboardStat[];
  aiSummary: string;
  teams: ExecutionOwnershipTeam[];
  alerts: ActivityFeedItem[];
};

export type DefenseReadinessMember = {
  id: string;
  name: string;
  role: string;
  readinessLabel:
    | "Defense Lead"
    | "Technically Ready"
    | "Research Ready"
    | "Slide Memorizer"
    | "Architecture Gap"
    | "Questioning Risk"
    | "Fake Ready";
  riskState: "Low" | "Watch" | "High" | "Critical";
  architectureExplanation: number;
  researchAnswering: number;
  liveDebugging: number;
  implementationExplanation: number;
  decisionDefense: number;
  datasetModelDefense: number;
  scalabilityAnswering: number;
  confidenceUnderPressure: number;
  aiSignals: string[];
  stressPatterns: string[];
};

export type DefenseArtifact = {
  id: string;
  label: string;
  type: "PPT" | "Demo" | "Paper" | "Architecture";
  uploadCompleteness: number;
  reviewStatus: string;
  facultyVerification: number;
  aiQualityScan: number;
  technicalDepthValidation: number;
  presentationReadiness: number;
  missingSections: string[];
  intelligence: string;
};

export type DefenseCompetency = {
  label: string;
  value: number;
  detail: string;
};

export type MockVivaQuestion = {
  id: string;
  category:
    | "Technical"
    | "Research"
    | "Architecture"
    | "Deployment"
    | "Dataset"
    | "Scalability"
    | "Failure handling";
  pressure: "Warm-up" | "Panel-level" | "Stress test";
  question: string;
  expectedEvidence: string;
  weakSignal: string;
};

export type DefenseReadinessTeam = {
  id: string;
  team: string;
  project: string;
  batch: string;
  mentor: string;
  readinessScore: number;
  confidenceScore: number;
  technicalDepthScore: number;
  researchMaturityScore: number;
  communicationReadiness: number;
  architectureUnderstanding: number;
  externalVivaConfidence: number;
  failureProbability: number;
  technicalRejectionProbability: number;
  communicationBreakdownRisk: number;
  researchQuestioningSurvival: number;
  improvementVelocity: string;
  trend: "Improving" | "Stable" | "Volatile" | "Declining";
  readinessState:
    | "Defense Ready"
    | "Recoverable"
    | "Vulnerable"
    | "Fake Ready"
    | "High Risk";
  aiDiagnosis: string;
  riskDetections: string[];
  highRiskQuestioningAreas: string[];
  competencies: DefenseCompetency[];
  artifacts: DefenseArtifact[];
  members: DefenseReadinessMember[];
  mockQuestions: MockVivaQuestion[];
  stressAnalysis: Array<{
    label: string;
    value: number;
    detail: string;
  }>;
  timeline: Array<{
    label: string;
    readiness: number;
    technicalConfidence: number;
    researchMaturity: number;
    pressureHandling: number;
  }>;
  actions: string[];
};

export type DefenseReadinessData = {
  stats: DashboardStat[];
  aiSummary: string;
  portfolio: {
    overallReadiness: number;
    confidenceScore: number;
    technicalDepthScore: number;
    researchMaturity: number;
    diagnosis: string;
  };
  teams: DefenseReadinessTeam[];
  alerts: ActivityFeedItem[];
};

export type ModulePageData = {
  eyebrow: string;
  title: string;
  description: string;
  stats: DashboardStat[];
  focus: ProgressSnapshot[];
  activity: ActivityFeedItem[];
};
