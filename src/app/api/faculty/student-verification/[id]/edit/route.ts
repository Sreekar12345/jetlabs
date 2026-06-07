import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/session";
import { VerificationService } from "@/features/student-verification/services/VerificationService";

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

    const { fields, reason } = body;
    if (!fields) {
      return apiError({
        code: "BAD_REQUEST",
        message: "Edited fields are required.",
        status: 400,
      });
    }

    if (!reason || !reason.trim()) {
      return apiError({
        code: "BAD_REQUEST",
        message: "Reason for edit is required for audit logs.",
        status: 400,
      });
    }

    const updatedStudent = await VerificationService.editStudentRecord(
      id,
      fields,
      session.user.id,
      session.user.name || "Faculty Member",
      reason
    );

    return apiSuccess({
      success: true,
      message: "Student records updated successfully.",
      student: updatedStudent,
    });
  } catch (error: any) {
    console.error("API POST Edit Student Verification Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred.",
      status: 500,
    });
  }
}
