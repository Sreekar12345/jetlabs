import { redirect } from "next/navigation";
import Link from "next/link";
import { Compass, Target } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageSession } from "@/lib/auth/session";
import { StudentProjectWorkspace } from "@/components/dashboard/student-project-workspace";
import { Button } from "@/components/ui/button";
import { getOrCreateWeeklyMilestones } from "@/lib/services/milestone-service";

export default async function StudentProjectPage() {
  const session = await requirePageSession();
  const userId = session.user.id;

  // 1. Fetch student's team membership details
  const membership = await db.teamMember.findFirst({
    where: { userId },
    select: { teamId: true, role: true },
  });

  if (!membership || !membership.teamId) {
    redirect("/student/onboarding/team");
  }

  // 2. Fetch full team, project, guide, and task details
  const team = await db.team.findUnique({
    where: { id: membership.teamId },
    include: {
      project: {
        include: {
          problem: true,
          projectTasks: {
            orderBy: { dueDate: "asc" },
          },
          activityEvents: {
            orderBy: { createdAt: "desc" },
            take: 15,
          },
        },
      },
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
    },
  });

  if (!team) {
    redirect("/student/onboarding/team");
  }

  const project = team.project;
  const isTeamLead = membership.role === "TEAM_LEAD";

  // If no problem statement has been selected yet, guide the student to the market
  if (!project || !project.problemId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] p-6 text-center text-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 max-w-md shadow-sm space-y-6">
          <div className="size-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-sm animate-pulse">
            <Compass className="size-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Project Workspace Pending</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Your central workspace, timelines, and tasks will become active as soon as a Problem Statement is selected.
            </p>
          </div>
          <div className="pt-2">
            {isTeamLead ? (
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-none py-5">
                <Link href="/student/research/problem-market" className="flex items-center justify-center gap-2">
                  <Target className="size-4" />
                  Select Problem Statement
                </Link>
              </Button>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs text-slate-650 font-medium leading-relaxed">
                  Only the **Team Lead** is authorized to select a problem statement. Please request your Team Lead to complete project selection in the Problem Marketplace.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Transform team member role labels
  const leadMember = team.students.find((s) => s.role === "TEAM_LEAD");
  const teamLeadUser = leadMember ? leadMember.user : null;
  const teamMembersList = team.students.map((s) => ({
    id: s.user.id,
    name: s.user.name,
    email: s.user.email,
    role: s.role,
    roleLabel: s.roleLabel,
  }));

  const weeklyMilestones = await getOrCreateWeeklyMilestones(project.id, project.createdAt);

  return (
    <StudentProjectWorkspace
      currentUserId={userId}
      isTeamLead={isTeamLead}
      project={project}
      team={{
        id: team.id,
        name: team.name,
        batch: team.batch,
        lead: teamLeadUser,
        members: teamMembersList,
      }}
      facultyGuide={team.faculty}
      problem={project.problem}
      initialTasks={project.projectTasks}
      initialActivity={project.activityEvents}
      initialMilestones={weeklyMilestones}
    />
  );
}
