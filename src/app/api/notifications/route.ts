import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requirePageSession } from "@/lib/auth/session";
import { getUserNotifications, markAllAsRead, getUnreadCount } from "@/lib/services/notification-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePageSession();
    const userId = session.user.id;
    
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "all"; // all, unread, read, archived

    const notifications = await getUserNotifications(userId, filter);
    const unreadCount = await getUnreadCount(userId);

    return apiSuccess({ notifications, unreadCount });
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

    await markAllAsRead(userId);
    const unreadCount = await getUnreadCount(userId);

    return apiSuccess({ success: true, unreadCount });
  } catch (error: any) {
    console.error("API POST Notifications Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred.",
      status: 500,
    });
  }
}
