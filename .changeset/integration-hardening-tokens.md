---
"@beeads/tokens": minor
---

- novo export `./vars.css`: CSS vars puras pra Tailwind v3 — substitui cópia manual de valores em globals.css
- theme.css importa vars.css internamente, comportamento v4 inalterado
- apps legados v3 simplificam setup: só importar `@beeads/tokens/vars.css` em globals.css
