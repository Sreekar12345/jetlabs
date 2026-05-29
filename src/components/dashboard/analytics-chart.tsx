"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartSeries } from "@/types/aoip";

type AnalyticsChartProps<T extends Record<string, string | number>> = {
  title: string;
  description: string;
  data: T[];
  series: ChartSeries[];
  type?: "area" | "bar" | "line";
  className?: string;
};

export function AnalyticsChart<T extends Record<string, string | number>>({
  title,
  description,
  data,
  series,
  type = "area",
  className,
}: AnalyticsChartProps<T>) {
  const xKey = Object.keys(data[0] ?? { label: "" })[0] ?? "label";
  const legendItems = series.map((item) => ({
    label: item.label,
    color: item.color,
  }));

  return (
    <Card className={className}>
      <CardHeader className="space-y-3">
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ChartLegend items={legendItems} />
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer>
          {type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltipContent />} cursor={{ fill: "rgba(15,23,42,0.04)" }} />
              {series.map((item) => (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  name={item.label}
                  fill={item.color}
                  radius={[10, 10, 0, 0]}
                  maxBarSize={26}
                />
              ))}
            </BarChart>
          ) : type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltipContent />} />
              {series.map((item) => (
                <Line
                  key={item.key}
                  dataKey={item.key}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          ) : (
            <AreaChart data={data}>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltipContent />} />
              {series.map((item) => (
                <Area
                  key={item.key}
                  dataKey={item.key}
                  name={item.label}
                  stroke={item.color}
                  fill={item.color}
                  fillOpacity={0.16}
                  strokeWidth={2.2}
                />
              ))}
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
