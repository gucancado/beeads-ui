# @beeads/* Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um design system reutilizável publicado em npm público como `@beeads/tokens`, `@beeads/fonts`, `@beeads/ui`, `@beeads/charts` — extraído da identidade visual do app `agentes-beeads` (honey/ink/paper, Fraunces+Geist Mono) — para uso em todos os apps do ecossistema beeads. Targets confirmados: **agentes-beeads** (Next.js 16, Tailwind v4, @base-ui), **beeads-bloquim** (React 18 + Vite, Tailwind v4, Radix UI, 50+ primitivos), **beeads-central-de-dados** (Next.js 15, Tailwind v3, charts heavy: area/multi-line/funnel/heatmap/KPIs).

**Architecture:** Monorepo pnpm + Turborepo com 4 pacotes versionados independentemente via Changesets. Tokens em CSS vars puros (compatíveis com Tailwind v3 via preset + Tailwind v4 via `@theme`). Componentes UI são primitivos sobre `@base-ui/react` (headless moderno, sucessor do Radix) — bloquim migra progressivamente (não big bang). Charts em pacote separado (`@beeads/charts`) para isolar peso do recharts. Tudo buildado com tsup (dual ESM/CJS), documentado em Storybook. Apps consomem via `pnpm add @beeads/ui @beeads/charts` e importam tokens via CSS.

**Tech Stack:** pnpm workspaces, Turborepo, TypeScript (strict), Tailwind CSS v4, `@base-ui/react`, class-variance-authority, clsx, tailwind-merge, next-themes, lucide-react, sonner (toasts), Vitest + @testing-library/react, Storybook 8 (Vite), tsup, Biome (lint+format), Changesets (versioning+publish), GitHub Actions (CI+release).

---

## Skills aplicadas durante execução

Skills (do superpowers e externas) que **devem ser invocadas** em momentos específicos do plano:

| Skill | Quando |
|---|---|
| `typeui-fundamentals` | Já instalado no início. Consultar `accessibility.md` ao implementar qualquer componente interativo (Button, Dialog, etc.). `ui-principles.md` ao decidir hierarquia/spacing em primitivos visuais (Card, Alert). |
| `frontend-design` | Antes de Fase 5 (Button — template canônico). Garante quality bar visual antes de virar referência pros outros componentes. |
| `superpowers:test-driven-development` | Tasks 4.2 (cn) e 5.1 (Button) — TDD red→green→commit explícito. |
| `superpowers:verification-before-completion` | Antes de cada commit `feat(...)` — rodar `pnpm typecheck && pnpm test && pnpm build` e confirmar verde antes de `git commit`. |
| `superpowers:requesting-code-review` | Final das Fases 5, 8, 10, 13 — checkpoints maiores. |
| `run` | Validação visual da Fase 9 (Storybook) e Fase 13 (agentes-beeads migrado). |
| `code-review:code-review` | Pré-publish da Fase 10 (versão 0.1.0 no npm). |

**Pull de referências de estética do typeui** (Fase 11, antes de escrever PRINCIPLES.md):

```bash
npx typeui.sh pull mono --format design       # vibe monospace forte
npx typeui.sh pull editorial --format design  # Fraunces dá ar editorial
npx typeui.sh pull claude --format design     # ver como Anthropic estruturou a deles
npx typeui.sh pull minimal --format design    # densidade compacta
```

Esses arquivos viram **input pra inspiração**, não são copiados literalmente — informam tom/estrutura do nosso `docs/PRINCIPLES.md`.

---

## Tabela de fases

| Fase | Entrega | Pacotes afetados |
|---|---|---|
| 1 | Bootstrap monorepo (pnpm + Turborepo + Biome + TS configs) | repo todo |
| 2 | `@beeads/tokens` — CSS vars + `@theme` (v4) + preset (v3) + paleta categórica de charts | tokens |
| 3 | `@beeads/fonts` — Fraunces + Geist Mono | fonts |
| 4 | `@beeads/ui` — base (cn, ThemeProvider, styles.css) | ui |
| 5 | `@beeads/ui` — Button (template canônico de primitivo) | ui |
| 6 | `@beeads/ui` — forms (Input, Textarea, Label, Checkbox, Switch, RadioGroup, Select, **Field**, **Slider**) | ui |
| 7 | `@beeads/ui` — overlays (Dialog, Sheet, **Drawer**, Popover, Tooltip, DropdownMenu, AlertDialog, **Command**) | ui |
| 8 | `@beeads/ui` — layout/feedback (Card, Separator, Tabs, Accordion, Badge, Skeleton, Alert, Toaster, **Avatar**, **Breadcrumb**, **Pagination**, **Collapsible**, **ScrollArea**, **Spinner**, **Empty**, **Progress**) | ui |
| 9 | `@beeads/ui` — Calendar + DatePicker (componente composto) | ui |
| 10 | **`@beeads/charts`** — pacote novo: ChartFrame, LineChart, AreaChart, BarChart, MultiLineChart (dual-axis), DonutChart, FunnelChart, HeatmapTable, KpiCard, KpiGrid, PeriodPicker, FilterBar | charts |
| 11 | Storybook + stories de todos os ~35 componentes ui + ~12 charts | docs |
| 12 | CI + publish inicial no npm (`@beeads/*@0.1.0`) | infra |
| 13 | Documentation (PRINCIPLES.md, CONTRIBUTING.md, READMEs por pacote, **migration-guide.md** Radix→base-ui) | docs |
| 14 | CLAUDE.md global + repo (orienta Claude a usar `@beeads/*` em todos os projetos) | meta |
| 15 | Validação 1: migrar `agentes-beeads` para consumir `@beeads/ui` + `@beeads/charts` | agentes-beeads |
| 16 | Validação 2: bloquim adota `@beeads/tokens` + `@beeads/fonts` + Toaster/Button novos (migração progressiva — **não substitui os 50 primitivos Radix locais**, só adota onde for natural) | bloquim |
| 17 | Validação 3: central-de-dados migra Tailwind v3 + adota DS completo + `@beeads/charts` (substitui DailyChart, ComparisonChart, FunnelChart, KpiCard locais — identidade unificada com honey accent) | central-de-dados |

---

## File Structure

Estrutura final do repo `c:/Users/gusta/Projetos/beeads-ui/`:

```
beeads-ui/
├── .changeset/                    # Changesets — release notes em progresso
│   └── config.json
├── .github/workflows/
│   ├── ci.yml                     # lint + typecheck + test em PRs
│   └── release.yml                # publish via Changesets em merge pra main
├── apps/
│   └── storybook/                 # Storybook 8 (Vite) — docs viva
│       ├── .storybook/
│       │   ├── main.ts
│       │   └── preview.ts
│       ├── package.json
│       └── stories/               # 1 .stories.tsx por componente
├── packages/
│   ├── tokens/                    # @beeads/tokens
│   │   ├── src/
│   │   │   ├── theme.css          # CSS vars no :root + @theme block (Tailwind v4)
│   │   │   ├── preset.cjs         # Tailwind v3 preset — extend lendo CSS vars
│   │   │   └── index.ts           # re-export tipado de tokens p/ JS
│   │   ├── package.json
│   │   └── tsup.config.ts
│   ├── fonts/                     # @beeads/fonts
│   │   ├── src/
│   │   │   └── index.ts           # exports next/font (fraunces, geistMono)
│   │   ├── package.json
│   │   └── tsup.config.ts
│   ├── ui/                        # @beeads/ui (~35 primitivos)
│   │   ├── src/
│   │   │   ├── components/        # 1 arquivo por primitivo
│   │   │   ├── lib/utils.ts       # cn()
│   │   │   ├── providers/theme-provider.tsx
│   │   │   ├── styles.css         # @import tokens/theme.css + base styles
│   │   │   └── index.ts           # barrel
│   │   ├── package.json
│   │   └── tsup.config.ts
│   └── charts/                    # @beeads/charts — visualização de dados
│       ├── src/
│       │   ├── components/
│       │   │   ├── chart-frame.tsx       # Card + header (título+filtros) + footer (legenda)
│       │   │   ├── line-chart.tsx
│       │   │   ├── area-chart.tsx
│       │   │   ├── bar-chart.tsx
│       │   │   ├── multi-line-chart.tsx  # multi-entity, dual-axis, dash patterns
│       │   │   ├── donut-chart.tsx
│       │   │   ├── funnel-chart.tsx      # 4-stage com drop %
│       │   │   ├── heatmap-table.tsx     # matriz categórica colorida
│       │   │   ├── kpi-card.tsx          # label + value + hint + delta (inverseDelta p/ custos)
│       │   │   ├── kpi-grid.tsx
│       │   │   ├── period-picker.tsx     # presets + custom range
│       │   │   └── filter-bar.tsx
│       │   ├── lib/
│       │   │   ├── chart-theme.ts        # cores categóricas, formatos, defaults
│       │   │   └── tooltip.tsx           # tooltip custom compartilhado
│       │   ├── styles.css                # ajustes leves para recharts
│       │   └── index.ts                  # barrel
│       ├── package.json
│       └── tsup.config.ts
├── docs/
│   ├── PRINCIPLES.md              # princípios de design + voice/tone
│   ├── CONTRIBUTING.md            # como adicionar componente novo
│   └── superpowers/plans/         # este plano vive aqui
├── CLAUDE.md                      # instruções pra Claude editar o DS
├── README.md                      # overview público
├── package.json                   # root: workspaces, scripts turbo
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json             # config TS compartilhado
├── biome.json                     # lint+format
└── .gitignore
```

**Responsabilidades por arquivo:**
- `packages/tokens/src/theme.css` — única fonte de verdade dos valores visuais (cores, radius, breakpoints, fontes)
- `packages/ui/src/components/*.tsx` — primitivos React; cada arquivo um componente, referenciam só tokens (zero hardcode)
- `packages/ui/src/index.ts` — barrel file controlando o que é público
- `apps/storybook` — visualização e documentação viva; **não** entra no publish
- `.changeset/` — workflow de versionamento: cada PR adiciona um changeset descrevendo a mudança; CI gera bump+publish

---

## Decisões locked-in (pra evitar bikeshedding)

- **Versionamento:** Changesets. Cada PR adiciona um `.changeset/*.md` descrevendo se é `patch` / `minor` / `major` e em quais pacotes.
- **Build:** tsup com `format: ["esm", "cjs"]`, `dts: true`. Saída em `dist/`.
- **TypeScript:** `strict: true`, `moduleResolution: "bundler"`, target ES2022.
- **Testes:** Vitest + @testing-library/react. Tests rodam em jsdom/happy-dom. Não fazemos snapshot testing de DOM (frágil) — testamos comportamento (props, eventos, acessibilidade).
- **Stories** são parte do contrato visual e ficam em `apps/storybook/stories/`, não nos pacotes (não publicam).
- **Lint/format:** Biome (substitui ESLint+Prettier — single tool, mais rápido).
- **Dark mode:** classe `.dark` no `<html>`. Tokens semânticos (`--color-bg`, `--color-fg`, `--color-muted`, `--color-border`, `--color-card`) trocam de valor via `:where(.dark)`. Componentes referenciam só semânticos.
- **Headless lib:** `@base-ui/react` (future-proof, sucessor moderno do Radix). bloquim migra progressivamente — primitivos Radix locais continuam funcionando até substituídos organicamente.
- **Tailwind dual-mode:** suporta v3 e v4. v4 consome `@beeads/tokens/theme.css` direto (com `@theme`). v3 usa `@beeads/tokens/preset.cjs` em `tailwind.config.js`. CSS vars são a fonte única de verdade.
- **Charts:** isolados em `@beeads/charts` (recharts não vira peer dep do `@beeads/ui`). Quem precisa instala separado.
- **Identidade visual:** **uma só** — honey accent + Fraunces display + Geist Mono body. central-de-dados (atualmente pink #ff6b9d) migra pra honey. Tokens semânticos viabilizam dark mode coeso em todos os apps.
- **Paleta categórica de charts:** 5 cores fixas via tokens (`--color-chart-1` … `--color-chart-5`), evolução do `ENTITY_COLORS` do central-de-dados.
- **Não publicar `apps/storybook`** — `private: true` no package.json.

---

# Fase 1 — Bootstrap monorepo

**Objetivo:** repo inicializado, pnpm workspaces funcionando, Turborepo orquestrando builds, Biome configurado, TypeScript base setado.

### Task 1.1: Inicializar git e estrutura base

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/.gitignore`
- Create: `c:/Users/gusta/Projetos/beeads-ui/package.json`
- Create: `c:/Users/gusta/Projetos/beeads-ui/pnpm-workspace.yaml`
- Create: `c:/Users/gusta/Projetos/beeads-ui/README.md`

- [ ] **Step 1: Inicializar git**

Run:
```bash
cd "c:/Users/gusta/Projetos/beeads-ui" ; git init -b main
```
Expected: `Initialized empty Git repository in .../beeads-ui/.git/`

- [ ] **Step 2: Criar `.gitignore`**

```
node_modules/
dist/
.turbo/
storybook-static/
*.log
.env
.env.local
.DS_Store
.vscode/
.idea/
coverage/
```

- [ ] **Step 3: Criar `pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 4: Criar `package.json` root**

```json
{
  "name": "beeads-ui",
  "version": "0.0.0",
  "private": true,
  "description": "Design system @beeads/* — tokens, fonts, ui primitives",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "biome check .",
    "format": "biome format --write .",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "storybook": "pnpm --filter @beeads-internal/storybook dev",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build --filter=./packages/* && changeset publish"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@changesets/cli": "^2.27.10",
    "turbo": "^2.3.3",
    "typescript": "^5.7.2"
  },
  "packageManager": "pnpm@10.0.0",
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 5: Criar `README.md`**

```markdown
# beeads-ui

Design system do ecossistema beeads. Publica `@beeads/tokens`, `@beeads/fonts`, `@beeads/ui` em npm público.

Identidade: **honey** (#FFAE00), **ink** (#0a0a0a), **paper** (#fafaf7). Tipografia: **Fraunces** (display) + **Geist Mono** (corpo).

## Uso em apps

```bash
pnpm add @beeads/tokens @beeads/fonts @beeads/ui
```

Ver `docs/PRINCIPLES.md` para princípios de design.

## Desenvolvimento

```bash
pnpm install
pnpm storybook  # docs viva em http://localhost:6006
pnpm build
pnpm test
```
```

- [ ] **Step 6: Commit**

```bash
cd "c:/Users/gusta/Projetos/beeads-ui" ; git add . ; git commit -m "chore: initial monorepo scaffold"
```

### Task 1.2: TypeScript base config

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/tsconfig.base.json`

- [ ] **Step 1: Criar `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tsconfig.base.json ; git commit -m "chore: typescript base config"
```

### Task 1.3: Turborepo config

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/turbo.json`

- [ ] **Step 1: Criar `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add turbo.json ; git commit -m "chore: turborepo config"
```

### Task 1.4: Biome lint+format

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/biome.json`

- [ ] **Step 1: Criar `biome.json`**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "files": {
    "ignore": ["dist/**", "storybook-static/**", "node_modules/**", ".turbo/**"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "a11y": { "noSvgWithoutTitle": "off" }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add biome.json ; git commit -m "chore: biome config"
```

### Task 1.5: Changesets

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/.changeset/config.json`
- Create: `c:/Users/gusta/Projetos/beeads-ui/.changeset/README.md`

- [ ] **Step 1: Criar `.changeset/config.json`**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@beeads-internal/storybook"]
}
```

- [ ] **Step 2: Criar `.changeset/README.md`**

```markdown
# Changesets

Cada PR que muda um pacote `@beeads/*` deve adicionar um changeset:

```bash
pnpm changeset
```

Selecione os pacotes afetados, escolha bump type (patch/minor/major), escreva descrição. Commite o `.md` gerado junto com o PR.

CI roda `changeset version` em merge pra `main`, gerando PR de release. Quando esse PR é merged, CI publica no npm.
```

- [ ] **Step 3: Instalar dependências dev**

Run:
```bash
cd "c:/Users/gusta/Projetos/beeads-ui" ; pnpm install
```
Expected: lockfile criado, sem erros.

- [ ] **Step 4: Verificar Biome roda**

Run: `pnpm lint`
Expected: passa sem erros (nada pra checar ainda).

- [ ] **Step 5: Commit**

```bash
git add . ; git commit -m "chore: changesets config + initial pnpm install"
```

---

# Fase 2 — `@beeads/tokens`

**Objetivo:** pacote `@beeads/tokens` publicável com `theme.css` (Tailwind v4 `@theme`) cobrindo cores beeads, radius, breakpoints, semânticos light/dark.

### Task 2.1: Scaffold do pacote

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/tokens/package.json`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/tokens/tsconfig.json`

- [ ] **Step 1: Criar `packages/tokens/package.json`**

```json
{
  "name": "@beeads/tokens",
  "version": "0.0.0",
  "description": "Design tokens (CSS @theme) do design system beeads",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/gucancado/beeads-ui",
    "directory": "packages/tokens"
  },
  "publishConfig": {
    "access": "public"
  },
  "files": ["dist"],
  "exports": {
    ".": "./dist/index.js",
    "./theme.css": "./dist/theme.css",
    "./dark.css": "./dist/dark.css"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup && cp src/theme.css dist/theme.css && cp src/dark.css dist/dark.css",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "tsup": "^8.3.5",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 2: Criar `packages/tokens/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

### Task 2.2: Definir tokens light em `theme.css`

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/tokens/src/theme.css`

- [ ] **Step 1: Criar `theme.css`** com tokens beeads + semânticos light + paleta categórica de charts

```css
/* @beeads/tokens — CSS vars no :root + @theme inline (Tailwind v4) */
@import "tailwindcss";

:root {
  /* Brand — beeads */
  --color-honey: oklch(0.78 0.16 75);          /* #FFAE00 */
  --color-honey-soft: oklch(0.93 0.08 85);     /* #FFE7A8 */
  --color-honey-deep: oklch(0.56 0.13 65);     /* #B97A00 */
  --color-ink: oklch(0.16 0 0);                /* #0a0a0a */
  --color-paper: oklch(0.98 0.003 95);         /* #fafaf7 */
  --color-paper-2: oklch(0.96 0.005 95);       /* #f4f4f0 */

  /* Semantic */
  --color-ok: oklch(0.5 0.13 145);             /* #1f7a3a verde */
  --color-warn: oklch(0.56 0.13 65);           /* #b97a00 ambar */
  --color-err: oklch(0.52 0.18 25);            /* #c43838 vermelho */
  --color-info: oklch(0.58 0.13 240);          /* azul info */

  /* Surface (light defaults — overridden em .dark) */
  --color-bg: var(--color-paper);
  --color-fg: var(--color-ink);
  --color-card: oklch(1 0 0);
  --color-card-fg: var(--color-ink);
  --color-muted: var(--color-paper-2);
  --color-muted-fg: oklch(0.45 0 0);
  --color-border: oklch(0.89 0 0);
  --color-input: var(--color-border);
  --color-ring: var(--color-honey);
  --color-accent: var(--color-honey);
  --color-accent-fg: var(--color-ink);
  --color-primary: var(--color-ink);
  --color-primary-fg: var(--color-paper);
  --color-secondary: var(--color-paper-2);
  --color-secondary-fg: var(--color-ink);
  --color-destructive: var(--color-err);
  --color-destructive-fg: oklch(1 0 0);

  /* Paleta categórica para charts (5 cores fixas — substitui ENTITY_COLORS de central-de-dados) */
  --color-chart-1: var(--color-honey);          /* honey/laranja — primário */
  --color-chart-2: oklch(0.58 0.13 240);        /* azul */
  --color-chart-3: oklch(0.62 0.18 145);        /* verde */
  --color-chart-4: oklch(0.55 0.20 350);        /* magenta */
  --color-chart-5: oklch(0.55 0.18 290);        /* roxo */

  /* Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.25rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius: var(--radius-md);

  /* Fonts (vars setadas em runtime pelo @beeads/fonts) */
  --font-display: var(--font-fraunces), Georgia, serif;
  --font-sans: ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;

  /* Breakpoints custom */
  --breakpoint-3xl: 1700px;
}

/* Dark mode — apenas tokens semânticos mudam, brand fica igual */
.dark {
  --color-bg: oklch(0.18 0 0);
  --color-fg: oklch(0.96 0 0);
  --color-card: oklch(0.22 0 0);
  --color-card-fg: oklch(0.96 0 0);
  --color-muted: oklch(0.25 0 0);
  --color-muted-fg: oklch(0.65 0 0);
  --color-border: oklch(0.3 0 0);
  --color-input: var(--color-border);
  --color-primary: var(--color-paper);
  --color-primary-fg: var(--color-ink);
  --color-secondary: oklch(0.28 0 0);
  --color-secondary-fg: oklch(0.96 0 0);
  --color-accent-fg: var(--color-ink);
}

/* Tailwind v4: @theme inline expõe as vars como classes utilitárias (bg-honey, text-fg, etc.) */
@theme inline {
  --color-honey: var(--color-honey);
  --color-honey-soft: var(--color-honey-soft);
  --color-honey-deep: var(--color-honey-deep);
  --color-ink: var(--color-ink);
  --color-paper: var(--color-paper);
  --color-paper-2: var(--color-paper-2);
  --color-ok: var(--color-ok);
  --color-warn: var(--color-warn);
  --color-err: var(--color-err);
  --color-info: var(--color-info);
  --color-bg: var(--color-bg);
  --color-fg: var(--color-fg);
  --color-card: var(--color-card);
  --color-card-fg: var(--color-card-fg);
  --color-muted: var(--color-muted);
  --color-muted-fg: var(--color-muted-fg);
  --color-border: var(--color-border);
  --color-input: var(--color-input);
  --color-ring: var(--color-ring);
  --color-accent: var(--color-accent);
  --color-accent-fg: var(--color-accent-fg);
  --color-primary: var(--color-primary);
  --color-primary-fg: var(--color-primary-fg);
  --color-secondary: var(--color-secondary);
  --color-secondary-fg: var(--color-secondary-fg);
  --color-destructive: var(--color-destructive);
  --color-destructive-fg: var(--color-destructive-fg);
  --color-chart-1: var(--color-chart-1);
  --color-chart-2: var(--color-chart-2);
  --color-chart-3: var(--color-chart-3);
  --color-chart-4: var(--color-chart-4);
  --color-chart-5: var(--color-chart-5);
  --font-display: var(--font-display);
  --font-mono: var(--font-mono);
  --breakpoint-3xl: var(--breakpoint-3xl);
}
```

### Task 2.2b: Tailwind v3 preset (compatibilidade com beeads-central-de-dados)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/tokens/src/preset.cjs`

- [ ] **Step 1: Criar `preset.cjs`** — Tailwind v3 lê as mesmas CSS vars via `extend`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        honey: "var(--color-honey)",
        "honey-soft": "var(--color-honey-soft)",
        "honey-deep": "var(--color-honey-deep)",
        ink: "var(--color-ink)",
        paper: "var(--color-paper)",
        "paper-2": "var(--color-paper-2)",
        ok: "var(--color-ok)",
        warn: "var(--color-warn)",
        err: "var(--color-err)",
        info: "var(--color-info)",
        bg: "var(--color-bg)",
        fg: "var(--color-fg)",
        card: {
          DEFAULT: "var(--color-card)",
          fg: "var(--color-card-fg)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          fg: "var(--color-muted-fg)",
        },
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        accent: {
          DEFAULT: "var(--color-accent)",
          fg: "var(--color-accent-fg)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          fg: "var(--color-primary-fg)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          fg: "var(--color-secondary-fg)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          fg: "var(--color-destructive-fg)",
        },
        "chart-1": "var(--color-chart-1)",
        "chart-2": "var(--color-chart-2)",
        "chart-3": "var(--color-chart-3)",
        "chart-4": "var(--color-chart-4)",
        "chart-5": "var(--color-chart-5)",
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
  plugins: [],
};
```

- [ ] **Step 2: Atualizar `packages/tokens/package.json` `exports`** para expor o preset

Adicionar ao bloco `exports`:
```json
"./preset.cjs": "./dist/preset.cjs"
```

E ao `scripts.build`:
```json
"build": "tsup && cp src/theme.css dist/theme.css && cp src/dark.css dist/dark.css && cp src/preset.cjs dist/preset.cjs"
```

### Task 2.3: Stub `dark.css` (placeholder caso queiramos separar no futuro)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/tokens/src/dark.css`

- [ ] **Step 1: Criar `dark.css`** (atualmente vazio — dark já está embutido no theme.css; mantido pra futura extração)

```css
/* Reservado para overrides de dark mode separados. Atualmente integrado em theme.css. */
```

### Task 2.4: `index.ts` com export programático dos valores (útil pra JS)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/tokens/src/index.ts`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/tokens/tsup.config.ts`

- [ ] **Step 1: Criar `src/index.ts`** — exporta tokens como objeto JS (útil pra recharts, framer-motion, etc.)

```ts
export const tokens = {
  colors: {
    honey: "oklch(0.78 0.16 75)",
    honeySoft: "oklch(0.93 0.08 85)",
    honeyDeep: "oklch(0.56 0.13 65)",
    ink: "oklch(0.16 0 0)",
    paper: "oklch(0.98 0.003 95)",
    paper2: "oklch(0.96 0.005 95)",
    ok: "oklch(0.5 0.13 145)",
    warn: "oklch(0.56 0.13 65)",
    err: "oklch(0.52 0.18 25)",
  },
  radius: {
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
  },
  breakpoints: {
    "3xl": "1700px",
  },
} as const;

export type Tokens = typeof tokens;
```

- [ ] **Step 2: Criar `tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

### Task 2.5: Buildar e validar

- [ ] **Step 1: Instalar deps do pacote**

Run:
```bash
cd "c:/Users/gusta/Projetos/beeads-ui" ; pnpm install
```

- [ ] **Step 2: Buildar**

Run: `pnpm --filter @beeads/tokens build`
Expected: cria `packages/tokens/dist/` com `index.js`, `index.cjs`, `index.d.ts`, `theme.css`, `dark.css`.

- [ ] **Step 3: Verificar conteúdo do dist**

Run:
```bash
ls "c:/Users/gusta/Projetos/beeads-ui/packages/tokens/dist"
```
Expected: lista contém `theme.css`, `dark.css`, `index.js`, `index.d.ts`.

- [ ] **Step 4: Commit**

```bash
cd "c:/Users/gusta/Projetos/beeads-ui" ; git add packages/tokens ; git commit -m "feat(tokens): initial @beeads/tokens with theme.css + light/dark semantic vars"
```

---

# Fase 3 — `@beeads/fonts`

**Objetivo:** pacote que exporta Fraunces + Geist Mono via `next/font/google` com CSS vars padronizadas.

### Task 3.1: Scaffold

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/fonts/package.json`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/fonts/tsconfig.json`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/fonts/tsup.config.ts`

- [ ] **Step 1: Criar `packages/fonts/package.json`**

```json
{
  "name": "@beeads/fonts",
  "version": "0.0.0",
  "description": "Fontes do design system beeads — Fraunces + Geist Mono via next/font",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/gucancado/beeads-ui",
    "directory": "packages/fonts"
  },
  "publishConfig": {
    "access": "public"
  },
  "files": ["dist"],
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js"
  },
  "peerDependencies": {
    "next": ">=14"
  },
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "next": "^16.2.6",
    "tsup": "^8.3.5",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 2: Criar `packages/fonts/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Criar `packages/fonts/tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: ["next/font/google"],
});
```

### Task 3.2: Implementar exports de fontes

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/fonts/src/index.ts`

- [ ] **Step 1: Criar `src/index.ts`**

```ts
import { Fraunces, Geist_Mono } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
```

### Task 3.3: Build e validar

- [ ] **Step 1: Build**

Run: `pnpm --filter @beeads/fonts build`
Expected: `packages/fonts/dist/` contém `index.js`, `index.cjs`, `index.d.ts`.

- [ ] **Step 2: Commit**

```bash
git add packages/fonts ; git commit -m "feat(fonts): @beeads/fonts exporting Fraunces + Geist Mono via next/font"
```

---

# Fase 4 — `@beeads/ui` base

**Objetivo:** pacote `@beeads/ui` scaffold com `cn()`, ThemeProvider, styles.css, e barrel `index.ts` vazio (componentes vêm nas próximas fases).

### Task 4.1: Scaffold do pacote

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/package.json`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/tsconfig.json`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/tsup.config.ts`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/vitest.config.ts`

- [ ] **Step 1: Criar `packages/ui/package.json`**

```json
{
  "name": "@beeads/ui",
  "version": "0.0.0",
  "description": "Componentes UI do design system beeads — primitivos sobre @base-ui/react",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/gucancado/beeads-ui",
    "directory": "packages/ui"
  },
  "publishConfig": {
    "access": "public"
  },
  "files": ["dist"],
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./styles.css": "./dist/styles.css"
  },
  "sideEffects": ["**/*.css"],
  "scripts": {
    "build": "tsup && cp src/styles.css dist/styles.css",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "dependencies": {
    "@base-ui/react": "^1.5.0",
    "@beeads/tokens": "workspace:*",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "next-themes": "^0.4.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^5.0.6",
    "happy-dom": "^15.11.7",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "tsup": "^8.3.5",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Criar `packages/ui/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["src/**/*.test.*"]
}
```

- [ ] **Step 3: Criar `packages/ui/tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom", "next-themes"],
  banner: { js: '"use client";' },
});
```

- [ ] **Step 4: Criar `packages/ui/vitest.config.ts`**

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
});
```

### Task 4.2: Implementar `cn()` utility

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/lib/utils.ts`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/lib/utils.test.ts`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/test-setup.ts`

- [ ] **Step 1: Criar `src/test-setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Escrever teste falhando — `src/lib/utils.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("combines class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("dedupes conflicting tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes via clsx", () => {
    expect(cn("a", false && "b", { c: true, d: false })).toBe("a c");
  });
});
```

- [ ] **Step 3: Rodar teste — deve falhar**

Run: `pnpm --filter @beeads/ui test`
Expected: FAIL — `cn` não existe.

- [ ] **Step 4: Implementar `src/lib/utils.ts`**

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Rodar teste — deve passar**

Run: `pnpm --filter @beeads/ui test`
Expected: PASS (3 testes).

### Task 4.3: ThemeProvider

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/providers/theme-provider.tsx`

- [ ] **Step 1: Criar `src/providers/theme-provider.tsx`**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export { useTheme } from "next-themes";
```

### Task 4.4: `styles.css` base

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/styles.css`

- [ ] **Step 1: Criar `src/styles.css`**

```css
@import "@beeads/tokens/theme.css";

@layer base {
  *,
  *::before,
  *::after {
    border-color: var(--color-border);
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-fg);
    font-family: var(--font-mono);
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    letter-spacing: -0.02em;
  }
}
```

### Task 4.5: Barrel `index.ts`

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/index.ts`

- [ ] **Step 1: Criar `src/index.ts`** (componentes serão adicionados nas fases seguintes)

```ts
export { cn } from "./lib/utils";
export { ThemeProvider, useTheme } from "./providers/theme-provider";
```

- [ ] **Step 2: Build e typecheck**

Run:
```bash
pnpm install ; pnpm --filter @beeads/ui build ; pnpm --filter @beeads/ui typecheck
```
Expected: build cria `packages/ui/dist/` com `index.js` + `styles.css`; typecheck passa.

- [ ] **Step 3: Commit**

```bash
git add packages/ui ; git commit -m "feat(ui): base scaffold with cn, ThemeProvider, styles.css"
```

---

# Fase 5 — `@beeads/ui` Button (template canônico)

**Objetivo:** Button completo (com CVA, dark mode, testes, exports). Serve como **template visual e estrutural** para os outros componentes nas Fases 6-8.

### Task 5.0: Invocar `frontend-design` para guidance visual

- [ ] **Step 1: Invocar skill**

Antes de codar o Button, invocar `Skill(frontend-design)` com prompt:
"Estou criando o Button do @beeads/ui — primitivo canônico de um design system para o ecossistema beeads (honey #FFAE00 accent, Fraunces display, Geist Mono body, light+dark). Quero garantir qualidade visual alta nas variantes (default/accent/destructive/outline/secondary/ghost/link) e sizes (xs/sm/default/lg/icon). Quais ajustes recomenda nas escolhas de padding, gap, font-weight, transição, focus ring, hover state pra ficar polished e distintivo (não genérico de shadcn)?"

Aplicar feedback aos defaults do CVA antes de prosseguir pro Step 1 da Task 5.1.

- [ ] **Step 2: Consultar accessibility.md de typeui-fundamentals**

Ler `~/Projetos/agente-semente/.agents/skills/typeui-fundamentals/accessibility.md` seção sobre **focus visibility** e **touch targets** (mínimo 44x44 pra mobile). Confirmar que `size="sm"` (h-8 = 32px) e `size="xs"` (h-7 = 28px) só são usados em contextos onde clique não é primário (toolbars, inline). Documentar essa restrição no JSDoc do `ButtonProps` (Task 5.1 Step 3).

### Task 5.1: Implementar Button com TDD

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/button.tsx`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/button.test.tsx`

- [ ] **Step 1: Escrever teste falhando — `button.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("applies variant classes", () => {
    render(<Button variant="destructive">Apagar</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Off</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("supports asChild render prop pattern via Slot", () => {
    render(
      <Button asChild>
        <a href="/foo">Link</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Link" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar — deve falhar**

Run: `pnpm --filter @beeads/ui test`
Expected: FAIL — `./button` não existe.

- [ ] **Step 3: Implementar `button.tsx`**

```tsx
"use client";

import { Slot } from "@base-ui/react/slot";
import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md text-sm font-medium",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-fg hover:bg-primary/90",
        accent: "bg-accent text-accent-fg hover:bg-accent/90",
        destructive: "bg-destructive text-destructive-fg hover:bg-destructive/90",
        outline: "border border-input bg-bg hover:bg-muted hover:text-fg",
        secondary: "bg-secondary text-secondary-fg hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-fg",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3",
        default: "h-9 px-4 py-2",
        lg: "h-10 px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
```

- [ ] **Step 4: Rodar testes — devem passar**

Run: `pnpm --filter @beeads/ui test`
Expected: PASS (5 testes do Button + 3 do cn).

- [ ] **Step 5: Adicionar export ao barrel**

Editar `packages/ui/src/index.ts` adicionando:
```ts
export { Button, buttonVariants, type ButtonProps } from "./components/button";
```

- [ ] **Step 6: Build**

Run: `pnpm --filter @beeads/ui build`
Expected: PASS, `dist/index.js` contém Button.

- [ ] **Step 7: Commit**

```bash
git add packages/ui ; git commit -m "feat(ui): Button primitive with CVA variants and asChild support"
```

---

# Fase 6 — `@beeads/ui` Forms

**Objetivo:** primitivos de formulários: Input, Textarea, Label, Checkbox, Switch, RadioGroup, Select.

> **Padrão:** cada componente segue o template do Button (Fase 5) — arquivo `<name>.tsx`, opcional `<name>.test.tsx` para comportamento crítico, export no barrel, CVA quando há variantes. Usa `@base-ui/react` quando precisa de comportamento headless (Checkbox, Switch, RadioGroup, Select).

### Task 6.1: Input

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/input.tsx`

- [ ] **Step 1: Criar `input.tsx`**

```tsx
"use client";

import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-bg px-3 py-1 text-sm shadow-sm",
        "transition-colors",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg",
        "placeholder:text-muted-fg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Adicionar ao barrel** (`src/index.ts`):
```ts
export { Input } from "./components/input";
```

### Task 6.2: Textarea

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/textarea.tsx`

- [ ] **Step 1: Criar `textarea.tsx`**

```tsx
"use client";

import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-bg px-3 py-2 text-sm shadow-sm",
        "placeholder:text-muted-fg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Textarea } from "./components/textarea";
```

### Task 6.3: Label

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/label.tsx`

- [ ] **Step 1: Criar `label.tsx`**

```tsx
"use client";

import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Label } from "./components/label";
```

### Task 6.4: Checkbox

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/checkbox.tsx`

- [ ] **Step 1: Criar `checkbox.tsx`**

```tsx
"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Checkbox({
  className,
  ...props
}: ComponentProps<typeof BaseCheckbox.Root>) {
  return (
    <BaseCheckbox.Root
      data-slot="checkbox"
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-input shadow-sm",
        "data-[checked]:bg-primary data-[checked]:text-primary-fg data-[checked]:border-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator className="flex items-center justify-center text-current">
        <Check className="h-3 w-3" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Checkbox } from "./components/checkbox";
```

### Task 6.5: Switch

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/switch.tsx`

- [ ] **Step 1: Criar `switch.tsx`**

```tsx
"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Switch({
  className,
  ...props
}: ComponentProps<typeof BaseSwitch.Root>) {
  return (
    <BaseSwitch.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm",
        "transition-colors",
        "data-[checked]:bg-primary",
        "data-[unchecked]:bg-input",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-card shadow-lg ring-0",
          "transition-transform",
          "data-[checked]:translate-x-4 data-[unchecked]:translate-x-0",
        )}
      />
    </BaseSwitch.Root>
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Switch } from "./components/switch";
```

### Task 6.6: RadioGroup

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/radio-group.tsx`

- [ ] **Step 1: Criar `radio-group.tsx`**

```tsx
"use client";

import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Circle } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function RadioGroup({
  className,
  ...props
}: ComponentProps<typeof BaseRadioGroup.Root>) {
  return (
    <BaseRadioGroup.Root
      data-slot="radio-group"
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}

export function RadioGroupItem({
  className,
  ...props
}: ComponentProps<typeof BaseRadioGroup.Item>) {
  return (
    <BaseRadioGroup.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-input text-primary shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <BaseRadioGroup.Indicator className="flex items-center justify-center">
        <Circle className="h-2 w-2 fill-current text-current" />
      </BaseRadioGroup.Indicator>
    </BaseRadioGroup.Item>
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { RadioGroup, RadioGroupItem } from "./components/radio-group";
```

### Task 6.7: Select

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/select.tsx`

- [ ] **Step 1: Criar `select.tsx`**

```tsx
"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export const Select = BaseSelect.Root;
export const SelectValue = BaseSelect.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseSelect.Trigger>) {
  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-bg px-3 py-2 text-sm shadow-sm",
        "placeholder:text-muted-fg",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <BaseSelect.Icon>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseSelect.Popup>) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner sideOffset={4}>
        <BaseSelect.Popup
          data-slot="select-content"
          className={cn(
            "z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card text-card-fg shadow-md",
            className,
          )}
          {...props}
        >
          {children}
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseSelect.Item>) {
  return (
    <BaseSelect.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "data-[highlighted]:bg-muted data-[highlighted]:text-fg",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <BaseSelect.ItemIndicator>
          <Check className="h-4 w-4" />
        </BaseSelect.ItemIndicator>
      </span>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select";
```

### Task 6.8: Field (form group: Label + Input + helper text + error)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/field.tsx`

- [ ] **Step 1: Criar `field.tsx`** — wrapper canônico de campo de formulário

```tsx
"use client";

import { type ComponentProps, createContext, useContext, useId } from "react";
import { cn } from "../lib/utils";

type FieldContextValue = {
  id: string;
  errorId: string;
  helperId: string;
  hasError: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export function useField() {
  const ctx = useContext(FieldContext);
  if (!ctx) throw new Error("Field subcomponents must be used inside <Field>");
  return ctx;
}

export function Field({
  className,
  error,
  children,
  ...props
}: ComponentProps<"div"> & { error?: boolean }) {
  const id = useId();
  return (
    <FieldContext.Provider
      value={{ id, errorId: `${id}-error`, helperId: `${id}-helper`, hasError: !!error }}
    >
      <div data-slot="field" className={cn("flex flex-col gap-1.5", className)} {...props}>
        {children}
      </div>
    </FieldContext.Provider>
  );
}

export function FieldLabel({ className, ...props }: ComponentProps<"label">) {
  const { id } = useField();
  return (
    <label
      htmlFor={id}
      data-slot="field-label"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

export function FieldControl({ children }: { children: React.ReactElement }) {
  const { id, errorId, helperId, hasError } = useField();
  const describedBy = [hasError && errorId, !hasError && helperId].filter(Boolean).join(" ") || undefined;
  return (
    <slot>
      {/* clona o filho passando id e aria-describedby */}
      {Object.assign({}, children, {
        props: { ...children.props, id, "aria-describedby": describedBy, "aria-invalid": hasError || undefined },
      })}
    </slot>
  );
}

export function FieldHelper({ className, ...props }: ComponentProps<"p">) {
  const { helperId, hasError } = useField();
  if (hasError) return null;
  return <p id={helperId} className={cn("text-xs text-muted-fg", className)} {...props} />;
}

export function FieldError({ className, ...props }: ComponentProps<"p">) {
  const { errorId, hasError } = useField();
  if (!hasError) return null;
  return <p id={errorId} role="alert" className={cn("text-xs text-destructive", className)} {...props} />;
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Field, FieldControl, FieldError, FieldHelper, FieldLabel } from "./components/field";
```

### Task 6.9: Slider

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/slider.tsx`

- [ ] **Step 1: Criar `slider.tsx`**

```tsx
"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Slider({
  className,
  ...props
}: ComponentProps<typeof BaseSlider.Root>) {
  return (
    <BaseSlider.Root
      data-slot="slider"
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <BaseSlider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
        <BaseSlider.Indicator className="absolute h-full bg-primary" />
      </BaseSlider.Track>
      <BaseSlider.Thumb
        className={cn(
          "block h-4 w-4 rounded-full border border-primary bg-card shadow",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      />
    </BaseSlider.Root>
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Slider } from "./components/slider";
```

### Task 6.10: Validar fase

- [ ] **Step 1: Typecheck + build + test**

Run:
```bash
pnpm --filter @beeads/ui typecheck ; pnpm --filter @beeads/ui build ; pnpm --filter @beeads/ui test
```
Expected: tudo verde.

- [ ] **Step 2: Commit**

```bash
git add packages/ui ; git commit -m "feat(ui): form primitives (Input, Textarea, Label, Checkbox, Switch, RadioGroup, Select, Field, Slider)"
```

---

# Fase 7 — `@beeads/ui` Overlays

**Objetivo:** Dialog, Sheet, Popover, Tooltip, DropdownMenu, AlertDialog. Todos via `@base-ui/react`.

### Task 7.1: Dialog

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/dialog.tsx`

- [ ] **Step 1: Criar `dialog.tsx`**

```tsx
"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className={cn(
          "fixed inset-0 z-50 bg-black/50",
          "data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0",
        )}
      />
      <BaseDialog.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-card p-6 shadow-lg sm:rounded-lg",
          "data-[open]:animate-in data-[closed]:animate-out",
          className,
        )}
        {...props}
      >
        {children}
        <BaseDialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      data-slot="dialog-title"
      className={cn("font-display text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-fg", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/dialog";
```

### Task 7.2: Sheet (Dialog lateral)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/sheet.tsx`

- [ ] **Step 1: Criar `sheet.tsx`** (mesma estrutura do Dialog, com posicionamento lateral via CVA)

```tsx
"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { type VariantProps, cva } from "class-variance-authority";
import { X } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export const Sheet = BaseDialog.Root;
export const SheetTrigger = BaseDialog.Trigger;
export const SheetClose = BaseDialog.Close;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-card p-6 shadow-lg border-border",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b",
        bottom: "inset-x-0 bottom-0 border-t",
        left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
      },
    },
    defaultVariants: { side: "right" },
  },
);

interface SheetContentProps
  extends ComponentProps<typeof BaseDialog.Popup>,
    VariantProps<typeof sheetVariants> {}

export function SheetContent({ side, className, children, ...props }: SheetContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <BaseDialog.Popup
        data-slot="sheet-content"
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        <BaseDialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      className={cn("font-display text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function SheetDescription({ className, ...props }: ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description className={cn("text-sm text-muted-fg", className)} {...props} />
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/sheet";
```

### Task 7.3: Popover

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/popover.tsx`

- [ ] **Step 1: Criar `popover.tsx`**

```tsx
"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;

export function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  children,
  ...props
}: ComponentProps<typeof BasePopover.Popup> & {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner sideOffset={sideOffset} align={align}>
        <BasePopover.Popup
          data-slot="popover-content"
          className={cn(
            "z-50 w-72 rounded-md border border-border bg-card p-4 text-card-fg shadow-md outline-none",
            className,
          )}
          {...props}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Popover, PopoverContent, PopoverTrigger } from "./components/popover";
```

### Task 7.4: Tooltip

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/tooltip.tsx`

- [ ] **Step 1: Criar `tooltip.tsx`**

```tsx
"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export const TooltipProvider = BaseTooltip.Provider;
export const Tooltip = BaseTooltip.Root;
export const TooltipTrigger = BaseTooltip.Trigger;

export function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof BaseTooltip.Popup> & { sideOffset?: number }) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner sideOffset={sideOffset}>
        <BaseTooltip.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 overflow-hidden rounded-md border border-border bg-card px-3 py-1.5 text-xs text-card-fg shadow-md",
            className,
          )}
          {...props}
        />
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/tooltip";
```

### Task 7.5: DropdownMenu

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/dropdown-menu.tsx`

- [ ] **Step 1: Criar `dropdown-menu.tsx`**

```tsx
"use client";

import { Menu } from "@base-ui/react/menu";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: ComponentProps<typeof Menu.Popup> & { sideOffset?: number }) {
  return (
    <Menu.Portal>
      <Menu.Positioner sideOffset={sideOffset}>
        <Menu.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-fg shadow-md",
            className,
          )}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "data-[highlighted]:bg-muted data-[highlighted]:text-fg",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof Menu.Separator>) {
  return (
    <Menu.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/dropdown-menu";
```

### Task 7.6: AlertDialog

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/alert-dialog.tsx`

- [ ] **Step 1: Criar `alert-dialog.tsx`** (Dialog modal sem opção de fechar clicando fora)

```tsx
"use client";

import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export const AlertDialog = BaseAlertDialog.Root;
export const AlertDialogTrigger = BaseAlertDialog.Trigger;

export function AlertDialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseAlertDialog.Popup>) {
  return (
    <BaseAlertDialog.Portal>
      <BaseAlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <BaseAlertDialog.Popup
        data-slot="alert-dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-card p-6 shadow-lg sm:rounded-lg",
          className,
        )}
        {...props}
      >
        {children}
      </BaseAlertDialog.Popup>
    </BaseAlertDialog.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2", className)} {...props} />;
}

export function AlertDialogTitle({
  className,
  ...props
}: ComponentProps<typeof BaseAlertDialog.Title>) {
  return (
    <BaseAlertDialog.Title
      className={cn("font-display text-lg font-semibold", className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof BaseAlertDialog.Description>) {
  return (
    <BaseAlertDialog.Description className={cn("text-sm text-muted-fg", className)} {...props} />
  );
}

export const AlertDialogAction = BaseAlertDialog.Close;
export const AlertDialogCancel = BaseAlertDialog.Close;
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/alert-dialog";
```

### Task 7.7: Drawer (variante mobile-first do Sheet, com bottom slide e snap)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/drawer.tsx`

- [ ] **Step 1: Adicionar dep `vaul`** (lib amplamente usada para drawer no padrão shadcn)

```bash
pnpm --filter @beeads/ui add vaul@^1.1.2
```

- [ ] **Step 2: Criar `drawer.tsx`**

```tsx
"use client";

import { type ComponentProps } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { cn } from "../lib/utils";

export const Drawer = VaulDrawer.Root;
export const DrawerTrigger = VaulDrawer.Trigger;
export const DrawerClose = VaulDrawer.Close;
export const DrawerPortal = VaulDrawer.Portal;

export function DrawerOverlay({ className, ...props }: ComponentProps<typeof VaulDrawer.Overlay>) {
  return (
    <VaulDrawer.Overlay
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      {...props}
    />
  );
}

export function DrawerContent({
  className,
  children,
  ...props
}: ComponentProps<typeof VaulDrawer.Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <VaulDrawer.Content
        data-slot="drawer-content"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-lg border border-border bg-card",
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        {children}
      </VaulDrawer.Content>
    </DrawerPortal>
  );
}

export function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

export function DrawerTitle({ className, ...props }: ComponentProps<typeof VaulDrawer.Title>) {
  return (
    <VaulDrawer.Title
      className={cn("font-display text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function DrawerDescription({ className, ...props }: ComponentProps<typeof VaulDrawer.Description>) {
  return (
    <VaulDrawer.Description className={cn("text-sm text-muted-fg", className)} {...props} />
  );
}
```

- [ ] **Step 3: Adicionar ao barrel**:
```ts
export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./components/drawer";
```

### Task 7.8: Command (cmdk palette estilo Ctrl+K)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/command.tsx`

- [ ] **Step 1: Adicionar dep `cmdk`**

```bash
pnpm --filter @beeads/ui add cmdk@^1.0.4
```

- [ ] **Step 2: Criar `command.tsx`**

```tsx
"use client";

import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { type ComponentProps } from "react";
import { Dialog, DialogContent } from "./dialog";
import { cn } from "../lib/utils";

export function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-card text-card-fg",
        className,
      )}
      {...props}
    />
  );
}

export function CommandDialog({ children, ...props }: ComponentProps<typeof Dialog>) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-input-wrapper]]:border-b">{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

export function CommandInput({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-fg disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}

export function CommandEmpty(props: ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-fg" {...props} />;
}

export function CommandGroup({ className, ...props }: ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden p-1 text-fg [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-fg",
        className,
      )}
      {...props}
    />
  );
}

export function CommandItem({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "data-[selected=true]:bg-muted data-[selected=true]:text-fg",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function CommandSeparator({ className, ...props }: ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator className={cn("-mx-1 h-px bg-border", className)} {...props} />;
}
```

- [ ] **Step 3: Adicionar ao barrel**:
```ts
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./components/command";
```

### Task 7.9: Validar fase

- [ ] **Step 1: Build + typecheck + test**

Run:
```bash
pnpm --filter @beeads/ui typecheck ; pnpm --filter @beeads/ui build ; pnpm --filter @beeads/ui test
```
Expected: tudo verde.

- [ ] **Step 2: Commit**

```bash
git add packages/ui ; git commit -m "feat(ui): overlay primitives (Dialog, Sheet, Drawer, Popover, Tooltip, DropdownMenu, AlertDialog, Command)"
```

---

# Fase 8 — `@beeads/ui` Layout & Feedback

**Objetivo:** Card, Separator, Tabs, Accordion, Badge, Skeleton, Alert, Toast.

### Task 8.1: Card

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/card.tsx`

- [ ] **Step 1: Criar `card.tsx`** (port direto de agentes-beeads adaptado)

```tsx
"use client";

import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-lg border border-border bg-card text-card-fg shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-display font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-fg", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("p-6 pt-0", className)} {...props} />
  );
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/card";
```

### Task 8.2: Separator

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/separator.tsx`

- [ ] **Step 1: Criar `separator.tsx`**

```tsx
"use client";

import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      data-slot="separator"
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Separator } from "./components/separator";
```

### Task 8.3: Tabs

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/tabs.tsx`

- [ ] **Step 1: Criar `tabs.tsx`**

```tsx
"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export const Tabs = BaseTabs.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-fg",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium",
        "transition-all",
        "data-[selected]:bg-card data-[selected]:text-fg data-[selected]:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel
      data-slot="tabs-content"
      className={cn("mt-2 focus-visible:outline-none", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs";
```

### Task 8.4: Accordion

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/accordion.tsx`

- [ ] **Step 1: Criar `accordion.tsx`**

```tsx
"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export const Accordion = BaseAccordion.Root;

export function AccordionItem({
  className,
  ...props
}: ComponentProps<typeof BaseAccordion.Item>) {
  return (
    <BaseAccordion.Item
      data-slot="accordion-item"
      className={cn("border-b border-border", className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseAccordion.Trigger>) {
  return (
    <BaseAccordion.Header className="flex">
      <BaseAccordion.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium",
          "transition-all hover:underline",
          "[&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseAccordion.Panel>) {
  return (
    <BaseAccordion.Panel
      data-slot="accordion-content"
      className={cn("overflow-hidden text-sm transition-all", className)}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </BaseAccordion.Panel>
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/accordion";
```

### Task 8.5: Badge

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/badge.tsx`

- [ ] **Step 1: Criar `badge.tsx`**

```tsx
"use client";

import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
    "transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-fg",
        secondary: "border-transparent bg-secondary text-secondary-fg",
        accent: "border-transparent bg-accent text-accent-fg",
        destructive: "border-transparent bg-destructive text-destructive-fg",
        outline: "text-fg",
        ok: "border-transparent bg-ok/15 text-ok",
        warn: "border-transparent bg-warn/15 text-warn",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends ComponentProps<"div">,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { badgeVariants };
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Badge, badgeVariants, type BadgeProps } from "./components/badge";
```

### Task 8.6: Skeleton

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/skeleton.tsx`

- [ ] **Step 1: Criar `skeleton.tsx`**

```tsx
"use client";

import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Skeleton } from "./components/skeleton";
```

### Task 8.7: Alert

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/alert.tsx`

- [ ] **Step 1: Criar `alert.tsx`**

```tsx
"use client";

import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-fg [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-card text-card-fg border-border",
        destructive: "border-destructive/50 text-destructive bg-destructive/5 [&>svg]:text-destructive",
        warn: "border-warn/50 text-warn bg-warn/5 [&>svg]:text-warn",
        ok: "border-ok/50 text-ok bg-ok/5 [&>svg]:text-ok",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface AlertProps
  extends ComponentProps<"div">,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: ComponentProps<"h5">) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Alert, AlertDescription, AlertTitle, type AlertProps } from "./components/alert";
```

### Task 8.8: Toast (via sonner)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/toaster.tsx`

- [ ] **Step 1: Criar `toaster.tsx`** (wrapper sobre sonner com tokens beeads)

```tsx
"use client";

import { Toaster as SonnerToaster, toast } from "sonner";
import { useTheme } from "../providers/theme-provider";

export function Toaster() {
  const { theme = "system" } = useTheme();
  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-fg group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-fg",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-fg",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-fg",
        },
      }}
    />
  );
}

export { toast };
```

- [ ] **Step 2: Adicionar ao barrel**:
```ts
export { Toaster, toast } from "./components/toaster";
```

### Task 8.9: Avatar

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/avatar.tsx`

- [ ] **Step 1: Criar `avatar.tsx`**

```tsx
"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Avatar({ className, ...props }: ComponentProps<typeof BaseAvatar.Root>) {
  return (
    <BaseAvatar.Root
      data-slot="avatar"
      className={cn("relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: ComponentProps<typeof BaseAvatar.Image>) {
  return (
    <BaseAvatar.Image
      data-slot="avatar-image"
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({ className, ...props }: ComponentProps<typeof BaseAvatar.Fallback>) {
  return (
    <BaseAvatar.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-fg",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Barrel**:
```ts
export { Avatar, AvatarFallback, AvatarImage } from "./components/avatar";
```

### Task 8.10: Breadcrumb

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/breadcrumb.tsx`

- [ ] **Step 1: Criar `breadcrumb.tsx`**

```tsx
"use client";

import { ChevronRight, MoreHorizontal } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Breadcrumb({ ...props }: ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

export function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) {
  return (
    <ol
      className={cn("flex flex-wrap items-center gap-1.5 text-sm text-muted-fg", className)}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

export function BreadcrumbLink({ className, ...props }: ComponentProps<"a">) {
  return <a className={cn("transition-colors hover:text-fg", className)} {...props} />;
}

export function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-medium text-fg", className)}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({ children, className, ...props }: ComponentProps<"li">) {
  return (
    <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
      {children ?? <ChevronRight />}
    </li>
  );
}

export function BreadcrumbEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span role="presentation" aria-hidden="true" className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </span>
  );
}
```

- [ ] **Step 2: Barrel**:
```ts
export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./components/breadcrumb";
```

### Task 8.11: Pagination

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/pagination.tsx`

- [ ] **Step 1: Criar `pagination.tsx`**

```tsx
"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { type ComponentProps } from "react";
import { Button, type ButtonProps, buttonVariants } from "./button";
import { cn } from "../lib/utils";

export function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

export function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />;
}

export function PaginationItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("", className)} {...props} />;
}

export function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: ComponentProps<"a"> & { isActive?: boolean; size?: ButtonProps["size"] }) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
        className,
      )}
      {...props}
    />
  );
}

export function PaginationPrevious(props: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Página anterior" size="default" className="gap-1 pl-2.5" {...props}>
      <ChevronLeft className="h-4 w-4" />
      <span>Anterior</span>
    </PaginationLink>
  );
}

export function PaginationNext(props: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Próxima página" size="default" className="gap-1 pr-2.5" {...props}>
      <span>Próxima</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </span>
  );
}
```

- [ ] **Step 2: Barrel**:
```ts
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/pagination";
```

### Task 8.12: Collapsible

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/collapsible.tsx`

- [ ] **Step 1: Criar `collapsible.tsx`**

```tsx
"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";

export const Collapsible = BaseCollapsible.Root;
export const CollapsibleTrigger = BaseCollapsible.Trigger;
export const CollapsibleContent = BaseCollapsible.Panel;
```

- [ ] **Step 2: Barrel**:
```ts
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/collapsible";
```

### Task 8.13: ScrollArea

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/scroll-area.tsx`

- [ ] **Step 1: Criar `scroll-area.tsx`**

```tsx
"use client";

import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function ScrollArea({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseScrollArea.Root>) {
  return (
    <BaseScrollArea.Root
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <BaseScrollArea.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar orientation="vertical" className="flex h-full w-2.5 touch-none select-none p-0.5">
        <BaseScrollArea.Thumb className="relative flex-1 rounded-full bg-border" />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Scrollbar orientation="horizontal" className="flex h-2.5 w-full touch-none select-none p-0.5">
        <BaseScrollArea.Thumb className="relative flex-1 rounded-full bg-border" />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  );
}
```

- [ ] **Step 2: Barrel**:
```ts
export { ScrollArea } from "./components/scroll-area";
```

### Task 8.14: Spinner

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/spinner.tsx`

- [ ] **Step 1: Criar `spinner.tsx`**

```tsx
"use client";

import { Loader2 } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Spinner({ className, ...props }: ComponentProps<"span">) {
  return (
    <span data-slot="spinner" role="status" aria-label="Carregando" {...props}>
      <Loader2 className={cn("h-4 w-4 animate-spin text-muted-fg", className)} />
      <span className="sr-only">Carregando</span>
    </span>
  );
}
```

- [ ] **Step 2: Barrel**:
```ts
export { Spinner } from "./components/spinner";
```

### Task 8.15: Empty (empty state)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/empty.tsx`

- [ ] **Step 1: Criar `empty.tsx`**

```tsx
"use client";

import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Empty({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-12 text-center",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyIcon({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("text-muted-fg [&>svg]:size-10", className)} {...props} />
  );
}

export function EmptyTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("font-display text-base font-medium", className)} {...props} />;
}

export function EmptyDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("max-w-sm text-sm text-muted-fg", className)} {...props} />;
}
```

- [ ] **Step 2: Barrel**:
```ts
export { Empty, EmptyDescription, EmptyIcon, EmptyTitle } from "./components/empty";
```

### Task 8.16: Progress

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/progress.tsx`

- [ ] **Step 1: Criar `progress.tsx`**

```tsx
"use client";

import { Progress as BaseProgress } from "@base-ui/react/progress";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Progress({
  className,
  ...props
}: ComponentProps<typeof BaseProgress.Root>) {
  return (
    <BaseProgress.Root
      data-slot="progress"
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <BaseProgress.Indicator className="h-full w-full flex-1 bg-primary transition-all" />
    </BaseProgress.Root>
  );
}
```

- [ ] **Step 2: Barrel**:
```ts
export { Progress } from "./components/progress";
```

### Task 8.17: Validar fase

- [ ] **Step 1: Build + typecheck + test**

Run:
```bash
pnpm --filter @beeads/ui typecheck ; pnpm --filter @beeads/ui build ; pnpm --filter @beeads/ui test
```
Expected: tudo verde.

- [ ] **Step 2: Commit**

```bash
git add packages/ui ; git commit -m "feat(ui): layout/feedback primitives (Card, Separator, Tabs, Accordion, Badge, Skeleton, Alert, Toaster, Avatar, Breadcrumb, Pagination, Collapsible, ScrollArea, Spinner, Empty, Progress)"
```

---

# Fase 9 — `@beeads/ui` Calendar + DatePicker

**Objetivo:** Calendar (date grid standalone) e DatePicker (Calendar dentro de Popover, com input formatado).

### Task 9.1: Calendar (date grid)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/calendar.tsx`

- [ ] **Step 1: Adicionar dep `react-day-picker`**

```bash
pnpm --filter @beeads/ui add react-day-picker@^9.5.0 date-fns@^4.1.0
```

- [ ] **Step 2: Criar `calendar.tsx`**

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { buttonVariants } from "./button";
import { cn } from "../lib/utils";

export type CalendarProps = ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "text-muted-fg rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-fg hover:bg-primary hover:text-primary-fg focus:bg-primary focus:text-primary-fg",
        day_today: "bg-accent text-accent-fg",
        day_outside: "text-muted-fg opacity-50",
        day_disabled: "text-muted-fg opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-fg",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Barrel**:
```ts
export { Calendar, type CalendarProps } from "./components/calendar";
```

### Task 9.2: DatePicker (Calendar dentro de Popover)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/src/components/date-picker.tsx`

- [ ] **Step 1: Criar `date-picker.tsx`**

```tsx
"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../lib/utils";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Escolher data",
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !value && "text-muted-fg",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP", { locale: ptBR }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            onChange?.(d);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Barrel**:
```ts
export { DatePicker } from "./components/date-picker";
```

- [ ] **Step 3: Validar + commit**

```bash
pnpm --filter @beeads/ui typecheck ; pnpm --filter @beeads/ui build ; pnpm --filter @beeads/ui test
git add packages/ui ; git commit -m "feat(ui): Calendar + DatePicker (react-day-picker + ptBR locale)"
```

---

# Fase 10 — `@beeads/charts`

**Objetivo:** pacote separado para visualização de dados, replicando os padrões já validados no central-de-dados (DailyChart, ComparisonChart, FunnelChart, DemoHeatmap, KpiCard) mas com tokens beeads e API consistente.

**Justificativa do pacote separado:** recharts é ~150KB. Apps que não precisam de charts não pagam o custo. Padrões de visualização têm vida própria (formato de tooltip, paleta categórica, ChartFrame com header+filtros) — vale isolar.

### Task 10.1: Scaffold do pacote

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/package.json`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/tsconfig.json`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/tsup.config.ts`

- [ ] **Step 1: Criar `packages/charts/package.json`**

```json
{
  "name": "@beeads/charts",
  "version": "0.0.0",
  "description": "Visualização de dados do design system beeads — wrappers sobre recharts com tokens unificados",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/gucancado/beeads-ui",
    "directory": "packages/charts"
  },
  "publishConfig": { "access": "public" },
  "files": ["dist"],
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./styles.css": "./dist/styles.css"
  },
  "sideEffects": ["**/*.css"],
  "scripts": {
    "build": "tsup && cp src/styles.css dist/styles.css",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "dependencies": {
    "@beeads/tokens": "workspace:*",
    "@beeads/ui": "workspace:*",
    "date-fns": "^4.1.0",
    "recharts": "^2.15.4"
  },
  "devDependencies": {
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "tsup": "^8.3.5",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: tsconfig.json + tsup.config.ts** (idênticos ao de `@beeads/ui`, apenas mudando paths para `packages/charts/`).

### Task 10.2: Tema de charts (paleta categórica + defaults)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/lib/chart-theme.ts`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/styles.css`

- [ ] **Step 1: Criar `lib/chart-theme.ts`**

```ts
// Paleta categórica — corresponde a --color-chart-1 .. --color-chart-5 do @beeads/tokens
export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
] as const;

export function chartColor(index: number) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

// Tipos comuns
export type ChartFormatter = (value: number | string) => string;

export const formatters = {
  number: (v: number) => v.toLocaleString("pt-BR"),
  currency: (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v),
  percent: (v: number) => `${(v * 100).toFixed(1)}%`,
  compact: (v: number) =>
    new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v),
};
```

- [ ] **Step 2: Criar `styles.css`**

```css
/* Ajustes leves para recharts dentro do design system beeads */
.recharts-tooltip-wrapper {
  outline: none !important;
}

.recharts-cartesian-axis-tick text,
.recharts-legend-item-text {
  fill: var(--color-muted-fg) !important;
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.recharts-cartesian-grid line {
  stroke: var(--color-border);
  opacity: 0.5;
}
```

### Task 10.3: ChartFrame (Card + header + footer)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/chart-frame.tsx`

- [ ] **Step 1: Criar `chart-frame.tsx`** — padrão repetido em todo dashboard

```tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@beeads/ui";
import { type ComponentProps, type ReactNode } from "react";

interface ChartFrameProps extends Omit<ComponentProps<typeof Card>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
}

export function ChartFrame({
  title,
  description,
  actions,
  footer,
  children,
  className,
  ...props
}: ChartFrameProps) {
  return (
    <Card data-slot="chart-frame" className={className} {...props}>
      {(title || description || actions) && (
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div className="flex flex-col gap-1">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && <div className="border-t border-border px-6 py-3 text-xs text-muted-fg">{footer}</div>}
    </Card>
  );
}
```

### Task 10.4: Tooltip custom

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/lib/tooltip.tsx`

- [ ] **Step 1: Criar `tooltip.tsx`**

```tsx
"use client";

import { type TooltipProps } from "recharts";
import { type ChartFormatter, formatters } from "./chart-theme";

export function ChartTooltip<T extends number | string, N extends string>({
  active,
  payload,
  label,
  formatter = formatters.number as ChartFormatter,
}: TooltipProps<T, N> & { formatter?: ChartFormatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-fg">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-muted-fg">{entry.name}:</span>
            <span className="font-medium text-fg">
              {formatter(entry.value as number)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Task 10.5: LineChart

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/line-chart.tsx`

- [ ] **Step 1: Criar `line-chart.tsx`**

```tsx
"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type ChartFormatter, chartColor, formatters } from "../lib/chart-theme";
import { ChartTooltip } from "../lib/tooltip";

export interface LineChartProps<T extends Record<string, number | string>> {
  data: T[];
  xKey: keyof T;
  series: Array<{ key: keyof T; label: string }>;
  height?: number;
  yFormatter?: ChartFormatter;
}

export function LineChart<T extends Record<string, number | string>>({
  data,
  xKey,
  series,
  height = 300,
  yFormatter = formatters.compact,
}: LineChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey as string} />
        <YAxis tickFormatter={yFormatter} />
        <Tooltip content={<ChartTooltip formatter={yFormatter} />} />
        {series.map((s, i) => (
          <Line
            key={s.key as string}
            type="monotone"
            dataKey={s.key as string}
            name={s.label}
            stroke={chartColor(i)}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
```

### Task 10.6: AreaChart

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/area-chart.tsx`

- [ ] **Step 1: Criar `area-chart.tsx`**

```tsx
"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type ChartFormatter, chartColor, formatters } from "../lib/chart-theme";
import { ChartTooltip } from "../lib/tooltip";

export interface AreaChartProps<T extends Record<string, number | string>> {
  data: T[];
  xKey: keyof T;
  series: Array<{ key: keyof T; label: string }>;
  height?: number;
  yFormatter?: ChartFormatter;
}

export function AreaChart<T extends Record<string, number | string>>({
  data,
  xKey,
  series,
  height = 300,
  yFormatter = formatters.compact,
}: AreaChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key as string} id={`grad-${s.key as string}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor(i)} stopOpacity={0.4} />
              <stop offset="95%" stopColor={chartColor(i)} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey as string} />
        <YAxis tickFormatter={yFormatter} />
        <Tooltip content={<ChartTooltip formatter={yFormatter} />} />
        {series.map((s, i) => (
          <Area
            key={s.key as string}
            type="monotone"
            dataKey={s.key as string}
            name={s.label}
            stroke={chartColor(i)}
            fill={`url(#grad-${s.key as string})`}
            strokeWidth={2}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
```

### Task 10.7: BarChart

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/bar-chart.tsx`

- [ ] **Step 1: Criar `bar-chart.tsx`**

```tsx
"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type ChartFormatter, chartColor, formatters } from "../lib/chart-theme";
import { ChartTooltip } from "../lib/tooltip";

export interface BarChartProps<T extends Record<string, number | string>> {
  data: T[];
  xKey: keyof T;
  series: Array<{ key: keyof T; label: string }>;
  height?: number;
  yFormatter?: ChartFormatter;
  stacked?: boolean;
}

export function BarChart<T extends Record<string, number | string>>({
  data,
  xKey,
  series,
  height = 300,
  yFormatter = formatters.compact,
  stacked = false,
}: BarChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey as string} />
        <YAxis tickFormatter={yFormatter} />
        <Tooltip cursor={{ fill: "var(--color-muted)", opacity: 0.3 }} content={<ChartTooltip formatter={yFormatter} />} />
        {series.map((s, i) => (
          <Bar
            key={s.key as string}
            dataKey={s.key as string}
            name={s.label}
            fill={chartColor(i)}
            stackId={stacked ? "a" : undefined}
            radius={stacked ? 0 : [4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
```

### Task 10.8: MultiLineChart (dual-axis, dash patterns — replica ComparisonChart)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/multi-line-chart.tsx`

- [ ] **Step 1: Criar `multi-line-chart.tsx`**

```tsx
"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type ChartFormatter, chartColor, formatters } from "../lib/chart-theme";
import { ChartTooltip } from "../lib/tooltip";

export interface MultiLineSeries<T> {
  key: keyof T;
  label: string;
  axis?: "left" | "right";
  dash?: "solid" | "dashed" | "dotted";
}

export interface MultiLineChartProps<T extends Record<string, number | string>> {
  data: T[];
  xKey: keyof T;
  series: MultiLineSeries<T>[];
  height?: number;
  leftFormatter?: ChartFormatter;
  rightFormatter?: ChartFormatter;
}

const dashMap = { solid: "0", dashed: "6 4", dotted: "2 4" };

export function MultiLineChart<T extends Record<string, number | string>>({
  data,
  xKey,
  series,
  height = 320,
  leftFormatter = formatters.compact,
  rightFormatter = formatters.compact,
}: MultiLineChartProps<T>) {
  const hasRight = series.some((s) => s.axis === "right");

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey as string} />
        <YAxis yAxisId="left" tickFormatter={leftFormatter} />
        {hasRight && <YAxis yAxisId="right" orientation="right" tickFormatter={rightFormatter} />}
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        {series.map((s, i) => (
          <Line
            key={s.key as string}
            yAxisId={s.axis ?? "left"}
            type="monotone"
            dataKey={s.key as string}
            name={s.label}
            stroke={chartColor(i)}
            strokeWidth={2}
            strokeDasharray={dashMap[s.dash ?? "solid"]}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Task 10.9: DonutChart

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/donut-chart.tsx`

- [ ] **Step 1: Criar `donut-chart.tsx`**

```tsx
"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { type ChartFormatter, chartColor, formatters } from "../lib/chart-theme";
import { ChartTooltip } from "../lib/tooltip";

export interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  formatter?: ChartFormatter;
}

export function DonutChart({ data, height = 280, formatter = formatters.number }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        <Legend />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={chartColor(i)} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### Task 10.10: FunnelChart (replica FunnelChart de central-de-dados — 4-stage com drop %)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/funnel-chart.tsx`

- [ ] **Step 1: Criar `funnel-chart.tsx`**

```tsx
"use client";

import { type ChartFormatter, formatters } from "../lib/chart-theme";

export interface FunnelStage {
  label: string;
  value: number;
}

export interface FunnelChartProps {
  stages: FunnelStage[];
  formatter?: ChartFormatter;
}

export function FunnelChart({ stages, formatter = formatters.number }: FunnelChartProps) {
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const prev = i > 0 ? stages[i - 1]!.value : null;
        const drop = prev ? 1 - stage.value / prev : null;
        const width = (stage.value / max) * 100;
        // dropColor: verde (drop ≤ 0.2), ambar (drop ≤ 0.5), vermelho (drop > 0.5)
        const dropColor =
          drop == null
            ? "text-muted-fg"
            : drop <= 0.2
              ? "text-ok"
              : drop <= 0.5
                ? "text-warn"
                : "text-err";
        return (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{stage.label}</span>
              <div className="flex items-center gap-3">
                <span>{formatter(stage.value)}</span>
                {drop != null && (
                  <span className={dropColor}>
                    ↓ {formatters.percent(drop)}
                  </span>
                )}
              </div>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-md bg-muted">
              <div
                className="h-full rounded-md bg-accent transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Task 10.11: HeatmapTable (matriz categórica colorida — replica DemoHeatmap)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/heatmap-table.tsx`

- [ ] **Step 1: Criar `heatmap-table.tsx`**

```tsx
"use client";

import { type ChartFormatter, formatters } from "../lib/chart-theme";

export interface HeatmapCell {
  row: string;
  col: string;
  value: number | null;
  /** Marca célula com sample insuficiente (renderizada cinza) */
  insufficient?: boolean;
}

export interface HeatmapTableProps {
  rows: string[];
  cols: string[];
  cells: HeatmapCell[];
  /** Mediana usada como ponto de comparação. Default: calcula da própria matriz. */
  median?: number;
  /** Direção: "lower-better" (verde abaixo da mediana) ou "higher-better" (verde acima) */
  direction?: "lower-better" | "higher-better";
  formatter?: ChartFormatter;
}

export function HeatmapTable({
  rows,
  cols,
  cells,
  median,
  direction = "lower-better",
  formatter = formatters.number,
}: HeatmapTableProps) {
  const validValues = cells.filter((c) => c.value != null && !c.insufficient).map((c) => c.value!);
  const med = median ?? validValues.sort((a, b) => a - b)[Math.floor(validValues.length / 2)] ?? 0;

  function cellColor(value: number | null, insufficient?: boolean) {
    if (value == null || insufficient) return "bg-muted text-muted-fg";
    const ratio = value / med;
    const isGood =
      direction === "lower-better" ? ratio < 0.75 : ratio > 1.25;
    const isBad =
      direction === "lower-better" ? ratio > 1.5 : ratio < 0.5;
    if (isGood) return "bg-ok/20 text-fg";
    if (isBad) return "bg-err/20 text-fg";
    return "bg-card text-fg";
  }

  function getCell(row: string, col: string) {
    return cells.find((c) => c.row === row && c.col === col);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-border p-2 text-xs font-medium text-muted-fg" />
            {cols.map((c) => (
              <th key={c} className="border border-border p-2 text-xs font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <th className="border border-border p-2 text-left text-xs font-medium">{r}</th>
              {cols.map((c) => {
                const cell = getCell(r, c);
                return (
                  <td
                    key={c}
                    className={`border border-border p-2 text-center text-sm ${cellColor(cell?.value ?? null, cell?.insufficient)}`}
                  >
                    {cell?.value != null && !cell.insufficient ? formatter(cell.value) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Task 10.12: KpiCard (com delta e inverseDelta)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/kpi-card.tsx`

- [ ] **Step 1: Criar `kpi-card.tsx`**

```tsx
"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@beeads/ui";
import { type ChartFormatter, formatters } from "../lib/chart-theme";

export interface KpiCardProps {
  label: string;
  value: number | string;
  hint?: string;
  delta?: number | null;
  /** Para métricas onde menor é melhor (CPA, CPI, custo) — inverte cores do delta. */
  inverseDelta?: boolean;
  formatter?: ChartFormatter;
}

export function KpiCard({
  label,
  value,
  hint,
  delta,
  inverseDelta = false,
  formatter = formatters.number,
}: KpiCardProps) {
  const numericValue = typeof value === "number" ? formatter(value) : value;

  const positive = delta != null && delta > 0;
  const negative = delta != null && delta < 0;
  const isGood = inverseDelta ? negative : positive;
  const isBad = inverseDelta ? positive : negative;

  const deltaColor = isGood ? "text-ok" : isBad ? "text-err" : "text-muted-fg";
  const Icon = positive ? ArrowUp : negative ? ArrowDown : Minus;

  return (
    <Card data-slot="kpi-card">
      <CardContent className="space-y-1 p-4">
        <p className="text-xs text-muted-fg">{label}</p>
        <p className="font-display text-2xl font-semibold tracking-tight">{numericValue}</p>
        <div className="flex items-center gap-2 text-xs">
          {delta != null && (
            <span className={`inline-flex items-center gap-1 ${deltaColor}`}>
              <Icon className="h-3 w-3" />
              {formatters.percent(Math.abs(delta))}
            </span>
          )}
          {hint && <span className="text-muted-fg">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Task 10.13: KpiGrid (responsivo)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/kpi-grid.tsx`

- [ ] **Step 1: Criar `kpi-grid.tsx`**

```tsx
"use client";

import { type ComponentProps } from "react";
import { cn } from "@beeads/ui";

export function KpiGrid({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="kpi-grid"
      className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", className)}
      {...props}
    />
  );
}
```

### Task 10.14: PeriodPicker (presets + custom range)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/period-picker.tsx`

- [ ] **Step 1: Criar `period-picker.tsx`** — adaptado do central-de-dados, agora usando DatePicker do `@beeads/ui`

```tsx
"use client";

import { addDays, format, startOfMonth, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from "@beeads/ui";

export interface PeriodValue {
  from: Date;
  to: Date;
}

export interface PeriodPickerProps {
  value: PeriodValue;
  onChange: (next: PeriodValue) => void;
}

const today = () => new Date();

const presets: Array<{ label: string; build: () => PeriodValue }> = [
  { label: "Últimos 7 dias", build: () => ({ from: subDays(today(), 6), to: today() }) },
  { label: "Últimos 30 dias", build: () => ({ from: subDays(today(), 29), to: today() }) },
  { label: "Últimos 90 dias", build: () => ({ from: subDays(today(), 89), to: today() }) },
  { label: "Este mês", build: () => ({ from: startOfMonth(today()), to: today() }) },
  {
    label: "Mês passado",
    build: () => {
      const last = subMonths(today(), 1);
      return { from: startOfMonth(last), to: addDays(startOfMonth(today()), -1) };
    },
  },
];

export function PeriodPicker({ value, onChange }: PeriodPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 font-normal">
          <CalendarIcon className="h-4 w-4" />
          {format(value.from, "d MMM", { locale: ptBR })} – {format(value.to, "d MMM y", { locale: ptBR })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="flex flex-col gap-1 border-r border-border p-2">
            {presets.map((p) => (
              <Button
                key={p.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onChange(p.build());
                  setOpen(false);
                }}
              >
                {p.label}
              </Button>
            ))}
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
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Task 10.15: FilterBar (search + select padrão)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/components/filter-bar.tsx`

- [ ] **Step 1: Criar `filter-bar.tsx`**

```tsx
"use client";

import { Search } from "lucide-react";
import { type ComponentProps } from "react";
import { Input, cn } from "@beeads/ui";

export interface FilterBarProps extends ComponentProps<"div"> {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function FilterBar({
  className,
  searchPlaceholder = "Buscar…",
  searchValue,
  onSearchChange,
  children,
  ...props
}: FilterBarProps) {
  return (
    <div
      data-slot="filter-bar"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-fg" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-8"
        />
      </div>
      {children}
    </div>
  );
}
```

### Task 10.16: Barrel + build + commit

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/charts/src/index.ts`

- [ ] **Step 1: Criar `src/index.ts`**

```ts
// Frame
export { ChartFrame } from "./components/chart-frame";

// Charts básicos
export { LineChart, type LineChartProps } from "./components/line-chart";
export { AreaChart, type AreaChartProps } from "./components/area-chart";
export { BarChart, type BarChartProps } from "./components/bar-chart";
export { DonutChart, type DonutChartProps } from "./components/donut-chart";
export {
  MultiLineChart,
  type MultiLineChartProps,
  type MultiLineSeries,
} from "./components/multi-line-chart";

// Visualizações especiais
export { FunnelChart, type FunnelChartProps, type FunnelStage } from "./components/funnel-chart";
export { HeatmapTable, type HeatmapTableProps, type HeatmapCell } from "./components/heatmap-table";

// KPIs
export { KpiCard, type KpiCardProps } from "./components/kpi-card";
export { KpiGrid } from "./components/kpi-grid";

// Filtros
export { PeriodPicker, type PeriodPickerProps, type PeriodValue } from "./components/period-picker";
export { FilterBar, type FilterBarProps } from "./components/filter-bar";

// Theme
export { CHART_COLORS, chartColor, formatters } from "./lib/chart-theme";
```

- [ ] **Step 2: Build + commit**

```bash
pnpm install
pnpm --filter @beeads/charts typecheck
pnpm --filter @beeads/charts build
git add packages/charts
git commit -m "feat(charts): @beeads/charts with ChartFrame, Line/Area/Bar/Donut/MultiLine/Funnel/Heatmap, KpiCard+Grid, PeriodPicker, FilterBar"
```

---

# Fase 11 — Storybook (era Fase 9 no plano original)

**Objetivo:** Storybook 8 (Vite) com stories pra todos os componentes, com toggles light/dark, e usado como docs viva.

### Task 9.1: Scaffold Storybook app

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/apps/storybook/package.json`
- Create: `c:/Users/gusta/Projetos/beeads-ui/apps/storybook/tsconfig.json`
- Create: `c:/Users/gusta/Projetos/beeads-ui/apps/storybook/vite.config.ts`
- Create: `c:/Users/gusta/Projetos/beeads-ui/apps/storybook/.storybook/main.ts`
- Create: `c:/Users/gusta/Projetos/beeads-ui/apps/storybook/.storybook/preview.tsx`
- Create: `c:/Users/gusta/Projetos/beeads-ui/apps/storybook/src/globals.css`

- [ ] **Step 1: Criar `apps/storybook/package.json`**

```json
{
  "name": "@beeads-internal/storybook",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "storybook build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@beeads/tokens": "workspace:*",
    "@beeads/ui": "workspace:*",
    "lucide-react": "^1.16.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@storybook/addon-essentials": "^8.4.7",
    "@storybook/addon-themes": "^8.4.7",
    "@storybook/react-vite": "^8.4.7",
    "@storybook/test": "^8.4.7",
    "@tailwindcss/vite": "^4.0.0-beta.6",
    "@vitejs/plugin-react": "^5.0.6",
    "storybook": "^8.4.7",
    "tailwindcss": "^4.0.0-beta.6",
    "typescript": "^5.7.2",
    "vite": "^6.0.5"
  }
}
```

- [ ] **Step 2: Criar `apps/storybook/.storybook/main.ts`**

```ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-themes"],
  framework: { name: "@storybook/react-vite", options: {} },
};

export default config;
```

- [ ] **Step 3: Criar `apps/storybook/.storybook/preview.tsx`**

```tsx
import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../src/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
```

- [ ] **Step 4: Criar `apps/storybook/src/globals.css`**

```css
@import "@beeads/ui/styles.css";
```

- [ ] **Step 5: Criar `apps/storybook/vite.config.ts`**

```ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 6: Criar `apps/storybook/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": [".storybook/**/*", "stories/**/*", "src/**/*"]
}
```

### Task 9.2: Stories para Button (template)

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/apps/storybook/stories/Button.stories.tsx`

- [ ] **Step 1: Criar `Button.stories.tsx`**

```tsx
import { Button } from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Button> = {
  title: "Forms/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "accent", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: { control: "select", options: ["xs", "sm", "default", "lg", "icon"] },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { children: "Salvar" } };
export const Accent: Story = { args: { variant: "accent", children: "Confirmar" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Apagar" } };
export const Outline: Story = { args: { variant: "outline", children: "Cancelar" } };
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>Default</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
```

### Task 9.3: Stories para todos os outros componentes

> Esta task é volumosa porém repetitiva. Para cada componente das Fases 6-8, criar `apps/storybook/stories/<ComponentName>.stories.tsx` seguindo o padrão do Button.stories acima:
> - 1 story default
> - 1 story por variante (se tem CVA)
> - 1 story "AllVariants" / "AllStates" demonstrando combinações

- [ ] **Step 1: Criar stories** para: Input, Textarea, Label (combinados), Checkbox, Switch, RadioGroup, Select, Dialog, Sheet, Popover, Tooltip, DropdownMenu, AlertDialog, Card, Separator, Tabs, Accordion, Badge, Skeleton, Alert, Toaster.

Cada arquivo segue o padrão (exemplo Input):

```tsx
import { Input, Label } from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Input> = {
  title: "Forms/Input",
  component: Input,
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: "Digite seu nome" } };
export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="voce@beeads.com.br" />
    </div>
  ),
};
export const Disabled: Story = { args: { disabled: true, placeholder: "Desabilitado" } };
```

- [ ] **Step 2: Validar Storybook roda**

Run:
```bash
cd "c:/Users/gusta/Projetos/beeads-ui" ; pnpm install ; pnpm storybook
```
Expected: abre em http://localhost:6006 com todos os componentes navegáveis e toggle light/dark funcionando.

- [ ] **Step 3: Commit**

```bash
git add apps/storybook ; git commit -m "feat(storybook): scaffold + stories for all primitives"
```

---

# Fase 12 — CI + Publish inicial no npm

**Objetivo:** GitHub Actions rodando CI (lint+typecheck+test) e release via Changesets em merge pra main. Primeiro publish manual pra "reservar" os nomes no npm.

### Task 10.1: Criar org no npm e setar autenticação

- [ ] **Step 1: Criar org `@beeads` em npmjs.com**

Manual via web: https://www.npmjs.com/org/create → criar org `beeads` (Free plan).

- [ ] **Step 2: Login do npm CLI local**

Run: `npm login`
Expected: autentica usuário gucancado.

- [ ] **Step 3: Verificar acesso à org**

Run: `npm org ls beeads`
Expected: lista membros (você).

### Task 10.2: Workflow de CI

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/.github/workflows/ci.yml`

- [ ] **Step 1: Criar `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

### Task 10.3: Workflow de release via Changesets

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/.github/workflows/release.yml`

- [ ] **Step 1: Criar `.github/workflows/release.yml`**

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          registry-url: "https://registry.npmjs.org"
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
          version: pnpm version-packages
          commit: "chore: release packages"
          title: "chore: release packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 2: Criar token NPM e adicionar como secret**

Manual:
1. Em npmjs.com → Account → Access Tokens → Generate New Token (Granular: org `beeads`, write access)
2. Em github.com/gucancado/beeads-ui → Settings → Secrets → Actions → New repository secret → name `NPM_TOKEN`, value `npm_xxx...`

### Task 10.4: Criar repo no GitHub e push

- [ ] **Step 1: Criar repo público no GitHub**

Run:
```bash
cd "c:/Users/gusta/Projetos/beeads-ui" ; gh repo create gucancado/beeads-ui --public --source=. --remote=origin --description "Design system @beeads/* — tokens, fonts, ui"
```
Expected: cria repo + adiciona remote `origin`.

- [ ] **Step 2: Push inicial**

Run: `git push -u origin main`
Expected: branch main publicada.

### Task 10.5: Primeiro changeset + publish manual `0.1.0`

- [ ] **Step 1: Adicionar changeset inicial**

Run: `pnpm changeset`
- Selecionar `@beeads/tokens`, `@beeads/fonts`, `@beeads/ui` (todos minor).
- Mensagem: `Initial release of @beeads/* design system.`

- [ ] **Step 2: Bumpar versões**

Run: `pnpm version-packages`
Expected: bumpa cada pacote pra `0.1.0`, atualiza CHANGELOGs.

- [ ] **Step 3: Build final + publish**

Run: `pnpm release`
Expected: publica `@beeads/tokens@0.1.0`, `@beeads/fonts@0.1.0`, `@beeads/ui@0.1.0` em npmjs.com.

- [ ] **Step 4: Verificar no npm**

Run: `npm view @beeads/ui`
Expected: mostra metadados do pacote publicado.

- [ ] **Step 5: Commit + push**

```bash
git add . ; git commit -m "chore: release @beeads/tokens@0.1.0, @beeads/fonts@0.1.0, @beeads/ui@0.1.0" ; git push
```

---

# Fase 13 — Documentation (PRINCIPLES, CONTRIBUTING, READMEs por pacote, migration guide)

**Objetivo:** docs textuais que sustentam o DS — princípios de design, voice/tone, guia de contribuição, READMEs de cada pacote (visíveis em npmjs.com).

### Task 11.0: Coletar referências de estética via typeui

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/docs/.refs/typeui-mono.md`
- Create: `c:/Users/gusta/Projetos/beeads-ui/docs/.refs/typeui-editorial.md`
- Create: `c:/Users/gusta/Projetos/beeads-ui/docs/.refs/typeui-claude.md`
- Create: `c:/Users/gusta/Projetos/beeads-ui/docs/.refs/typeui-minimal.md`

- [ ] **Step 1: Criar diretório de refs (gitignored)**

```bash
mkdir -p "c:/Users/gusta/Projetos/beeads-ui/docs/.refs"
echo "docs/.refs/" >> "c:/Users/gusta/Projetos/beeads-ui/.gitignore"
```

- [ ] **Step 2: Pull das 4 estéticas relevantes**

Run:
```bash
cd "c:/Users/gusta/Projetos/beeads-ui/docs/.refs" ; npx typeui.sh pull mono --format design ; npx typeui.sh pull editorial --format design ; npx typeui.sh pull claude --format design ; npx typeui.sh pull minimal --format design
```
Expected: cria 4 arquivos `DESIGN.md` (renomear pra `typeui-<slug>.md` se vier com nome único).

- [ ] **Step 3: Ler os 4 arquivos como inspiração**

Não copiar literalmente — extrair: tom de escrita, estrutura de seções, vocabulário. Cruzar com a identidade beeads (honey + ink + paper + Fraunces + Geist Mono).

### Task 11.1: PRINCIPLES.md

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/docs/PRINCIPLES.md`

- [ ] **Step 1: Criar `docs/PRINCIPLES.md`**

```markdown
# Princípios de Design — beeads

## Identidade

**Caloroso, preciso, legível.**

- **Caloroso:** honey (#FFAE00) é a cor de accent. Aparece em CTAs, badges de destaque, focus rings. Não em superfícies grandes — não é cor de fundo.
- **Preciso:** monospace (Geist Mono) no corpo. Dá ar técnico, profissional, "ferramenta de trabalho". Não é fonte decorativa — é leiturável em listas, dados, configs.
- **Legível:** Fraunces nos títulos (display). Serif com personalidade, sem ser nostálgica. Comunica "feito com cuidado".

## Cores

- **honey** — accent único. Use pra: CTA principal, focus, link de destaque. NÃO use: fundo de tela, fundo de card, texto em parágrafo.
- **ink / paper** — preto/branco quase puros. Bases neutras. Tudo deve ter contraste AA mínimo contra estes.
- **ok / warn / err** — semânticos. Use só pra estados (sucesso, atenção, erro). Não use como cor decorativa.

## Tipografia

- **Hierarquia visual usa peso e tamanho**, não cor. Títulos em Fraunces 600+, corpo em Geist Mono 400.
- **Display (Fraunces)** — apenas em h1-h6, hero titles, números de destaque.
- **Mono (Geist Mono)** — tudo o resto. Sim, parágrafos também. É a personalidade do beeads.

## Spacing

- Múltiplos de 4 (0.25rem). Tailwind padrão.
- Densidade preferida: **compacta**. Apps beeads são ferramentas de trabalho, não landing pages.

## Componentes

- **Composição > customização.** Em vez de um Button com 30 props, temos Button + Slot pra qualquer estrutura por baixo.
- **Tokens, nunca valores hardcoded.** Se um componente novo precisa de uma cor, a cor vai em `@beeads/tokens` primeiro.
- **Acessibilidade não é opcional.** Todo componente interativo tem focus visível, suporta keyboard, anuncia estado pra screen readers.

## Quando criar algo novo

Antes de criar um componente novo no DS, pergunte:
1. Já existe um primitivo no DS que resolve isso composto? Geralmente sim.
2. Esse componente vai aparecer em **2+ apps**? Se não, é app-specific, fica no app.
3. A anatomia é estável (não vai mudar a cada uso)? Se não, não é primitivo — é layout custom.

## Voice & Tone (microcopy)

- **Direto.** "Salvar", não "Salvar alterações".
- **Português BR.** Não misturar inglês ("Save").
- **Ativo.** "Adicionar conta", não "Adição de conta".
- **Erros explicam o quê e o como.** Ruim: "Erro ao salvar". Bom: "Não foi possível salvar — verifique sua conexão e tente novamente."
```

### Task 11.2: CONTRIBUTING.md

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/docs/CONTRIBUTING.md`

- [ ] **Step 1: Criar `docs/CONTRIBUTING.md`**

```markdown
# Contribuindo com beeads-ui

## Como adicionar um componente novo

1. Antes de codar: confirma que o componente cumpre os critérios em `PRINCIPLES.md` (será usado em 2+ apps, anatomia estável).
2. Criar arquivo em `packages/ui/src/components/<kebab-name>.tsx`.
3. Seguir padrão do `button.tsx` (template canônico):
   - `"use client"` no topo
   - `cn()` de `../lib/utils`
   - `data-slot="<name>"` atribute
   - CVA quando há variantes
   - `@base-ui/react` para headless behavior
4. Exportar no barrel `packages/ui/src/index.ts`.
5. Story em `apps/storybook/stories/<Name>.stories.tsx`.
6. Teste de comportamento em `packages/ui/src/components/<name>.test.tsx` (apenas para lógica não-trivial).
7. Rodar `pnpm changeset` — adicionar `.changeset/*.md` descrevendo a mudança (minor: componente novo).
8. PR. CI rodará lint + typecheck + test + build.
9. Merge → CI cria "Release PR" via Changesets. Merge desse PR → publish automático.

## Mudando tokens

1. Editar `packages/tokens/src/theme.css`.
2. Mudança visual (cor, radius, font): patch ou minor.
3. Renomear/remover token: **major** (breaking).
4. Sempre `pnpm changeset` descrevendo o impacto visual nos apps.

## Mudanças que quebram API (major)

1. Documentar migração em `docs/migrations/v<X>-to-v<Y>.md` com busca/substituição automatizável.
2. Changeset marca como **major** no(s) pacote(s) afetado(s).
3. Apps consumidores migram quando quiserem (versão antiga continua acessível no npm).
```

### Task 11.3: README de cada pacote

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/tokens/README.md`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/fonts/README.md`
- Create: `c:/Users/gusta/Projetos/beeads-ui/packages/ui/README.md`

- [ ] **Step 1: Criar `packages/tokens/README.md`**

```markdown
# @beeads/tokens

Design tokens do design system beeads — CSS Tailwind v4 `@theme`.

## Uso

```bash
pnpm add @beeads/tokens
```

No `globals.css` do seu app:

```css
@import "@beeads/tokens/theme.css";
```

Pronto — você tem variáveis CSS: `--color-honey`, `--color-ink`, `--color-paper`, `--color-primary`, `--color-bg`, `--color-fg`, etc. Tailwind v4 expõe automaticamente como classes (`bg-honey`, `text-ink`, etc.).

## Dark mode

Adicione classe `.dark` ao `<html>` ou `<body>`. Tokens semânticos (`--color-bg`, `--color-fg`, `--color-card`, `--color-muted`, `--color-border`) trocam automaticamente. Use `next-themes` ou similar pra gerenciar o toggle.

## Tokens disponíveis

Veja `dist/theme.css` ou a documentação completa em https://github.com/gucancado/beeads-ui.
```

- [ ] **Step 2: Criar `packages/fonts/README.md`**

```markdown
# @beeads/fonts

Fontes do design system beeads — Fraunces (display) + Geist Mono (corpo) via `next/font/google`.

## Uso (Next.js)

```bash
pnpm add @beeads/fonts
```

No layout:

```tsx
import { fraunces, geistMono } from "@beeads/fonts";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Pronto — variáveis CSS `--font-fraunces` e `--font-geist-mono` ficam disponíveis. `@beeads/tokens` já configura `--font-display` e `--font-mono` apontando pra elas.

## Requisitos

- Next.js >= 14 (peerDependency).
- Para outros frameworks: copie a configuração de `Fraunces` e `Geist_Mono` direto.
```

- [ ] **Step 3: Criar `packages/ui/README.md`**

```markdown
# @beeads/ui

Componentes UI do design system beeads — primitivos sobre `@base-ui/react`.

## Uso

```bash
pnpm add @beeads/ui @beeads/tokens
```

No `globals.css`:

```css
@import "@beeads/ui/styles.css";
```

Em `app/layout.tsx`:

```tsx
import { ThemeProvider, Toaster } from "@beeads/ui";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Em qualquer componente:

```tsx
import { Button, Card, Dialog, DialogContent, DialogTrigger } from "@beeads/ui";

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir</Button>
  </DialogTrigger>
  <DialogContent>
    <p>Olá!</p>
  </DialogContent>
</Dialog>
```

## Componentes disponíveis

- **Forms:** Button, Input, Textarea, Label, Checkbox, Switch, RadioGroup, Select
- **Overlays:** Dialog, Sheet, Popover, Tooltip, DropdownMenu, AlertDialog
- **Layout:** Card, Separator, Tabs, Accordion
- **Feedback:** Badge, Skeleton, Alert, Toaster (`toast()`)
- **Utilities:** `cn()`, `ThemeProvider`, `useTheme()`

Veja Storybook (https://github.com/gucancado/beeads-ui) para variantes e exemplos.
```

### Task 11.4: Atualizar README root + commit

- [ ] **Step 1: Commit**

```bash
git add docs packages/*/README.md ; git commit -m "docs: PRINCIPLES, CONTRIBUTING, READMEs por pacote"
```

---

# Fase 14 — CLAUDE.md (global + repo)

**Objetivo:** documentar pro Claude (em qualquer projeto seu) que `@beeads/ui` é o DS padrão, e como editá-lo se ele estiver dentro do repo `beeads-ui`.

### Task 12.1: CLAUDE.md no repo `beeads-ui`

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-ui/CLAUDE.md`

- [ ] **Step 1: Criar `CLAUDE.md` no root**

```markdown
# beeads-ui — instruções pra agentes

Você está editando o **design system @beeads/***. Cada mudança aqui propaga pra todos os apps do ecossistema beeads quando eles atualizarem a versão.

## Regras

1. **Tokens primeiro.** Cores, fontes, spacing, radius — sempre via `@beeads/tokens` (CSS vars). Nunca hardcode em componentes (`#FFAE00` é proibido; `var(--color-honey)` ou classe `bg-honey` é o caminho).
2. **Componentes referenciam só tokens semânticos** (`--color-bg`, `--color-fg`, `--color-primary`, etc.), não brand (`--color-honey`) direto. Exceção: variantes "accent" podem usar honey explicitamente.
3. **Acessibilidade obrigatória:** focus visible, suporte a keyboard, ARIA correto. Use `@base-ui/react` pra qualquer behavior — não reinvente.
4. **Dark mode é não-negociável.** Componente novo deve funcionar em light **e** dark, validado no Storybook.
5. **Padrão de arquivo:** veja `packages/ui/src/components/button.tsx` — esse é o template. `"use client"`, `cn()`, `data-slot`, CVA quando há variantes.
6. **Story obrigatória:** todo componente exportado precisa de `apps/storybook/stories/<Name>.stories.tsx`.
7. **Changeset obrigatório:** toda mudança que afeta um pacote `@beeads/*` precisa de `pnpm changeset` antes do commit.

## Comandos

- `pnpm storybook` — docs viva em http://localhost:6006
- `pnpm test` — testes vitest
- `pnpm build` — build de todos pacotes
- `pnpm changeset` — registrar mudança pra release
- `pnpm release` — publish (só CI deve rodar em produção)

## Versionamento (Changesets)

- **patch:** bugfix, ajuste visual leve (sem mudar valor de token)
- **minor:** componente novo, prop nova opcional, variante nova, token novo
- **major:** rename de export, remover prop/variante, mudar valor de token estabelecido

Veja `docs/CONTRIBUTING.md` pra fluxo completo.

## NÃO faça

- ❌ Criar componentes app-specific aqui (dashboard charts, etc.) — esses ficam no app
- ❌ Adicionar deps pesadas (framer-motion, etc.) sem discussão
- ❌ Mudar tokens sem changeset major se for breaking
- ❌ Pular Storybook story
- ❌ Hardcode de cores/sizes em componentes
```

### Task 12.2: Atualizar CLAUDE.md global do usuário

**Files:**
- Modify: `C:\Users\gusta\.claude\CLAUDE.md`

- [ ] **Step 1: Adicionar bloco "Design System" no final do CLAUDE.md global**

Adicionar ao fim do arquivo:

```markdown
## Design System — @beeads/*

Todo app beeads (Bloquim, agente-semente, agentes-beeads, mercurio, futuros) usa `@beeads/ui` como design system padrão. Repo: `c:/Users/gusta/Projetos/beeads-ui` (público em github.com/gucancado/beeads-ui, npm scope `@beeads`).

**Pacotes:**
- `@beeads/tokens` — CSS Tailwind v4 `@theme` (cores honey/ink/paper, radius, breakpoints, dark mode via `.dark`)
- `@beeads/fonts` — Fraunces + Geist Mono via `next/font/google`
- `@beeads/ui` — primitivos sobre `@base-ui/react`: Button, Input, Textarea, Label, Checkbox, Switch, RadioGroup, Select, Dialog, Sheet, Popover, Tooltip, DropdownMenu, AlertDialog, Card, Separator, Tabs, Accordion, Badge, Skeleton, Alert, Toaster + utils `cn()`, `ThemeProvider`

**Como usar em qualquer app:**
```bash
pnpm add @beeads/tokens @beeads/fonts @beeads/ui
```
```css
/* globals.css */
@import "@beeads/ui/styles.css";
```
```tsx
import { Button, Card } from "@beeads/ui";
import { fraunces, geistMono } from "@beeads/fonts";
```

**Regras pra Claude em apps consumidores:**
- ✅ Importar componentes de `@beeads/ui`. Nunca rodar `npx shadcn add`.
- ✅ Cores via classes Tailwind (`bg-honey`, `text-fg`, `border-border`). Nunca hardcoded.
- ✅ Componente que não existe no DS: criar app-specific em `src/components/` **compondo** primitivos do DS. Se for genérico o suficiente pra outros apps, propor adicionar ao `@beeads/ui`.
- ❌ Não duplicar tokens (cores, radius) em `tailwind.config` do app — `@beeads/tokens/theme.css` já provê via Tailwind v4 `@theme`.

**Docs vivas:** Storybook em `pnpm storybook` dentro do repo `beeads-ui`.

**Princípios de design:** `c:/Users/gusta/Projetos/beeads-ui/docs/PRINCIPLES.md`.
```

- [ ] **Step 2: Commit no repo beeads-ui**

```bash
cd "c:/Users/gusta/Projetos/beeads-ui" ; git add CLAUDE.md ; git commit -m "docs: CLAUDE.md for agents editing the DS"
```

---

# Fase 15 — Validação 1: migrar `agentes-beeads`

**Objetivo:** primeiro consumidor real dos pacotes publicados. Substitui componentes locais por imports de `@beeads/ui`, confirma que tokens/fontes/dark mode funcionam. Captura aprendizados.

### Task 13.1: Instalar pacotes em agentes-beeads

**Files:**
- Modify: `c:/Users/gusta/Projetos/agentes-beeads/package.json`

- [ ] **Step 1: Instalar deps**

Run:
```bash
cd "c:/Users/gusta/Projetos/agentes-beeads" ; pnpm add @beeads/tokens @beeads/fonts @beeads/ui
```
Expected: instala versões 0.1.0 do npm.

- [ ] **Step 2: Remover deps duplicadas**

Run:
```bash
pnpm remove @base-ui/react class-variance-authority clsx tailwind-merge next-themes sonner
```
Expected: pacotes removidos (agora vêm via `@beeads/ui`).

### Task 13.2: Substituir CSS local pelo do DS

**Files:**
- Modify: `c:/Users/gusta/Projetos/agentes-beeads/src/app/globals.css`

- [ ] **Step 1: Substituir conteúdo de `globals.css`**

```css
@import "@beeads/ui/styles.css";

/* app-specific overrides ficam aqui (raros) */
```

### Task 13.3: Substituir fontes pelo `@beeads/fonts`

**Files:**
- Modify: `c:/Users/gusta/Projetos/agentes-beeads/src/app/layout.tsx`

- [ ] **Step 1: Atualizar imports de fonte em `layout.tsx`**

Antes (trecho relevante):
```tsx
import { Fraunces, Geist_Mono } from "next/font/google";
const fraunces = Fraunces({ /* ... */ });
const geistMono = Geist_Mono({ /* ... */ });
```

Depois:
```tsx
import { fraunces, geistMono } from "@beeads/fonts";
import { ThemeProvider, Toaster } from "@beeads/ui";
```

E envolver `{children}` com `<ThemeProvider>` + adicionar `<Toaster />`.

### Task 13.4: Substituir componentes locais

**Files:**
- Modify: `c:/Users/gusta/Projetos/agentes-beeads/src/components/ui/button.tsx` → deletar
- Modify: `c:/Users/gusta/Projetos/agentes-beeads/src/components/ui/card.tsx` → deletar
- Modify: `c:/Users/gusta/Projetos/agentes-beeads/src/components/ui/input.tsx` → deletar
- Modify: arquivos que importam desses componentes

- [ ] **Step 1: Buscar usages**

Run:
```bash
cd "c:/Users/gusta/Projetos/agentes-beeads" ; pnpm exec grep -rn "from \"@/components/ui/" src --include="*.tsx" --include="*.ts"
```

- [ ] **Step 2: Substituir imports**

Substituir todos `from "@/components/ui/button"` → `from "@beeads/ui"` (e equivalentes para card, input).

Aplica busca/substituição:
- `from "@/components/ui/button"` → `from "@beeads/ui"`
- `from "@/components/ui/card"` → `from "@beeads/ui"`
- `from "@/components/ui/input"` → `from "@beeads/ui"`

- [ ] **Step 3: Deletar arquivos locais agora não usados**

Run:
```bash
rm src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/input.tsx
```

- [ ] **Step 4: `lib/utils.ts` — substituir por re-export**

Substituir `src/lib/utils.ts` por:
```ts
export { cn } from "@beeads/ui";
```

### Task 13.5: Build e validação visual

- [ ] **Step 1: Buildar app**

Run: `pnpm build`
Expected: build passa, sem erros de tipo ou faltas de classe Tailwind.

- [ ] **Step 2: Rodar dev e validar visualmente**

Run: `pnpm dev`
Em http://localhost:3000:
- Botões parecem iguais ao de antes da migração
- Cards parecem iguais
- Fontes Fraunces (títulos) e Geist Mono (corpo) carregadas
- Toggle de dark mode funciona (se ainda não, adicionar um ThemeToggle de exemplo)

- [ ] **Step 3: Commit no agentes-beeads**

```bash
cd "c:/Users/gusta/Projetos/agentes-beeads" ; git add . ; git commit -m "refactor: migrate to @beeads/ui design system"
```

### Task 15.6: Capturar aprendizados

- [ ] **Step 1: Documentar problemas encontrados**

Em `c:/Users/gusta/Projetos/beeads-ui/docs/migrations/agentes-beeads-notes.md`, listar:
- O que faltava no `@beeads/ui` (componentes ou variantes que tive que recriar local)
- Tokens que faltavam (cores/sizes que estavam no app antigo e não no `@beeads/tokens`)
- DX issues (imports estranhos, tipos faltando, peer deps)

- [ ] **Step 2: Criar issues no repo beeads-ui pra cada gap encontrado**

Run pra cada gap:
```bash
cd "c:/Users/gusta/Projetos/beeads-ui" ; gh issue create --title "<gap>" --body "<contexto da migração agentes-beeads>"
```

---

# Fase 16 — Validação 2: `beeads-bloquim` (adoção progressiva, não big bang)

**Objetivo:** bloquim começa a consumir `@beeads/*` sem refazer os 50+ primitivos Radix locais. Tokens unificados, fontes, Toaster e adoção de Button/Card novos como pilotos. Resto migra organicamente em features futuras.

**Premissa crítica:** bloquim **continua funcionando exatamente como antes**. Não removemos primitivos Radix locais. Adoção é aditiva.

### Task 16.1: Instalar pacotes em bloquim

**Files:**
- Modify: `c:/Users/gusta/Projetos/beeads-bloquim/repo/artifacts/mindtask-app/package.json`

- [ ] **Step 1: Instalar deps**

Run:
```bash
cd "c:/Users/gusta/Projetos/beeads-bloquim/repo/artifacts/mindtask-app" ; pnpm add @beeads/tokens @beeads/fonts @beeads/ui @beeads/charts
```

- [ ] **Step 2: Confirmar que `@radix-ui/*` continua instalado** (sem `pnpm remove` — primitivos locais dependem)

Run: `pnpm list | grep radix-ui`
Expected: várias entradas `@radix-ui/*` continuam ativas.

### Task 16.2: Importar tokens beeads no globals

**Files:**
- Modify: `c:/Users/gusta/Projetos/beeads-bloquim/repo/artifacts/mindtask-app/src/index.css`

- [ ] **Step 1: No topo do `index.css`, adicionar import dos tokens beeads**

```css
@import "@beeads/tokens/theme.css";

/* CSS existente do bloquim continua abaixo */
```

- [ ] **Step 2: Mapear tokens HSL antigos do bloquim para vars beeads**

Identificar conflitos entre vars existentes (`--background`, `--foreground`, `--primary` em HSL) e as novas (`--color-bg`, `--color-fg`, `--color-primary` em OKLCH). Estratégia: manter as antigas como **aliases** das novas, até a migração progressiva substituir referências.

No topo de `index.css` (após o import):
```css
:root {
  /* Aliases compat: vars antigas do bloquim apontam para tokens beeads */
  --background: var(--color-bg);
  --foreground: var(--color-fg);
  --primary: var(--color-primary);
  --primary-foreground: var(--color-primary-fg);
  --card: var(--color-card);
  --card-foreground: var(--color-card-fg);
  --border: var(--color-border);
  --input: var(--color-input);
  --ring: var(--color-ring);
  --muted: var(--color-muted);
  --muted-foreground: var(--color-muted-fg);
  --accent: var(--color-accent);
  --accent-foreground: var(--color-accent-fg);
  --destructive: var(--color-destructive);
  --destructive-foreground: var(--color-destructive-fg);
}
```

**Resultado**: cor primary amber do bloquim agora vem do token honey beeads. Migração visual instantânea.

### Task 16.3: Aplicar fontes do design system

**Files:**
- Modify: `c:/Users/gusta/Projetos/beeads-bloquim/repo/artifacts/mindtask-app/src/main.tsx`

- [ ] **Step 1: Bloquim é Vite SPA — não usa next/font**. Importar fontes via Google Fonts no `index.html` ou via CSS `@import`. No `index.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Geist+Mono:wght@400;500;600&display=swap");
```

(Nota: `@beeads/fonts` é `next/font`-specific. Para Vite, usar Google Fonts diretamente.)

### Task 16.4: Adotar `<Toaster />` do `@beeads/ui` substituindo o local

**Files:**
- Modify: `c:/Users/gusta/Projetos/beeads-bloquim/repo/artifacts/mindtask-app/src/App.tsx` (ou onde estiver mounted o Toaster local)

- [ ] **Step 1: Substituir imports**

```tsx
// Antes
import { Toaster } from "@/components/ui/toaster";

// Depois
import { Toaster, toast } from "@beeads/ui";
```

- [ ] **Step 2: Testar uma toast** — chamar `toast.success("Migrado")` em alguma ação e confirmar visual coerente.

### Task 16.5: Piloto — usar Button do `@beeads/ui` em UMA tela nova

**Files:**
- Decidir uma tela menor de bloquim (ex: dialog de criar workspace, settings page) para adotar Button novo.

- [ ] **Step 1: Naquela tela, substituir `import { Button } from "@/components/ui/button"` por `import { Button } from "@beeads/ui"`**

- [ ] **Step 2: Validar visualmente que parece igual ou melhor**

- [ ] **Step 3: Se OK, deixar como referência pra equipe** — próximas features novas usam `@beeads/ui` por padrão.

### Task 16.6: Build, smoke test e commit

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: build passa sem erros novos.

- [ ] **Step 2: Dev**

Run: `pnpm dev`
Smoke test: login, navegar entre páginas, criar task. Verificar que nada quebrou.

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/gusta/Projetos/beeads-bloquim" ; git add . ; git commit -m "feat: adopt @beeads/* design system (tokens + fonts + Toaster, Button pilot)"
```

### Task 16.7: Roadmap de migração progressiva

**Files:**
- Create: `c:/Users/gusta/Projetos/beeads-bloquim/MIGRATION_TO_BEEADS_UI.md`

- [ ] **Step 1: Criar documento** listando próximos primitivos do bloquim a migrarem (em ordem de prioridade):

```markdown
# Migração bloquim → @beeads/ui

Tokens, fontes e Toaster já migrados (2026-XX-XX). Próximas etapas:

## Próximos primitivos a substituir (sob demanda):
- [ ] Button → @beeads/ui (piloto feito em SettingsPage)
- [ ] Card → @beeads/ui
- [ ] Dialog → @beeads/ui (anatomia diferente: Backdrop+Popup, requer refactor)
- [ ] Input → @beeads/ui
- [ ] Select → @beeads/ui (diferenças de API)
- [ ] DropdownMenu → @beeads/ui
- [ ] Sheet/Drawer → @beeads/ui
- [ ] Tabs → @beeads/ui
- [ ] Avatar, Breadcrumb, Pagination, Skeleton → @beeads/ui (low effort)

## Mantidos locais (sem migração):
- Sidebar (custom 22KB, app-specific)
- TaskTable, MapsCanvas, ReactFlow nodes (app-specific)
- TipTap editor (app-specific)
- EditableTitle, AutosaveIndicator (app-specific)

## Regra: features NOVAS usam @beeads/ui. Refactor de features existentes é oportunístico.
```

---

# Fase 17 — Validação 3: `beeads-central-de-dados` (migração completa)

**Objetivo:** central-de-dados migra Tailwind v3 → consome DS completo. Substitui DailyChart/ComparisonChart/FunnelChart/DemoHeatmap/KpiCard locais pelos do `@beeads/charts`. Adota identidade beeads (honey accent substitui pink #ff6b9d).

### Task 17.1: Instalar pacotes

**Files:**
- Modify: `c:/Users/gusta/Projetos/beeads-central-de-dados/web/package.json`

- [ ] **Step 1: Instalar**

Run:
```bash
cd "c:/Users/gusta/Projetos/beeads-central-de-dados/web" ; pnpm add @beeads/tokens @beeads/fonts @beeads/ui @beeads/charts
```

### Task 17.2: Tailwind v3 preset

**Files:**
- Modify: `c:/Users/gusta/Projetos/beeads-central-de-dados/web/tailwind.config.ts`

- [ ] **Step 1: Substituir conteúdo do `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  presets: [require("@beeads/tokens/preset.cjs")],
  content: ["./src/**/*.{ts,tsx}"],
  // overrides locais (mínimos — preset já cobre quase tudo)
};

export default config;
```

### Task 17.3: Importar tokens no globals + adotar dark mode coeso

**Files:**
- Modify: `c:/Users/gusta/Projetos/beeads-central-de-dados/web/src/app/globals.css`

- [ ] **Step 1: Substituir globals.css**

```css
@import "@beeads/tokens/theme.css";
@import "@beeads/ui/styles.css";
@import "@beeads/charts/styles.css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 2: Atualizar `<html>` em `app/layout.tsx`** — central-de-dados era dark-only. Manter `class="dark"` fixo, mas usando tokens unificados:

```tsx
<html lang="pt-BR" className="dark">
```

### Task 17.4: Aplicar fontes Fraunces + Geist Mono

**Files:**
- Modify: `c:/Users/gusta/Projetos/beeads-central-de-dados/web/src/app/layout.tsx`

- [ ] **Step 1: Adotar `@beeads/fonts`**

```tsx
import { fraunces, geistMono } from "@beeads/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${fraunces.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Task 17.5: Substituir KpiCard local por `@beeads/charts/KpiCard`

**Files:**
- Modify: arquivos que importam `@/components/KpiCard`
- Delete: `c:/Users/gusta/Projetos/beeads-central-de-dados/web/src/components/KpiCard.tsx`
- Delete: `c:/Users/gusta/Projetos/beeads-central-de-dados/web/src/components/KpiGrid.tsx`

- [ ] **Step 1: Buscar imports**

Run:
```bash
cd "c:/Users/gusta/Projetos/beeads-central-de-dados/web" ; pnpm exec grep -rn "from \"@/components/KpiCard\"\|from \"@/components/KpiGrid\"" src
```

- [ ] **Step 2: Substituir todos**

`from "@/components/KpiCard"` → `from "@beeads/charts"`
`from "@/components/KpiGrid"` → `from "@beeads/charts"`

- [ ] **Step 3: Deletar arquivos locais**

```bash
rm src/components/KpiCard.tsx src/components/KpiGrid.tsx
```

### Task 17.6: Substituir DailyChart por `@beeads/charts/AreaChart` + `ChartFrame`

**Files:**
- Modify: arquivos que importam `@/components/DailyChart`
- Delete: `c:/Users/gusta/Projetos/beeads-central-de-dados/web/src/components/DailyChart.tsx`

- [ ] **Step 1: Padrão de substituição**

Substituir uso por:
```tsx
import { AreaChart, ChartFrame } from "@beeads/charts";

<ChartFrame title="Spend vs Results" description="Últimos 30 dias">
  <AreaChart
    data={dailyData}
    xKey="date"
    series={[{ key: "spend", label: "Spend" }, { key: "results", label: "Results" }]}
  />
</ChartFrame>
```

- [ ] **Step 2: Deletar DailyChart local**

### Task 17.7: Substituir ComparisonChart por `MultiLineChart`

- [ ] **Step 1: Padrão**

```tsx
import { MultiLineChart, ChartFrame } from "@beeads/charts";

<ChartFrame title="Comparação de entidades">
  <MultiLineChart
    data={timeSeriesData}
    xKey="date"
    series={entities.map((e, i) => ({
      key: e.id,
      label: e.name,
      axis: i % 2 === 0 ? "left" : "right",
      dash: i < 2 ? "solid" : i < 4 ? "dashed" : "dotted",
    }))}
  />
</ChartFrame>
```

- [ ] **Step 2: Deletar ComparisonChart local**

### Task 17.8: Substituir FunnelChart e DemoHeatmap

- [ ] **Step 1: FunnelChart**

```tsx
import { FunnelChart } from "@beeads/charts";

<FunnelChart
  stages={[
    { label: "Impressions", value: 1_000_000 },
    { label: "Clicks", value: 25_000 },
    { label: "Leads", value: 1_500 },
    { label: "Conversions", value: 280 },
  ]}
/>
```

- [ ] **Step 2: HeatmapTable** (substitui DemoHeatmap)

```tsx
import { HeatmapTable } from "@beeads/charts";

<HeatmapTable
  rows={["18-24", "25-34", "35-44", "45+"]}
  cols={["M", "F", "Outros"]}
  cells={cells}
  direction="lower-better"
  formatter={(v) => `R$ ${v.toFixed(2)}`}
/>
```

- [ ] **Step 3: Deletar arquivos locais**

### Task 17.9: PeriodPicker e FilterBar do `@beeads/charts`

**Files:**
- Modify: arquivos que importam `@/components/PeriodPicker`, `@/components/FilterBar`
- Delete: ambos locais

- [ ] **Step 1: Substituir imports** para `from "@beeads/charts"`. APIs são compatíveis (mesmos campos: from/to no PeriodPicker, search no FilterBar).

### Task 17.10: Build + smoke test + commit

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: passa sem erros.

- [ ] **Step 2: Dev — smoke test visual**

Run: `pnpm dev`
Em http://localhost:3000:
- Páginas `/meta-ads`, `/google-ads`, `/demografia`, `/alertas` rendem
- Charts (Area, MultiLine, Funnel, Heatmap) visualmente coerentes com novo accent honey
- Dark mode mantido (única identidade do central-de-dados)
- KPIs com delta + inverseDelta corretos

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/gusta/Projetos/beeads-central-de-dados" ; git add . ; git commit -m "refactor: migrate to @beeads/* design system + charts (Tailwind v3 preset, identidade unificada honey)"
```

---

## Critérios de aceite finais

**Publicação npm:**
- [ ] `npm view @beeads/tokens` retorna metadados (publicado no npm público)
- [ ] `npm view @beeads/fonts` idem
- [ ] `npm view @beeads/ui` idem
- [ ] `npm view @beeads/charts` idem

**DS interno:**
- [ ] `pnpm storybook` no repo beeads-ui mostra os ~35 componentes UI + ~12 de charts navegáveis
- [ ] Toggle light/dark no Storybook funciona pra todos os componentes UI
- [ ] CI verde em main (lint + typecheck + test + build para todos os pacotes)
- [ ] `docs/PRINCIPLES.md` documentando identidade visual
- [ ] `CLAUDE.md` no repo `beeads-ui` orientando edição do DS

**Apps validados (3 targets):**
- [ ] `agentes-beeads` rodando consumindo `@beeads/ui@0.1.0` + `@beeads/charts@0.1.0`, sem componentes UI duplicados localmente
- [ ] `beeads-bloquim` rodando com `@beeads/tokens` + `@beeads/fonts` + `<Toaster />` do DS + Button piloto migrado. Primitivos Radix locais continuam funcionando (não removidos). Roadmap de migração progressiva documentado em `MIGRATION_TO_BEEADS_UI.md`.
- [ ] `beeads-central-de-dados` rodando em Tailwind v3 via `@beeads/tokens/preset.cjs`. KpiCard/DailyChart/ComparisonChart/FunnelChart/DemoHeatmap locais removidos, substituídos por `@beeads/charts`. Identidade visual unificada (honey accent substitui pink).

**Meta (Claude awareness):**
- [ ] `CLAUDE.md` global atualizado com bloco do DS — aplica em todos os apps automaticamente

---

## Notas para o executor

- **Ordem das fases é estrita**: Fase 2 depende de Fase 1, Fase 4+ dependem de Fase 2, etc.
- **Commit frequente**: cada Task é um commit independente. Não acumule.
- **Não pule testes**: o teste do `cn()` e do Button são exemplos canônicos — siga TDD red→green→commit.
- **Storybook é a fonte de verdade visual**: se um componente parece estranho lá, é porque está estranho. Conserte antes de avançar.
- **Mudanças no plano**: se descobrir algo durante execução que invalide uma decisão, pare e proponha ao usuário (`gustavo.azvd@gmail.com`) antes de improvisar.

### Verification protocol (obrigatório antes de cada commit `feat(...)`)

Invocar `superpowers:verification-before-completion` ou executar manualmente:

```bash
cd "c:/Users/gusta/Projetos/beeads-ui"
pnpm --filter @beeads/ui typecheck   # ou outro pacote conforme a task
pnpm --filter @beeads/ui test
pnpm --filter @beeads/ui build
```

Os 3 devem estar verdes. Se algum falhar: corrigir, repetir, **não** commitar com falha.

### Quando consultar `typeui-fundamentals`

- **Antes de codar componente novo**: ler `ui-principles.md` (hierarquia, layout, spacing).
- **Componente interativo** (Button, Switch, Tabs, etc.): ler `ux-principles.md` (estados de controle: default/hover/focus/active/disabled/loading/error/success/empty) e `accessibility.md` (focus, keyboard, touch targets).
- **Componente com texto** (Card, Alert, Dialog): ler `typography-principles.md` (escala, measure, hierarquia).
- **Decisão de cor/contraste**: ler `accessibility.md` seção contrast ratios (mínimo AA: 4.5:1 corpo, 3:1 texto grande).

A regra de **conflict resolution** da skill é: design system (nosso) > fundamentals > vertical. **Accessibility é não-negociável em qualquer nível**.
