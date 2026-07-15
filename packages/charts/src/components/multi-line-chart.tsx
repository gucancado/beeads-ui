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
import {
  type AxisTickFormatter,
  type ChartFormatter,
  chartColor,
  formatters,
} from "../lib/chart-theme";
import { tooltipRenderer } from "../lib/tooltip";

export interface MultiLineSeries<T> {
  key: keyof T;
  label: string;
  axis?: "left" | "right";
  dash?: "solid" | "dashed" | "dotted";
  /** Override de cor da linha (aceita CSS var). Default: paleta categórica por índice. */
  color?: string;
  /** Exclui a série da legenda automática (ex.: séries de comparação/contexto). */
  hideFromLegend?: boolean;
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
  /** Formata os ticks do eixo X e o label do tooltip (ex.: formatters.dateShort pra séries temporais). */
  xFormatter?: AxisTickFormatter;
  /** Curva da linha. Default "linear": série diária não é suavizada — monotone
   * inventa valores entre pontos. Use "monotone" só em série contínua/agregada. */
  curve?: "linear" | "monotone";
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
  xFormatter,
  curve = "linear",
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
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey={xKey as string} tickFormatter={xFormatter} tick={{ fontSize: 11 }} />
        <YAxis yAxisId="left" tickFormatter={(v) => leftFormatter(v)} tick={{ fontSize: 11 }} />
        {hasRight && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => rightFormatter(v)}
            tick={{ fontSize: 11 }}
          />
        )}
        <Tooltip content={tooltipRenderer(leftTip, tooltipByKey, xFormatter)} />
        <Legend />
        {series.map((s, i) => (
          <Line
            key={s.key as string}
            yAxisId={s.axis ?? "left"}
            type={curve}
            dataKey={s.key as string}
            name={s.label}
            stroke={s.color ?? chartColor(i)}
            strokeWidth={2}
            strokeDasharray={dashMap[s.dash ?? "solid"]}
            dot={false}
            legendType={s.hideFromLegend ? "none" : undefined}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
