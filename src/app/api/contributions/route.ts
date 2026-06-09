import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const userRole = session.user.role;

    let body;
    try {
      body = await request.json();
    } catch {
      return apiError({ code: "BAD_REQUEST", message: "Invalid JSON body.", status: 400 });
    }

    const { milestoneId, assignedTo, title, description } = body;

    if (!milestoneId || !assignedTo || !title) {
      return apiError({ code: "BAD_REQUEST", message: "milestoneId, assignedTo, and title are required.", status: 400 });
    }

    // 1. Fetch milestone and verify project/team
    const milestone = await db.weeklyMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        project: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!milestone) {
      return apiError({ code: "NOT_FOUND", message: "Weekly milestone not found.", status: 404 });
    }

    const team = milestone.project.team;
    if (!team) {
      return apiError({ code: "BAD_REQUEST", message: "This project has no active team linked.", status: 400 });
    }

    // 2. Validate current user is TEAM_LEAD in the team
    const currentMember = await db.teamMember.findFirst({
      where: { userId, teamId: team.id },
    });

    if (!currentMember || currentMember.role !== "TEAM_LEAD") {
      return apiError({ code: "FORBIDDEN", message: "Only the Team Lead can assign weekly contributions.", status: 403 });
    }

    // 3. Validate target assignee is in the team
    const targetMember = await db.teamMember.findFirst({
      where: { userId: assignedTo, teamId: team.id },
    });

    if (!targetMember) {
      return apiError({ code: "BAD_REQUEST", message: "Target assignee is not a member of your team.", status: 400 });
    }

    // 4. Verify weekly locking: Week N+1 locks until Week N is COMPLETED
    if (milestone.weekNumber > 1) {
      const prevMilestone = await db.weeklyMilestone.findFirst({
        where: { projectId: milestone.projectId, weekNumber: milestone.weekNumber - 1 },
      });

      if (!prevMilestone || prevMilestone.status !== "COMPLETED") {
        return apiError({
          code: "FORBIDDEN",
          message: `This milestone is locked. You must complete Week ${milestone.weekNumber - 1} first.`,
          status: 403,
        });
      }
    }

    // 5. Create or update contribution assignment
    const existing = await db.contribution.findFirst({
      where: { milestoneId, assignedTo },
    });

    let contribution;
    if (existing) {
      contribution = await db.contribution.update({
        where: { id: existing.id },
        data: {
          title,
          description: description || null,
          assignedBy: userId,
        },
      });
    } else {
      contribution = await db.contribution.create({
        data: {
          milestoneId,
          assignedTo,
          assignedBy: userId,
          title,
          description: description || null,
          status: "ASSIGNED",
        },
      });
    }

    // Automatically set WeeklyMilestone status to IN_PROGRESS when work is assigned
    if (milestone.status === "NOT_STARTED") {
      await db.weeklyMilestone.update({
        where: { id: milestoneId },
        data: { status: "IN_PROGRESS" },
      });
    }

    return apiSuccess({ success: true, contribution });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("Error creating contribution:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}
