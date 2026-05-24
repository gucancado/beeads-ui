# @beeads/tokens

Design tokens do design system beeads — CSS vars + Tailwind v4 `@theme` + Tailwind v3 preset.

## Uso em Tailwind v4 (Next.js 14+, Vite)

```bash
pnpm add @beeads/tokens
```

No `globals.css`:

```css
@import "@beeads/tokens/theme.css";
```

Você agora tem classes utilitárias: `bg-honey`, `text-fg`, `border-border`, `bg-card`, etc.

## Uso em Tailwind v3

```js
// tailwind.config.js
module.exports = {
  presets: [require("@beeads/tokens/preset.cjs")],
  content: ["./src/**/*.{ts,tsx}"],
};
```

E no `globals.css` (importe o CSS pra definir as vars):

```css
@import "@beeads/tokens/theme.css";
```

## Dark mode

Adicione classe `.dark` ao `<html>` ou `<body>`. Tokens semânticos (`--color-bg`, `--color-fg`, `--color-card`, `--color-muted`, `--color-border`) trocam automaticamente. Use `next-themes` (ou similar) para gerenciar o toggle.

## Tokens disponíveis

- **Brand:** honey, honey-soft, honey-deep, ink, paper, paper-2
- **Semânticos:** ok, warn, err, info
- **Surface:** bg, fg, card, card-fg, muted, muted-fg, border, input, ring
- **UI:** primary, primary-fg, secondary, secondary-fg, accent, accent-fg, destructive, destructive-fg
- **Charts:** chart-1, chart-2, chart-3, chart-4, chart-5 (paleta categórica)
- **Radius:** sm, md, lg, xl, 2xl, 3xl
- **Fontes:** display (Fraunces), sans, mono (Geist Mono)
- **Breakpoint:** `3xl` (1700px)
