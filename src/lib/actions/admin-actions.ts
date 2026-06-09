"use server";

import { db } from "@/lib/db";
import { requirePageRole } from "@/lib/auth/session";
import { logSystemEvent } from "@/lib/services/audit-service";
import { revalidatePath } from "next/cache";

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
