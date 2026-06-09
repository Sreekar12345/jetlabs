import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireSession } from "@/lib/auth/session";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id: contributionId } = await context.params;
    const userId = session.user.id;

    let body;
    try {
      body = await request.json();
    } catch {
      return apiError({ code: "BAD_REQUEST", message: "Invalid JSON body.", status: 400 });
    }

    const { submissionUrl, notes, githubUrl, demoUrl, uploadedFiles, fileIds } = body;

    if (!submissionUrl && !githubUrl && !uploadedFiles && (!fileIds || fileIds.length === 0)) {
      return apiError({ code: "BAD_REQUEST", message: "A submission link, GitHub repository, or uploaded file is required.", status: 400 });
    }

    // Fetch contribution details
    const contribution = await db.contribution.findUnique({
      where: { id: contributionId },
      include: {
        milestone: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!contribution) {
      return apiError({ code: "NOT_FOUND", message: "Contribution not found.", status: 404 });
    }

    // Only the assigned student is authorized to submit their work
    if (contribution.assignedTo !== userId) {
      return apiError({
        code: "FORBIDDEN",
        message: "You can only submit work for contributions assigned to you.",
        status: 403,
      });
    }

    const milestone = contribution.milestone;

    // Enforce Admin Validation: Team can submit only for active week
    if (milestone.status !== "IN_PROGRESS" && milestone.status !== "REVIEW_PENDING") {
      return apiError({
        code: "FORBIDDEN",
        message: "Submission denied. Teams can only submit work for the active week.",
        status: 403,
      });
    }

    // Late Submission Logic: If deadline passes, mark as late and store latency metadata
    const now = new Date();
    let isLate = false;
    let originalDeadline: Date | null = null;
    let delayDuration: number | null = null;

    if (milestone.dueDate && now > milestone.dueDate) {
      isLate = true;
      originalDeadline = milestone.dueDate;
      delayDuration = Math.round((now.getTime() - milestone.dueDate.getTime()) / (1000 * 60)); // delay in minutes
    }

    // Update contribution status to SUBMITTED
    const updatedContribution = await db.contribution.update({
      where: { id: contributionId },
      data: {
        status: "SUBMITTED",
        submissionUrl: submissionUrl || githubUrl || null,
        notes: notes || null,
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
        uploadedFiles: uploadedFiles || null,
        submittedAt: now,
        isLate,
        originalDeadline,
        delayDuration,
      },
    });

    // Link uploaded files to this contribution if provided
    if (fileIds && fileIds.length > 0) {
      const { associateFilesWithSubmission } = await import("@/lib/services/file-service");
      await associateFilesWithSubmission(fileIds, contributionId);
    }

    // Check if all team member contributions for this milestone are now submitted or reviewed
    const allMilestoneContributions = await db.contribution.findMany({
      where: { milestoneId: milestone.id },
    });

    const hasUnsubmitted = allMilestoneContributions.some(
      (c) =>
        c.id !== contribution.id &&
        (c.status === "ASSIGNED" || c.status === "IN_PROGRESS" || c.status === "REJECTED")
    );

    if (!hasUnsubmitted) {
      await db.weeklyMilestone.update({
        where: { id: milestone.id },
        data: { status: "REVIEW_PENDING" },
      });
    } else {
      await db.weeklyMilestone.update({
        where: { id: milestone.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    // Trigger notifications for submission events
    const facultyId = milestone.project.projectFacultyId;
    const isResubmission = contribution.status === "SUBMITTED" || contribution.status === "REVIEWED" || contribution.status === "REJECTED";
    
    // Notify Faculty Guide
    if (facultyId) {
      await db.notification.create({
        data: {
          userId: facultyId,
          userRole: "FACULTY",
          title: isResubmission ? "Submission Resubmitted" : "Submission Submitted",
          message: isResubmission
            ? `Submission resubmitted by ${session.user.name || "Student"} for Week ${milestone.weekNumber}: "${contribution.title}".`
            : `Submission uploaded by ${session.user.name || "Student"} for Week ${milestone.weekNumber}: "${contribution.title}".`,
          type: isResubmission ? "SUBMISSION_RESUBMITTED" : "SUBMISSION_SUBMITTED",
          relatedEntityId: updatedContribution.id,
          triggerEvent: isResubmission ? "SUBMISSION_RESUBMITTED" : "SUBMISSION_SUBMITTED",
        },
      });
    }

    // Notify student who submitted
    await db.notification.create({
      data: {
        userId,
        userRole: "STUDENT",
        title: isResubmission ? "Submission Resubmitted" : "Submission Submitted",
        message: isResubmission
          ? `You have successfully resubmitted your work for Week ${milestone.weekNumber}: "${contribution.title}".`
          : `You have successfully submitted your work for Week ${milestone.weekNumber}: "${contribution.title}".`,
        type: isResubmission ? "SUBMISSION_RESUBMITTED" : "SUBMISSION_SUBMITTED",
        relatedEntityId: updatedContribution.id,
        triggerEvent: isResubmission ? "SUBMISSION_RESUBMITTED" : "SUBMISSION_SUBMITTED",
      },
    });

    // Log activity event
    await db.activityEvent.create({
      data: {
        projectId: milestone.projectId,
        userId,
        type: "submission",
        title: `Weekly Contribution Submitted`,
        detail: `Submitted work for Week ${milestone.weekNumber}: "${contribution.title}"${isLate ? " (LATE)" : ""}.`,
      },
    });

    return apiSuccess({ success: true, contribution: updatedContribution });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("Error submitting contribution:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}
