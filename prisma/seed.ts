import {
  DifficultyLevel,
  HealthStatus,
  MilestoneStatus,
  ProblemSource,
  ProjectStatus,
  ReviewDecision,
  Role,
  SubmissionStatus,
  SubmissionType,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { db as prisma } from "../src/lib/db";

const PASSWORD = "Syntra123";

async function createUser(input: {
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}) {
  const passwordHash = await hash(PASSWORD, 12);

  return prisma.user.upsert({
    where: {
      email: input.email,
    },
    update: {
      name: input.name,
      role: input.role,
      avatar: input.avatar ?? null,
      passwordHash,
    },
    create: {
      name: input.name,
      email: input.email,
      role: input.role,
      avatar: input.avatar ?? null,
      passwordHash,
    },
  });
}

async function resetAoipData() {
  await prisma.activityEvent.deleteMany();
  await prisma.review.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.projectMilestone.deleteMany();
  await prisma.analyticsSnapshot.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.performance.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.problemBookmark.deleteMany();
  await prisma.project.deleteMany();
  await prisma.problem.deleteMany();
}

async function main() {
  await resetAoipData();

  const [admin, facultyA, facultyB] = await Promise.all([
    createUser({
      name: "Syntra Administrator",
      email: process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() || "admin@syntra.edu",
      role: Role.ADMIN,
    }),
    createUser({
      name: "Dr. Nisha Varma",
      email: "nisha.varma@syntra.edu",
      role: Role.FACULTY,
    }),
    createUser({
      name: "Prof. Arjun Rao",
      email: "arjun.rao@syntra.edu",
      role: Role.FACULTY,
    }),
  ]);

  const students = await Promise.all(
    [
      ["Aarav Sharma", "aarav.sharma@syntra.edu"],
      ["Meera Iyer", "meera.iyer@syntra.edu"],
      ["Rohan Das", "rohan.das@syntra.edu"],
      ["Ishita Menon", "ishita.menon@syntra.edu"],
      ["Karthik Dev", "karthik.dev@syntra.edu"],
      ["Ananya Bose", "ananya.bose@syntra.edu"],
      ["Vikram Patel", "vikram.patel@syntra.edu"],
      ["Diya Kapoor", "diya.kapoor@syntra.edu"],
    ].map(([name, email]) =>
      createUser({
        name,
        email,
        role: Role.STUDENT,
      }),
    ),
  );

  const problems = await Promise.all([
    prisma.problem.create({
      data: {
        title: "Adaptive Campus Energy Forecasting",
        summary: "Forecast building load patterns using occupancy and weather signals.",
        description:
          "Build a resilient forecasting pipeline that combines IoT telemetry, occupancy modeling, and anomaly detection for academic campuses.",
        category: "AI/ML",
        domain: "Energy Systems",
        difficulty: DifficultyLevel.ADVANCED,
        source: ProblemSource.INDUSTRY,
        trendingScore: 92,
        isFacultyRecommended: true,
        createdById: facultyA.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Research Copilot for Literature Evidence Mapping",
        summary: "Cluster papers, claims, and citation conflicts into review-ready evidence boards.",
        description:
          "Design a literature graph that helps student teams move from papers to structured novelty claims and evidence-backed reviews.",
        category: "CSE",
        domain: "Research Systems",
        difficulty: DifficultyLevel.INTERMEDIATE,
        source: ProblemSource.FACULTY,
        trendingScore: 88,
        isFacultyRecommended: true,
        createdById: facultyA.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Edge-Based Crop Disease Early Warning",
        summary: "Use low-cost vision and sensor fusion for early crop risk detection.",
        description:
          "An IoT-first project focused on deployable field monitoring, disease alerts, and intervention recommendations.",
        category: "IoT",
        domain: "AgriTech",
        difficulty: DifficultyLevel.ADVANCED,
        source: ProblemSource.RESEARCH_LAB,
        trendingScore: 81,
        createdById: facultyB.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Operational Fraud Signal Explorer",
        summary: "Surface weak fraud indicators from transactional event streams.",
        description:
          "A data systems problem for teams interested in anomaly scoring, explainability, and operational review workflows.",
        category: "AI/ML",
        domain: "FinTech",
        difficulty: DifficultyLevel.INTERMEDIATE,
        source: ProblemSource.INDUSTRY,
        trendingScore: 85,
        createdById: facultyB.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Assistive Viva Readiness Analyzer",
        summary: "Assess oral defense readiness using evidence completeness and practice responses.",
        description:
          "A student-support product that measures preparedness for viva rounds using project artifacts and rehearsal signals.",
        category: "EdTech",
        domain: "Academic Evaluation",
        difficulty: DifficultyLevel.BEGINNER,
        source: ProblemSource.FACULTY,
        trendingScore: 73,
        isFacultyRecommended: true,
        createdById: facultyA.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Decentralized Verifiable Credential Registry",
        summary: "Issue and verify student degrees and skill badges securely using zero-knowledge proofs.",
        description:
          "Build a privacy-preserving credential registry that allows institutions to issue cryptographic proofs of graduation, and companies to instantly verify credentials without accessing third-party databases.",
        category: "Blockchain",
        domain: "Decentralized Identity",
        difficulty: DifficultyLevel.ADVANCED,
        source: ProblemSource.INDUSTRY,
        trendingScore: 94,
        isFacultyRecommended: true,
        createdById: facultyB.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Automated Medical Image Diagnostics Pipeline",
        summary: "Assist clinical radiologists with real-time anomaly segmentation on chest X-rays.",
        description:
          "Develop a federated-learning medical vision pipeline capable of detecting anomalies (pneumonia, effusion) with high specificity while ensuring DICOM compliance and clinic-level privacy.",
        category: "AI/ML",
        domain: "Healthcare",
        difficulty: DifficultyLevel.ADVANCED,
        source: ProblemSource.RESEARCH_LAB,
        trendingScore: 91,
        createdById: facultyA.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Multi-Robot Warehouse Path Orchestration",
        summary: "Schedule dynamic collision-free trajectories for autonomous warehouse carts.",
        description:
          "Implement a dynamic pathfinding orchestrator (e.g., using multi-agent path finding) that coordinates paths for autonomous warehouse robots in real time, minimizing bottlenecks and scheduling charging stops.",
        category: "CSE",
        domain: "Robotics & Logistics",
        difficulty: DifficultyLevel.ADVANCED,
        source: ProblemSource.INDUSTRY,
        trendingScore: 89,
        createdById: facultyB.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Real-time Edge-AI Wildlife Sound Analytics",
        summary: "Detect illegal logging and poaching sounds on solar-powered acoustic nodes.",
        description:
          "Deploy lightweight audio classification models onto microcontroller-based edge nodes to detect chainsaw and gunshot sounds, reporting alarms over low-power LoRa networks.",
        category: "IoT",
        domain: "Environmental Systems",
        difficulty: DifficultyLevel.INTERMEDIATE,
        source: ProblemSource.FACULTY,
        trendingScore: 83,
        isFacultyRecommended: true,
        createdById: facultyA.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "AI-Powered Autonomous Grid Load Balancer",
        summary: "Dynamically route local solar battery reserves to match residential grid spikes.",
        description:
          "Create a reinforcement learning-based power flow scheduler that optimizes battery charging/discharge rates across microgrids, avoiding utility transformer overloads during peak usage hours.",
        category: "AI/ML",
        domain: "Smart Grid",
        difficulty: DifficultyLevel.ADVANCED,
        source: ProblemSource.INDUSTRY,
        trendingScore: 95,
        isFacultyRecommended: true,
        createdById: facultyB.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Federated Threat Intelligence Share-Net",
        summary: "Collaboratively train network intrusion models without exposing sensitive raw traffic logs.",
        description:
          "Design a secure federated learning infrastructure for enterprise firewalls to collaboratively update intrusion signature classifiers using differential privacy, protecting patient and financial data.",
        category: "CSE",
        domain: "Cybersecurity",
        difficulty: DifficultyLevel.ADVANCED,
        source: ProblemSource.RESEARCH_LAB,
        trendingScore: 92,
        createdById: facultyA.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Low-Latency Edge Vision Traffic Flow Optimiser",
        summary: "Orchestrate real-time traffic light intervals using edge-computed lane congestion statistics.",
        description:
          "Implement a low-power edge vision system using micro-cameras to analyze queue length, dynamically adjusting intersection signal phases to minimize commuter idle time and emissions.",
        category: "IoT",
        domain: "Smart Cities",
        difficulty: DifficultyLevel.INTERMEDIATE,
        source: ProblemSource.INDUSTRY,
        trendingScore: 87,
        createdById: facultyB.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Supply Chain Carbon Footprint Tracker",
        summary: "Audit greenhouse emissions across multi-tier supplier routes on a verifiable ledger.",
        description:
          "Develop a public-key ledger system that allows manufacturers to securely prove carbon offset actions and trace emissions reports from third-party logistics partners, preventing greenwashing.",
        category: "Blockchain",
        domain: "Supply Chain",
        difficulty: DifficultyLevel.INTERMEDIATE,
        source: ProblemSource.FACULTY,
        trendingScore: 84,
        isFacultyRecommended: true,
        createdById: facultyA.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Self-Healing Distributed Database Log Sync",
        summary: "Repair partition sync inconsistencies in distributed database clusters.",
        description:
          "Build a consensus-driven data replication log engine that auto-detects and resolves network partition anomalies, guaranteeing eventual consistency without manual database administrator overrides.",
        category: "CSE",
        domain: "Distributed Systems",
        difficulty: DifficultyLevel.ADVANCED,
        source: ProblemSource.FACULTY,
        trendingScore: 90,
        createdById: facultyB.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Real-Time Patient Health Telemetry Sentinel",
        summary: "Detect cardiac arrhythmias in real-time from wearable sensor streams.",
        description:
          "Build an IoT-first telemetry ingestion engine that processes electrocardiogram (ECG) data streams on low-power devices, identifying rhythm anomalies with high sensitivity while preserving privacy.",
        category: "IoT",
        domain: "Healthcare",
        difficulty: DifficultyLevel.ADVANCED,
        source: ProblemSource.INDUSTRY,
        trendingScore: 93,
        isFacultyRecommended: true,
        createdById: facultyA.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Autonomous UAV Wildfire Detection Coordinator",
        summary: "Co-ordinate drone paths dynamically to map forest fire hotspots and telemetry.",
        description:
          "Design a decentralized multi-agent trajectory pathfinder that allows autonomous drone fleets to coordinate search patterns, monitor forest fire boundaries, and relay real-time fire intensity metrics to base stations.",
        category: "Robotics",
        domain: "Environmental Systems",
        difficulty: DifficultyLevel.ADVANCED,
        source: ProblemSource.RESEARCH_LAB,
        trendingScore: 91,
        createdById: facultyB.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Privacy-Preserving Ad-Click Analytics Engine",
        summary: "Verify ad clicks and track campaign conversions using secure multi-party computation.",
        description:
          "Build a browser-extension-based click verification framework that uses cryptographic multi-party computation to attribute ad conversions without tracking individual users or exposing browsing history.",
        category: "Cybersecurity",
        domain: "Web Systems",
        difficulty: DifficultyLevel.ADVANCED,
        source: ProblemSource.INDUSTRY,
        trendingScore: 86,
        createdById: facultyA.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Decentralized Carbon Credit Marketplace",
        summary: "Verifiably match certified agricultural offsets to enterprise carbon buyers.",
        description:
          "Develop an automated escrow smart-contract network on a verifiable public ledger to register certified agricultural carbon capture metrics, allowing transparent transfer of credits and preventing double-counting.",
        category: "Blockchain",
        domain: "FinTech",
        difficulty: DifficultyLevel.INTERMEDIATE,
        source: ProblemSource.FACULTY,
        trendingScore: 89,
        isFacultyRecommended: true,
        createdById: facultyB.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Generative UI Copilot for Design Accessibility",
        summary: "Convert visual screen wireframes into ARIA-compliant semantic layouts.",
        description:
          "Develop an accessibility-focused neural rendering tool that analyzes visual website layouts and automatically generates clean, semantic HTML5, complete with appropriate screen-reader role mappings and focus management.",
        category: "AI/ML",
        domain: "Web Systems",
        difficulty: DifficultyLevel.BEGINNER,
        source: ProblemSource.FACULTY,
        trendingScore: 78,
        createdById: facultyA.id,
      },
    }),
    prisma.problem.create({
      data: {
        title: "Dynamic Delivery Fleet Routing Optimiser",
        summary: "Optimize path routing for electric delivery cargo fleets under dynamic traffic.",
        description:
          "Design a high-frequency routing algorithm that schedules deliveries, schedules battery swap stops, and reroutes electric cargo fleets dynamically in response to urban congestion, weather changes, and delivery priorities.",
        category: "CSE",
        domain: "Logistics",
        difficulty: DifficultyLevel.INTERMEDIATE,
        source: ProblemSource.INDUSTRY,
        trendingScore: 88,
        createdById: facultyB.id,
      },
    }),
  ]);

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: "GridSense",
        description: "Campus energy forecasting and optimization for mixed academic buildings.",
        domain: "Energy Systems",
        difficulty: DifficultyLevel.ADVANCED,
        status: ProjectStatus.EXECUTION,
        progress: 72,
        riskScore: 28,
        healthStatus: HealthStatus.LOW,
        problemId: problems[0].id,
      },
    }),
    prisma.project.create({
      data: {
        title: "LitMap OS",
        description: "Literature evidence mapper for research teams building IEEE-grade review pipelines.",
        domain: "Research Systems",
        difficulty: DifficultyLevel.INTERMEDIATE,
        status: ProjectStatus.RESEARCH,
        progress: 64,
        riskScore: 41,
        healthStatus: HealthStatus.MEDIUM,
        problemId: problems[1].id,
      },
    }),
    prisma.project.create({
      data: {
        title: "CropShield Edge",
        description: "Sensor-assisted crop disease detection and intervention alerting.",
        domain: "AgriTech",
        difficulty: DifficultyLevel.ADVANCED,
        status: ProjectStatus.EXECUTION,
        progress: 48,
        riskScore: 68,
        healthStatus: HealthStatus.HIGH,
        problemId: problems[2].id,
      },
    }),
    prisma.project.create({
      data: {
        title: "VivaPilot",
        description: "A defense-readiness engine for evaluation rehearsal and evidence completeness.",
        domain: "Academic Evaluation",
        difficulty: DifficultyLevel.BEGINNER,
        status: ProjectStatus.EVALUATION,
        progress: 83,
        riskScore: 22,
        healthStatus: HealthStatus.LOW,
        problemId: problems[4].id,
      },
    }),
  ]);

  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: "Team Aster",
        batch: "2026 CSE-A",
        projectTitle: projects[0].title,
        facultyId: facultyA.id,
        projectId: projects[0].id,
        teamCode: "JTL-2026-A12",
        maxStudents: 4,
        status: "ACTIVE",
        mentorId: facultyA.id,
      },
    }),
    prisma.team.create({
      data: {
        name: "Team Nova",
        batch: "2026 CSE-A",
        projectTitle: projects[1].title,
        facultyId: facultyA.id,
        projectId: projects[1].id,
        teamCode: "JTL-2026-N34",
        maxStudents: 4,
        status: "ACTIVE",
        mentorId: facultyA.id,
      },
    }),
    prisma.team.create({
      data: {
        name: "Team Prism",
        batch: "2026 CSE-B",
        projectTitle: projects[2].title,
        facultyId: facultyB.id,
        projectId: projects[2].id,
        teamCode: "JTL-2026-P56",
        maxStudents: 4,
        status: "ACTIVE",
        mentorId: facultyB.id,
      },
    }),
    prisma.team.create({
      data: {
        name: "Team Orbit",
        batch: "2026 CSE-B",
        projectTitle: projects[3].title,
        facultyId: facultyB.id,
        projectId: projects[3].id,
        teamCode: "JTL-2026-O78",
        maxStudents: 4,
        status: "ACTIVE",
        mentorId: facultyB.id,
      },
    }),
  ]);

  await prisma.teamMember.createMany({
    data: [
      {
        teamId: teams[0].id,
        userId: students[0].id,
        roleLabel: "Lead",
        contributionScore: 88,
        lastActiveAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        teamId: teams[0].id,
        userId: students[1].id,
        roleLabel: "Research",
        contributionScore: 82,
        lastActiveAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        teamId: teams[1].id,
        userId: students[2].id,
        roleLabel: "Lead",
        contributionScore: 74,
        lastActiveAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        teamId: teams[1].id,
        userId: students[3].id,
        roleLabel: "Writing",
        contributionScore: 69,
        lastActiveAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        teamId: teams[2].id,
        userId: students[4].id,
        roleLabel: "Lead",
        contributionScore: 46,
        lastActiveAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      },
      {
        teamId: teams[2].id,
        userId: students[5].id,
        roleLabel: "IoT",
        contributionScore: 42,
        lastActiveAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        teamId: teams[3].id,
        userId: students[6].id,
        roleLabel: "Lead",
        contributionScore: 91,
        lastActiveAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        teamId: teams[3].id,
        userId: students[7].id,
        roleLabel: "Presentation",
        contributionScore: 86,
        lastActiveAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Update student records with team assignment details
  await Promise.all([
    prisma.user.update({
      where: { id: students[0].id },
      data: { teamId: teams[0].id, facultyId: facultyA.id, mentorId: facultyA.id, joinedTeamAt: new Date() },
    }),
    prisma.user.update({
      where: { id: students[1].id },
      data: { teamId: teams[0].id, facultyId: facultyA.id, mentorId: facultyA.id, joinedTeamAt: new Date() },
    }),
    prisma.user.update({
      where: { id: students[2].id },
      data: { teamId: teams[1].id, facultyId: facultyA.id, mentorId: facultyA.id, joinedTeamAt: new Date() },
    }),
    prisma.user.update({
      where: { id: students[3].id },
      data: { teamId: teams[1].id, facultyId: facultyA.id, mentorId: facultyA.id, joinedTeamAt: new Date() },
    }),
    prisma.user.update({
      where: { id: students[4].id },
      data: { teamId: teams[2].id, facultyId: facultyB.id, mentorId: facultyB.id, joinedTeamAt: new Date() },
    }),
    prisma.user.update({
      where: { id: students[5].id },
      data: { teamId: teams[2].id, facultyId: facultyB.id, mentorId: facultyB.id, joinedTeamAt: new Date() },
    }),
    prisma.user.update({
      where: { id: students[6].id },
      data: { teamId: teams[3].id, facultyId: facultyB.id, mentorId: facultyB.id, joinedTeamAt: new Date() },
    }),
    prisma.user.update({
      where: { id: students[7].id },
      data: { teamId: teams[3].id, facultyId: facultyB.id, mentorId: facultyB.id, joinedTeamAt: new Date() },
    }),
  ]);

  await prisma.performance.createMany({
    data: [
      { userId: students[0].id, score: 91, attendanceScore: 94, submissionScore: 90, reviewScore: 89 },
      { userId: students[1].id, score: 88, attendanceScore: 92, submissionScore: 87, reviewScore: 85 },
      { userId: students[2].id, score: 81, attendanceScore: 86, submissionScore: 79, reviewScore: 78 },
      { userId: students[3].id, score: 77, attendanceScore: 83, submissionScore: 76, reviewScore: 72 },
      { userId: students[4].id, score: 63, attendanceScore: 70, submissionScore: 58, reviewScore: 61 },
      { userId: students[5].id, score: 59, attendanceScore: 64, submissionScore: 55, reviewScore: 58 },
      { userId: students[6].id, score: 93, attendanceScore: 95, submissionScore: 92, reviewScore: 91 },
      { userId: students[7].id, score: 89, attendanceScore: 90, submissionScore: 88, reviewScore: 87 },
    ],
  });

  await prisma.achievement.createMany({
    data: [
      {
        userId: students[0].id,
        title: "Prototype Benchmark Winner",
        description: "Highest execution score in the mid-cycle prototype benchmark.",
        badge: "Execution",
        points: 120,
      },
      {
        userId: students[0].id,
        title: "Research Note Published",
        description: "Team abstract accepted for the departmental innovation symposium.",
        badge: "Research",
        points: 90,
      },
      {
        userId: students[6].id,
        title: "Best Viva Rehearsal",
        description: "Top evaluator confidence score in the latest viva rehearsal cycle.",
        badge: "Evaluation",
        points: 100,
      },
      {
        userId: students[2].id,
        title: "Citation Coverage Sprint",
        description: "Completed the literature evidence backlog before the weekly cutoff.",
        badge: "Momentum",
        points: 70,
      },
    ],
  });

  await prisma.projectMilestone.createMany({
    data: [
      {
        projectId: projects[0].id,
        title: "Problem framing locked",
        description: "Validated telemetry scope with facilities operations.",
        stage: "Research",
        status: MilestoneStatus.COMPLETED,
        position: 1,
        dueAt: new Date("2026-04-01"),
        completedAt: new Date("2026-03-29"),
      },
      {
        projectId: projects[0].id,
        title: "Forecasting baseline",
        description: "Ship the first demand forecasting benchmark on historical data.",
        stage: "Execution",
        status: MilestoneStatus.IN_PROGRESS,
        position: 2,
        dueAt: new Date("2026-05-24"),
      },
      {
        projectId: projects[0].id,
        title: "Paper draft skeleton",
        description: "Prepare abstract, methodology, and evaluation structure.",
        stage: "Publication",
        status: MilestoneStatus.PENDING,
        position: 3,
        dueAt: new Date("2026-06-04"),
      },
      {
        projectId: projects[1].id,
        title: "Corpus clustering",
        description: "Normalize 120 key papers into citation-aware topic clusters.",
        stage: "Research",
        status: MilestoneStatus.IN_PROGRESS,
        position: 1,
        dueAt: new Date("2026-05-22"),
      },
      {
        projectId: projects[1].id,
        title: "Novelty board review",
        description: "Finalize problem-solution novelty map for mentor review.",
        stage: "Research",
        status: MilestoneStatus.PENDING,
        position: 2,
        dueAt: new Date("2026-05-28"),
      },
      {
        projectId: projects[2].id,
        title: "Field sensor stabilization",
        description: "Reduce false positives from soil moisture and vision variance.",
        stage: "Execution",
        status: MilestoneStatus.BLOCKED,
        position: 1,
        dueAt: new Date("2026-05-18"),
      },
      {
        projectId: projects[2].id,
        title: "Alert engine tuning",
        description: "Tune edge signal aggregation before faculty checkpoint.",
        stage: "Execution",
        status: MilestoneStatus.PENDING,
        position: 2,
        dueAt: new Date("2026-05-30"),
      },
      {
        projectId: projects[3].id,
        title: "Evaluator question bank",
        description: "Build defense prompts mapped to evidence completeness.",
        stage: "Evaluation",
        status: MilestoneStatus.COMPLETED,
        position: 1,
        dueAt: new Date("2026-05-02"),
        completedAt: new Date("2026-04-28"),
      },
      {
        projectId: projects[3].id,
        title: "Mock viva playback",
        description: "Run two rehearsal rounds with rubric-based feedback.",
        stage: "Evaluation",
        status: MilestoneStatus.IN_PROGRESS,
        position: 2,
        dueAt: new Date("2026-05-26"),
      },
    ],
  });

  for (const [projectIndex, project] of projects.entries()) {
    const base = [
      {
        label: "W1",
        sequence: 1,
        literatureProgress: 38 + projectIndex * 6,
        experimentationProgress: 28 + projectIndex * 5,
        writingProgress: 18 + projectIndex * 4,
        submittedCount: 2,
        reviewedCount: 1,
        escalatedCount: 0,
        plannedPoints: 14,
        deliveredPoints: 10 - projectIndex,
        openBacklogCount: 4 + projectIndex,
        criticalBacklogCount: projectIndex > 1 ? 2 : 1,
        clearedBacklogCount: 2,
        performanceScore: 68 + projectIndex * 5,
        targetScore: 82,
      },
      {
        label: "W2",
        sequence: 2,
        literatureProgress: 52 + projectIndex * 6,
        experimentationProgress: 44 + projectIndex * 5,
        writingProgress: 31 + projectIndex * 4,
        submittedCount: 3,
        reviewedCount: 2,
        escalatedCount: projectIndex === 2 ? 1 : 0,
        plannedPoints: 16,
        deliveredPoints: 12 - projectIndex,
        openBacklogCount: 5 + projectIndex,
        criticalBacklogCount: projectIndex > 1 ? 2 : 1,
        clearedBacklogCount: 3,
        performanceScore: 73 + projectIndex * 4,
        targetScore: 84,
      },
      {
        label: "W3",
        sequence: 3,
        literatureProgress: 66 + projectIndex * 5,
        experimentationProgress: 59 + projectIndex * 4,
        writingProgress: 46 + projectIndex * 4,
        submittedCount: 4,
        reviewedCount: 3,
        escalatedCount: projectIndex === 2 ? 1 : 0,
        plannedPoints: 18,
        deliveredPoints: 14 - projectIndex,
        openBacklogCount: 4 + projectIndex,
        criticalBacklogCount: projectIndex > 1 ? 2 : 1,
        clearedBacklogCount: 4,
        performanceScore: 78 + projectIndex * 3,
        targetScore: 86,
      },
      {
        label: "W4",
        sequence: 4,
        literatureProgress: 79 + projectIndex * 4,
        experimentationProgress: 71 + projectIndex * 4,
        writingProgress: 63 + projectIndex * 4,
        submittedCount: 5,
        reviewedCount: projectIndex === 2 ? 3 : 4,
        escalatedCount: projectIndex === 2 ? 2 : 0,
        plannedPoints: 20,
        deliveredPoints: 16 - projectIndex,
        openBacklogCount: 3 + projectIndex,
        criticalBacklogCount: projectIndex > 1 ? 2 : 0,
        clearedBacklogCount: 5,
        performanceScore: 82 + projectIndex * 3,
        targetScore: 88,
      },
    ];

    await prisma.analyticsSnapshot.createMany({
      data: base.map((item) => ({
        projectId: project.id,
        ...item,
      })),
    });
  }

  const submissions = await Promise.all([
    prisma.submission.create({
      data: {
        teamId: teams[0].id,
        submittedById: students[0].id,
        reviewedById: facultyA.id,
        type: SubmissionType.WEEKLY,
        title: "Week 8 load forecast benchmark",
        content: "Baseline model evaluation, occupancy calibration notes, and anomaly review.",
        status: SubmissionStatus.APPROVED,
        submittedAt: new Date("2026-05-10T09:00:00.000Z"),
        reviewedAt: new Date("2026-05-11T12:00:00.000Z"),
        feedback: "Solid benchmark framing. Tighten the anomaly rationale before the next cycle.",
        score: 88,
      },
    }),
    prisma.submission.create({
      data: {
        teamId: teams[0].id,
        submittedById: students[1].id,
        type: SubmissionType.IEEE,
        title: "Abstract and contribution claims draft",
        content: "Initial abstract, contribution bullets, and benchmark narrative.",
        status: SubmissionStatus.PENDING_REVIEW,
        submittedAt: new Date("2026-05-16T10:30:00.000Z"),
      },
    }),
    prisma.submission.create({
      data: {
        teamId: teams[1].id,
        submittedById: students[2].id,
        reviewedById: facultyA.id,
        type: SubmissionType.LITERATURE,
        title: "Topic cluster evidence board",
        content: "Cluster map with 42 papers and competing methodology notes.",
        status: SubmissionStatus.REVISION_REQUIRED,
        submittedAt: new Date("2026-05-12T11:00:00.000Z"),
        reviewedAt: new Date("2026-05-13T15:30:00.000Z"),
        feedback: "Coverage is strong, but the novelty claim still collapses two adjacent clusters.",
        score: 74,
      },
    }),
    prisma.submission.create({
      data: {
        teamId: teams[1].id,
        submittedById: students[3].id,
        type: SubmissionType.WEEKLY,
        title: "Week 9 synthesis memo",
        content: "Reviewer rebuttal plan and open citation gaps for the next sprint.",
        status: SubmissionStatus.UNDER_REVIEW,
        submittedAt: new Date("2026-05-18T08:20:00.000Z"),
      },
    }),
    prisma.submission.create({
      data: {
        teamId: teams[2].id,
        submittedById: students[4].id,
        type: SubmissionType.WEEKLY,
        title: "Field sensor drift incident report",
        content: "Data drift notes, false positive burst analysis, and next-step patch plan.",
        status: SubmissionStatus.PENDING_REVIEW,
        submittedAt: new Date("2026-05-15T13:40:00.000Z"),
      },
    }),
    prisma.submission.create({
      data: {
        teamId: teams[2].id,
        submittedById: students[5].id,
        reviewedById: facultyB.id,
        type: SubmissionType.FINAL,
        title: "Edge deployment rehearsal pack",
        content: "Device setup checklist, alert precision logs, and deployment blockers.",
        status: SubmissionStatus.REJECTED,
        submittedAt: new Date("2026-05-07T09:15:00.000Z"),
        reviewedAt: new Date("2026-05-08T17:10:00.000Z"),
        feedback: "Execution evidence is incomplete. Device stability must improve before reassessment.",
        score: 58,
      },
    }),
    prisma.submission.create({
      data: {
        teamId: teams[3].id,
        submittedById: students[6].id,
        reviewedById: facultyB.id,
        type: SubmissionType.WEEKLY,
        title: "Mock viva evaluator loop",
        content: "Recorded defense, evidence gaps, and follow-up improvement checklist.",
        status: SubmissionStatus.APPROVED,
        submittedAt: new Date("2026-05-14T14:00:00.000Z"),
        reviewedAt: new Date("2026-05-14T18:30:00.000Z"),
        feedback: "Excellent rehearsal quality. Keep tightening evidence transitions between claims.",
        score: 92,
      },
    }),
    prisma.submission.create({
      data: {
        teamId: teams[3].id,
        submittedById: students[7].id,
        type: SubmissionType.FINAL,
        title: "Evaluation readiness checklist",
        content: "Rubric mapping, artifact completeness, and final oral defense plan.",
        status: SubmissionStatus.PENDING_REVIEW,
        submittedAt: new Date("2026-05-19T07:45:00.000Z"),
      },
    }),
  ]);

  await prisma.review.createMany({
    data: [
      {
        submissionId: submissions[0].id,
        reviewerId: facultyA.id,
        score: 88,
        comments:
          "Clear evidence pack and healthy modeling discipline. Improve the articulation around anomaly handling.",
        decision: ReviewDecision.APPROVED,
      },
      {
        submissionId: submissions[2].id,
        reviewerId: facultyA.id,
        score: 74,
        comments:
          "Good paper breadth, but the synthesis layer needs sharper novelty separation and evidence alignment.",
        decision: ReviewDecision.REVISION_REQUIRED,
      },
      {
        submissionId: submissions[5].id,
        reviewerId: facultyB.id,
        score: 58,
        comments:
          "Execution quality is not yet review-safe. Resolve stability issues and resubmit with hard evidence.",
        decision: ReviewDecision.REJECTED,
      },
      {
        submissionId: submissions[6].id,
        reviewerId: facultyB.id,
        score: 92,
        comments:
          "Strong evaluator readiness and excellent evidence flow. Keep the final deck concise.",
        decision: ReviewDecision.APPROVED,
      },
    ],
  });

  await prisma.problemBookmark.createMany({
    data: [
      { problemId: problems[0].id, userId: students[0].id },
      { problemId: problems[0].id, userId: students[1].id },
      { problemId: problems[1].id, userId: students[2].id },
      { problemId: problems[1].id, userId: students[3].id },
      { problemId: problems[2].id, userId: students[4].id },
      { problemId: problems[4].id, userId: students[6].id },
      { problemId: problems[4].id, userId: students[7].id },
    ],
  });

  await prisma.activityEvent.createMany({
    data: [
      {
        teamId: teams[0].id,
        projectId: projects[0].id,
        userId: students[0].id,
        type: "submission",
        title: "Weekly benchmark approved",
        detail: "Faculty cleared the Week 8 benchmark package with action notes.",
        createdAt: new Date("2026-05-11T12:00:00.000Z"),
      },
      {
        teamId: teams[0].id,
        projectId: projects[0].id,
        userId: facultyA.id,
        type: "feedback",
        title: "Model anomaly note requested",
        detail: "Reviewer asked for tighter anomaly rationale before the next sprint.",
        createdAt: new Date("2026-05-11T12:15:00.000Z"),
      },
      {
        teamId: teams[1].id,
        projectId: projects[1].id,
        userId: facultyA.id,
        type: "review",
        title: "Literature synthesis sent back for revision",
        detail: "Novelty mapping requires refinement before paper framing can proceed.",
        createdAt: new Date("2026-05-13T15:30:00.000Z"),
      },
      {
        teamId: teams[2].id,
        projectId: projects[2].id,
        userId: facultyB.id,
        type: "alert",
        title: "Execution risk escalated",
        detail: "Sensor stabilization blockers and missed review confidence triggered a high-risk alert.",
        createdAt: new Date("2026-05-18T10:00:00.000Z"),
      },
      {
        teamId: teams[3].id,
        projectId: projects[3].id,
        userId: students[6].id,
        type: "milestone",
        title: "Mock viva loop closed",
        detail: "Evaluator rehearsal completed with a strong confidence score and low rebuttal risk.",
        createdAt: new Date("2026-05-14T18:35:00.000Z"),
      },
    ],
  });

  console.log("AOIP seed complete.");
  console.log(`Admin: ${admin.email}`);
  console.log(`Faculty logins: ${facultyA.email}, ${facultyB.email}`);
  console.log(`Student login password for seeded users: ${PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
