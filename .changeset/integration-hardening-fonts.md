---
"@beeads/fonts": minor
---

- novo export `./google.css`: framework-agnostic, Fraunces + Geist Mono via Google Fonts
- define as vars `--font-fraunces` e `--font-geist-mono` (mesmos nomes do entry next/font); os aliases semânticos `--font-display`/`--font-mono` continuam vindo do `@beeads/tokens`
- apps fora do Next.js podem usar fontes do DS sem entrada JS (next/font)
