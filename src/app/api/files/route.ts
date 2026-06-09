import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getSubmissionFiles } from "@/lib/services/file-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePageSession();
    const userId = session.user.id;
    const userRole = session.user.role;

    const searchParams = request.nextUrl.searchParams;
    const submissionId = searchParams.get("submissionId");
    const teamId = searchParams.get("teamId");

    if (submissionId) {
      // Find submission in Submission table
      const submission = await db.submission.findUnique({
        where: { id: submissionId },
        select: { teamId: true }
      });
      
      if (!submission) {
        return apiError({ code: "NOT_FOUND", message: "Submission not found.", status: 404 });
      }

      if (userRole === "STUDENT") {
        const membership = await db.teamMember.findFirst({
          where: { userId, teamId: submission.teamId }
        });
        if (!membership) {
          return apiError({ code: "FORBIDDEN", message: "Unauthorized team access.", status: 403 });
        }
      } else if (userRole === "FACULTY") {
        const team = await db.team.findUnique({
          where: { id: submission.teamId }
        });
        if (team?.facultyId !== userId) {
          return apiError({ code: "FORBIDDEN", message: "Unauthorized advising access.", status: 403 });
        }
      } else if (userRole !== "ADMIN") {
        return apiError({ code: "FORBIDDEN", message: "Unauthorized.", status: 403 });
      }

      const files = await getSubmissionFiles(submissionId);
      return apiSuccess({ files });
    }

    if (teamId) {
      if (userRole === "STUDENT") {
        const membership = await db.teamMember.findFirst({
          where: { userId, teamId }
        });
        if (!membership) {
          return apiError({ code: "FORBIDDEN", message: "Unauthorized team access.", status: 403 });
        }
      } else if (userRole === "FACULTY") {
        const team = await db.team.findUnique({
          where: { id: teamId }
        });
        if (team?.facultyId !== userId) {
          return apiError({ code: "FORBIDDEN", message: "Unauthorized advising access.", status: 403 });
        }
      } else if (userRole !== "ADMIN") {
        return apiError({ code: "FORBIDDEN", message: "Unauthorized.", status: 403 });
      }

      // Return latest files for the team
      const files = await db.projectFile.findMany({
        where: { teamId, isLatest: true },
        include: {
          uploadedBy: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      return apiSuccess({ files });
    }

    return apiError({ code: "BAD_REQUEST", message: "Either submissionId or teamId is required.", status: 400 });
  } catch (error: any) {
    console.error("API GET Files Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred.",
      status: 500
    });
  }
}
