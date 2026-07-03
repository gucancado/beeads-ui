---
"@beeads/charts": minor
---

Três adições em `@beeads/charts` (todas back-compat, opt-in):

- **`KpiCard` ganha `deltaTone?: "state" | "neutral"`** (default `"state"`). Em `"neutral"`, o delta mantém a mesma seta + percentual, porém em `text-muted-fg` e ignorando `inverseDelta` — pra métricas de contexto (investimento, alcance) onde subir/descer não é bom nem ruim.
- **`tooltipFormatter` separado do eixo** em `AreaChart`, `LineChart` e `BarChart` (e `leftTooltipFormatter`/`rightTooltipFormatter` no `MultiLineChart`). O eixo Y continua no `yFormatter` (compacto); o tooltip pode usar um formatter próprio (exato). Default = o mesmo formatter do eixo.
- **`formatters.compactShort`** — compacto estilo k/M pra eixos (`1250 → "1,3k"`, `33263 → "33k"`, `1651802 → "1,7M"`, `999600 → "1M"`, `830 → "830"`), mais curto que o `compact` do Intl ("mil/mi").
