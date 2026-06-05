/**
 * Authentication and authorization types.
 * These mirror the Auth.js session payload and the AOIP user model.
 */

export const USER_ROLES = ["STUDENT", "FACULTY", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const LOGIN_ROLES = ["STUDENT", "FACULTY", "ADMIN"] as const;
export type LoginRole = (typeof LOGIN_ROLES)[number];

export type RoleSwitcherOption = {
  value: LoginRole;
  label: string;
  description: string;
};

export type AuthRoleContent = {
  eyebrow: string;
  description: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  accessNote: string;
};

export type AuthHeroStat = {
  value: string;
  label: string;
  description: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
};

export type Session = {
  expires: string;
  user: AuthUser;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  session: Session;
};

export type RegisterResponse = {
  user: AuthUser;
};

/**
 * Route-level permission mapping.
 * Used by route guards and redirects.
 */
export type RoutePermission = {
  path: string;
  roles: UserRole[];
};

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: "/student", roles: ["STUDENT"] },
  { path: "/faculty", roles: ["FACULTY"] },
  { path: "/admin", roles: ["ADMIN"] },
];
