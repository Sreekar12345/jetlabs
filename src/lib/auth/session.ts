import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Session as NextAuthSession } from "next-auth";
import { AUTH_LOGIN_PATH } from "@/lib/auth/config";
import { authOptions } from "@/lib/auth/options";
import { getDefaultDashboardPath } from "@/lib/auth/routing";
import type { UserRole } from "@/types/auth";

export type AuthSession = NextAuthSession;
export type AuthSessionUser = NonNullable<NextAuthSession["user"]>;

export class AuthError extends Error {
  code: "UNAUTHORIZED" | "FORBIDDEN";
  status: 401 | 403;

  constructor(code: "UNAUTHORIZED" | "FORBIDDEN", status: 401 | 403) {
    super(
      code === "UNAUTHORIZED"
        ? "You must be signed in to continue."
        : "You do not have permission to access this resource.",
    );
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

function hasRequiredRole(role: UserRole, roles: UserRole[]) {
  return role === "ADMIN" || roles.includes(role);
}

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getSession() {
  return getAuthSession();
}

export function getSessionUserRole(
  session: { user?: { role?: unknown } } | null | undefined,
) {
  const role = session?.user?.role;

  if (role === "STUDENT" || role === "FACULTY" || role === "ADMIN") {
    return role;
  }

  return null;
}

export async function requireSession() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new AuthError("UNAUTHORIZED", 401);
  }

  return session;
}

export async function requireRole(...roles: UserRole[]) {
  const session = await requireSession();
  const role = getSessionUserRole(session);

  if (!role || !hasRequiredRole(role, roles)) {
    throw new AuthError("FORBIDDEN", 403);
  }

  return session;
}

export async function requirePageSession(
  loginPath = `${AUTH_LOGIN_PATH}?reason=expired`,
) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(loginPath);
  }

  return session;
}

export async function requirePageRole(...roles: UserRole[]) {
  const session = await requirePageSession();
  const role = getSessionUserRole(session);

  if (!role) {
    redirect(`${AUTH_LOGIN_PATH}?reason=expired`);
  }

  if (!hasRequiredRole(role, roles)) {
    redirect(getDefaultDashboardPath(role));
  }

  return session;
}
