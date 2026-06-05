import type { UserRole } from "@/types/auth";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  BookX,
  ClipboardList,
  Compass,
  FileText,
  Gauge,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  Presentation,
  Trophy,
  Upload,
  Users,
  Zap,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const STUDENT_NAV: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/problems", label: "Problem Marketplace", icon: Compass },
  { href: "/student/submissions", label: "Weekly Submissions", icon: Upload, badge: "1" },
  { href: "/student/paper", label: "IEEE Paper", icon: FileText },
  { href: "/student/final", label: "Final Submission", icon: Trophy },
  { href: "/student/playbooks", label: "Execution Playbooks", icon: BookOpenCheck },
  { href: "/student/viva", label: "Viva Readiness", icon: Presentation },
  { href: "/student/achievements", label: "Achievements", icon: Trophy },
  { href: "/student/performance", label: "Performance Score", icon: Gauge },
  { href: "/student/profile", label: "My Profile", icon: GraduationCap },
];

const FACULTY_NAV: NavItem[] = [
  { href: "/faculty", label: "Dashboard", icon: LayoutDashboard },
  { href: "/faculty/students", label: "Students", icon: GraduationCap },
  { href: "/faculty/teams", label: "Teams & Batches", icon: Users },
  { href: "/faculty/reviews", label: "Review", icon: ClipboardList, badge: "22" },
  { href: "/faculty/viva", label: "Defense Readiness", icon: Presentation },
  { href: "/faculty/backlogs", label: "Backlog Analytics", icon: BookX },
  { href: "/faculty/achievements", label: "Achievement Analytics", icon: Trophy },
  { href: "/faculty/performance", label: "Performance Score", icon: Gauge },
  { href: "/faculty/problems", label: "Problem Library", icon: Compass },
];

const ADMIN_NAV: NavItem[] = [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }];

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  STUDENT: STUDENT_NAV,
  FACULTY: FACULTY_NAV,
  ADMIN: ADMIN_NAV,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Administrator",
};

export function isNavItemActive(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  if (href === "/student" || href === "/faculty" || href === "/admin") {
    return pathname === href;
  }

  return pathname.startsWith(`${href}/`) || pathname === href;
}
