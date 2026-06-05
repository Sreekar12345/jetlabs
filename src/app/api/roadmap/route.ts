import { apiError, apiSuccess } from "@/lib/api/response";
import { AuthError, requireRole } from "@/lib/auth/session";
import { getStudentRoadmap } from "@/services/dashboard-service";

export async function GET() {
  try {
    const session = await requireRole("STUDENT");
    const roadmap = await getStudentRoadmap(session.user.id);

    return apiSuccess(roadmap);
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
      message: "Unable to load roadmap data right now.",
      status: 500,
    });
  }
}
