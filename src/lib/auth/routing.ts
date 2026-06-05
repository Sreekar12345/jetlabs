import type { UserRole } from "@/types/auth";

export const DASHBOARD_PATHS: Record<UserRole, string> = {
  STUDENT: "/student/dashboard",
  FACULTY: "/faculty/dashboard",
  ADMIN: "/admin",
};

export function isUserRole(value: unknown): value is UserRole {
  return value === "STUDENT" || value === "FACULTY" || value === "ADMIN";
}

export function getDefaultDashboardPath(role: UserRole) {
  return DASHBOARD_PATHS[role];
}

export function getRoleForPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/student")) {
    return "STUDENT";
  }

  if (pathname.startsWith("/faculty")) {
    return "FACULTY";
  }

  if (pathname.startsWith("/admin")) {
    return "ADMIN";
  }

  return null;
}

export function isProtectedPath(pathname: string) {
  return getRoleForPath(pathname) !== null;
}

export function getSafeCallbackUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}
