import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { StudentSubmissionStatus } from "@/types/aoip";

type SubmissionCardProps = {
  title: string;
  status: StudentSubmissionStatus;
  dueLabel: string;
  progress: number;
  note: string;
  actions?: React.ReactNode;
};

function badgeVariant(status: StudentSubmissionStatus) {
  if (status === "On track") {
    return "secondary";
  }

  if (status === "Needs revision") {
    return "destructive";
  }

  return "outline";
}

export function SubmissionCard({
  title,
  status,
  dueLabel,
  progress,
  note,
  actions,
}: SubmissionCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <Badge variant={badgeVariant(status)}>{status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{dueLabel}</p>
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Readiness</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}
