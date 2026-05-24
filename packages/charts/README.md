# @beeads/charts

Visualização de dados do design system beeads — wrappers sobre `recharts` com tokens unificados.

## Uso

```bash
pnpm add @beeads/charts @beeads/ui @beeads/tokens
```

No `globals.css`:

```css
@import "@beeads/ui/styles.css";
@import "@beeads/charts/styles.css";
```

Em qualquer componente:

```tsx
import { AreaChart, ChartFrame, KpiCard, KpiGrid } from "@beeads/charts";

<KpiGrid>
  <KpiCard label="Revenue" value={48500} delta={0.12} hint="vs último mês" />
  <KpiCard label="CPA" value={32.5} delta={-0.08} inverseDelta />
</KpiGrid>

<ChartFrame title="Spend over time">
  <AreaChart
    data={data}
    xKey="date"
    series={[{ key: "spend", label: "Spend" }]}
  />
</ChartFrame>
```

## Componentes disponíveis

- **Frame:** `ChartFrame` (Card + header + footer)
- **Charts básicos:** `LineChart`, `AreaChart`, `BarChart`, `DonutChart`
- **Charts avançados:** `MultiLineChart` (dual-axis, dash patterns), `FunnelChart` (4-stage com drop %), `HeatmapTable`
- **KPIs:** `KpiCard` (com `inverseDelta` pra custos), `KpiGrid`
- **Filtros:** `PeriodPicker` (presets + custom range), `FilterBar` (search + slot)
- **Theme:** paleta categórica de 5 cores via `--color-chart-1..5`, `formatters` (pt-BR: number, currency, percent, compact)
