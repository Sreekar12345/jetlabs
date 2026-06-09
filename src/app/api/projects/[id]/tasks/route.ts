import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireSession } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const userRole = session.user.role;
    const { id: projectId } = await context.params;

    // Check project authorization
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        projectFacultyId: true,
        team: {
          select: {
            id: true,
            facultyId: true,
            students: { select: { userId: true } },
          },
        },
      },
    });

    if (!project) {
      return apiError({
        code: "NOT_FOUND",
        message: "Project not found.",
        status: 404,
      });
    }

    let authorized = false;
    if (userRole === "ADMIN") {
      authorized = true;
    } else if (userRole === "FACULTY") {
      if (project.projectFacultyId === userId || project.team?.facultyId === userId) {
        authorized = true;
      }
    } else if (userRole === "STUDENT" && project.team) {
      if (project.team.students.some((s) => s.userId === userId)) {
        authorized = true;
      }
    }

    if (!authorized) {
      return apiError({
        code: "FORBIDDEN",
        message: "You are not authorized to view this project's tasks.",
        status: 403,
      });
    }

    const tasks = await db.projectTask.findMany({
      where: { projectId },
      orderBy: { dueDate: "asc" },
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

    console.error("Error fetching project tasks:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while fetching tasks.",
      status: 500,
    });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const userRole = session.user.role;
    const { id: projectId } = await context.params;

    // Fetch project and verify authorization
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            students: { select: { userId: true, role: true } },
          },
        },
      },
    });

    if (!project) {
      return apiError({
        code: "NOT_FOUND",
        message: "Project not found.",
        status: 404,
      });
    }

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

    const { taskId, action, title, description, dueDate, status } = body;

    const isFacultyAdvisor =
      project.projectFacultyId === userId || project.team?.facultyId === userId;
    const isTeamLead =
      project.team?.students.some((s) => s.userId === userId && s.role === "TEAM_LEAD") ?? false;
    const isTeamMember =
      project.team?.students.some((s) => s.userId === userId) ?? false;

    // Action 1: DELETE TASK
    if (taskId && action === "DELETE") {
      // Only Faculty Advisor or Admin can delete tasks
      if (userRole !== "ADMIN" && !isFacultyAdvisor) {
        return apiError({
          code: "FORBIDDEN",
          message: "Only the Faculty Advisor can delete project tasks.",
          status: 403,
        });
      }

      const task = await db.projectTask.findUnique({
        where: { id: taskId },
      });

      if (!task || task.projectId !== projectId) {
        return apiError({
          code: "NOT_FOUND",
          message: "Task not found.",
          status: 404,
        });
      }

      await db.projectTask.delete({
        where: { id: taskId },
      });

      // Log activity event
      await db.activityEvent.create({
        data: {
          teamId: project.team?.id,
          projectId: project.id,
          userId,
          type: "milestone",
          title: "Project task deleted",
          detail: `Faculty advisor deleted task: "${task.title}".`,
        },
      });

      return apiSuccess({ success: true, message: "Task successfully deleted." });
    }

    // Action 2: UPDATE TASK
    if (taskId) {
      const task = await db.projectTask.findUnique({
        where: { id: taskId },
      });

      if (!task || task.projectId !== projectId) {
        return apiError({
          code: "NOT_FOUND",
          message: "Task not found.",
          status: 404,
        });
      }

      // Authorization check for editing
      // Faculty Advisor and Admin can edit anything. Team Lead can only update status.
      let canUpdate = false;
      let onlyUpdateStatus = false;

      if (userRole === "ADMIN" || isFacultyAdvisor) {
        canUpdate = true;
      } else if (isTeamLead) {
        canUpdate = true;
        onlyUpdateStatus = true;
      }

      if (!canUpdate) {
        return apiError({
          code: "FORBIDDEN",
          message: "You are not authorized to update this task.",
          status: 403,
        });
      }

      const updatedTask = await db.projectTask.update({
        where: { id: taskId },
        data: {
          ...(onlyUpdateStatus
            ? { status: status || task.status }
            : {
                title: title !== undefined ? title : task.title,
                description: description !== undefined ? description : task.description,
                dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate,
                status: status !== undefined ? status : task.status,
              }),
        },
      });

      // Log activity event
      await db.activityEvent.create({
        data: {
          teamId: project.team?.id,
          projectId: project.id,
          userId,
          type: "milestone",
          title: "Project task updated",
          detail: `Task "${updatedTask.title}" updated to status "${updatedTask.status}".`,
        },
      });

      return apiSuccess({ success: true, task: updatedTask });
    }

    // Action 3: CREATE TASK
    // Only Faculty Advisor or Admin can create tasks
    if (userRole !== "ADMIN" && !isFacultyAdvisor) {
      return apiError({
        code: "FORBIDDEN",
        message: "Only the Faculty Advisor can create project tasks.",
        status: 403,
      });
    }

    if (!title) {
      return apiError({
        code: "BAD_REQUEST",
        message: "Task title is required.",
        status: 400,
      });
    }

    const newTask = await db.projectTask.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || "PENDING",
        projectId,
        createdBy: userId,
      },
    });

    // Log activity event
    await db.activityEvent.create({
      data: {
        teamId: project.team?.id,
        projectId: project.id,
        userId,
        type: "milestone",
        title: "Project task created",
        detail: `Faculty advisor created task: "${title}".`,
      },
    });

    return apiSuccess({ success: true, task: newTask });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    console.error("Error managing project task:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while managing project task.",
      status: 500,
    });
  }
}
