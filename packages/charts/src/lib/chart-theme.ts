export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
] as const;

export function chartColor(index: number) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export type ChartFormatter = (value: number) => string;

export const formatters = {
  number: (v: number) => v.toLocaleString("pt-BR"),
  currency: (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v),
  percent: (v: number) => `${(v * 100).toFixed(1)}%`,
  compact: (v: number) =>
    new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v),
};
