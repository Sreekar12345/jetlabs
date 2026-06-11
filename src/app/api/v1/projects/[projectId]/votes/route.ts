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

    // Authorization checks
    let isTeamLead = false;
    let isTeamMember = false;

    if (userRole === "STUDENT") {
      const membership = team.students.find(s => s.userId === userId);
      if (!membership) {
        return apiError({ code: "FORBIDDEN", message: "You do not belong to this project team.", status: 403 });
      }
      if (!membership.user.isActive) {
        return apiError({ code: "FORBIDDEN", message: "User account is inactive.", status: 403 });
      }
      isTeamLead = membership.role === "TEAM_LEAD";
      isTeamMember = true;
    } else if (userRole === "FACULTY") {
      // Guide/faculty check
      const isGuide = project.projectFacultyId === userId || team.facultyId === userId;
      if (!isGuide) {
        return apiError({ code: "FORBIDDEN", message: "You are not the advisor for this team.", status: 403 });
      }
    } else if (userRole !== "ADMIN") {
      return apiError({ code: "FORBIDDEN", message: "Unauthorized role access.", status: 403 });
    }

    // Voting calculations
    // Only student members (excluding the Team Leader) are eligible to vote
    const eligibleMembers = team.students.filter(s => s.role !== "TEAM_LEAD" && s.user.isActive);
    const totalMembers = eligibleMembers.length;

    // Fetch all votes cast for this project
    const votes = await db.projectApprovalVote.findMany({
      where: { projectId },
      include: {
        member: {
          select: {
            name: true,
          }
        }
      }
    });

    const approvedCount = votes.filter(v => v.vote === "approved").length;
    const rejectedCount = votes.filter(v => v.vote === "rejected").length;
    const pendingCount = Math.max(0, totalMembers - (approvedCount + rejectedCount));

    // Calculate approval percentage (based on total voting-eligible members)
    const approvalPercentage = totalMembers > 0 
      ? Math.round((approvedCount / totalMembers) * 100) 
      : 0;

    const stats: any = {
      totalMembers,
      approved: approvedCount,
      rejected: rejectedCount,
      pending: pendingCount,
      approvalPercentage,
    };

    // Determine if user can see the responses (who voted what)
    // Allowed: Team Leader, Faculty, Admin, or Team Member when voting is closed (pending === 0)
    const votingClosed = pendingCount === 0;
    const canSeeResponses = userRole === "ADMIN" || userRole === "FACULTY" || isTeamLead || (isTeamMember && votingClosed);

    if (canSeeResponses) {
      stats.responses = votes.map(v => ({
        id: v.id,
        memberName: v.member?.name || "Unknown Member",
        vote: v.vote,
        updatedAt: v.updatedAt,
      }));
    }

    return apiSuccess(stats);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("Error fetching voting status:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}
