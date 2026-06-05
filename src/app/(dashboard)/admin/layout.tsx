import { requirePageRole } from "@/lib/auth/session";

export default async function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole("ADMIN");

  return <>{children}</>;
}
