import {
  Card,
  CardContent,
} from "@/components/ui/card";

/**
 * Unified KPI card component — extracted and merged from both
 * student-dashboard.tsx and faculty-dashboard.tsx Kpi components.
 * Supports both simple and interactive (clickable) modes.
 */
export function KpiCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
  onClick,
  children,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "success" | "warn" | "bad";
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  const toneCls =
    tone === "success"
      ? "text-emerald-600"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "bad"
          ? "text-rose-600"
          : "text-muted-foreground";

  return (
    <Card
      className={
        onClick ? "cursor-pointer transition hover:border-primary/40" : ""
      }
      onClick={onClick}
    >
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{label}</div>
          {icon && <span className={toneCls}>{icon}</span>}
        </div>
        <div className="text-3xl mt-1 tracking-tight">{value}</div>
        <div className={`text-xs mt-1 ${toneCls}`}>{hint}</div>
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Small stat box — used in dashboard summary grids.
 */
export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
