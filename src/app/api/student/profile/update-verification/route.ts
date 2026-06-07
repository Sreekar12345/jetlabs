import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requirePageSession } from "@/lib/auth/session";
import { CorrectionService } from "@/features/student-verification/services/CorrectionService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await requirePageSession();
    const studentId = session.user.id;

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

    const { phoneNumber, parentPhoneNumber, linkedinUrl, skills, bio } = body;

    const updatedStudent = await CorrectionService.submitCorrection(studentId, {
      phoneNumber,
      parentPhoneNumber,
      linkedinUrl,
      skills,
      bio,
    });

    return apiSuccess({
      success: true,
      message: "Profile updated successfully.",
      student: updatedStudent,
    });
  } catch (error: any) {
    console.error("API POST Update Verification Profile Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred.",
      status: 500,
    });
  }
}
