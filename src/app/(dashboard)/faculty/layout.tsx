import { requirePageRole } from "@/lib/auth/session";

export default async function FacultySectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole("FACULTY");

  return <>{children}</>;
}
