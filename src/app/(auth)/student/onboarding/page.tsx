import { requirePageRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./onboarding-client";

export const metadata = {
  title: "Onboarding - Join Your Team | JetLabs",
  description: "Complete your onboarding by joining a team with a team code or requesting a team assignment.",
};

export default async function OnboardingPage() {
  const session = await requirePageRole("STUDENT");

  // Fetch student assignment status directly from database
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { teamId: true },
  });

  // If they already have a team, bypass onboarding and go to dashboard
  if (user?.teamId) {
    redirect("/student/dashboard");
  }

  return <OnboardingClient userName={session.user.name || "Student"} />;
}
