import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireRole } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await requireRole("STUDENT");
    
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true },
    });

    return apiSuccess({
      hasTeam: !!user?.teamId,
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
      message: "Unable to retrieve team status.",
      status: 500,
    });
  }
}
