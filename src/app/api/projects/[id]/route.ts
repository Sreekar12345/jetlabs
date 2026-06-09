import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AuthError, requireSession } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const userRole = session.user.role;
    const { id: projectId } = await context.params;

    // Fetch the project and check authorization
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            students: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            },
            faculty: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        problem: true,
        projectTasks: {
          orderBy: { dueDate: "asc" },
        },
        activityEvents: {
          orderBy: { createdAt: "desc" },
          take: 15,
        },
      },
    });

    if (!project) {
      return apiError({
        code: "NOT_FOUND",
        message: "Project not found.",
        status: 404,
      });
    }

    // Security checks
    let authorized = false;

    if (userRole === "ADMIN") {
      authorized = true;
    } else if (userRole === "STUDENT") {
      // Check if student belongs to the project's team
      if (project.team) {
        const isMember = project.team.students.some(
          (student) => student.userId === userId
        );
        if (isMember) {
          authorized = true;
        }
      }
    } else if (userRole === "FACULTY") {
      // Check if faculty guides this project/team
      if (
        project.projectFacultyId === userId ||
        project.team?.facultyId === userId
      ) {
        authorized = true;
      }
    }

    if (!authorized) {
      return apiError({
        code: "FORBIDDEN",
        message: "You are not authorized to access this project workspace.",
        status: 403,
      });
    }

    // Determine team lead
    let teamLead = null;
    let teamMembers: any[] = [];

    if (project.team) {
      const leadMember = project.team.students.find(
        (s) => s.role === "TEAM_LEAD"
      );
      teamLead = leadMember ? leadMember.user : null;
      teamMembers = project.team.students.map((s) => ({
        ...s.user,
        role: s.role,
        roleLabel: s.roleLabel,
      }));
    }

    return apiSuccess({
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        domain: project.domain,
        difficulty: project.difficulty,
        status: project.managementStatus,
        progress: project.progressPercentage,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      team: project.team
        ? {
            id: project.team.id,
            name: project.team.name,
            batch: project.team.batch,
            lead: teamLead,
            members: teamMembers,
          }
        : null,
      facultyGuide: project.team?.faculty ?? null,
      problem: project.problem,
      tasks: project.projectTasks,
      activity: project.activityEvents,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    console.error("Error fetching project details:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while fetching project details.",
      status: 500,
    });
  }
}
