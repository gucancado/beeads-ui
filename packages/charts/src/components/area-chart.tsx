"use client";

import {
  Area,
  CartesianGrid,
  AreaChart as RechartsAreaChart,
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

export interface AreaChartProps<T extends Record<string, number | string>> {
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

export function AreaChart<T extends Record<string, number | string>>({
  data,
  xKey,
  series,
  height = 300,
  yFormatter = formatters.compact,
  tooltipFormatter,
  xFormatter,
  curve = "linear",
}: AreaChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient
              key={s.key as string}
              id={`grad-${s.key as string}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={chartColor(i)} stopOpacity={0.4} />
              <stop offset="95%" stopColor={chartColor(i)} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey={xKey as string} tickFormatter={xFormatter} tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => yFormatter(v)} tick={{ fontSize: 11 }} />
        <Tooltip content={tooltipRenderer(tooltipFormatter ?? yFormatter, undefined, xFormatter)} />
        {series.map((s, i) => (
          <Area
            key={s.key as string}
            type={curve}
            dataKey={s.key as string}
            name={s.label}
            stroke={chartColor(i)}
            fill={`url(#grad-${s.key as string})`}
            strokeWidth={2}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
