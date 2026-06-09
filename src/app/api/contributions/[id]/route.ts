import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireSession } from "@/lib/auth/session";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id: contributionId } = await context.params;
    const userId = session.user.id;
    const userRole = session.user.role;

    let body;
    try {
      body = await request.json();
    } catch {
      return apiError({ code: "BAD_REQUEST", message: "Invalid JSON body.", status: 400 });
    }

    const { title, description, assignedTo, status } = body;

    // Fetch the contribution
    const contribution = await db.contribution.findUnique({
      where: { id: contributionId },
      include: {
        milestone: {
          include: {
            project: {
              include: {
                team: true,
              },
            },
          },
        },
      },
    });

    if (!contribution) {
      return apiError({ code: "NOT_FOUND", message: "Contribution not found.", status: 404 });
    }

    const team = contribution.milestone.project.team;
    if (!team) {
      return apiError({ code: "BAD_REQUEST", message: "No team associated with project.", status: 400 });
    }

    // Authorize: TEAM_LEAD, ADMIN, the project's assigned advisor, or the assignee of the contribution
    const currentMember = await db.teamMember.findFirst({
      where: { userId, teamId: team.id },
    });
    const isFacultyAdvisor = contribution.milestone.project.projectFacultyId === userId || team.facultyId === userId;
    const isAssignee = contribution.assignedTo === userId;
    const isTeamLead = currentMember?.role === "TEAM_LEAD";

    if (userRole !== "ADMIN" && !isFacultyAdvisor && !isAssignee && (!currentMember || currentMember.role !== "TEAM_LEAD")) {
      return apiError({ code: "FORBIDDEN", message: "Unauthorized operation.", status: 403 });
    }

    // Assignee (non-lead, non-advisor, non-admin) can ONLY update the status, and only to ASSIGNED or IN_PROGRESS
    if (isAssignee && !isFacultyAdvisor && !isTeamLead && userRole !== "ADMIN") {
      if (title !== undefined || description !== undefined || assignedTo !== undefined) {
        return apiError({
          code: "FORBIDDEN",
          message: "Students can only update the status of their assigned tasks.",
          status: 403,
        });
      }
      if (status !== undefined && status !== "ASSIGNED" && status !== "IN_PROGRESS") {
        return apiError({
          code: "FORBIDDEN",
          message: "Invalid status update. Submit work via the submit endpoint.",
          status: 403,
        });
      }
    }

    // Check weekly locking (only if edited by team lead or assignee)
    if (!isFacultyAdvisor) {
      const milestone = contribution.milestone;
      if (milestone.weekNumber > 1) {
        const prevMilestone = await db.weeklyMilestone.findFirst({
          where: { projectId: milestone.projectId, weekNumber: milestone.weekNumber - 1 },
        });
        if (!prevMilestone || prevMilestone.status !== "COMPLETED") {
          return apiError({ code: "FORBIDDEN", message: "This weekly milestone is locked.", status: 403 });
        }
      }
    }

    // If changing assignee, verify they are in the team
    if (assignedTo && assignedTo !== contribution.assignedTo) {
      const targetMember = await db.teamMember.findFirst({
        where: { userId: assignedTo, teamId: team.id },
      });
      if (!targetMember) {
        return apiError({ code: "BAD_REQUEST", message: "Target assignee is not a member of your team.", status: 400 });
      }
    }

    // Update
    const updated = await db.contribution.update({
      where: { id: contributionId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(assignedTo !== undefined ? { assignedTo } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });

    return apiSuccess({ success: true, contribution: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("Error updating contribution details:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}
