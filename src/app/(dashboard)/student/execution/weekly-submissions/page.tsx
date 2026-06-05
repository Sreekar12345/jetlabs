import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getStudentSubmissions } from "@/lib/services/dashboard-service";
import { WeeklySubmissionsClient } from "./weekly-submissions-client";

export default async function WeeklySubmissionsPage() {
  const session = await requirePageSession();
  
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
