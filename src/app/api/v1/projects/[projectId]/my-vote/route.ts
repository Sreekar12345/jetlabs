import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireSession } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await requireSession();
    const { projectId } = await context.params;
    const userId = session.user.id;
    const userRole = session.user.role;

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { team: true }
    });

    if (!project) {
      return apiError({ code: "NOT_FOUND", message: "Project not found.", status: 404 });
    }

    if (userRole !== "STUDENT") {
      // Faculty and Admin do not vote
      return apiSuccess({ vote: null });
    }

    // Student: find team membership
    const membership = await db.teamMember.findFirst({
      where: { userId, teamId: project.team?.id },
      include: { user: true }
    });

    if (!membership) {
      return apiError({ code: "FORBIDDEN", message: "You do not belong to this project team.", status: 403 });
    }

    if (!membership.user.isActive) {
      return apiError({ code: "FORBIDDEN", message: "User account is inactive.", status: 403 });
    }

    // Query their vote
    const userVote = await db.projectApprovalVote.findUnique({
      where: {
        teamId_projectId_memberId: {
          teamId: membership.teamId,
          projectId: projectId,
          memberId: userId,
        }
      }
    });

    return apiSuccess({ vote: userVote ? userVote.vote : null });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("Error fetching my-vote:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}
