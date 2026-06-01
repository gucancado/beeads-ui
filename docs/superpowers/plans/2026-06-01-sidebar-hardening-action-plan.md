# Plano de Ação — Hardening pós-revisão dos sidebars beeads

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans para implementar task-a-task. Passos usam checkbox (`- [ ]`).

**Goal:** Resolver todos os achados da revisão (segurança, bugs, a11y, dívida técnica) da padronização dos 3 menus laterais beeads, em 4 fases priorizadas por valor/risco.

**Architecture:** Trabalho em 4 repos — `beeads-ui` (DS), `beeads-bloquim`, `agentes-beeads`, `beeads-central-de-dados` — mais infra (Coolify). Fase 1 (segurança/bugs) é executável já, sem release do DS. Fase 2 evolui o DS e publica. Fase 3 limpa os consumidores (depende da Fase 2). Fase 4 é processo/infra.

**Tech Stack:** React 19, Next 15/16, Vite, Tailwind v3/v4, `@base-ui/react`, Express (api-server), Changesets, pnpm, Coolify.

**Origem dos achados:** revisão de 2026-06-01 (security + DS + apps). Severidades originais preservadas.

---

## Decisões que precisam de você (antes da Fase 2)

1. **Formato dos tokens do DS (Task 2.7):** padronizar os tokens `--sidebar-*` (e idealmente toda a paleta) como **raw HSL channels + `<alpha-value>`** resolve de uma vez: (a) opacidade nativa em Tailwind v3, (b) fonte única de verdade (remove overrides locais do Bloquim e do painel). **Mas é um changeset MAJOR** (muda formato de token estabelecido). Alternativa menor: manter `hsl()` cheio e só documentar que opacidade em tokens sidebar só funciona em v4. → **Decisão: major (recomendado) ou documentar?**
2. **Logout (Task 1.1):** rota GET de logout no Bloquim (redirect, robusta, exige deploy do api-server) **ou** fetch POST credenciado client-side (app-only, depende de CORS). → Recomendo a **rota GET** (mais robusta).
3. **Rotação do `JWT_SECRET` (Task 4.2):** envolve coordenar os 3 apps + Coolify; fazer agora ou agendar?

---

## Sequenciamento & dependências

- **Fase 1** (segurança/bugs) → independente, executar já.
- **Fase 2** (DS) → produz `@beeads/ui` e `@beeads/tokens` novos (minor + possível major) e `@beeads/charts` (peerDeps).
- **Fase 3** (limpeza dos consumidores) → **depende do publish da Fase 2**.
- **Fase 4** (processo) → independente.

---

# FASE 1 — Segurança & bugs (executar já, sem release do DS)

## Task 1.1: Logout real (rota GET de logout no Bloquim)

**Files:**
- Modify: `beeads-bloquim/repo/artifacts/api-server/src/routes/auth.ts` (após o `router.post("/logout", ...)` na linha ~104)

- [ ] **Step 1: Adicionar rota GET de logout que limpa cookies e redireciona**

No `auth.ts`, logo após o handler `router.post("/logout", ...)`:

```ts
// GET logout for cross-app top-level navigation (clears SSO cookie + redirects).
// Apps consumidores (agentes, painel) navegam o browser para cá em vez de só /login.
router.get("/logout", (req, res) => {
  res.clearCookie(SSO_COOKIE_NAME, clearSsoCookieOptions);
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
  const ret = typeof req.query.return_url === "string" ? req.query.return_url : "/login";
  // Só permite return_url same-origin OU subdomínio .beeads.com.br
  const safe = /^https:\/\/([a-z0-9-]+\.)*beeads\.com\.br(\/|$)/.test(ret) || ret.startsWith("/");
  res.redirect(safe ? ret : "/login");
});
```

- [ ] **Step 2: Build/typecheck do api-server**

Run (do dir do api-server): `node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit`
Expected: 0 erros.

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/routes/auth.ts
git commit -m "feat(api): GET /api/auth/logout (clears SSO cookie + safe redirect)"
```

(Deploy do `bloquim-api` no Coolify acontece na verificação final da fase.)

## Task 1.2: agentes — apontar logout para a rota de logout

**Files:**
- Modify: `agentes-beeads/src/components/app-sidebar.tsx` (o `onLogout` no `SidebarFooter`)

- [ ] **Step 1: Trocar o onLogout**

De:
```tsx
onLogout={() => { window.location.assign("https://bloquim.beeads.com.br/login"); }}
```
Para:
```tsx
onLogout={() => {
  window.location.assign(
    "https://bloquim.beeads.com.br/api/auth/logout?return_url=" +
      encodeURIComponent("https://bloquim.beeads.com.br/login"),
  );
}}
```

- [ ] **Step 2: Typecheck**

Run: `node node_modules/typescript/bin/tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/app-sidebar.tsx
git commit -m "fix(sidebar): logout via /api/auth/logout to clear SSO cookie"
```

## Task 1.3: painel — apontar logout para a rota de logout

**Files:**
- Modify: `beeads-central-de-dados/web/src/components/AppSidebar.tsx` (o default `onLogoutHref` e/ou o `onLogout`)

- [ ] **Step 1: Trocar o destino de logout**

Mudar o `onLogoutHref` default de `"https://bloquim.beeads.com.br/login"` para:
```tsx
onLogoutHref = "https://bloquim.beeads.com.br/api/auth/logout?return_url=" +
  encodeURIComponent("https://bloquim.beeads.com.br/login")
```
(Mantém `onLogout={() => window.location.assign(onLogoutHref)}`.)

- [ ] **Step 2: Typecheck**

Run: `node node_modules/typescript/bin/tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppSidebar.tsx
git commit -m "fix(sidebar): logout via /api/auth/logout to clear SSO cookie"
```

## Task 1.4: Fixar algoritmo HS256 nos `jwt.verify`

**Files:**
- Modify: `agentes-beeads/src/lib/auth.ts:28`
- Modify: `beeads-central-de-dados/web/src/lib/auth.ts:60`
- Modify: `beeads-bloquim/repo/artifacts/api-server/src/middlewares/auth.ts:33` e `:54`

- [ ] **Step 1: Adicionar `{ algorithms: ["HS256"] }` em cada `jwt.verify`**

Em cada um dos 4 sites, trocar `jwt.verify(token, JWT_SECRET)` por:
```ts
jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] })
```
(Manter o cast `as ...Payload` onde existir.)

- [ ] **Step 2: Typecheck de cada repo**

agentes/painel: `node node_modules/typescript/bin/tsc --noEmit`; api-server: `tsc -p tsconfig.json --noEmit`.
Expected: 0 erros.

- [ ] **Step 3: Commit (por repo)**

```bash
git commit -am "fix(auth): pin HS256 on jwt.verify (defense-in-depth)"
```

## Task 1.5: Hardening do proxy de avatar (agentes + painel)

**Files:**
- Modify: `agentes-beeads/src/app/api/me/avatar/route.ts`
- Modify: `beeads-central-de-dados/web/src/app/api/me/avatar/route.ts`

- [ ] **Step 1: Reescrever o handler com cookie escopado, stream, validação e nosniff**

Substituir o corpo do `GET` por (idêntico nos dois apps; ajustar imports se `cookies` precisa vir de `next/headers`):

```ts
import { cookies } from "next/headers";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const BLOQUIM_BASE =
  process.env.BLOQUIM_API_URL ?? "https://bloquim.beeads.com.br/api";
const BLOQUIM_ORIGIN = BLOQUIM_BASE.replace(/\/api\/?$/, "");

export async function GET() {
  const user = await getAuthUser();
  if (!user) return new Response(null, { status: 401 });

  // Encaminha SOMENTE o cookie de sessão (não o header inteiro).
  const store = await cookies();
  const session =
    store.get("__beeads_session")?.value ?? store.get("token")?.value;
  if (!session) return new Response(null, { status: 401 });
  const cookieHeader = `__beeads_session=${session}`;

  const upstream = await fetch(
    `${BLOQUIM_ORIGIN}/api/users/${user.userId}/avatar`,
    { headers: { Cookie: cookieHeader }, cache: "no-store" },
  );
  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status || 404 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return new Response(null, { status: 415 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
```

(Streaming via `upstream.body` evita bufferizar; valida `image/`; `nosniff`; cookie escopado. O cookie name de sessão `__beeads_session` com fallback `token` — mesma convenção do `getAuthUser`.)

- [ ] **Step 2: Typecheck (cada app)**

Run: `node node_modules/typescript/bin/tsc --noEmit` → 0 erros.

- [ ] **Step 3: Commit (cada repo)**

```bash
git commit -am "fix(avatar-proxy): scoped cookie, streaming, content-type guard, nosniff"
```

## Task 1.6: agentes — allowlist de host em `getCurrentUrl`

**Files:**
- Modify: `agentes-beeads/src/lib/auth.ts:48-58`

- [ ] **Step 1: Validar o host contra `*.beeads.com.br` antes de montar a URL**

No `getCurrentUrl`, após resolver `host`, validar:
```ts
const ALLOWED = /^([a-z0-9-]+\.)*beeads\.com\.br$/;
const safeHost = ALLOWED.test(host) ? host : "agentes.beeads.com.br";
```
(Substituir o saneamento atual que só bloqueia `0.0.0.0/localhost/127.0.0.1` por esta allowlist; manter o fallback.)

- [ ] **Step 2: Typecheck + Commit**

```bash
node node_modules/typescript/bin/tsc --noEmit
git commit -am "fix(auth): allowlist host in getCurrentUrl (anti open-redirect)"
```

## Task 1.7: Coolify — reverter `default_workflow_permissions` para `read`

**Files:** nenhum (config via API).

- [ ] **Step 1: Setar default workflow permissions de volta para read no repo beeads-ui**

Run:
```bash
gh api -X PUT repos/gucancado/beeads-ui/actions/permissions/workflow \
  -F default_workflow_permissions=read -F can_approve_pull_request_reviews=true
```
(Mantém `can_approve_pull_request_reviews=true` — necessário pro Release PR do changesets — mas o token default volta a `read`; o `release.yml` define `permissions: write` por job.)

- [ ] **Step 2: Verificar**

Run: `gh api repos/gucancado/beeads-ui/actions/permissions/workflow`
Expected: `{"default_workflow_permissions":"read","can_approve_pull_request_reviews":true}`

## Task 1.8: Verificação final da Fase 1 (PRs + deploys)

- [ ] **Step 1:** Abrir PR por repo (Bloquim, agentes, painel) com as mudanças da fase, CI verde, merge.
- [ ] **Step 2:** Deploy via Coolify dos 3 apps + `bloquim-api` (a rota de logout):
```bash
TOKEN="<coolify token>"
for uuid in vtam7v68bqpnqgn5abg367su w13ao41nt7n4jc3mhekk73mb kkmzz43bx8y2u8r9scmghp30 huee78sf2zl6e062pia0ywhg; do
  curl -s -X POST -H "Authorization: Bearer $TOKEN" "http://5.78.199.192:8000/api/v1/deploy?uuid=$uuid"; echo; done
```
(uuids: bloquim-api, bloquim-web, agentes, painel.)
- [ ] **Step 3:** Teste manual em prod: logout em agentes/painel → confirmar que volta deslogado (cookie limpo); avatar ainda carrega; login funciona.

---

# FASE 2 — Evolução do DS (`beeads-ui`) + release

> Cada task é no `packages/ui` ou `packages/tokens`/`packages/charts`. TDD onde aplicável. Termina com changesets + publish (como nos releases anteriores: merge feature PR → Release PR → merge → `pnpm release` local → push tags).

## Task 2.1: a11y — nome acessível do `SidebarNavItem` colapsado + badge

**Files:** Modify `packages/ui/src/components/sidebar.tsx`; Test `packages/ui/src/components/sidebar.test.tsx`

- [ ] **Step 1 (teste):** colapsado com `badge` e `title` → o botão tem `aria-label` = title; a bolha do badge tem `aria-hidden`.
```tsx
it("collapsed item exposes title as accessible name and hides the badge bubble", () => {
  render(
    <SidebarProvider collapsed onCollapsedChange={vi.fn()}>
      <SidebarNavItem label="Alertas" icon={<svg />} title="Alertas (3)" badge={<span>3</span>} />
    </SidebarProvider>,
  );
  expect(screen.getByRole("button", { name: "Alertas (3)" })).toBeInTheDocument();
});
```
- [ ] **Step 2:** rodar — falha (sem aria-label).
- [ ] **Step 3 (impl):** quando `collapsed`, adicionar `aria-label={tip}` ao `elementProps` (quando `tip` existir) e envolver a bolha do badge colapsado com `aria-hidden`:
```tsx
// no elementProps, quando collapsed:
...(collapsed && tip ? { "aria-label": tip } : {}),
// e a bolha colapsada:
{collapsed && badge ? (<span aria-hidden className="absolute -right-0.5 -top-0.5 origin-top-right scale-90">{badge}</span>) : null}
```
(Mover o cálculo de `tip` para antes de `elementProps`.)
- [ ] **Step 4:** rodar — passa.
- [ ] **Step 5:** dev-warning quando `collapsed && !tip && typeof label !== "string"` (`if (process.env.NODE_ENV !== "production") console.warn(...)`).
- [ ] **Step 6:** commit.

## Task 2.2: a11y — landmark `<nav>`

**Files:** Modify `packages/ui/src/components/sidebar.tsx` (SidebarBody)

- [ ] **Step 1:** `SidebarBody` aceitar `aria-label?` e envolver os children num `<nav aria-label={ariaLabel}>` (ou expor um `SidebarNav` dedicado). Default `aria-label="Navegação principal"`.
- [ ] **Step 2:** teste: `screen.getByRole("navigation")` presente. Commit.

## Task 2.3: i18n — prop `labels`

**Files:** Modify `packages/ui/src/components/sidebar.tsx`

- [ ] **Step 1:** Adicionar `labels?: Partial<{ collapse: string; expand: string; settings: string; logout: string; editProfile: string }>` ao Provider (contexto) ou ao Header/Footer; defaults pt-BR atuais. Usar nos `title`/`aria-label` hardcoded.
- [ ] **Step 2:** teste com `labels={{ logout: "Sign out" }}` → botão tem nome "Sign out". Commit.

## Task 2.4: prop `collapsible`

**Files:** Modify `packages/ui/src/components/sidebar.tsx`

- [ ] **Step 1:** `SidebarProvider` aceita `collapsible?: boolean` (default true) no contexto; quando false, `toggle` é no-op e `SidebarHeader` não renderiza o botão de colapsar.
- [ ] **Step 2:** teste: `collapsible={false}` → sem botão "recolher menu". Commit.

## Task 2.5: slot de theme-toggle custom

**Files:** Modify `packages/ui/src/components/sidebar.tsx` (SidebarHeader)

- [ ] **Step 1:** `SidebarHeader` aceita `themeToggle?: ReactNode`; se passado, renderiza no lugar do `<ThemeToggle/>` default (mantém `hideThemeToggle`). Commit (com teste).

## Task 2.6: cookie de persistência — Secure + storageKey

**Files:** Modify `packages/ui/src/components/sidebar.tsx` (writePersisted)

- [ ] **Step 1:** No cookie write, adicionar `; secure` quando `location.protocol === "https:"`. Documentar (JSDoc) que `storageKey` deve casar `[A-Za-z0-9_-]`. Commit.

## Task 2.7: tokens single-source (raw-channels + `<alpha-value>`) — **MAJOR** (decisão #1)

**Files:** Modify `packages/tokens/src/theme.css`, `packages/tokens/src/preset.cjs`

- [ ] **Step 1:** Mudar os 5 tokens `--color-sidebar*` (em `:root` e `.dark` do theme.css) para **raw HSL channels** (`210 20% 96.5%`), e no `@theme inline` expor como `--color-sidebar: hsl(var(--color-sidebar))` — porém pra suportar alpha em v4 e v3 de forma única, o padrão recomendado é manter o valor em channels e o utilitário aplicar `/ <alpha-value>`. Implementar conforme o approach validado (espelhar o que o painel faz hoje no config, mas no DS).
- [ ] **Step 2:** `preset.cjs` (v3): `sidebar.*` → `hsl(var(--color-sidebar*) / <alpha-value>)`.
- [ ] **Step 3:** Validar `bg-sidebar`, `bg-sidebar-accent/50`, `text-sidebar-foreground/70` geram opacidade correta em v3 e v4 (Storybook + build).
- [ ] **Step 4:** changeset **major** em `@beeads/tokens`. Commit.

> **Nota:** esta task é o que permite a Fase 3 remover os overrides locais do Bloquim e do painel (fonte única).

## Task 2.8: `SidebarBody` — `viewportRef` p/ scroll-restoration

**Files:** Modify `packages/ui/src/components/sidebar.tsx`, `packages/ui/src/components/scroll-area.tsx` (expor ref do viewport)

- [ ] **Step 1:** `ScrollArea` aceitar `viewportRef?: Ref<HTMLDivElement>` repassado ao `BaseScrollArea.Viewport`. `SidebarBody` repassa `viewportRef`. Commit (com teste de que o ref é setado).

## Task 2.9: `@beeads/charts` — tokens/ui como peerDependencies + recharts

**Files:** Modify `packages/charts/package.json`

- [ ] **Step 1:** Mover `@beeads/tokens` e `@beeads/ui` de `dependencies` → `peerDependencies` (range `>=0.x`). Manter `recharts` em `dependencies` mas alinhar o range com o que os apps usam (decidir 2 vs 3 — ver Fase 3/agentes). changeset (minor/major conforme breaking p/ consumidores). Commit.

## Task 2.10: cobertura de testes do DS

**Files:** Modify `packages/ui/src/components/sidebar.test.tsx`

- [ ] **Step 1:** Adicionar testes: persistência **cookie** (default), `defaultCollapsed` seed, footer **colapsado** (avatar/settings/logout em coluna), settings item via `render`, `onProfileClick` ausente → disabled. Commit.

## Task 2.11: tooltip `side` — teste/story

**Files:** Modify `packages/ui/src/components/tooltip.tsx` test/story (criar `tooltip.test.tsx` se não houver)

- [ ] **Step 1:** teste/story cobrindo `side="right"`. Commit.

## Task 2.12: release

- [ ] **Step 1:** `pnpm typecheck && pnpm test && pnpm lint && pnpm build` verdes.
- [ ] **Step 2:** Merge feature PR(s) → Release PR (changesets) → merge → `git pull` → `pnpm release` → `git push --tags`. Confirmar versões novas no npm (`@beeads/ui`, `@beeads/tokens`, `@beeads/charts`).

---

# FASE 3 — Limpeza dos consumidores (depende do publish da Fase 2)

## Task 3.1: Bloquim — fonte única de tokens + dead code + scroll

**Files:** `mindtask-app/src/index.css`, `src/components/ui/sidebar.tsx`, `src/components/layout/AppLayout.tsx`, `package.json`

- [ ] **Step 1:** Bump `@beeads/ui` + `@beeads/tokens` para as versões da Fase 2.
- [ ] **Step 2:** Remover as defs locais `--sidebar-*` e as linhas `--color-sidebar*: hsl(var(--sidebar))` do `@theme inline` do `index.css` (agora vêm do DS). Validar visualmente o sidebar (light/dark).
- [ ] **Step 3:** Deletar `src/components/ui/sidebar.tsx` (shadcn, sem importadores — confirmar com grep `from "@/components/ui/sidebar"`).
- [ ] **Step 4:** Restaurar scroll-restoration usando o novo `SidebarBody` `viewportRef` (re-introduzir o `sessionStorage` + `ResizeObserver`).
- [ ] **Step 5:** Build + commit + PR + deploy.

## Task 3.2: painel — remover override v3 + meProfile cache

**Files:** `web/tailwind.config.ts`, `web/src/app/globals.css`, `web/src/lib/bloquim-client.ts`, `package.json`

- [ ] **Step 1:** Bump DS. Como a Fase 2.7 tornou os tokens alpha-capable nativamente, **remover** o override `sidebar` do `tailwind.config.ts` e reverter os `--color-sidebar*` do `globals.css` para herdarem do DS (ou manter raw-channels alinhados ao DS — sem duplicação de valor).
- [ ] **Step 2:** Envolver `meProfile` em `react.cache()` (dedup por request) em `bloquim-client.ts`.
- [ ] **Step 3:** Build + commit + PR + deploy. Validar sidebar (expandido/colapsado, opacidade, badge).

## Task 3.3: agentes — meProfile cache + conflito de tokens/recharts

**Files:** `src/lib/bloquim-client.ts`, `package.json`

- [ ] **Step 1:** Bump DS. `meProfile` em `react.cache()`.
- [ ] **Step 2:** Resolver a dupla versão de `@beeads/tokens` (charts 0.1.x puxa 0.1.0): bump `@beeads/charts` para a versão peerDeps da Fase 2.9 **ou** `pnpm.overrides` forçando `@beeads/tokens` única. Alinhar `recharts` (decidir 2 vs 3 conforme uso real de charts no app).
- [ ] **Step 3:** Build + commit + PR + deploy.

---

# FASE 4 — Processo & infra

## Task 4.1: `@beeads/charts` — testes reais

- [ ] Adicionar ao menos um teste de smoke por componente de charts (remover a dependência do `--passWithNoTests` como "tudo verde" enganoso). changeset patch.

## Task 4.2: Rotação do `JWT_SECRET` + gestão de segredos (decisão #3)

- [ ] Gerar novo `JWT_SECRET`, atualizar nos 3 apps (env do Coolify) **simultaneamente** (sessões existentes invalidam — comunicar), remover do `CLAUDE.md` inline em favor de ponteiro. Considerar o mesmo para token Coolify e chaves R2 (rotação + secret store). **Coordenado** — agendar janela.

---

## Self-review (autor)

**Cobertura dos achados da revisão:**
- Logout não desloga → 1.1/1.2/1.3 ✓
- jwt.verify sem algorithms → 1.4 ✓
- avatar proxy hardening (cookie/stream/content-type/nosniff) → 1.5 ✓
- getCurrentUrl x-forwarded-host → 1.6 ✓
- Coolify default write → 1.7 ✓
- segredos inline / JWT_SECRET → 4.2 ✓
- a11y badge/label/nav/i18n → 2.1/2.2/2.3 ✓
- collapsible / theme slot / cookie secure → 2.4/2.5/2.6 ✓
- tokens single-source / v3 alpha → 2.7 (+ 3.1/3.2) ✓
- scroll-restoration → 2.8 + 3.1 ✓
- charts peerDeps / recharts / 2 versões tokens → 2.9 + 3.3 ✓
- meProfile sem cache → 3.2/3.3 ✓
- dead code shadcn / tokens locais redundantes → 3.1 ✓
- cobertura de testes DS / tooltip side → 2.10/2.11 ✓
- charts sem testes → 4.1 ✓

**Placeholders:** Fase 1 tem código completo por task. Fases 2-3 dão approach + código onde concreto; as tasks 2.7 (formato de token) e 3.x dependem da decisão #1 e do publish — devem ser **re-detalhadas em plano próprio na execução** (escopo grande + design). Sinalizado.

**Consistência:** nomes de cookie (`__beeads_session`/`token`), uuids Coolify e rotas conferem com o código verificado nesta sessão.

---

## Próximo passo
Fase 1 é execução-ready. Fases 2-3 pedem as decisões acima (#1 formato de token é a principal) e, idealmente, um plano detalhado próprio na hora de executar (especialmente 2.7 e 3.x). Recomendo executar a **Fase 1** primeiro (maior valor/risco, sem release), depois decidir #1 e detalhar a Fase 2.
