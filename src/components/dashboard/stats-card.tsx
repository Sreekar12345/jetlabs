import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  label: string;
  value: string;
  detail: string;
  icon?: LucideIcon;
  tone?: "neutral" | "positive" | "warning" | "critical";
};

function toneClass(tone: NonNullable<StatsCardProps["tone"]>) {
  if (tone === "positive") {
    return "text-success";
  }

  if (tone === "warning") {
    return "text-warning";
  }

  if (tone === "critical") {
    return "text-critical";
  }

  return "text-foreground";
}

export function StatsCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-3 pb-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </p>
          {Icon ? (
            <span className="flex size-10 items-center justify-center rounded-2xl border border-border bg-muted">
              <Icon className={cn("size-4", toneClass(tone))} />
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
