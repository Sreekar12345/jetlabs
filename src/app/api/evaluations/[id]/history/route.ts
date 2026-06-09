import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { requireSession, AuthError } from "@/lib/auth/session";
import { getEvaluationHistory } from "@/lib/services/evaluation-service";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const { id: contributionId } = await context.params;

    if (!contributionId) {
      return apiError({ code: "BAD_REQUEST", message: "Contribution ID is required.", status: 400 });
    }

    const history = await getEvaluationHistory(contributionId);
    return apiSuccess({ success: true, history });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError({ code: error.code, message: error.message, status: error.status });
    }
    console.error("API GET Evaluation History Error:", error);
    return apiError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500 });
  }
}
