import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActivityFeedItem } from "@/types/aoip";

function toneClass(tone?: ActivityFeedItem["tone"]) {
  if (tone === "positive") {
    return "bg-success";
  }

  if (tone === "warning") {
    return "bg-warning";
  }

  if (tone === "critical") {
    return "bg-critical";
  }

  return "bg-foreground";
}

type ActivityFeedProps = {
  title: string;
  description?: string;
  items: ActivityFeedItem[];
  className?: string;
};

export function ActivityFeed({
  title,
  description,
  items,
  className,
}: ActivityFeedProps) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <CardTitle>{title}</CardTitle>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-2xl border border-border bg-muted/40 p-4"
            >
              <span
                className={cn(
                  "mt-1 size-2.5 shrink-0 rounded-full",
                  toneClass(item.tone),
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  {item.tag ? <Badge variant="outline">{item.tag}</Badge> : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.detail}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {item.timestamp}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
