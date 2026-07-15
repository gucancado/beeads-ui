---
"@beeads/charts": minor
---

Defaults dos gráficos passam a ser o padrão visual da plataforma: grid no token `--color-border` (antes caía no `#ccc` do recharts), ticks dos eixos em `fontSize: 11` (antes 12) e linhas/áreas **lineares** por default (antes `monotone`).

⚠️ **Mudança visual** pra quem já usa `LineChart`, `MultiLineChart`, `AreaChart` ou `BarChart`. A suavização anterior continua disponível via `curve="monotone"` nos três primeiros.

Motivação: suavizar série diária inventa valores entre pontos; e o grid fora do token quebrava o dark mode.
