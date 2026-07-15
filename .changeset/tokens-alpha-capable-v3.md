---
"@beeads/tokens": patch
---

**Fix (Tailwind v3):** classes com modificador de opacidade voltam a funcionar. Os tokens do `preset.cjs` eram `"var(--color-x)"` puro sobre vars com cor completa (`oklch(...)`), forma que o v3 não consegue combinar com alfa — ele **descartava a classe em silêncio**, sem erro nem regra no CSS. Agora os tokens usam a forma função (`color-mix`), que é o hook oficial do v3 pra isso.

Isso estava matando classes que o **próprio DS emite** — 14 delas, medidas: `bg-primary/90` (hover de Button), `bg-destructive/5` e `border-destructive/50` (Alert), `ring-primary/40` (foco), `text-fg/70`, `bg-ok/15`, `bg-ok/5`, `bg-warn/15`, `bg-warn/5`, `border-ok/50`, `border-warn/50`, `bg-accent/90`, `bg-secondary/80`, e `bg-ok/20`/`bg-err/20` do `HeatmapTable`. Descoberto em prod no painel BCD: o heatmap renderizava sem cor nenhuma (células em `rgba(0,0,0,0)`).

Só afeta consumidores **v3** — o v4 (`theme.css`) já resolvia opacidade via `color-mix` sozinho, e é por isso que o Storybook nunca mostrou o defeito. **Sem mudança de formato de token** (as vars continuam `oklch()`/`hsl()` cheias): nada a fazer nos apps além de atualizar. Consumidores v3 devem ver cor voltando em superfícies/bordas tingidas que hoje estão transparentes.

`sidebar.*` já era alpha-capable (raw channels + `<alpha-value>`) e fica como está.
