import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { AuthError, getSessionUserRole, requireRole } from "@/lib/auth/session";
import { getStudentsForViewer } from "@/services/dashboard-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole("FACULTY", "ADMIN");
    const role = getSessionUserRole(session);

    if (!role) {
      throw new AuthError("FORBIDDEN", 403);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const batch = searchParams.get("batch");
    const department = searchParams.get("department");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const result = await getStudentsForViewer({
      viewerRole: role,
      viewerUserId: session.user.id,
      search,
      batch,
      department,
      page,
      limit,
    });

    return apiSuccess(result.data, {
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    });
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
      message: "Unable to load student data right now.",
      status: 500,
    });
  }
}
