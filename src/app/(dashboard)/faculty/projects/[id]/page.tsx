import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePageRole } from "@/lib/auth/session";
import { FacultyProjectWorkspace } from "@/components/dashboard/faculty-project-workspace";
import { getOrCreateWeeklyMilestones } from "@/lib/services/milestone-service";

export default async function FacultyProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePageRole("FACULTY");
  const userId = session.user.id;
  const { id: projectId } = await params;

  // 1. Fetch full project workspace details
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      team: {
        include: {
          students: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          faculty: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          submissions: {
            orderBy: { submittedAt: "desc" },
            take: 10,
          },
        },
      },
      problem: true,
      projectTasks: {
        orderBy: { dueDate: "asc" },
      },
      activityEvents: {
        orderBy: { createdAt: "desc" },
        take: 15,
      },
    },
  });

  if (!project) {
    notFound();
  }

  // 2. Enforce authorization: only assigned advisor or admins can access
  const isFacultyAdvisor =
    project.projectFacultyId === userId || project.team?.facultyId === userId;

  if (!isFacultyAdvisor) {
    redirect("/faculty/dashboard?reason=unauthorized");
  }

  // Transform team member role labels
  const leadMember = project.team?.students.find((s) => s.role === "TEAM_LEAD");
  const teamLeadUser = leadMember ? leadMember.user : null;
  const teamMembersList = project.team
    ? project.team.students.map((s) => ({
        id: s.user.id,
        name: s.user.name,
        email: s.user.email,
        role: s.role,
        roleLabel: s.roleLabel,
      }))
    : [];

  const weeklyMilestones = await getOrCreateWeeklyMilestones(project.id, project.createdAt);

  return (
    <FacultyProjectWorkspace
      project={{
        id: project.id,
        title: project.title,
        description: project.description,
        domain: project.domain,
        difficulty: project.difficulty,
        status: project.managementStatus,
        progress: project.progressPercentage,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }}
      team={
        project.team
          ? {
              id: project.team.id,
              name: project.team.name,
              batch: project.team.batch,
              lead: teamLeadUser,
              members: teamMembersList,
            }
          : null
      }
      facultyGuide={project.team?.faculty ?? null}
      problem={project.problem}
      initialTasks={project.projectTasks}
      initialActivity={project.activityEvents}
      submissions={project.team?.submissions ?? []}
      initialMilestones={weeklyMilestones}
    />
  );
}
