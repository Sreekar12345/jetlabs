"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import type { AppShellUser } from "@/types/aoip";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationCenter } from "@/components/dashboard/notification-center";

type AppShellProps = {
  user: AppShellUser;
  children: React.ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-white text-foreground">
      <Sidebar user={user} />
      <NotificationCenter />

      <div
        className={cn(
          "min-h-screen transition-[margin] duration-300 ease-out lg:ml-[260px]",
          sidebarCollapsed && "lg:ml-[88px]",
        )}
      >
        <Navbar user={user} />
        <main className="min-h-[calc(100vh-4.5rem)] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
