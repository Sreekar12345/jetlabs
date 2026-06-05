import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
  description: string;
  className?: string;
};

export function StatsCard({
  icon: Icon,
  value,
  label,
  description,
  className,
}: StatsCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[8px] border border-white/10 bg-[#0B1026]/[0.68] p-5 text-white shadow-[0_18px_60px_rgba(2,6,23,0.34)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-200/[0.24] hover:bg-[#15194A]/[0.74]",
        className,
      )}
    >
      <div
        className="relative flex size-11 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.08] text-white transition duration-300 group-hover:scale-105"
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="relative mt-6 text-4xl font-semibold tracking-normal">
        {value}
      </p>
      <p
        className="relative mt-1 text-sm font-semibold text-white/[0.92]"
      >
        {label}
      </p>
      <p className="relative mt-3 text-sm leading-6 text-slate-300/[0.72]">
        {description}
      </p>
    </article>
  );
}
