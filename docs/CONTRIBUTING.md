# Contribuindo com beeads-ui

## Setup

```bash
git clone https://github.com/gucancado/beeads-ui
cd beeads-ui
pnpm install
pnpm storybook  # docs viva em http://localhost:6006
```

## Workflow padrão

1. Branch a partir de `main`
2. Mudanças no código + stories
3. `pnpm typecheck && pnpm test && pnpm build`
4. `pnpm changeset` — descreve a mudança (patch/minor/major + qual pacote)
5. Commit + PR
6. CI roda lint/typecheck/test/build
7. Merge → Changesets cria "Release PR"
8. Merge do Release PR → CI publica no npm

## Adicionando um componente novo

Antes: confirma critérios em [PRINCIPLES.md](./PRINCIPLES.md) — será usado em 2+ apps, anatomia estável.

1. Criar `packages/ui/src/components/<kebab-name>.tsx` (ou `packages/charts/src/components/...` se for dataviz)
2. Seguir padrão do `button.tsx` (template canônico):
   - `"use client"` no topo
   - `cn()` de `../lib/utils`
   - Atributo `data-slot="<name>"` (CSS hook)
   - CVA quando há variantes
   - `@base-ui/react` quando precisa de behavior headless
3. Exportar no barrel `packages/ui/src/index.ts` ou `packages/charts/src/index.ts`
4. Story em `apps/storybook/stories/<Name>.stories.tsx` com pelo menos: Default + AllVariants (se aplicável)
5. (Opcional) Teste de comportamento em `<name>.test.tsx` para lógica não-trivial
6. `pnpm changeset` (minor: componente novo)
7. PR

## Mudando tokens

1. Editar `packages/tokens/src/theme.css` (CSS vars) + `packages/tokens/src/preset.cjs` (Tailwind v3) — manter sync
2. **patch:** ajuste fino sem impacto visual (correção de typo, comentário)
3. **minor:** novo token (cor/radius/breakpoint novo), tweak visual seguro (variar levemente um valor)
4. **major:** renomear token, mudar valor que altera identidade (cor primária drasticamente, etc.)
5. Sempre `pnpm changeset` descrevendo o impacto visual nos apps consumidores

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

## Mudanças que quebram API (major)

1. Documentar migração em `docs/migrations/v<X>-to-v<Y>.md` com busca/substituição automatizável (regex, sed, codemod)
2. Changeset marca como **major** no(s) pacote(s) afetado(s)
3. Apps consumidores migram quando quiserem (versão antiga continua acessível no npm)

## Validação local antes de commit

```bash
pnpm lint        # biome
pnpm typecheck   # tsc em todos pacotes
pnpm test        # vitest
pnpm build       # turbo build em todos pacotes
```

Tudo verde antes de PR. CI roda os mesmos comandos.

## Quando NÃO adicionar ao DS

- Componentes app-specific (dashboards de um produto só, layouts particulares)
- Deps pesadas (framer-motion, react-three-fiber, etc.) — discuta primeiro
- Padrões que ainda não estão estáveis (em iteração ativa no app)
- Wrappers triviais de HTML que não acrescentam (use `<div className="...">` direto)

## API base-ui

Componentes que recebem trigger customizado usam `render` (não `asChild`):

```tsx
// ✅ Correto
<PopoverTrigger render={(props) => <Button {...props}>Abrir</Button>} />

// ❌ Errado (Radix pattern, não base-ui)
<PopoverTrigger asChild>
  <Button>Abrir</Button>
</PopoverTrigger>
```

## Estrutura do repo

```
beeads-ui/
├── packages/
│   ├── tokens/       # @beeads/tokens
│   ├── fonts/        # @beeads/fonts
│   ├── ui/           # @beeads/ui (~35 primitivos)
│   └── charts/       # @beeads/charts (~12 viz)
├── apps/
│   └── storybook/    # docs viva (não publica)
├── scripts/          # copy-assets.mjs, etc.
├── docs/             # PRINCIPLES, CONTRIBUTING, este arquivo, plans/
└── .changeset/       # workflow de release
```
