# Hardening da integração DS ↔ apps + piloto bloquim

Data: 2026-07-10. Origem: avaliação de arquitetura da relação beeads-ui ↔ bloquim/painel/agentes. Pipeline completo: spec → revisão → plano → implementação → **deploy → teste em produção**.

## Problema

A costura DS↔app é onde moram os bugs recorrentes:

1. **Scan de classes Tailwind frágil e divergente.** O DS entrega classes utilitárias dentro do JS do dist. Hoje: o `copy-assets.mjs` injeta `@source "./index.js"/"./index.mjs"` no `styles.css` do **ui** (só v4, só ui), o agentes duplica `@source` manual apontando pra arquivos específicos, o painel (v3) usa `content` glob **só do ui** — logo classes que vivem no **charts** (ex.: `3xl:grid-cols-6` do KpiGrid 0.4.0) **não são geradas no painel** (bug latente confirmado). Se o dist mudar de shape (code-split), tudo quebra silenciosamente.
2. **Tokens pra Tailwind v3 exigem cópia manual.** `theme.css` é v4-only (`@import "tailwindcss"` embutido); o painel mantém as CSS vars copiadas à mão no globals.css ("sync manual com v0.3.0") — drift garantido.
3. **`@beeads/fonts` é Next-only** (`next/font/google`). O bloquim (Vite) resolve na mão: `@import` do Google Fonts + binding manual de `--font-fraunces`/`--font-geist-mono` no index.css (funciona, mas é duplicação que cada app não-Next teria que reinventar; e o index.html carrega um Inter morto).

**Correções a registrar** (vs. avaliação anterior): as fontes do bloquim NÃO estão quebradas (linha 1 do index.css carrega Fraunces+Geist Mono); e o DS já tem injeção de `@source` no styles.css do ui — o gap real é robustez, cobertura do charts e suporte v3.

## Solução

### Fase A — DS (repo beeads-ui, branch `feat/integration-hardening`)

**A1. Manifesto de classes (`dist/classlist.txt`) em ui e charts.**
- Novo `scripts/gen-classlist.mjs <pkg>`: lê `packages/<pkg>/dist/index.js` + `index.mjs`, extrai todos os literais de string — aspas duplas, simples **e chunks cozidos de template literals** (defensivo; hoje o dist só tem literais estáticos, verificado) —, quebra por whitespace, deduplica e escreve 1 token por linha em `packages/<pkg>/dist/classlist.txt`. Superset é ok: tokens que não são classe (ex.: `beeads_sidebar_collapsed`) são ignorados pelo scanner do Tailwind. Roda no `build` de `ui` e `charts` após o tsup.
- **Gate automatizado de completude (emenda da revisão):** o próprio script (ou passo de build) FALHA se sentinelas não estiverem no manifesto — ui: `h-svh`, `max-w-[85vw]`, `data-[checked]:bg-primary`; charts: `3xl:grid-cols-6`. Isso impede regressão silenciosa vs. o `@source` direto no bundle de hoje (mudança de shape do dist quebraria o manifesto sem sintoma no DS).
- Export novo nos dois package.json: `"./classlist.txt": "./dist/classlist.txt"`.
- `copy-assets.mjs`: a injeção no `styles.css` do **ui** passa a ser `@source "./classlist.txt";` (em vez dos 2 bundles JS) e o **charts** ganha injeção equivalente no seu `styles.css`. Assim, apps v4 que importam os styles.css ganham o scan de graça; apps onde `@source`-dentro-de-import não é confiável (Next/Turbopack) apontam `@source`/`content` explícito pra **um arquivo estável** por pacote.
- Risco aceito: classes compostas dinamicamente em runtime não entram no manifesto — o DS não usa esse padrão (regra Tailwind de strings estáticas); vale como constraint documentada.

**A2. `vars.css` no @beeads/tokens.**
- Separar de `theme.css` os blocos `:root { … }` e `.dark { … }` para `packages/tokens/src/vars.css` (CSS puro, importável em qualquer stack). `theme.css` passa a: `@import "tailwindcss"; @import "./vars.css"; @theme inline { … }` (o `@theme inline` fica onde está).
- Export novo: `"./vars.css": "./dist/vars.css"`. Build copia os dois arquivos (copy-assets).
- Comportamento v4 inalterado (theme.css resolve o import relativo dentro do dist). Apps v3 (painel) passam a poder `@import "@beeads/tokens/vars.css";` + preset.cjs — sem cópia manual (migração do painel fica FORA deste escopo; a capacidade é entregue agora).

**A3. `google.css` no @beeads/fonts.**
- Novo `packages/fonts/src/google.css`:
  ```css
  @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Geist+Mono:wght@400..700&display=swap");
  :root {
    --font-fraunces: "Fraunces", Georgia, serif;
    --font-geist-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  ```
- Export `"./google.css": "./dist/google.css"`; build do fonts passa a rodar copy-assets. O entry `next/font` continua o caminho recomendado pra Next; `google.css` é o caminho framework-agnostic (Vite/HTML).
- Nota de perf documentada: `@import` de Google Fonts é render-blocking — recomendar `<link rel="preconnect">` no HTML do app (o bloquim já tem).

**A4. Docs + changesets.**
- `docs/CONTRIBUTING.md` (ou README dos pacotes): seção "Integração com Tailwind" com a receita canônica v4 (import dos styles.css já basta; `@source` explícito pro classlist.txt quando o bundler não propagar) e v3 (preset.cjs + `@import vars.css` + `content` incluindo os 2 classlist.txt). Nota: o `@source` injetado nos styles.css é at-rule desconhecida e **inerte** no pipeline v3 (não é fetched como `@import`) — sem efeito colateral pro painel.
- Fatos resolvidos pela revisão: Dockerfile do bloquim usa **pnpm 11.4.0** (regenerar lockfile com pnpm 11); `minimumReleaseAgeExclude: '@beeads/*'` já presente no bloquim (gate de 24h não bloqueia).
- Changesets: `@beeads/ui` minor, `@beeads/charts` minor, `@beeads/tokens` minor, `@beeads/fonts` minor.

### Fase B — Piloto bloquim (repo beeads-bloquim, branch feature → master)

Aplica a onda-1 de adoção usando os artefatos novos, em `artifacts/mindtask-app`:

- **B1. Bumps:** `@beeads/ui` ^0.5.0→nova minor, `@beeads/tokens` ^0.3.0→nova minor; **remover `@beeads/charts`** (dep órfã — zero componentes usados) e a linha `@import "@beeads/charts/styles.css"`; **adicionar `@beeads/fonts`** (nova minor). Regenerar lockfile com a MESMA major de pnpm que o Dockerfile usa (checar Dockerfile; memórias conflitam entre 9.15.9 e 11 — a mais recente indica 11).
- **B2. Fontes:** substituir a linha 1 (Google Fonts manual) + bloco de binding (`:root { --font-fraunces … }`) do `src/index.css` por `@import "@beeads/fonts/google.css";`. Remover do `index.html` o stylesheet do Inter (morto); manter preconnects.
- **B3. Scan determinístico:** adicionar `@source "../node_modules/@beeads/ui/dist/classlist.txt";` explícito no `index.css` (mesmo que a injeção via styles.css funcione no Vite — determinístico > "parece funcionar"; path relativo a `src/`, conferir resolução com symlink pnpm).
- **B4. Trigger mobile (emendado pela revisão — CRÍTICO):** o ui novo torna a sidebar off-canvas <768px — sem trigger, o mobile perde a navegação. No `AppLayout.tsx` de hoje o `SidebarProvider` envolve **só** a `<Sidebar>` (fecha antes do `<main>`); um `SidebarTrigger` no `<main>` crasharia (`useSidebar` fora do provider). Portanto: **mover o `SidebarProvider` pra envolver o container flex inteiro** (sidebar + main — o provider não injeta DOM, é só contexto), e então adicionar a topbar mobile-only como primeiro filho do `<main>`: `<header className="flex items-center gap-2 border-b border-border p-2 md:hidden"><SidebarTrigger /><span className="font-display">bloquim</span></header>`. Como o `<main>` é `overflow-hidden`, envolver `{children}` em `<div className="flex-1 min-h-0 flex flex-col">…</div>` pra topbar não clipar páginas full-height (ReactFlow).
- **B5. Verificação local:** `pnpm build` do mindtask-app; **asserts no CSS gerado**: `h-svh`, `sticky`, `max-w-\[85vw\]` presentes E o `@import url("https://fonts.googleapis…")` do google.css **hoisted pro topo** do CSS emitido (antes do primeiro seletor — senão o browser descarta e as fontes caem em fallback silenciosamente); app builda sem erro novo de tsc (baseline tem ~71 erros pré-existentes — gate é relativo); conferir que `node_modules/@beeads/ui/dist/classlist.txt` resolve através do symlink pnpm pós-install.

### Fase C — Deploy

1. **DS:** PR → merge main → Release PR (changesets) → merge → publish npm via CI (fluxo comprovado no 0.6.0). Gate: versões visíveis no registry antes da Fase B instalar.
2. **Bloquim:** PR na feature branch → **gate de segurança antes do merge em master**: conferir se o master remoto contém trabalho não-deployado além do nosso (ex.: memória antiga cita task-owner + backfill obrigatório) — se houver migration/feature exigindo passo manual, PARAR e escalar pro Gustavo. Merge → trigger manual `POST /api/v1/deploy?uuid=<bloquim_app_uuid>` (uuid + token via memória do projeto bloquim; **token Coolify pode ter expirado ~2026-07-08** → se 401, gate humano: Gustavo rotaciona) → poll até `finished` → conferir `running:healthy` é enganoso, validar pelo site.

### Fase D — Teste em produção

Smoke via browser (MCP chrome) em `https://bloquim.beeads.com.br`:
1. **Fontes:** computed `font-family` de um heading = Fraunces; de body/texto = Geist Mono.
2. **Sidebar fixa:** desktop, página com scroll → sidebar não acompanha (classes sticky/h-svh aplicadas — se o CSS não tiver `h-svh`, o classlist falhou).
3. **Mobile:** viewport ~390px → topbar com hamburger aparece; clique abre off-canvas; navegar fecha.
4. **Regressões visuais óbvias:** dialog abre centrado; datas em dd/MM/yyyy no DatePicker (se acessível).
Falha em qualquer item → rollback é simples: `git revert` no master + redeploy (mudanças são de front, sem migration).

## Fora de escopo

- Migração do painel (vars.css + classlist no content) e do agentes (@source → classlist) — próxima onda, mesma receita.
- Caixa baixa na copy dos apps; extração de `@beeads/format`; renomear PeriodPicker/FilterBar do painel.
- Story "shell de consumidor" no Storybook (follow-up recomendado).

## Critérios de sucesso

- npm com as 4 minors novas publicadas; `dist/classlist.txt` presente em ui e charts com as classes 0.6.0 (`h-svh`, `3xl:grid-cols-6`).
- bloquim.beeads.com.br em produção com sidebar fixa + off-canvas mobile funcionais e tipografia Fraunces/Geist Mono intacta.
- Zero cópia manual nova em consumidor; receita de integração documentada.
