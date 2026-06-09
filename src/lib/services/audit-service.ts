import { db } from "@/lib/db";

export interface AuditLogData {
  id: string;
  userId: string;
  userRole: string;
  actionType: string;
  entityAffected: string | null;
  details: string | null;
  timestamp: Date;
  eventCategory: string | null;
  entityType: string | null;
  entityId: string | null;
  actionPerformed: string | null;
  previousState: string | null;
  newState: string | null;
  ipAddress: string | null;
  metadata: string | null;
  user?: {
    name: string | null;
    email: string | null;
  } | null;
}

/**
 * Creates a system audit log entry in the database.
 * Retained for backward-compatibility.
 */
export async function logAudit(
  userId: string,
  userRole: string,
  actionType: string,
  entityAffected?: string | null,
  details?: string | null
): Promise<any> {
  try {
    return await (db as any).auditLog.create({
      data: {
        userId,
        userRole,
        actionType,
        entityAffected: entityAffected || null,
        details: details || null,
        eventCategory: getCategoryFromActionType(actionType),
        actionPerformed: details || null,
      },
    });
  } catch (error) {
    console.error("Failed to write to AuditLog:", error);
  }
}

/**
 * Creates a high-fidelity system audit log entry in the database.
 */
export async function logSystemEvent(data: {
  userId: string;
  userRole: string;
  actionType: string;
  eventCategory: string;
  entityType?: string | null;
  entityId?: string | null;
  actionPerformed: string;
  previousState?: string | null;
  newState?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, any> | null;
}): Promise<any> {
  try {
    const metadataStr = data.metadata ? JSON.stringify(data.metadata) : null;
    return await (db as any).auditLog.create({
      data: {
        userId: data.userId,
        userRole: data.userRole,
        actionType: data.actionType,
        entityAffected: data.entityType && data.entityId ? `${data.entityType}:${data.entityId}` : null,
        details: data.actionPerformed,
        eventCategory: data.eventCategory,
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        actionPerformed: data.actionPerformed,
        previousState: data.previousState || null,
        newState: data.newState || null,
        ipAddress: data.ipAddress || null,
        metadata: metadataStr,
      },
    });
  } catch (error) {
    console.error("Failed to write structured system event to AuditLog:", error);
  }
}

/**
 * Helper to infer category from legacy actionType.
 */
function getCategoryFromActionType(actionType: string): string {
  if (actionType.startsWith("USER_")) return "ADMIN";
  if (actionType === "LOGIN" || actionType === "LOGIN_FAILED" || actionType === "LOGOUT") return "AUTHENTICATION";
  if (actionType.startsWith("TEAM_")) return "TEAM_MANAGEMENT";
  if (actionType.startsWith("PROJECT_")) return "PROJECT";
  if (actionType.startsWith("FILE_")) return "FILE_UPLOAD";
  if (actionType.startsWith("SUBMISSION_")) return "SUBMISSION";
  if (actionType.startsWith("EVALUATION_") || actionType.startsWith("REVIEW_")) return "EVALUATION";
  if (actionType.startsWith("NOTIFICATION_")) return "NOTIFICATION";
  return "SYSTEM";
}

/**
 * Retrieves all audit logs from the database with user details and filtering.
 */
export async function getAuditLogs(filters: {
  userId?: string;
  actionType?: string;
  userRole?: string;
  eventCategory?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<AuditLogData[]> {
  try {
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.actionType && filters.actionType !== "all") {
      where.actionType = filters.actionType;
    }
    if (filters.userRole && filters.userRole !== "all") {
      where.userRole = filters.userRole;
    }
    if (filters.eventCategory && filters.eventCategory !== "all") {
      where.eventCategory = filters.eventCategory;
    }
    if (filters.entityType && filters.entityType !== "all") {
      where.entityType = filters.entityType;
    }
    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.timestamp.lte = new Date(filters.endDate);
      }
    }

    const logs = await (db as any).auditLog.findMany({
      where,
      orderBy: {
        timestamp: "desc",
      },
      take: 200, // Safe limit for standard display
    });

    // Populate user names and emails manually to avoid complex relation setups in schema.prisma
    const userIds = Array.from(new Set(logs.map((l: any) => l.userId))) as string[];
    const users = await db.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return logs.map((log: any) => ({
      ...log,
      user: userMap.get(log.userId) || null,
    }));
  } catch (error) {
    console.error("Failed to query AuditLogs:", error);
    return [];
  }
}
