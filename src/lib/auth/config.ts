const DEFAULT_AUTH_SECRET = "development-auth-secret-change-me";
const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function parsePositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export const AUTH_LOGIN_PATH = "/auth/login";

export const SESSION_MAX_AGE_SECONDS = parsePositiveInteger(
  process.env.AUTH_SESSION_MAX_AGE_SECONDS ??
    process.env.NEXTAUTH_SESSION_MAX_AGE_SECONDS,
  DEFAULT_SESSION_MAX_AGE_SECONDS,
);

export function getAuthSecret() {
  const configuredSecret =
    process.env.AUTH_SECRET?.trim() ??
    process.env.NEXTAUTH_SECRET?.trim() ??
    process.env.JWT_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET or NEXTAUTH_SECRET must be configured in production.");
  }

  return DEFAULT_AUTH_SECRET;
}
