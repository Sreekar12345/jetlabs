import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireRole } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole("STUDENT");
    const userId = session.user.id;

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

    const { problemId } = body;
    if (!problemId) {
      return apiError({
        code: "BAD_REQUEST",
        message: "problemId is required.",
        status: 400,
      });
    }

    // 1. Get the team member details to verify role and find the team
    const teamMember = await db.teamMember.findFirst({
      where: { userId },
      include: { team: true },
    });

    if (!teamMember) {
      return apiError({
        code: "FORBIDDEN",
        message: "You are not a member of any team.",
        status: 403,
      });
    }

    // Authorization: only TEAM_LEAD can select problem statements
    if (teamMember.role !== "TEAM_LEAD") {
      return apiError({
        code: "FORBIDDEN",
        message: "Only the Team Lead can select a problem statement.",
        status: 403,
      });
    }

    // 2. Find the problem statement
    const problem = await db.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return apiError({
        code: "NOT_FOUND",
        message: "Problem statement not found.",
        status: 404,
      });
    }

    if (problem.isAssigned && teamMember.team.selectedProblemStatementId !== problemId) {
      return apiError({
        code: "BAD_REQUEST",
        message: "This problem statement is already assigned to another team.",
        status: 400,
      });
    }

    // 3. Update records in a database transaction
    await db.$transaction(async (tx) => {
      // Release current problem statement if team is changing it
      const currentProblemId = teamMember.team.selectedProblemStatementId;
      if (currentProblemId && currentProblemId !== problemId) {
        await tx.problem.update({
          where: { id: currentProblemId },
          data: { isAssigned: false },
        });
      }

      // Update Team selected problem
      await tx.team.update({
        where: { id: teamMember.teamId },
        data: { selectedProblemStatementId: problemId },
      });

      // Update associated Project
      await tx.project.update({
        where: { id: teamMember.team.projectId },
        data: {
          problemId: problem.id,
          title: problem.title,
          description: problem.description,
          domain: problem.domain,
          difficulty: problem.difficulty,
          managementStatus: "CREATED",
          progressPercentage: 0,
          projectFacultyId: teamMember.team.facultyId,
        },
      });

      // Mark selected Problem as assigned
      await tx.problem.update({
        where: { id: problemId },
        data: { isAssigned: true },
      });

      // Log activity event
      await tx.activityEvent.create({
        data: {
          teamId: teamMember.teamId,
          userId,
          type: "project_milestone",
          title: "Problem statement selected",
          detail: `Team Lead selected problem statement: "${problem.title}".`,
        },
      });

      // Trigger notifications for problem selection
      const dbMembers = await tx.teamMember.findMany({
        where: { teamId: teamMember.teamId },
      });
      for (const m of dbMembers) {
        await tx.notification.create({
          data: {
            userId: m.userId,
            userRole: "STUDENT",
            title: "Problem Statement Selected",
            message: `Your team has selected the problem statement: "${problem.title}".`,
            type: "PROBLEM_STATEMENT_SELECTED",
            relatedEntityId: problem.id,
            triggerEvent: "PROBLEM_STATEMENT_SELECTED",
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: teamMember.team.facultyId,
          userRole: "FACULTY",
          title: "Problem Statement Selected",
          message: `Team "${teamMember.team.name}" has selected the problem statement: "${problem.title}".`,
          type: "PROBLEM_STATEMENT_SELECTED",
          relatedEntityId: problem.id,
          triggerEvent: "PROBLEM_STATEMENT_SELECTED",
        },
      });
    });

    return apiSuccess({
      success: true,
      teamId: teamMember.teamId,
      problemId,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    console.error("Error selecting problem statement:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while selecting the problem statement.",
      status: 500,
    });
  }
}
