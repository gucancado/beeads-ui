/**
 * Torna um token de cor "alpha-capable" pro Tailwind v3.
 *
 * Os tokens vivem em vars com a cor COMPLETA (`--color-err: oklch(0.52 0.18 25)`),
 * não em canais crus. Declarados como `"var(--color-err)"` puro, o Tailwind v3 não
 * consegue injetar alfa e **DESCARTA em silêncio** toda classe com modificador de
 * opacidade — sem erro, sem warning, sem regra no CSS (a v4 não sofre disso: resolve
 * opacidade via color-mix sozinha, e é por isso que o Storybook nunca mostrou).
 * Isso matava classes que o PRÓPRIO DS emite: `bg-primary/90` (hover de Button),
 * `bg-destructive/5` (Alert), `ring-primary/40` (foco), `text-fg/70`, `bg-ok/15`,
 * e `bg-ok/20`/`bg-err/20` do HeatmapTable (pego em prod no painel BCD, 2026-07-15:
 * heatmap renderizava sem cor nenhuma, células em rgba(0,0,0,0)).
 *
 * A forma função é o hook oficial do v3 pra isso e evita migrar os tokens pra canais
 * crus (que seria major e quebraria quem lê `var(--color-*)` cru em CSS/libs — ver a
 * decisão de 2026-06-01 que migrou só os `--color-sidebar*`).
 *
 * `opacityValue` vem como `var(--tw-bg-opacity, 1)` na utility base e como `0.2` &
 * cia. no modificador — `calc()` cobre os dois.
 */
const alpha = (varName) =>
  ({ opacityValue }) =>
    opacityValue === undefined
      ? `var(${varName})`
      : `color-mix(in oklch, var(${varName}) calc(${opacityValue} * 100%), transparent)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        honey: alpha("--color-honey"),
        "honey-soft": alpha("--color-honey-soft"),
        "honey-deep": alpha("--color-honey-deep"),
        ink: alpha("--color-ink"),
        paper: alpha("--color-paper"),
        "paper-2": alpha("--color-paper-2"),
        ok: alpha("--color-ok"),
        warn: alpha("--color-warn"),
        err: alpha("--color-err"),
        info: alpha("--color-info"),
        bg: alpha("--color-bg"),
        fg: alpha("--color-fg"),
        card: {
          DEFAULT: alpha("--color-card"),
          fg: alpha("--color-card-fg"),
        },
        muted: {
          DEFAULT: alpha("--color-muted"),
          fg: alpha("--color-muted-fg"),
        },
        border: alpha("--color-border"),
        input: alpha("--color-input"),
        ring: alpha("--color-ring"),
        accent: {
          DEFAULT: alpha("--color-accent"),
          fg: alpha("--color-accent-fg"),
        },
        primary: {
          DEFAULT: alpha("--color-primary"),
          fg: alpha("--color-primary-fg"),
        },
        secondary: {
          DEFAULT: alpha("--color-secondary"),
          fg: alpha("--color-secondary-fg"),
        },
        destructive: {
          DEFAULT: alpha("--color-destructive"),
          fg: alpha("--color-destructive-fg"),
        },
        sidebar: {
          DEFAULT: "hsl(var(--color-sidebar) / <alpha-value>)",
          foreground: "hsl(var(--color-sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--color-sidebar-border) / <alpha-value>)",
          accent: "hsl(var(--color-sidebar-accent) / <alpha-value>)",
          "accent-foreground": "hsl(var(--color-sidebar-accent-foreground) / <alpha-value>)",
        },
        "chart-1": alpha("--color-chart-1"),
        "chart-2": alpha("--color-chart-2"),
        "chart-3": alpha("--color-chart-3"),
        "chart-4": alpha("--color-chart-4"),
        "chart-5": alpha("--color-chart-5"),
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      screens: {
        "3xl": "1700px",
      },
    },
  },
  // tailwindcss-animate: os componentes do @beeads/ui usam animate-in/out,
  // fade-*, zoom-* — sem o plugin registrado, dialogs/popovers de apps
  // consumidores Tailwind v3 renderizam sem animação (visto no painel BCD,
  // 2026-07-03; o painel adicionou o plugin localmente como workaround).
  plugins: [require("tailwindcss-animate")],
};
