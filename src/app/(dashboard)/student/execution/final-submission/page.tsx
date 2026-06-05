import { Submission } from "@prisma/client";
import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { FinalSubmissionClient } from "./final-submission-client";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default async function FinalSubmissionPage() {
  const session = await requirePageSession();

  // 1. Fetch team membership with project and all submissions
  const membership = await db.teamMember.findFirst({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          project: true,
          submissions: {
            orderBy: { submittedAt: "desc" },
          },
        },
      },
    },
  });

  if (!membership) {
    return (
      <PageContainer
        title="Final Submission"
        description="Submit all required deliverables before viva evaluation."
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

  const team = membership.team;
  const submissions = team.submissions.map((s: Submission) => ({
    id: s.id,
    type: s.type,
    title: s.title,
    content: s.content,
    status: s.status,
    submittedAt: s.submittedAt,
    feedback: s.feedback,
  }));

  return (
    <FinalSubmissionClient
      submissions={submissions}
      team={{
        id: team.id,
        name: team.name,
        batch: team.batch,
        projectTitle: team.projectTitle,
        project: {
          id: team.project.id,
          title: team.project.title,
          description: team.project.description,
        },
      }}
    />
  );
}
