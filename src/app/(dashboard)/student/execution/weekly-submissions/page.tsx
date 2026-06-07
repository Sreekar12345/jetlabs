import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getStudentSubmissions } from "@/lib/services/dashboard-service";
import { WeeklySubmissionsClient } from "./weekly-submissions-client";
import { REQUIRE_VERIFICATION_BEFORE_ACCESS } from "@/lib/auth/verification-settings";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function WeeklySubmissionsPage() {
  const session = await requirePageSession();
  
  // Fetch user verification status
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { verificationStatus: true },
  });

  if (REQUIRE_VERIFICATION_BEFORE_ACCESS && user?.verificationStatus !== "VERIFIED") {
    return (
      <PageContainer
        title="Weekly Submissions"
        description="Evidence pipeline for sprint-by-sprint delivery."
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
                  Access to project submissions is locked until your student profile is verified by your advisor. Please check your profile status and update any incorrect details.
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

  // Find the student's team
  const member = await db.teamMember.findFirst({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          project: {
            include: {
              problem: true,
            },
          },
        },
      },
    },
  });

  const team = member?.team ?? null;
  const submissions = await getStudentSubmissions(session.user.id);

  return (
    <WeeklySubmissionsClient 
      initialSubmissions={JSON.parse(JSON.stringify(submissions))}
      team={team ? JSON.parse(JSON.stringify(team)) : null}
      user={{ id: session.user.id, name: session.user.name || "Student" }}
    />
  );
}

