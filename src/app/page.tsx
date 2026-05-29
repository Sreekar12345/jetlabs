import { redirect } from "next/navigation";
import { getDefaultDashboardPath } from "@/lib/auth/routing";
import { getAuthSession, getSessionUserRole } from "@/lib/auth/session";

export default async function Home() {
  const session = await getAuthSession();
  const role = getSessionUserRole(session);

  if (role) {
    redirect(getDefaultDashboardPath(role));
  }

  redirect("/auth/login");
}
