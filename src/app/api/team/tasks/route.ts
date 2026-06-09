import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const userRole = session.user.role;

    let teamId: string | null = null;

    if (userRole === "STUDENT") {
      const membership = await db.teamMember.findFirst({
        where: { userId },
        select: { teamId: true },
      });

      if (!membership) {
        return apiSuccess({ tasks: [] });
      }
      teamId = membership.teamId;
    } else if (userRole === "FACULTY" || userRole === "ADMIN") {
      const { searchParams } = new URL(request.url);
      teamId = searchParams.get("teamId");

      if (!teamId) {
        return apiError({
          code: "BAD_REQUEST",
          message: "teamId parameter is required for faculty/admin users.",
          status: 400,
        });
      }
    } else {
      return apiError({
        code: "FORBIDDEN",
        message: "Access denied.",
        status: 403,
      });
    }

    const team = await db.team.findUnique({
      where: { id: teamId },
      select: { id: true, facultyId: true },
    });

    if (!team) {
      return apiError({
        code: "NOT_FOUND",
        message: "Team not found.",
        status: 404,
      });
    }

    // For faculty, verify they are the advisor for this team
    if (userRole === "FACULTY" && team.facultyId !== userId) {
      return apiError({
        code: "FORBIDDEN",
        message: "You are not authorized to view this team's tasks.",
        status: 403,
      });
    }

    const tasks = await db.teamTask.findMany({
      where: { teamId },
      orderBy: [
        { week: "asc" },
        { createdAt: "desc" },
      ],
    });

    return apiSuccess({ tasks });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    console.error("Error fetching tasks:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while fetching tasks.",
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const userRole = session.user.role;

    let body;
    try {
      body = await request.json();
    } catch {
      return apiError({
        code: "BAD_REQUEST",
        message: "Invalid JSON body.",
        status: 400,
      });
    }

    const { taskId, title, description, week, status, teamId: requestTeamId } = body;

    // Check if updating or creating
    if (taskId) {
      // --- UPDATE TASK ---
      const existingTask = await db.teamTask.findUnique({
        where: { id: taskId },
        include: { team: true },
      });

      if (!existingTask) {
        return apiError({
          code: "NOT_FOUND",
          message: "Task not found.",
          status: 404,
        });
      }

      // Check authorization:
      if (userRole === "STUDENT") {
        const membership = await db.teamMember.findFirst({
          where: { userId, teamId: existingTask.teamId },
        });
        if (!membership) {
          return apiError({
            code: "FORBIDDEN",
            message: "You are not a member of this team.",
            status: 403,
          });
        }
      } else if (userRole === "FACULTY") {
        if (existingTask.team.facultyId !== userId) {
          return apiError({
            code: "FORBIDDEN",
            message: "You are not authorized to update tasks for this team.",
            status: 403,
          });
        }
      } else if (userRole !== "ADMIN") {
        return apiError({
          code: "FORBIDDEN",
          message: "Access denied.",
          status: 403,
        });
      }

      // Perform update
      const updatedTask = await db.teamTask.update({
        where: { id: taskId },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(week !== undefined ? { week: Number(week) } : {}),
          ...(status !== undefined ? { status } : {}),
        },
      });

      // Log activity event for progress update
      await db.activityEvent.create({
        data: {
          teamId: existingTask.teamId,
          userId,
          type: "milestone",
          title: "Team task updated",
          detail: `Task "${updatedTask.title}" updated to status "${updatedTask.status}".`,
        },
      });

      return apiSuccess({
        success: true,
        task: updatedTask,
      });
    } else {
      // --- CREATE TASK ---
      if (!title || week === undefined) {
        return apiError({
          code: "BAD_REQUEST",
          message: "title and week are required to create a task.",
          status: 400,
        });
      }

      let teamId: string | null = null;

      if (userRole === "STUDENT") {
        const membership = await db.teamMember.findFirst({
          where: { userId },
          select: { teamId: true },
        });

        if (!membership) {
          return apiError({
            code: "FORBIDDEN",
            message: "You must be in a team to create tasks.",
            status: 403,
          });
        }
        teamId = membership.teamId;

        // If teamId was passed, ensure student belongs to it
        if (requestTeamId && requestTeamId !== teamId) {
          return apiError({
            code: "FORBIDDEN",
            message: "You cannot create tasks for another team.",
            status: 403,
          });
        }
      } else if (userRole === "FACULTY" || userRole === "ADMIN") {
        teamId = requestTeamId;
        if (!teamId) {
          return apiError({
            code: "BAD_REQUEST",
            message: "teamId is required for faculty/admin to create a task.",
            status: 400,
          });
        }

        const team = await db.team.findUnique({
          where: { id: teamId },
          select: { facultyId: true },
        });

        if (!team) {
          return apiError({
            code: "NOT_FOUND",
            message: "Team not found.",
            status: 404,
          });
        }

        if (userRole === "FACULTY" && team.facultyId !== userId) {
          return apiError({
            code: "FORBIDDEN",
            message: "You are not authorized to create tasks for this team.",
            status: 403,
          });
        }
      } else {
        return apiError({
          code: "FORBIDDEN",
          message: "Access denied.",
          status: 403,
        });
      }

      // Create new task
      const newTask = await db.teamTask.create({
        data: {
          teamId,
          title,
          description: description || null,
          week: Number(week),
          status: status || "PENDING",
        },
      });

      // Log activity event
      await db.activityEvent.create({
        data: {
          teamId,
          userId,
          type: "milestone",
          title: "New team task created",
          detail: `Task "${title}" created for Week ${week}.`,
        },
      });

      return apiSuccess({
        success: true,
        task: newTask,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    console.error("Error creating/updating task:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while managing the task.",
      status: 500,
    });
  }
}
