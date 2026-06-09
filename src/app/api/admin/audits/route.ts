import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    // 1. Enforce admin role check
    const session = await requireRole("ADMIN");
    
    // 2. Parse query parameters
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") ?? "50")));
    const skip = (page - 1) * limit;

    const search = searchParams.get("search")?.trim();
    const role = searchParams.get("role");
    const eventType = searchParams.get("eventType");
    const eventCategory = searchParams.get("eventCategory");
    const entityType = searchParams.get("entityType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // 3. Construct filtering query
    const where: any = {};

    if (role && role !== "all") {
      where.userRole = role;
    }
    if (eventType && eventType !== "all") {
      where.actionType = eventType;
    }
    if (eventCategory && eventCategory !== "all") {
      where.eventCategory = eventCategory;
    }
    if (entityType && entityType !== "all") {
      where.entityType = entityType;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // Server-side text search (matches actionType, details, or user name/email)
    if (search) {
      where.OR = [
        { actionType: { contains: search, mode: "insensitive" } },
        { details: { contains: search, mode: "insensitive" } },
        { actionPerformed: { contains: search, mode: "insensitive" } },
        { userId: { contains: search, mode: "insensitive" } },
      ];
    }

    // 4. Query the paginated dataset
    const [logs, totalCount] = await Promise.all([
      (db as any).auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
      (db as any).auditLog.count({ where }),
    ]);

    // 5. Populate user profiles manually to optimize performance and prevent data drift
    const userIds = Array.from(new Set(logs.map((l: any) => l.userId))) as string[];
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    const mappedLogs = logs.map((log: any) => ({
      ...log,
      user: userMap.get(log.userId) || null,
    }));

    // 6. Aggregate dashboard statistics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalEvents,
      eventsToday,
      failedLogins,
      submissionActivity,
      evaluationActivity,
      administrativeActions,
    ] = await Promise.all([
      (db as any).auditLog.count(),
      (db as any).auditLog.count({
        where: { timestamp: { gte: startOfToday } },
      }),
      (db as any).auditLog.count({
        where: { actionType: "LOGIN_FAILED" },
      }),
      (db as any).auditLog.count({
        where: { eventCategory: "SUBMISSION" },
      }),
      (db as any).auditLog.count({
        where: { eventCategory: "EVALUATION" },
      }),
      (db as any).auditLog.count({
        where: { eventCategory: "ADMIN" },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return apiSuccess({
      logs: mappedLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      stats: {
        totalEvents,
        eventsToday,
        failedLogins,
        submissionActivity,
        evaluationActivity,
        administrativeActions,
      },
    });
  } catch (error) {
    console.error("Failed to fetch paginated admin audit logs:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while fetching audit logs.",
      status: 500,
    });
  }
}
