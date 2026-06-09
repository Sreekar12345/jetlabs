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
        message: "You are not authorized to view this project's activity feed.",
        status: 403,
      });
    }

    const activityEvents = await db.activityEvent.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    return apiSuccess({ activity: activityEvents });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    console.error("Error fetching project activity feed:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while fetching activity feed.",
      status: 500,
    });
  }
}
