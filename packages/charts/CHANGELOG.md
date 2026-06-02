# @beeads/charts

## 0.2.0

### Minor Changes

- 4ee3075: `@beeads/tokens` and `@beeads/ui` are now **peerDependencies** instead of regular dependencies. This ensures the consuming app's single installed copy of the design system is used, preventing duplicate/conflicting `@beeads/tokens` instances (and mismatched CSS variables) when an app uses both `@beeads/charts` and `@beeads/ui`.

  **Migration:** ensure your app has `@beeads/tokens` and `@beeads/ui` in its own `dependencies` (apps using `@beeads/charts` already install these). `recharts` remains a direct dependency (DS standardizes on `recharts@^2.x`).

## 0.1.5

### Patch Changes

- Updated dependencies [3664d70]
  - @beeads/ui@0.4.0

## 0.1.4

### Patch Changes

- Updated dependencies [9df3a9b]
- Updated dependencies [9df3a9b]
  - @beeads/ui@0.3.0
  - @beeads/tokens@0.2.0

## 0.1.3

### Patch Changes

- Updated dependencies
  - @beeads/ui@0.2.2

## 0.1.2

### Patch Changes

- Updated dependencies
  - @beeads/ui@0.2.1

## 0.1.1

### Patch Changes

- Updated dependencies
  - @beeads/ui@0.2.0

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
  - @beeads/ui@0.1.0
