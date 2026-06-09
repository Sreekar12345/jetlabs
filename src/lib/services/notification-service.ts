import { db } from "@/lib/db";

export interface CreateNotificationInput {
  userId: string;
  userRole?: string;
  title?: string;
  message: string;
  type: string;
  relatedEntityId?: string;
  triggerEvent?: string;
}

/**
 * Creates and saves a new notification in the database.
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    const notification = await db.notification.create({
      data: {
        userId: input.userId,
        userRole: input.userRole || null,
        title: input.title || null,
        message: input.message,
        type: input.type,
        relatedEntityId: input.relatedEntityId || null,
        status: "UNREAD",
        read: false,
        triggerEvent: input.triggerEvent || input.type,
      },
    });

    try {
      const { logSystemEvent } = await import("@/lib/services/audit-service");
      await logSystemEvent({
        userId: input.userId,
        userRole: input.userRole || "STUDENT",
        actionType: "NOTIFICATION_DELIVERED",
        eventCategory: "NOTIFICATION",
        entityType: "Notification",
        entityId: notification.id,
        actionPerformed: `Notification delivered: "${input.title || "Notification"}" - "${input.message.substring(0, 50)}..."`,
        metadata: {
          type: input.type,
          triggerEvent: input.triggerEvent,
        },
      });
    } catch (auditErr) {
      console.error("Failed to log notification audit:", auditErr);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Retrieves notifications for a specific user based on status.
 */
export async function getUserNotifications(userId: string, filter?: string) {
  try {
    const where: any = { userId };
    
    if (filter === "unread") {
      where.status = "UNREAD";
    } else if (filter === "read") {
      where.status = "READ";
    } else if (filter === "archived") {
      where.status = "ARCHIVED";
    } else {
      // By default, exclude archived notifications from the active list
      where.status = { in: ["UNREAD", "READ"] };
    }

    return await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
}

/**
 * Marks a notification as read and records the audit timestamp.
 */
export async function markAsRead(id: string) {
  try {
    const result = await db.notification.update({
      where: { id },
      data: {
        status: "READ",
        read: true,
        readAt: new Date(),
      },
    });

    try {
      const { logSystemEvent } = await import("@/lib/services/audit-service");
      await logSystemEvent({
        userId: result.userId,
        userRole: result.userRole || "STUDENT",
        actionType: "NOTIFICATION_READ",
        eventCategory: "NOTIFICATION",
        entityType: "Notification",
        entityId: result.id,
        actionPerformed: `Notification marked as read: "${result.title || "Untitled"}".`,
      });
    } catch (auditError) {
      console.error("Failed to log notification read audit:", auditError);
    }

    return result;
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error);
    throw error;
  }
}

/**
 * Marks all unread notifications of a user as read.
 */
export async function markAllAsRead(userId: string) {
  try {
    const result = await db.notification.updateMany({
      where: {
        userId,
        status: "UNREAD",
      },
      data: {
        status: "READ",
        read: true,
        readAt: new Date(),
      },
    });

    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user) {
        const { logSystemEvent } = await import("@/lib/services/audit-service");
        await logSystemEvent({
          userId,
          userRole: user.role,
          actionType: "NOTIFICATION_READ_ALL",
          eventCategory: "NOTIFICATION",
          actionPerformed: `All unread notifications marked as read.`,
        });
      }
    } catch (auditError) {
      console.error("Failed to log notification read all audit:", auditError);
    }

    return result;
  } catch (error) {
    console.error(`Error marking all notifications as read for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Archives a specific notification.
 */
export async function archiveNotification(id: string) {
  try {
    return await db.notification.update({
      where: { id },
      data: {
        status: "ARCHIVED",
      },
    });
  } catch (error) {
    console.error(`Error archiving notification ${id}:`, error);
    throw error;
  }
}

/**
 * Retrieves the count of unread notifications for a user.
 */
export async function getUnreadCount(userId: string) {
  try {
    return await db.notification.count({
      where: {
        userId,
        status: "UNREAD",
      },
    });
  } catch (error) {
    console.error(`Error fetching unread count for user ${userId}:`, error);
    return 0;
  }
}
