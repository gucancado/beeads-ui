# Novos Padrões de Plataforma — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar no DS os 5 novos padrões de plataforma: caixa baixa em textos de sistema, responsividade mobile/notebook/ultrawide, datas dd/MM/yyyy e horas HH:mm(:ss), sidebar fixa no scroll, rodapé da sidebar normatizado.

**Architecture:** Convenção + strings default lowercase (sem text-transform global, exceto SidebarSectionLabel); hook `useIsMobile` novo em `@beeads/ui` alimenta Sidebar off-canvas (Sheet) e PeriodPicker responsivo; formatters de data/hora entram em `@beeads/charts` com `xFormatter` opcional nos 4 charts cartesianos; docs em PRINCIPLES.md normatizam tudo pros apps.

**Tech Stack:** React 19, @base-ui/react, date-fns v4, recharts, vitest + happy-dom + testing-library, Tailwind v4/v3 via @beeads/tokens, changesets.

**Spec:** `docs/superpowers/specs/2026-07-08-novos-padroes-plataforma-design.md`

## Global Constraints

- Idioma de todo texto/copy: **pt-BR, caixa baixa** ("visão geral", não "Visão geral"). Exceções: nomes próprios, siglas (CPA, ROAS), código.
- Datas exibidas: **dd/MM/yyyy**. Horas: **HH:mm** ou **HH:mm:ss**. Eixos densos podem usar dd/MM.
- Nunca hardcode de cor/size — só tokens/classes do `@beeads/tokens`.
- Triggers de overlay usam `render={...}` (base-ui), nunca `asChild`.
- Rodar na raiz do repo: `pnpm lint && pnpm typecheck && pnpm test` antes de cada commit. Working dir: `c:/Users/gusta/Projetos/beeads-ui`, branch `feat/novos-padroes-plataforma`.
- NÃO mexer em `packages/tokens` (breakpoint 3xl já existe) nem publicar nada.

---

### Task 1: Strings lowercase + pt-BR em @beeads/ui

**Files:**
- Modify: `packages/ui/src/components/pagination.tsx`
- Modify: `packages/ui/src/components/date-picker.tsx` (só o placeholder)
- Modify: `packages/ui/src/components/theme-toggle.tsx`
- Modify: `packages/ui/src/components/spinner.tsx`
- Modify: `packages/ui/src/components/dialog.tsx`
- Modify: `packages/ui/src/components/sheet.tsx`
- Modify: `packages/ui/src/components/breadcrumb.tsx`
- Modify: `packages/ui/src/components/sidebar.tsx` (aria default + SectionLabel)

**Interfaces:**
- Consumes: nada.
- Produces: nenhuma mudança de API — só valores de strings default e uma classe CSS.

- [ ] **Step 1: Aplicar as trocas de string** (Edit em cada arquivo):

| Arquivo | De | Para |
|---|---|---|
| pagination.tsx L43 | `aria-label="Página anterior"` / `<span>Anterior</span>` | `aria-label="página anterior"` / `<span>anterior</span>` |
| pagination.tsx L52 | `aria-label="Próxima página"` / `<span>Próxima</span>` | `aria-label="próxima página"` / `<span>próxima</span>` |
| pagination.tsx L67 | `<span className="sr-only">More</span>` | `<span className="sr-only">mais</span>` |
| date-picker.tsx L23 | `placeholder = "Escolher data"` | `placeholder = "escolher data"` |
| theme-toggle.tsx L21 | `"Mudar para tema claro"` / `"Mudar para tema escuro"` | `"mudar para tema claro"` / `"mudar para tema escuro"` |
| theme-toggle.tsx L24 | `<span className="sr-only">Trocar tema</span>` | `<span className="sr-only">trocar tema</span>` |
| spinner.tsx L10+L12 | `"Carregando"` (2×) | `"carregando"` (2×) |
| dialog.tsx L32 | `<span className="sr-only">Close</span>` | `<span className="sr-only">fechar</span>` |
| sheet.tsx L41 | `<span className="sr-only">Close</span>` | `<span className="sr-only">fechar</span>` |
| breadcrumb.tsx L63 | `<span className="sr-only">More</span>` | `<span className="sr-only">mais</span>` |
| sidebar.tsx L266 | `"aria-label": ariaLabel = "Navegação principal"` | `"aria-label": ariaLabel = "navegação principal"` |
| sidebar.tsx L285 (SidebarSectionLabel) | `"mb-2 px-3 text-[10px] font-normal uppercase tracking-[0.22em] text-sidebar-foreground/50"` | `"mb-2 px-3 text-[10px] font-normal lowercase tracking-[0.22em] text-sidebar-foreground/50"` |

- [ ] **Step 2: Verificar que nada quebrou**

Run: `pnpm lint && pnpm --filter @beeads/ui typecheck && pnpm --filter @beeads/ui test`
Expected: tudo verde. Se `sidebar.test.tsx` ou `tooltip.test.tsx` assertarem alguma dessas strings capitalizadas, atualizar a asserção pro novo valor lowercase (é mudança intencional de padrão).

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components
git commit -m "feat(ui): strings default em caixa baixa + pt-BR (padrão lowercase da plataforma)"
```

---

### Task 2: Hook useIsMobile em @beeads/ui

**Files:**
- Create: `packages/ui/src/hooks/use-is-mobile.ts`
- Test: `packages/ui/src/hooks/use-is-mobile.test.ts`
- Modify: `packages/ui/src/index.ts` (export)

**Interfaces:**
- Produces: `useIsMobile(breakpoint?: number): boolean` — export nomeado de `@beeads/ui`. Default breakpoint 768. Retorna `false` no primeiro render (SSR-safe) e sincroniza via matchMedia.

- [ ] **Step 1: Escrever o teste que falha** — `packages/ui/src/hooks/use-is-mobile.test.ts`:

```tsx
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "./use-is-mobile";

type Listener = (e: { matches: boolean }) => void;

function mockMatchMedia(initialMatches: boolean) {
  let listener: Listener | null = null;
  const mql = {
    matches: initialMatches,
    media: "",
    addEventListener: (_: string, cb: Listener) => {
      listener = cb;
    },
    removeEventListener: () => {
      listener = null;
    },
  };
  const spy = vi.fn().mockReturnValue(mql);
  vi.stubGlobal("matchMedia", spy);
  return {
    spy,
    setMatches(matches: boolean) {
      mql.matches = matches;
      act(() => listener?.({ matches }));
    },
  };
}

describe("useIsMobile", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna true quando o viewport casa com a media query", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("retorna false em viewport largo e reage a mudança", () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    media.setMatches(true);
    expect(result.current).toBe(true);
  });

  it("usa o breakpoint custom na media query", () => {
    const media = mockMatchMedia(false);
    renderHook(() => useIsMobile(1024));
    expect(media.spy).toHaveBeenCalledWith("(max-width: 1023px)");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @beeads/ui test -- use-is-mobile`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar** — `packages/ui/src/hooks/use-is-mobile.ts`:

```tsx
"use client";

import { useEffect, useState } from "react";

/**
 * true quando o viewport é menor que `breakpoint` (default 768px = mobile).
 * SSR-safe: retorna false no primeiro render e sincroniza no mount via matchMedia.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}
```

E no `packages/ui/src/index.ts`, junto dos exports existentes, adicionar:

```ts
export { useIsMobile } from "./hooks/use-is-mobile";
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @beeads/ui test -- use-is-mobile`
Expected: 3 testes PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/hooks packages/ui/src/index.ts
git commit -m "feat(ui): hook useIsMobile (matchMedia, SSR-safe)"
```

---

### Task 3: Sheet hideClose + Sidebar sticky/mobile off-canvas + SidebarTrigger

**Files:**
- Modify: `packages/ui/src/components/sheet.tsx` (prop `hideClose`)
- Modify: `packages/ui/src/components/sidebar.tsx`
- Modify: `packages/ui/src/index.ts` (export `SidebarTrigger` — verificar como sidebar é exportado hoje; se for `export * from "./components/sidebar"` não precisa mexer)
- Test: `packages/ui/src/components/sidebar.test.tsx` (acrescentar casos)

**Interfaces:**
- Consumes: `useIsMobile` da Task 2; `Sheet`/`SheetContent` de `./sheet`.
- Produces:
  - `SheetContent` ganha `hideClose?: boolean` (default false).
  - `SidebarProvider` ganha prop `mobileBreakpoint?: number` (default 768).
  - Contexto (`useSidebar()`) ganha `isMobile: boolean`, `openMobile: boolean`, `setOpenMobile: (v: boolean) => void`. No mobile, `collapsed` do contexto é sempre `false`.
  - `SidebarLabels` ganha `openMenu: string` (default `"abrir menu"`) e `mobileMenu: string` (default `"menu de navegação"`).
  - Novo export `SidebarTrigger` (`ComponentProps<"button">`): hamburger que abre o off-canvas no mobile e colapsa/expande no desktop.
  - Sidebar desktop: classes ganham `sticky top-0 h-svh` (padrão 4 — fixa no scroll).

- [ ] **Step 1: `hideClose` no SheetContent** — em `sheet.tsx`:

```tsx
interface SheetContentProps
  extends ComponentProps<typeof BaseDialog.Popup>,
    VariantProps<typeof sheetVariants> {
  /** Omite o botão X (ex.: off-canvas com header próprio). Fechar continua via backdrop/Esc. */
  hideClose?: boolean;
}

export function SheetContent({ side, className, children, hideClose, ...props }: SheetContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <BaseDialog.Popup
        data-slot="sheet-content"
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {!hideClose && (
          <BaseDialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">fechar</span>
          </BaseDialog.Close>
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
```

- [ ] **Step 2: Testes novos no `sidebar.test.tsx`** (adicionar ao arquivo existente, adaptando ao estilo/helpers que já existem lá — ler o arquivo antes). Casos:

```tsx
// mock de matchMedia igual ao de use-is-mobile.test.ts (extrair helper local no teste)

it("desktop: sidebar é sticky e ocupa a viewport", () => {
  mockMatchMedia(false);
  render(
    <SidebarProvider>
      <Sidebar>conteúdo</Sidebar>
    </SidebarProvider>,
  );
  const aside = document.querySelector('[data-slot="sidebar"]');
  expect(aside?.className).toContain("sticky");
  expect(aside?.className).toContain("h-svh");
});

it("mobile: SidebarTrigger abre o off-canvas e nav item fecha", async () => {
  mockMatchMedia(true);
  const user = userEvent.setup();
  render(
    <SidebarProvider>
      <SidebarTrigger />
      <Sidebar>
        <SidebarBody>
          <SidebarNavItem label="tarefas" />
        </SidebarBody>
      </Sidebar>
    </SidebarProvider>,
  );
  // fechado: conteúdo do sheet não está no DOM
  expect(screen.queryByText("tarefas")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "abrir menu" }));
  expect(screen.getByText("tarefas")).toBeInTheDocument();
  await user.click(screen.getByText("tarefas"));
  expect(screen.queryByText("tarefas")).not.toBeInTheDocument();
});
```

Run: `pnpm --filter @beeads/ui test -- sidebar`
Expected: novos casos FAIL (SidebarTrigger não existe; sem sticky).

- [ ] **Step 3: Implementar no `sidebar.tsx`**:

3a. Imports novos no topo:

```tsx
import { LogOut, PanelLeft, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { useIsMobile } from "../hooks/use-is-mobile";
import { Sheet, SheetContent } from "./sheet";
```

3b. Labels (substituir bloco existente):

```tsx
export interface SidebarLabels {
  collapse: string;
  expand: string;
  settings: string;
  logout: string;
  editProfile: string;
  openMenu: string;
  mobileMenu: string;
}

const DEFAULT_LABELS: SidebarLabels = {
  collapse: "recolher menu",
  expand: "expandir menu",
  settings: "configurações",
  logout: "sair",
  editProfile: "editar perfil",
  openMenu: "abrir menu",
  mobileMenu: "menu de navegação",
};
```

3c. Contexto (substituir type + acrescentar estado no provider):

```tsx
type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  labels: SidebarLabels;
  collapsible: boolean;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (value: boolean) => void;
};
```

No `SidebarProviderProps` acrescentar:

```tsx
  /** Breakpoint (px) abaixo do qual a sidebar vira off-canvas (default 768). */
  mobileBreakpoint?: number;
```

No corpo do `SidebarProvider` (com `mobileBreakpoint = 768` na desestruturação):

```tsx
  const isMobile = useIsMobile(mobileBreakpoint);
  const [openMobile, setOpenMobile] = useState(false);
```

E o `value` vira (collapsed forçado a false no mobile — o off-canvas é sempre expandido):

```tsx
  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed: isMobile ? false : collapsed,
      toggle,
      setCollapsed,
      labels,
      collapsible,
      isMobile,
      openMobile,
      setOpenMobile,
    }),
    [collapsed, toggle, setCollapsed, labels, collapsible, isMobile, openMobile],
  );
```

3d. `Sidebar` (substituir componente inteiro):

```tsx
export function Sidebar({ className, children, ...props }: ComponentProps<"aside">) {
  const { collapsed, isMobile, openMobile, setOpenMobile, labels } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          hideClose
          aria-label={labels.mobileMenu}
          className="w-72 max-w-[85vw] border-r-0 bg-sidebar p-0 text-sidebar-foreground"
        >
          <aside
            data-slot="sidebar"
            data-state="expanded"
            data-mobile="true"
            className={cn("flex h-full w-full flex-col", className)}
            {...props}
          >
            {children}
          </aside>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      className={cn(
        // sticky: barra fixa enquanto a página rola (padrão de plataforma)
        "sticky top-0 h-svh flex flex-col shrink-0 bg-sidebar text-sidebar-foreground shadow-xl",
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

3e. `SidebarTrigger` (novo, depois de `Sidebar`):

```tsx
/** Botão hamburger pro topbar do app: abre o off-canvas no mobile, colapsa/expande no desktop. */
export function SidebarTrigger({ className, ...props }: ComponentProps<"button">) {
  const { isMobile, openMobile, setOpenMobile, toggle, collapsed, collapsible, labels } =
    useSidebar();
  if (!isMobile && !collapsible) return null;
  const label = isMobile ? labels.openMenu : collapsed ? labels.expand : labels.collapse;
  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      title={label}
      aria-label={label}
      onClick={() => (isMobile ? setOpenMobile(!openMobile) : toggle())}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-fg/70 transition-colors hover:bg-muted hover:text-fg",
        focusRing,
        className,
      )}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
    </button>
  );
}
```

3f. `SidebarHeader`: esconder o toggle de colapso no mobile — trocar `{collapsible && (` por `{collapsible && !isMobile && (` e acrescentar `isMobile` na desestruturação do `useSidebar()`.

3g. `SidebarNavItem`: fechar o off-canvas ao navegar — na desestruturação do `useSidebar()` acrescentar `isMobile, setOpenMobile`; e trocar `onClick,` dentro de `elementProps` por:

```tsx
    onClick: () => {
      if (isMobile) setOpenMobile(false);
      onClick?.();
    },
```

3h. Export: conferir `packages/ui/src/index.ts` — se sidebar é re-exportado com nomes explícitos, acrescentar `SidebarTrigger`.

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm lint && pnpm --filter @beeads/ui typecheck && pnpm --filter @beeads/ui test`
Expected: tudo verde, incluindo os casos novos.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src
git commit -m "feat(ui): sidebar fixa (sticky) + off-canvas mobile com SidebarTrigger; SheetContent hideClose"
```

---

### Task 4: DatePicker dd/MM/yyyy + Dialog/AlertDialog max-h mobile

**Files:**
- Modify: `packages/ui/src/components/date-picker.tsx`
- Modify: `packages/ui/src/components/dialog.tsx`
- Modify: `packages/ui/src/components/alert-dialog.tsx`

**Interfaces:**
- Produces: exibição do valor do DatePicker em `dd/MM/yyyy` (era `PPP` = "8 de julho de 2026"); popups de Dialog/AlertDialog nunca estouram a viewport vertical em telas baixas.

- [ ] **Step 1: Trocar o format do DatePicker** — L43:

```tsx
{value ? format(value, "dd/MM/yyyy") : placeholder}
```

Remover `import { ptBR } from "date-fns/locale";` se ficar sem uso neste arquivo (o Calendar interno tem o próprio locale).

- [ ] **Step 2: max-h nos popups** — em `dialog.tsx` (DialogContent) e `alert-dialog.tsx` (popup equivalente — ler o arquivo, a estrutura espelha o dialog), acrescentar à className base do Popup:

```
max-h-[calc(100dvh-2rem)] overflow-y-auto
```

(no dialog.tsx a linha base vira: `"fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto border border-border bg-card p-6 shadow-lg max-h-[calc(100dvh-2rem)] sm:rounded-lg"`)

- [ ] **Step 3: Verificar**

Run: `pnpm lint && pnpm --filter @beeads/ui typecheck && pnpm --filter @beeads/ui test`
Expected: verde.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/date-picker.tsx packages/ui/src/components/dialog.tsx packages/ui/src/components/alert-dialog.tsx
git commit -m "feat(ui): DatePicker dd/MM/yyyy + Dialog/AlertDialog com max-h de viewport"
```

---

### Task 5: Formatters de data/hora em @beeads/charts

**Files:**
- Modify: `packages/charts/src/lib/chart-theme.ts`
- Test: `packages/charts/src/lib/chart-theme.test.ts` (acrescentar casos)

**Interfaces:**
- Produces: `formatters.date`, `formatters.dateShort`, `formatters.time`, `formatters.timeSeconds`, `formatters.dateTime` — todos `(v: Date | string | number) => string`. Strings ISO date-only ("2026-07-08") são interpretadas como data LOCAL (via `parseISO`), não UTC.

- [ ] **Step 1: Testes que falham** — acrescentar ao `chart-theme.test.ts`:

```ts
describe("formatters de data/hora (padrão dd/MM/yyyy + HH:mm)", () => {
  const d = new Date(2026, 6, 8, 14, 30, 5); // 08/07/2026 14:30:05 local

  it("date → dd/MM/yyyy", () => {
    expect(formatters.date(d)).toBe("08/07/2026");
  });

  it("date aceita string ISO date-only como data local (sem shift de fuso)", () => {
    expect(formatters.date("2026-07-08")).toBe("08/07/2026");
  });

  it("date aceita epoch ms", () => {
    expect(formatters.date(d.getTime())).toBe("08/07/2026");
  });

  it("dateShort → dd/MM", () => {
    expect(formatters.dateShort(d)).toBe("08/07");
  });

  it("time → HH:mm", () => {
    expect(formatters.time(d)).toBe("14:30");
  });

  it("timeSeconds → HH:mm:ss", () => {
    expect(formatters.timeSeconds(d)).toBe("14:30:05");
  });

  it("dateTime → dd/MM/yyyy HH:mm", () => {
    expect(formatters.dateTime(d)).toBe("08/07/2026 14:30");
  });
});
```

Run: `pnpm --filter @beeads/charts test -- chart-theme`
Expected: FAIL (formatters não existem).

- [ ] **Step 2: Implementar** — em `chart-theme.ts`, acrescentar no topo:

```ts
import { format, parseISO } from "date-fns";

export type DateInput = Date | string | number;

/** ISO date-only ("2026-07-08") via parseISO = meia-noite LOCAL (new Date() daria UTC → shift de dia em UTC-3). */
const toDate = (v: DateInput): Date =>
  v instanceof Date ? v : typeof v === "string" ? parseISO(v) : new Date(v);
```

E dentro do objeto `formatters`, após `compactShort`:

```ts
  /** Data padrão da plataforma: 08/07/2026. */
  date: (v: DateInput) => format(toDate(v), "dd/MM/yyyy"),
  /** Data curta pra eixos densos: 08/07 (ano vem do contexto do período). */
  dateShort: (v: DateInput) => format(toDate(v), "dd/MM"),
  /** Hora padrão: 14:30. */
  time: (v: DateInput) => format(toDate(v), "HH:mm"),
  /** Hora com segundos: 14:30:05. */
  timeSeconds: (v: DateInput) => format(toDate(v), "HH:mm:ss"),
  /** Data + hora: 08/07/2026 14:30. */
  dateTime: (v: DateInput) => format(toDate(v), "dd/MM/yyyy HH:mm"),
```

- [ ] **Step 3: Rodar e ver passar**

Run: `pnpm --filter @beeads/charts test -- chart-theme`
Expected: PASS (7 casos novos).

- [ ] **Step 4: Commit**

```bash
git add packages/charts/src/lib
git commit -m "feat(charts): formatters de data/hora dd/MM/yyyy + HH:mm(:ss)"
```

---

### Task 6: xFormatter nos charts cartesianos + label do tooltip

**Files:**
- Modify: `packages/charts/src/lib/tooltip.tsx`
- Modify: `packages/charts/src/components/line-chart.tsx`
- Modify: `packages/charts/src/components/area-chart.tsx`
- Modify: `packages/charts/src/components/bar-chart.tsx`
- Modify: `packages/charts/src/components/multi-line-chart.tsx`
- Test: `packages/charts/src/components/charts.test.tsx` (acrescentar caso)

**Interfaces:**
- Consumes: `formatters.dateShort` etc. da Task 5 (nos exemplos/teste).
- Produces:
  - `export type AxisTickFormatter = (value: string | number) => string;` em `chart-theme.ts` (exportar também no barrel `packages/charts/src/index.ts` junto de `ChartFormatter`).
  - Prop opcional `xFormatter?: AxisTickFormatter` em LineChart/AreaChart/BarChart/MultiLineChart — formata os ticks do eixo X **e** o label do tooltip. Sem a prop, comportamento idêntico ao atual.
  - `tooltipRenderer(formatter?, formatterByKey?, labelFormatter?)` — terceiro parâmetro novo, opcional.

- [ ] **Step 1: Teste que falha** — em `charts.test.tsx`, seguir o padrão dos testes existentes (ler o arquivo antes; há mock de ResizeObserver pro recharts) e acrescentar:

```tsx
it("LineChart aplica xFormatter nos ticks do eixo X", () => {
  const data = [
    { dia: "2026-07-01", valor: 10 },
    { dia: "2026-07-02", valor: 20 },
  ];
  render(
    <div style={{ width: 400, height: 300 }}>
      <LineChart
        data={data}
        xKey="dia"
        series={[{ key: "valor", label: "valor" }]}
        xFormatter={(v) => formatters.dateShort(v)}
      />
    </div>,
  );
  // recharts renderiza ticks como <text>; com xFormatter os labels ISO viram dd/MM
  expect(screen.queryByText("2026-07-01")).not.toBeInTheDocument();
});
```

(Obs.: happy-dom + recharts nem sempre renderiza ticks; se o teste existente de charts for só smoke — render sem crash — seguir o mesmo nível: renderizar com `xFormatter` e assertar que não quebra + que o texto cru não aparece.)

Run: `pnpm --filter @beeads/charts test -- charts`
Expected: FAIL (prop `xFormatter` não existe → erro de tipo em typecheck; em runtime pode passar — o gate real é o typecheck).

- [ ] **Step 2: Implementar**

2a. `chart-theme.ts` — acrescentar:

```ts
export type AxisTickFormatter = (value: string | number) => string;
```

2b. `packages/charts/src/index.ts` — na linha do export de chart-theme:

```ts
export {
  CHART_COLORS,
  chartColor,
  formatters,
  type ChartFormatter,
  type AxisTickFormatter,
  type DateInput,
} from "./lib/chart-theme";
```

2c. `tooltip.tsx` — threading do labelFormatter:

- Em `InjectedFormatters` acrescentar: `__labelFormatter?: (value: string | number) => string;`
- No `ChartTooltip`, trocar a linha do label por:

```tsx
      {label != null && (
        <p className="mb-1 font-medium text-fg">
          {injected.__labelFormatter ? injected.__labelFormatter(label as string | number) : String(label)}
        </p>
      )}
```

- `tooltipRenderer` ganha o terceiro parâmetro e injeta:

```tsx
export function tooltipRenderer(
  formatter?: ChartFormatter,
  formatterByKey?: Record<string, ChartFormatter>,
  labelFormatter?: (value: string | number) => string,
) {
  return (props: TooltipProps<ValueType, NameType>): ReactElement => (
    <ChartTooltip
      {...(props as TooltipProps<ValueType, NameType> & InjectedFormatters)}
      {...({
        __formatter: formatter,
        __formatterByKey: formatterByKey,
        __labelFormatter: labelFormatter,
      } as InjectedFormatters)}
    />
  );
}
```

2d. Nos 4 charts (line, area, bar, multi-line), o mesmo padrão de 3 mudanças — exemplo no line-chart.tsx (replicar equivalente nos outros, respeitando a estrutura de cada um; no multi-line-chart o `tooltipRenderer` já recebe `formatterByKey` como 2º arg — o labelFormatter entra como 3º):

```tsx
import { type AxisTickFormatter, type ChartFormatter, chartColor, formatters } from "../lib/chart-theme";

export interface LineChartProps<T extends Record<string, number | string>> {
  // ...props existentes...
  /** Formata os ticks do eixo X e o label do tooltip (ex.: formatters.dateShort pra séries temporais). */
  xFormatter?: AxisTickFormatter;
}

// na desestruturação: xFormatter,
// no JSX:
<XAxis dataKey={xKey as string} tickFormatter={xFormatter} />
<Tooltip content={tooltipRenderer(tooltipFormatter ?? yFormatter, undefined, xFormatter)} />
```

(Onde o chart atual não passa `formatterByKey`, usar `undefined` como 2º arg, como acima. Conferir o call-site atual de cada chart antes de editar.)

- [ ] **Step 3: Rodar e ver passar**

Run: `pnpm lint && pnpm --filter @beeads/charts typecheck && pnpm --filter @beeads/charts test`
Expected: verde.

- [ ] **Step 4: Commit**

```bash
git add packages/charts/src
git commit -m "feat(charts): xFormatter nos charts cartesianos (eixo X + label do tooltip)"
```

---

### Task 7: PeriodPicker responsivo + dd/MM/yyyy + presets lowercase; FilterBar; KpiGrid 3xl

**Files:**
- Modify: `packages/charts/src/components/period-picker.tsx`
- Modify: `packages/charts/src/components/filter-bar.tsx`
- Modify: `packages/charts/src/components/kpi-grid.tsx`

**Interfaces:**
- Consumes: `useIsMobile` de `@beeads/ui` (Task 2). Import: `import { ..., useIsMobile } from "@beeads/ui";`
- Produces: sem mudança de API pública (comportamento responsivo interno + strings + classes).

- [ ] **Step 1: period-picker.tsx** — mudanças:

1a. Presets lowercase (L22-27): `"últimos 7 dias"`, `"últimos 30 dias"`, `"últimos 90 dias"`, `"este mês"`, `"mês passado"`.

1b. Trigger dd/MM/yyyy (L44-45) — vira:

```tsx
            {format(value.from, "dd/MM/yyyy")} – {format(value.to, "dd/MM/yyyy")}
```

Remover `import { ptBR } from "date-fns/locale";` (fica sem uso — o Calendar tem locale próprio).

1c. Responsivo — no componente:

```tsx
import { Button, Calendar, Popover, PopoverContent, PopoverTrigger, cn, useIsMobile } from "@beeads/ui";

export function PeriodPicker({ value, onChange }: PeriodPickerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* trigger inalterado além do format */}
      <PopoverContent className="w-auto max-w-[calc(100vw-1rem)] p-0" align="end">
        <div className={cn("flex", isMobile && "flex-col")}>
          <div
            className={cn(
              "flex gap-1 p-2",
              isMobile ? "flex-row flex-wrap border-b border-border" : "flex-col border-r border-border",
            )}
          >
            {/* presets inalterados */}
          </div>
          <Calendar
            mode="range"
            defaultMonth={value.from}
            selected={{ from: value.from, to: value.to }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onChange({ from: range.from, to: range.to });
              }
            }}
            numberOfMonths={isMobile ? 1 : 2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: filter-bar.tsx** — placeholder default: `searchPlaceholder = "buscar…"`.

- [ ] **Step 3: kpi-grid.tsx** — classes viram:

```tsx
"grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-6"
```

- [ ] **Step 4: Verificar**

Run: `pnpm lint && pnpm --filter @beeads/charts typecheck && pnpm --filter @beeads/charts test`
Expected: verde.

- [ ] **Step 5: Commit**

```bash
git add packages/charts/src/components
git commit -m "feat(charts): PeriodPicker responsivo + dd/MM/yyyy; presets/placeholder lowercase; KpiGrid escala em 3xl"
```

---

### Task 8: Stories — copy lowercase, Sidebar mobile/sticky, xFormatter demo

**Files:**
- Modify: `apps/storybook/stories/*.stories.tsx` (todas as 14)
- Modify (principal): `apps/storybook/stories/Sidebar.stories.tsx`, `apps/storybook/stories/Charts.stories.tsx`

**Interfaces:**
- Consumes: `SidebarTrigger` (Task 3), `formatters.dateShort` + `xFormatter` (Tasks 5-6), `PeriodPicker` (Task 7).

- [ ] **Step 1: Copy lowercase em todas as stories** — todo texto de demonstração VISÍVEL vira caixa baixa ("Salvar"→"salvar", "Cancelar"→"cancelar", "Workspace nova"→"workspace nova", "Heads up!"→"atenção", "Tarefas"→"tarefas", "Conta"→"conta", "Senha"→"senha", labels de KPI "Revenue"→"receita", "Conversions"→"conversões", etc.). Manter: siglas (CPA, ROAS, CTR), nomes próprios, `title` de meta do Storybook (taxonomia de navegação, ex. `"Forms/Button"` fica como está). Textos EN de demonstração viram pt-BR lowercase.

- [ ] **Step 2: Sidebar.stories.tsx** — acrescentar 2 stories:

```tsx
export const PaginaComScroll: Story = {
  render: () => (
    <SidebarProvider>
      <div className="flex min-h-svh">
        <Sidebar>{/* header/body/footer como na story Default */}</Sidebar>
        <main className="flex-1 p-6">
          <h1 className="font-display text-xl">conteúdo longo — a barra fica fixa</h1>
          {Array.from({ length: 60 }, (_, i) => (
            <p key={i} className="py-2 text-sm text-muted-fg">
              linha {i + 1}
            </p>
          ))}
        </main>
      </div>
    </SidebarProvider>
  ),
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1" } }, // se o storybook não tiver viewports configurados, documentar no JSDoc da story que é pra testar com devtools mobile
  render: () => (
    <SidebarProvider>
      <div className="flex min-h-svh flex-col">
        <header className="flex items-center gap-2 border-b border-border p-2">
          <SidebarTrigger />
          <span className="font-display">app</span>
        </header>
        <Sidebar>{/* mesmo conteúdo da Default */}</Sidebar>
        <main className="flex-1 p-4">conteúdo</main>
      </div>
    </SidebarProvider>
  ),
};
```

(Adaptar ao formato real do arquivo — ler antes. Se `globals.viewport` não for suportado na versão do Storybook instalada, omitir e deixar comentário.)

- [ ] **Step 3: Charts.stories.tsx** — na story de LineChart (ou nova story `SerieTemporal`), usar dados com datas ISO + `xFormatter`:

```tsx
const serieTemporal = [
  { dia: "2026-07-01", sessoes: 320 },
  { dia: "2026-07-02", sessoes: 410 },
  { dia: "2026-07-03", sessoes: 380 },
];
// ...
<LineChart
  data={serieTemporal}
  xKey="dia"
  series={[{ key: "sessoes", label: "sessões" }]}
  xFormatter={formatters.dateShort}
/>
```

- [ ] **Step 4: Verificar que o storybook builda**

Run: `pnpm --filter @beeads-internal/storybook build` (se o script `build` existir no app; senão `pnpm typecheck` da raiz cobre os tipos das stories)
Expected: verde.

- [ ] **Step 5: Commit**

```bash
git add apps/storybook
git commit -m "docs(storybook): copy lowercase + stories de sidebar fixa/mobile e série temporal com xFormatter"
```

---

### Task 9: PRINCIPLES.md + changesets

**Files:**
- Modify: `docs/PRINCIPLES.md`
- Create: `.changeset/novos-padroes-ui.md`
- Create: `.changeset/novos-padroes-charts.md`

- [ ] **Step 1: PRINCIPLES.md** — três mudanças:

1a. Na seção **Voice & Tone (microcopy)**, acrescentar como PRIMEIRO bullet:

```markdown
- **Caixa baixa por padrão.** Todo texto de sistema usa caixa baixa: "visão geral", não "Visão geral"; "salvar", não "Salvar". Exceções: nomes próprios (WhatsApp, Google Ads), siglas (CPA, ROAS, CTR), conteúdo digitado pelo usuário e código. Não use `text-transform` pra forçar — escreva em caixa baixa na fonte.
```

1b. Nova seção **## Responsividade** (depois de "Componentes"):

```markdown
## Responsividade

Toda tela dos apps beeads atende **3 alvos**: mobile (<768px), notebook (1024–1536px) e monitor ultrawide (≥1700px = breakpoint `3xl` dos tokens).

- **Mobile-first.** Layout base é o de tela estreita; `sm:`/`lg:`/`3xl:` expandem.
- **Sidebar:** use o Sidebar do DS — no desktop é fixa (sticky, não acompanha o scroll); abaixo de 768px vira off-canvas automaticamente; coloque `<SidebarTrigger />` no topbar do app.
- **Tabelas largas:** sempre dentro de `overflow-x-auto` (nunca estourar a página no eixo X).
- **Ultrawide:** conteúdo de leitura/formulários usa `max-w-*` centrado (`mx-auto max-w-screen-xl`); dashboards podem fluir full-width com grids que escalam colunas em `3xl:` (KpiGrid do DS já escala pra 6).
- **Charts:** altura fixa via prop `height`, largura sempre fluida (100% do container).
```

1c. Na seção **Charts & dataviz (princípios)**, acrescentar ao bullet "Formate números pro contexto":

```markdown
- **Datas sempre `dd/mm/aaaa`; horas sempre `hh:mm` ou `hh:mm:ss`** (`formatters.date`, `.time`, `.timeSeconds`, `.dateTime`). Em eixos densos, `dd/mm` (`formatters.dateShort` + `xFormatter`). Nunca "8 de jul." nem formatos EN.
```

1d. Nova subseção em **Componentes** (após "Dark mode é first-class"):

```markdown
### Sidebar é o chassi dos apps
- **Fixa:** a barra lateral não acompanha o scroll da página (sticky por default no DS).
- **Rodapé obrigatório:** todo app renderiza `SidebarFooter` com `user={{ name, email }}`, `settingsItems` (botão de configurações) e `onLogout` (botão de sair) — o padrão do Bloquim é a referência.
```

- [ ] **Step 2: Changesets** — criar os 2 arquivos:

`.changeset/novos-padroes-ui.md`:

```markdown
---
"@beeads/ui": minor
---

Novos padrões de plataforma no DS:

- **Sidebar fixa:** `sticky top-0 h-svh` por default no desktop — a barra não acompanha mais o scroll da página.
- **Sidebar mobile:** abaixo de 768px (configurável via `mobileBreakpoint`) vira off-canvas (Sheet); novo export `SidebarTrigger` (hamburger pro topbar); nav item fecha o menu ao navegar; labels novos `openMenu`/`mobileMenu`.
- Novo hook `useIsMobile(breakpoint = 768)`.
- `SheetContent` ganha `hideClose`.
- **Caixa baixa:** strings default agora em lowercase ("anterior", "próxima", "escolher data", "carregando", …); sr-only "Close"/"More" viram "fechar"/"mais"; `SidebarSectionLabel` troca `uppercase` por `lowercase`.
- **DatePicker** exibe `dd/MM/yyyy` (era "8 de julho de 2026").
```

`.changeset/novos-padroes-charts.md`:

```markdown
---
"@beeads/charts": minor
---

Novos padrões de plataforma no DS:

- **Formatters de data/hora:** `formatters.date` (dd/MM/yyyy), `.dateShort` (dd/MM), `.time` (HH:mm), `.timeSeconds` (HH:mm:ss), `.dateTime` — aceitam `Date | string ISO | epoch`.
- **`xFormatter`** opcional em LineChart/AreaChart/BarChart/MultiLineChart: formata ticks do eixo X e o label do tooltip.
- **PeriodPicker:** trigger em `dd/MM/yyyy`; responsivo (1 mês + presets empilhados no mobile); presets em caixa baixa.
- **FilterBar:** placeholder "buscar…".
- **KpiGrid:** escala pra 6 colunas em `3xl:` (ultrawide).
```

- [ ] **Step 3: Commit**

```bash
git add docs/PRINCIPLES.md .changeset
git commit -m "docs: normatiza os 5 padrões de plataforma em PRINCIPLES + changesets minor de ui/charts"
```

---

### Task 10: Verificação final integrada

- [ ] **Step 1: Suite completa na raiz**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
Expected: tudo verde (4 pacotes + storybook typecheck).

- [ ] **Step 2: Conferir diff completo**

Run: `git log --oneline main..HEAD` e `git diff main --stat`
Expected: ~9 commits, mudanças só em `packages/ui`, `packages/charts`, `apps/storybook`, `docs/`, `.changeset/`.

- [ ] **Step 3: Corrigir qualquer vermelho e commitar fixes**
