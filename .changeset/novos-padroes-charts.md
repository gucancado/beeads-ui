---
"@beeads/charts": minor
---

Novos padrões de plataforma no DS:

- **Formatters de data/hora:** `formatters.date` (dd/MM/yyyy), `.dateShort` (dd/MM), `.time` (HH:mm), `.timeSeconds` (HH:mm:ss), `.dateTime` — aceitam `Date | string ISO | epoch`.
- **`xFormatter`** opcional em LineChart/AreaChart/BarChart/MultiLineChart: formata ticks do eixo X e o label do tooltip.
- **PeriodPicker:** trigger em `dd/MM/yyyy`; responsivo (1 mês + presets empilhados no mobile); presets em caixa baixa.
- **FilterBar:** placeholder "buscar…".
- **KpiGrid:** escala pra 6 colunas em `3xl:` (ultrawide).
