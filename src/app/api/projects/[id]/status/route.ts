import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireSession } from "@/lib/auth/session";

const ALLOWED_STATUSES = [
  "CREATED",
  "PROPOSAL_SUBMITTED",
  "PROPOSAL_APPROVED",
  "DEVELOPMENT_IN_PROGRESS",
  "MID_REVIEW",
  "FINAL_SUBMISSION",
  "COMPLETED",
];

export async function PATCH(
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

    const { status, progressPercentage } = body;

    // Validate inputs
    if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
      return apiError({
        code: "BAD_REQUEST",
        message: `Invalid project status. Allowed values: ${ALLOWED_STATUSES.join(", ")}`,
        status: 400,
      });
    }

    if (
      progressPercentage !== undefined &&
      (typeof progressPercentage !== "number" ||
        progressPercentage < 0 ||
        progressPercentage > 100)
    ) {
      return apiError({
        code: "BAD_REQUEST",
        message: "progressPercentage must be a number between 0 and 100.",
        status: 400,
      });
    }

    const isFacultyAdvisor =
      project.projectFacultyId === userId || project.team?.facultyId === userId;
    const isTeamLead =
      project.team?.students.some((s) => s.userId === userId && s.role === "TEAM_LEAD") ?? false;

    // Authorization checks
    let authorized = false;

    if (userRole === "ADMIN" || isFacultyAdvisor) {
      authorized = true;
    } else if (userRole === "STUDENT" && isTeamLead) {
      // Team Lead can change status (e.g. submit proposal or deliverables)
      authorized = true;
    }

    if (!authorized) {
      return apiError({
        code: "FORBIDDEN",
        message: "Only the Faculty Advisor or Team Lead can update project status.",
        status: 403,
      });
    }

    // Update project
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        ...(status !== undefined ? { managementStatus: status } : {}),
        ...(progressPercentage !== undefined ? { progressPercentage } : {}),
      },
    });

    // Log activity event
    let detail = "";
    if (status !== undefined && progressPercentage !== undefined) {
      detail = `Project status updated to "${status}" and progress to ${progressPercentage}%.`;
    } else if (status !== undefined) {
      detail = `Project status updated to "${status}".`;
    } else if (progressPercentage !== undefined) {
      detail = `Project progress updated to ${progressPercentage}%.`;
    }

    await db.activityEvent.create({
      data: {
        teamId: project.team?.id,
        projectId: project.id,
        userId,
        type: "project_milestone",
        title: "Project status changed",
        detail,
      },
    });

    return apiSuccess({
      success: true,
      project: {
        id: updatedProject.id,
        status: updatedProject.managementStatus,
        progress: updatedProject.progressPercentage,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    console.error("Error updating project status:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while updating project status.",
      status: 500,
    });
  }
}
