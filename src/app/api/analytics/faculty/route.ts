import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { getFacultyAnalytics } from "@/lib/services/analytics-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole("FACULTY");
    const { searchParams } = new URL(request.url);
    
    const teamId = searchParams.get("teamId") || undefined;
    const batch = searchParams.get("batch") || undefined;
    const weekVal = searchParams.get("week");
    const week = weekVal ? parseInt(weekVal, 10) : undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const data = await getFacultyAnalytics(session.user.id, {
      teamId,
      batch,
      week,
      startDate,
      endDate
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in faculty analytics API:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
