export { AUTH_LOGIN_PATH, SESSION_MAX_AGE_SECONDS, getAuthSecret } from "./config";
export { authOptions } from "./options";
export { hashPassword, verifyPassword } from "./password";
export {
  getAuthSession,
  getSession,
  getSessionUserRole,
  requirePageRole,
  requirePageSession,
  requireRole,
  requireSession,
  type AuthSession,
  type AuthSessionUser,
  AuthError,
} from "./session";
export {
  DASHBOARD_PATHS,
  getDefaultDashboardPath,
  getRoleForPath,
  getSafeCallbackUrl,
  isProtectedPath,
  isUserRole,
} from "./routing";
