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
import {
  type AxisTickFormatter,
  type ChartFormatter,
  chartColor,
  formatters,
} from "../lib/chart-theme";
import { tooltipRenderer } from "../lib/tooltip";

export interface LineChartProps<T extends Record<string, number | string>> {
  data: T[];
  xKey: keyof T;
  series: Array<{ key: keyof T; label: string }>;
  height?: number;
  yFormatter?: ChartFormatter;
  /** Formatter do tooltip. Default: o mesmo do eixo (`yFormatter`) — back-compat. */
  tooltipFormatter?: ChartFormatter;
  /** Formata os ticks do eixo X e o label do tooltip (ex.: formatters.dateShort pra séries temporais). */
  xFormatter?: AxisTickFormatter;
  /** Curva da linha. Default "linear": série diária não é suavizada — monotone
   * inventa valores entre pontos. Use "monotone" só em série contínua/agregada. */
  curve?: "linear" | "monotone";
}

export function LineChart<T extends Record<string, number | string>>({
  data,
  xKey,
  series,
  height = 300,
  yFormatter = formatters.compact,
  tooltipFormatter,
  xFormatter,
  curve = "linear",
}: LineChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey={xKey as string} tickFormatter={xFormatter} tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => yFormatter(v)} tick={{ fontSize: 11 }} />
        <Tooltip content={tooltipRenderer(tooltipFormatter ?? yFormatter, undefined, xFormatter)} />
        {series.map((s, i) => (
          <Line
            key={s.key as string}
            type={curve}
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
