import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    // Restrict access to Admin users only
    const session = await requireRole("ADMIN");
    
    const logs = await (db as any).analyticsAuditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 50
    });

    const userIds = Array.from(new Set(logs.map((l: any) => l.userId))) as string[];
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    });

    const userMap = new Map(users.map((u: any) => [u.id, u]));

    const enrichedLogs = logs.map((l: any) => {
      const u = userMap.get(l.userId);
      return {
        id: l.id,
        userId: l.userId,
        userName: u?.name || "System/Unknown",
        userEmail: u?.email || "N/A",
        actionType: l.actionType,
        reportType: l.reportType,
        exportFormat: l.exportFormat,
        timestamp: l.timestamp,
        details: l.details
      };
    });

    return new Response(JSON.stringify({ logs: enrichedLogs }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in audit API route:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
