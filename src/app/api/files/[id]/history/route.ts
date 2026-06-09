import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requirePageSession } from "@/lib/auth/session";
import { getFileHistory, verifyFileAccess } from "@/lib/services/file-service";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePageSession();
    const userId = session.user.id;
    const userRole = session.user.role;
    const { id: fileId } = await context.params;

    // 1. Verify access permissions
    const hasAccess = await verifyFileAccess(fileId, userId, userRole);
    if (!hasAccess) {
      return apiError({ code: "FORBIDDEN", message: "You are not authorized to view this file's history.", status: 403 });
    }

    // 2. Fetch history
    const history = await getFileHistory(fileId);

    return apiSuccess({ history });
  } catch (error: any) {
    console.error("API GET File History Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred while fetching file history.",
      status: 500
    });
  }
}
