import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DashboardRoutePageProps = {
  title: string;
  description: string;
  roleHomeHref: string;
  roleHomeLabel: string;
};

export function DashboardRoutePage({
  title,
  description,
  roleHomeHref,
  roleHomeLabel,
}: DashboardRoutePageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Connected</CardTitle>
          <CardDescription>
            This page now resolves through Next.js App Router and can be extended with live data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={roleHomeHref}>Back to {roleHomeLabel} dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
