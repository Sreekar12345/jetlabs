import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { getAuthSecret } from "@/lib/auth/config";
import {
  getDefaultDashboardPath,
  getRoleForPath,
  isProtectedPath,
} from "@/lib/auth/routing";

function redirectToLogin(request: NextRequest, reason: "expired" | "unauthorized") {
  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/auth/login", request.url);

  loginUrl.searchParams.set("reason", reason);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
  });

  if (!token) {
    return redirectToLogin(request, "unauthorized");
  }

  const requiredRole = getRoleForPath(pathname);
  const tokenRole = token.role;

  if (
    requiredRole &&
    tokenRole !== "ADMIN" &&
    tokenRole !== requiredRole
  ) {
    return NextResponse.redirect(
      new URL(
        getDefaultDashboardPath(
          (tokenRole as "STUDENT" | "FACULTY" | "ADMIN") ?? "STUDENT",
        ),
        request.url,
      ),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
