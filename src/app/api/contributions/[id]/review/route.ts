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
    const userRole = session.user.role;

    let body;
    try {
      body = await request.json();
    } catch {
      return apiError({ code: "BAD_REQUEST", message: "Invalid JSON body.", status: 400 });
    }

    const { decision, feedback, suggestions, marks } = body;

    if (!decision || (decision !== "APPROVED" && decision !== "REJECTED")) {
      return apiError({ code: "BAD_REQUEST", message: "decision must be 'APPROVED' or 'REJECTED'.", status: 400 });
    }

    // 1. Fetch contribution, milestone, and project
    const contribution = await db.contribution.findUnique({
      where: { id: contributionId },
      include: {
        milestone: {
          include: {
            project: {
              include: {
                team: {
                  include: {
                    students: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!contribution) {
      return apiError({ code: "NOT_FOUND", message: "Contribution not found.", status: 404 });
    }

    const milestone = contribution.milestone;
    const project = milestone.project;
    const team = project.team;

    // 2. Validate current user is FACULTY guide of project/team or ADMIN
    const isFacultyAdvisor = project.projectFacultyId === userId || team?.facultyId === userId;
    if (userRole !== "ADMIN" && !isFacultyAdvisor) {
      return apiError({
        code: "FORBIDDEN",
        message: "Only the Faculty Advisor can review weekly contributions.",
        status: 403,
      });
    }

    // 3. Update contribution status
    const targetStatus = decision === "APPROVED" ? "REVIEWED" : "REJECTED";
    const parsedMarks = marks !== undefined && marks !== null ? parseInt(marks.toString(), 10) : null;
    const updatedContribution = await db.contribution.update({
      where: { id: contributionId },
      data: {
        status: targetStatus,
        feedback: feedback || null,
        feedbackSuggestions: suggestions || null,
        facultyMarks: isNaN(Number(parsedMarks)) ? null : parsedMarks,
        reviewedAt: new Date(),
      },
    });

    // Fetch all contributions for this weekly milestone
    const allMilestoneContributions = await db.contribution.findMany({
      where: { milestoneId: milestone.id },
    });

    // 4. Update WeeklyMilestone status
    const allReviewed = allMilestoneContributions.every((c) => c.status === "REVIEWED");
    const anyRejected = allMilestoneContributions.some((c) => c.status === "REJECTED");

    let newMilestoneStatus = milestone.status;
    if (allReviewed) {
      newMilestoneStatus = "COMPLETED";
    } else if (anyRejected) {
      newMilestoneStatus = "IN_PROGRESS";
    } else {
      // Check if some are submitted, under review, and rest are reviewed
      const allSubmittedOrReviewed = allMilestoneContributions.every(
        (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW" || c.status === "REVIEWED"
      );
      newMilestoneStatus = allSubmittedOrReviewed ? "REVIEW_PENDING" : "IN_PROGRESS";
    }

    await db.weeklyMilestone.update({
      where: { id: milestone.id },
      data: {
        status: newMilestoneStatus,
      },
    });

    const teamStudents = team?.students ?? [];

    // If milestone is completed, unlock the next week milestone by setting its status to IN_PROGRESS
    if (newMilestoneStatus === "COMPLETED") {
      const nextWeekMilestone = await db.weeklyMilestone.findFirst({
        where: { projectId: milestone.projectId, weekNumber: milestone.weekNumber + 1 },
      });

      if (nextWeekMilestone && nextWeekMilestone.status === "NOT_STARTED") {
        await db.weeklyMilestone.update({
          where: { id: nextWeekMilestone.id },
          data: { status: "IN_PROGRESS" },
        });

        // Trigger notification: New Week Opens (for all team members)
        for (const student of teamStudents) {
          await db.notification.create({
            data: {
              userId: student.userId,
              message: `Week ${milestone.weekNumber + 1} milestone ("${nextWeekMilestone.title}") is now active. Please check your assigned tasks.`,
              type: "NEW_WEEK_OPENS",
            },
          });
        }
      }
    }

    // Trigger notifications for submission approved/rejected
    for (const student of teamStudents) {
      await db.notification.create({
        data: {
          userId: student.userId,
          message: `Submission for Week ${milestone.weekNumber} ("${contribution.title}") was ${decision === "APPROVED" ? "approved" : "rejected"} by the faculty guide.`,
          type: decision === "APPROVED" ? "SUBMISSION_APPROVED" : "SUBMISSION_REJECTED",
        },
      });
    }

    // 5. Recalculate and update project overall progress percentage
    const memberCount = teamStudents.length;
    const totalExpectedContributions = memberCount > 0 ? memberCount * 8 : 8; // fallback to 8 weeks * 1 contribution

    const completedCount = await db.contribution.count({
      where: {
        milestone: { projectId: milestone.projectId },
        status: "REVIEWED",
      },
    });

    const newProgress = Math.min(100, Math.round((completedCount / totalExpectedContributions) * 100));

    await db.project.update({
      where: { id: milestone.projectId },
      data: { progressPercentage: newProgress },
    });

    // Audit Log activity event
    await db.activityEvent.create({
      data: {
        projectId: milestone.projectId,
        userId,
        type: decision === "APPROVED" ? "milestone" : "alert",
        title: `Weekly Contribution Reviewed: ${decision}`,
        detail: `Faculty advisor reviewed Week ${milestone.weekNumber} contribution for assignee. Result: ${decision}. Marks: ${parsedMarks ?? "N/A"}. Suggestions: ${suggestions || "None"}. Feedback: ${feedback || "None"}.`,
      },
    });

    return apiSuccess({ success: true, contribution: updatedContribution });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("Error reviewing contribution:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}
