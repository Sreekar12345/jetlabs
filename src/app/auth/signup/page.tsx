import { redirect } from "next/navigation";
import { SignupPage } from "@/components/auth/SignupPage";
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
    <SignupPage
      callbackUrl={
        getSingleSearchParam(resolvedSearchParams?.callbackUrl) ?? null
      }
    />
  );
}
