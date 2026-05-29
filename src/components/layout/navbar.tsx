"use client";

import { Bell, Menu, Moon, PanelLeft, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSearchPlaceholder } from "@/lib/navigation";
import { useUIStore } from "@/store/ui-store";
import type { AppShellUser } from "@/types/aoip";

type NavbarProps = {
  user: AppShellUser;
};

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const toggleSidebarCollapsed = useUIStore(
    (state) => state.toggleSidebarCollapsed,
  );
  const searchPlaceholder =
    user.role === "STUDENT"
      ? "Search problems, teams, papers..."
      : getSearchPlaceholder(user.role, pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8 xl:px-10">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 rounded-xl lg:hidden"
          onClick={toggleSidebar}
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden size-10 rounded-xl text-muted-foreground hover:text-foreground lg:inline-flex"
          onClick={toggleSidebarCollapsed}
          aria-label="Toggle sidebar width"
        >
          <PanelLeft className="size-4" />
        </Button>

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 rounded-2xl border-border bg-muted/60 pl-11 text-sm shadow-none placeholder:text-muted-foreground focus-visible:bg-white"
            placeholder={searchPlaceholder}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-xl text-muted-foreground hover:text-foreground"
          aria-label="Theme"
        >
          <Moon className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-xl text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </Button>
      </div>
    </header>
  );
}
