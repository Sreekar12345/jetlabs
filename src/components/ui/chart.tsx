"use client";

import type { TooltipProps } from "recharts";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export const MONOCHROME_CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const CHART_COLOR_CLASS_MAP: Record<string, string> = {
  "var(--color-chart-1)": "bg-[var(--color-chart-1)]",
  "var(--color-chart-2)": "bg-[var(--color-chart-2)]",
  "var(--color-chart-3)": "bg-[var(--color-chart-3)]",
  "var(--color-chart-4)": "bg-[var(--color-chart-4)]",
  "var(--color-chart-5)": "bg-[var(--color-chart-5)]",
  "#ffffff": "bg-[var(--color-chart-1)]",
  "#d4d4d8": "bg-[var(--color-chart-2)]",
  "#a1a1aa": "bg-[var(--color-chart-3)]",
  "#71717a": "bg-[var(--color-chart-4)]",
  "#52525b": "bg-[var(--color-chart-5)]",
};

function getChartColorClass(color?: string) {
  if (!color) {
    return "bg-slate-400";
  }

  return CHART_COLOR_CLASS_MAP[color] ?? "bg-slate-400";
}

export function ChartContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactElement;
}) {
  return (
    <div className={cn("h-[280px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-panel px-4 py-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <div className="mt-2 space-y-2">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className={cn("size-2 rounded-full", getChartColorClass(entry.color))} />
              <span>{entry.name}</span>
            </div>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartLegend({
  items,
}: {
  items: Array<{ label: string; color: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
        >
          <span className={cn("size-2 rounded-full", getChartColorClass(item.color))} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
