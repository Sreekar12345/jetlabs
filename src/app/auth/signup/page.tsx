import { redirect } from "next/navigation";
import { AuthHero } from "@/components/auth/auth-hero";
import { RegisterForm } from "@/components/auth/register-form";
import { getDefaultDashboardPath } from "@/lib/auth/routing";
import { getAuthSession, getSessionUserRole } from "@/lib/auth/session";

function getSingleSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuthSignupPage({
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
    <main className="grid min-h-screen bg-[#f7f7f5] lg:grid-cols-[1.05fr_0.95fr]">
      <AuthHero />
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f5]">
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(black_1px,transparent_1px),linear-gradient(90deg,black_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative z-10 w-full">
          <RegisterForm
            callbackUrl={
              getSingleSearchParam(resolvedSearchParams?.callbackUrl) ?? null
            }
          />
        </div>
      </div>
    </main>
  );
}
