# @beeads/tokens

## 0.5.0

### Minor Changes

- 1c09952: - novo export `./vars.css`: CSS vars puras pra Tailwind v3 — substitui cópia manual de valores em globals.css
  - theme.css importa vars.css internamente, comportamento v4 inalterado
  - apps legados v3 simplificam setup: só importar `@beeads/tokens/vars.css` em globals.css

## 0.4.0

### Minor Changes

- 03d3e1a: Preset Tailwind v3 registra o `tailwindcss-animate` (agora dependência do pacote). Os componentes do `@beeads/ui` usam as utilities `animate-in/out`, `fade-*` e `zoom-*` — sem o plugin, dialogs e popovers de apps consumidores renderizavam sem animação e cada app precisava registrá-lo manualmente.

## 0.3.0

### Minor Changes

- 791d666: Sidebar tokens (`--color-sidebar`, `--color-sidebar-foreground`, `--color-sidebar-border`, `--color-sidebar-accent`, `--color-sidebar-accent-foreground`) now hold **raw HSL channels** (e.g. `210 20% 96.5%`) instead of full `hsl(...)` values. This makes opacity modifiers (`bg-sidebar-accent/50`, `text-sidebar-foreground/70`) work in **both** Tailwind v3 and v4 from a single source — consumer apps no longer need local raw-channel overrides.

  **BREAKING:** if you reference these CSS variables directly (e.g. `background: var(--color-sidebar)`) instead of via the Tailwind `sidebar*` color utilities, wrap them in `hsl(...)`: `background: hsl(var(--color-sidebar))`. Using the Tailwind classes (`bg-sidebar`, `text-sidebar-foreground`, etc.) requires no change.

  Internally, the v4 `@theme inline` sidebar tokens reference derived full-color vars (`--color-sidebar-*-full`, defined as `hsl(var(--color-sidebar*))`) via a bare `var()` so Tailwind's legacy srgb `color-mix` fallback stays clean (no double-wrapped `hsl(hsl(...))`). These `-full` vars auto-track `.dark` through the raw-channel overrides.

## 0.2.0

### Minor Changes

- 9df3a9b: Adiciona tokens `--sidebar-*` (sidebar, foreground, border, accent, accent-foreground) com light/dark, expostos no preset Tailwind v3 e no `@theme inline` v4.

## 0.1.0

### Minor Changes

- 5a0e3e8: Initial release of @beeads/\* design system.

  - **@beeads/tokens** — CSS vars + Tailwind v3 preset + Tailwind v4 `@theme inline`. Honey accent, ink/paper neutrals, semantic colors (ok/warn/err/info), categorical chart palette (chart-1 through chart-5), light + dark themes.
  - **@beeads/fonts** — Fraunces (display) + Geist Mono (body) via `next/font/google`.
  - **@beeads/ui** — 37 primitives over `@base-ui/react@1.5`: forms (Button, Input, Textarea, Label, Checkbox, Switch, RadioGroup, Select, Field, Slider), overlays (Dialog, Sheet, Drawer, Popover, Tooltip, DropdownMenu, AlertDialog, Command), layout (Card, Separator, Tabs, Accordion, Avatar, Breadcrumb, Pagination, Collapsible, ScrollArea), feedback (Badge, Skeleton, Alert, Spinner, Empty, Progress, Toaster), date (Calendar, DatePicker), utilities (cn, ThemeProvider).
  - **@beeads/charts** — 12 components over `recharts`: ChartFrame, LineChart, AreaChart, BarChart, MultiLineChart (dual-axis), DonutChart, FunnelChart, HeatmapTable, KpiCard, KpiGrid, PeriodPicker, FilterBar. Includes pt-BR formatters and chart-tokens-aware tooltip.
