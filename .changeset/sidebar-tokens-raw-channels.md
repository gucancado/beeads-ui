---
"@beeads/tokens": major
---

Sidebar tokens (`--color-sidebar`, `--color-sidebar-foreground`, `--color-sidebar-border`, `--color-sidebar-accent`, `--color-sidebar-accent-foreground`) now hold **raw HSL channels** (e.g. `210 20% 96.5%`) instead of full `hsl(...)` values. This makes opacity modifiers (`bg-sidebar-accent/50`, `text-sidebar-foreground/70`) work in **both** Tailwind v3 and v4 from a single source — consumer apps no longer need local raw-channel overrides.

**BREAKING:** if you reference these CSS variables directly (e.g. `background: var(--color-sidebar)`) instead of via the Tailwind `sidebar*` color utilities, wrap them in `hsl(...)`: `background: hsl(var(--color-sidebar))`. Using the Tailwind classes (`bg-sidebar`, `text-sidebar-foreground`, etc.) requires no change.
