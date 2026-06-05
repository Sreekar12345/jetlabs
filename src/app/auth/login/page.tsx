import { redirect } from "next/navigation";
import { AuthHero } from "@/components/auth/auth-hero";
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
    <main className="grid min-h-screen bg-[#020617] lg:grid-cols-[1.05fr_0.95fr]">
      <AuthHero />
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#020617_0%,#0B1026_48%,#15194A_100%)]">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-indigo-400/[0.14] blur-3xl" />
        <div className="absolute bottom-0 left-8 h-80 w-80 rounded-full bg-[#1E1B5A]/[0.46] blur-3xl" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(199,210,254,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(199,210,254,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="relative z-10 w-full">
          <LoginForm
            callbackUrl={
              getSingleSearchParam(resolvedSearchParams?.callbackUrl) ?? null
            }
            reason={getSingleSearchParam(resolvedSearchParams?.reason) ?? null}
          />
        </div>
      </div>
    </main>
  );
}
