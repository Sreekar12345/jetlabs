import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireRole, requireSession } from "@/lib/auth/session";

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
        return apiSuccess({ problem: null, message: "Student is not in any team." });
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
      include: {
        selectedProblemStatement: true,
      },
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
        message: "You are not authorized to view this team's details.",
        status: 403,
      });
    }

    return apiSuccess({
      teamId: team.id,
      teamName: team.name,
      problem: team.selectedProblemStatement,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    console.error("Error fetching team problem statement:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while fetching the problem statement.",
      status: 500,
    });
  }
}
