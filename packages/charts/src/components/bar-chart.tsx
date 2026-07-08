"use client";

import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  type AxisTickFormatter,
  type ChartFormatter,
  chartColor,
  formatters,
} from "../lib/chart-theme";
import { tooltipRenderer } from "../lib/tooltip";

export interface BarChartProps<T extends Record<string, number | string>> {
  data: T[];
  xKey: keyof T;
  series: Array<{ key: keyof T; label: string }>;
  height?: number;
  yFormatter?: ChartFormatter;
  /** Formatter do tooltip. Default: o mesmo do eixo (`yFormatter`) — back-compat. */
  tooltipFormatter?: ChartFormatter;
  stacked?: boolean;
  /** Formata os ticks do eixo X e o label do tooltip (ex.: formatters.dateShort pra séries temporais). */
  xFormatter?: AxisTickFormatter;
}

export function BarChart<T extends Record<string, number | string>>({
  data,
  xKey,
  series,
  height = 300,
  yFormatter = formatters.compact,
  tooltipFormatter,
  stacked = false,
  xFormatter,
}: BarChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey as string} tickFormatter={xFormatter} />
        <YAxis tickFormatter={(v) => yFormatter(v)} />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
          content={tooltipRenderer(tooltipFormatter ?? yFormatter, undefined, xFormatter)}
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
