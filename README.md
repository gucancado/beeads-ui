# beeads-ui

Design system do ecossistema beeads. Publica em npm público:
- [`@beeads/tokens`](./packages/tokens) — Design tokens (CSS vars + Tailwind v3/v4)
- [`@beeads/fonts`](./packages/fonts) — Fraunces + Geist Mono via next/font
- [`@beeads/ui`](./packages/ui) — ~35 primitivos sobre @base-ui/react
- [`@beeads/charts`](./packages/charts) — Charts beeads sobre recharts (Line, Area, Bar, Funnel, Heatmap, KPI...)

Identidade: **honey** (#FFAE00), **ink** (#0a0a0a), **paper** (#fafaf7). Tipografia: **Fraunces** + **Geist Mono**.

## Uso em apps

```bash
pnpm add @beeads/tokens @beeads/fonts @beeads/ui @beeads/charts
```

Ver README de cada pacote para exemplos completos.

## Desenvolvimento

```bash
pnpm install
pnpm storybook  # docs viva em http://localhost:6006
pnpm build      # build todos pacotes (turbo)
pnpm test       # vitest em pacotes que têm testes
pnpm lint       # biome
pnpm typecheck  # tsc em todos pacotes
```

## Versionamento

Mudanças seguem [Changesets](https://github.com/changesets/changesets). Em cada PR que afeta um pacote, rode:

```bash
pnpm changeset
```

CI cria Release PR automaticamente; merge desse PR publica no npm.

## Estrutura

- `packages/` — pacotes publicados
- `apps/storybook/` — docs viva (não publica)
- `scripts/` — utilitários compartilhados (copy-assets.mjs)
- `docs/` — princípios de design, contributing guide

Versão atual: 0.0.0 (não publicada ainda; primeira release será 0.1.0 via Changesets).
