"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type ChartFormatter, chartColor, formatters } from "../lib/chart-theme";
import { tooltipRenderer } from "../lib/tooltip";

export interface MultiLineSeries<T> {
  key: keyof T;
  label: string;
  axis?: "left" | "right";
  dash?: "solid" | "dashed" | "dotted";
}

export interface MultiLineChartProps<T extends Record<string, number | string>> {
  data: T[];
  xKey: keyof T;
  series: MultiLineSeries<T>[];
  height?: number;
  leftFormatter?: ChartFormatter;
  rightFormatter?: ChartFormatter;
  /** Formatter do tooltip do eixo esquerdo. Default: `leftFormatter` — back-compat. */
  leftTooltipFormatter?: ChartFormatter;
  /** Formatter do tooltip do eixo direito. Default: `rightFormatter` — back-compat. */
  rightTooltipFormatter?: ChartFormatter;
}

const dashMap = { solid: "0", dashed: "6 4", dotted: "2 4" };

export function MultiLineChart<T extends Record<string, number | string>>({
  data,
  xKey,
  series,
  height = 320,
  leftFormatter = formatters.compact,
  rightFormatter = formatters.compact,
  leftTooltipFormatter,
  rightTooltipFormatter,
}: MultiLineChartProps<T>) {
  const hasRight = series.some((s) => s.axis === "right");

  // Tooltip: cada série formata conforme seu eixo. Default = formatter do eixo
  // correspondente (back-compat com o comportamento antigo de formatter único).
  const leftTip = leftTooltipFormatter ?? leftFormatter;
  const rightTip = rightTooltipFormatter ?? rightFormatter;
  const tooltipByKey = Object.fromEntries(
    series.map((s) => [String(s.key), s.axis === "right" ? rightTip : leftTip]),
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey as string} />
        <YAxis yAxisId="left" tickFormatter={(v) => leftFormatter(v)} />
        {hasRight && (
          <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => rightFormatter(v)} />
        )}
        <Tooltip content={tooltipRenderer(leftTip, tooltipByKey)} />
        <Legend />
        {series.map((s, i) => (
          <Line
            key={s.key as string}
            yAxisId={s.axis ?? "left"}
            type="monotone"
            dataKey={s.key as string}
            name={s.label}
            stroke={chartColor(i)}
            strokeWidth={2}
            strokeDasharray={dashMap[s.dash ?? "solid"]}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
