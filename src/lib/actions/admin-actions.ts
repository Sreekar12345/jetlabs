"use server";

import { db } from "@/lib/db";
import { requirePageRole } from "@/lib/auth/session";
import { logSystemEvent } from "@/lib/services/audit-service";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/auth/password";

/**
 * Activates a student or faculty account.
 */
export async function activateUserAction(userId: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, message: "User not found." };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        isActive: true,
      },
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "USER_ACTIVATION",
      eventCategory: "ADMIN",
      entityType: "User",
      entityId: userId,
      actionPerformed: `Activated account for ${targetUser.name} (${targetUser.email})`,
      previousState: JSON.stringify({ isActive: false }),
      newState: JSON.stringify({ isActive: true }),
    });

    revalidatePath("/admin");
    return { success: true, message: "Account activated successfully." };
  } catch (error) {
    console.error("Failed to activate user:", error);
    return { success: false, message: "Server error during account activation." };
  }
}

/**
 * Deactivates a student or faculty account.
 */
export async function deactivateUserAction(userId: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, message: "User not found." };
    }

    if (targetUser.id === adminId) {
      return { success: false, message: "You cannot deactivate your own admin account." };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "USER_DEACTIVATION",
      eventCategory: "ADMIN",
      entityType: "User",
      entityId: userId,
      actionPerformed: `Deactivated account for ${targetUser.name} (${targetUser.email})`,
      previousState: JSON.stringify({ isActive: true }),
      newState: JSON.stringify({ isActive: false }),
    });

    revalidatePath("/admin");
    return { success: true, message: "Account deactivated successfully." };
  } catch (error) {
    console.error("Failed to deactivate user:", error);
    return { success: false, message: "Server error during account deactivation." };
  }
}

/**
 * Resets a student's verification status back to PENDING.
 */
export async function resetStudentStatusAction(userId: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, message: "User not found." };
    }

    if (targetUser.role !== "STUDENT") {
      return { success: false, message: "Only student account verification status can be reset." };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        verificationStatus: "PENDING",
        isActive: true,
      },
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "USER_STATUS_RESET",
      eventCategory: "ADMIN",
      entityType: "User",
      entityId: userId,
      actionPerformed: `Reset verification status to PENDING for ${targetUser.name} (${targetUser.email})`,
      previousState: JSON.stringify({ verificationStatus: targetUser.verificationStatus }),
      newState: JSON.stringify({ verificationStatus: "PENDING" }),
    });

    revalidatePath("/admin");
    return { success: true, message: "Student account status reset successfully." };
  } catch (error) {
    console.error("Failed to reset student status:", error);
    return { success: false, message: "Server error during account status reset." };
  }
}

/**
 * Approves a team assignment request (application) and assigns the student to a team.
 */
export async function approveApplicationAction(requestId: string, teamId: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const request = await db.teamAssignmentRequest.findUnique({
      where: { id: requestId },
      include: { student: true },
    });

    if (!request) {
      return { success: false, message: "Request not found." };
    }

    const team = await db.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return { success: false, message: "Selected team not found." };
    }

    await db.$transaction(async (tx) => {
      // 1. Update request status
      await tx.teamAssignmentRequest.update({
        where: { id: requestId },
        data: { status: "approved" },
      });

      // 2. Create team membership
      await tx.teamMember.upsert({
        where: {
          teamId_userId: {
            teamId,
            userId: request.studentId,
          },
        },
        create: {
          teamId,
          userId: request.studentId,
          role: "MEMBER",
          roleLabel: "Member",
          contributionScore: 0,
          lastActiveAt: new Date(),
        },
        update: {
          lastActiveAt: new Date(),
        },
      });

      // 3. Update student user record
      await tx.user.update({
        where: { id: request.studentId },
        data: {
          teamId,
          facultyId: team.facultyId,
          mentorId: team.mentorId,
          joinedTeamAt: new Date(),
          verificationStatus: "VERIFIED", // auto-verify upon approval
        },
      });

      // 4. Log activity event
      await tx.activityEvent.create({
        data: {
          teamId,
          userId: request.studentId,
          type: "onboarding",
          title: "Student assigned to team by Admin",
          detail: `Student ${request.student.name} was assigned to team "${team.name}" via admin request approval.`,
        },
      });

      // 5. Create notifications
      await tx.notification.create({
        data: {
          userId: request.studentId,
          userRole: "STUDENT",
          title: "Application Approved",
          message: `Your team assignment request has been approved. You are now assigned to team "${team.name}".`,
          type: "INFO",
          relatedEntityId: teamId,
        },
      });
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "TEAM_ASSIGNMENT_APPROVE",
      eventCategory: "ADMIN",
      entityType: "TeamAssignmentRequest",
      entityId: requestId,
      actionPerformed: `Approved assignment request for student ${request.student.name} to team ${team.name}.`,
    });

    revalidatePath("/admin");
    return { success: true, message: "Request approved and student assigned successfully." };
  } catch (error) {
    console.error("Failed to approve assignment request:", error);
    return { success: false, message: "Server error during application approval." };
  }
}

/**
 * Rejects a team assignment request (application).
 */
export async function rejectApplicationAction(requestId: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const request = await db.teamAssignmentRequest.findUnique({
      where: { id: requestId },
      include: { student: true },
    });

    if (!request) {
      return { success: false, message: "Request not found." };
    }

    await db.teamAssignmentRequest.update({
      where: { id: requestId },
      data: { status: "rejected" },
    });

    await db.notification.create({
      data: {
        userId: request.studentId,
        userRole: "STUDENT",
        title: "Application Rejected",
        message: "Your team assignment request was rejected. Please contact your faculty advisor for assistance.",
        type: "ALERT",
      },
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "TEAM_ASSIGNMENT_REJECT",
      eventCategory: "ADMIN",
      entityType: "TeamAssignmentRequest",
      entityId: requestId,
      actionPerformed: `Rejected assignment request for student ${request.student.name}.`,
    });

    revalidatePath("/admin");
    return { success: true, message: "Request rejected successfully." };
  } catch (error) {
    console.error("Failed to reject assignment request:", error);
    return { success: false, message: "Server error during application rejection." };
  }
}

/**
 * Deletes a user account from the system.
 */
export async function deleteUserAction(userId: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, message: "User not found." };
    }

    if (targetUser.id === adminId) {
      return { success: false, message: "You cannot delete your own admin account." };
    }

    await db.user.delete({
      where: { id: userId },
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "USER_DELETED",
      eventCategory: "ADMIN",
      entityType: "User",
      entityId: userId,
      actionPerformed: `Deleted user account for ${targetUser.name} (${targetUser.email})`,
    });

    revalidatePath("/admin");
    return { success: true, message: "User account deleted successfully." };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, message: "Server error during account deletion." };
  }
}

/**
 * Resets a user's password.
 */
export async function resetPasswordAction(userId: string, passwordPlain: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, message: "User not found." };
    }

    const passwordHash = await hashPassword(passwordPlain);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "USER_PASSWORD_RESET",
      eventCategory: "ADMIN",
      entityType: "User",
      entityId: userId,
      actionPerformed: `Reset password for user ${targetUser.name} (${targetUser.email})`,
    });

    return { success: true, message: `Password reset successfully for ${targetUser.name}.` };
  } catch (error) {
    console.error("Failed to reset password:", error);
    return { success: false, message: "Server error during password reset." };
  }
}

/**
 * Changes a user's system role.
 */
export async function changeUserRoleAction(userId: string, newRole: "STUDENT" | "FACULTY" | "ADMIN") {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, message: "User not found." };
    }

    if (targetUser.id === adminId && newRole !== "ADMIN") {
      return { success: false, message: "You cannot change your own admin role." };
    }

    await db.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "USER_ROLE_CHANGED",
      eventCategory: "ADMIN",
      entityType: "User",
      entityId: userId,
      actionPerformed: `Changed role for ${targetUser.name} from ${targetUser.role} to ${newRole}`,
      previousState: JSON.stringify({ role: targetUser.role }),
      newState: JSON.stringify({ role: newRole }),
    });

    revalidatePath("/admin");
    return { success: true, message: `Role changed successfully to ${newRole}.` };
  } catch (error) {
    console.error("Failed to change user role:", error);
    return { success: false, message: "Server error during role change." };
  }
}

/**
 * Disbands a team, freeing all its members.
 */
export async function disbandTeamAction(teamId: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: { students: true },
    });

    if (!team) {
      return { success: false, message: "Team not found." };
    }

    await db.$transaction(async (tx) => {
      // 1. Update user records (set teamId, facultyId, mentorId to null)
      const studentIds = team.students.map((s) => s.userId);
      await tx.user.updateMany({
        where: { id: { in: studentIds } },
        data: {
          teamId: null,
          facultyId: null,
          mentorId: null,
          joinedTeamAt: null,
        },
      });

      // 2. Delete the team (cascades to members)
      await tx.team.delete({
        where: { id: teamId },
      });
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "TEAM_DISBANDED",
      eventCategory: "ADMIN",
      entityType: "Team",
      entityId: teamId,
      actionPerformed: `Disbanded team "${team.name}" (Code: ${team.teamCode || "N/A"}).`,
    });

    revalidatePath("/admin");
    return { success: true, message: "Team disbanded successfully." };
  } catch (error) {
    console.error("Failed to disband team:", error);
    return { success: false, message: "Server error during team disbandment." };
  }
}

/**
 * Transfers team lead ownership to another student.
 */
export async function transferTeamOwnershipAction(teamId: string, newLeadUserId: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: { students: true },
    });

    if (!team) {
      return { success: false, message: "Team not found." };
    }

    const isMember = team.students.some((s) => s.userId === newLeadUserId);
    if (!isMember) {
      return { success: false, message: "Selected user is not a member of this team." };
    }

    await db.$transaction(async (tx) => {
      // Demote existing leads
      await tx.teamMember.updateMany({
        where: { teamId, role: "TEAM_LEAD" },
        data: { role: "MEMBER", roleLabel: "Member" },
      });

      // Promote new lead
      await tx.teamMember.update({
        where: { teamId_userId: { teamId, userId: newLeadUserId } },
        data: { role: "TEAM_LEAD", roleLabel: "Team Lead" },
      });
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "TEAM_OWNERSHIP_TRANSFER",
      eventCategory: "ADMIN",
      entityType: "Team",
      entityId: teamId,
      actionPerformed: `Transferred lead ownership of team "${team.name}" to user ${newLeadUserId}.`,
    });

    revalidatePath("/admin");
    return { success: true, message: "Team ownership transferred successfully." };
  } catch (error) {
    console.error("Failed to transfer team ownership:", error);
    return { success: false, message: "Server error during ownership transfer." };
  }
}

/**
 * Archives a project (sets status to ON_HOLD).
 */
export async function archiveProjectAction(projectId: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return { success: false, message: "Project not found." };
    }

    await db.project.update({
      where: { id: projectId },
      data: { status: "ON_HOLD" },
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "PROJECT_ARCHIVED",
      eventCategory: "ADMIN",
      entityType: "Project",
      entityId: projectId,
      actionPerformed: `Archived project "${project.title}" (Status set to ON_HOLD).`,
    });

    revalidatePath("/admin");
    return { success: true, message: "Project archived successfully." };
  } catch (error) {
    console.error("Failed to archive project:", error);
    return { success: false, message: "Server error during project archiving." };
  }
}

/**
 * Restores an archived project (sets status to EXECUTION).
 */
export async function restoreProjectAction(projectId: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return { success: false, message: "Project not found." };
    }

    await db.project.update({
      where: { id: projectId },
      data: { status: "EXECUTION" },
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "PROJECT_RESTORED",
      eventCategory: "ADMIN",
      entityType: "Project",
      entityId: projectId,
      actionPerformed: `Restored project "${project.title}" (Status set to EXECUTION).`,
    });

    revalidatePath("/admin");
    return { success: true, message: "Project restored successfully." };
  } catch (error) {
    console.error("Failed to restore project:", error);
    return { success: false, message: "Server error during project restoration." };
  }
}

/**
 * Force completes a project (sets status to COMPLETED).
 */
export async function forceCloseProjectAction(projectId: string) {
  const session = await requirePageRole("ADMIN");
  const adminId = session.user.id;

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return { success: false, message: "Project not found." };
    }

    await db.project.update({
      where: { id: projectId },
      data: { status: "COMPLETED", progress: 100 },
    });

    await logSystemEvent({
      userId: adminId,
      userRole: "ADMIN",
      actionType: "PROJECT_FORCE_CLOSED",
      eventCategory: "ADMIN",
      entityType: "Project",
      entityId: projectId,
      actionPerformed: `Force completed project "${project.title}" (Status set to COMPLETED, progress 100%).`,
    });

    revalidatePath("/admin");
    return { success: true, message: "Project force completed successfully." };
  } catch (error) {
    console.error("Failed to force close project:", error);
    return { success: false, message: "Server error during project completion." };
  }
}
