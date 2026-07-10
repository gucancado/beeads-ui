# Onda 2 de adoção — painel + agentes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Receita provada no piloto bloquim (spec `2026-07-10-integration-hardening-design.md`); este plano aplica a mesma nos 2 apps restantes.

**Goal:** Migrar painel.beeads.com.br e agentes.beeads.com.br pra @beeads/ui 0.7 + artefatos do hardening (classlist, vars.css), com deploy e smoke em produção.

**Architecture:** Cada app é um sub-pipeline independente (implementação → review → deploy → smoke). Painel (Tailwind v3/Next 15) troca a cópia manual de vars por `vars.css` e o content glob pelos classlists; agentes (Tailwind v4/Next 16) troca @source de arquivos pelo classlist, remove charts órfão e ganha trigger mobile com o provider realocado (mesmo fix crítico do bloquim).

## Global Constraints

- Versões alvo (npm, já publicadas): `@beeads/ui ^0.7.0`, `@beeads/charts ^0.5.0`, `@beeads/tokens ^0.5.0`, `@beeads/fonts ^0.2.0`.
- ui 0.7 torna a Sidebar off-canvas <768px: **todo app precisa de `SidebarTrigger` acessível no mobile OU tratamento mobile próprio** (painel tem o próprio — MobileChrome; agentes NÃO tem → ganha trigger).
- `SidebarTrigger`/`useSidebar` só funcionam DENTRO do `SidebarProvider` — verificar boundary antes de adicionar trigger (crash conhecido).
- Gate de build por app verde antes de commit; asserts de CSS gerado onde indicado.
- Branches: painel `feature/ds-onda2` a partir de `master`; agentes `feature/ds-onda2` a partir de `main`. Merge só na fase de deploy.

---

### Task 1: Painel — bump + vars.css + classlist + xFormatter

**Repo:** `c:/Users/gusta/Projetos/beeads-central-de-dados` (app em `web/`, pacote `@bcd/web`, Next 15 + Tailwind **v3**).

**Files:**
- Modify: `web/package.json` (bumps: ui `^0.7.0`, charts `^0.5.0`, tokens `^0.5.0`, fonts `^0.2.0`)
- Modify: `web/src/app/globals.css` (substituir bloco copiado de vars)
- Modify: `web/tailwind.config.ts` (content → classlists)
- Modify: `web/src/components/DailyChart.tsx`, `web/src/components/social/FollowersChart.tsx` (xFormatter)
- Modify: lockfile via `pnpm install`

**Steps:**

- [ ] **1. Bumps** no `web/package.json` + `pnpm install` na raiz do repo.

- [ ] **2. globals.css:** o arquivo tem um bloco `:root { … }` + `.dark { … }` (~linhas 13-100) **copiado à mão** do tokens v0.3.0 (comentário nas linhas 5-12 explica). Substituir o bloco inteiro (e o comentário de sync manual) por:

```css
/* CSS vars do DS — fonte única, sem cópia manual (tokens >=0.5.0) */
@import "@beeads/tokens/vars.css";
```

ATENÇÃO: antes de apagar, diffe o bloco copiado contra `web/node_modules/@beeads/tokens/dist/vars.css` — qualquer var EXTRA/divergente que o painel tenha adicionado localmente (não presente no vars.css) deve ser preservada num bloco `:root`/`.dark` separado rotulado "overrides locais". O `@import` deve ficar no TOPO do arquivo (antes dos `@tailwind base/components/utilities`), pois CSS @import precede outras regras.

- [ ] **3. tailwind.config.ts:** trocar a linha `"./node_modules/@beeads/ui/dist/**/*.{js,mjs}"` do `content` por:

```ts
    "./node_modules/@beeads/ui/dist/classlist.txt",
    "./node_modules/@beeads/charts/dist/classlist.txt",
```

(A do charts é NOVA — corrige o bug latente: classes que só existem no charts, ex. `3xl:grid-cols-6` do KpiGrid, nunca eram geradas no painel.)

- [ ] **4. xFormatter nos 2 charts temporais do DS:** em `DailyChart.tsx` e `FollowersChart.tsx`, os dados são pré-formatados com `label: fmtDateBR(d.date)` antes de passar pro chart. Trocar: passar a data crua como xKey e usar `xFormatter={formatters.dateShort}` (import `formatters` de `@beeads/charts` — os componentes já importam do pacote). Remover o map de pré-formatação. Ler cada arquivo antes; manter tooltipFormatter/yFormatter como estão.

- [ ] **5. Verificar:** `pnpm --filter @bcd/web build` verde. Asserts no CSS gerado (`web/.next/static/css/*.css`): contém `3xl\:grid-cols-6`, `h-svh`, `max-w-\[85vw\]`. Conferir que `web/src/components/AppSidebar.tsx` ainda passa `className="hidden md:flex h-full"` no `<Sidebar>` (mitigação do shell confinado — NÃO remover).

- [ ] **6. Commit:** `feat(ds): adota @beeads/ui 0.7 + vars.css + classlist (ui+charts) + xFormatter nos charts temporais`

---

### Task 2 (controller): Painel — deploy + smoke

- [ ] PR base master → CI → merge → trigger Coolify `POST /api/v1/deploy?uuid=huee78sf2zl6e062pia0ywhg` → validar pelo site (hash de assets muda).
- [ ] Smoke `https://painel.beeads.com.br` (browser logado): sidebar desktop intacta dentro do shell (h-full vencendo h-svh — NÃO pode estourar sobre o AppHeader); MobileChrome próprio segue funcionando em 390px; dashboard com KpiCards renderiza; gráfico Diário com ticks `dd/MM`; sem regressão visual óbvia de cores (vars.css == cópia antiga).

---

### Task 3: Agentes — bump + classlist + provider/trigger + remove charts órfão

**Repo:** `c:/Users/gusta/Projetos/agentes-beeads` (Next 16 + Tailwind **v4**, branch a partir de `main`).

**Files:**
- Modify: `package.json` (ui `^0.7.0`, tokens `^0.5.0`, fonts `^0.2.0`; REMOVER `@beeads/charts` — órfão: zero componentes usados, só CSS/@source)
- Modify: `src/app/globals.css`
- Modify: `src/components/app-sidebar.tsx` (provider sai daqui)
- Modify: `src/app/(app)/layout.tsx` (provider entra aqui)
- Modify: `src/components/topbar.tsx` (SidebarTrigger)
- Modify: lockfile via `pnpm install`

**Steps:**

- [ ] **1. Bumps + remoção do charts** no `package.json` + `pnpm install`.

- [ ] **2. globals.css:** remover `@import "@beeads/charts/styles.css";` e as 4 linhas `@source` atuais (2 de ui apontando pra index.js/index.mjs + 2 de charts); adicionar no lugar:

```css
@source "../../node_modules/@beeads/ui/dist/classlist.txt";
```

Manter o override local `@theme { --breakpoint-3xl: 1700px; }` como está.

- [ ] **3. Provider boundary (CRÍTICO — mesmo fix do bloquim):** hoje `app-sidebar.tsx` contém `<SidebarProvider persist="localStorage" storageKey="agentes_sidebar_collapsed">` envolvendo só a `<Sidebar>`. Um `SidebarTrigger` na Topbar (fora do provider) CRASHARIA. Mover o provider pra `src/app/(app)/layout.tsx` envolvendo o shell inteiro:

```tsx
// layout.tsx (estrutura atual: div.flex.h-screen > AppSidebar + div(col: Topbar + main))
<SidebarProvider persist="localStorage" storageKey="agentes_sidebar_collapsed">
  <div className="flex h-screen overflow-hidden bg-bg">
    <AppSidebar agents={agents} user={sidebarUser} />
    <div className="flex flex-col min-w-0 flex-1 h-screen">
      <Topbar />
      <main ...>...</main>
    </div>
  </div>
</SidebarProvider>
```

`app-sidebar.tsx` perde o provider (mantém `<Sidebar>` + conteúdo). O provider é client component — ok num layout server (client boundary com children). Ler os 2 arquivos antes; preservar props/handlers.

- [ ] **4. Topbar:** adicionar `<SidebarTrigger />` (import de `@beeads/ui`) como primeiro item do header. Se `topbar.tsx` for server component, o `SidebarTrigger` é client leaf — funciona; se der problema de boundary, adicionar `"use client"` no topo do topbar (é header estático, sem custo).

- [ ] **5. Verificar:** `pnpm build` verde (se falhar por env runtime, comparar com `main` via stash — gate relativo). Asserts no CSS gerado (`.next/static/css/*.css` ou chunks): `h-svh`, `sticky`, `max-w-\[85vw\]` presentes.

- [ ] **6. Commit:** `feat(ds): adota @beeads/ui 0.7 + classlist; provider no layout + SidebarTrigger na topbar; remove charts orfao`

---

### Task 4 (controller): Agentes — deploy + smoke

- [ ] PR base main → CI (se houver) → merge → trigger Coolify `POST /api/v1/deploy?uuid=kkmzz43bx8y2u8r9scmghp30` → validar pelo site.
- [ ] Smoke `https://agentes.beeads.com.br` (browser logado, SSO): desktop — sidebar sticky h-svh no shell h-screen, colapso continua funcionando (persist localStorage); 390px — sidebar some do fluxo, Topbar mostra trigger, off-canvas abre/navega/fecha; fontes Fraunces/Geist Mono intactas (next/font, não mudou).
