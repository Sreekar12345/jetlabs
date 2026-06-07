import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/session";
import { AuditLogService } from "@/features/student-verification/services/AuditLogService";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("FACULTY");
    const { id } = await params;

    const logs = await AuditLogService.getLogs(id);

    return apiSuccess({ logs });
  } catch (error: any) {
    console.error("API GET Student Change Logs Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred.",
      status: 500,
    });
  }
}
