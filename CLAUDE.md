# beeads-ui — instruções pra agentes

Você está editando o **design system @beeads/***. Cada mudança aqui propaga pra todos os apps do ecossistema beeads quando eles atualizarem a versão.

## Pacotes

- `@beeads/tokens` — CSS vars + Tailwind v3 preset + Tailwind v4 `@theme inline`
- `@beeads/fonts` — Fraunces + Geist Mono via `next/font/google`
- `@beeads/ui` — ~35 primitivos sobre `@base-ui/react@^1.5.0`
- `@beeads/charts` — ~12 componentes de viz sobre `recharts@^2.15`

## Regras

1. **Tokens primeiro.** Cores, fontes, spacing, radius — sempre via `@beeads/tokens` (CSS vars). Nunca hardcode em componentes (`#FFAE00` é proibido; `var(--color-honey)` ou classe `bg-honey` é o caminho).
2. **Componentes referenciam só tokens semânticos** (`--color-bg`, `--color-fg`, `--color-primary`, etc.), não brand (`--color-honey`) direto. Exceção: variantes "accent" podem usar honey explicitamente.
3. **Acessibilidade obrigatória:** focus visible, suporte a keyboard, ARIA correto. Use `@base-ui/react` pra qualquer behavior — não reinvente.
4. **Dark mode é não-negociável.** Componente novo deve funcionar em light **e** dark, validado no Storybook.
5. **Padrão de arquivo:** veja `packages/ui/src/components/button.tsx` — esse é o template. `"use client"`, `cn()`, `data-slot`, CVA quando há variantes.
6. **Story obrigatória pra componentes UI principais:** todo componente novo significativo precisa de `apps/storybook/stories/<Name>.stories.tsx`.
7. **Changeset obrigatório:** toda mudança que afeta um pacote `@beeads/*` precisa de `pnpm changeset` antes do commit.

## API base-ui (importante!)

Componentes que recebem trigger customizado usam `render` (não `asChild` do Radix):

```tsx
// ✅ Correto (base-ui)
<PopoverTrigger render={(props) => <Button {...props}>Abrir</Button>} />

// ❌ Errado (Radix pattern)
<PopoverTrigger asChild>
  <Button>Abrir</Button>
</PopoverTrigger>
```

## Comandos

- `pnpm storybook` — docs viva em http://localhost:6006
- `pnpm test` — vitest
- `pnpm typecheck` — tsc em todos pacotes (via turbo)
- `pnpm build` — build de todos pacotes
- `pnpm lint` — biome check
- `pnpm changeset` — registrar mudança pra release
- `pnpm release` — publish (só CI deve rodar em produção)

## Versionamento (Changesets)

- **patch:** bugfix, ajuste visual leve (sem mudar valor de token)
- **minor:** componente novo, prop nova opcional, variante nova, token novo
- **major:** rename de export, remover prop/variante, mudar valor de token estabelecido

Veja `docs/CONTRIBUTING.md` pra fluxo completo.

## Tailwind v3 vs v4

DS suporta ambos via `@beeads/tokens`:
- **v4** (recomendado): app importa `@beeads/tokens/theme.css` no globals.css. Classes Tailwind expostas via `@theme inline`.
- **v3** (legacy): app usa `presets: [require("@beeads/tokens/preset.cjs")]` no tailwind.config + importa `theme.css` no globals.css pra ter as CSS vars.

Quando editar tokens: SEMPRE atualizar `theme.css` E `preset.cjs` em paralelo.

## NÃO faça

- ❌ Criar componentes app-specific aqui (dashboard charts custom, etc.) — esses ficam no app
- ❌ Adicionar deps pesadas (framer-motion, react-three-fiber) sem discussão
- ❌ Mudar tokens sem changeset major se for breaking
- ❌ Pular Storybook story em componentes principais
- ❌ Hardcode de cores/sizes em componentes
- ❌ Usar `asChild` (é pattern Radix; use `render` do base-ui)
