import { requirePageSession } from "@/lib/auth/session";
import { getStudentVivaData } from "@/lib/services/defense-readiness-service";
import { VivaClient } from "./viva-client";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default async function StudentVivaPage() {
  const session = await requirePageSession();
  const data = await getStudentVivaData(session.user.id);

  if (!data) {
    return (
      <PageContainer
        title="Viva Readiness"
        description="Practice defending your project under real faculty-style questioning."
      >
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <AlertTriangle className="size-12 text-amber-500" />
            <h2 className="mt-4 text-xl font-semibold">Team Assignment Required</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              You are currently not mapped to any project team. Please choose a problem from the Problem Marketplace or contact your administrator to assign you to a capstone team.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Safe mapping of the team fields to match VivaClient props
  const mappedData = {
    id: data.id,
    team: data.team,
    project: data.project,
    batch: data.batch,
    mentor: data.mentor,
    readinessScore: data.readinessScore,
    confidenceScore: data.confidenceScore,
    technicalDepthScore: data.technicalDepthScore,
    researchMaturityScore: data.researchMaturityScore,
    communicationReadiness: data.communicationReadiness,
    architectureUnderstanding: data.architectureUnderstanding,
    externalVivaConfidence: data.externalVivaConfidence,
    failureProbability: data.failureProbability,
    technicalRejectionProbability: data.technicalRejectionProbability,
    communicationBreakdownRisk: data.communicationBreakdownRisk,
    researchQuestioningSurvival: data.researchQuestioningSurvival,
    readinessState: data.readinessState,
    aiDiagnosis: data.aiDiagnosis,
    riskDetections: data.riskDetections,
    highRiskQuestioningAreas: data.highRiskQuestioningAreas,
    competencies: data.competencies.map((c) => ({
      label: c.label,
      value: c.value,
      detail: c.detail,
    })),
    artifacts: data.artifacts.map((art) => ({
      id: art.id,
      label: art.label,
      type: art.type,
      uploadCompleteness: art.uploadCompleteness,
      reviewStatus: art.reviewStatus,
      missingSections: art.missingSections,
    })),
    members: data.members.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      readinessLabel: m.readinessLabel,
      riskState: m.riskState,
    })),
    mockQuestions: data.mockQuestions.map((q) => ({
      id: q.id,
      category: q.category,
      pressure: q.pressure,
      question: q.question,
      expectedEvidence: q.expectedEvidence,
      weakSignal: q.weakSignal,
    })),
  };

  return <VivaClient data={mappedData} userName={session.user.name || "Student"} />;
}
