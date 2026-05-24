"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type ChartFormatter, chartColor, formatters } from "../lib/chart-theme";
import { tooltipRenderer } from "../lib/tooltip";

export interface LineChartProps<T extends Record<string, number | string>> {
  data: T[];
  xKey: keyof T;
  series: Array<{ key: keyof T; label: string }>;
  height?: number;
  yFormatter?: ChartFormatter;
}

export function LineChart<T extends Record<string, number | string>>({
  data,
  xKey,
  series,
  height = 300,
  yFormatter = formatters.compact,
}: LineChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey as string} />
        <YAxis tickFormatter={(v) => yFormatter(v)} />
        <Tooltip content={tooltipRenderer(yFormatter)} />
        {series.map((s, i) => (
          <Line
            key={s.key as string}
            type="monotone"
            dataKey={s.key as string}
            name={s.label}
            stroke={chartColor(i)}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
