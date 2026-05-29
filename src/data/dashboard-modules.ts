import type { ModulePageData } from "@/types/aoip";

function createModule(module: ModulePageData) {
  return module;
}

export const dashboardModules: Record<string, ModulePageData> = {
  "/student/profile": createModule({
    eyebrow: "Student Overview",
    title: "Profile Workspace",
    description:
      "Maintain the academic, technical, and research context that powers execution routing, mentor recommendations, and evaluation signals.",
    stats: [
      { label: "Profile completeness", value: "92%", detail: "Project ownership, skills, and interests are fully mapped.", tone: "positive" },
      { label: "Research fit", value: "8.7/10", detail: "Problem alignment score based on domain experience and mentor input." },
      { label: "Skill clusters", value: "12", detail: "Tracked competencies spanning experimentation, writing, and delivery." },
      { label: "Portfolio artifacts", value: "18", detail: "Validated links across repos, decks, papers, and demos." },
    ],
    focus: [
      { title: "Portfolio depth", value: "76%", progress: 76, detail: "Add benchmark videos and deployment notes to strengthen external visibility." },
      { title: "Institution metadata", value: "64%", progress: 64, detail: "Advisor history and publication preferences still need normalization." },
    ],
    activity: [
      { id: "profile-1", title: "Updated research interests", detail: "Neuro-symbolic AI and academic product systems were added to the profile.", timestamp: "Today", tag: "Profile" },
      { id: "profile-2", title: "Mentor mapping refreshed", detail: "Faculty reviewer preferences are now linked to the capstone workspace.", timestamp: "Yesterday", tag: "Routing" },
      { id: "profile-3", title: "Portfolio link verified", detail: "IEEE draft repository and presentation deck were revalidated.", timestamp: "This week", tag: "Artifacts" },
    ],
  }),
  "/student/performance-score": createModule({
    eyebrow: "Student Overview",
    title: "Performance Score",
    description:
      "See how weekly delivery, research quality, mentor response loops, and evaluation readiness combine into one execution index.",
    stats: [
      { label: "Composite score", value: "84/100", detail: "Weighted across submissions, research momentum, and review closure.", tone: "positive" },
      { label: "Positive delta", value: "+6 pts", detail: "Improvement from the last evaluation cycle." },
      { label: "Attendance impact", value: "14%", detail: "Current academic attendance multiplier on project velocity." },
      { label: "Review closure", value: "89%", detail: "Mentor feedback addressed within the target turnaround." },
    ],
    focus: [
      { title: "Submission precision", value: "81%", progress: 81, detail: "Evidence-rich submissions are driving most of the score recovery." },
      { title: "Viva confidence", value: "68%", progress: 68, detail: "Question handling around methodology tradeoffs still needs work." },
    ],
    activity: [
      { id: "score-1", title: "Score uplift after approval", detail: "Week 8 review closure improved consistency and documentation bands.", timestamp: "2 hours ago", tag: "Score" },
      { id: "score-2", title: "Revision penalty avoided", detail: "Literature tracker was updated before the late-review cutoff.", timestamp: "Yesterday", tag: "Risk" },
      { id: "score-3", title: "Readiness benchmark synced", detail: "Viva rehearsal results are now reflected in the evaluation subscore.", timestamp: "This week", tag: "Sync" },
    ],
  }),
  "/student/achievements": createModule({
    eyebrow: "Student Overview",
    title: "Achievement Signal Board",
    description:
      "Track verified outcomes from project milestones, paper readiness, hackathons, and institutional recognitions in one operating layer.",
    stats: [
      { label: "Verified outcomes", value: "11", detail: "Achievements with proof links and faculty verification." },
      { label: "External recognitions", value: "3", detail: "Conference, showcase, or competition-level wins.", tone: "positive" },
      { label: "Portfolio momentum", value: "High", detail: "Recent achievement density is strong heading into final evaluation." },
      { label: "Pending evidence", value: "2", detail: "Achievements awaiting certificates or result sheets.", tone: "warning" },
    ],
    focus: [
      { title: "Proof completion", value: "72%", progress: 72, detail: "Add certificate links and publication screenshots for recent outcomes." },
      { title: "Narrative quality", value: "83%", progress: 83, detail: "Achievement summaries clearly connect to project execution maturity." },
    ],
    activity: [
      { id: "ach-1", title: "Prototype selected for research expo", detail: "The problem-market shortlist evolved into an approved departmental showcase.", timestamp: "Today", tag: "Recognition", tone: "positive" },
      { id: "ach-2", title: "Paper abstract accepted", detail: "Abstract passed the internal review gate for the IEEE draft.", timestamp: "Yesterday", tag: "Publication" },
      { id: "ach-3", title: "Sprint quality badge unlocked", detail: "Three consecutive submission cycles closed without revision carryover.", timestamp: "This week", tag: "Execution" },
    ],
  }),
  "/student/research/literature-review": createModule({
    eyebrow: "Student Research",
    title: "Literature Review",
    description:
      "Structure prior art, synthesis notes, and novelty gaps so research framing stays defensible through paper and viva stages.",
    stats: [
      { label: "Papers indexed", value: "24", detail: "Academic references tagged by relevance, recency, and methodology." },
      { label: "Novelty gaps", value: "5", detail: "Clear whitespace opportunities identified for positioning." },
      { label: "Citation freshness", value: "79%", detail: "Share of references published within the last 24 months." },
      { label: "Reading backlog", value: "7", detail: "Papers still pending annotation or evidence extraction.", tone: "warning" },
    ],
    focus: [
      { title: "Gap articulation", value: "74%", progress: 74, detail: "The problem statement is nearly ready for external reviewer scrutiny." },
      { title: "Evidence synthesis", value: "61%", progress: 61, detail: "Comparison matrices need a tighter link to final methodology decisions." },
    ],
    activity: [
      { id: "lit-1", title: "Three recent IEEE papers tagged", detail: "New benchmarks on multimodal classification were added to the repository.", timestamp: "Today", tag: "Reading" },
      { id: "lit-2", title: "Comparison matrix revised", detail: "Evaluation baselines are now grouped by dataset and signal type.", timestamp: "Yesterday", tag: "Synthesis" },
      { id: "lit-3", title: "Novelty note shared with mentor", detail: "A concise research-angle memo is awaiting faculty comments.", timestamp: "This week", tag: "Review" },
    ],
  }),
  "/student/research/ieee-paper": createModule({
    eyebrow: "Student Research",
    title: "IEEE Paper Workflow",
    description:
      "Manage section-level progress, publication quality, reviewer expectations, and final packaging for the paper track.",
    stats: [
      { label: "Paper completion", value: "68%", detail: "Weighted across abstract, literature, experiments, and results." },
      { label: "Sections approved", value: "4/9", detail: "Content blocks that cleared internal review.", tone: "positive" },
      { label: "Open reviewer notes", value: "9", detail: "Comments waiting for revision or evidence.", tone: "warning" },
      { label: "Formatting compliance", value: "91%", detail: "IEEE template alignment across typography, citations, and figures." },
    ],
    focus: [
      { title: "Results narrative", value: "58%", progress: 58, detail: "Discussion around failure cases and error analysis needs depth." },
      { title: "Method reproducibility", value: "82%", progress: 82, detail: "Experiment setup and benchmarks are nearly publishable." },
    ],
    activity: [
      { id: "paper-1", title: "Abstract revised with mentor note", detail: "Problem framing is now sharper and more publication-ready.", timestamp: "Today", tag: "Draft" },
      { id: "paper-2", title: "Figures standardized", detail: "Visualization system now follows a consistent captioning pattern.", timestamp: "Yesterday", tag: "Formatting" },
      { id: "paper-3", title: "Reference audit completed", detail: "Broken citations and missing DOIs were resolved.", timestamp: "This week", tag: "QA" },
    ],
  }),
  "/student/execution/execution-playbook": createModule({
    eyebrow: "Student Execution",
    title: "Execution Playbook",
    description:
      "Run the weekly operating rhythm that converts planning into submission-ready research and implementation output.",
    stats: [
      { label: "Active rituals", value: "6", detail: "Discovery sync, build review, paper review, demo prep, and more." },
      { label: "Playbook compliance", value: "87%", detail: "Share of checkpoints completed on time.", tone: "positive" },
      { label: "Escalations raised", value: "2", detail: "Current blockers formally surfaced to faculty this cycle." },
      { label: "Risk carryover", value: "Low", detail: "Minimal unresolved work rolling across weeks." },
    ],
    focus: [
      { title: "Sprint closure quality", value: "79%", progress: 79, detail: "Retrospectives are strong; evidence logging can still improve." },
      { title: "Blocker escalation speed", value: "66%", progress: 66, detail: "One infrastructure issue sat too long before intervention." },
    ],
    activity: [
      { id: "playbook-1", title: "Weekly retro published", detail: "Decisions, blockers, and next-step assignments were captured in Syntra.", timestamp: "Today", tag: "Ritual" },
      { id: "playbook-2", title: "Faculty checkpoint triggered", detail: "The benchmarking path required a mentor sign-off before proceeding.", timestamp: "Yesterday", tag: "Escalation" },
      { id: "playbook-3", title: "Execution checklist updated", detail: "Final submission packaging steps were added to the weekly flow.", timestamp: "This week", tag: "Ops" },
    ],
  }),
  "/student/execution/weekly-submissions": createModule({
    eyebrow: "Student Execution",
    title: "Weekly Submissions",
    description:
      "Track the evidence stream that keeps the project moving through review, iteration, and final evaluation.",
    stats: [
      { label: "Submitted on time", value: "8/9", detail: "Timely weekly deliveries in the current cycle.", tone: "positive" },
      { label: "Awaiting review", value: "1", detail: "Submission currently in the faculty queue." },
      { label: "Revision loop", value: "12 hrs", detail: "Average turnaround between review and resubmission." },
      { label: "Evidence quality", value: "High", detail: "Submission packs include links, visuals, and narrative context." },
    ],
    focus: [
      { title: "Narrative density", value: "84%", progress: 84, detail: "Summaries clearly communicate what changed and why it matters." },
      { title: "Benchmark evidence", value: "63%", progress: 63, detail: "Need stronger before-and-after comparisons for next cycle." },
    ],
    activity: [
      { id: "weekly-1", title: "Week 9 packet submitted", detail: "Research synthesis, experiment logs, and updated README were delivered.", timestamp: "Today", tag: "Submit" },
      { id: "weekly-2", title: "Revision closed on week 8", detail: "Missing quantitative analysis was added and accepted.", timestamp: "Yesterday", tag: "Review" },
      { id: "weekly-3", title: "Submission checklist updated", detail: "Screenshots and evidence links are now required every week.", timestamp: "This week", tag: "Process" },
    ],
  }),
  "/student/execution/final-submission": createModule({
    eyebrow: "Student Execution",
    title: "Final Submission",
    description:
      "Prepare the final delivery pack across product, paper, presentation, and evaluation requirements without losing traceability.",
    stats: [
      { label: "Final readiness", value: "71%", detail: "Completion across artifact packaging, rehearsal, and documentation." },
      { label: "Critical blockers", value: "2", detail: "Two dependencies still stand between the team and the final milestone.", tone: "warning" },
      { label: "Artifacts locked", value: "9/13", detail: "Core deliverables with approved owners and latest versions." },
      { label: "Compliance checks", value: "6/7", detail: "Format, naming, and submission standards nearly complete." },
    ],
    focus: [
      { title: "Demo reliability", value: "69%", progress: 69, detail: "Need one more rehearsal under unstable network conditions." },
      { title: "Documentation sharpness", value: "78%", progress: 78, detail: "Execution logs are strong; publication appendix still needs polish." },
    ],
    activity: [
      { id: "final-1", title: "Final deck freeze scheduled", detail: "Presentation assets will lock after the next faculty review cycle.", timestamp: "Today", tag: "Freeze" },
      { id: "final-2", title: "Demo script refined", detail: "Narrative now focuses on problem, evidence, and operational impact.", timestamp: "Yesterday", tag: "Narrative" },
      { id: "final-3", title: "Submission archive created", detail: "All artifacts now have a single source-of-truth folder structure.", timestamp: "This week", tag: "Packaging" },
    ],
  }),
  "/student/evaluation/viva": createModule({
    eyebrow: "Student Evaluation",
    title: "Defense Readiness Intelligence",
    description:
      "Convert research work and system execution into a defensible technical narrative for review panels and external examiners.",
    stats: [
      { label: "Readiness score", value: "76%", detail: "Composite signal across technical depth, clarity, and Q&A quality." },
      { label: "Question bank", value: "43", detail: "Tracked questions across methodology, datasets, and system design." },
      { label: "Confidence band", value: "Stable", detail: "Mock-viva performance improved across the last two rehearsals." },
      { label: "Weak clusters", value: "3", detail: "Topics still drawing inconsistent answers.", tone: "warning" },
    ],
    focus: [
      { title: "System tradeoff explanation", value: "73%", progress: 73, detail: "Architecture rationale is improving but still a little verbose." },
      { title: "Evaluation defense", value: "62%", progress: 62, detail: "Need sharper responses around dataset bias and limitations." },
    ],
    activity: [
      { id: "viva-1", title: "Mock viva completed", detail: "Faculty drilled deeper into benchmarking and reproducibility concerns.", timestamp: "Today", tag: "Mock" },
      { id: "viva-2", title: "Answer bank updated", detail: "Common questions now have concise evidence-backed responses.", timestamp: "Yesterday", tag: "Prep" },
      { id: "viva-3", title: "Live demo narrative tested", detail: "The project walkthrough now fits cleanly into the allotted window.", timestamp: "This week", tag: "Demo" },
    ],
  }),
  "/faculty/analytics": createModule({
    eyebrow: "Faculty Overview",
    title: "Analytics Command Center",
    description:
      "Cross-cohort visibility into throughput, review velocity, milestone completion, and evaluation risk across all active academic teams.",
    stats: [
      { label: "Cohorts tracked", value: "5", detail: "Active batches contributing signals into the operational layer." },
      { label: "Data freshness", value: "96%", detail: "Dashboards updated from the current workflow snapshot.", tone: "positive" },
      { label: "Risk alerts", value: "9", detail: "Workflow rules firing across submission, backlog, and inactivity signals." },
      { label: "Decision latency", value: "1.6 days", detail: "Average time from operational signal to mentor action." },
    ],
    focus: [
      { title: "Intervention precision", value: "81%", progress: 81, detail: "Alert rules are surfacing the right set of teams most of the time." },
      { title: "Noise reduction", value: "58%", progress: 58, detail: "A few low-severity review alerts still need threshold tuning." },
    ],
    activity: [
      { id: "analytics-1", title: "Weekly operations snapshot generated", detail: "Cross-role charts were refreshed for all active faculty dashboards.", timestamp: "Today", tag: "Snapshot" },
      { id: "analytics-2", title: "Trend anomaly detected", detail: "Backlog pressure rose in one cohort without a matching review spike.", timestamp: "Yesterday", tag: "Alert", tone: "warning" },
      { id: "analytics-3", title: "Benchmark view shared", detail: "Top-performing team patterns were pushed to mentor dashboards.", timestamp: "This week", tag: "Insight" },
    ],
  }),
  "/faculty/management/students": createModule({
    eyebrow: "Faculty Management",
    title: "Student Management",
    description:
      "Operate at the student layer with academic, project, and risk visibility aligned to faculty mentorship responsibilities.",
    stats: [
      { label: "Students owned", value: "46", detail: "Learners currently linked to faculty review scope." },
      { label: "Attention required", value: "7", detail: "Students needing immediate outreach or intervention.", tone: "warning" },
      { label: "Healthy cadence", value: "83%", detail: "Share of students maintaining weekly submission momentum." },
      { label: "Mentor coverage", value: "100%", detail: "Every student mapped to a visible faculty owner.", tone: "positive" },
    ],
    focus: [
      { title: "Intervention throughput", value: "77%", progress: 77, detail: "Follow-up speed is good, but closure tracking still varies by batch." },
      { title: "Profile quality", value: "69%", progress: 69, detail: "Student skills and project context still need fuller normalization." },
    ],
    activity: [
      { id: "students-1", title: "New high-risk student added", detail: "Missed submissions and inactivity pushed one team member onto the watchlist.", timestamp: "Today", tag: "Risk", tone: "critical" },
      { id: "students-2", title: "Mentor note appended", detail: "A project-health concern was attached directly to the student record.", timestamp: "Yesterday", tag: "Notes" },
      { id: "students-3", title: "Cohort sync completed", detail: "Student metadata and team assignments were aligned with current batches.", timestamp: "This week", tag: "Sync" },
    ],
  }),
  "/faculty/management/teams-batches": createModule({
    eyebrow: "Faculty Management",
    title: "Teams & Batches",
    description:
      "Manage how students roll into teams, how teams stack into cohorts, and where mentor capacity is over or under-loaded.",
    stats: [
      { label: "Active teams", value: "18", detail: "Teams currently shipping against structured milestones." },
      { label: "Balanced batches", value: "4/5", detail: "Cohorts with healthy mentor and risk distribution." },
      { label: "Capacity gaps", value: "2", detail: "Teams that need reassignment or stronger faculty support.", tone: "warning" },
      { label: "Delivery rhythm", value: "78%", detail: "Team-level consistency across current sprint windows." },
    ],
    focus: [
      { title: "Batch load balance", value: "71%", progress: 71, detail: "One cohort is carrying disproportionate review demand." },
      { title: "Team health consistency", value: "66%", progress: 66, detail: "Stronger teams are still outpacing the tail by a meaningful margin." },
    ],
    activity: [
      { id: "teams-1", title: "Mentor bandwidth audit completed", detail: "Review ownership was redistributed for the highest-pressure cohort.", timestamp: "Today", tag: "Ops" },
      { id: "teams-2", title: "Team merge proposed", detail: "Two stalled ideas may consolidate into a single stronger execution track.", timestamp: "Yesterday", tag: "Planning" },
      { id: "teams-3", title: "Batch readiness notes refreshed", detail: "Faculty now have updated health summaries for every cohort.", timestamp: "This week", tag: "Health" },
    ],
  }),
  "/faculty/review/quick-review": createModule({
    eyebrow: "Faculty Review",
    title: "Quick Review",
    description:
      "Run accelerated, repeatable review actions for routine submissions while escalating the ones that truly need deeper attention.",
    stats: [
      { label: "Quick actions used", value: "31", detail: "Template-driven review actions in the current cycle." },
      { label: "Time saved", value: "6.4 hrs", detail: "Estimated faculty time reclaimed through fast-path decisions.", tone: "positive" },
      { label: "Escalation rate", value: "18%", detail: "Submissions that still required full manual review." },
      { label: "Template confidence", value: "88%", detail: "Most quick-review patterns are matching faculty judgment." },
    ],
    focus: [
      { title: "Template clarity", value: "79%", progress: 79, detail: "The most common feedback paths are already reusable and clean." },
      { title: "Escalation hygiene", value: "61%", progress: 61, detail: "Some borderline cases are escalating slightly later than ideal." },
    ],
    activity: [
      { id: "quick-1", title: "Fast-pass rubric triggered", detail: "Submission quality met all mandatory evidence rules and skipped full review.", timestamp: "Today", tag: "Automation" },
      { id: "quick-2", title: "Manual escalation raised", detail: "A team needed deeper commentary around benchmark validity.", timestamp: "Yesterday", tag: "Escalation", tone: "warning" },
      { id: "quick-3", title: "Feedback template refined", detail: "Revision language now maps more clearly to the weekly rubric.", timestamp: "This week", tag: "Template" },
    ],
  }),
  "/faculty/monitoring/team-contribution": createModule({
    eyebrow: "Faculty Monitoring",
    title: "Execution Ownership",
    description:
      "Track responsibility distribution, dependency risk, free-rider patterns, and collaboration quality across active project teams.",
    stats: [
      { label: "Balanced teams", value: "12/18", detail: "Teams with healthy spread across effort and artifact ownership." },
      { label: "Dominant contributor risk", value: "3", detail: "Teams relying too heavily on one member.", tone: "warning" },
      { label: "Peer accountability", value: "82%", detail: "Contribution logs and peer notes updated consistently." },
      { label: "Handoff quality", value: "Strong", detail: "Most teams are documenting dependencies clearly." },
    ],
    focus: [
      { title: "Ownership spread", value: "68%", progress: 68, detail: "A few teams still lack balanced coverage across paper and product work." },
      { title: "Contribution evidence", value: "80%", progress: 80, detail: "Proof-linked updates are making review conversations faster." },
    ],
    activity: [
      { id: "contrib-1", title: "Contribution variance spike", detail: "One capstone team showed a sharp imbalance in logged execution work.", timestamp: "Today", tag: "Risk", tone: "warning" },
      { id: "contrib-2", title: "Peer feedback cycle closed", detail: "Team members reconciled ownership expectations after mentor review.", timestamp: "Yesterday", tag: "Review" },
      { id: "contrib-3", title: "Evidence log exported", detail: "Detailed contribution history is now available for final evaluation.", timestamp: "This week", tag: "Export" },
    ],
  }),
  "/faculty/monitoring/backlog-analytics": createModule({
    eyebrow: "Faculty Monitoring",
    title: "Backlog Analytics",
    description:
      "Observe how academic backlog pressure intersects with project execution risk so faculty can intervene before delivery collapses.",
    stats: [
      { label: "Students with backlogs", value: "14", detail: "Current count of students carrying unresolved academic debt.", tone: "warning" },
      { label: "Critical overlap", value: "5", detail: "Students with both backlog pressure and project inactivity.", tone: "critical" },
      { label: "Cleared this term", value: "9", detail: "Backlog subjects resolved during the active academic cycle." },
      { label: "Impact confidence", value: "High", detail: "Correlation between backlog load and missed submissions is clear." },
    ],
    focus: [
      { title: "Remediation routing", value: "73%", progress: 73, detail: "High-risk students are increasingly paired with the right support paths." },
      { title: "Execution shielding", value: "57%", progress: 57, detail: "Teams need more structured plans when key members hit exam pressure." },
    ],
    activity: [
      { id: "backlog-1", title: "Backlog risk cohort refreshed", detail: "Student workload pressure is now visible in the project-health layer.", timestamp: "Today", tag: "Sync" },
      { id: "backlog-2", title: "Exam window alert raised", detail: "Upcoming academic deadlines may interfere with milestone delivery.", timestamp: "Yesterday", tag: "Alert", tone: "warning" },
      { id: "backlog-3", title: "Remediation plan linked", detail: "Mentor actions were attached directly to affected students and teams.", timestamp: "This week", tag: "Intervention" },
    ],
  }),
  "/faculty/intelligence/achievement-analytics": createModule({
    eyebrow: "Faculty Intelligence",
    title: "Achievement Analytics",
    description:
      "Measure how project execution translates into outcomes that matter: recognitions, paper movement, and student signal growth.",
    stats: [
      { label: "Tracked achievements", value: "37", detail: "Verified outcomes across all active student cohorts." },
      { label: "External wins", value: "8", detail: "Conference, hackathon, or showcase recognitions.", tone: "positive" },
      { label: "Verification lag", value: "3", detail: "Achievements still missing certificates or formal proof." },
      { label: "Coverage health", value: "86%", detail: "Most cohorts now publish achievements in a consistent format." },
    ],
    focus: [
      { title: "Outcome distribution", value: "67%", progress: 67, detail: "Top-performing teams still dominate public-facing wins." },
      { title: "Proof hygiene", value: "82%", progress: 82, detail: "Verification quality is high, but archival structure can improve." },
    ],
    activity: [
      { id: "intel-ach-1", title: "Conference shortlist captured", detail: "Two teams now have externally visible research milestones logged.", timestamp: "Today", tag: "Signal", tone: "positive" },
      { id: "intel-ach-2", title: "Achievement proof validated", detail: "Faculty approval cleared pending portfolio evidence for one cohort.", timestamp: "Yesterday", tag: "Verify" },
      { id: "intel-ach-3", title: "Recognition spread reviewed", detail: "Mentors were briefed on underexposed teams with strong outcomes.", timestamp: "This week", tag: "Insight" },
    ],
  }),
  "/faculty/intelligence/performance-score": createModule({
    eyebrow: "Faculty Intelligence",
    title: "Performance Score Intelligence",
    description:
      "Understand cohort score behavior, where uplift is available, and which patterns drive decline before it becomes visible in final evaluations.",
    stats: [
      { label: "Average cohort score", value: "78/100", detail: "Current mean across all mentored active teams." },
      { label: "Improving teams", value: "11", detail: "Teams showing positive movement across the last review window.", tone: "positive" },
      { label: "Declining teams", value: "4", detail: "Execution or review trends turning negative.", tone: "warning" },
      { label: "Strongest driver", value: "Submission quality", detail: "The clearest predictor of final score stability right now." },
    ],
    focus: [
      { title: "Intervention leverage", value: "74%", progress: 74, detail: "Mentor action on revisions is still the fastest path to score recovery." },
      { title: "Consistency variance", value: "63%", progress: 63, detail: "Cohort tails are widening between high-discipline and low-discipline teams." },
    ],
    activity: [
      { id: "intel-perf-1", title: "Score volatility spike", detail: "One team dropped sharply after repeated review carryover.", timestamp: "Today", tag: "Alert", tone: "critical" },
      { id: "intel-perf-2", title: "Recovery path identified", detail: "A backlog-heavy cohort still has clear uplift opportunities through cadence fixes.", timestamp: "Yesterday", tag: "Insight" },
      { id: "intel-perf-3", title: "Trend window synced", detail: "Performance intelligence is now aligned with the latest faculty dashboard cycle.", timestamp: "This week", tag: "Sync" },
    ],
  }),
  "/faculty/intelligence/problem-library": createModule({
    eyebrow: "Faculty Intelligence",
    title: "Problem Library",
    description:
      "Curate reusable academic and industry-backed problem statements with better filtering, adoption data, and novelty coverage.",
    stats: [
      { label: "Library entries", value: "54", detail: "Tracked across AI/ML, CSE, IoT, Healthcare, and more." },
      { label: "Adopted this term", value: "21", detail: "Problem statements currently powering active student teams." },
      { label: "Needs refresh", value: "8", detail: "Entries with stale datasets, weak framing, or low adoption.", tone: "warning" },
      { label: "Industry-sourced", value: "13", detail: "Problems backed by external validation or partner context." },
    ],
    focus: [
      { title: "Quality control", value: "71%", progress: 71, detail: "Strong fit data exists, but a few domains need more current references." },
      { title: "Reuse density", value: "77%", progress: 77, detail: "The best problem statements are increasingly reusable across cohorts." },
    ],
    activity: [
      { id: "library-1", title: "New problem added", detail: "An assistive-AI education problem entered the curation queue.", timestamp: "Today", tag: "Curate" },
      { id: "library-2", title: "Stale entry deprecated", detail: "An outdated IoT idea lost adoption and was removed from active discovery.", timestamp: "Yesterday", tag: "Cleanup" },
      { id: "library-3", title: "Adoption trend exported", detail: "Faculty can now compare problem uptake by domain and batch.", timestamp: "This week", tag: "Insight" },
    ],
  }),
};

export const studentModules = {
  problems: dashboardModules["/student/research/problem-market"],
  submissions: dashboardModules["/student/execution/weekly-submissions"],
  paper: dashboardModules["/student/research/ieee-paper"],
  literature: dashboardModules["/student/research/literature-review"],
  final: dashboardModules["/student/execution/final-submission"],
  playbooks: dashboardModules["/student/execution/execution-playbook"],
  viva: dashboardModules["/student/evaluation/viva"],
  achievements: dashboardModules["/student/achievements"],
  performance: dashboardModules["/student/performance-score"],
  profile: dashboardModules["/student/profile"],
};

export const facultyModules = {
  students: dashboardModules["/faculty/management/students"],
  teams: dashboardModules["/faculty/management/teams-batches"],
  reviews: dashboardModules["/faculty/review/review-queue"],
  "quick-review": dashboardModules["/faculty/review/quick-review"],
  health: dashboardModules["/faculty/monitoring/project-health"],
  contribution: dashboardModules["/faculty/monitoring/team-contribution"],
  viva: dashboardModules["/student/evaluation/viva"],
  backlogs: dashboardModules["/faculty/monitoring/backlog-analytics"],
  achievements: dashboardModules["/faculty/intelligence/achievement-analytics"],
  performance: dashboardModules["/faculty/intelligence/performance-score"],
  analytics: dashboardModules["/faculty/analytics"],
  problems: dashboardModules["/faculty/intelligence/problem-library"],
};
