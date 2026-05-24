"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type ChartFormatter, chartColor, formatters } from "../lib/chart-theme";
import { tooltipRenderer } from "../lib/tooltip";

export interface BarChartProps<T extends Record<string, number | string>> {
  data: T[];
  xKey: keyof T;
  series: Array<{ key: keyof T; label: string }>;
  height?: number;
  yFormatter?: ChartFormatter;
  stacked?: boolean;
}

export function BarChart<T extends Record<string, number | string>>({
  data,
  xKey,
  series,
  height = 300,
  yFormatter = formatters.compact,
  stacked = false,
}: BarChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey as string} />
        <YAxis tickFormatter={(v) => yFormatter(v)} />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
          content={tooltipRenderer(yFormatter)}
        />
        {series.map((s, i) => (
          <Bar
            key={s.key as string}
            dataKey={s.key as string}
            name={s.label}
            fill={chartColor(i)}
            stackId={stacked ? "a" : undefined}
            radius={stacked ? 0 : [4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
