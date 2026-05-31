# Sidebar centralizado @beeads/ui — design

**Data:** 2026-05-31
**Status:** aprovado (brainstorm) — pronto para plano de implementação
**Escopo:** `@beeads/tokens` + `@beeads/ui` + migração dos 3 apps (Bloquim, agentes, painel)

---

## Problema

Os três apps do ecossistema beeads têm menus laterais implementados de forma independente,
divergente e com graus diferentes de adoção do design system:

| App | URL | Repo / path | Sidebar atual | Stack | Tailwind |
|---|---|---|---|---|---|
| Bloquim | bloquim.beeads.com.br | `beeads-bloquim/repo/artifacts/mindtask-app` | `src/components/layout/AppLayout.tsx` (custom, limpo) | React 19 + Vite + wouter | v4 |
| agentes | agentes.beeads.com.br | `agentes-beeads` | `src/components/app-sidebar.tsx` (100% custom) | Next.js 16 | v4 |
| painel | painel.beeads.com.br | `beeads-central-de-dados/web` | `src/components/SideNavBreadcrumb.tsx` + `ClientSwitcher.tsx` | Next.js 15 | v3 (preset) |

Hoje o `@beeads/ui` (v0.2.2) **não tem** nenhum componente de sidebar/nav — só primitivos.
"O design centralizado" eram os tokens e primitivos; o sidebar nunca foi centralizado.

## Objetivo

Padronizar a **moldura** do sidebar nos 3 apps replicando fielmente o padrão já desenhado no
Bloquim (`AppLayout.tsx`), entregue como **componente composável no `@beeads/ui`**. O **miolo**
(navegação) continua específico de cada app, mas montado com sub-peças do DS para coesão visual.

### Decisões do brainstorm

- **Arquitetura:** componente centralizado no `@beeads/ui` (router-agnóstico, data-injected).
- **Referência estética:** Bloquim (`AppLayout.tsx`), o sidebar mais maduro.
- **Estado colapsado:** por app (não compartilhado entre apps).
- **Escopo deste ciclo:** completo — DS + tokens + release + migração dos 3 apps + consumo do
  `/api/auth/me` do Bloquim nos 2 apps Next.

### Spec do usuário (layout exato a reproduzir)

**Menu expandido**
- Cabeçalho: logo + nome da aplicação · botão de trocar tema · botão de recolher
- Rodapé: foto do usuário (do Bloquim) · nome do usuário (do Bloquim) · botão de configurações
  (itens variáveis por app) · botão de deslogar

**Menu colapsado**
- Cabeçalho: logo da aplicação · botão de trocar tema · botão de expandir
- Rodapé: foto do usuário · botão de configurações · botão de deslogar

**Conteúdo:** o miolo entre cabeçalho e rodapé é variável por app.

---

## Arquitetura

**Costura:** o DS é dono da moldura (`<aside>`, transição colapsar/expandir, cabeçalho, rodapé,
bloco de usuário, menu de settings, logout); cada app injeta o miolo como `children` e fornece os
dados (usuário, itens de settings, callbacks, brand).

### 1. Tokens — `@beeads/tokens` (minor)

Levar os tokens `--sidebar-*` do Bloquim **verbatim** para o DS, em `theme.css` (v4) **e**
`preset.cjs` (v3), com light + dark. Hoje só existem no `index.css` local do Bloquim
(`artifacts/mindtask-app/src/index.css`).

| Token | Light | Dark |
|---|---|---|
| `--sidebar` | `210 20% 96.5%` | `0 0% 7.8%` |
| `--sidebar-foreground` | `222 47% 11%` | `210 40% 98%` |
| `--sidebar-border` | `214.3 31.8% 88%` | `215 28% 15%` |
| `--sidebar-accent` | `0 0% 100%` | `0 0% 13.7%` |
| `--sidebar-accent-foreground` | `222 47% 11%` | `210 40% 98%` |

Expostos como utilitários `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-accent`,
`border-sidebar-border`, `text-sidebar-accent-foreground` nos dois Tailwinds.

Após o release, o Bloquim **remove** as definições locais e passa a herdar do DS (sem mudança
visual — valores idênticos).

### 2. Componente — `@beeads/ui` (minor)

Arquivo: `packages/ui/src/components/sidebar.tsx`. Padrão do `button.tsx` (`"use client"`,
`cn()`, `data-slot`, CVA quando houver variantes). Base-ui para comportamento; **`render`-prop,
nunca `asChild`**.

#### Exports

```
SidebarProvider     // contexto: estado colapsado + persistência
Sidebar             // <aside>: largura w-72 / w-16, bg-sidebar, transição 300ms
SidebarHeader       // logo + título (some colapsado) + ThemeToggle + botão colapsar/expandir
SidebarBody         // ScrollArea com padding; renderiza o miolo (children)
SidebarFooter       // bloco usuário + menu settings + logout (layouts expandido/colapsado)
SidebarSectionLabel // rótulo de seção (ex.: "ESPAÇOS", "AGENTES", "META")
SidebarNavItem      // item de nav: ícone + label + ativo; colapsado = ícone-only + Tooltip
useSidebar          // hook do contexto (state: "expanded" | "collapsed", toggle, etc.)
```

#### Forma de uso

```tsx
<SidebarProvider>
  <Sidebar>
    <SidebarHeader logo={<NotebookPen />} title={<>blo<i>·</i>quim</>} />
    <SidebarBody>
      {/* miolo específico do app */}
    </SidebarBody>
    <SidebarFooter
      user={{ name, email, avatarUrl }}
      settingsItems={[{ label: "perfil", icon: <UserIcon/>, onSelect: openProfile }, /* … */]}
      onLogout={handleLogout}
      onProfileClick={openProfile}   // opcional
    />
  </Sidebar>
</SidebarProvider>
```

#### Props (resumo)

- `SidebarProvider`: `collapsed?` / `onCollapsedChange?` (controlado) **ou** não-controlado com
  `defaultCollapsed?` e `storageKey?` (cookie por app). `persist?: "cookie" | "localStorage" | "none"` (default `"cookie"`).
- `Sidebar`: `className?` (escape hatch), demais via contexto.
- `SidebarHeader`: `logo: ReactNode`, `title?: ReactNode`, `hideThemeToggle?: boolean`.
- `SidebarBody`: `children`, `className?`.
- `SidebarFooter`: `user: { name: string; email?: string; avatarUrl?: string | null } | null`,
  `settingsItems?: SidebarSettingsItem[]`, `onLogout: () => void`, `onProfileClick?: () => void`.
  - `SidebarSettingsItem = { label: string; icon?: ReactNode; onSelect?: () => void; render?: (props) => ReactNode }`
  - Botão de settings é renderizado quando há `settingsItems?.length` ou `onProfileClick`.
- `SidebarNavItem`: `icon: ReactNode`, `label: ReactNode`, `active?: boolean`,
  `render?: (props) => ReactNode` (link do app via base-ui), `title?: string` (tooltip colapsado).
- `SidebarSectionLabel`: `children` (some quando colapsado).

#### Comportamento de layout (fiel ao Bloquim)

- Expandido `w-72` / colapsado `w-16`, `transition-all duration-300 ease-in-out`.
- Cabeçalho: expandido = logo+título à esquerda, ThemeToggle+colapsar à direita; colapsado =
  logo no topo, ThemeToggle+expandir empilhados (`flex-col`). `border-b border-sidebar-border/50`.
- `SidebarNavItem`: ativo = `bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm`;
  inativo = `text-sidebar-foreground/70 hover:bg-sidebar-accent/50`. Colapsado = `justify-center`,
  só ícone, com `Tooltip` (side="right").
- Rodapé: expandido = botão de perfil (avatar + nome + email) + settings dropdown + logout;
  colapsado = avatar (redondo, clicável) + settings + logout, empilhados. `border-t border-sidebar-border/50`.
  Logout em vermelho no hover (`hover:text-destructive hover:bg-destructive/10`).

### 3. Estado colapsado (SSR-safe, por app)

- **Bloquim (Vite/CSR):** não-controlado; persiste sozinho. Sem flash.
- **agentes / painel (Next/SSR):** evitar flash de hidratação lendo a preferência **server-side
  via cookie** e passando `defaultCollapsed`; o provider sincroniza após mount. Cookie por app
  (`<app>_sidebar_collapsed`), não compartilhado entre subdomínios.
- Default de persistência: cookie (padrão já usado no próprio Bloquim em `ui/sidebar.tsx`).

### 4. Dados do usuário (cross-app)

- **Bloquim:** passa `user` de `useGetMe()` (já retorna `name`, `email`, `avatarUrl`).
- **agentes + painel:** adicionar `getBloquimProfile()` em `src/lib/bloquim-client.ts` →
  `GET https://bloquim.beeads.com.br/api/auth/me` com o cookie SSO encaminhado; o Server Component
  busca e injeta no `SidebarFooter`.
- Endpoint já existe: `artifacts/api-server/src/routes/auth.ts:125` (`router.get("/me", requireAuth, …)`)
  retorna `{ id, name, email, avatarUrl, … }`.

**⚠️ Risco a validar como primeira tarefa da implementação:** confirmar que o `requireAuth` do
`/api/auth/me` aceita o cookie `__beeads_session` (SSO). Se estiver restrito ao cookie próprio do
Bloquim, expor os campos de perfil numa rota SSO (`/api/auth/me/profile`, ao lado de
`/api/auth/me/workspaces`) que valide o cookie compartilhado.

### 5. Migração por app

| App | De | Para | Miolo (children) |
|---|---|---|---|
| Bloquim | `AppLayout.tsx` (sidebar inline) | `Sidebar` do DS | "Tarefas", "Espaços de Trabalho" (`SidebarNavItem`) + `SidebarWorkspaceList` (mantém drag&drop e submaps) |
| agentes | `app-sidebar.tsx` | `Sidebar` do DS | seção "Agentes" + lista dinâmica de agentes (status + workspace) |
| painel | `SideNavBreadcrumb.tsx` + `ClientSwitcher.tsx` | `Sidebar` do DS | `ClientSwitcher` no topo do miolo + nav drill-down Meta/Google + utilidades, com badge de alertas |

- O `ui/sidebar.tsx` shadcn do Bloquim (Radix, `asChild`) é **descartado** — não é o sidebar real
  em uso e viola a regra do DS (usa `asChild`/`Slot`).
- ThemeToggle sai do rodapé (agentes/painel) e passa para o cabeçalho, conforme o spec.

### 6. Tailwind v3 vs v4

- DS já suporta ambos via `@beeads/tokens` (`theme.css` v4 / `preset.cjs` v3). Adicionar mapeamento
  das cores `sidebar*` nos dois.
- painel (v3): garantir que o `content` do `tailwind.config.ts` cobre `node_modules/@beeads/ui/dist`
  (já cobre, pois já importa `Button`/`Card`). agentes (v4): `@source` do dist já presente em `globals.css`.

---

## Unidades e fronteiras

- **`@beeads/tokens`**: só ganha tokens; nenhuma lógica. Testável por inspeção de CSS.
- **`@beeads/ui` `sidebar.tsx`**: componente puro de apresentação + contexto de colapso. Não conhece
  rotas nem fonte de dados — recebe tudo por props/`render`. Testável isolado no Storybook (3 miolos,
  light/dark, expandido/colapsado).
- **App**: dono do roteamento, do fetch de usuário e dos itens de settings. Conhece o DS só pela API
  pública.

## Acessibilidade

- Foco visível, navegação por teclado, ARIA correto em botões e no dropdown de settings (base-ui).
- Tooltips dos itens colapsados com `side="right"`.
- `<nav>` semântico no miolo.

## Testes / validação

- Story `apps/storybook/stories/Sidebar.stories.tsx`: 3 miolos de exemplo (Bloquim-like, agentes-like,
  painel-like), em light e dark, expandido e colapsado.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` verdes no DS.
- Validação visual manual em cada app após a migração (dark + light, colapsar/expandir, footer com
  usuário real do Bloquim).

## Versionamento

- `@beeads/tokens`: **minor** (tokens novos).
- `@beeads/ui`: **minor** (componente novo).
- Changesets em ambos. Merge em `main` → Release PR → publish no npm. Apps sobem a versão.

## Fora de escopo (YAGNI)

- Restauração de scroll do sidebar (comportamento elaborado do Bloquim) — opcional, fora deste ciclo.
- Compartilhar estado colapsado entre apps.
- Variantes floating/inset (do shadcn descartado).
- `AppShell` que controle o grid + `<main>` (rejeitado no brainstorm).
