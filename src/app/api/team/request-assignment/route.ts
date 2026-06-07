import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireRole } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole("STUDENT");
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

    const { collegeName, department, section, facultyName, notes } = body;

    // Validate required fields
    if (
      !collegeName?.trim() ||
      !department?.trim() ||
      !section?.trim() ||
      !facultyName?.trim()
    ) {
      return apiError({
        code: "BAD_REQUEST",
        message: "College Name, Department, Section, and Faculty Name are required.",
        status: 400,
      });
    }

    // Check if the user exists
    const studentExists = await db.user.findUnique({
      where: { id: studentId },
    });

    if (!studentExists) {
      return apiError({
        code: "NOT_FOUND",
        message: "Student record not found.",
        status: 404,
      });
    }

    // Create the team assignment request
    const assignmentRequest = await db.teamAssignmentRequest.create({
      data: {
        studentId,
        collegeName: collegeName.trim(),
        department: department.trim(),
        section: section.trim(),
        facultyName: facultyName.trim(),
        notes: notes?.trim() || null,
        status: "pending",
      },
    });

    return apiSuccess({
      success: true,
      message: "Team assignment request submitted successfully.",
      requestId: assignmentRequest.id,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    console.error("Error creating team assignment request:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while submitting the request.",
      status: 500,
    });
  }
}
