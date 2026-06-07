import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePageSession();
    const userId = session.user.id;

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ notifications });
  } catch (error: any) {
    console.error("API GET Notifications Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred.",
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePageSession();
    const userId = session.user.id;

    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { notificationId } = body;

    if (notificationId) {
      await db.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    } else {
      await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    }

    return apiSuccess({ success: true });
  } catch (error: any) {
    console.error("API POST Notifications Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred.",
      status: 500,
    });
  }
}
