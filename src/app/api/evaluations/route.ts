import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { requireSession, AuthError } from "@/lib/auth/session";
import {
  createEvaluation,
  getFacultyEvaluationMetrics,
  getStudentEvaluationData,
} from "@/lib/services/evaluation-service";
import { EvaluationStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const role = session.user.role;

    if (role === "STUDENT") {
      const data = await getStudentEvaluationData(userId);
      return apiSuccess({ role, data });
    }

    if (role === "FACULTY") {
      const data = await getFacultyEvaluationMetrics(userId);
      return apiSuccess({ role, data });
    }

    if (role === "ADMIN") {
      // Admins can see faculty metrics by specifying facultyId in searchParams, or default to first faculty
      const searchParams = request.nextUrl.searchParams;
      const targetFacultyId = searchParams.get("facultyId") || userId;
      const data = await getFacultyEvaluationMetrics(targetFacultyId);
      return apiSuccess({ role, data });
    }

    return apiError({ code: "FORBIDDEN", message: "Unauthorized role.", status: 403 });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("API GET Evaluations Error:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const userRole = session.user.role;

    let body;
    try {
      body = await request.json();
    } catch {
      return apiError({ code: "BAD_REQUEST", message: "Invalid JSON body.", status: 400 });
    }

    const {
      teamId,
      projectId,
      weekNumber,
      submissionId, // Contribution ID
      status,       // APPROVED, REJECTED, REVISION_REQUIRED
      feedback,
      score,
      completeness,
      quality,
      documentation,
      timeliness,
      revisionNotes,
    } = body;

    // Validate request fields
    if (!teamId || !projectId || !weekNumber || !submissionId || !status) {
      return apiError({
        code: "BAD_REQUEST",
        message: "teamId, projectId, weekNumber, submissionId, and status are required.",
        status: 400,
      });
    }

    // Verify status is valid
    if (
      status !== EvaluationStatus.APPROVED &&
      status !== EvaluationStatus.REJECTED &&
      status !== EvaluationStatus.REVISION_REQUIRED
    ) {
      return apiError({
        code: "BAD_REQUEST",
        message: "Status must be APPROVED, REJECTED, or REVISION_REQUIRED.",
        status: 400,
      });
    }

    // Authorization: Verify current user is the Faculty guide for this team or an Admin
    const team = await db.team.findUnique({
      where: { id: teamId },
      select: { facultyId: true },
    });

    if (!team) {
      return apiError({ code: "NOT_FOUND", message: "Team not found.", status: 404 });
    }

    const isAdvisor = team.facultyId === userId;
    if (userRole !== "ADMIN" && !isAdvisor) {
      return apiError({
        code: "FORBIDDEN",
        message: "Only the assigned Faculty Advisor can evaluate weekly submissions.",
        status: 403,
      });
    }

    // Perform evaluation creation and calculations
    const evaluation = await createEvaluation({
      teamId,
      projectId,
      weekNumber: parseInt(weekNumber.toString(), 10),
      submissionId,
      facultyId: userId,
      status,
      feedback: feedback || "",
      score: parseFloat(score?.toString() || "0"),
      completeness: parseFloat(completeness?.toString() || "0"),
      quality: parseFloat(quality?.toString() || "0"),
      documentation: parseFloat(documentation?.toString() || "0"),
      timeliness: parseFloat(timeliness?.toString() || "0"),
      revisionNotes: revisionNotes || "",
    });

    // Create notifications for all student team members
    const teamMembers = await db.teamMember.findMany({
      where: { teamId },
      select: { userId: true },
    });

    const milestone = await db.weeklyMilestone.findFirst({
      where: { projectId, weekNumber: parseInt(weekNumber.toString(), 10) },
      select: { title: true },
    });

    const contrib = await db.contribution.findUnique({
      where: { id: submissionId },
      select: { assignedTo: true },
    });
    const assigneeId = contrib?.assignedTo;

    let messageStatus = "reviewed";
    let statusTitle = "Feedback Added";
    let statusType = "FEEDBACK_ADDED";
    if (status === EvaluationStatus.APPROVED) {
      messageStatus = "approved";
      statusTitle = "Submission Approved";
      statusType = "SUBMISSION_APPROVED";
    } else if (status === EvaluationStatus.REJECTED) {
      messageStatus = "rejected";
      statusTitle = "Submission Rejected";
      statusType = "SUBMISSION_REJECTED";
    } else if (status === EvaluationStatus.REVISION_REQUIRED) {
      messageStatus = "sent back for revision";
      statusTitle = "Revision Requested";
      statusType = "REVISION_REQUESTED";
    }

    for (const member of teamMembers) {
      const isAssignee = member.userId === assigneeId;
      if (isAssignee) {
        // Direct notification to the assignee
        await db.notification.create({
          data: {
            userId: member.userId,
            userRole: "STUDENT",
            title: statusTitle,
            message: status === EvaluationStatus.REVISION_REQUIRED
              ? `Revision requested for Week ${weekNumber} ("${milestone?.title ?? ""}"): ${revisionNotes || feedback || "No details provided"}.`
              : `Your Week ${weekNumber} submission ("${milestone?.title ?? ""}") was ${messageStatus}. Score: ${score}/10. Feedback: "${feedback || "None"}".`,
            type: statusType,
            relatedEntityId: evaluation.id,
            triggerEvent: statusType,
          },
        });
      } else {
        // Notification to team members
        await db.notification.create({
          data: {
            userId: member.userId,
            userRole: "STUDENT",
            title: "Score Published",
            message: `Evaluation score published for Week ${weekNumber} ("${milestone?.title ?? ""}"): Status ${messageStatus}. Score: ${score}/10.`,
            type: "SCORE_PUBLISHED",
            relatedEntityId: evaluation.id,
            triggerEvent: "SCORE_PUBLISHED",
          },
        });
      }
    }

    // Log Activity Event
    await db.activityEvent.create({
      data: {
        projectId,
        userId,
        type: status === EvaluationStatus.APPROVED ? "milestone" : "alert",
        title: `Weekly Contribution Evaluated: ${status}`,
        detail: `Faculty advisor evaluated Week ${weekNumber} submission. Score: ${score}/10. Feedback: ${feedback || "None"}.`,
      },
    });

    return apiSuccess({ success: true, evaluation });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("API POST Evaluations Error:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}
