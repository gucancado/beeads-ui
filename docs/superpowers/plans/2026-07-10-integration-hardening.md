# Integration Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Endurecer a fronteira DS↔apps (manifesto de classes ui+charts, vars.css pro Tailwind v3, fonts framework-agnostic) e pilotar no bloquim com deploy em produção + smoke test.

**Architecture:** No DS, um script de build extrai literais de string do dist pra um `classlist.txt` versionado (com gate de sentinelas), o `copy-assets` injeta `@source "./classlist.txt"` nos styles.css de ui E charts, tokens ganha `vars.css` puro e fonts ganha `google.css`. No bloquim, bump + adoção dos artefatos novos + correção do boundary do SidebarProvider pra habilitar o trigger mobile.

**Tech Stack:** Node scripts (ESM), tsup, changesets, Tailwind v4 (Vite no bloquim), pnpm 11, Coolify API.

**Spec:** `docs/superpowers/specs/2026-07-10-integration-hardening-design.md` (emendado pós-revisão adversarial)

## Global Constraints

- Sentinelas obrigatórias no classlist — ui: `h-svh`, `max-w-[85vw]`, `data-[checked]:bg-primary`; charts: `3xl:grid-cols-6`. Script FALHA (exit≠0) se ausentes.
- `@import` externo do Google Fonts deve terminar ANTES do primeiro seletor no CSS final do bloquim (senão o browser descarta).
- Bloquim: Dockerfile usa **pnpm 11.4.0** — lockfile regenerado com pnpm 11. Gate de typecheck é RELATIVO (baseline ~71 erros tsc pré-existentes; deploy usa vite build).
- Bloquim: branch de feature; merge em master SÓ na fase de deploy (Task 10), com gate de segurança do estado do master.
- DS: changeset por pacote alterado (4 minors). `pnpm lint && pnpm typecheck && pnpm test && pnpm build` verdes antes de cada commit no DS.
- Working dirs: DS = `c:/Users/gusta/Projetos/beeads-ui` (branch `feat/integration-hardening`); bloquim = `c:/Users/gusta/Projetos/beeads-bloquim/repo` (branch `feature/ds-integration-hardening` a partir de `master`).

---

### Task 1: gen-classlist.mjs + injeção @source em ui e charts

**Files:**
- Create: `scripts/gen-classlist.mjs`
- Modify: `scripts/copy-assets.mjs` (SOURCE_INJECTION_TARGETS)
- Modify: `packages/ui/package.json` (build script + exports)
- Modify: `packages/charts/package.json` (build script + exports)

**Interfaces:**
- Produces: `packages/{ui,charts}/dist/classlist.txt` (1 token/linha, dedupado, ordenado); export `"./classlist.txt": "./dist/classlist.txt"` nos 2 pacotes; `dist/styles.css` de ui e charts com `@source "./classlist.txt";` injetado no topo.

- [ ] **Step 1: Criar `scripts/gen-classlist.mjs`:**

```js
// Uso: node scripts/gen-classlist.mjs <pkgName>
// Extrai literais de string de packages/<pkg>/dist/index.{js,mjs} pra
// dist/classlist.txt — alvo estável de scan do Tailwind (v4 @source / v3 content).
// Superset é ok (tokens não-classe são ignorados pelo scanner); o gate é de
// COMPLETUDE: falha se as sentinelas do pacote não estiverem no manifesto.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = process.argv[2];
if (!pkg) {
  console.error("Uso: node gen-classlist.mjs <pkgName>");
  process.exit(1);
}

// Sentinelas: classes que DEVEM existir no manifesto — pega regressão de
// shape do dist (code-split, minificação agressiva) no build do DS.
const SENTINELS = {
  ui: ["h-svh", "max-w-[85vw]", "data-[checked]:bg-primary"],
  charts: ["3xl:grid-cols-6"],
};

const tokens = new Set();
const collect = (raw) => {
  for (const t of raw.split(/\s+/)) {
    if (t && t.length <= 200) tokens.add(t);
  }
};

for (const file of ["index.js", "index.mjs"]) {
  const src = await readFile(join(root, "packages", pkg, "dist", file), "utf8");
  // Literais com aspas duplas e simples (com escapes)
  for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) collect(m[1]);
  for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'/g)) collect(m[1]);
  // Chunks cozidos de template literals (remove interpolações ${...})
  for (const m of src.matchAll(/`((?:[^`\\]|\\.)*)`/g)) {
    collect(m[1].replace(/\$\{[^}]*\}/g, " "));
  }
}

const sorted = [...tokens].sort();
const missing = (SENTINELS[pkg] ?? []).filter((s) => !tokens.has(s));
if (missing.length > 0) {
  console.error(`gen-classlist(${pkg}): sentinelas ausentes: ${missing.join(", ")}`);
  process.exit(1);
}

const out = join(root, "packages", pkg, "dist", "classlist.txt");
await writeFile(out, `${sorted.join("\n")}\n`, "utf8");
console.log(`gen-classlist(${pkg}): ${sorted.length} tokens → dist/classlist.txt`);
```

- [ ] **Step 2: Atualizar `scripts/copy-assets.mjs`** — trocar o bloco `SOURCE_INJECTION_TARGETS` por:

```js
const SOURCE_INJECTION_TARGETS = {
  ui: {
    "styles.css": `@source "./classlist.txt";\n\n`,
  },
  charts: {
    "styles.css": `@source "./classlist.txt";\n\n`,
  },
};
```

(Manter o comentário do topo do arquivo, atualizando a explicação: o alvo agora é o manifesto estável, não os bundles.)

- [ ] **Step 3: Build scripts + exports.** Em `packages/ui/package.json`: `"build": "tsup && node ../../scripts/copy-assets.mjs ui styles.css && node ../../scripts/gen-classlist.mjs ui"` e adicionar em `exports`: `"./classlist.txt": "./dist/classlist.txt"`. Em `packages/charts/package.json`: `"build": "tsup && node ../../scripts/copy-assets.mjs charts styles.css && node ../../scripts/gen-classlist.mjs charts"` e o mesmo export.

- [ ] **Step 4: Verificar (o gate de sentinelas é o teste):**

Run: `pnpm --filter @beeads/ui build && pnpm --filter @beeads/charts build`
Expected: ambos terminam com `gen-classlist(<pkg>): N tokens → dist/classlist.txt`. Depois:
`node -e "const f=require('fs');const t=f.readFileSync('packages/ui/dist/classlist.txt','utf8');for(const s of ['h-svh','max-w-[85vw]','sticky']) if(!t.split('\n').includes(s)) throw new Error(s)"` → sem erro; head do `packages/ui/dist/styles.css` começa com `@source "./classlist.txt";`; idem charts.
Teste negativo do gate: `node scripts/gen-classlist.mjs fonts` (pacote sem dist/index.js) deve falhar com erro claro — não precisa tratar, é uso incorreto.

- [ ] **Step 5: Commit**

```bash
git add scripts packages/ui/package.json packages/charts/package.json
git commit -m "feat(build): classlist.txt como alvo estavel de scan Tailwind (ui+charts) com gate de sentinelas"
```

---

### Task 2: vars.css no @beeads/tokens

**Files:**
- Create: `packages/tokens/src/vars.css`
- Modify: `packages/tokens/src/theme.css`
- Modify: `packages/tokens/package.json` (export + build)

**Interfaces:**
- Produces: `@beeads/tokens/vars.css` (blocos `:root` e `.dark` puros); `theme.css` importa `./vars.css` e mantém o `@theme inline` — comportamento v4 idêntico.

- [ ] **Step 1:** Criar `packages/tokens/src/vars.css` movendo VERBATIM os blocos `:root { … }` (linhas ~4-75 do theme.css atual, incluindo comentários) e `.dark { … }` (linhas ~77-97). Nenhuma edição de valor.

- [ ] **Step 2:** Reescrever `packages/tokens/src/theme.css` pra:

```css
/* @beeads/tokens — Tailwind v4 entry: importa as CSS vars (vars.css) e as
   expõe como classes via @theme inline. Apps Tailwind v3 usam preset.cjs +
   @import "@beeads/tokens/vars.css" (não este arquivo). */
@import "tailwindcss";
@import "./vars.css";

/* Tailwind v4: @theme inline expõe as vars como classes utilitárias */
@theme inline {
  /* … bloco @theme inline EXISTENTE, inalterado … */
}
```

(O bloco `@theme inline` atual é mantido byte a byte; só os blocos `:root`/`.dark` saem.)

- [ ] **Step 3:** `packages/tokens/package.json`: adicionar `"./vars.css": "./dist/vars.css"` em `exports`; build vira `"tsup && node ../../scripts/copy-assets.mjs tokens theme.css preset.cjs vars.css"`.

- [ ] **Step 4: Verificar**

Run: `pnpm --filter @beeads/tokens build`
Expected: `dist/vars.css` existe com `:root` e `.dark`; `dist/theme.css` contém `@import "./vars.css";` e NÃO contém mais `--color-honey: oklch` fora do vars (grep `":root"` em dist/theme.css = 0 matches). Depois `pnpm build` completo na raiz — o build do Storybook (que compila Tailwind v4 sobre theme.css) é o gate funcional do import relativo.

- [ ] **Step 5: Commit**

```bash
git add packages/tokens
git commit -m "feat(tokens): vars.css puro pra consumidores Tailwind v3 (theme.css passa a importa-lo)"
```

---

### Task 3: google.css no @beeads/fonts

**Files:**
- Create: `packages/fonts/src/google.css`
- Modify: `packages/fonts/package.json` (export + build)

**Interfaces:**
- Produces: `@beeads/fonts/google.css` — carrega Fraunces + Geist Mono via Google Fonts e define `--font-fraunces`/`--font-geist-mono` (mesmos nomes que o entry next/font define).

- [ ] **Step 1:** Criar `packages/fonts/src/google.css`:

```css
/* @beeads/fonts — entry framework-agnostic (Vite, HTML puro, qualquer bundler).
   Apps Next devem preferir o entry JS (next/font, self-hosted).
   Perf: adicione <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   no HTML do app — @import externo é render-blocking. */
@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Geist+Mono:wght@400..700&display=swap");

:root {
  --font-fraunces: "Fraunces", Georgia, serif;
  --font-geist-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

- [ ] **Step 2:** `packages/fonts/package.json`: ler o arquivo primeiro; adicionar `"./google.css": "./dist/google.css"` em `exports` e ajustar o build pra `"tsup && node ../../scripts/copy-assets.mjs fonts google.css"`. Se `sideEffects` for `false`, mudar pra `["**/*.css"]` (padrão dos outros pacotes).

- [ ] **Step 3: Verificar**

Run: `pnpm --filter @beeads/fonts build`
Expected: `dist/google.css` existe; primeira linha não-comentário é o `@import url(`.

- [ ] **Step 4: Commit**

```bash
git add packages/fonts
git commit -m "feat(fonts): google.css framework-agnostic (Fraunces + Geist Mono via Google Fonts)"
```

---

### Task 4: Docs de integração + changesets

**Files:**
- Modify: `docs/CONTRIBUTING.md` (nova seção)
- Create: `.changeset/integration-hardening-{ui,charts,tokens,fonts}.md` (4 arquivos)

- [ ] **Step 1:** Em `docs/CONTRIBUTING.md`, adicionar seção `## Integração com Tailwind nos apps consumidores` (após "Mudando tokens"):

```markdown
## Integração com Tailwind nos apps consumidores

O DS entrega classes utilitárias dentro do JS publicado. Cada pacote com
componentes (`ui`, `charts`) publica um **manifesto estável** `dist/classlist.txt`
com todos os tokens de classe, e injeta `@source "./classlist.txt"` no próprio
`styles.css`.

**Tailwind v4 (recomendado):** importar os styles já basta na maioria dos bundlers:
`@import "@beeads/ui/styles.css";` (+ charts se usar). Se o bundler não propagar
`@source` relativo de dentro de node_modules (caso Next + Turbopack), adicione
explícito no globals.css do app:
`@source "../node_modules/@beeads/ui/dist/classlist.txt";` (+ o do charts).

**Tailwind v3 (legacy):** no tailwind.config: `presets: [require("@beeads/tokens/preset.cjs")]`
e `content` incluindo `"./node_modules/@beeads/ui/dist/classlist.txt"` (+ charts).
Pras CSS vars, importe `@import "@beeads/tokens/vars.css";` no globals.css —
NÃO copie os valores à mão (o theme.css é v4-only). O `@source` injetado nos
styles.css é at-rule desconhecida e inerte no pipeline v3.

**Fontes fora do Next:** `@import "@beeads/fonts/google.css";` no CSS global +
preconnect no HTML. Apps Next continuam com o entry JS (next/font).
```

- [ ] **Step 2:** Criar os 4 changesets (frontmatter + 1-3 bullets cada):
- `@beeads/ui` minor: "dist/classlist.txt (manifesto de classes pra scan do Tailwind, export `./classlist.txt`); styles.css passa a injetar `@source "./classlist.txt"` em vez dos bundles JS."
- `@beeads/charts` minor: "dist/classlist.txt (idem ui) e styles.css ganha `@source` injetado — corrige classes do charts (ex.: `3xl:grid-cols-6`) não geradas em apps que só escaneavam o ui."
- `@beeads/tokens` minor: "novo export `./vars.css` (CSS vars puras pra Tailwind v3 — substitui cópia manual); theme.css importa vars.css, comportamento v4 inalterado."
- `@beeads/fonts` minor: "novo export `./google.css` framework-agnostic (Fraunces + Geist Mono via Google Fonts + binding das vars `--font-*`)."

- [ ] **Step 3: Commit**

```bash
git add docs/CONTRIBUTING.md .changeset
git commit -m "docs: receita canonica de integracao Tailwind + changesets do hardening"
```

---

### Task 5: Verificação integrada do DS

- [ ] Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` — tudo verde.
- [ ] Inspecionar artefatos: `packages/ui/dist/classlist.txt` (sentinelas), `packages/charts/dist/classlist.txt` (`3xl:grid-cols-6`), `packages/tokens/dist/vars.css`, `packages/fonts/dist/google.css`, heads dos 2 `dist/styles.css` com `@source "./classlist.txt";`.
- [ ] `git log --oneline main..HEAD` coerente; corrigir qualquer vermelho e commitar.

---

### Task 6 (controller): Deploy do DS no npm

- [ ] `git push -u origin feat/integration-hardening` + `gh pr create` (base main) com resumo do spec.
- [ ] CI verde → `gh pr merge --merge`.
- [ ] Aguardar Release PR do changesets → conferir bumps (ui 0.7.0, charts 0.5.0, tokens 0.5.0, fonts 0.2.0) → `gh pr merge --squash`.
- [ ] Aguardar run de publish → `npm view @beeads/ui version` etc. confirmar as 4 versões novas. **Gate:** Task 7 só começa depois disso.

---

### Task 7: Bloquim — bumps + CSS/fonts/@source

**Files (repo `c:/Users/gusta/Projetos/beeads-bloquim/repo`, branch nova `feature/ds-integration-hardening` a partir de `master` atualizado):**
- Modify: `artifacts/mindtask-app/package.json`
- Modify: `artifacts/mindtask-app/src/index.css` (linhas 1-14)
- Modify: `artifacts/mindtask-app/index.html` (link Inter)
- Modify: `pnpm-lock.yaml` (via install)

**Interfaces:**
- Consumes: versões novas do npm (Task 6). Confirmar com `npm view` antes.

- [ ] **Step 1:** `artifacts/mindtask-app/package.json`: `@beeads/ui` → `^0.7.0`, `@beeads/tokens` → `^0.5.0`; REMOVER `@beeads/charts`; ADICIONAR `@beeads/fonts": "^0.2.0"`.

- [ ] **Step 2:** `src/index.css` — o head atual é:

```css
@import url("https://fonts.googleapis.com/css2?family=Fraunces:...&family=Geist+Mono:...&display=swap");
@import "reactflow/dist/style.css";
@import "@beeads/tokens/theme.css";
@import "@beeads/ui/styles.css";
@import "@beeads/charts/styles.css";
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
/* Bind beeads token --font-* placeholders... */
:root {
  --font-fraunces: 'Fraunces', Georgia, serif;
  --font-geist-mono: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

Vira:

```css
@import "@beeads/fonts/google.css";
@import "reactflow/dist/style.css";
@import "@beeads/tokens/theme.css";
@import "@beeads/ui/styles.css";
@import "tailwindcss";

/* Scan explícito das classes do DS (determinístico; a injeção via styles.css
   também existe, mas explícito > depende-do-bundler) */
@source "../node_modules/@beeads/ui/dist/classlist.txt";

@custom-variant dark (&:where(.dark, .dark *));
```

(Some a linha do charts e o bloco `:root` de binding — o google.css cobre. O restante do arquivo fica intacto.)

- [ ] **Step 3:** `index.html`: remover SÓ o `<link href="https://fonts.googleapis.com/css2?family=Inter...">`; manter os 2 preconnects.

- [ ] **Step 4:** Install + build com pnpm 11: `pnpm install` na raiz do repo (regenera lockfile), depois `pnpm --filter mindtask-app build` (conferir nome do filtro no package.json — é `@workspace/mindtask-app`).

- [ ] **Step 5: Asserts no artefato** (o CSS buildado fica em `artifacts/mindtask-app/dist/assets/*.css`):
- contém `h-svh`, `sticky`, `max-w-\[85vw\]` (escapado no CSS);
- o `@import url("https://fonts.googleapis` aparece ANTES do primeiro seletor;
- `artifacts/mindtask-app/node_modules/@beeads/ui/dist/classlist.txt` existe (symlink resolve);
- nenhum erro NOVO de tsc (rodar `pnpm --filter <app> exec tsc --noEmit | wc -l` antes e depois se necessário — gate relativo, baseline ~71).

- [ ] **Step 6: Commit**

```bash
git add artifacts/mindtask-app pnpm-lock.yaml
git commit -m "feat(ds): adota @beeads/ui 0.7 + fonts/google.css + classlist; remove charts orfao"
```

---

### Task 8: Bloquim — provider boundary + topbar mobile com SidebarTrigger

**Files:**
- Modify: `artifacts/mindtask-app/src/components/layout/AppLayout.tsx`

**Interfaces:**
- Consumes: `SidebarTrigger` (export novo do @beeads/ui ≥0.6). CRÍTICO (achado da revisão): hoje o `SidebarProvider` fecha ANTES do `<main>` — trigger fora dele crasha (`useSidebar must be used within a SidebarProvider`).

- [ ] **Step 1:** Ler o `AppLayout.tsx` inteiro. Reestruturar (o provider não injeta DOM — mover é seguro):

```tsx
// ANTES (estrutura):
// <div className="flex h-screen overflow-hidden bg-background">
//   <SidebarProvider persist="localStorage" storageKey="sidebar_collapsed">
//     <Sidebar>…</Sidebar>
//   </SidebarProvider>
//   <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
//     {children/páginas}
//   </main>
// </div>

// DEPOIS:
<SidebarProvider persist="localStorage" storageKey="sidebar_collapsed">
  <div className="flex h-screen overflow-hidden bg-background">
    <Sidebar>{/* conteúdo inalterado */}</Sidebar>
    <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
      <header className="flex shrink-0 items-center gap-2 border-b border-border p-2 md:hidden">
        <SidebarTrigger />
        <span className="font-display text-sm">bloquim</span>
      </header>
      <div className="flex-1 min-h-0 flex flex-col">{/* children/páginas inalterados */}</div>
    </main>
  </div>
</SidebarProvider>
```

Adicionar `SidebarTrigger` ao import de `@beeads/ui`. O wrapper `flex-1 min-h-0` evita a topbar clipar páginas full-height (ReactFlow) dentro do `overflow-hidden`.

- [ ] **Step 2: Verificar:** `pnpm --filter @workspace/mindtask-app build` verde; sem erro novo de tsc. Se possível `pnpm dev` rápido: desktop sem mudança visual; ~390px → topbar aparece, trigger abre o off-canvas, item de nav fecha.

- [ ] **Step 3: Commit**

```bash
git add artifacts/mindtask-app/src/components/layout/AppLayout.tsx
git commit -m "feat(layout): SidebarProvider envolve o shell + topbar mobile com SidebarTrigger"
```

---

### Task 9 (controller): Deploy do bloquim

- [ ] Push branch + `gh pr create` no repo `gucancado/beeads-bloquim` (base master).
- [ ] **Gate de segurança do master:** `git log origin/master --oneline -15` + comparar com o commit deployado em prod (Coolify API `GET /applications/<uuid>` mostra o commit; credenciais/uuid na memória `coolify_admin_access.md` do projeto bloquim). Se o master tiver trabalho não-deployado com migration/backfill manual → PARAR e escalar pro Gustavo.
- [ ] Merge do PR → trigger `POST http://5.78.199.192:8000/api/v1/deploy?uuid=<app_uuid>` (Bearer token — pode ter EXPIRADO ~2026-07-08; se 401 → gate humano: Gustavo rotaciona em UI → Security → API tokens).
- [ ] Poll `GET /api/v1/deployments/<deployment_uuid>` até `finished` (lembrar: `running:healthy` do Coolify engana — validar pelo site).

---

### Task 10 (controller): Smoke test em produção

Via MCP browser (chrome-logado) em `https://bloquim.beeads.com.br` (logado):
- [ ] Computed style: heading com `font-family` contendo `Fraunces`; corpo com `Geist Mono`.
- [ ] Desktop: página com conteúdo longo → sidebar permanece fixa no scroll; aside tem classes `sticky`/`h-svh`.
- [ ] Resize ~390×844: topbar mobile visível; clique no trigger abre off-canvas; clicar item de nav fecha e navega. Página de canvas (ReactFlow) não clipada pela topbar.
- [ ] Dialog abre centrado com backdrop (regressão do @source cobriria isso).
- [ ] Registrar resultados; falha → `git revert` no master + redeploy (sem migrations envolvidas).
