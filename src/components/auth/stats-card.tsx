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
        "group relative overflow-hidden rounded-[8px] border border-white/10 bg-white/5 p-5 text-white shadow-none backdrop-blur-xl transition duration-200",
        className,
      )}
    >
      <div
        className="relative flex size-11 items-center justify-center rounded-[8px] border border-white/10 bg-white/5 text-white transition duration-200"
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
