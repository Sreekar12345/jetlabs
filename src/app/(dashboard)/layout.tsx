import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSessionUserRole, requirePageSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePageSession();
  const role = getSessionUserRole(session);

  if (!role) {
    redirect("/auth/login?reason=expired");
  }

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email ?? "",
        role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
