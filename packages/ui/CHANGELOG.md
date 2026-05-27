# @beeads/ui

## 0.2.1

### Patch Changes

- fix: aplica `z-50` no `Positioner` dos overlays (DropdownMenu, Popover, Tooltip, Select) ao invés do `Popup` interno.

  O `Menu.Positioner` / `Popover.Positioner` / etc. do `@base-ui/react` aplica `transform` no elemento posicionador, criando um stacking context próprio. O `z-50` que antes ficava no `Popup` interno só competia dentro desse contexto — perdendo para qualquer elemento ancestral com z-index numérico (ex: sidebar com `z-20` como flex item, que cria stacking context por causa da regra do Flexbox).

  Mudança não-quebra: a API pública dos componentes (`DropdownMenuContent`, `PopoverContent`, `TooltipContent`, `SelectContent`) permanece idêntica.

## 0.2.0

### Minor Changes

- Add `ThemeToggle` component — pre-built button with Sun/Moon icons that toggles light/dark theme via `next-themes`. Replaces local implementations in consumer apps.

## 0.1.0

### Minor Changes

- 5a0e3e8: Initial release of @beeads/\* design system.

  - **@beeads/tokens** — CSS vars + Tailwind v3 preset + Tailwind v4 `@theme inline`. Honey accent, ink/paper neutrals, semantic colors (ok/warn/err/info), categorical chart palette (chart-1 through chart-5), light + dark themes.
  - **@beeads/fonts** — Fraunces (display) + Geist Mono (body) via `next/font/google`.
  - **@beeads/ui** — 37 primitives over `@base-ui/react@1.5`: forms (Button, Input, Textarea, Label, Checkbox, Switch, RadioGroup, Select, Field, Slider), overlays (Dialog, Sheet, Drawer, Popover, Tooltip, DropdownMenu, AlertDialog, Command), layout (Card, Separator, Tabs, Accordion, Avatar, Breadcrumb, Pagination, Collapsible, ScrollArea), feedback (Badge, Skeleton, Alert, Spinner, Empty, Progress, Toaster), date (Calendar, DatePicker), utilities (cn, ThemeProvider).
  - **@beeads/charts** — 12 components over `recharts`: ChartFrame, LineChart, AreaChart, BarChart, MultiLineChart (dual-axis), DonutChart, FunnelChart, HeatmapTable, KpiCard, KpiGrid, PeriodPicker, FilterBar. Includes pt-BR formatters and chart-tokens-aware tooltip.

### Patch Changes

- Updated dependencies [5a0e3e8]
  - @beeads/tokens@0.1.0
