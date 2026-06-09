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
    const { id: milestoneId } = await context.params;
    const userId = session.user.id;
    const userRole = session.user.role;

    // Fetch the milestone and verify authorization via its project
    const milestone = await db.weeklyMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        project: {
          include: {
            team: {
              include: {
                students: { select: { userId: true } },
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      return apiError({ code: "NOT_FOUND", message: "Milestone not found.", status: 404 });
    }

    const project = milestone.project;
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
      return apiError({ code: "FORBIDDEN", message: "You are not authorized to view contributions for this milestone.", status: 403 });
    }

    // Fetch contributions
    const contributions = await db.contribution.findMany({
      where: { milestoneId },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        assigner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess({ contributions });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("Error fetching contributions:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}
