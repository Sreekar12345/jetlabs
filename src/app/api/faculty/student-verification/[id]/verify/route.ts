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

    const updatedStudent = await VerificationService.verifyStudent(
      id,
      session.user.id,
      session.user.name || "Faculty Member"
    );

    return apiSuccess({
      success: true,
      message: "Student successfully verified.",
      student: updatedStudent,
    });
  } catch (error: any) {
    console.error("API POST Verify Student Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred.",
      status: 500,
    });
  }
}
