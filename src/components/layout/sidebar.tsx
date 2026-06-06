"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Orbit } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getNavigationForRole,
  isNavigationItemActive,
  ROLE_LABELS,
} from "@/lib/navigation";
import { signOutFromSession } from "@/services/auth-service";
import { useUIStore } from "@/store/ui-store";
import type { AppShellUser, NavigationItem } from "@/types/aoip";

type SidebarProps = {
  user: AppShellUser;
};

type SidebarPanelProps = SidebarProps & {
  collapsed: boolean;
  onNavigate?: () => void;
};

const STUDENT_NAV_ORDER = [
  "Dashboard",
  "Problem Market",
  "Weekly Submissions",
  "IEEE Paper",
  "Final Submission",
  "Execution Playbook",
  "Viva",
  "Achievements",
  "Performance Score",
  "Profile",
];

const STUDENT_NAV_LABELS: Record<string, string> = {
  "Problem Market": "Problem Marketplace",
  "Execution Playbook": "Execution Playbooks",
  Viva: "Viva Readiness",
  Profile: "My Profile",
};

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getSidebarItems(user: AppShellUser): NavigationItem[] {
  const items = getNavigationForRole(user.role).flatMap((section) => section.items);

  if (user.role !== "STUDENT") {
    return items;
  }

  return STUDENT_NAV_ORDER.map((title) => {
    const item = items.find((candidate) => candidate.title === title);

    if (!item) {
      return null;
    }

    return {
      ...item,
      title: STUDENT_NAV_LABELS[item.title] ?? item.title,
    };
  }).filter((item): item is NavigationItem => item !== null);
}

function SidebarPanel({ user, collapsed, onNavigate }: SidebarPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const items = getSidebarItems(user);
  const displayName = user.name?.trim() || user.email;
  const profileLine =
    user.role === "STUDENT" ? "CSE · Year 4" : `${ROLE_LABELS[user.role]} workspace`;

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    const result = await signOutFromSession();

    if (!result.success) {
      setIsSigningOut(false);
      toast.error(result.message);
      return;
    }

    router.replace("/auth/login");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-sidebar-border bg-[#f7f7f5]">
      <div
        className={cn(
          "flex h-[72px] items-center gap-3 border-b border-sidebar-border px-5",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black text-white">
          <Orbit className="size-4" />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-black">Syntra</p>
            <p className="truncate text-xs text-black/60">Academic OS</p>
          </div>
        ) : null}
      </div>

      <div className="scrollbar-subtle flex-1 overflow-y-auto px-3 py-5">
        <nav className="space-y-1.5">
          {items.map((item) => {
            const active = isNavigationItemActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.title}
                onClick={onNavigate}
                className={cn(
                  "group flex h-10 items-center gap-3 rounded-full px-3 text-sm font-medium transition duration-200",
                  active
                    ? "bg-black text-white shadow-none"
                    : "text-black/60 hover:bg-black/5 hover:text-black",
                  collapsed && "justify-center px-0",
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0",
                    active ? "text-white" : "text-black/60 group-hover:text-black",
                  )}
                />
                {!collapsed ? (
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={cn("border-t border-sidebar-border p-3", collapsed && "px-2")}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-[8px] border border-border bg-white p-3 shadow-none",
            collapsed && "justify-center border-transparent p-0",
          )}
        >
          <Avatar className="size-9 border border-border">
            <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{profileLine}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                onClick={handleSignOut}
                disabled={isSigningOut}
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden lg:block",
          sidebarCollapsed ? "w-[88px]" : "w-[260px]",
        )}
      >
        <SidebarPanel user={user} collapsed={sidebarCollapsed} />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 h-full w-[86vw] max-w-80 bg-[#f7f7f5]">
            <SidebarPanel
              user={user}
              collapsed={false}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
