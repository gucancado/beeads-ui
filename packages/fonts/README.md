# @beeads/fonts

Fontes do design system beeads — Fraunces (display) + Geist Mono (corpo) via `next/font/google`.

## Uso (Next.js)

```bash
pnpm add @beeads/fonts
```

No layout root:

```tsx
import { fraunces, geistMono } from "@beeads/fonts";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

`@beeads/tokens` já configura `--font-display` e `--font-mono` apontando pra estas CSS vars.

## Outros frameworks (Vite, etc.)

Para apps que NÃO são Next.js (Vite + React Router, etc.), importe via Google Fonts:

```css
@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Geist+Mono:wght@400;500;600&display=swap");
```

## Requisitos

- Next.js >= 14 como peerDependency.
