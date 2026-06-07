import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getDefaultDashboardPath } from "@/lib/auth/routing";
import { getAuthSession, getSessionUserRole } from "@/lib/auth/session";

function getSingleSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuthLoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getAuthSession();
  const role = getSessionUserRole(session);

  if (role) {
    redirect(getDefaultDashboardPath(role));
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8">
      <div 
        className="w-full max-w-[420px]"
        style={{
          "--primary": "#4F46E5",
          "--primary-foreground": "#ffffff",
          "--ring": "#4F46E5",
        } as React.CSSProperties}
      >
        <LoginForm
          callbackUrl={
            getSingleSearchParam(resolvedSearchParams?.callbackUrl) ?? null
          }
          reason={getSingleSearchParam(resolvedSearchParams?.reason) ?? null}
        />
      </div>
    </main>
  );
}
