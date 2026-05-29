import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getTeamScopeWhere, type ViewerContext } from "@/lib/permissions";
import {
  average,
  buildActivityItem,
  clampPercentage,
} from "@/lib/services/shared";
import type {
  DefenseArtifact,
  DefenseCompetency,
  DefenseReadinessData,
  DefenseReadinessMember,
  DefenseReadinessTeam,
  MockVivaQuestion,
} from "@/types/aoip";

const defenseReadinessInclude = {
  faculty: {
    select: {
      id: true,
      name: true,
    },
  },
  students: {
    orderBy: {
      createdAt: "asc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          performance: {
            select: {
              score: true,
              attendanceScore: true,
              submissionScore: true,
              reviewScore: true,
            },
          },
        },
      },
    },
  },
  project: {
    include: {
      analytics: {
        orderBy: {
          sequence: "asc",
        },
      },
      milestones: {
        orderBy: {
          position: "asc",
        },
      },
    },
  },
  submissions: {
    orderBy: {
      submittedAt: "desc",
    },
    include: {
      reviews: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  },
  activityEvents: {
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  },
} satisfies Prisma.TeamInclude;

type DefenseTeamRecord = Prisma.TeamGetPayload<{
  include: typeof defenseReadinessInclude;
}>;

function daysSince(date: Date | null | undefined) {
  if (!date) {
    return 30;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function deliveryRatio(snapshot: DefenseTeamRecord["project"]["analytics"][number] | undefined) {
  if (!snapshot || snapshot.plannedPoints === 0) {
    return 100;
  }

  return clampPercentage((snapshot.deliveredPoints / snapshot.plannedPoints) * 100);
}

function submissionTypeScore(team: DefenseTeamRecord, type: "WEEKLY" | "FINAL" | "IEEE" | "LITERATURE") {
  const submissions = team.submissions.filter((submission) => submission.type === type);

  if (submissions.length === 0) {
    return 0;
  }

  const approved = submissions.filter((submission) => submission.status === "APPROVED").length;
  const pending = submissions.filter(
    (submission) => submission.status === "PENDING_REVIEW" || submission.status === "UNDER_REVIEW",
  ).length;
  const rejected = submissions.filter(
    (submission) =>
      submission.status === "REJECTED" || submission.status === "REVISION_REQUIRED",
  ).length;

  return clampPercentage(approved * 44 + pending * 24 + submissions.length * 14 - rejected * 18);
}

function averageReviewScore(team: DefenseTeamRecord) {
  const scores = team.submissions
    .map((submission) => submission.score ?? submission.reviews[0]?.score ?? null)
    .filter((score): score is number => typeof score === "number");

  return scores.length > 0 ? average(scores) : 0;
}

function roleBoost(role: string, target: "technical" | "research" | "architecture" | "presentation") {
  const normalized = role.toLowerCase();

  if (target === "technical" && /(lead|backend|frontend|iot|model|dev|engineering)/.test(normalized)) {
    return 12;
  }

  if (target === "research" && /(research|writing|paper|literature)/.test(normalized)) {
    return 16;
  }

  if (target === "architecture" && /(lead|backend|frontend|iot|architect|dev)/.test(normalized)) {
    return 13;
  }

  if (target === "presentation" && /(presentation|lead|writing|viva)/.test(normalized)) {
    return 14;
  }

  return 0;
}

function memberSubmissionCount(team: DefenseTeamRecord, userId: string) {
  return team.submissions.filter((submission) => submission.submittedById === userId).length;
}

function buildMembers(team: DefenseTeamRecord): DefenseReadinessMember[] {
  const latest = team.project.analytics.at(-1);
  const reviewScore = averageReviewScore(team);
  const delivery = deliveryRatio(latest);
  const researchMaturity = average([latest?.literatureProgress ?? 0, latest?.writingProgress ?? 0]);
  const contributionScores = team.students.map((member) => member.contributionScore);
  const maxContribution = Math.max(...contributionScores, 0);

  return team.students.map((member) => {
    const performance = member.user.performance;
    const inactivePenalty = Math.min(30, daysSince(member.lastActiveAt) * 2);
    const submissionSignal = memberSubmissionCount(team, member.userId) * 8;
    const contribution = member.contributionScore;
    const architectureExplanation = clampPercentage(
      contribution * 0.42 +
        delivery * 0.24 +
        reviewScore * 0.18 +
        roleBoost(member.roleLabel, "architecture") -
        inactivePenalty,
    );
    const researchAnswering = clampPercentage(
      contribution * 0.32 +
        researchMaturity * 0.36 +
        (performance?.reviewScore ?? reviewScore) * 0.16 +
        roleBoost(member.roleLabel, "research") -
        inactivePenalty * 0.45,
    );
    const liveDebugging = clampPercentage(
      contribution * 0.48 +
        (latest?.experimentationProgress ?? 0) * 0.24 +
        submissionSignal +
        roleBoost(member.roleLabel, "technical") -
        inactivePenalty,
    );
    const implementationExplanation = clampPercentage(
      contribution * 0.5 + delivery * 0.22 + roleBoost(member.roleLabel, "technical") - inactivePenalty,
    );
    const decisionDefense = clampPercentage(
      average([architectureExplanation, researchAnswering, performance?.reviewScore ?? reviewScore]),
    );
    const datasetModelDefense = clampPercentage(
      average([researchAnswering, latest?.experimentationProgress ?? 0, latest?.literatureProgress ?? 0]),
    );
    const scalabilityAnswering = clampPercentage(
      architectureExplanation * 0.42 +
        implementationExplanation * 0.3 +
        (latest?.performanceScore ?? 0) * 0.16 -
        inactivePenalty * 0.5,
    );
    const confidenceUnderPressure = clampPercentage(
      average([
        performance?.score ?? 0,
        performance?.reviewScore ?? reviewScore,
        contribution,
        100 - inactivePenalty,
      ]),
    );
    const memberAverage = average([
      architectureExplanation,
      researchAnswering,
      liveDebugging,
      implementationExplanation,
      decisionDefense,
      datasetModelDefense,
      scalabilityAnswering,
      confidenceUnderPressure,
    ]);
    const highDependency = maxContribution - contribution >= 28;
    const slideMemorizer =
      confidenceUnderPressure >= 72 &&
      (implementationExplanation < 52 || architectureExplanation < 52);
    const fakeReady = confidenceUnderPressure >= 70 && memberAverage < 58;
    const readinessLabel: DefenseReadinessMember["readinessLabel"] =
      contribution === maxContribution && memberAverage >= 72
        ? "Defense Lead"
        : fakeReady
          ? "Fake Ready"
          : slideMemorizer
            ? "Slide Memorizer"
            : architectureExplanation < 48
              ? "Architecture Gap"
              : researchAnswering >= 72 && implementationExplanation < 68
                ? "Research Ready"
                : memberAverage >= 72
                  ? "Technically Ready"
                  : "Questioning Risk";
    const riskState: DefenseReadinessMember["riskState"] =
      readinessLabel === "Fake Ready" || memberAverage < 45
        ? "Critical"
        : readinessLabel === "Slide Memorizer" || readinessLabel === "Architecture Gap" || highDependency
          ? "High"
          : memberAverage < 68
            ? "Watch"
            : "Low";
    const aiSignals = [
      readinessLabel === "Defense Lead"
        ? "Can connect architecture, implementation, and panel tradeoffs."
        : readinessLabel === "Slide Memorizer"
          ? "Presentation confidence exceeds implementation ownership."
          : readinessLabel === "Architecture Gap"
            ? "Cannot safely explain system flow under follow-up questioning."
            : readinessLabel === "Research Ready"
              ? "Research answers are stronger than implementation defense."
              : readinessLabel === "Fake Ready"
                ? "Confidence signal is not backed by technical depth."
                : "Needs targeted rehearsal before external evaluation.",
      highDependency
        ? "Non-lead defense dependency risk detected."
        : "Member has enough signal for shared defense participation.",
    ];

    return {
      id: member.id,
      name: member.user.name,
      role: member.roleLabel,
      readinessLabel,
      riskState,
      architectureExplanation,
      researchAnswering,
      liveDebugging,
      implementationExplanation,
      decisionDefense,
      datasetModelDefense,
      scalabilityAnswering,
      confidenceUnderPressure,
      aiSignals,
      stressPatterns: [
        architectureExplanation < 55
          ? "Architecture walkthrough hesitates under sequence questions."
          : "Architecture walkthrough can survive basic panel probing.",
        researchAnswering < 55
          ? "Literature and novelty answers need evidence-backed rehearsal."
          : "Research explanation has acceptable concept coverage.",
        liveDebugging < 55
          ? "Live debugging confidence is weak for demo failure scenarios."
          : "Can discuss debugging and failure handling with moderate confidence.",
      ],
    };
  });
}

function artifactStatus(score: number) {
  if (score >= 80) {
    return "Verified";
  }

  if (score >= 62) {
    return "Needs faculty scan";
  }

  return "Defense blocker";
}

function buildArtifacts(team: DefenseTeamRecord): DefenseArtifact[] {
  const latest = team.project.analytics.at(-1);
  const pptSignal = clampPercentage(
    average([team.project.progress, latest?.writingProgress ?? 0, submissionTypeScore(team, "FINAL")]),
  );
  const demoSignal = clampPercentage(
    average([latest?.experimentationProgress ?? 0, deliveryRatio(latest), submissionTypeScore(team, "WEEKLY")]) -
      (latest?.criticalBacklogCount ?? 0) * 7,
  );
  const paperSignal = clampPercentage(
    average([latest?.literatureProgress ?? 0, latest?.writingProgress ?? 0, submissionTypeScore(team, "IEEE"), submissionTypeScore(team, "LITERATURE")]),
  );
  const architectureSignal = clampPercentage(
    average([deliveryRatio(latest), latest?.experimentationProgress ?? 0, team.project.progress]),
  );

  return [
    {
      id: `${team.id}-ppt`,
      label: "Defense deck",
      type: "PPT",
      uploadCompleteness: pptSignal,
      reviewStatus: artifactStatus(pptSignal),
      facultyVerification: clampPercentage(pptSignal - 4),
      aiQualityScan: clampPercentage(pptSignal - 8),
      technicalDepthValidation: clampPercentage(architectureSignal - 10),
      presentationReadiness: clampPercentage(pptSignal + 8),
      missingSections:
        pptSignal >= 75 ? ["Panel appendix still recommended"] : ["Architecture slide", "Failure cases", "Result limitations"],
      intelligence:
        pptSignal >= 75
          ? "Slide narrative is usable for panel defense."
          : "Deck is presentation-heavy and needs stronger technical proof.",
    },
    {
      id: `${team.id}-demo`,
      label: "Implementation demo",
      type: "Demo",
      uploadCompleteness: demoSignal,
      reviewStatus: artifactStatus(demoSignal),
      facultyVerification: clampPercentage(demoSignal - 6),
      aiQualityScan: clampPercentage(demoSignal - 3),
      technicalDepthValidation: demoSignal,
      presentationReadiness: clampPercentage(demoSignal - 2),
      missingSections:
        demoSignal >= 75 ? ["Load test note"] : ["Stable walkthrough", "Error handling proof", "Recovery path"],
      intelligence:
        demoSignal >= 75
          ? "Demo evidence can withstand implementation questioning."
          : "Real functionality and failure handling need verification.",
    },
    {
      id: `${team.id}-paper`,
      label: "Research paper",
      type: "Paper",
      uploadCompleteness: paperSignal,
      reviewStatus: artifactStatus(paperSignal),
      facultyVerification: clampPercentage(paperSignal - 5),
      aiQualityScan: clampPercentage(paperSignal - 2),
      technicalDepthValidation: clampPercentage(paperSignal - 8),
      presentationReadiness: clampPercentage(paperSignal - 4),
      missingSections:
        paperSignal >= 75 ? ["Citation freshness check"] : ["Novelty claim", "Methodology clarity", "Citation quality"],
      intelligence:
        paperSignal >= 75
          ? "Research maturity is defensible with minor citation cleanup."
          : "Literature questioning may expose shallow research familiarity.",
    },
    {
      id: `${team.id}-architecture`,
      label: "System architecture",
      type: "Architecture",
      uploadCompleteness: architectureSignal,
      reviewStatus: artifactStatus(architectureSignal),
      facultyVerification: clampPercentage(architectureSignal - 7),
      aiQualityScan: clampPercentage(architectureSignal - 4),
      technicalDepthValidation: architectureSignal,
      presentationReadiness: clampPercentage(architectureSignal - 8),
      missingSections:
        architectureSignal >= 75 ? ["Scalability assumption note"] : ["Component boundaries", "Data flow", "Scalability logic"],
      intelligence:
        architectureSignal >= 75
          ? "System flow is clear enough for architecture walkthrough."
          : "Architecture explanation quality is not panel-safe yet.",
    },
  ];
}

function competency(label: string, value: number, detail: string): DefenseCompetency {
  return {
    label,
    value: clampPercentage(value),
    detail,
  };
}

function buildMockQuestions(team: DefenseTeamRecord, weakAreas: string[]): MockVivaQuestion[] {
  const domain = team.project.domain;
  const project = team.project.title;

  return [
    {
      id: `${team.id}-q1`,
      category: "Technical",
      pressure: weakAreas.includes("Technical depth") ? "Stress test" : "Panel-level",
      question: `Why is your implementation approach appropriate for ${project}, and what would fail first?`,
      expectedEvidence: "Code ownership, test evidence, and known failure limits.",
      weakSignal: "Surface-level tool listing without implementation reasoning.",
    },
    {
      id: `${team.id}-q2`,
      category: "Research",
      pressure: weakAreas.includes("Research understanding") ? "Stress test" : "Panel-level",
      question: `What is your research gap in ${domain}, and which paper most directly influenced your method?`,
      expectedEvidence: "Specific prior work, gap articulation, and contribution boundary.",
      weakSignal: "Generic literature summary or no cited comparison.",
    },
    {
      id: `${team.id}-q3`,
      category: "Architecture",
      pressure: weakAreas.includes("System architecture clarity") ? "Stress test" : "Panel-level",
      question: "Walk through the system from input to output, including where errors are handled.",
      expectedEvidence: "Components, data flow, service boundaries, and fallback behavior.",
      weakSignal: "Architecture described as a list of tools instead of a pipeline.",
    },
    {
      id: `${team.id}-q4`,
      category: "Deployment",
      pressure: "Panel-level",
      question: "What changes before this can survive production traffic and evaluator misuse?",
      expectedEvidence: "Monitoring, rollback, security, latency, and operational constraints.",
      weakSignal: "Demo-only confidence with no production hardening plan.",
    },
    {
      id: `${team.id}-q5`,
      category: "Dataset",
      pressure: "Panel-level",
      question: "How is your dataset biased, and how does that affect the final claim?",
      expectedEvidence: "Bias source, validation split, limitation, and mitigation.",
      weakSignal: "Claims the dataset is representative without evidence.",
    },
    {
      id: `${team.id}-q6`,
      category: "Scalability",
      pressure: "Stress test",
      question: "What happens if usage or data volume scales 100x?",
      expectedEvidence: "Bottleneck identification, scaling plan, and tradeoff discussion.",
      weakSignal: "No clear throughput or resource constraint explanation.",
    },
    {
      id: `${team.id}-q7`,
      category: "Failure handling",
      pressure: "Stress test",
      question: "During the viva demo, the main inference/API flow fails. How do you debug it live?",
      expectedEvidence: "Logs, isolation steps, fallback demo path, and root-cause sequence.",
      weakSignal: "Panic path or dependency on a single lead member.",
    },
  ];
}

function trendFrom(latest: number, previous: number): DefenseReadinessTeam["trend"] {
  const delta = latest - previous;

  if (Math.abs(delta) >= 20) {
    return "Volatile";
  }

  if (delta >= 6) {
    return "Improving";
  }

  if (delta <= -6) {
    return "Declining";
  }

  return "Stable";
}

function buildDefenseTeam(team: DefenseTeamRecord): DefenseReadinessTeam {
  const latest = team.project.analytics.at(-1);
  const previous = team.project.analytics.at(-2);
  const members = buildMembers(team);
  const artifacts = buildArtifacts(team);
  const reviewScore = averageReviewScore(team);
  const contributionAverage = average(team.students.map((member) => member.contributionScore));
  const technicalDepthScore = clampPercentage(
    average([
      latest?.experimentationProgress ?? 0,
      deliveryRatio(latest),
      contributionAverage,
      reviewScore,
    ]),
  );
  const researchMaturityScore = clampPercentage(
    average([
      latest?.literatureProgress ?? 0,
      latest?.writingProgress ?? 0,
      submissionTypeScore(team, "IEEE"),
      submissionTypeScore(team, "LITERATURE"),
    ]),
  );
  const architectureUnderstanding = average(members.map((member) => member.architectureExplanation));
  const communicationReadiness = average(members.map((member) => member.confidenceUnderPressure));
  const confidenceScore = clampPercentage(average([communicationReadiness, reviewScore, contributionAverage]));
  const artifactAverage = average(artifacts.map((artifact) => artifact.aiQualityScan));
  const readinessScore = clampPercentage(
    average([
      technicalDepthScore,
      researchMaturityScore,
      architectureUnderstanding,
      communicationReadiness,
      artifactAverage,
      team.project.progress,
    ]),
  );
  const previousReadiness = previous
    ? average([
        previous.experimentationProgress,
        previous.literatureProgress,
        previous.writingProgress,
        deliveryRatio(previous),
      ])
    : readinessScore - 6;
  const trend = trendFrom(readinessScore, previousReadiness);
  const failureProbability = clampPercentage(100 - readinessScore + (latest?.criticalBacklogCount ?? 0) * 6);
  const technicalRejectionProbability = clampPercentage(100 - technicalDepthScore + (latest?.criticalBacklogCount ?? 0) * 7);
  const communicationBreakdownRisk = clampPercentage(100 - communicationReadiness);
  const researchQuestioningSurvival = clampPercentage(researchMaturityScore - team.submissions.filter((submission) => submission.type === "IEEE" && submission.status === "REVISION_REQUIRED").length * 8);
  const externalVivaConfidence = clampPercentage(
    average([readinessScore, confidenceScore, 100 - failureProbability, researchQuestioningSurvival]),
  );
  const weakAreas = [
    competency("Technical depth", technicalDepthScore, "Implementation ownership, code evidence, and experiment strength."),
    competency("Research understanding", researchMaturityScore, "Literature familiarity, novelty clarity, and methodology defense."),
    competency("System architecture clarity", architectureUnderstanding, "Can the team explain data flow, boundaries, and failure paths?"),
    competency("Real-world feasibility", average([deliveryRatio(latest), latest?.experimentationProgress ?? 0]), "Production constraints, stability, and operating limits."),
    competency("Problem understanding", team.project.progress, "Can the team explain why the problem matters and where scope ends?"),
    competency("Communication confidence", communicationReadiness, "Panel-facing clarity, pace, and confidence under pressure."),
    competency("Debugging ability", average(members.map((member) => member.liveDebugging)), "Ability to troubleshoot demo failures and explain root cause."),
    competency("Deployment understanding", average([latest?.experimentationProgress ?? 0, deliveryRatio(latest)]), "Runtime, scaling, monitoring, and rollback understanding."),
    competency("Paper defense capability", researchQuestioningSurvival, "Can they defend citations, method, novelty, and limitations?"),
    competency("Cross-question resilience", average([confidenceScore, architectureUnderstanding, researchQuestioningSurvival]), "Consistency under follow-up questioning."),
  ];
  const weakAreaLabels = weakAreas.filter((area) => area.value < 65).map((area) => area.label);
  const fakeReady =
    communicationReadiness >= 75 && (technicalDepthScore < 62 || architectureUnderstanding < 62);
  const dependencyRisk = members.filter(
    (member) => member.readinessLabel === "Defense Lead",
  ).length === 1 && members.filter((member) => member.riskState === "High" || member.riskState === "Critical").length > 0;
  const readinessState: DefenseReadinessTeam["readinessState"] =
    fakeReady
      ? "Fake Ready"
      : readinessScore >= 80 && failureProbability < 28
        ? "Defense Ready"
        : readinessScore >= 68
          ? "Recoverable"
          : readinessScore >= 55
            ? "Vulnerable"
            : "High Risk";
  const riskDetections = [
    fakeReady
      ? "Presentation quality exceeds implementation depth. Possible viva risk."
      : technicalDepthScore >= 75
        ? "Strong implementation clarity. Team can explain technical pipeline confidently."
        : "Technical depth is not yet panel-safe.",
    dependencyRisk
      ? "High dependency risk. Only one member can explain the defense-critical flow."
      : "Defense ownership is distributed across more than one contributor.",
    architectureUnderstanding < 60
      ? "Architecture understanding weak across non-lead members."
      : "Architecture walkthrough signal is acceptable.",
    researchMaturityScore < 60
      ? "Research familiarity low. Likely failure during literature questioning."
      : "Research maturity can survive standard literature questions.",
  ];

  return {
    id: team.id,
    team: team.name,
    project: team.project.title,
    batch: team.batch,
    mentor: team.faculty.name,
    readinessScore,
    confidenceScore,
    technicalDepthScore,
    researchMaturityScore,
    communicationReadiness,
    architectureUnderstanding,
    externalVivaConfidence,
    failureProbability,
    technicalRejectionProbability,
    communicationBreakdownRisk,
    researchQuestioningSurvival,
    improvementVelocity:
      readinessScore - previousReadiness >= 0
        ? `+${readinessScore - previousReadiness}% readiness movement`
        : `${readinessScore - previousReadiness}% readiness movement`,
    trend,
    readinessState,
    aiDiagnosis:
      readinessState === "Defense Ready"
        ? "Team is technically defensible with routine rehearsal."
        : readinessState === "Fake Ready"
          ? "Slide confidence is masking weak implementation and architecture defense."
          : readinessState === "High Risk"
            ? "External viva failure risk is high without immediate technical rehearsal."
            : "Team is recoverable if weak defense domains are drilled this week.",
    riskDetections,
    highRiskQuestioningAreas: weakAreaLabels.length > 0 ? weakAreaLabels : ["Scalability under stress"],
    competencies: weakAreas,
    artifacts,
    members,
    mockQuestions: buildMockQuestions(team, weakAreaLabels),
    stressAnalysis: [
      {
        label: "Hesitation areas",
        value: clampPercentage(100 - average([architectureUnderstanding, researchMaturityScore])),
        detail: weakAreaLabels.slice(0, 2).join(", ") || "No major hesitation cluster detected.",
      },
      {
        label: "Failed question recurrence",
        value: clampPercentage(team.submissions.filter((submission) => submission.status === "REVISION_REQUIRED" || submission.status === "REJECTED").length * 18),
        detail: "Repeated revision loops can predict repeated explanation gaps.",
      },
      {
        label: "Technical uncertainty",
        value: technicalRejectionProbability,
        detail: "Probability that implementation questions expose weak ownership.",
      },
      {
        label: "Memorized presentation pattern",
        value: fakeReady ? 76 : clampPercentage(communicationReadiness - technicalDepthScore),
        detail: "Detects confidence that is not backed by technical evidence.",
      },
    ],
    timeline: team.project.analytics.slice(-5).map((snapshot) => ({
      label: snapshot.label,
      readiness: clampPercentage(
        average([
          snapshot.performanceScore,
          snapshot.experimentationProgress,
          snapshot.literatureProgress,
          snapshot.writingProgress,
          deliveryRatio(snapshot),
        ]),
      ),
      technicalConfidence: clampPercentage(average([snapshot.experimentationProgress, deliveryRatio(snapshot)])),
      researchMaturity: clampPercentage(average([snapshot.literatureProgress, snapshot.writingProgress])),
      pressureHandling: clampPercentage(snapshot.performanceScore - snapshot.escalatedCount * 8),
    })),
    actions:
      readinessState === "Defense Ready"
        ? ["Schedule final mock viva", "Prepare external panel packet", "Lock defense artifact set"]
        : [
            "Schedule mock viva",
            "Force technical rehearsal",
            "Assign architecture review",
            "Request implementation demo",
            researchMaturityScore < 65 ? "Trigger research revision" : "Run cross-question drill",
            readinessState === "High Risk" || readinessState === "Fake Ready"
              ? "Freeze viva approval"
              : "Recommend external mentor",
            "Mark high-risk team",
          ],
  };
}

export async function getDefenseReadinessData(
  viewer: ViewerContext,
): Promise<DefenseReadinessData> {
  const teams = await db.team.findMany({
    where: getTeamScopeWhere(viewer),
    orderBy: [{ batch: "asc" }, { name: "asc" }],
    include: defenseReadinessInclude,
  });
  const readinessTeams = teams
    .map(buildDefenseTeam)
    .sort((left, right) => right.failureProbability - left.failureProbability);
  const highRiskTeams = readinessTeams.filter(
    (team) =>
      team.readinessState === "High Risk" ||
      team.readinessState === "Fake Ready" ||
      team.readinessState === "Vulnerable",
  );
  const fakeReadyTeams = readinessTeams.filter((team) => team.readinessState === "Fake Ready");
  const memberRisks = readinessTeams.flatMap((team) =>
    team.members.filter((member) => member.riskState === "High" || member.riskState === "Critical"),
  );
  const portfolio = {
    overallReadiness: average(readinessTeams.map((team) => team.readinessScore)),
    confidenceScore: average(readinessTeams.map((team) => team.confidenceScore)),
    technicalDepthScore: average(readinessTeams.map((team) => team.technicalDepthScore)),
    researchMaturity: average(readinessTeams.map((team) => team.researchMaturityScore)),
    diagnosis:
      highRiskTeams.length > 0
        ? `${highRiskTeams.length} teams are not external-panel safe yet.`
        : "All monitored teams are inside the recoverable defense band.",
  };
  const highestRisk = readinessTeams[0];

  return {
    stats: [
      {
        label: "Defense-ready teams",
        value: `${readinessTeams.filter((team) => team.readinessState === "Defense Ready").length}/${readinessTeams.length}`,
        detail: "Teams likely to survive external technical defense.",
        tone: "positive",
      },
      {
        label: "Fake-ready teams",
        value: `${fakeReadyTeams.length}`,
        detail: "High presentation confidence but weak technical depth.",
        tone: fakeReadyTeams.length > 0 ? "critical" : "positive",
      },
      {
        label: "Member questioning risk",
        value: `${memberRisks.length}`,
        detail: "Students vulnerable under architecture, research, or debugging questions.",
        tone: memberRisks.length > 0 ? "warning" : "positive",
      },
      {
        label: "External confidence",
        value: `${average(readinessTeams.map((team) => team.externalVivaConfidence))}%`,
        detail: "Predicted chance of a successful technical defense.",
        tone:
          average(readinessTeams.map((team) => team.externalVivaConfidence)) >= 75
            ? "positive"
            : "warning",
      },
    ],
    aiSummary: highestRisk
      ? `${highestRisk.team} should be rehearsed first. ${highestRisk.aiDiagnosis}`
      : "Defense readiness intelligence will appear once faculty teams are assigned.",
    portfolio,
    teams: readinessTeams,
    alerts: readinessTeams.slice(0, 6).map((team) =>
      buildActivityItem({
        id: team.id,
        title: `${team.team} defense readiness review`,
        detail: team.riskDetections[0] ?? team.aiDiagnosis,
        date:
          teams.find((record) => record.id === team.id)?.activityEvents[0]?.createdAt ??
          teams.find((record) => record.id === team.id)?.updatedAt ??
          new Date(),
        tag: team.readinessState,
        tone:
          team.readinessState === "High Risk" || team.readinessState === "Fake Ready"
            ? "critical"
            : team.readinessState === "Vulnerable"
              ? "warning"
              : "positive",
      }),
    ),
  };
}
