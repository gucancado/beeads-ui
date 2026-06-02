---
"@beeads/ui": minor
---

`Sidebar` component evolution (accessibility, i18n, and flexibility):

- **a11y:** collapsed `SidebarNavItem` now exposes its `title`/label as an `aria-label` (accessible name) and marks the collapsed badge bubble `aria-hidden`; `SidebarBody` wraps navigation in a `<nav>` landmark (customizable via `aria-label`, default "Navegação principal"); dev-only warning when a collapsed item lacks an accessible name.
- **i18n:** new `labels` prop on `SidebarProvider` to override the built-in pt-BR strings (`collapse`, `expand`, `settings`, `logout`, `editProfile`).
- **`collapsible` prop** on `SidebarProvider` (default `true`): when `false`, the collapse/expand toggle is hidden and `toggle()` is a no-op.
- **`themeToggle` slot** on `SidebarHeader` to render a custom theme toggle in place of the default.
- **`viewportRef`** on `ScrollArea` (and forwarded by `SidebarBody`) for scroll-restoration.
- **Hardening:** the persistence cookie now sets the `Secure` flag on HTTPS.

All changes are additive and backward compatible.
