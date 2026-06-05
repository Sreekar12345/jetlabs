/**
 * Auth route group layout.
 * Pages in (auth)/ render WITHOUT the dashboard sidebar/header.
 * This is a simple pass-through — no shell, no nav.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
