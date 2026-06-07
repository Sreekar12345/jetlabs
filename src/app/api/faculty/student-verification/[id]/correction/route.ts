import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/session";
import { CorrectionService } from "@/features/student-verification/services/CorrectionService";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole("FACULTY");
    const { id } = await params;

    let body;
    try {
      body = await request.json();
    } catch {
      return apiError({
        code: "BAD_REQUEST",
        message: "Invalid JSON body.",
        status: 400,
      });
    }

    const { reason, comments } = body;
    if (!reason) {
      return apiError({
        code: "BAD_REQUEST",
        message: "Correction reason is required.",
        status: 400,
      });
    }

    const updatedStudent = await CorrectionService.requestCorrection(
      id,
      reason,
      comments || "",
      session.user.id,
      session.user.name || "Faculty Member"
    );

    return apiSuccess({
      success: true,
      message: "Correction request sent successfully.",
      student: updatedStudent,
    });
  } catch (error: any) {
    console.error("API POST Request Correction Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred.",
      status: 500,
    });
  }
}
