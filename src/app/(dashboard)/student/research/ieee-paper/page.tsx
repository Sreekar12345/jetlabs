import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { IEEEPaperClient } from "./ieee-paper-client";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { REQUIRE_VERIFICATION_BEFORE_ACCESS } from "@/lib/auth/verification-settings";

export default async function IEEEPaperPage() {
  const session = await requirePageSession();

  // Fetch user verification status
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { verificationStatus: true },
  });

  if (REQUIRE_VERIFICATION_BEFORE_ACCESS && user?.verificationStatus !== "VERIFIED") {
    return (
      <PageContainer
        title="IEEE research paper"
        description="Section-by-section drafting with faculty review"
      >
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <Card className="max-w-md border-slate-200 bg-white shadow-xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-5">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650">
                <ShieldAlert className="size-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Verification Required</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Access to research publication workflows is locked until your student profile is verified by your advisor. Please check your profile status and update any incorrect details.
                </p>
              </div>
              <Link
                href="/student/profile"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors"
              >
                Go to Profile
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }


  // 1. Fetch team membership
  const membership = await db.teamMember.findFirst({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          project: true,
          submissions: {
            where: { type: "IEEE" },
            orderBy: { submittedAt: "desc" },
            include: {
              submittedBy: { select: { name: true } },
              reviewedBy: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!membership) {
    return (
      <PageContainer
        title="IEEE research paper"
        description="Section-by-section drafting with faculty review"
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
  const submissions = team.submissions.map((sub: any) => ({
    id: sub.id,
    type: sub.type,
    title: sub.title,
    content: sub.content,
    status: sub.status,
    submittedAt: sub.submittedAt.toISOString(),
    reviewedAt: sub.reviewedAt ? sub.reviewedAt.toISOString() : null,
    feedback: sub.feedback,
    score: sub.score,
    submittedBy: sub.submittedBy ? { name: sub.submittedBy.name } : null,
    reviewedBy: sub.reviewedBy ? { name: sub.reviewedBy.name } : null,
  }));

  return (
    <IEEEPaperClient
      team={{
        id: team.id,
        name: team.name,
        batch: team.batch,
        projectTitle: team.projectTitle,
        project: {
          id: team.project.id,
          title: team.project.title,
          description: team.project.description,
          progress: team.project.progress,
        },
      }}
      submissions={submissions}
    />
  );
}
