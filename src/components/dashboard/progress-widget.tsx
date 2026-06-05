import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProgressSnapshot } from "@/types/aoip";

type ProgressWidgetProps = ProgressSnapshot & {
  className?: string;
};

export function ProgressWidget({
  title,
  value,
  progress,
  detail,
  className,
}: ProgressWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{progress}%</p>
        </div>
        <Progress value={progress} />
        <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
