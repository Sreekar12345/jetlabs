import { apiError, apiSuccess } from "@/lib/api/response";
import { AuthError, getSessionUserRole, requireRole } from "@/lib/auth/session";
import { getBatchAnalyticsForViewer } from "@/services/dashboard-service";

export async function GET() {
  try {
    const session = await requireRole("FACULTY", "ADMIN");
    const role = getSessionUserRole(session);

    if (!role) {
      throw new AuthError("FORBIDDEN", 403);
    }

    const analytics = await getBatchAnalyticsForViewer({
      viewerRole: role,
      viewerUserId: session.user.id,
    });

    return apiSuccess(analytics);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to load analytics right now.",
      status: 500,
    });
  }
}
