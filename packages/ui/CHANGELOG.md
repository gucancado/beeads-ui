# @beeads/ui

## 0.7.1

### Patch Changes

- Updated dependencies [5f71299]
  - @beeads/tokens@0.5.1

## 0.7.0

### Minor Changes

- 1c09952: - dist/classlist.txt: manifesto estável de classes pra scan do Tailwind, exportado via `./classlist.txt`
  - styles.css agora injeta `@source "./classlist.txt"` em vez de depender de scan dos bundles JS
  - integração Tailwind v4 mais robusta, especialmente com Turbopack

### Patch Changes

- Updated dependencies [1c09952]
  - @beeads/tokens@0.5.0

## 0.6.0

### Minor Changes

- 24c3a2c: Novos padrões de plataforma no DS:

  - **Sidebar fixa:** `sticky top-0 h-svh` por default no desktop — a barra não acompanha mais o scroll da página. Layouts confinados (sidebar dentro de caixa menor que a viewport) sobrescrevem com `<Sidebar className="h-full" />`.
  - **Sidebar mobile:** abaixo de 768px (configurável via `mobileBreakpoint`) vira off-canvas (Sheet); novo export `SidebarTrigger` (hamburger pro topbar); nav item fecha o menu ao navegar; labels novos `openMenu`/`mobileMenu`.
  - Novo hook `useIsMobile(breakpoint = 768)`.
  - `SheetContent` ganha `hideClose`.
  - **Caixa baixa:** strings default agora em lowercase ("anterior", "próxima", "escolher data", "carregando", …); sr-only "Close"/"More" viram "fechar"/"mais"; `SidebarSectionLabel` troca `uppercase` por `lowercase`.
  - **DatePicker** exibe `dd/MM/yyyy` (era "8 de julho de 2026").
  - **Dialog/AlertDialog:** conteúdo alto rola internamente (`max-h-[calc(100dvh-2rem)] overflow-y-auto`) em vez de estourar a viewport.

## 0.5.1

### Patch Changes

- Updated dependencies [03d3e1a]
  - @beeads/tokens@0.4.0

## 0.5.0

### Minor Changes

- af70c0d: `Sidebar` component evolution (accessibility, i18n, and flexibility):

  - **a11y:** collapsed `SidebarNavItem` now exposes its `title`/label as an `aria-label` (accessible name) and marks the collapsed badge bubble `aria-hidden`; `SidebarBody` wraps navigation in a `<nav>` landmark (customizable via `aria-label`, default "Navegação principal"); dev-only warning when a collapsed item lacks an accessible name.
  - **i18n:** new `labels` prop on `SidebarProvider` to override the built-in pt-BR strings (`collapse`, `expand`, `settings`, `logout`, `editProfile`).
  - **`collapsible` prop** on `SidebarProvider` (default `true`): when `false`, the collapse/expand toggle is hidden and `toggle()` is a no-op.
  - **`themeToggle` slot** on `SidebarHeader` to render a custom theme toggle in place of the default.
  - **`viewportRef`** on `ScrollArea` (and forwarded by `SidebarBody`) for scroll-restoration.
  - **Hardening:** the persistence cookie now sets the `Secure` flag on HTTPS.

  All changes are additive and backward compatible.

### Patch Changes

- Updated dependencies [791d666]
  - @beeads/tokens@0.3.0

## 0.4.0

### Minor Changes

- 3664d70: `SidebarNavItem` agora aceita uma prop opcional `badge` (ReactNode). No estado expandido o badge aparece após o label (alinhado à direita); no estado colapsado vira uma pequena bolha sobre o ícone, mantendo o indicador visível em modo ícone-only (ex.: contador de alertas).

## 0.3.0

### Minor Changes

- 9df3a9b: Adiciona a família Sidebar (`SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarBody`, `SidebarFooter`, `SidebarSectionLabel`, `SidebarNavItem`, `useSidebar`) — sidebar de aplicação router-agnóstico e data-injected, padronizando o menu lateral entre os apps beeads.

### Patch Changes

- Updated dependencies [9df3a9b]
  - @beeads/tokens@0.2.0

## 0.2.2

### Patch Changes

- fix: o `dist/styles.css` agora declara `@source "./index.{js,mjs}"` no topo, fazendo o Tailwind v4 do consumer escanear automaticamente o bundle do @beeads/ui em busca de classes inline.

  Antes, classes geradas dinamicamente dentro dos componentes — principalmente as variantes `data-[checked]:`, `data-[unchecked]:`, `data-[highlighted]:`, `data-[selected]:`, etc. usadas em Switch, Tabs, DropdownMenu, Combobox — não eram detectadas pelo Tailwind do app consumidor (que por default só escaneia o working tree, não `node_modules`). Resultado visível mais óbvio: toggles do Switch apareciam sempre desativados independente do estado real.

  Com a injeção do `@source` no styles.css, basta o consumidor manter o `@import "@beeads/ui/styles.css"` que tudo passa a funcionar — sem precisar declarar `@source` manualmente no próprio CSS.

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
