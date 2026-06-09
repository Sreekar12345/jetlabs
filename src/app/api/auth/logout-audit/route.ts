import { type NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { requirePageSession } from "@/lib/auth/session";
import { logSystemEvent } from "@/lib/services/audit-service";

export async function POST(request: NextRequest) {
  try {
    const session = await requirePageSession();
    const userId = session.user.id;
    const userRole = session.user.role;

    // Log the logout event
    await logSystemEvent({
      userId,
      userRole,
      actionType: "LOGOUT",
      eventCategory: "AUTHENTICATION",
      entityType: "User",
      entityId: userId,
      actionPerformed: "User successfully logged out of the platform.",
    });

    return apiSuccess({ success: true });
  } catch (error) {
    // If not authenticated or session expired, fail silently or return error
    return apiSuccess({ success: false, message: "No active session to log out." });
  }
}
