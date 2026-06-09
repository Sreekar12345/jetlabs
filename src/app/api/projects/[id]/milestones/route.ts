import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireSession } from "@/lib/auth/session";
import {
  initializeProjectWeeklyMilestones,
  getOrCreateWeeklyMilestones,
} from "@/lib/services/milestone-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id: projectId } = await context.params;
    const userId = session.user.id;
    const userRole = session.user.role;

    // Check project exists and user has access
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            students: { select: { userId: true } },
          },
        },
      },
    });

    if (!project) {
      return apiError({ code: "NOT_FOUND", message: "Project not found.", status: 404 });
    }

    // Auth check: Admin, assigned Faculty, or Team Member Student
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
      return apiError({ code: "FORBIDDEN", message: "You do not have permission to access this project.", status: 403 });
    }

    // Fetch milestones (with getOrCreateWeeklyMilestones for backward compatibility)
    const milestones = await getOrCreateWeeklyMilestones(projectId, project.createdAt);

    return apiSuccess({ milestones });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("Error fetching milestones:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id: projectId } = await context.params;
    const userId = session.user.id;
    const userRole = session.user.role;

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        team: true,
      },
    });

    if (!project) {
      return apiError({ code: "NOT_FOUND", message: "Project not found.", status: 404 });
    }

    // Only Admin or project Faculty guide can force initialize milestones
    const isFacultyAdvisor = project.projectFacultyId === userId || project.team?.facultyId === userId;
    if (userRole !== "ADMIN" && !isFacultyAdvisor) {
      return apiError({ code: "FORBIDDEN", message: "Only the faculty guide can initialize milestones.", status: 403 });
    }

    await initializeProjectWeeklyMilestones(projectId, db, project.createdAt);

    return apiSuccess({ success: true, message: "Weekly milestones initialized successfully." });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("Error initializing milestones:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}
