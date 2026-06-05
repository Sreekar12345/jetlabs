import { requirePageRole } from "@/lib/auth/session";

export default async function StudentSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole("STUDENT");

  return <>{children}</>;
}
