import type { UserRole } from "@/types/auth";
import type {
  BreadcrumbItem,
  NavigationSection,
} from "@/types/aoip";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  ClipboardCheck,
  Compass,
  FileCheck2,
  FileSearch,
  FileStack,
  Gauge,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  LibraryBig,
  Medal,
  Microscope,
  Presentation,
  ScrollText,
  Sparkles,
  Users2,
  Settings,
  FolderCheck,
} from "lucide-react";
import { getDefaultDashboardPath } from "@/lib/auth/routing";

const STUDENT_NAVIGATION: NavigationSection[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/student/dashboard",
        icon: LayoutDashboard,
        description: "Personal operating system for academic execution.",
        section: "Overview",
        searchPlaceholder: "Search milestones, submissions, and mentor notes",
      },
      {
        title: "Profile",
        href: "/student/profile",
        icon: GraduationCap,
        description: "Academic identity, skills, and research context.",
        section: "Overview",
      },
      {
        title: "Performance Score",
        href: "/student/performance-score",
        icon: Gauge,
        description: "Execution index across research, delivery, and review.",
        section: "Overview",
      },
      {
        title: "Achievements",
        href: "/student/achievements",
        icon: Medal,
        description: "Milestones, recognitions, and portfolio signals.",
        section: "Overview",
      },
    ],
  },
  {
    label: "Research",
    items: [
      {
        title: "Problem Market",
        href: "/student/research/problem-market",
        icon: Compass,
        description: "Discover validated academic and industry-backed problems.",
        section: "Research",
        badge: "Hot",
      },
      {
        title: "IEEE Paper",
        href: "/student/research/ieee-paper",
        icon: ScrollText,
        description: "Publication workflow and paper section progress.",
        section: "Research",
      },
    ],
  },
  {
    label: "Execution",
    items: [
      {
        title: "Project Workspace",
        href: "/student/project",
        icon: Users2,
        description: "Project management workspace, stage timeline, and task board.",
        section: "Execution",
      },
      {
        title: "Execution Playbook",
        href: "/student/execution/execution-playbook",
        icon: ClipboardCheck,
        description: "Run weekly rituals, checkpoints, and execution templates.",
        section: "Execution",
      },
      {
        title: "Weekly Submissions",
        href: "/student/execution/weekly-submissions",
        icon: FileCheck2,
        description: "Evidence pipeline for sprint-by-sprint delivery.",
        section: "Execution",
      },
      {
        title: "Final Submission",
        href: "/student/execution/final-submission",
        icon: FileStack,
        description: "Package final outcomes, demos, and publication artifacts.",
        section: "Execution",
      },
    ],
  },
  {
    label: "Evaluation",
    items: [
      {
        title: "Viva",
        href: "/student/evaluation/viva",
        icon: Presentation,
        description: "Readiness signal for oral defense and evaluator Q&A.",
        section: "Evaluation",
      },
    ],
  },
];

const FACULTY_NAVIGATION: NavigationSection[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/faculty/dashboard",
        icon: LayoutDashboard,
        description: "Operational cockpit for mentoring and review throughput.",
        section: "Overview",
        searchPlaceholder: "Search teams, submissions, and project risk signals",
      },

    ],
  },
  {
    label: "Management",
    items: [
      {
        title: "Students",
        href: "/faculty/management/students",
        icon: GraduationCap,
        description: "Student roster, ownership, and academic operating context.",
        section: "Management",
      },
      {
        title: "Student Verification",
        href: "/faculty/management/student-verification",
        icon: ClipboardCheck,
        description: "Verify student profiles and audit academic corrections.",
        section: "Management",
      },
      {
        title: "Teams & Batches",
        href: "/faculty/management/teams-batches",
        icon: Users2,
        description: "Batch composition, teams, and mentor assignment coverage.",
        section: "Management",
      },
    ],
  },
  {
    label: "Review",
    items: [
      {
        title: "Review",
        href: "/faculty/review/review-queue",
        icon: FileSearch,
        description: "Fast review workflow for weekly and milestone submissions.",
        section: "Review",
        badge: "18",
      },
    ],
  },
  {
    label: "Monitoring",
    items: [
      {
        title: "Backlog Analytics",
        href: "/faculty/monitoring/backlog-analytics",
        icon: BrainCircuit,
        description: "Academic backlog pressure affecting project delivery.",
        section: "Monitoring",
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        title: "Achievement Analytics",
        href: "/faculty/intelligence/achievement-analytics",
        icon: BadgeCheck,
        description: "Outcome visibility across recognitions and milestone signals.",
        section: "Intelligence",
      },
      {
        title: "Performance Score",
        href: "/faculty/intelligence/performance-score",
        icon: Gauge,
        description: "Cohort scoring trends and intervention leverage.",
        section: "Intelligence",
      },
      {
        title: "Problem Library",
        href: "/faculty/intelligence/problem-library",
        icon: LibraryBig,
        description: "Reusable problem repository across domains and cohorts.",
        section: "Intelligence",
      },
    ],
  },
];

export const NAVIGATION_BY_ROLE: Record<UserRole, NavigationSection[]> = {
  STUDENT: STUDENT_NAVIGATION,
  FACULTY: FACULTY_NAVIGATION,
  ADMIN: [
    {
      label: "System Overview",
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          description: "Administrator control center.",
          section: "Overview",
        },
        {
          title: "Analytics",
          href: "/admin/analytics",
          icon: BarChart3,
          description: "System activity, traffic, and growth metrics.",
          section: "Overview",
        },
        {
          title: "Audit Logs",
          href: "/admin/audits",
          icon: Activity,
          description: "Immutable platform operations audit trail.",
          section: "Overview",
        },
      ],
    },
    {
      label: "User Management",
      items: [
        {
          title: "User Management",
          href: "/admin/users",
          icon: Users2,
          description: "General directory of student and faculty users.",
          section: "Users",
        },
        {
          title: "Student Management",
          href: "/admin/students",
          icon: GraduationCap,
          description: "Directory and verification of student records.",
          section: "Users",
        },
        {
          title: "Faculty Management",
          href: "/admin/faculty",
          icon: Presentation,
          description: "Directory and team coverage of faculty advisors.",
          section: "Users",
        },
      ],
    },
    {
      label: "Platform Assets",
      items: [
        {
          title: "Project Management",
          href: "/admin/projects",
          icon: FolderCheck,
          description: "Oversight of research and engineering projects.",
          section: "Platform Assets",
        },
        {
          title: "Team Management",
          href: "/admin/teams",
          icon: Users2,
          description: "Administration of student teams and assignments.",
          section: "Platform Assets",
        },
        {
          title: "Application Management",
          href: "/admin/applications",
          icon: FileSearch,
          description: "Review and triage student onboarding applications.",
          section: "Platform Assets",
        },
      ],
    },
    {
      label: "Execution & Reviews",
      items: [
        {
          title: "Submissions",
          href: "/admin/submissions",
          icon: FileCheck2,
          description: "Track and download sprint artifacts and research logs.",
          section: "Execution & Reviews",
        },
        {
          title: "Evaluations",
          href: "/admin/evaluations",
          icon: BadgeCheck,
          description: "Auditing grades and reviews entered by faculty.",
          section: "Execution & Reviews",
        },
        {
          title: "Settings",
          href: "/admin/settings",
          icon: Settings,
          description: "Configure system-wide parameters, flags, and rules.",
          section: "Execution & Reviews",
        },
      ],
    },
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Administrator",
};

export function getNavigationForRole(role: UserRole) {
  return NAVIGATION_BY_ROLE[role];
}

export function flattenNavigation(role: UserRole) {
  return NAVIGATION_BY_ROLE[role].flatMap((section) => section.items);
}

export function isNavigationItemActive(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  return pathname.startsWith(`${href}/`);
}

export function getActiveNavigationItem(role: UserRole, pathname: string) {
  const items = flattenNavigation(role);

  return items.find((item) => isNavigationItemActive(pathname, item.href)) ?? null;
}

export function getBreadcrumbs(role: UserRole, pathname: string): BreadcrumbItem[] {
  const activeItem = getActiveNavigationItem(role, pathname);
  const roleHomeLabel = `${ROLE_LABELS[role]} Workspace`;

  if (!activeItem) {
    return [{ label: roleHomeLabel, href: getDefaultDashboardPath(role) }];
  }

  return [
    { label: roleHomeLabel, href: getDefaultDashboardPath(role) },
    { label: activeItem.section },
    { label: activeItem.title },
  ];
}

export function getSearchPlaceholder(role: UserRole, pathname: string) {
  const activeItem = getActiveNavigationItem(role, pathname);

  return (
    activeItem?.searchPlaceholder ??
    `Search ${ROLE_LABELS[role].toLowerCase()} workspace signals`
  );
}

export function getProfileHref(role: UserRole) {
  if (role === "STUDENT") {
    return "/student/profile";
  }

  if (role === "FACULTY") {
    return "/faculty/management/students";
  }

  return "/admin";
}
