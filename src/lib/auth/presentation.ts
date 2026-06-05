import {
  FileText,
  Rocket,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type {
  AuthHeroStat,
  AuthRoleContent,
  LoginRole,
  RoleSwitcherOption,
} from "@/types/auth";

export type AuthHeroStatItem = AuthHeroStat & {
  icon: LucideIcon;
};

export const SYNTRA_BRAND_NAME = "JetLabs";
export const SYNTRA_SUPPORT_EMAIL = "helpdesk@jetlabs.app";
export const SYNTRA_FORGOT_PASSWORD_HREF = `mailto:${SYNTRA_SUPPORT_EMAIL}?subject=JetLabs%20password%20reset`;
export const SYNTRA_ACCESS_REQUEST_HREF = `mailto:${SYNTRA_SUPPORT_EMAIL}?subject=JetLabs%20faculty%20access%20request`;

export const AUTH_HERO_CONTENT = {
  badge: "Academic Innovation Platform",
  title: "Run real projects.\nPublish real research.",
  description:
    "The structured execution OS for engineering innovation cells. Track projects, research publications, faculty reviews, milestones, and team progress in one place.",
  footer:
    "Institution-based authentication, role-aware dashboards, and audit-friendly review histories built for higher education teams.",
};

export const AUTH_SELF_SERVICE_NOTE =
  "Self-service sign-up is open for student, faculty, and administrator accounts.";

export const AUTH_REQUEST_ACCESS_NOTE =
  "Faculty workspaces are provisioned with review authority, student scope, and audit trails.";

export const LOGIN_ROLE_OPTIONS: RoleSwitcherOption[] = [
  {
    value: "STUDENT",
    label: "Student",
    description: "Projects, milestones, submissions",
  },
  {
    value: "FACULTY",
    label: "Faculty",
    description: "Reviews, approvals, cohort oversight",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "System stats, settings, control",
  },
];

export const LOGIN_ROLE_CONTENT: Record<LoginRole, AuthRoleContent> = {
  STUDENT: {
    eyebrow: "Student access",
    description:
      "Open your project workspace, research logs, and mentor feedback with your institution-issued login.",
    emailPlaceholder: "you@college.edu",
    passwordPlaceholder: "Enter your JetLabs password",
    accessNote:
      "Student onboarding supports institution-approved self-service sign-up and invitation-based activation.",
  },
  FACULTY: {
    eyebrow: "Faculty access",
    description:
      "Continue to milestone reviews, cohort health dashboards, and publication checkpoints tied to your department.",
    emailPlaceholder: "faculty@university.edu",
    passwordPlaceholder: "Enter your faculty password",
    accessNote:
      "Faculty access is provisioned with department-level oversight and role controls.",
  },
  ADMIN: {
    eyebrow: "Admin access",
    description:
      "Manage system-wide parameters, database records, user privileges, and system configurations.",
    emailPlaceholder: "admin@college.edu",
    passwordPlaceholder: "Enter your admin password",
    accessNote:
      "Administrator workspaces support platform metrics, cohort assignments, and data seeding.",
  },
};

export const AUTH_HERO_STATS: AuthHeroStatItem[] = [
  {
    icon: Rocket,
    value: "250+",
    label: "Active Projects",
    description: " ",
  },
  {
    icon: FileText,
    value: "128+",
    label: "Research Papers",
    description: " ",
  },
  {
    icon: Users,
    value: "42+",
    label: "Innovation Teams",
    description: " ",
  },
];

export const AUTH_ASSURANCE_ICON = ShieldCheck;
