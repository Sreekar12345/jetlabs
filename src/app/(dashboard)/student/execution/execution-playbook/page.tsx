import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { PlaybookClient } from "./playbook-client";

export default async function ExecutionPlaybookPage() {
  const session = await requirePageSession();

  // Fetch the student's active team, project milestones, and submissions
  const membership = await db.teamMember.findFirst({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          project: {
            include: {
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
          },
        },
      },
    },
  });

  const team = membership?.team ?? null;
  const project = team?.project ?? null;
  const submissions = team?.submissions ?? [];
  const milestones = project?.milestones ?? [];

  return (
    <PlaybookClient
      team={team ? JSON.parse(JSON.stringify(team)) : null}
      project={project ? JSON.parse(JSON.stringify(project)) : null}
      submissions={JSON.parse(JSON.stringify(submissions))}
      milestones={JSON.parse(JSON.stringify(milestones))}
    />
  );
}
