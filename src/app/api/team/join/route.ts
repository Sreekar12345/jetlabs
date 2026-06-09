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

    const teamCode = body.teamCode?.trim();
    if (!teamCode) {
      return apiError({
        code: "BAD_REQUEST",
        message: "Team code is required.",
        status: 400,
      });
    }

    // 1. Fetch the student user details to check if already assigned
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { teamId: true, name: true },
    });

    if (!user) {
      return apiError({
        code: "NOT_FOUND",
        message: "Student record not found.",
        status: 404,
      });
    }

    if (user.teamId) {
      return apiError({
        code: "BAD_REQUEST",
        message: "You are already assigned to a team.",
        status: 400,
      });
    }

    // 2. Fetch the team
    const team = await db.team.findUnique({
      where: { teamCode },
      select: {
        id: true,
        name: true,
        maxStudents: true,
        status: true,
        facultyId: true,
        mentorId: true,
      },
    });

    if (!team) {
      return apiError({
        code: "BAD_REQUEST",
        message: "Invalid Team Code. Please contact your faculty.",
        status: 400,
      });
    }

    // Check if the student has a pre-assigned team membership in any team
    const preAssignedMembership = await db.teamMember.findFirst({
      where: { userId },
    });

    if (preAssignedMembership && preAssignedMembership.teamId !== team.id) {
      return apiError({
        code: "BAD_REQUEST",
        message: "You have been assigned to a different team by your faculty. Please use the correct team code.",
        status: 400,
      });
    }

    // 3. Check if team is active
    if (team.status !== "ACTIVE") {
      return apiError({
        code: "BAD_REQUEST",
        message: "This Team Code is no longer active.",
        status: 400,
      });
    }

    // 4. Check capacity
    const currentMemberCount = await db.teamMember.count({
      where: { teamId: team.id },
    });

    if (currentMemberCount >= team.maxStudents) {
      return apiError({
        code: "BAD_REQUEST",
        message: "This team has reached maximum capacity.",
        status: 400,
      });
    }

    // 5. Successful join - perform transaction
    await db.$transaction(async (tx) => {
      // 5a. Create or update student-team membership relationship
      const existingMember = await tx.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId,
          },
        },
      });

      if (!existingMember) {
        await tx.teamMember.create({
          data: {
            teamId: team.id,
            userId,
            roleLabel: "Member",
            role: "MEMBER",
            contributionScore: 0,
            lastActiveAt: new Date(),
          },
        });
      } else {
        await tx.teamMember.update({
          where: {
            id: existingMember.id,
          },
          data: {
            lastActiveAt: new Date(),
          },
        });
      }

      // 5b. Update student record in User table
      await tx.user.update({
        where: { id: userId },
        data: {
          teamId: team.id,
          facultyId: team.facultyId,
          mentorId: team.mentorId,
          joinedTeamAt: new Date(),
        },
      });

      // 5c. Log onboarding activity event
      await tx.activityEvent.create({
        data: {
          teamId: team.id,
          userId,
          type: "onboarding",
          title: "Student joined team using Team Code",
          detail: `${user.name || "Student"} joined team "${team.name}" using Team Code "${teamCode}".`,
        },
      });

      // 5d. Trigger Notifications
      // Notify the joining student
      await tx.notification.create({
        data: {
          userId,
          userRole: "STUDENT",
          title: "Team Joined",
          message: `You have successfully joined team "${team.name}".`,
          type: "TEAM_JOINED",
          relatedEntityId: team.id,
          triggerEvent: "TEAM_JOINED",
        },
      });

      // Notify the Faculty Advisor
      await tx.notification.create({
        data: {
          userId: team.facultyId,
          userRole: "FACULTY",
          title: "Team Joined",
          message: `Student "${user.name}" has joined team "${team.name}".`,
          type: "TEAM_JOINED",
          relatedEntityId: team.id,
          triggerEvent: "TEAM_JOINED",
        },
      });

      // Notify existing team members
      const existingMembers = await tx.teamMember.findMany({
        where: {
          teamId: team.id,
          userId: { not: userId },
        },
      });
      for (const m of existingMembers) {
        await tx.notification.create({
          data: {
            userId: m.userId,
            userRole: "STUDENT",
            title: "Team Joined",
            message: `Student "${user.name}" has joined your team "${team.name}".`,
            type: "TEAM_JOINED",
            relatedEntityId: team.id,
            triggerEvent: "TEAM_JOINED",
          },
        });
      }
    });

    try {
      const { logSystemEvent } = await import("@/lib/services/audit-service");
      await logSystemEvent({
        userId,
        userRole: "STUDENT",
        actionType: "TEAM_JOINED",
        eventCategory: "TEAM_MANAGEMENT",
        entityType: "Team",
        entityId: team.id,
        actionPerformed: `Student "${user.name || "Student"}" joined team "${team.name}" (Code: ${teamCode}).`,
        metadata: {
          teamId: team.id,
          teamName: team.name,
          teamCode,
        },
      });
    } catch (auditError) {
      console.error("Failed to log team join audit:", auditError);
    }

    console.log(`Notification sent: Student ${user.name} joined team ${team.name}. Faculty advisor ${team.facultyId} and mentor ${team.mentorId || "N/A"} notified.`);

    return apiSuccess({
      success: true,
      teamId: team.id,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    console.error("Error joining team:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while joining the team.",
      status: 500,
    });
  }
}
