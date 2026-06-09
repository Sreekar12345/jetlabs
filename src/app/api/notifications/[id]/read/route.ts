import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requirePageSession } from "@/lib/auth/session";
import { markAsRead, getUnreadCount } from "@/lib/services/notification-service";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requirePageSession(); // Make sure user is logged in
    const { id } = await context.params;

    const notification = await markAsRead(id);
    const unreadCount = await getUnreadCount(notification.userId);

    return apiSuccess({ success: true, notification, unreadCount });
  } catch (error: any) {
    console.error(`API POST Notification Read Error:`, error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred.",
      status: 500,
    });
  }
}
