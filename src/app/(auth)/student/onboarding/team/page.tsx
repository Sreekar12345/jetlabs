import { requirePageRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingTeamClient } from "./onboarding-team-client";

export default async function OnboardingTeamPage() {
  // Checks session, ensures they are a student. Redirects automatically if not.
  const session = await requirePageRole("STUDENT");
  const userId = session.user.id;

  // Fetch student info
  const student = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      teamId: true,
    },
  });

  if (!student) {
    redirect("/auth/login?reason=expired");
  }

  // If student already has a team, bypass onboarding and send to dashboard
  if (student.teamId) {
    redirect("/student/dashboard");
  }

  // Check if they have a pending team assignment request
  const pendingRequest = await db.teamAssignmentRequest.findFirst({
    where: {
      studentId: userId,
      status: "pending",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <OnboardingTeamClient
      userName={student.name || "Student"}
      pendingRequest={pendingRequest ? {
        id: pendingRequest.id,
        collegeName: pendingRequest.collegeName,
        department: pendingRequest.department,
        section: pendingRequest.section,
        facultyName: pendingRequest.facultyName,
        notes: pendingRequest.notes,
        status: pendingRequest.status,
        createdAt: pendingRequest.createdAt,
      } : null}
    />
  );
}
