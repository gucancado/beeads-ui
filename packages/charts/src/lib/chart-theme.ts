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
  /**
   * Compacto estilo k/M pra EIXOS de gráfico ("1,3k", "33k", "1,7M"). O `compact`
   * (Intl) dá "mil/mi" — verboso demais pra ticks de eixo. Use com um
   * `tooltipFormatter` próprio que mostre o valor cheio no hover.
   * Ex.: 1.250 → "1,3k" · 33.263 → "33k" · 1.651.802 → "1,7M" · 830 → "830".
   */
  compactShort: (v: number) => {
    const abs = Math.abs(v);
    // 999.500+ arredondaria pra "1.000k" no tier k — promove pra M antes.
    if (abs >= 999_500)
      return `${(v / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}M`;
    if (abs >= 10_000) return `${Math.round(v / 1000).toLocaleString("pt-BR")}k`;
    if (abs >= 1_000)
      return `${(v / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}k`;
    return Math.round(v).toLocaleString("pt-BR");
  },
};
