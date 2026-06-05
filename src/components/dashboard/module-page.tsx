import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProgressWidget } from "@/components/dashboard/progress-widget";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PageContainer } from "@/components/layout/page-container";
import type { ModulePageData } from "@/types/aoip";

export function ModulePage({ module }: { module: ModulePageData }) {
  return (
    <PageContainer
      eyebrow={module.eyebrow}
      title={module.title}
      description={module.description}
    >
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {module.stats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            detail={stat.detail}
            tone={stat.tone}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {module.focus.map((item) => (
            <ProgressWidget key={item.title} {...item} />
          ))}
        </div>
        <ActivityFeed
          title="Operational activity"
          description="Recent workflow signals across this module."
          items={module.activity}
        />
      </div>
    </PageContainer>
  );
}
