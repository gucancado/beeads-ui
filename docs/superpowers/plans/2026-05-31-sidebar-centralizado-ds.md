# Sidebar centralizado — Plano 1: Design System (@beeads/tokens + @beeads/ui)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar no `@beeads/ui` um componente de sidebar composável (moldura idêntica nos 3 apps, miolo injetado), mais os tokens `--sidebar-*` no `@beeads/tokens`, publicáveis no npm.

**Architecture:** Componente de apresentação puro + contexto de colapso. Não conhece rotas nem fonte de dados — recebe tudo por props e `render`-prop (padrão base-ui). `SidebarProvider` gerencia o estado colapsado (controlado ou não-controlado com persistência em cookie/localStorage, SSR-safe). Replica fielmente o layout do `AppLayout.tsx` do Bloquim.

**Tech Stack:** React 19, TypeScript, `@base-ui/react`, `class-variance-authority` (não necessário aqui), `lucide-react`, Tailwind (tokens v3 preset + v4 `@theme inline`), Vitest + Testing Library + happy-dom, Storybook, Changesets, tsup.

**Spec:** `docs/superpowers/specs/2026-05-31-sidebar-centralizado-design.md`

**Escopo deste plano:** SÓ o Design System (Plano 1). As migrações de Bloquim, agentes e painel são planos separados (2, 3, 4), escritos após o publish desta versão, pois consomem a API publicada.

---

## File Structure

- **Criar** `packages/ui/src/components/sidebar.tsx` — toda a família Sidebar (provider, context, aside, header, body, footer, section label, nav item). Arquivo único, no estilo `dropdown-menu.tsx` (várias sub-peças exportadas juntas).
- **Criar** `packages/ui/src/components/sidebar.test.tsx` — testes unitários.
- **Modificar** `packages/ui/src/index.ts` — exports públicos.
- **Modificar** `packages/tokens/src/theme.css` — tokens `--sidebar-*` (v4).
- **Modificar** `packages/tokens/src/preset.cjs` — cores `sidebar*` (v3).
- **Criar** `apps/storybook/stories/Sidebar.stories.tsx` — story com os 3 miolos, light/dark, expandido/colapsado.
- **Criar** `.changeset/sidebar-tokens.md` e `.changeset/sidebar-component.md`.

### Limitação conhecida (documentar, não bloquear)

Modificadores de opacidade Tailwind (`text-sidebar-foreground/70`, `/50`, `/10` etc.) funcionam em **v4** (Bloquim, agentes) mas **degradam para opacidade total em v3** (painel), porque o preset define cores como `var(--color-*)` opacas e o Tailwind v3.4 não injeta alpha em var opaca (color-mix só existe no v4). É o mesmo comportamento que os componentes atuais do DS já têm no painel. Aceitável; eventual migração do painel para v4 resolve. Não muda este plano.

---

## Task 1: Tokens `--sidebar-*` no @beeads/tokens

**Files:**
- Modify: `packages/tokens/src/theme.css`
- Modify: `packages/tokens/src/preset.cjs`

- [ ] **Step 1: Adicionar os tokens ao `:root` em `theme.css`**

Logo após a linha `--color-destructive-fg: oklch(1 0 0);` (fim do bloco "Surface"), inserir:

```css
  /* Sidebar */
  --color-sidebar: hsl(210 20% 96.5%);
  --color-sidebar-foreground: hsl(222 47% 11%);
  --color-sidebar-border: hsl(214.3 31.8% 88%);
  --color-sidebar-accent: hsl(0 0% 100%);
  --color-sidebar-accent-foreground: hsl(222 47% 11%);
```

- [ ] **Step 2: Adicionar overrides dark no bloco `.dark` em `theme.css`**

Logo após `--color-accent-fg: var(--color-ink);` (última linha antes de fechar `.dark`), inserir:

```css
  --color-sidebar: hsl(0 0% 7.8%);
  --color-sidebar-foreground: hsl(210 40% 98%);
  --color-sidebar-border: hsl(215 28% 15%);
  --color-sidebar-accent: hsl(0 0% 13.7%);
  --color-sidebar-accent-foreground: hsl(210 40% 98%);
```

- [ ] **Step 3: Expor no `@theme inline` em `theme.css`**

Logo após `--color-destructive-fg: var(--color-destructive-fg);`, inserir:

```css
  --color-sidebar: var(--color-sidebar);
  --color-sidebar-foreground: var(--color-sidebar-foreground);
  --color-sidebar-border: var(--color-sidebar-border);
  --color-sidebar-accent: var(--color-sidebar-accent);
  --color-sidebar-accent-foreground: var(--color-sidebar-accent-foreground);
```

- [ ] **Step 4: Adicionar cores `sidebar*` ao `preset.cjs`**

Em `packages/tokens/src/preset.cjs`, dentro de `theme.extend.colors`, logo após o bloco `destructive: { ... }`, inserir:

```js
        sidebar: {
          DEFAULT: "var(--color-sidebar)",
          foreground: "var(--color-sidebar-foreground)",
          border: "var(--color-sidebar-border)",
          accent: "var(--color-sidebar-accent)",
          "accent-foreground": "var(--color-sidebar-accent-foreground)",
        },
```

- [ ] **Step 5: Build dos tokens e verificação**

Run: `pnpm --filter @beeads/tokens build`
Then verify (Grep tool ou): a busca por `--color-sidebar` em `packages/tokens/dist/theme.css` deve retornar as 3 ocorrências (`:root`, `.dark`, `@theme inline`) × 5 tokens, e `sidebar` deve aparecer em `packages/tokens/dist/preset.cjs`.
Expected: tokens presentes no dist.

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/src/theme.css packages/tokens/src/preset.cjs
git commit -m "feat(tokens): add --sidebar-* tokens (light/dark, v3 preset + v4 theme)"
```

---

## Task 2: SidebarProvider, useSidebar e Sidebar (contexto + aside)

**Files:**
- Create: `packages/ui/src/components/sidebar.tsx`
- Test: `packages/ui/src/components/sidebar.test.tsx`

- [ ] **Step 1: Escrever os testes que falham**

Criar `packages/ui/src/components/sidebar.test.tsx`:

```tsx
import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarProvider,
  useSidebar,
} from "./sidebar";

describe("useSidebar", () => {
  it("throws when used outside a provider", () => {
    expect(() => renderHook(() => useSidebar())).toThrow(
      /must be used within a SidebarProvider/,
    );
  });
});

describe("Sidebar", () => {
  it("renders expanded width when not collapsed", () => {
    render(
      <SidebarProvider>
        <Sidebar data-testid="aside">conteudo</Sidebar>
      </SidebarProvider>,
    );
    const aside = screen.getByTestId("aside");
    expect(aside).toHaveClass("w-72");
    expect(aside).toHaveAttribute("data-state", "expanded");
  });

  it("renders collapsed width when controlled-collapsed", () => {
    render(
      <SidebarProvider collapsed onCollapsedChange={vi.fn()}>
        <Sidebar data-testid="aside">conteudo</Sidebar>
      </SidebarProvider>,
    );
    const aside = screen.getByTestId("aside");
    expect(aside).toHaveClass("w-16");
    expect(aside).toHaveAttribute("data-state", "collapsed");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @beeads/ui test -- sidebar`
Expected: FAIL — módulo `./sidebar` não existe.

- [ ] **Step 3: Implementar provider + context + Sidebar**

Criar `packages/ui/src/components/sidebar.tsx`:

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";
import { TooltipProvider } from "./tooltip";

// ---------- Context ----------

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}

// ---------- Persistence helpers ----------

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readPersisted(persist: "cookie" | "localStorage", key: string): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    if (persist === "localStorage") {
      const v = window.localStorage.getItem(key);
      return v === null ? null : v === "true";
    }
    const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
    return match ? match[1] === "true" : null;
  } catch {
    return null;
  }
}

function writePersisted(persist: "cookie" | "localStorage", key: string, value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (persist === "localStorage") {
      window.localStorage.setItem(key, String(value));
    } else {
      document.cookie = `${key}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    }
  } catch {
    /* ignore */
  }
}

// ---------- Provider ----------

export interface SidebarProviderProps {
  children: ReactNode;
  /** Controlled collapsed state. When set, the provider does not manage state itself. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Uncontrolled initial value (default false = expanded). Use for SSR seed. */
  defaultCollapsed?: boolean;
  /** Persistence for uncontrolled mode (default "cookie"). */
  persist?: "cookie" | "localStorage" | "none";
  /** Storage key (default "beeads_sidebar_collapsed"). */
  storageKey?: string;
}

export function SidebarProvider({
  children,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  defaultCollapsed = false,
  persist = "cookie",
  storageKey = "beeads_sidebar_collapsed",
}: SidebarProviderProps) {
  const isControlled = controlledCollapsed !== undefined;
  const [internal, setInternal] = useState(defaultCollapsed);

  // Sync from persisted value after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    if (isControlled || persist === "none") return;
    const persisted = readPersisted(persist, storageKey);
    if (persisted !== null) setInternal(persisted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const collapsed = isControlled ? (controlledCollapsed as boolean) : internal;

  const setCollapsed = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternal(value);
        if (persist !== "none") writePersisted(persist, storageKey, value);
      }
      onCollapsedChange?.(value);
    },
    [isControlled, onCollapsedChange, persist, storageKey],
  );

  const toggle = useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);

  const value = useMemo<SidebarContextValue>(
    () => ({ collapsed, toggle, setCollapsed }),
    [collapsed, toggle, setCollapsed],
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

// ---------- Sidebar (aside) ----------

export function Sidebar({ className, children, ...props }: ComponentProps<"aside">) {
  const { collapsed } = useSidebar();
  return (
    <aside
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      className={cn(
        "flex flex-col shrink-0 bg-sidebar text-sidebar-foreground shadow-xl",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-72",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @beeads/ui test -- sidebar`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/sidebar.tsx packages/ui/src/components/sidebar.test.tsx
git commit -m "feat(ui): Sidebar provider, context and aside shell"
```

---

## Task 3: SidebarHeader

**Files:**
- Modify: `packages/ui/src/components/sidebar.tsx`
- Test: `packages/ui/src/components/sidebar.test.tsx`

- [ ] **Step 1: Adicionar testes que falham**

Adicionar ao topo de `sidebar.test.tsx` o import (substituir a linha de import existente do `./sidebar`):

```tsx
import {
  Sidebar,
  SidebarHeader,
  SidebarProvider,
  useSidebar,
} from "./sidebar";
```

Adicionar novo bloco describe:

```tsx
describe("SidebarHeader", () => {
  it("shows the title when expanded", () => {
    render(
      <SidebarProvider>
        <SidebarHeader logo={<svg data-testid="logo" />} title="bloquim" />
      </SidebarProvider>,
    );
    expect(screen.getByText("bloquim")).toBeInTheDocument();
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("hides the title but keeps the logo when collapsed", () => {
    render(
      <SidebarProvider collapsed onCollapsedChange={vi.fn()}>
        <SidebarHeader logo={<svg data-testid="logo" />} title="bloquim" />
      </SidebarProvider>,
    );
    expect(screen.queryByText("bloquim")).not.toBeInTheDocument();
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("toggles collapsed state when the toggle button is clicked", async () => {
    const onChange = vi.fn();
    render(
      <SidebarProvider collapsed={false} onCollapsedChange={onChange}>
        <SidebarHeader logo={<svg />} title="bloquim" />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "recolher menu" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @beeads/ui test -- sidebar`
Expected: FAIL — `SidebarHeader` não exportado.

- [ ] **Step 3: Implementar SidebarHeader**

Adicionar ao `sidebar.tsx` (após o componente `Sidebar`). Adicionar também os imports no topo: `import { PanelLeftClose, PanelLeftOpen } from "lucide-react";` e `import { ThemeToggle } from "./theme-toggle";`.

```tsx
export interface SidebarHeaderProps {
  /** Logo element (always visible). SVG/icon recommended. */
  logo: ReactNode;
  /** App title (hidden when collapsed). */
  title?: ReactNode;
  /** Hide the built-in theme toggle. */
  hideThemeToggle?: boolean;
}

export function SidebarHeader({ logo, title, hideThemeToggle }: SidebarHeaderProps) {
  const { collapsed, toggle } = useSidebar();
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "min-h-[65px] border-b border-sidebar-border/50 p-4 pr-3",
        collapsed ? "flex flex-col items-center gap-2" : "flex items-center gap-2",
      )}
    >
      <div className={cn("flex min-w-0 items-center gap-3", !collapsed && "flex-1")}>
        <span className="shrink-0 text-primary [&_svg]:h-6 [&_svg]:w-6">{logo}</span>
        {!collapsed && title && (
          <span className="truncate font-display text-xl font-medium tracking-tight text-sidebar-foreground">
            {title}
          </span>
        )}
      </div>
      <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
        {!hideThemeToggle && <ThemeToggle />}
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? "expandir menu" : "recolher menu"}
          aria-label={collapsed ? "expandir menu" : "recolher menu"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sidebar-foreground/50 transition-all hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @beeads/ui test -- sidebar`
Expected: PASS (6 testes).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/sidebar.tsx packages/ui/src/components/sidebar.test.tsx
git commit -m "feat(ui): SidebarHeader (logo, title, theme toggle, collapse button)"
```

---

## Task 4: SidebarBody e SidebarSectionLabel

**Files:**
- Modify: `packages/ui/src/components/sidebar.tsx`
- Test: `packages/ui/src/components/sidebar.test.tsx`

- [ ] **Step 1: Adicionar testes que falham**

Atualizar o import do `./sidebar` em `sidebar.test.tsx` para incluir `SidebarBody, SidebarSectionLabel`. Adicionar:

```tsx
describe("SidebarBody", () => {
  it("renders its children", () => {
    render(
      <SidebarProvider>
        <SidebarBody>
          <span>miolo</span>
        </SidebarBody>
      </SidebarProvider>,
    );
    expect(screen.getByText("miolo")).toBeInTheDocument();
  });
});

describe("SidebarSectionLabel", () => {
  it("renders the label when expanded", () => {
    render(
      <SidebarProvider>
        <SidebarSectionLabel>Agentes</SidebarSectionLabel>
      </SidebarProvider>,
    );
    expect(screen.getByText("Agentes")).toBeInTheDocument();
  });

  it("renders nothing when collapsed", () => {
    render(
      <SidebarProvider collapsed onCollapsedChange={vi.fn()}>
        <SidebarSectionLabel>Agentes</SidebarSectionLabel>
      </SidebarProvider>,
    );
    expect(screen.queryByText("Agentes")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @beeads/ui test -- sidebar`
Expected: FAIL — `SidebarBody`/`SidebarSectionLabel` não exportados.

- [ ] **Step 3: Implementar**

Adicionar ao `sidebar.tsx`. Adicionar import no topo: `import { ScrollArea } from "./scroll-area";`.

```tsx
export function SidebarBody({
  className,
  children,
  ...props
}: ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea data-slot="sidebar-body" className={cn("flex-1 px-2 py-4", className)} {...props}>
      {children}
    </ScrollArea>
  );
}

export function SidebarSectionLabel({ className, children, ...props }: ComponentProps<"p">) {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return (
    <p
      data-slot="sidebar-section-label"
      className={cn(
        "mb-2 px-3 text-[10px] font-normal uppercase tracking-[0.22em] text-sidebar-foreground/50",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @beeads/ui test -- sidebar`
Expected: PASS (9 testes).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/sidebar.tsx packages/ui/src/components/sidebar.test.tsx
git commit -m "feat(ui): SidebarBody (scroll) and SidebarSectionLabel"
```

---

## Task 5: SidebarNavItem

**Files:**
- Modify: `packages/ui/src/components/sidebar.tsx`
- Test: `packages/ui/src/components/sidebar.test.tsx`

- [ ] **Step 1: Adicionar testes que falham**

Atualizar o import do `./sidebar` para incluir `SidebarNavItem`. Adicionar:

```tsx
describe("SidebarNavItem", () => {
  it("applies the active styling", () => {
    render(
      <SidebarProvider>
        <SidebarNavItem label="Tarefas" active />
      </SidebarProvider>,
    );
    expect(screen.getByRole("button", { name: "Tarefas" })).toHaveClass(
      "bg-sidebar-accent",
    );
  });

  it("renders as a link via the render prop", () => {
    render(
      <SidebarProvider>
        <SidebarNavItem
          label="Tarefas"
          render={(props) => <a href="/my-tasks" {...props} />}
        />
      </SidebarProvider>,
    );
    expect(screen.getByRole("link", { name: "Tarefas" })).toHaveAttribute(
      "href",
      "/my-tasks",
    );
  });

  it("hides the label when collapsed", () => {
    render(
      <SidebarProvider collapsed onCollapsedChange={vi.fn()}>
        <SidebarNavItem label="Tarefas" icon={<svg />} title="Tarefas" />
      </SidebarProvider>,
    );
    // The trigger button has no visible label text when collapsed.
    expect(screen.getByRole("button")).not.toHaveTextContent("Tarefas");
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(
      <SidebarProvider>
        <SidebarNavItem label="Tarefas" onClick={onClick} />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Tarefas" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @beeads/ui test -- sidebar`
Expected: FAIL — `SidebarNavItem` não exportado.

- [ ] **Step 3: Implementar**

Adicionar ao `sidebar.tsx`. Adicionar import no topo: `import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";`.

```tsx
export interface SidebarNavItemProps {
  label: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  /** Tooltip text shown when collapsed; defaults to `label` if it is a string. */
  title?: string;
  /** base-ui render-prop to swap the element for a router Link (e.g. next/link, wouter). */
  render?: (props: Record<string, unknown>) => ReactNode;
  onClick?: () => void;
  className?: string;
}

export function SidebarNavItem({
  label,
  icon,
  active = false,
  title,
  render,
  onClick,
  className,
}: SidebarNavItemProps) {
  const { collapsed } = useSidebar();

  const classes = cn(
    "flex items-center gap-3 rounded-xl transition-all duration-200 cursor-pointer",
    collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
    className,
  );

  const inner = (
    <>
      {icon && <span className="shrink-0 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>}
      {!collapsed && <span className="truncate">{label}</span>}
    </>
  );

  const elementProps: Record<string, unknown> = {
    className: classes,
    "data-slot": "sidebar-nav-item",
    "data-active": active || undefined,
    onClick,
    children: inner,
  };

  const element = render ? render(elementProps) : <button type="button" {...elementProps} />;

  if (!collapsed) return element;

  const tip = title ?? (typeof label === "string" ? label : undefined);
  if (!tip) return element;

  return (
    <Tooltip>
      <TooltipTrigger render={element as never} />
      <TooltipContent side="right">{tip}</TooltipContent>
    </Tooltip>
  );
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @beeads/ui test -- sidebar`
Expected: PASS (13 testes).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/sidebar.tsx packages/ui/src/components/sidebar.test.tsx
git commit -m "feat(ui): SidebarNavItem (router-agnostic, active state, collapsed tooltip)"
```

---

## Task 6: SidebarFooter

**Files:**
- Modify: `packages/ui/src/components/sidebar.tsx`
- Test: `packages/ui/src/components/sidebar.test.tsx`

- [ ] **Step 1: Adicionar testes que falham**

Atualizar o import do `./sidebar` para incluir `SidebarFooter`. Adicionar:

```tsx
describe("SidebarFooter", () => {
  const user = { name: "Gustavo", email: "g@beeads.com.br", avatarUrl: null };

  it("renders the user name and email when expanded", () => {
    render(
      <SidebarProvider>
        <SidebarFooter user={user} onLogout={vi.fn()} />
      </SidebarProvider>,
    );
    expect(screen.getByText("Gustavo")).toBeInTheDocument();
    expect(screen.getByText("g@beeads.com.br")).toBeInTheDocument();
  });

  it("fires onLogout when the logout button is clicked", async () => {
    const onLogout = vi.fn();
    render(
      <SidebarProvider>
        <SidebarFooter user={user} onLogout={onLogout} />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "sair" }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("renders the settings button only when there are items", () => {
    const { rerender } = render(
      <SidebarProvider>
        <SidebarFooter user={user} onLogout={vi.fn()} />
      </SidebarProvider>,
    );
    expect(screen.queryByRole("button", { name: "configurações" })).not.toBeInTheDocument();

    rerender(
      <SidebarProvider>
        <SidebarFooter
          user={user}
          onLogout={vi.fn()}
          settingsItems={[{ label: "perfil", onSelect: vi.fn() }]}
        />
      </SidebarProvider>,
    );
    expect(screen.getByRole("button", { name: "configurações" })).toBeInTheDocument();
  });

  it("fires onProfileClick when the profile button is clicked", async () => {
    const onProfileClick = vi.fn();
    render(
      <SidebarProvider>
        <SidebarFooter user={user} onLogout={vi.fn()} onProfileClick={onProfileClick} />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /editar perfil/i }));
    expect(onProfileClick).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @beeads/ui test -- sidebar`
Expected: FAIL — `SidebarFooter` não exportado.

- [ ] **Step 3: Implementar**

Adicionar ao `sidebar.tsx`. Adicionar imports no topo: `import { LogOut, Settings } from "lucide-react";`, `import { Avatar, AvatarFallback, AvatarImage } from "./avatar";`, `import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";`.

```tsx
export interface SidebarUser {
  name: string;
  email?: string;
  avatarUrl?: string | null;
}

export interface SidebarSettingsItem {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  /** base-ui render-prop to make the item a router Link instead of a button. */
  render?: (props: Record<string, unknown>) => ReactNode;
}

export interface SidebarFooterProps {
  user: SidebarUser | null;
  settingsItems?: SidebarSettingsItem[];
  onLogout: () => void;
  /** When provided, the user block becomes a clickable "edit profile" button. */
  onProfileClick?: () => void;
}

export function SidebarFooter({
  user,
  settingsItems = [],
  onLogout,
  onProfileClick,
}: SidebarFooterProps) {
  const { collapsed } = useSidebar();

  const avatar = (
    <Avatar className={collapsed ? "h-10 w-10" : "h-9 w-9"}>
      {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
      <AvatarFallback className="bg-primary/20 text-sm font-bold text-primary">
        {user?.name?.charAt(0).toUpperCase() ?? "?"}
      </AvatarFallback>
    </Avatar>
  );

  const settingsButton =
    settingsItems.length > 0 ? (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(props) => (
            <button
              {...props}
              type="button"
              title="configurações"
              aria-label="configurações"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sidebar-foreground/50 transition-all hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        />
        <DropdownMenuContent className="w-56">
          {settingsItems.map((item, i) => {
            const content = (
              <>
                {item.icon && <span className="mr-2 [&_svg]:h-4 [&_svg]:w-4">{item.icon}</span>}
                {item.label}
              </>
            );
            return item.render ? (
              <DropdownMenuItem key={i} render={item.render} className="cursor-pointer">
                {content}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem key={i} onClick={item.onSelect} className="cursor-pointer">
                {content}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null;

  const logoutButton = (
    <button
      type="button"
      title="sair"
      aria-label="sair"
      onClick={onLogout}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sidebar-foreground/50 transition-all hover:bg-destructive/10 hover:text-destructive"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );

  if (collapsed) {
    return (
      <div data-slot="sidebar-footer" className="border-t border-sidebar-border/50 p-2">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onProfileClick}
            disabled={!onProfileClick}
            title={user ? `${user.name}${onProfileClick ? " · editar perfil" : ""}` : undefined}
            className="h-10 w-10 shrink-0 rounded-full transition-all hover:ring-2 hover:ring-primary/40 disabled:hover:ring-0"
          >
            {avatar}
          </button>
          {settingsButton}
          {logoutButton}
        </div>
      </div>
    );
  }

  return (
    <div data-slot="sidebar-footer" className="border-t border-sidebar-border/50 p-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onProfileClick}
          disabled={!onProfileClick}
          title={onProfileClick ? "editar perfil" : undefined}
          aria-label={onProfileClick ? "editar perfil" : undefined}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-sidebar-accent/50 disabled:hover:bg-transparent"
        >
          {avatar}
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name ?? ""}</p>
            {user?.email && (
              <p className="truncate text-xs text-sidebar-foreground/50">{user.email}</p>
            )}
          </div>
        </button>
        {settingsButton}
        {logoutButton}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @beeads/ui test -- sidebar`
Expected: PASS (17 testes).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/sidebar.tsx packages/ui/src/components/sidebar.test.tsx
git commit -m "feat(ui): SidebarFooter (user, settings menu, logout; expanded + collapsed)"
```

---

## Task 7: Exports públicos + typecheck + build

**Files:**
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Adicionar o bloco de export**

Em `packages/ui/src/index.ts`, logo após a linha do ScrollArea (`export { ScrollArea } from "./components/scroll-area";`), adicionar:

```ts
export {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNavItem,
  SidebarProvider,
  SidebarSectionLabel,
  useSidebar,
  type SidebarFooterProps,
  type SidebarHeaderProps,
  type SidebarNavItemProps,
  type SidebarProviderProps,
  type SidebarSettingsItem,
  type SidebarUser,
} from "./components/sidebar";
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @beeads/ui typecheck`
Expected: PASS (sem erros).

- [ ] **Step 3: Build**

Run: `pnpm --filter @beeads/ui build`
Expected: build sem erros; `dist/index.d.ts` contém `Sidebar`.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/index.ts
git commit -m "feat(ui): export Sidebar component family from package root"
```

---

## Task 8: Storybook story

**Files:**
- Create: `apps/storybook/stories/Sidebar.stories.tsx`

- [ ] **Step 1: Criar a story**

Criar `apps/storybook/stories/Sidebar.stories.tsx`:

```tsx
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNavItem,
  SidebarProvider,
  SidebarSectionLabel,
} from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";
import {
  CheckSquare,
  FileText,
  Folders,
  LayoutDashboard,
  NotebookPen,
  Plug,
  User,
} from "lucide-react";

const meta: Meta = {
  title: "Layout/Sidebar",
};
export default meta;
type Story = StoryObj;

const user = {
  name: "Gustavo Cançado",
  email: "gustavo.azvd@gmail.com",
  avatarUrl: null,
};

const settingsItems = [
  { label: "perfil", icon: <User />, onSelect: () => {} },
  { label: "modelos", icon: <FileText />, onSelect: () => {} },
  { label: "integrações", icon: <Plug />, onSelect: () => {} },
];

function Shell({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="h-[560px]">
      <SidebarProvider collapsed={collapsed} onCollapsedChange={() => {}} persist="none">
        <Sidebar>
          <SidebarHeader logo={<NotebookPen />} title={<>blo·quim</>} />
          <SidebarBody>
            <div className="space-y-6">
              <div className="space-y-1">
                <SidebarNavItem icon={<CheckSquare />} label="Tarefas" active />
                <SidebarNavItem icon={<Folders />} label="Espaços de Trabalho" />
              </div>
              <div className="space-y-1">
                <SidebarSectionLabel>Espaços</SidebarSectionLabel>
                <SidebarNavItem icon={<LayoutDashboard />} label="Marketing" />
                <SidebarNavItem icon={<LayoutDashboard />} label="Produto" />
              </div>
            </div>
          </SidebarBody>
          <SidebarFooter
            user={user}
            settingsItems={settingsItems}
            onLogout={() => {}}
            onProfileClick={() => {}}
          />
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}

export const Expanded: Story = { render: () => <Shell /> };
export const Collapsed: Story = { render: () => <Shell collapsed /> };

export const Dark: Story = {
  render: () => (
    <div className="dark bg-bg p-0">
      <Shell />
    </div>
  ),
};
```

- [ ] **Step 2: Verificar no Storybook**

Run: `pnpm --filter @beeads/ui build` (garante o pacote atualizado para o Storybook resolver), depois `pnpm storybook` e abrir http://localhost:6006 → Layout/Sidebar.
Expected: stories Expanded, Collapsed e Dark renderizam corretamente; colapsado mostra logo + ícones + tooltips; rodapé com avatar/nome/email, settings e logout.

(Validação visual manual — não há snapshot test.)

- [ ] **Step 3: Commit**

```bash
git add apps/storybook/stories/Sidebar.stories.tsx
git commit -m "docs(storybook): Sidebar stories (expanded, collapsed, dark)"
```

---

## Task 9: Changesets + verificação final do monorepo

**Files:**
- Create: `.changeset/sidebar-tokens.md`
- Create: `.changeset/sidebar-component.md`

- [ ] **Step 1: Changeset do tokens**

Criar `.changeset/sidebar-tokens.md`:

```md
---
"@beeads/tokens": minor
---

Adiciona tokens `--sidebar-*` (sidebar, foreground, border, accent, accent-foreground) com light/dark, expostos no preset Tailwind v3 e no `@theme inline` v4.
```

- [ ] **Step 2: Changeset do componente**

Criar `.changeset/sidebar-component.md`:

```md
---
"@beeads/ui": minor
---

Adiciona a família Sidebar (`SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarBody`, `SidebarFooter`, `SidebarSectionLabel`, `SidebarNavItem`, `useSidebar`) — sidebar de aplicação router-agnóstico e data-injected, padronizando o menu lateral entre os apps beeads.
```

- [ ] **Step 3: Verificação completa do monorepo**

Run: `pnpm typecheck`
Expected: PASS em todos os pacotes.

Run: `pnpm test`
Expected: PASS (incluindo os 17 testes de sidebar).

Run: `pnpm lint`
Expected: PASS (biome check). Corrigir o que aparecer (ex.: ordenação de imports, keys de map — se o biome reclamar de `key={i}`, manter, é estável para lista estática de settings).

Run: `pnpm build`
Expected: PASS em todos os pacotes.

- [ ] **Step 4: Commit**

```bash
git add .changeset/sidebar-tokens.md .changeset/sidebar-component.md
git commit -m "chore: changesets for sidebar tokens (tokens minor) and component (ui minor)"
```

---

## Self-review (preenchido pelo autor do plano)

**Cobertura da spec:**
- Tokens `--sidebar-*` (spec §1) → Task 1. ✓
- API do componente / exports (spec §2) → Tasks 2-7. ✓
- Layout fiel ao Bloquim, expandido/colapsado (spec §2, spec do usuário) → Tasks 3, 5, 6. Nota: logo VISÍVEL no header colapsado é melhoria intencional sobre o Bloquim atual (que oculta), conforme spec explícito do usuário. ✓
- Estado colapsado controlado/não-controlado + SSR-safe + cookie/localStorage (spec §3) → Task 2 (`SidebarProvider`). ✓
- Router-agnóstico via render-prop (spec §2) → Task 5 (`SidebarNavItem`), Task 6 (settings item `render`). ✓
- Tailwind v3/v4 (spec §6) → Task 1 (preset + theme). Limitação de opacidade em v3 documentada. ✓
- Storybook (spec §"Testes") → Task 8. ✓
- Versionamento minor + changesets (spec §"Versionamento") → Task 9. ✓
- **Fora deste plano (planos 2-4):** consumo de `/api/auth/me` nos apps, migração de cada app, remoção dos tokens locais do Bloquim. Correto — dependem do publish.

**Placeholder scan:** sem TBD/TODO; todo passo de código tem código completo.

**Type consistency:** `SidebarUser`, `SidebarSettingsItem`, `SidebarFooterProps`, `SidebarNavItemProps`, `SidebarProviderProps`, `SidebarHeaderProps`, `useSidebar` — nomes idênticos entre definição (Tasks 2-6) e export (Task 7) e story (Task 8). `render`-prop com assinatura `(props: Record<string, unknown>) => ReactNode` consistente em NavItem e settings item.

---

## Próximos planos (a escrever após o publish desta versão)

- **Plano 2 — Migração Bloquim:** trocar `AppLayout.tsx` pelo `Sidebar` do DS; manter `SidebarWorkspaceList` como miolo; remover tokens `--sidebar-*` locais do `index.css` (passam a vir do DS); descartar `ui/sidebar.tsx` shadcn.
- **Plano 3 — Migração agentes:** `app-sidebar.tsx` → `Sidebar` do DS; miolo = lista de agentes; mover ThemeToggle do rodapé pro header; adicionar `getBloquimProfile()` (`/api/auth/me`) e injetar no footer.
- **Plano 4 — Migração painel:** `SideNavBreadcrumb.tsx` + `ClientSwitcher.tsx` → `Sidebar` do DS; miolo = ClientSwitcher + nav drill-down Meta/Google; consumir `/api/auth/me`; subir versões do DS.
- **Pré-requisito de todos:** validar que `requireAuth` do `/api/auth/me` aceita o cookie SSO `__beeads_session`; se não, expor rota SSO de perfil.
