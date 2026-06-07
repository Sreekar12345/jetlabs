"use client";

import { cn } from "@/lib/utils";
import type { LoginRole } from "@/types/auth";

type RoleSelectorProps = {
  value: LoginRole;
  onChange: (value: LoginRole) => void;
  disabled?: boolean;
};

export function RoleSelector({ value, onChange, disabled = false }: RoleSelectorProps) {
  const roles: { value: LoginRole; label: string }[] = [
    { value: "STUDENT", label: "Student" },
    { value: "FACULTY", label: "Faculty" },
    { value: "ADMIN", label: "Admin" },
  ];

  return (
    <div className="flex w-full gap-1.5 rounded-xl bg-slate-100/80 p-1 border border-slate-200/60 dark:bg-slate-800/40 dark:border-slate-700/60">
      {roles.map((role) => {
        const isActive = value === role.value;
        return (
          <button
            key={role.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(role.value)}
            className={cn(
              "flex-1 py-2.5 px-4 text-center text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/20",
              isActive
                ? "bg-[#4F46E5] text-white shadow-sm"
                : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            {role.label}
          </button>
        );
      })}
    </div>
  );
}
