import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/session";
import { VerificationService } from "@/features/student-verification/services/VerificationService";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Restrict access to faculty members only
    await requireRole("FACULTY");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";
    const department = searchParams.get("department") || "ALL";
    const searchQuery = searchParams.get("searchQuery") || "";

    const students = await VerificationService.getStudents({
      status,
      department,
      searchQuery,
    });

    return apiSuccess({ students });
  } catch (error: any) {
    console.error("API GET Verification Students Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred.",
      status: 500,
    });
  }
}
