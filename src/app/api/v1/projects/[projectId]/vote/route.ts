import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireSession } from "@/lib/auth/session";
import { logSystemEvent } from "@/lib/services/audit-service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await requireSession();
    const { projectId } = await context.params;
    const userId = session.user.id;
    const userRole = session.user.role;

    // 1. Basic validation of request body
    let body;
    try {
      body = await request.json();
    } catch {
      return apiError({ code: "BAD_REQUEST", message: "Invalid JSON body.", status: 400 });
    }

    if (!body || (body.vote !== "approved" && body.vote !== "rejected")) {
      return apiError({ code: "BAD_REQUEST", message: "Vote must be either 'approved' or 'rejected'.", status: 400 });
    }

    // 2. Validate project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            students: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    isActive: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!project || !project.team) {
      return apiError({ code: "NOT_FOUND", message: "Project or associated team not found.", status: 404 });
    }

    const team = project.team;

    // 3. Authorization rules
    if (userRole !== "STUDENT") {
      return apiError({ code: "FORBIDDEN", message: "Only student team members are allowed to vote.", status: 403 });
    }

    const membership = team.students.find(s => s.userId === userId);
    if (!membership) {
      return apiError({ code: "FORBIDDEN", message: "You do not belong to this project team.", status: 403 });
    }

    if (!membership.user.isActive) {
      return apiError({ code: "FORBIDDEN", message: "Your user account is inactive or blocked.", status: 403 });
    }

    if (membership.role === "TEAM_LEAD") {
      return apiError({ code: "FORBIDDEN", message: "Team Leaders are not allowed to vote as they already selected the project.", status: 403 });
    }

    // Double check team's project association
    if (team.projectId !== projectId) {
      return apiError({ code: "BAD_REQUEST", message: "Project is not assigned to your team.", status: 400 });
    }

    // 4. Submit or update the vote
    const existingVote = await db.projectApprovalVote.findUnique({
      where: {
        teamId_projectId_memberId: {
          teamId: team.id,
          projectId,
          memberId: userId,
        }
      }
    });

    const isNewVote = !existingVote;

    const userVote = await db.projectApprovalVote.upsert({
      where: {
        teamId_projectId_memberId: {
          teamId: team.id,
          projectId,
          memberId: userId,
        }
      },
      create: {
        teamId: team.id,
        projectId,
        memberId: userId,
        vote: body.vote,
      },
      update: {
        vote: body.vote,
      }
    });

    // 5. Audit Logging
    await logSystemEvent({
      userId,
      userRole,
      actionType: isNewVote ? "VOTE_CREATED" : "VOTE_UPDATED",
      eventCategory: "PROJECT",
      entityType: "ProjectApprovalVote",
      entityId: userVote.id,
      actionPerformed: `${isNewVote ? "Vote Created" : "Vote Updated"} on project ${projectId}`,
      metadata: {
        userId,
        teamId: team.id,
        projectId,
        vote: body.vote,
        timestamp: new Date().toISOString(),
      }
    });

    // 6. Trigger Notifications to Team Leader
    const leader = team.students.find(s => s.role === "TEAM_LEAD");
    if (leader) {
      // Check if it is the first vote
      const totalVotesCount = await db.projectApprovalVote.count({
        where: { projectId }
      });

      if (totalVotesCount === 1) {
        await db.notification.create({
          data: {
            userId: leader.userId,
            userRole: "STUDENT",
            title: "Project Approval Poll Started",
            message: "A team member has responded to the project approval poll.",
            type: "VOTE_SUBMITTED",
            relatedEntityId: projectId,
            triggerEvent: "VOTE_SUBMITTED",
          }
        });
      }

      // Check if all members voted
      const eligibleMembers = team.students.filter(s => s.role !== "TEAM_LEAD" && s.user.isActive);
      const eligibleCount = eligibleMembers.length;
      if (totalVotesCount === eligibleCount) {
        await db.notification.create({
          data: {
            userId: leader.userId,
            userRole: "STUDENT",
            title: "Project Approval Poll Complete",
            message: "All team members have submitted their responses.",
            type: "ALL_VOTES_SUBMITTED",
            relatedEntityId: projectId,
            triggerEvent: "ALL_VOTES_SUBMITTED",
          }
        });
      }
    }

    return apiSuccess({ success: true, message: "Vote submitted successfully." });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("Error submitting vote:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}
