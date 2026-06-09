import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const userRole = session.user.role;

    if (userRole === "STUDENT") {
      const membership = await db.teamMember.findFirst({
        where: { userId },
        include: {
          team: {
            include: {
              project: {
                include: {
                  problem: true,
                },
              },
            },
          },
        },
      });

      if (!membership || !membership.team || !membership.team.project) {
        return apiSuccess({ projects: [] });
      }

      return apiSuccess({ projects: [membership.team.project] });
    }

    if (userRole === "FACULTY") {
      const projects = await db.project.findMany({
        where: {
          OR: [
            { projectFacultyId: userId },
            { team: { facultyId: userId } },
          ],
        },
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
            },
          },
          problem: true,
        },
        orderBy: { updatedAt: "desc" },
      });

      return apiSuccess({ projects });
    }

    if (userRole === "ADMIN") {
      const projects = await db.project.findMany({
        include: {
          team: true,
          problem: true,
        },
        orderBy: { updatedAt: "desc" },
      });

      return apiSuccess({ projects });
    }

    return apiError({
      code: "FORBIDDEN",
      message: "Access denied.",
      status: 403,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    console.error("Error fetching projects:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while fetching projects.",
      status: 500,
    });
  }
}
