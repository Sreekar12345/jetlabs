import type { Prisma } from "@prisma/client";
import type { UserRole } from "@/types/auth";

export type ViewerContext = {
  userId: string;
  role: UserRole;
};

export function isAdminRole(role: UserRole) {
  return role === "ADMIN";
}

export function hasAllowedRole(role: UserRole, allowedRoles: UserRole[]) {
  return isAdminRole(role) || allowedRoles.includes(role);
}

export function getTeamScopeWhere(viewer: ViewerContext): Prisma.TeamWhereInput {
  if (viewer.role === "ADMIN") {
    return {};
  }

  if (viewer.role === "FACULTY") {
    return {
      facultyId: viewer.userId,
    };
  }

  return {
    students: {
      some: {
        userId: viewer.userId,
      },
    },
  };
}

export function getSubmissionScopeWhere(
  viewer: ViewerContext,
): Prisma.SubmissionWhereInput {
  if (viewer.role === "ADMIN") {
    return {};
  }

  if (viewer.role === "FACULTY") {
    return {
      team: {
        facultyId: viewer.userId,
      },
    };
  }

  return {
    team: {
      students: {
        some: {
          userId: viewer.userId,
        },
      },
    },
  };
}

export function getProblemScopeWhere(): Prisma.ProblemWhereInput {
  return {};
}
