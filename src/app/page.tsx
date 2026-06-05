import { getAuthSession, getSessionUserRole } from "@/lib/auth/session";
import { getDefaultDashboardPath } from "@/lib/auth/routing";
import { LandingClient } from "./landing-client";

export default async function Home() {
  const session = await getAuthSession();
  const role = getSessionUserRole(session);
  const dashboardPath = role ? getDefaultDashboardPath(role) : null;

  return <LandingClient isLoggedIn={!!role} dashboardPath={dashboardPath} />;
}
