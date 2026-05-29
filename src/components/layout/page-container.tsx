import { cn } from "@/lib/utils";

type PageContainerProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function PageContainer({
  eyebrow,
  title,
  description,
  actions,
  className,
  children,
}: PageContainerProps) {
  return (
    <section className={cn("space-y-8", className)}>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-3">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-3">
            <h1 className="text-balance">{title}</h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
